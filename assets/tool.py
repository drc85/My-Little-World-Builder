"""Local asset catalog and editor. Python standard library only."""
import argparse, base64, configparser, hashlib, json, mimetypes, re, secrets, threading, time, webbrowser
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CONFIG = HERE / 'catalog.json'
LOCK = threading.RLock()
TOKEN = secrets.token_urlsafe(32)
MODEL_TYPES = {'.obj', '.ply', '.glb', '.gltf'}
ICONS = {'Streets':'🛣️','Terrain':'🏞️','Bridges':'🌉','Bidges':'🌉','Fences':'🧱','Houses':'🏘️','Figures':'👨‍👩‍👧‍👦','Animals':'🐾','Vehicles':'🚗','Vehicle':'🚗','Objects':'📦','One Lane':'🛣️','Two Lane':'🛣️','Grass':'🌿','Water':'💧','Sand':'🏖️','Pavement':'🧱','Stone':'🪨'}
ORDER = ['Streets','Terrain','Bidges','Bridges','Fences','Houses','Figures','Animals','Vehicle','Vehicles','Objects']

def read_catalog():
    return json.loads(CONFIG.read_text('utf-8')) if CONFIG.exists() else {'version':1,'revision':0,'assets':[],'folders':[]}

def write_catalog(data):
    data['revision'] = data.get('revision', 0) + 1
    data['updated'] = datetime.now().astimezone().isoformat(timespec='seconds')
    tmp = CONFIG.with_suffix('.tmp')
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), 'utf-8')
    tmp.replace(CONFIG)
    return data

def seed_assets():
    source = (ROOT / 'app.js').read_text('utf-8')
    match = re.search(r'(?:const|let) assets\s*=\s*(\[.*?\]);', source, re.S)
    try: return json.loads(match.group(1)) if match else []
    except (ValueError, AttributeError): return []

def sort_folder(rel):
    bits = rel.split('/')
    root = ORDER.index(bits[0]) if bits[0] in ORDER else 99
    sub_order = {'Two Lane':0,'One Lane':1,'Grass':0,'Water':1,'Sand':2,'Grass on Water':3,'Grass on Sand':4,'Sand on Water':5,'Pavement':6,'Stone':7,'Social':0,'Work':1}
    return root, bits[0].lower(), sub_order.get(bits[-1],99), rel.lower()

def defaults(rel):
    parts = Path(rel).parts
    category = parts[0] if len(parts)>1 else 'Objects'
    kind = {'Houses':'house','Figures':'character','Streets':'road','Terrain':'grass','Vehicle':'vehicle','Vehicles':'vehicle','Animals':'animal'}.get(category,'object')
    match = re.search(r'(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)',Path(rel).stem,re.I)
    w,d = (float(match[1])*10,float(match[2])*10) if match else (50,50)
    height = 7 if category=='Terrain' else 5 if category=='Streets' else 40 if category=='Figures' else 100
    return dict(name=Path(rel).stem,label='',w=w,d=d,h=height,level='character' if category=='Figures' else height,kind=kind,snap=20 if category=='Figures' else 50,noCollision=category=='Figures',walk=False,rotationX=-90 if Path(rel).suffix.lower()=='.ply' else 0,preview='',enabled=True)

def material_for(file):
    mtls = sorted(file.parent.glob('*.mtl'))
    for m in mtls:
        if m.stem.strip().casefold()==file.stem.strip().casefold(): return m
    with file.open('r',encoding='utf-8',errors='replace') as stream:
        for _ in range(80):
            line=stream.readline()
            if line.startswith('mtllib '):
                m=(file.parent/line[7:].strip()).resolve()
                if m.is_relative_to(ROOT.resolve()) and m.is_file(): return m
    return None

def derive_name(item):
    lines=[line.strip() for line in item.get('label','').split(' / ') if line.strip()]
    item['label']=' / '.join(lines[:3])
    item['name']=' '.join(lines[:3]) or Path(item['file']).stem

def folder_defaults(rel,index):
    name=Path(rel).name
    label={'Bidges':'Bridges','Vehicle':'Vehicles','Figures':'FIGURES'}.get(name,name)
    if name in ('One Lane','Two Lane'):label=name.replace(' ',' / ')
    if ' on ' in name:label=name.replace(' on ',' ON / ')
    return dict(name=label,icon=ICONS.get(name,'✨'),mode='mosaic' if '/' in rel or name not in ICONS else 'icon',preview='',order=index)


def validate_link(value):
    value=str(value or '').strip()
    if value:
        u=urlsplit(value)
        if u.scheme not in ('http','https') or not u.netloc:raise ValueError('Use a complete http:// or https:// model link.')
    return value

def remove_missing(payload):
    with LOCK:
        data=read_catalog();kind=payload.get('kind');field='assets' if kind=='asset' else 'folders' if kind=='folder' else None
        if not field:raise ValueError('Unknown entry type')
        key='id' if kind=='asset' else 'path';item=next((a for a in data[field] if a.get(key)==payload.get('id')),None)
        if not item:raise ValueError('Entry not found')
        path=ROOT/'assets'/item['file'] if kind=='asset' else ROOT/'assets/BROWSER'/item['path']
        if not item.get('missing') or path.exists():raise ValueError('Only missing entries can be removed. No model files are deleted.')
        data[field].remove(item)
        return write_catalog(data)

def reset_item(payload):
    with LOCK:
        data=scan()
        kind=payload.get('kind');key='id' if kind=='asset' else 'path'
        item=next((a for a in data['assets' if kind=='asset' else 'folders'] if a[key]==payload.get('id')),None)
        if not item:raise ValueError('Entry not found')
        if kind=='asset':
            item.update(defaults(item['file'].removeprefix('BROWSER/')))
            item['makerworld']='';item['snapmaker']=''
            derive_name(item)
        else:
            paths=sorted([f['path'] for f in data['folders'] if not f.get('missing')],key=sort_folder)
            item.update(folder_defaults(item['path'],paths.index(item['path']) if item['path'] in paths else 99))
        write_displays(data);write_catalog(data)
        return scan()

def read_display(folder):
    parser=configparser.ConfigParser(interpolation=None)
    parser.optionxform=str
    file=ROOT/'assets'/'BROWSER'/folder/'Display.ini'
    if file.exists():
        try:parser.read_string(file.read_text('utf-8-sig'))
        except configparser.Error as e:raise ValueError(f'Display.ini in {folder}: {e}')
    return parser

def display_override(item, folder, section):
    parser=read_display(folder)
    if not parser.has_section(section):return
    values=dict(parser[section])
    if 'Image' in values:
        image=values['Image'].strip().replace('\\','/')
        if image:
            target=(ROOT/image).resolve()
            if not target.is_relative_to(ROOT.resolve()) or not target.is_file() or target.suffix.lower() not in ('.png','.jpg','.jpeg','.webp'):
                raise ValueError(f'Invalid image path in {folder}/Display.ini: {image}')
        item['preview']=image
    if section=='Folder':
        lines=[values.get('Line'+str(i),'').strip() for i in range(1,4)]
        if any(lines):item['name']=' / '.join(x for x in lines if x)
        if 'Icon' in values:item['icon']=values['Icon']
        modes={'Icon':'icon','Collection':'mosaic','Custom Image':'image'}
        if values.get('PreviewMode') in modes:item['mode']=modes[values['PreviewMode']]
    else:
        if any('Line'+str(i) in values for i in range(1,4)):
            item['label']=' / '.join(values.get('Line'+str(i),'').strip() for i in range(1,4) if values.get('Line'+str(i),'').strip())
        for key in ('makerworld','snapmaker'):
            if key in values:item[key]=validate_link(values[key])
        derive_name(item)

def write_displays(data):
    folder_paths={f['path'] for f in data['folders'] if not f.get('missing')}|{a['folder'] for a in data['assets'] if not a.get('missing')}
    for folder in folder_paths:
        parser=configparser.ConfigParser(interpolation=None);parser.optionxform=str
        f=next((f for f in data['folders'] if f['path']==folder),None)
        if f:
            lines=f['name'].split(' / ')
            parser['Folder']={**{'Line'+str(i+1):lines[i] if i<len(lines) else '' for i in range(3)},'Icon':f['icon'],'PreviewMode':{'icon':'Icon','mosaic':'Collection','image':'Custom Image'}[f['mode']],'Image':f.get('preview','')}
        for a in data['assets']:
            if a['folder']!=folder or a.get('missing'):continue
            lines=a.get('label','').split(' / ')
            parser['Model: '+Path(a['file']).name]={**{'Line'+str(i+1):lines[i] if i<len(lines) else '' for i in range(3)},'Image':a.get('preview',''),'makerworld':a.get('makerworld',''),'snapmaker':a.get('snapmaker','')}
        file=ROOT/'assets'/'BROWSER'/folder/'Display.ini'
        with file.open('w',encoding='utf-8-sig') as stream:
            stream.write('; Edit display names here. Model filenames stay unchanged.\n; Line1, Line2 and Line3: empty lines are omitted. All empty = automatic.\n; Then start Asset Manager or click Scan folders.\n; Choose custom images in Asset Manager.\n\n')
            parser.write(stream)


def geometry_profile(file, signature, previous):
    cached=(previous or {}).get('geometryProfile',{})
    if cached.get('version')==2 and cached.get('signature')==signature and all(len(cached.get(k,[]))==3 for k in ('low','high')):return cached
    vertices=[];faces=[];groups={};group='';asphalt=set();material=''
    for line in file.open(encoding='utf-8',errors='replace'):
        if line.startswith('v '):vertices.append(tuple(map(float,line.split()[1:4])))
        elif line.startswith(('g ','o ')):group=line[2:].strip()
        elif line.startswith('usemtl '):material=line[7:].lower()
        elif line.startswith('f '):
            ids=[int(v.split('/')[0]) for v in line.split()[1:]]
            ids=[i-1 if i>0 else len(vertices)+i for i in ids]
            faces.append((group,ids));groups.setdefault(group,set()).update(ids)
            if 'asphalt' in material:asphalt.update(ids)
    if not vertices:return {}
    low=[min(v[i] for v in vertices) for i in range(3)];high=[max(v[i] for v in vertices) for i in range(3)]
    profile=dict(version=2,signature=signature,low=low,high=high)
    axis=0 if high[0]-low[0]>=high[2]-low[2] else 2;cross=2 if axis==0 else 0
    # Broad road bodies exclude railings and crossbars; upward faces exclude the underside.
    broad=set()
    for name,ids in groups.items():
        spans=[max(vertices[i][k] for i in ids)-min(vertices[i][k] for i in ids) for k in range(3)]
        if spans[axis]>=(high[axis]-low[axis])*.75 and spans[cross]>=(high[cross]-low[cross])*.75:broad.add(name)
    surface=set();middle=(low[cross]+high[cross])/2;width=high[cross]-low[cross]
    for name,ids in faces:
        if name not in broad or len(ids)<3:continue
        pts=[vertices[i] for i in ids];a,b,c=pts[:3]
        ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])
        if ny>0 and min(v[cross] for v in pts)<middle-width*.2 and max(v[cross] for v in pts)>middle+width*.2:surface.update(ids)
    chosen=surface or asphalt
    if chosen:
        points=[vertices[i] for i in chosen]
        profile['roadLow']=[min(v[i] for v in points) for i in range(3)]
        profile['roadHigh']=[max(v[i] for v in points) for i in range(3)]
        ends=[min(v[axis] for v in points),max(v[axis] for v in points)]
        heights=[max(v[1] for v in points if abs(v[axis]-end)<1) for end in ends]
        peak=max(v[1] for v in points)
        if peak>max(heights)+1:
            peak_at=sum(v[axis] for v in points if abs(v[1]-peak)<.01)/sum(abs(v[1]-peak)<.01 for v in points)
            heights[0 if peak_at<sum(ends)/2 else 1]=peak
        profile['roadEnds']=heights
    return profile

def apply_geometry_rules(a,file,signature,previous):
    folder=a['folder'].lower();bridge=folder.startswith(('bridges/','bidges/'))
    if file.suffix.lower()!='.obj':return
    profile=geometry_profile(file,signature,previous);a['geometryProfile']=profile
    if not profile:return
    size=[b-v for v,b in zip(profile['low'],profile['high'])]
    match=re.search(r'(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)',file.stem,re.I)
    is_beam=bridge and 'beam' in folder
    if not match and not is_beam:return
    dims=sorted([float(match[1])*10,float(match[2])*10]) if match else [50,50];w,d=(dims[1],dims[0]) if size[0]>=size[2] else (dims[0],dims[1])
    # These CAD exports are in millimetres; railings and connector lips are not tile bounds.
    if not is_beam and (abs(min(size[0],size[2]))-dims[0]>12 or abs(max(size[0],size[2])-dims[1])>35):return
    a.update(w=w,d=d,h=size[1],level=size[1],nativeGeometry=True)
    a['modelCenter']=[(profile['low'][0]+profile['high'][0])/2,(profile['low'][2]+profile['high'][2])/2]
    if folder.startswith('terrain/'):
        a['kind']='sand' if '/sand' in folder and '/grass' not in folder else 'grass'
    if bridge:
        compact=re.sub(r'[^a-z]','',folder.split('/')[-1])
        role='ramp' if 'up' in compact or 'down' in compact else 'beam' if 'beam' in compact else 'rail' if 'rail' in compact else 'deck'
        a['bridgeRole']=role;a['kind']='bridge'
        if role=='beam':a.update(w=50,d=50,snap=25)
        if role=='ramp' and 'roadEnds' in profile:
            axis=0 if w>=d else 2;ends=profile['roadEnds'];highSide=-1 if ends[0]>ends[1] else 1
            a['bridgeAxis']=axis;a['highSide']=highSide;a['deckHeight']=max(ends)-profile['low'][1]
            lowEdge=profile['roadHigh'][axis] if highSide==-1 else profile['roadLow'][axis]
            a['modelCenter'][0 if axis==0 else 1]=lowEdge+highSide*(w if axis==0 else d)/2
        elif role in ('deck','rail'):
            a['bridgeAxis']=0 if w>=d else 2
            a['roadSurface']=(profile.get('roadHigh',profile['high'])[1]-profile['low'][1])

def scan():
    with LOCK:
        data=read_catalog()
        preview_state=json.loads((HERE/'preview-state.json').read_text('utf-8')) if (HERE/'preview-state.json').exists() else {}
        base=ROOT/'assets'/'BROWSER'
        if not base.is_dir(): raise ValueError('assets/BROWSER is missing. Place the tool inside the project folder.')
        old={a['file']:a for a in data['assets']}
        seeds={a.get('ply') or a.get('obj') or a.get('glb'):a for a in seed_assets()}
        files=sorted((p for p in base.rglob('*') if p.is_file() and p.suffix.lower() in MODEL_TYPES and not p.is_symlink() and '_Previews' not in p.parts),key=lambda p:p.as_posix().lower())
        file_names={p.relative_to(ROOT/'assets').as_posix() for p in files}
        result=[];used=set();report={'new':[],'changed':[],'moved':[],'missing':[],'newFolders':[]}
        for file in files:
            rel=file.relative_to(ROOT/'assets').as_posix(); inside=file.relative_to(base).as_posix();stat=file.stat()
            previous=old.get(rel)
            stamp=f'{stat.st_size}:{stat.st_mtime_ns}'
            signature=previous['signature'] if previous and previous.get('stamp')==stamp else hashlib.sha256(file.read_bytes()).hexdigest()
            if not previous:
                matches=[a for a in old.values() if a['file'] not in file_names and a.get('signature')==signature and a['id'] not in used]
                if len(matches)==1: previous=matches[0];report['moved'].append(rel)
            a=dict(previous) if previous else defaults(inside)
            if not previous:
                seed=seeds.get(rel)
                if seed:
                    a.update({k:v for k,v in seed.items() if k not in ('obj','mtl','ply','glb','sub','cat')})
                a.setdefault('id','asset-'+secrets.token_hex(8));report['new'].append(rel)
            elif previous.get('signature')!=signature: report['changed'].append(rel)
            folder=file.parent.relative_to(base).as_posix()
            if folder=='.':folder=''
            a.update(file=rel,folder=folder,signature=signature,stamp=stamp,size=stat.st_size,missing=False,type=file.suffix[1:].lower(),warning='')
            display_override(a,folder,'Model: '+file.name)
            derive_name(a)
            apply_geometry_rules(a,file,signature,previous)
            a.pop('mtl',None)
            if a['type']=='obj':
                material=material_for(file)
                if material:a['mtl']=material.relative_to(ROOT/'assets').as_posix()
                # MTL files are optional; OBJ material names are sufficient for this builder.
            for key,value in defaults(inside).items():a.setdefault(key,value)
            a['thumbKey']=hashlib.sha256(json.dumps(['source-materials-v1',signature,a['w'],a['d'],a['rotationX'],a['kind'],(ROOT/'assets'/a['mtl']).stat().st_mtime_ns if a.get('mtl') else None]).encode()).hexdigest()[:24]
            a['previewFile']='assets/BROWSER/'+(folder+'/' if folder else '')+'_Previews/'+file.name+'.png'
            a['previewReady']=preview_state.get(a['id'])==a['thumbKey'] and (ROOT/a['previewFile']).exists()
            used.add(a['id']);result.append(a)
        for previous in data['assets']:
            if previous['id'] not in used:
                a=dict(previous,missing=True);result.append(a);report['missing'].append(a['file'])
        folders={f['path']:f for f in data['folders']}
        present=sorted((p.relative_to(base).as_posix() for p in base.rglob('*') if p.is_dir() and not p.is_symlink() and '_Previews' not in p.parts),key=sort_folder)
        folder_list=[]
        for index,rel in enumerate(present):
            f=dict(folders.get(rel,{}));name=Path(rel).name
            if not f:
                report['newFolders'].append(rel)
                f=dict(path=rel,**folder_defaults(rel,index))
            display_override(f,rel,'Folder')
            if f.get('mode')=='icon' and f.get('icon','') in ('','✨'):f['mode']='mosaic'
            f['missing']=False
            f['previewFile']='assets/BROWSER/'+rel+'/_Previews/Folder-Preview.png'
            f['thumbKey']=hashlib.sha256(json.dumps([f['mode'],f['icon'],[(a['id'],a['thumbKey'],a.get('preview')) for a in result if not a.get('missing') and (a['folder']==rel or a['folder'].startswith(rel+'/'))][:4]]).encode()).hexdigest()[:24]
            f['previewReady']=preview_state.get('folder:'+rel)==f['thumbKey'] and (ROOT/f['previewFile']).exists()
            folder_list.append(f)
        folder_list += [dict(f,missing=True) for f in data['folders'] if f['path'] not in present]
        data.update(assets=result,folders=folder_list,report=report)
        write_catalog(data)
        write_displays(data)
        return data

def save(payload):
    with LOCK:
        data=read_catalog()
        if payload.get('revision')!=data['revision']: raise ValueError('The list has changed. Please reload.')
        assets={a['id']:a for a in data['assets']};folders={f['path']:f for f in data['folders']}
        # Do not overwrite manual text-file edits made while this editor was open.
        for item in list(assets.values())+list(folders.values()):
            if item.get('missing'):continue
            check=dict(item)
            if 'file' in item:display_override(check,item['folder'],'Model: '+Path(item['file']).name)
            else:display_override(check,item['path'],'Folder')
            if any(check.get(k)!=item.get(k) for k in ('name','label','icon','mode','preview')):
                raise ValueError('A Display.ini was edited outside the editor. Reload this page, then scan folders before saving.')
        for changed in payload.get('assets',[]):
            a=assets.get(changed.get('id'))
            if not a:raise ValueError('Unknown asset')
            if 'label' in changed:a['label']=str(changed['label'])[:160]
            derive_name(a)
            for k in ('w','d','h'):
                if k in changed:
                    n=float(changed[k])
                    if not 0<n<=100000:raise ValueError('Dimensions must be greater than 0.')
                    a[k]=n
            if 'rotationX' in changed:
                n=float(changed['rotationX'])
                if not -360<=n<=360:raise ValueError('Rotation: -360 to 360 degrees.')
                a['rotationX']=n
            for key in ('makerworld','snapmaker'):
                if key in changed:a[key]=validate_link(changed[key])
            if 'enabled' in changed:a['enabled']=bool(changed['enabled'])
        for changed in payload.get('folders',[]):
            f=folders.get(changed.get('path'))
            if not f:raise ValueError('Unknown folder')
            for k in ('name','icon'):
                if k in changed:f[k]=str(changed[k])[:160 if k=='name' else 32]
            if 'mode' in changed:
                if changed['mode'] not in ('icon','mosaic','image'):raise ValueError('Unknown preview mode')
                f['mode']=changed['mode']
            if 'order' in changed:f['order']=int(changed['order'])
        write_catalog(data)
        write_displays(data)
        return scan()

AUDIO_TYPES={'.mp3','.wav','.ogg','.m4a','.webm','.flac'}
def sound_catalog():
    base=ROOT/'assets/MUSIC';base.mkdir(parents=True,exist_ok=True)
    config=HERE/'sound.json'
    settings=json.loads(config.read_text('utf-8')) if config.exists() else dict(file='assets/MUSIC/ambient-background.mp3',volume=0.045)
    files=[dict(file=p.relative_to(ROOT).as_posix(),name=p.name,size=p.stat().st_size) for p in sorted(base.rglob('*')) if p.is_file() and not p.is_symlink() and p.resolve().is_relative_to(base.resolve()) and p.suffix.lower() in AUDIO_TYPES]
    return dict(settings=settings,files=files)

def sound_action(payload):
    with LOCK:
        action=payload.get('action')
        if action=='upload':
            name=Path(str(payload.get('name','')).replace('\\','/')).name
            name=re.sub(r'[^\w .()\-]','_',name).strip(' .')[:120]
            ext=Path(name).suffix.lower()
            if ext not in AUDIO_TYPES:raise ValueError('Choose MP3, WAV, OGG, M4A, WebM or FLAC.')
            raw=base64.b64decode(payload.get('data',''),validate=True)
            if not raw or len(raw)>40_000_000:raise ValueError('Audio must be between 1 byte and 40 MB.')
            valid={'.mp3':raw.startswith(b'ID3') or (len(raw)>1 and raw[0]==255 and raw[1]&224==224),'.wav':raw[:4]==b'RIFF' and raw[8:12]==b'WAVE','.ogg':raw.startswith(b'OggS'),'.m4a':raw[4:8]==b'ftyp','.webm':raw.startswith(bytes([26,69,223,163])),'.flac':raw.startswith(b'fLaC')}
            if not valid[ext]:raise ValueError('The file content does not match the audio format.')
            base=(ROOT/'assets/MUSIC').resolve();base.mkdir(parents=True,exist_ok=True)
            target=base/name
            if target.exists():target=base/(Path(name).stem+'-'+secrets.token_hex(3)+ext)
            if not target.resolve().is_relative_to(base):raise ValueError('Invalid filename')
            target.write_bytes(raw)
            data=sound_catalog();data['uploaded']=target.relative_to(ROOT).as_posix();return data
        if action=='save':
            data=sound_catalog();file=payload.get('file');volume=float(payload.get('volume',0.045))
            if file not in [f['file'] for f in data['files']]:raise ValueError('Select an existing audio file.')
            if not 0<=volume<=1:raise ValueError('Volume must be between 0 and 100%.')
            config=HERE/'sound.json';temp=config.with_suffix('.tmp');temp.write_text(json.dumps(dict(file=file,volume=volume),indent=2),'utf-8');temp.replace(config)
            return sound_catalog()
        raise ValueError('Unknown sound action')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass
    def end_headers(self):
        self.send_header('Cache-Control','no-store');super().end_headers()
    def json(self,obj,status=200):
        body=json.dumps(obj,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def do_GET(self):
        name=urlsplit(self.path).path
        if name=='/api/health':return self.json({'app':'MyLittleWorldBuilder','root':str(ROOT),'layout':2})
        if name=='/api/catalog':return self.json(read_catalog())
        if name=='/api/sound':return self.json(sound_catalog())
        if name in ('/asset-tool/','/asset-tool/editor.html','/assets'):
            self.send_response(302);self.send_header('Location','/assets/');self.end_headers();return
        if name in ('/assets/','/assets/editor.html'):
            body=(HERE/'editor.html').read_text('utf-8').replace('__TOKEN__',TOKEN).encode()
            self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers();return self.wfile.write(body)
        if name=='/':self.path='/index.html'
        resolved=(ROOT/unquote(urlsplit(self.path).path).lstrip('/')).resolve()
        if not resolved.is_relative_to(ROOT):return self.send_error(403)
        if resolved.is_dir():return self.send_error(404)
        return super().do_GET()
    def do_POST(self):
        if self.headers.get('X-Asset-Token')!=TOKEN:return self.json({'error':'Please reopen the editor.'},403)
        origin=self.headers.get('Origin')
        if origin and origin!=f'http://{self.headers.get("Host")}':return self.json({'error':'Invalid origin'},403)
        try:
            size=int(self.headers.get('Content-Length','0'))
            limit=56_000_000 if urlsplit(self.path).path=='/api/sound' else 12_000_000
            if size<0 or size>limit:raise ValueError('File too large (audio: 40 MB; images: 8 MB).')
            payload=json.loads(self.rfile.read(size) or b'{}');route=urlsplit(self.path).path
            if route=='/api/sound':return self.json(sound_action(payload))
            if route=='/api/scan':return self.json(scan())
            if route=='/api/save':return self.json(save(payload))
            if route=='/api/remove-missing':return self.json(remove_missing(payload))
            if route=='/api/reset':return self.json(reset_item(payload))
            if route in ('/api/image','/api/preview'):
                with LOCK:
                    data=read_catalog();kind=payload.get('kind','asset');key='id' if kind=='asset' else 'path'
                    item=next((a for a in data['assets' if kind=='asset' else 'folders'] if a[key]==payload.get('id')),None)
                    if not item:raise ValueError('Entry not found')
                    if route=='/api/image' and payload.get('reset'):
                        item['preview']='';write_displays(data);return self.json(write_catalog(data))
                    value=payload.get('data','');match=re.fullmatch(r'data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=\s]+)',value)
                    if not match:raise ValueError('Please choose PNG, JPG or WebP.')
                    raw=base64.b64decode(match[2],validate=True)
                    if len(raw)>8_000_000:raise ValueError('Image exceeds 8 MB')
                    if not (raw.startswith(b'\x89PNG\r\n\x1a\n') or raw.startswith(b'\xff\xd8\xff') or (raw[:4]==b'RIFF' and raw[8:12]==b'WEBP')):raise ValueError('Invalid image file')
                    if route=='/api/preview':
                        if payload.get('thumbKey')!=item['thumbKey']:raise ValueError('Preview is outdated')
                        destination=ROOT/item['previewFile'];name=destination.name;directory=destination.parent
                    else:
                        name='Custom-Image-'+secrets.token_hex(6)+'.'+match[1]
                        directory=(ROOT/item['previewFile']).parent
                    directory.mkdir(parents=True,exist_ok=True);(directory/name).write_bytes(raw)
                    if route=='/api/image':
                        item['preview']=(directory/name).relative_to(ROOT).as_posix()
                        if kind=='folder':item['mode']='image'
                        write_displays(data)
                        return self.json(write_catalog(data))
                    state_file=HERE/'preview-state.json'
                    state=json.loads(state_file.read_text('utf-8')) if state_file.exists() else {}
                    state[item['id'] if kind=='asset' else 'folder:'+item['path']]=item['thumbKey']
                    state_file.write_text(json.dumps(state),'utf-8')
                    item['previewReady']=True
                    temp=CONFIG.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2),'utf-8');temp.replace(CONFIG)
                    return self.json({'ok':True})
            self.json({'error':'Unknown action'},404)
        except (ValueError,KeyError,OSError,TypeError) as e:self.json({'error':str(e)},400)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--scan-only',action='store_true');parser.add_argument('--no-browser',action='store_true');parser.add_argument('--manager',action='store_true');parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
    if not args.scan_only:
        for existing_port in range(args.port,args.port+20):
            try:
                with urlopen(f'http://127.0.0.1:{existing_port}/api/health',timeout=.2) as response:health=json.load(response)
                if health.get('app')=='MyLittleWorldBuilder' and health.get('root')==str(ROOT) and health.get('layout')==2:
                    if not args.no_browser:webbrowser.open(f'http://127.0.0.1:{existing_port}/'+('assets/' if args.manager else ''))
                    print('Using the running Builder server.',flush=True);return
            except (OSError,ValueError):pass
    scan()
    if args.scan_only:print('Asset catalog updated.');return
    for port in range(args.port,args.port+20):
        try:server=ThreadingHTTPServer(('127.0.0.1',port),Handler);break
        except OSError:continue
    else:raise SystemExit('No available local port found.')
    url=f'http://127.0.0.1:{port}/'+('assets/' if args.manager else '')
    print('My Little World Builder: '+url,flush=True);print('Keep this window open. Press Ctrl+C to stop.',flush=True)
    if not args.no_browser:webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=='__main__':main()

