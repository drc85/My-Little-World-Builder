import {role,elevated,collides,bridgeTarget,beamTarget} from './bridge-rules.js?v=desktop-release-20261010';
import {fitModel,gltfRoot} from './model-rules.js?v=light-preview-1';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const A='assets/';
let assets=[
  {
    "id": "house-10-ply",
    "name": "NYC House 10×10",
    "cat": "Houses",
    "w": 100,
    "d": 100,
    "h": 167,
    "level": 167,
    "kind": "house",
    "ply": "BROWSER/Houses/Social/10x10 NYC House.ply",
    "sub": "Social"
  },
  {
    "id": "character-worker",
    "name": "Male Farmer 2×2",
    "cat": "Characters",
    "w": 20,
    "d": 20,
    "h": 40,
    "level": "character",
    "kind": "character",
    "snap": 20,
    "noCollision": true,
    "walk": true,
    "ply": "BROWSER/Figures/Work/2x2 male farmer.ply",
    "sub": "Work"
  },
  {
    "id": "road-straight",
    "name": "Road Straight",
    "cat": "Streets",
    "sub": "Double",
    "w": 100,
    "d": 100,
    "h": 5,
    "level": 5,
    "kind": "road",
    "edges": [
      "road",
      "sidewalk",
      "road",
      "sidewalk"
    ],
    "obj": "BROWSER/Streets/Two Lane/straight street.obj",
    "mtl": "BROWSER/Streets/Two Lane/straight street.mtl"
  },
  {
    "id": "road-corner",
    "name": "Road 90°",
    "cat": "Streets",
    "sub": "Double",
    "w": 100,
    "d": 100,
    "h": 5,
    "level": 5,
    "kind": "road",
    "obj": "BROWSER/Streets/Two Lane/90 street.obj",
    "mtl": "BROWSER/Streets/Two Lane/90 street.mtl"
  },
  {
    "id": "road-t",
    "name": "Road T",
    "cat": "Streets",
    "sub": "Double",
    "w": 100,
    "d": 100,
    "h": 5,
    "level": 5,
    "kind": "road",
    "obj": "BROWSER/Streets/Two Lane/t street.obj",
    "mtl": "BROWSER/Streets/Two Lane/t street.mtl"
  },
  {
    "id": "road-x",
    "name": "Road X",
    "cat": "Streets",
    "sub": "Double",
    "w": 100,
    "d": 100,
    "h": 5,
    "level": 5,
    "kind": "road",
    "obj": "BROWSER/Streets/Two Lane/x street.obj",
    "mtl": "BROWSER/Streets/Two Lane/x street.mtl"
  },
  {
    "id": "grass-5",
    "name": "Grass 5×5",
    "cat": "Terrain",
    "sub": "Grass",
    "w": 50,
    "d": 50,
    "h": 7,
    "level": 7,
    "kind": "grass",
    "obj": "BROWSER/Terrain/Grass/5x5 grass.obj",
    "mtl": "BROWSER/Terrain/Grass/5x5 grass.mtl"
  },
  {
    "id": "grass-5x10",
    "name": "Grass 5×10",
    "cat": "Terrain",
    "sub": "Grass",
    "w": 100,
    "d": 50,
    "h": 7,
    "level": 7,
    "kind": "grass",
    "obj": "BROWSER/Terrain/Grass/5x10 grass.obj",
    "mtl": "BROWSER/Terrain/Grass/5x10 grass.mtl"
  },
  {
    "id": "grass-10",
    "name": "Grass 10×10",
    "cat": "Terrain",
    "sub": "Grass",
    "w": 100,
    "d": 100,
    "h": 7,
    "level": 7,
    "kind": "grass",
    "obj": "BROWSER/Terrain/Grass/10x10 grass.obj",
    "mtl": "BROWSER/Terrain/Grass/10x10 grass.mtl"
  },
  {
    "id": "gw-straight",
    "name": "Grass → Water",
    "cat": "Terrain",
    "sub": "Grass on Water",
    "w": 50,
    "d": 50,
    "h": 7,
    "level": "5↔7",
    "kind": "transition",
    "obj": "BROWSER/Terrain/Grass on Water/5x5 grass on water.obj",
    "mtl": "BROWSER/Terrain/Grass on Water/5x5 grass on water.mtl"
  },
  {
    "id": "gw-corner-a",
    "name": "Grass/Water Corner A",
    "cat": "Terrain",
    "sub": "Grass on Water",
    "w": 50,
    "d": 50,
    "h": 7,
    "level": "5↔7",
    "kind": "transition",
    "obj": "BROWSER/Terrain/Grass on Water/5x5 grass on water corner a.obj",
    "mtl": "BROWSER/Terrain/Grass on Water/5x5 grass on water corner a .mtl"
  },
  {
    "id": "gw-corner-b",
    "name": "Grass/Water Corner B",
    "cat": "Terrain",
    "sub": "Grass on Water",
    "w": 50,
    "d": 50,
    "h": 7,
    "level": "5↔7",
    "kind": "transition",
    "obj": "BROWSER/Terrain/Grass on Water/5x5 grass on water corner b.obj",
    "mtl": "BROWSER/Terrain/Grass on Water/5x5 grass on water corner b.mtl"
  }
];
// The local Asset Manager generates this catalog; no folder API is needed on the web host.
let assetCatalog=null;
try{
 const response=await fetch('assets/catalog.json',{cache:'no-store'});
 if(response.ok){
   const data=await response.json();
   if(data.version!==1||!Array.isArray(data.assets)||!Array.isArray(data.folders))throw Error('Invalid asset catalog');
   assetCatalog=data;
   assets=data.assets.filter(a=>!a.missing).map(a=>{
     const entry={...a,cat:({'Figures':'Characters','Vehicle':'Vehicles','Bidges':'Bridges'})[a.folder.split('/')[0]]||a.folder.split('/')[0]||'Objects',sub:a.folder.split('/').slice(1).join('/'),folderPath:a.folder};
     if(a.type==='ply')entry.ply=a.file;else if(a.type==='obj')entry.obj=a.file;else entry.glb=a.file;
     return entry;
   });
 }
}catch(error){console.warn('Asset catalog unavailable; using the built-in catalog.',error)}
function catalogEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function catalogLabel(value){const lines=String(value).split(' / ').slice(0,3);return '<span class="catalog-label lines-'+lines.length+'">'+lines.map(catalogEscape).join('<br>')+'</span>'}
const byId=Object.fromEntries(assets.map(a=>[a.id,a]));
// Keep saved worlds compatible with the retired GLB house.
byId['house-10-pbr-on']=byId['house-10-ply'];
const modelCache=new Map();
async function loadModel(a){
 if(modelCache.has(a.id))return modelCache.get(a.id).clone(true);
 let obj;
 if(a.glb){const gltf=await new GLTFLoader().setPath(A).loadAsync(a.glb);obj=await gltfRoot(gltf);}
 else if(a.ply){
  const geo=await new PLYLoader().setPath(A).loadAsync(a.ply);geo.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:!!geo.getAttribute('color'),roughness:.78,metalness:0});
  obj=new THREE.Mesh(geo,mat);obj.rotation.x=-Math.PI/2;obj.castShadow=false;obj.receiveShadow=true;
 }
 else{let loader=new OBJLoader();if(a.mtl){const path=A+a.mtl.split('/').map(encodeURIComponent).join('/'),split=path.lastIndexOf('/');const mtl=await new MTLLoader().setPath(path.slice(0,split+1)).loadAsync(path.slice(split+1));mtl.preload();loader.setMaterials(mtl)}obj=await loader.setPath(A).loadAsync(a.obj);}
 fitModel(obj,a);
 if(a.kind==='house')a.h=new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3()).y;
 modelCache.set(a.id,obj);return obj.clone(true)
}
const viewport=document.getElementById('viewport'); const scene=new THREE.Scene();
// V1 sky: soft blue-to-lilac sunset gradient
const skyCanvas=document.createElement('canvas');skyCanvas.width=8;skyCanvas.height=512;const skyCtx=skyCanvas.getContext('2d');const skyGrad=skyCtx.createLinearGradient(0,0,0,512);skyGrad.addColorStop(0,'#78CCF5');skyGrad.addColorStop(.58,'#83C7F2');skyGrad.addColorStop(1,'#B59BEA');skyCtx.fillStyle=skyGrad;skyCtx.fillRect(0,0,8,512);const skyTexture=new THREE.CanvasTexture(skyCanvas);skyTexture.colorSpace=THREE.SRGBColorSpace;scene.background=skyTexture;
const camera=new THREE.OrthographicCamera(-500,500,350,-350,1,4000);camera.position.set(700,700,700);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;viewport.appendChild(renderer.domElement);
const composer=new EffectComposer(renderer);const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);const outlinePass=new OutlinePass(new THREE.Vector2(1,1),scene,camera);outlinePass.visibleEdgeColor.set(0xf5fdff);outlinePass.hiddenEdgeColor.set(0xf5fdff);outlinePass.edgeStrength=5.0;outlinePass.edgeGlow=.25;outlinePass.edgeThickness=1.35;outlinePass.pulsePeriod=0;composer.addPass(outlinePass);
const groupOutlinePasses=[];
const hemi=new THREE.HemisphereLight(0xffffff,0xaeb8c0,1.85);scene.add(hemi);const ambient=new THREE.AmbientLight(0xffffff,.62);scene.add(ambient);const sun=new THREE.DirectionalLight(0xffffff,1.18);sun.position.set(400,800,300);scene.add(sun);

// Turbo clock: 4 real minutes = 12 world hours; full world day = 8 minutes.
const CYCLE_SECONDS=480;
const dayNightStart=performance.now();
const daySky=['#74bde8','#84c8ed','#b49be1'], duskSky=['#786ba5','#ad718e','#e49b78'], nightSky=['#08152f','#142650','#3d3769'];
function mixHex(a,b,t){const A=new THREE.Color(a),B=new THREE.Color(b);A.lerp(B,t);return '#'+A.getHexString()}
function smooth01(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
function demoWorldHour(sec){return ((sec%CYCLE_SECONDS)+CYCLE_SECONDS)%CYCLE_SECONDS/CYCLE_SECONDS*24;}
function nightAmountForHour(hour){if(hour>=8&&hour<18)return 0;if(hour>=20||hour<6)return 1;if(hour>=18)return smooth01((hour-18)/2);return 1-smooth01((hour-6)/2)}
function nightAmountAt(sec){return nightAmountForHour(demoWorldHour(sec));}
function updateSky(night){
 const dusk=Math.sin(Math.PI*night);
 const cols=daySky.map((c,i)=>mixHex(c,nightSky[i],night));
 for(let i=0;i<3;i++)cols[i]=mixHex(cols[i],duskSky[i],dusk*.42);
 const g=skyCtx.createLinearGradient(0,0,0,512);g.addColorStop(0,cols[0]);g.addColorStop(.58,cols[1]);g.addColorStop(1,cols[2]);skyCtx.fillStyle=g;skyCtx.fillRect(0,0,8,512);skyTexture.needsUpdate=true;
 grid.material.color.set(mixHex('#9aa8b0','#536487',night));grid.material.opacity=.42-night*.13;
 hemi.intensity=THREE.MathUtils.lerp(1.85,.48,night)*lightSettings.brightness;ambient.intensity=THREE.MathUtils.lerp(.62,.22,night)*lightSettings.brightness;sun.intensity=THREE.MathUtils.lerp(1.18,.13,night)*lightSettings.brightness;
 const warm=mixHex('#ffd8a0','#d9f0ff',lightSettings.temp);sun.color.set(mixHex(warm,'#829bd0',night));const ang=lightSettings.rotation*Math.PI/180;sun.position.set(Math.cos(ang)*650,800,Math.sin(ang)*650);renderer.toneMappingExposure=THREE.MathUtils.lerp(.88,.68,night)*lightSettings.brightness;renderer.domElement.style.filter=`contrast(${lightSettings.contrast})`;
 const pbr=lightSettings.pbrPreset||'neutral';
 const pbrMap={neutral:{hemi:1,amb:1,sun:1,exp:1},soft:{hemi:1.10,amb:1.10,sun:.82,exp:.98},studio:{hemi:.92,amb:.88,sun:1.18,exp:1.03},warm:{hemi:1.02,amb:1.0,sun:1.05,exp:1.0},cool:{hemi:1.06,amb:1.02,sun:.96,exp:.99}};
 const pm=pbrMap[pbr]||pbrMap.neutral;hemi.intensity*=pm.hemi;ambient.intensity*=pm.amb;sun.intensity*=pm.sun;renderer.toneMappingExposure*=pm.exp;
 if(pbr==='warm')sun.color.lerp(new THREE.Color('#ffd0a0'),.24);else if(pbr==='cool')sun.color.lerp(new THREE.Color('#cfe7ff'),.24);

}
function lightMarker(name){return /^LIGHT(?:_|$)/i.test(String(name||'').trim());}
function legacyWindow(name){return /^fenster[ _]light(?:[ _.]\d+)?$/i.test(String(name||'').trim());}
function ensureNightLights(p){
 if(p.root.userData.nightReady)return;p.root.userData.nightReady=true;
 const materials=[];p.root.traverse(mesh=>{if(!mesh.isMesh)return;let named=legacyWindow(mesh.name);for(let node=mesh;node&&node!==p.root;node=node.parent)named=named||lightMarker(node.name);const src=Array.isArray(mesh.material)?mesh.material:[mesh.material];const out=src.map(m=>{if(!named&&!lightMarker(m.name))return m;const clone=m.clone();if(!clone.emissive)return m;const base=clone.emissiveIntensity||0;const color=clone.emissive.clone();if(color.r+color.g+color.b<.001)color.copy(clone.color);clone.emissive.copy(color);clone.emissiveIntensity=base;clone.userData.nightBase=base;materials.push(clone);return clone;});mesh.material=Array.isArray(mesh.material)?out:out[0];});p.root.userData.windowMaterials=materials;
}
function updateNightLights(night){const v=THREE.MathUtils.smoothstep(night,.28,.78);for(const p of placed){ensureNightLights(p);for(const m of p.root.userData.windowMaterials||[])m.emissiveIntensity=(m.userData.nightBase||0)+v*2.5;}}
function addCarLights(car){if(car.userData.lights)return;const front=new THREE.PointLight(0xfff1c7,0,62,2),rear=new THREE.PointLight(0xff2d24,0,34,2);front.position.set(10,8,0);rear.position.set(-10,8,0);car.add(front,rear);const fm=new THREE.MeshBasicMaterial({color:0xfff2bd,transparent:true,opacity:0}),rm=new THREE.MeshBasicMaterial({color:0xff2d24,transparent:true,opacity:0});const bulbs=[];for(const z of [-2.7,2.7]){const f=new THREE.Mesh(new THREE.SphereGeometry(1.15,8,6),fm);f.position.set(9.4,8.2,z);car.add(f);bulbs.push(f);const r=new THREE.Mesh(new THREE.SphereGeometry(.9,8,6),rm);r.position.set(-9.4,8.1,z);car.add(r);bulbs.push(r)}car.userData.lights=[front,rear];car.userData.lightBulbs=bulbs}
function updateCarLights(night){const v=Math.max(0,Math.min(1,(night-.22)/.55));for(const t of traffic){addCarLights(t.car);t.car.userData.lights[0].intensity=v*2.2;t.car.userData.lights[1].intensity=v*.9;if(t.car.userData.lightBulbs){t.car.userData.lightBulbs.forEach((b,i)=>{b.material.opacity=v*(i%2?1:.95);b.visible=v>.02})}}}
let skyTick=0;
let worldSettings={city:'Nürnberg',live:false,weather:false,realtime:false,clock:true,timezone:null,weatherCode:null,temp:null,cloudCover:0,precipitation:0,snowfall:0};
let lightSettings={brightness:1,rotation:35,temp:.5,contrast:1,pbrPreset:'neutral'};let cloudSettings={amount:.55,speed:1,shape:1,inner:190,outer:520,innerOpacity:.04,outerOpacity:.80,nearDensity:.48,farDensity:.90,cityDensity:.035};try{Object.assign(lightSettings,JSON.parse(localStorage.getItem('mlw-light-settings')||'{}'));Object.assign(cloudSettings,JSON.parse(localStorage.getItem('mlw-cloud-settings')||'{}'))}catch(e){}
let liveWeather={cloud:.12,rain:0,snow:0,fog:0,storm:0};
function realTimeHour(){let d=new Date(),hour=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;if(worldSettings.timezone){try{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:worldSettings.timezone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d);hour=Number(parts.find(x=>x.type==='hour')?.value||0)+Number(parts.find(x=>x.type==='minute')?.value||0)/60+Number(parts.find(x=>x.type==='second')?.value||0)/3600}catch(e){}}return hour}
function realTimeNightAmount(){return nightAmountForHour(realTimeHour())}
function updateWorldClock(now){
 const el=document.getElementById('worldClock');if(!el)return;
 el.style.display=worldSettings.clock===false?'none':'block';if(worldSettings.clock===false)return;
 let h,m,sec;
 if(worldSettings.live){
   const d=new Date();
   if(worldSettings.timezone){try{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:worldSettings.timezone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d);h=Number(parts.find(x=>x.type==='hour')?.value||0);m=Number(parts.find(x=>x.type==='minute')?.value||0);sec=Number(parts.find(x=>x.type==='second')?.value||0)}catch(e){}}
   if(h==null){h=d.getHours();m=d.getMinutes();sec=d.getSeconds()}
 }else{
   const wh=demoWorldHour((now-dayNightStart)/1000);h=Math.floor(wh);const mf=(wh-h)*60;m=Math.floor(mf);sec=Math.floor((mf-m)*60);
 }
 const hourDeg=((h%12)+m/60+sec/3600)*30, minDeg=(m+sec/60)*6, secDeg=sec*6;
 el.querySelector('.hourHand')?.style.setProperty('--rot',hourDeg+'deg');
 el.querySelector('.minuteHand')?.style.setProperty('--rot',minDeg+'deg');
 el.querySelector('.secondHand')?.style.setProperty('--rot',secDeg+'deg');
}

function updateDayNight(now){const night=worldSettings.realtime?realTimeNightAmount():worldSettings.dayMode==='day'?0:worldSettings.dayMode==='night'?1:nightAmountAt((now-dayNightStart)/1000);if(now-skyTick>90){skyTick=now;updateSky(night)}updateNightLights(night);updateCarLights(night);updateWorldClock(now);updateSettingsClock();}

const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,0,0);controls.enableRotate=false;controls.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null};controls.touches={ONE:null,TWO:THREE.TOUCH.DOLLY_PAN};
const grid=new THREE.GridHelper(2000,40,0x9aa8b0,0x9aa8b0);grid.material.transparent=true;grid.material.depthWrite=false;grid.renderOrder=-1;grid.material.opacity=.46;scene.add(grid);const ground=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.MeshBasicMaterial({visible:false}));ground.rotation.x=-Math.PI/2;scene.add(ground);
let placed=[],selected=null,selectedGroup=new Set(),multiMode=false,clipboard=[],dragging=null,draggingGroup=null,dragGroupStart=null,placingCopy=null,placingCopies=null,placingGroupAnchor=null,panning=false,panLast=null,offset=new THREE.Vector3(),idSeq=1;const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();

// V6.7 animated cloud / fog-of-world layer. Built areas reveal automatically.
function makeCloudTexture(){
 const c=document.createElement('canvas');c.width=320;c.height=192;const x=c.getContext('2d');
 x.clearRect(0,0,c.width,c.height);
 const blobs=[[64,70,43],[103,53,48],[145,67,53],[184,57,38],[125,80,55]];
 for(const [ox,oy,r] of blobs){const bx=ox+32,by=oy+24;const g=x.createRadialGradient(bx,by,r*.12,bx,by,r);g.addColorStop(0,'rgba(255,255,255,.98)');g.addColorStop(.48,'rgba(255,255,255,.82)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(bx,by,r,0,Math.PI*2);x.fill()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const cloudTexture=makeCloudTexture(), clouds=[];
const cloudGroup=new THREE.Group();scene.add(cloudGroup);
for(let i=0;i<180;i++){
 const mat=new THREE.SpriteMaterial({map:cloudTexture,transparent:true,opacity:0,depthWrite:false});
 const sp=new THREE.Sprite(mat);const sc=150+Math.random()*170;sp.scale.set(sc*1.7,sc,1);
 sp.position.set((Math.random()-.5)*1900,55+Math.random()*55,(Math.random()-.5)*1900);
 sp.userData.overCity=i%6===0;if(sp.userData.overCity){mat.depthTest=false;sp.renderOrder=2;}sp.userData.speed=3+Math.random()*7;sp.userData.phase=Math.random()*Math.PI*2;cloudGroup.add(sp);clouds.push(sp);
}
const outerCloudPass=new ShaderPass({
 uniforms:{tDiffuse:{value:null},inverseCamera:{value:new THREE.Matrix4()},bounds:{value:new THREE.Vector4(-1000,1000,-1000,1000)},time:{value:0}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform mat4 inverseCamera;uniform vec4 bounds;uniform float time;varying vec2 vUv;
 void main(){vec2 clip=vUv*2.-1.;vec4 a=inverseCamera*vec4(clip,-1.,1.),b=inverseCamera*vec4(clip,1.,1.);vec3 start=a.xyz/a.w,end=b.xyz/b.w;float t=-start.y/(end.y-start.y);vec2 p=mix(start,end,t).xz;vec2 center=vec2(bounds.x+bounds.y,bounds.z+bounds.w)*.5;vec2 halfSize=vec2(bounds.y-bounds.x,bounds.w-bounds.z)*.5;vec2 delta=abs(p-center)-halfSize;float distance=max(delta.x,delta.y);float puff=sin(p.x*.013+time*.04)*sin(p.y*.009-time*.025)*55.+sin(p.x*.027+p.y*.021)*22.;float alpha=smoothstep(-20.,220.,distance+puff);vec4 world=texture2D(tDiffuse,vUv);gl_FragColor=vec4(mix(world.rgb,vec3(.98,.985,1.),alpha),world.a);}`
});composer.addPass(outerCloudPass);
// Keep the complete fixed world in front of the camera's clipping planes.
// Moving an orthographic camera along its viewing axis preserves the framing.
function fitWorldDepth(){
 const direction=camera.getWorldDirection(new THREE.Vector3());
 const height=Math.max(650,...placed.map(p=>p.root.position.y+(p.asset.h||0)+400));
 let nearest=Infinity,farthest=-Infinity;
 for(const x of [-1450,1450])for(const y of [-50,height])for(const z of [-1450,1450]){
  const depth=new THREE.Vector3(x,y,z).sub(camera.position).dot(direction);nearest=Math.min(nearest,depth);farthest=Math.max(farthest,depth);
 }
 if(nearest<100){const shift=100-nearest;camera.position.addScaledVector(direction,-shift);farthest+=shift;}
 if(farthest+200>camera.far){camera.far=farthest+400;camera.updateProjectionMatrix();}
 camera.updateMatrixWorld();
}
function updateOuterClouds(){fitWorldDepth();outerCloudPass.uniforms.bounds.value.set(-1000,1000,-1000,1000);camera.updateMatrixWorld();outerCloudPass.uniforms.inverseCamera.value.multiplyMatrices(camera.matrixWorld,camera.projectionMatrixInverse);outerCloudPass.uniforms.time.value=performance.now()/1000;}
// Distance to the actual built footprint, not just each tile's center.
function cloudFootprints(){return placed.map(p=>{const d=dimsFor(p);return {x:p.root.position.x,z:p.root.position.z,w:d.w,d:d.d,top:p.root.position.y+(p.asset.h||0)};});}
function cloudDensity(distance){
 const near=cloudSettings.nearDensity,far=cloudSettings.farDensity;
 const reveal=THREE.MathUtils.smoothstep(distance,0,110);
 const outer=THREE.MathUtils.smoothstep(distance,110,430);
 return reveal*THREE.MathUtils.lerp(near,far,outer);
}
function updateClouds(dt){
 const footprints=cloudFootprints();
 const high=Math.max(160,...footprints.map(p=>p.top))+80;
 const weatherFactor=.85+.15*Math.max(0,Math.min(1,liveWeather.cloud));
 for(const c of clouds){
  c.position.x+=c.userData.speed*cloudSettings.speed*dt;
  c.position.z+=Math.sin(performance.now()*.00018+c.userData.phase)*dt*2;
  if(c.position.x>1150)c.position.x=-1150;
  let distance=Infinity;
  for(const p of footprints){const dx=Math.max(0,Math.abs(c.position.x-p.x)-p.w/2),dz=Math.max(0,Math.abs(c.position.z-p.z)-p.d/2);distance=Math.min(distance,Math.hypot(dx,dz));}
  // Fade the broad low sprites before their edges obscure buildings.
  let target=cloudDensity(Math.max(0,distance-c.scale.x*.38))*weatherFactor;
  if(c.userData.overCity){c.position.y=high;target=cloudSettings.cityDensity;}
  c.scale.y=(c.scale.x/1.7)*cloudSettings.shape;
  c.material.opacity+=(target-c.material.opacity)*(1-Math.exp(-5*dt));
  c.visible=c.material.opacity>.001;
 }
}
let cloudClock=performance.now();

// V6.8 tiny ambient traffic. Cars only spawn when road tiles exist and stay on road centers.
const trafficGroup=new THREE.Group();scene.add(trafficGroup);const traffic=[];
function makeTinyCar(color){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(18,5,9),new THREE.MeshStandardMaterial({color,roughness:.55}));body.position.y=8;g.add(body);const cab=new THREE.Mesh(new THREE.BoxGeometry(9,4,8),new THREE.MeshStandardMaterial({color:0xf3f7fa,roughness:.35}));cab.position.set(-1,12,0);g.add(cab);for(const x of [-6,6])for(const z of [-5,5]){const w=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,2,10),new THREE.MeshStandardMaterial({color:0x24272a}));w.rotation.x=Math.PI/2;w.position.set(x,6,z*.78);g.add(w)}return g}

function isVehicle(p){return p.asset.kind==='vehicle'||['Vehicle','Vehicles'].includes(p.asset.cat);}
function drivable(p){return !p.asset.noCollision&&((p.asset.cat==='Streets'&&/two lane/i.test(p.asset.folderPath||p.asset.folder||''))||(['deck','ramp'].includes(role(p))&&/street/i.test(p.asset.file||'')&&!/pavement|pedestrian|rail/i.test(p.asset.file||'')));}
// Inspect the actual broad, lowered road openings. Raised curbs and narrow
// one-lane exits are excluded; no filename guesses about orientation.
function localRoadPorts(p){
 if(p.asset._roadPorts)return p.asset._roadPorts;
 if(role(p))return p.asset._roadPorts=p.asset.bridgeAxis===2?[[0,-1],[0,1]]:[[-1,0],[1,0]];
 const old=p.root.rotation.y;p.root.rotation.y=0;p.root.updateMatrixWorld(true);
 const samples=[];
 for(const [x,z] of [[1,0],[-1,0],[0,1],[0,-1]]){
  if((x?p.asset.d:p.asset.w)<80)continue;
  const heights=[-25,0,25].map(side=>{
   const origin=new THREE.Vector3(p.root.position.x+x*(p.asset.w/2-3)+(z?side:0),p.root.position.y+p.asset.h+20,p.root.position.z+z*(p.asset.d/2-3)+(x?side:0));
   const hit=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0)).intersectObject(p.root,true)[0];return hit?hit.point.y-p.root.position.y:Infinity;
  });samples.push({dir:[x,z],heights});
 }
 p.root.rotation.y=old;p.root.updateMatrixWorld(true);
 const low=Math.min(...samples.flatMap(s=>s.heights));
 return p.asset._roadPorts=samples.filter(s=>Number.isFinite(low)&&s.heights.every(y=>Math.abs(y-low)<.4)).map(s=>s.dir);
}
function roadDirections(p){const c=Math.cos(p.rotation),s=Math.sin(p.rotation);return localRoadPorts(p).map(([x,z])=>({x:Math.round(x*c+z*s),z:Math.round(z*c-x*s)}));}
function roadEdge(p,d){const size=dimsFor(p),half=(d.x?size.w:size.d)/2;return {x:p.root.position.x+d.x*half,z:p.root.position.z+d.z*half};}
function roadY(p,x,z){if(role(p)==='ramp'){const probe=new THREE.Raycaster(new THREE.Vector3(x,p.root.position.y+p.asset.h+100,z),new THREE.Vector3(0,-1,0));p.root.updateMatrixWorld(true);const hit=probe.intersectObject(p.root,true)[0];if(hit)return hit.point.y;const c=Math.cos(p.rotation),s=Math.sin(p.rotation),lx=(x-p.root.position.x)*c-(z-p.root.position.z)*s,lz=(x-p.root.position.x)*s+(z-p.root.position.z)*c;const axis=p.asset.bridgeAxis===2,l=axis?p.asset.d:p.asset.w,t=Math.max(0,Math.min(1,.5+(axis?lz:lx)*(p.asset.highSide||-1)/l));return p.root.position.y+5+t*(p.asset.deckHeight-5);}return p.root.position.y+(p.asset.roadSurface||5);}
function sameDirection(a,b){return a.x===b.x&&a.z===b.z;}
function roadNeighbor(p,d){const edge=roadEdge(p,d);return placed.find(q=>q!==p&&drivable(q)&&roadDirections(q).some(e=>{const other=roadEdge(q,e);return e.x===-d.x&&e.z===-d.z&&Math.hypot(edge.x-other.x,edge.z-other.z)<1&&Math.abs(roadY(p,edge.x,edge.z)-roadY(q,other.x,other.z))<2;}));}
function laneRoute(tile,entry,exit){
 const a=roadEdge(tile,entry),b=roadEdge(tile,exit),incoming={x:-entry.x,z:-entry.z};
 const start=new THREE.Vector3(a.x-incoming.z*25,0,a.z+incoming.x*25),end=new THREE.Vector3(b.x-exit.z*25,0,b.z+exit.x*25);
 const straight=sameDirection(incoming,exit),handle=straight?start.distanceTo(end)/3:Math.max(Math.abs(end.x-start.x),Math.abs(end.z-start.z))*.55228475;
 const curve=new THREE.CubicBezierCurve3(start,start.clone().add(new THREE.Vector3(incoming.x*handle,0,incoming.z*handle)),end.clone().sub(new THREE.Vector3(exit.x*handle,0,exit.z*handle)),end);
 return {tile,entry,exit,curve,length:curve.getLength(),distance:0,signature:[tile.root.position.x,tile.root.position.y,tile.root.position.z,tile.rotation].join(',')};
}
function vehicleForward(p){
 if(Number.isFinite(p.asset._forwardYaw))return p.asset._forwardYaw;
 p.root.updateMatrixWorld(true);const rear=new THREE.Vector3(),front=new THREE.Vector3();let nr=0,nf=0;
 p.root.traverse(m=>{if(!m.isMesh)return;let named=false;for(let n=m;n&&n!==p.root;n=n.parent)named=named||lightMarker(n.name);if(!named)return;const mat=Array.isArray(m.material)?m.material[0]:m.material,c=mat?.color;if(!c)return;const center=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());p.root.worldToLocal(center);if(c.r>c.g*2&&c.r>c.b*2){rear.add(center);nr++;}else if(Math.min(c.r,c.g,c.b)>.5){front.add(center);nf++;}});
 const v=nf?front.divideScalar(nf):nr?rear.divideScalar(-nr):new THREE.Vector3(1,0,0);
 return p.asset._forwardYaw=Math.atan2(v.x,v.z);
}
function applyVehicleRoute(p,state){const u=THREE.MathUtils.clamp(state.distance/state.length,0,1),pos=state.curve.getPointAt(u),dir=state.curve.getTangentAt(u);p.rotation=Math.atan2(dir.x,dir.z)-vehicleForward(p);p.root.rotation.y=p.rotation;p.root.position.set(pos.x,roadY(state.tile,pos.x,pos.z),pos.z);}
function vehicleTarget(p,x,z,restoring=false){
 let best=null;
 for(const tile of placed.filter(drivable)){
  const size=dimsFor(tile);if(Math.abs(x-tile.root.position.x)>size.w/2||Math.abs(z-tile.root.position.z)>size.d/2)continue;
  const ports=roadDirections(tile);
  for(const entry of ports)for(const exit of ports){if(sameDirection(entry,exit))continue;const route=laneRoute(tile,entry,exit);for(let i=0;i<=20;i++){const point=route.curve.getPointAt(i/20);let d=(point.x-x)**2+(point.z-z)**2+(restoring?Math.pow(roadY(tile,point.x,point.z)-p.root.position.y,2)*4:0);if(restoring){const tangent=route.curve.getTangentAt(i/20),heading=p.rotation+vehicleForward(p);d+=25*(1-tangent.x*Math.sin(heading)-tangent.z*Math.cos(heading));}if(!best||d<best.d)best={d,route,u:i/20};}}
 }
 if(!best)return false;
 if(restoring){let lo=Math.max(0,best.u-.05),hi=Math.min(1,best.u+.05);const dist=u=>{const point=best.route.curve.getPointAt(u);return (point.x-x)**2+(point.z-z)**2;};for(let i=0;i<18;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(dist(a)<dist(b))hi=b;else lo=a;}best.u=(lo+hi)/2;}
 p.drive=best.route;p.drive.distance=best.u*p.drive.length;applyVehicleRoute(p,p.drive);return true;
}
function updatePlacedVehicles(dt){
 if(placementLoading)return;
 for(const p of placed){
  if(!isVehicle(p)||p===placingCopy||placingCopies?.includes(p)||currentSelection().includes(p)||p.locked)continue;
  let state=p.drive;if(!state)continue;
  const tile=state.tile;if(!placed.includes(tile)){p.drive=null;continue;}
  if(state.signature!==[tile.root.position.x,tile.root.position.y,tile.root.position.z,tile.rotation].join(',')){p.drive=null;vehicleTarget(p,p.root.position.x,p.root.position.z);continue;}
  const next=roadNeighbor(tile,state.exit),entry={x:-state.exit.x,z:-state.exit.z};
  const options=next?roadDirections(next).filter(e=>!sameDirection(e,entry)):[];
  // Stop before an open end, including the car's front half.
  if(!options.length)state.distance=Math.min(state.distance+16*dt,Math.max(0,state.length-24));
  else state.distance+=16*dt;
  if(state.distance>=state.length&&options.length){const forward=options.find(e=>sameDirection(e,state.exit)),connected=options.filter(e=>roadNeighbor(next,e));const exit=(connected.length?connected:options).find(e=>sameDirection(e,state.exit))||(connected.length?connected:options)[0]||forward;const extra=state.distance-state.length;state=laneRoute(next,entry,exit);state.distance=extra;p.drive=state;}
  applyVehicleRoute(p,state);
 }
}

function roadTiles(){return placed.filter(p=>p.asset.kind==='road')}
function roadConnections(p){let dirs=p.asset.id==='road-straight'?[[0,-1],[0,1]]:p.asset.id==='road-corner'?[[0,-1],[1,0]]:p.asset.id==='road-t'?[[0,-1],[1,0],[-1,0]]:[[0,-1],[1,0],[0,1],[-1,0]];const q=Math.round(p.rotation/(Math.PI/2))%4;return dirs.map(([x,z])=>{for(let i=0;i<q;i++) [x,z]=[-z,x];return[x,z]})}
function neighborRoad(p,dir){const tx=p.root.position.x+dir[0]*100,tz=p.root.position.z+dir[1]*100;return roadTiles().find(r=>Math.abs(r.root.position.x-tx)<2&&Math.abs(r.root.position.z-tz)<2)}
function spawnTraffic(){
 const roads=roadTiles();
 if(!roads.length||traffic.length>=Math.min(6,Math.max(1,roads.length)))return;
 const free=roads.filter(r=>!traffic.some(t=>t.tile===r));
 const p=(free.length?free:roads)[Math.floor(Math.random()*(free.length?free.length:roads.length))];
 const dirs=roadConnections(p),d=dirs[Math.floor(Math.random()*dirs.length)]||[1,0];
 const car=makeTinyCar([0xff6b6b,0xffd166,0x56cfe1,0x9b5de5,0x72d572][Math.floor(Math.random()*5)]);
 trafficGroup.add(car);addCarLights(car);
 traffic.push({car,tile:p,dir:d,progress:Math.random(),speed:.13+Math.random()*.07});
}
let trafficTimer=0;
function updateTraffic(dt){
 updatePlacedVehicles(dt);
 for(let i=traffic.length-1;i>=0;i--){
  const t=traffic[i];if(!placed.includes(t.tile)){trafficGroup.remove(t.car);traffic.splice(i,1);continue}
  t.progress+=t.speed*dt;
  if(t.progress>=1){
   const next=neighborRoad(t.tile,t.dir);
   if(next){t.tile=next;t.progress=0;const opts=roadConnections(next).filter(d=>neighborRoad(next,d)&&!(d[0]===-t.dir[0]&&d[1]===-t.dir[1]));if(opts.length)t.dir=opts[Math.floor(Math.random()*opts.length)]}
   else {t.progress=0;t.dir=[-t.dir[0],-t.dir[1]]}
  }
  const center=t.tile.root.position,lane=20,perp=[t.dir[1],-t.dir[0]]; // right-hand lane: opposite directions always occupy opposite lanes
  // On isolated roads the car visibly drives across the tile and turns back at its edge.
  const along=(t.progress-.5)*82;
  t.car.position.set(center.x+t.dir[0]*along+perp[0]*lane,7,center.z+t.dir[1]*along+perp[1]*lane);
  t.car.rotation.y=-Math.atan2(t.dir[1],t.dir[0]);
 }
}


// V6.14 ambient life: birds over grass and fish that briefly jump from water.
const wildlifeGroup=new THREE.Group();scene.add(wildlifeGroup);
const birds=[],fish=[],ripples=[],crabs=[];
// Every eligible tile has its own staggered cycle, including tiles restored from a save.
const wildlifeCycles={bird:new WeakMap(),fish:new WeakMap(),crab:new WeakMap()};
let wildlifeTime=0;
function scheduleTileWildlife(kind,tiles,active,spawn,initialDelay,pause){
 const cycles=wildlifeCycles[kind],occupied=new Set(active.map(a=>a.tile||a.center));
 for(const tile of tiles){
  let cycle=cycles.get(tile);
  if(!cycle){cycle={next:wildlifeTime+Math.random()*initialDelay,active:false};cycles.set(tile,cycle);}
  if(occupied.has(tile)){cycle.active=true;continue;}
  if(cycle.active){cycle.active=false;cycle.next=wildlifeTime+pause[0]+Math.random()*(pause[1]-pause[0]);}
  if(wildlifeTime>=cycle.next){spawn(tile);cycle.active=true;}
 }
}
function removeWildlife(obj){
 wildlifeGroup.remove(obj);
 obj.traverse(node=>{if(node.geometry)node.geometry.dispose();if(node.material)for(const mat of (Array.isArray(node.material)?node.material:[node.material]))mat.dispose();});
}
function grassTiles(){return placed.filter(p=>p.asset.kind==='grass')}
function waterTiles(){return placed.filter(p=>p.asset.cat==='Terrain'&&(/\bwater\b/i.test(p.asset.folderPath||p.asset.folder||'')||p.asset.kind==='water'))}
function makeBird(){
 const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color:0x26323b,side:THREE.DoubleSide});
 const wingGeo=new THREE.BufferGeometry();wingGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-7,0,-3,-2,0,1, 0,0,0,7,0,-3,2,0,1],3));
 const wings=new THREE.Mesh(wingGeo,mat);g.add(wings);g.userData.wings=wings;return g;
}
function spawnBird(t){const b=makeBird();wildlifeGroup.add(b);const r=55+Math.random()*42,a=Math.random()*Math.PI*2;b.position.set(t.root.position.x+Math.cos(a)*r,t.root.position.y+48+Math.random()*25,t.root.position.z+Math.sin(a)*r);birds.push({obj:b,center:t,angle:a,radius:r,speed:.45+Math.random()*.35,life:8+Math.random()*5,phase:Math.random()*6})}
function makeFish(){const g=new THREE.Group();g.add(cartoonSprite('🐟',8));return g;}
function makeRipple(x,z,y){const m=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false});const r=new THREE.Mesh(new THREE.RingGeometry(3,3.4,40),m);r.rotation.x=-Math.PI/2;r.position.set(x,y,z);wildlifeGroup.add(r);ripples.push({obj:r,life:.7,max:.7})}
function spawnFish(t){const f=makeFish();wildlifeGroup.add(f);const baseY=t.root.position.y+(t.asset.h||5)+1,ang=Math.random()*Math.PI*2;f.position.set(t.root.position.x,baseY,t.root.position.z);f.rotation.y=-ang;fish.push({obj:f,tile:t,ang,life:1.45,t:0,baseY,splashed:false})}
function sandTiles(){return placed.filter(p=>p.asset.cat==='Terrain'&&/\bsand\b/i.test((p.asset.folderPath||p.asset.folder||'').split('/')[1]||''));}
function spawnCrab(tile){
 const obj=cartoonSprite('🦀',8,0);
 wildlifeGroup.add(obj);crabs.push({obj,tile,t:0,life:5.5+Math.random()*2,direction:Math.random()<.5?-1:1});
}
function updateCrabs(dt){
 for(let i=crabs.length-1;i>=0;i--){
  const c=crabs[i];c.t+=dt;
  if(!placed.includes(c.tile)||c.t>=c.life){removeWildlife(c.obj);crabs.splice(i,1);continue;}
  const u=c.t/c.life,walking=u<.42||u>.58;
  const progress=u<.42?u/.84:u<.58?.5:.5+(u-.58)/.84;
  const distance=Math.min(12,Math.max(0,c.tile.asset.w/2-6)),x=(progress*2-1)*distance*c.direction,angle=c.tile.rotation;
  c.obj.position.set(c.tile.root.position.x+x*Math.cos(angle),c.tile.root.position.y+(c.tile.asset.h||5)+3.5+(walking?Math.abs(Math.sin(c.t*14))*.45:0),c.tile.root.position.z-x*Math.sin(angle));
  c.obj.material.opacity=Math.min(1,c.t/.5,(c.life-c.t)/.7);
  c.obj.material.rotation=walking?Math.sin(c.t*14)*.045:0;
 }
}
function updateWildlife(dt){
 if(placementLoading)return;
 wildlifeTime+=dt;
 scheduleTileWildlife('bird',grassTiles(),birds,spawnBird,40,[30,85]);
 scheduleTileWildlife('fish',waterTiles(),fish,spawnFish,24,[8,24]);
 scheduleTileWildlife('crab',sandTiles(),crabs,spawnCrab,30,[18,48]);
 updateCrabs(dt);
 for(let i=birds.length-1;i>=0;i--){const b=birds[i];if(!placed.includes(b.center)||(b.life-=dt)<=0){removeWildlife(b.obj);birds.splice(i,1);continue}b.angle+=b.speed*dt;b.obj.position.x=b.center.root.position.x+Math.cos(b.angle)*b.radius;b.obj.position.z=b.center.root.position.z+Math.sin(b.angle)*b.radius;b.obj.rotation.y=-b.angle;b.obj.userData.wings.rotation.x=Math.sin(performance.now()*.012+b.phase)*.45}
 for(let i=fish.length-1;i>=0;i--){const f=fish[i];if(!placed.includes(f.tile)){removeWildlife(f.obj);fish.splice(i,1);continue}f.t+=dt;const u=Math.min(1,f.t/f.life),travel=0;f.obj.position.x=f.tile.root.position.x;f.obj.position.z=f.tile.root.position.z;f.obj.position.y=f.baseY+Math.sin(Math.PI*u)*12;f.obj.rotation.z=Math.sin(Math.PI*u)*.35;if(u>=1){if(!f.splashed){makeRipple(f.obj.position.x,f.obj.position.z,f.baseY+.7);f.splashed=true}removeWildlife(f.obj);fish.splice(i,1)}}
 for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.life-=dt;const u=1-r.life/r.max;r.obj.scale.setScalar(1+u*2);r.obj.material.opacity=Math.max(0,.85*(1-u));if(r.life<=0){removeWildlife(r.obj);ripples.splice(i,1)}}
}

// V6.14 optional relaxing WebAudio ambience: soft pad/chimes plus occasional bird chirps.
let audioCtx=null,audioMaster=null,musicTimer=null,birdAudioTimer=null,soundOn=true,audioStarted=false;
let musicSettings={file:'assets/MUSIC/ambient-background.mp3',volume:.045};
try{const response=await fetch('assets/sound.json',{cache:'no-store'});if(response.ok){const saved=await response.json();if(typeof saved.file==='string'&&saved.file.startsWith('assets/MUSIC/')&&!saved.file.split('/').includes('..'))musicSettings={file:saved.file,volume:Math.max(0,Math.min(1,Number(saved.volume)||0))};}}catch(error){console.warn('Using default background music',error)}
const ambientTrack=new Audio(musicSettings.file);ambientTrack.loop=true;ambientTrack.volume=musicSettings.volume;ambientTrack.preload='auto';
let suppressClickSound=false,dragStartPos=null;
function tone(freq,start,dur,gain=.018,type='sine'){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+.35);g.gain.exponentialRampToValueAtTime(.0001,start+dur);o.connect(g).connect(audioMaster);o.start(start);o.stop(start+dur+.05)}
function scheduleMusic(){if(!soundOn||!audioCtx)return;const now=audioCtx.currentTime;const chordSets=[[261.63,329.63,392],[220,277.18,329.63],[196,246.94,293.66],[233.08,293.66,349.23]];const chord=chordSets[Math.floor((Date.now()/8000)%chordSets.length)];chord.forEach((f,i)=>tone(f/2,now+i*.12,7.5,.010,'sine'));tone(chord[Math.floor(Math.random()*3)]*2,now+2.2,2.8,.008,'sine')}
function birdChirp(){if(!soundOn||!audioCtx)return;const now=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(1500+Math.random()*500,now);o.frequency.exponentialRampToValueAtTime(2600+Math.random()*700,now+.13);o.frequency.exponentialRampToValueAtTime(1800,now+.28);g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.018,now+.035);g.gain.exponentialRampToValueAtTime(.0001,now+.3);o.connect(g).connect(audioMaster);o.start(now);o.stop(now+.31)}
function placementPop(){
 suppressClickSound=true;
 try{
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=.92;audioMaster.connect(audioCtx.destination)}
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='sine';o.frequency.setValueAtTime(520,now);o.frequency.exponentialRampToValueAtTime(860,now+.055);o.frequency.exponentialRampToValueAtTime(430,now+.14);
  g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.30,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+.16);
  o.connect(g).connect(audioMaster);o.start(now);o.stop(now+.17);
 }catch(_){ }
}
function deleteCrumble(){
 suppressClickSound=true;
 try{
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=.92;audioMaster.connect(audioCtx.destination)}
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime;
  // Short toy-like demolition: low thump + a few falling rubble clicks.
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='triangle';o.frequency.setValueAtTime(150,now);o.frequency.exponentialRampToValueAtTime(58,now+.24);
  g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.34,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.28);
  o.connect(g).connect(audioMaster);o.start(now);o.stop(now+.3);
  [0.035,0.09,0.145,0.21].forEach((d,i)=>{
    const c=audioCtx.createOscillator(),cg=audioCtx.createGain();
    c.type=i%2?'square':'triangle';c.frequency.setValueAtTime(390-i*58+Math.random()*80,now+d);c.frequency.exponentialRampToValueAtTime(105+Math.random()*55,now+d+.07);
    cg.gain.setValueAtTime(.14,now+d);cg.gain.exponentialRampToValueAtTime(.0001,now+d+.075);
    c.connect(cg).connect(audioMaster);c.start(now+d);c.stop(now+d+.08);
  });
 }catch(_){ }
}
function screenshotShutter(){
 suppressClickSound=true;
 try{
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=.92;audioMaster.connect(audioCtx.destination)}
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime;
  const click=(t,f,gain)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.setValueAtTime(f,now+t);o.frequency.exponentialRampToValueAtTime(f*.55,now+t+.035);g.gain.setValueAtTime(gain,now+t);g.gain.exponentialRampToValueAtTime(.0001,now+t+.055);o.connect(g).connect(audioMaster);o.start(now+t);o.stop(now+t+.06)};
  click(0,1250,.22);click(.075,720,.28);
 }catch(_){}
}
function uiClick(){
 try{
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=.92;audioMaster.connect(audioCtx.destination)}
  if(audioCtx.state==='suspended')audioCtx.resume();
  const now=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='sine';o.frequency.setValueAtTime(760,now);o.frequency.exponentialRampToValueAtTime(610,now+.045);
  g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.16,now+.006);g.gain.exponentialRampToValueAtTime(.0001,now+.065);
  o.connect(g).connect(audioMaster);o.start(now);o.stop(now+.07);
 }catch(_){}
}
let lastPanSound=0;
function panSound(){const now=performance.now();if(now-lastPanSound<130)return;lastPanSound=now;try{if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=.92;audioMaster.connect(audioCtx.destination);}if(audioCtx.state==='suspended')audioCtx.resume();const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(320,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.065,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g).connect(audioMaster);o.start(t);o.stop(t+.15);}catch(_){}}
renderer.domElement.addEventListener('wheel',e=>{if(e.deltaY)panSound();},{capture:true,passive:true});
async function setSound(on){
 const btn=document.getElementById('soundBtn');
 if(on){
  if(!audioCtx){audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioMaster.gain.value=.92;audioMaster.connect(audioCtx.destination)}
  await audioCtx.resume();soundOn=true;btn.classList.add('sound-on');btn.title='Mute ambient sound';
  clearInterval(musicTimer);musicTimer=null;
  try{await ambientTrack.play()}catch(_){}
  clearInterval(birdAudioTimer);birdAudioTimer=setInterval(()=>{if(Math.random()>.28)birdChirp()},4200);
 }else{
  soundOn=false;btn.classList.remove('sound-on');btn.title='Ambient sound';
  ambientTrack.pause();clearInterval(musicTimer);clearInterval(birdAudioTimer);musicTimer=birdAudioTimer=null;
 }
}
const soundBtn=document.getElementById('soundBtn');
soundBtn.classList.add('sound-on');
soundBtn.title='Mute ambient sound';
async function startDefaultAudio(){
 if(!soundOn||audioStarted)return;
 audioStarted=true;
 await setSound(true);
}
// Try audible autoplay immediately. Chromium may still block audible media by browser policy;
// if it does, the first user gesture starts it with no additional button press.
ambientTrack.play().then(()=>{audioStarted=true;}).catch(()=>{});
startDefaultAudio().catch(()=>{});
['pointerdown','keydown','touchstart','mousemove'].forEach(ev=>window.addEventListener(ev,startDefaultAudio,{once:true,capture:true}));
soundBtn.addEventListener('click',async(e)=>{e.stopPropagation();uiClick();if(soundOn){await setSound(false);audioStarted=false}else{audioStarted=true;await setSound(true)}});
document.addEventListener('click',e=>{if(suppressClickSound){suppressClickSound=false;return;}uiClick();},false);

function snapForSize(v,size){const cells=Math.max(1,Math.round(size/50));const phase=(cells%2)*25;return Math.round((v-phase)/50)*50+phase}
function dimsFor(p){const quarter=Math.round((p.rotation%(Math.PI*2))/(Math.PI/2))%2;return quarter?{w:p.asset.d,d:p.asset.w}:{w:p.asset.w,d:p.asset.d}}
function overlapsPlaced(a,b){
 const da=dimsFor(a),db=dimsFor(b);const eps=.5;
 return Math.abs(a.root.position.x-b.root.position.x)<(da.w+db.w)/2-eps&&Math.abs(a.root.position.z-b.root.position.z)<(da.d+db.d)/2-eps;
}
function resolvePlacementCollisions(p){
 for(let pass=0;pass<12;pass++){
  const other=placed.find(q=>q!==p&&collides(p,q));if(!other)break;
  const d=dimsFor(p),od=dimsFor(other),dx=p.root.position.x-other.root.position.x,dz=p.root.position.z-other.root.position.z;
  const pushX=(d.w+od.w)/2-Math.abs(dx),pushZ=(d.d+od.d)/2-Math.abs(dz);
  if(pushX<=pushZ){p.root.position.x=other.root.position.x+(dx>=0?1:-1)*(d.w+od.w)/2}
  else{p.root.position.z=other.root.position.z+(dz>=0?1:-1)*(d.d+od.d)/2}
 }
}
function needsGround(a){return ['character','animal','object'].includes(a.kind)||['Characters','Figures','Objects','Animals'].includes(a.cat);}
function standingTile(p){
 const a=p.asset,path=(a.folderPath||a.folder||'').toLowerCase().split('/');
 if(a.cat==='Streets')return path.includes('one lane');
 return a.cat==='Terrain'&&['sand','stone','pavement','grass'].includes(path[1])&&!path.some(s=>/\bon\b/.test(s));
}
function standingSurface(p,x,z){
 const d=dimsFor(p),hw=Math.max(0,d.w/2-.1),hd=Math.max(0,d.d/2-.1),points=[[x,z],[x-hw,z-hd],[x-hw,z+hd],[x+hw,z-hd],[x+hw,z+hd]];
 const hits=points.map(([px,pz])=>surfaceAt(px,pz,true));
 if(hits.some(h=>!h)||Math.max(...hits.map(h=>h.y))-Math.min(...hits.map(h=>h.y))>1.1)return null;
 return hits[0];
}
function standingTarget(p,x,z){const step=p.asset.snap||25,px=Math.round(x/step)*step,pz=Math.round(z/step)*step,surf=standingSurface(p,px,pz);if(!surf)return false;p.root.position.set(px,surf.y,pz);p.walkTo=null;return true;}
function assetRequirement(a){if(needsGround(a)&&!placed.some(standingTile))return 'Build sand, stone, pavement, grass or a one-lane street first.';if(isVehicle({asset:a})&&!placed.some(p=>drivable(p)&&roadDirections(p).length>1))return 'Build a two-lane street or street bridge first.';if(a.bridgeRole==='beam'&&!placed.some(elevated))return 'Build a street bridge before adding supports.';return '';}

function surfaceAt(x,z,walkOnly=false){
 const allowed=new Set(['grass','sand','pavement']);let best=null;
 for(const q of placed){if(q.asset.noCollision||q.asset.kind==='character'||q.asset.kind==='animal'||q.asset.kind==='vehicle')continue;if(walkOnly&&!standingTile(q))continue;const d=dimsFor(q);if(Math.abs(x-q.root.position.x)<=d.w/2+.01&&Math.abs(z-q.root.position.z)<=d.d/2+.01){const top=q.root.position.y+(Number(q.asset.h)||Number(q.asset.level)||0);if(!best||top>best.y)best={p:q,y:top}}}
 return best;
}
let placementNoticeTimer=null,placementNoticeText='';
function placementNotice(text){if(text&&text===placementNoticeText)return;placementNoticeText=text;clearTimeout(placementNoticeTimer);let el=document.getElementById('placementNotice');if(!el){el=document.createElement('div');el.id='placementNotice';el.style.cssText='position:fixed;bottom:160px;left:50%;transform:translateX(-50%);padding:12px 18px;background:#182b35;color:white;border-radius:12px;z-index:30;pointer-events:none;font:14px sans-serif';document.body.append(el);}el.textContent=text;el.hidden=!text;if(text)placementNoticeTimer=setTimeout(()=>{el.hidden=true;},3000);}
function withinGrid(p){const d=dimsFor(p);return Math.abs(p.root.position.x)+d.w/2<=1000.01&&Math.abs(p.root.position.z)+d.d/2<=1000.01;}
function snapPlaced(p,x,z){const footprint=dimsFor(p);x=THREE.MathUtils.clamp(x,-1000+footprint.w/2,1000-footprint.w/2);z=THREE.MathUtils.clamp(z,-1000+footprint.d/2,1000-footprint.d/2);const previous=p.root.position.clone(),rotation=p.rotation,deckHeight=p.deckHeight;snapPlacedInternal(p,x,z);if(!withinGrid(p)){const pending=p===placingCopy||placingCopies?.includes(p)||!placed.includes(p);p.placementValid=false;placementNotice('The build area ends at the edge of the grid.');if(!pending){p.root.position.copy(previous);p.rotation=rotation;p.root.rotation.y=rotation;p.deckHeight=deckHeight;p.placementValid=true;}else{const d=dimsFor(p);p.root.position.x=THREE.MathUtils.clamp(p.root.position.x,-1000+d.w/2,1000-d.w/2);p.root.position.z=THREE.MathUtils.clamp(p.root.position.z,-1000+d.d/2,1000-d.d/2);}}}
function snapPlacedInternal(p,x,z){
 if(needsGround(p.asset)){const old=p.root.position.clone(),pending=p===placingCopy||placingCopies?.includes(p)||!placed.includes(p);p.placementValid=standingTarget(p,x,z);if(!p.placementValid){if(pending)p.root.position.set(x,5,z);else{p.root.position.copy(old);p.placementValid=true;}placementNotice('Place this on sand, stone, pavement, grass or a one-lane street.');}else placementNotice('');return;}
 if(isVehicle(p)){const old=p.root.position.clone();p.placementValid=vehicleTarget(p,x,z);if(!p.placementValid){if(p===placingCopy||!placed.includes(p))p.root.position.set(x,5,z);else p.root.position.copy(old);placementNotice('Place vehicles on a two-lane street or street bridge.');}else placementNotice('');return;}
 const pending=new Set(placingCopies||(placingCopy?[placingCopy]:[]));const others=placed.filter(q=>q!==p&&!pending.has(q));
 if(elevated(p)&&placed.includes(p)&&!pending.has(p)){
  const previous=p.root.position.clone(),d=dimsFor(p);
  p.root.position.set(snapForSize(x,d.w),previous.y,snapForSize(z,d.d));
  if(others.some(q=>collides(p,q))){p.root.position.copy(previous);placementNotice('This position is occupied.');}
  else{p.lastValidPosition=p.root.position.clone();placementNotice('');}
  p.placementValid=true;return;
 }
 if(elevated(p)||role(p)==='beam'){
  const previous=p.root.position.clone();const valid=elevated(p)?bridgeTarget(p,x,z,others):beamTarget(p,x,z,others);
  p.placementValid=valid;
  if(valid){p.lastValidPosition=p.root.position.clone();placementNotice('');}
  else{if(!placed.includes(p)||pending.has(p))p.root.position.set(snapForSize(x,p.asset.w),elevated(p)?95:7,snapForSize(z,p.asset.d));else p.root.position.copy(p.lastValidPosition||previous);placementNotice(elevated(p)?'Connect this piece to the top of a ramp or an existing bridge.':'Place this support across the seam of two ground tiles.');}
  return;
 }
 p.placementValid=true;

 if(p.asset.noCollision&&!['Terrain','Streets'].includes(p.asset.cat)){const step=p.asset.snap||25;p.root.position.x=Math.round(x/step)*step;p.root.position.z=Math.round(z/step)*step;const surf=surfaceAt(p.root.position.x,p.root.position.z,false);p.root.position.y=surf?.y||0;return}
 const before=p.root.position.clone(),d=dimsFor(p);if(['Terrain','Streets'].includes(p.asset.cat))p.root.position.y=0;p.root.position.x=snapForSize(x,d.w);p.root.position.z=snapForSize(z,d.d);resolvePlacementCollisions(p);p.placementValid=!others.some(q=>collides(p,q));if(!p.placementValid){placementNotice('This ground position is occupied.');if(placed.includes(p)&&!pending.has(p)){p.root.position.copy(p.lastValidPosition||before);p.placementValid=true;}}else p.lastValidPosition=p.root.position.clone();
}
function chooseCharacterTarget(p){
 if(!p.asset.walk||p.locked||p===dragging)return;
 const step=p.asset.snap||25,dirs=[[1,0],[-1,0],[0,1],[0,-1]];dirs.sort(()=>Math.random()-.5);
 for(const [dx,dz] of dirs){const x=p.root.position.x+dx*step,z=p.root.position.z+dz*step,surf=standingSurface(p,x,z);if(!surf)continue;p.walkFrom=p.root.position.clone();p.walkTo=new THREE.Vector3(x,surf.y,z);const vx=x-p.root.position.x,vz=z-p.root.position.z;p.root.rotation.y=Math.atan2(vx,vz);p.rotation=p.root.rotation.y;p.walkT=0;p.walkDuration=1.5+Math.random()*1.2;return}
 p.walkWait=.8+Math.random()*1.8;
}
function updateCharacters(dt){
 if(placementLoading)return;
 for(const p of placed){if(!p.asset.walk||p.locked||p.groupId||p===dragging)continue;if(p.walkTo){p.walkT+=dt/p.walkDuration;const t=Math.min(1,p.walkT),e=t*t*(3-2*t);p.root.position.lerpVectors(p.walkFrom,p.walkTo,e);p.root.position.y=p.walkFrom.y+(p.walkTo.y-p.walkFrom.y)*e+Math.sin(t*Math.PI*2)*.7;if(t>=1){p.root.position.copy(p.walkTo);p.walkTo=null;p.walkWait=1.2+Math.random()*3.2}}else{p.walkWait=(p.walkWait??(1+Math.random()*2))-dt;if(p.walkWait<=0)chooseCharacterTarget(p)}}
}
function pointer(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mouse,camera)}
let inspectorVisible=false,pointerGesture=null,rotationFlashTimer=null,draftGroupColor='#ff66b3',groupSelectionKey='';
function colorValue(value){return /^#[0-9a-f]{6}$/i.test(value||'')?value:'#ff66b3';}
function groupMembers(p){return p.groupId?placed.filter(q=>q.groupId===p.groupId):[p];}
function expandGroups(items){return [...new Set(items.flatMap(groupMembers))];}
function oneGroup(items){return items.length>0&&!!items[0].groupId&&items.every(p=>p.groupId===items[0].groupId);}
function hideInspector(){inspectorVisible=false;document.getElementById('selectionTools').classList.remove('show');document.getElementById('selectionBadge').style.display='none';document.getElementById('groupColorPanel').hidden=true;}
function selectionOutlines(items){
 outlinePass.selectedObjects=items.filter(p=>!p.groupId).map(p=>p.root);
 const colors=new Map();for(const p of items){if(p.groupId){const color=colorValue(p.groupColor);if(!colors.has(color))colors.set(color,[]);colors.get(color).push(p.root);}}
 let i=0;for(const [color,objects] of colors){let pass=groupOutlinePasses[i];if(!pass){pass=new OutlinePass(new THREE.Vector2(viewport.clientWidth,viewport.clientHeight),scene,camera);pass.edgeStrength=outlinePass.edgeStrength;pass.edgeGlow=outlinePass.edgeGlow;pass.edgeThickness=outlinePass.edgeThickness;pass.pulsePeriod=0;composer.addPass(pass);groupOutlinePasses.push(pass)}pass.enabled=true;pass.visibleEdgeColor.set(color);pass.hiddenEdgeColor.set(color);pass.selectedObjects=objects;i++;}
 for(;i<groupOutlinePasses.length;i++){groupOutlinePasses[i].enabled=false;groupOutlinePasses[i].selectedObjects=[];}
}
function syncGroupTools(items){
 const key=items.map(p=>p.id).sort().join(',');if(key!==groupSelectionKey){draftGroupColor='#ff66b3';groupSelectionKey=key;}
 const grouped=oneGroup(items),show=items.length>1||grouped;
 document.getElementById('groupTools').hidden=!show;
 document.getElementById('groupBtn').textContent=grouped?'Ungroup':'Group';
 document.getElementById('groupColorBtn').style.background=grouped?colorValue(items[0].groupColor):'';
 document.getElementById('groupColorInput').value=grouped?colorValue(items[0].groupColor):draftGroupColor;
}
function toggleGroup(){const items=currentSelection();if(items.length<2&&!oneGroup(items))return;remember();if(oneGroup(items)){for(const p of items){p.groupId=null;p.groupColor=null;}}else{const id=crypto.randomUUID();for(const p of expandGroups(items)){p.groupId=id;p.groupColor=draftGroupColor;}}inspectorVisible=true;refreshSelectionUI();}
function applyGroupColor(value){value=colorValue(value);draftGroupColor=value;const items=currentSelection();if(oneGroup(items)){remember();for(const p of items)p.groupColor=value;}refreshSelectionUI();}
function transformSelection(entries,dx=0,dz=0,{copy=false,rotate=false}={}){
 if(copy&&entries.length){const minX=Math.min(...entries.map(e=>e.pos.x-dimsFor(e.q).w/2)),maxX=Math.max(...entries.map(e=>e.pos.x+dimsFor(e.q).w/2)),minZ=Math.min(...entries.map(e=>e.pos.z-dimsFor(e.q).d/2)),maxZ=Math.max(...entries.map(e=>e.pos.z+dimsFor(e.q).d/2));dx=THREE.MathUtils.clamp(dx,-1000-minX,1000-maxX);dz=THREE.MathUtils.clamp(dz,-1000-minZ,1000-maxZ);}
 const items=entries.map(e=>e.q),set=new Set(items),before=items.map(q=>({q,pos:q.root.position.clone(),rotation:q.rotation,deckHeight:q.deckHeight}));
 for(const e of entries){e.q.root.position.set(e.pos.x+dx,e.pos.y,e.pos.z+dz);if(e.rotation!=null){e.q.rotation=e.rotation;e.q.root.rotation.y=e.rotation;}}
 const outsiders=placed.filter(q=>!set.has(q)),all=placed.filter(q=>!placingCopies?.includes(q)||set.has(q));
 let valid=items.every(withinGrid)&&!items.some(q=>outsiders.some(other=>collides(q,other)));
 if(valid)for(const q of items){const wanted=q.root.position.clone();if(role(q)==='beam'){valid=beamTarget(q,wanted.x,wanted.z,all.filter(other=>other!==q))&&q.root.position.distanceToSquared(wanted)<.01;}else if(copy&&elevated(q)){valid=bridgeTarget(q,wanted.x,wanted.z,all.filter(other=>other!==q))&&q.root.position.distanceToSquared(wanted)<.01;}q.root.position.copy(wanted);if(!valid)break;}
 if(valid)for(const q of items){if(needsGround(q.asset)){const surf=standingSurface(q,q.root.position.x,q.root.position.z);if(!surf){valid=false;break;}q.root.position.y=surf.y;q.walkTo=null;}}
 if(valid)valid=items.every(withinGrid);
 if(!valid&&!copy)for(const e of before){e.q.root.position.copy(e.pos);e.q.rotation=e.rotation;e.q.root.rotation.y=e.rotation;e.q.deckHeight=e.deckHeight;}
 for(const q of items){q.placementValid=valid||!copy;if(valid)q.lastValidPosition=q.root.position.clone();}
 placementNotice(valid?'':'The whole selection needs a free position; supports must stay on tile seams.');return valid;
}
function moveCopies(g){const a=placingGroupAnchor;if(!a)return;const step=placingCopies.some(q=>!q.asset.noCollision&&role(q)!=='beam')?50:25;const dx=Math.round((g.x-a.x)/step)*step,dz=Math.round((g.z-a.z)/step)*step;transformSelection(a.base.map(b=>({q:b.q,pos:new THREE.Vector3(b.x,b.y||0,b.z)})),dx,dz,{copy:true});}
function rotateObjectOrGroup(p){
 const active=currentSelection();const items=active.includes(p)&&active.length>1?expandGroups(active):groupMembers(p);if(items.some(q=>q.locked))return;
 const before=sceneSnapshot();clearTimeout(rotationFlashTimer);const center=items.reduce((v,q)=>v.add(q.root.position),new THREE.Vector3()).multiplyScalar(1/items.length);if(items.length>1){center.x=Math.round(center.x/50)*50;center.z=Math.round(center.z/50)*50;}
 const entries=items.map(q=>{const dx=q.root.position.x-center.x,dz=q.root.position.z-center.z;return {q,pos:new THREE.Vector3(center.x+dz,q.root.position.y,center.z-dx),rotation:(q.rotation+Math.PI/2)%(Math.PI*2)};});
 if(transformSelection(entries)&&!sameSnapshot(before,sceneSnapshot()))remember(before);
 selectedGroup=new Set(items);selected=items[0];multiMode=false;hideInspector();refreshSelectionUI();rotationFlashTimer=setTimeout(()=>{select(null);rotationFlashTimer=null;},500);
}

const panPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function hitGround(e){pointer(e);return ray.ray.intersectPlane(panPlane,new THREE.Vector3());}
function panView(e){const g=hitGround(e);if(!g||!panLast)return;panSound();const delta=panLast.clone().sub(g);camera.position.add(delta);controls.target.add(delta);controls.update();panLast=hitGround(e);}
function removeSelectionOutline(p){selectionOutlines([]);if(p)p.outline=null}
function refreshSelectionUI(){
 const pin=document.getElementById('pinBtn'),tools=document.getElementById('selectionTools'),multi=document.getElementById('multiBtn');
 const arr=selectedGroup.size?[...selectedGroup]:(selected?[selected]:[]);
 selectionOutlines(arr);syncGroupTools(arr);
 multi.classList.toggle('active',multiMode);multi.textContent='✓';
 if(!arr.length){document.getElementById('selectionBadge').style.display='none';tools.classList.remove('show');pin.classList.remove('locked');return}
 const b=document.getElementById('selectionBadge');
 const assetDisplayName=a=>catalogEscape(a.name);
 const colorDots=()=>'';
 if(arr.length>1){
   b.innerHTML=`<span class="selectionName">${arr.length} OBJECTS</span><span class="selectionMeta">◷ —</span>`;
 }else{
   const a=arr[0].asset;
   b.innerHTML=`<span class="selectionName">${assetDisplayName(a)}</span><span class="selectionMeta">◷ ${a.printTime||'—'} <em>|</em> ${colorDots(a)}</span>${arr[0].locked?'<span class="selectionFixed">FIXED</span>':''}`;
 }
 b.style.display='flex';tools.classList.add('show');pin.classList.toggle('locked',arr.every(p=>p.locked));pin.title=arr.length>1?'Fix / unfix selected objects':(arr[0].locked?'Unfix object':'Fix object');
 if(!inspectorVisible){b.style.display='none';tools.classList.remove('show');}
}
function select(p,additive=false){
 clearTimeout(rotationFlashTimer);rotationFlashTimer=null;hideInspector();
 if(!p){if(additive)return;selected=null;selectedGroup.clear();multiMode=false;refreshSelectionUI();return;}
 const members=groupMembers(p);
 if(multiMode||additive){const remove=members.every(q=>selectedGroup.has(q));for(const q of members){if(remove)selectedGroup.delete(q);else selectedGroup.add(q);}selected=[...selectedGroup][0]||null;}
 else{selectedGroup=new Set(members);selected=p;}
 refreshSelectionUI();
}
async function addAsset(assetId,x=0,z=0,rot=0,selectAfter=false,record=true,restoring=false){const a=byId[assetId];if(record){const requirement=assetRequirement(a);if(requirement){placementNotice(requirement);return null;}}const model=await loadModel(a);if(record)remember();const root=new THREE.Group();root.add(model);root.position.set(x,0,z);root.rotation.y=rot;root.userData.placedId=idSeq;scene.add(root);const p={id:idSeq++,asset:a,root,rotation:rot,locked:false,walkWait:a.walk?1+Math.random()*2:0};if(!restoring)snapPlaced(p,x,z);if(record&&p.placementValid===false){scene.remove(root);return null;}placed.push(p);if(selectAfter)select(p);else if(record)select(null);updateParts();return p}
// Undo stores scene objects and transforms, so restoring is instant and keeps model data.
const undoStack=[];
let placementLoading=false,placementEpoch=0,repeater=false,dragBefore=null;
function sceneSnapshot(){const pending=new Set(placingCopies|| (placingCopy?[placingCopy]:[]));return placed.filter(p=>!pending.has(p)).map(p=>({p,pos:p.root.position.clone(),r:p.rotation,locked:p.locked,deckHeight:p.deckHeight,groupId:p.groupId||null,groupColor:p.groupColor||null}));}
function updateUndo(){document.getElementById('undoBtn').disabled=!undoStack.length&&!placingCopy&&!placingCopies&&!placementLoading;}
function remember(before=sceneSnapshot()){undoStack.push(before);if(undoStack.length>100)undoStack.shift();updateUndo();}
function sameSnapshot(a,b){return a.length===b.length&&a.every((x,i)=>x.p===b[i].p&&x.pos.distanceToSquared(b[i].pos)<.001&&x.r===b[i].r&&x.locked===b[i].locked&&x.groupId===b[i].groupId&&x.groupColor===b[i].groupColor);}
function restoreSnapshot(snapshot){for(const p of placed)scene.remove(p.root);placed=snapshot.map(x=>{x.p.root.position.copy(x.pos);x.p.rotation=x.r;x.p.root.rotation.y=x.r;x.p.locked=x.locked;x.p.groupId=x.groupId;x.p.groupColor=x.groupColor;x.p.deckHeight=x.deckHeight;x.p.lastValidPosition=x.pos.clone();x.p.placementValid=true;x.p.walkTo=null;scene.add(x.p.root);return x.p});select(null);updateParts();}
function setRepeater(on){repeater=on;document.getElementById('repeatStatus').hidden=!on;renderer.domElement.style.cursor=on?'copy':'default';}
function cancelPlacement(){placementNotice('');placementEpoch++;placementLoading=false;const pending=placingCopies||(placingCopy?[placingCopy]:[]);for(const p of pending)scene.remove(p.root);placed=placed.filter(p=>!pending.includes(p));placingCopy=null;placingCopies=null;placingGroupAnchor=null;setRepeater(false);select(null);updateParts();updateUndo();}
function undo(){if(placingCopy||placingCopies||placementLoading){cancelPlacement();return}setRepeater(false);const previous=undoStack.pop();if(previous)restoreSnapshot(previous);dragging=null;draggingGroup=null;dragBefore=null;updateUndo();}
function commitPlacement(e){
 const g=hitGround(e);
 if(g&&placingCopy)snapPlaced(placingCopy,g.x,g.z);
 if(g&&placingCopies&&placingGroupAnchor)moveCopies(g);
 if((placingCopies||(placingCopy?[placingCopy]:[])).some(p=>p.placementValid===false))return;
 remember();placementNotice('');const isCopy=!!placingCopies,committed=placingCopies||(placingCopy?[placingCopy]:[]);
 placingCopy=null;placingCopies=null;placingGroupAnchor=null;openAutoDock();closeAutoDockDelayed();select(null);if(isCopy){selectedGroup=new Set(committed);selected=committed[0]||null;multiMode=committed.length>1&&!oneGroup(committed);hideInspector();refreshSelectionUI();}placementPop();updateParts();updateUndo();
 if(repeater){clipboard=committed.map(p=>({assetId:p.asset.id,x:p.root.position.x,z:p.root.position.z,y:p.root.position.y,r:p.rotation,deckHeight:p.deckHeight,groupId:p.groupId||null,groupColor:p.groupColor||null}));startPasteFromClipboard(true);}else renderer.domElement.style.cursor='default';
}
function currentSelection(){return selectedGroup.size?[...selectedGroup]:(selected?[selected]:[])}
function copySelectionToClipboard(){clipboard=currentSelection().map(p=>({assetId:p.asset.id,x:p.root.position.x,z:p.root.position.z,y:p.root.position.y,r:p.rotation,deckHeight:p.deckHeight,groupId:p.groupId||null,groupColor:p.groupColor||null}));}
async function startPasteFromClipboard(keepSelection=false){
 if(!clipboard.length||placingCopy||placingCopies||placementLoading)return;
 placementLoading=true;const epoch=++placementEpoch,source=clipboard.map(x=>({...x}));updateUndo();
 const cx=source.reduce((s,p)=>s+p.x,0)/source.length,cz=source.reduce((s,p)=>s+p.z,0)/source.length;
 const clones=[],groupCopies=new Map();
 try{for(const src of source){const q=await addAsset(src.assetId,src.x,src.z,src.r,false,false);q.root.position.set(src.x,src.y||0,src.z);q.deckHeight=src.deckHeight;if(src.groupId){if(!groupCopies.has(src.groupId))groupCopies.set(src.groupId,crypto.randomUUID());q.groupId=groupCopies.get(src.groupId);q.groupColor=colorValue(src.groupColor);}clones.push(q);if(epoch!==placementEpoch){for(const p of clones)scene.remove(p.root);placed=placed.filter(p=>!clones.includes(p));updateParts();return;}}
 placingCopies=clones;placingGroupAnchor={x:cx,z:cz,base:clones.map((q,i)=>({q,x:source[i].x,y:source[i].y||0,z:source[i].z}))};
 if(!keepSelection)select(null);renderer.domElement.style.cursor='copy';
 }catch(error){for(const p of clones)scene.remove(p.root);placed=placed.filter(p=>!clones.includes(p));setRepeater(false);updateParts();console.error('Unable to copy model',error);}
 finally{if(epoch===placementEpoch)placementLoading=false;updateUndo();}
}

function findPlacedObject(obj){while(obj&&obj!==scene){const p=placed.find(x=>x.root===obj);if(p)return p;obj=obj.parent}return null}
const marquee=document.getElementById('marqueeSelect');
let marqueeActive=false,marqueeStart=null,marqueeMoved=false,marqueeFinishedAt=0;
function marqueeRectNow(e){
 const r=document.getElementById('viewportWrap').getBoundingClientRect();
 const x1=Math.max(0,Math.min(r.width,marqueeStart.x-r.left)),y1=Math.max(0,Math.min(r.height,marqueeStart.y-r.top));
 const x2=Math.max(0,Math.min(r.width,e.clientX-r.left)),y2=Math.max(0,Math.min(r.height,e.clientY-r.top));
 return {left:Math.min(x1,x2),top:Math.min(y1,y2),right:Math.max(x1,x2),bottom:Math.max(y1,y2)};
}
function drawMarquee(e){const q=marqueeRectNow(e);marquee.style.left=q.left+'px';marquee.style.top=q.top+'px';marquee.style.width=(q.right-q.left)+'px';marquee.style.height=(q.bottom-q.top)+'px';marqueeMoved=(q.right-q.left)>4||(q.bottom-q.top)>4;}
function finishMarquee(e){
 marqueeFinishedAt=performance.now();
 const q=marqueeRectNow(e),rr=renderer.domElement.getBoundingClientRect(),wrap=document.getElementById('viewportWrap').getBoundingClientRect();
 const hits=[];
 for(const p of placed){
  const box=new THREE.Box3().setFromObject(p.root),c=new THREE.Vector3();box.getCenter(c);c.project(camera);
  const sx=(c.x*.5+.5)*rr.width+(rr.left-wrap.left),sy=(-c.y*.5+.5)*rr.height+(rr.top-wrap.top);
  if(sx>=q.left&&sx<=q.right&&sy>=q.top&&sy<=q.bottom)hits.push(p);
 }
 const expanded=expandGroups(hits);selectedGroup=new Set(expanded);selected=expanded[0]||null;multiMode=expanded.length>1&&!oneGroup(expanded);inspectorVisible=expanded.length>0;refreshSelectionUI();
 marqueeActive=false;marqueeStart=null;marqueeMoved=false;marquee.classList.remove('show');renderer.domElement.style.cursor='default';
}
// Touch controls: one finger selects/drags objects or pans empty space; two fingers zoom + pan.
// A long press on an object rotates it 90 degrees.
const activeTouchPointers=new Set();
let touchHoldTimer=null,touchHoldStart=null,touchHoldObject=null,touchHoldTriggered=false;
function cancelTouchHold(){if(touchHoldTimer){clearTimeout(touchHoldTimer);touchHoldTimer=null}touchHoldStart=null;touchHoldObject=null}
renderer.domElement.addEventListener('pointerdown',e=>{
 clearTimeout(rotationFlashTimer);rotationFlashTimer=null;
 if(e.pointerType==='touch'){activeTouchPointers.add(e.pointerId);if(activeTouchPointers.size>1){cancelTouchHold();dragging=null;draggingGroup=null;dragBefore=null;pointerGesture=null;hideInspector();return;}}
 if(e.button===1){e.preventDefault();hideInspector();pointerGesture=null;panning=true;panLast=hitGround(e);renderer.domElement.style.cursor='grabbing';renderer.domElement.setPointerCapture?.(e.pointerId);return;}
 if(e.button===2){pointer(e);const hit=ray.intersectObjects(placed.map(p=>p.root),true)[0];if(!hit){e.preventDefault();hideInspector();marqueeActive=true;marqueeMoved=false;marqueeStart={x:e.clientX,y:e.clientY};marquee.classList.add('show');drawMarquee(e);renderer.domElement.setPointerCapture?.(e.pointerId)}return;}
 if(e.button!==0||placementLoading)return;
 if(placingCopies||placingCopy){commitPlacement(e);return;}
 dragBefore=sceneSnapshot();pointer(e);const hit=ray.intersectObjects(placed.map(p=>p.root),true)[0],p=hit?findPlacedObject(hit.object):null;
 pointerGesture={x:e.clientX,y:e.clientY,moved:false,p};hideInspector();
 if(p){
  if(e.shiftKey){select(p,true);return;}
  if(!selectedGroup.has(p))select(p);
  else{selected=p;refreshSelectionUI();}
  if(e.pointerType==='touch'){touchHoldStart={x:e.clientX,y:e.clientY};touchHoldObject=p;touchHoldTriggered=false;touchHoldTimer=setTimeout(()=>{if(!touchHoldObject)return;touchHoldTriggered=true;dragging=null;draggingGroup=null;dragBefore=null;pointerGesture=null;rotateObjectOrGroup(touchHoldObject);},560);}
  const items=currentSelection();if(items.some(q=>q.locked))return;
  const g=hitGround(e);
  if(items.length>1){draggingGroup=items;dragGroupStart={ground:g?.clone()||null,items:items.map(q=>({q,pos:q.root.position.clone()}))};}
  else{dragging=p;dragStartPos=p.root.position.clone();if(g)offset.copy(p.root.position).sub(g);}
  renderer.domElement.setPointerCapture?.(e.pointerId);
 }else{select(null,e.shiftKey);panning=true;panLast=hitGround(e);renderer.domElement.style.cursor='grabbing';renderer.domElement.setPointerCapture?.(e.pointerId);}
});
window.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch'){if(activeTouchPointers.size>1)return;if(touchHoldStart&&Math.hypot(e.clientX-touchHoldStart.x,e.clientY-touchHoldStart.y)>7)cancelTouchHold();}
 if(marqueeActive){drawMarquee(e);if(marqueeMoved)panSound();return;}if(e.buttons&4){if(panning)panView(e);return;}
 if(placingCopies&&placingGroupAnchor){const g=hitGround(e);if(g)moveCopies(g);return;}
 if(placingCopy){const g=hitGround(e);if(g)snapPlaced(placingCopy,g.x,g.z);return;}
 if(pointerGesture&&Math.hypot(e.clientX-pointerGesture.x,e.clientY-pointerGesture.y)>4){pointerGesture.moved=true;hideInspector();}
 if(pointerGesture&&!pointerGesture.moved)return;
 if(draggingGroup&&dragGroupStart){const g=hitGround(e);if(g&&dragGroupStart.ground){const step=draggingGroup.some(q=>!q.asset.noCollision&&role(q)!=='beam')?50:25;const dx=Math.round((g.x-dragGroupStart.ground.x)/step)*step,dz=Math.round((g.z-dragGroupStart.ground.z)/step)*step;transformSelection(dragGroupStart.items,dx,dz);}return;}
 if(dragging){const g=hitGround(e);if(g)snapPlaced(dragging,g.x+offset.x,g.z+offset.z);return;}
 if(panning&&panLast)panView(e);
});
window.addEventListener('pointerup',e=>{
 if(e.pointerType==='touch'){activeTouchPointers.delete(e.pointerId);cancelTouchHold();if(touchHoldTriggered){touchHoldTriggered=false;return;}}
 if(e.button===2&&marqueeActive){if(marqueeMoved)finishMarquee(e);else{marqueeActive=false;marqueeStart=null;marquee.classList.remove('show');}return;}
 if(e.button===1){panning=false;panLast=null;renderer.domElement.style.cursor='default';try{renderer.domElement.releasePointerCapture(e.pointerId)}catch(_){}return;}
 if(e.button!==0)return;
 if(dragBefore&&!sameSnapshot(dragBefore,sceneSnapshot()))remember(dragBefore);
 if(pointerGesture?.moved){if(dragging||draggingGroup)placementPop();const items=currentSelection();if(!(items.length>1&&items.every(p=>!p.groupId)))select(null);hideInspector();}
 else if(pointerGesture?.p){inspectorVisible=true;refreshSelectionUI();}
 pointerGesture=null;dragBefore=null;dragging=null;dragStartPos=null;draggingGroup=null;dragGroupStart=null;panning=false;panLast=null;renderer.domElement.style.cursor=repeater?'copy':'default';
 try{renderer.domElement.releasePointerCapture?.(e.pointerId)}catch(_){}
});
window.addEventListener('pointercancel',e=>{activeTouchPointers.delete(e.pointerId);cancelTouchHold();if(dragBefore)restoreSnapshot(dragBefore);dragBefore=null;pointerGesture=null;dragging=null;draggingGroup=null;panning=false;panLast=null;hideInspector();});
renderer.domElement.addEventListener('contextmenu',e=>{e.preventDefault();if(placingCopy){placingCopy.rotation=(placingCopy.rotation+Math.PI/2)%(Math.PI*2);placingCopy.root.rotation.y=placingCopy.rotation;const g=hitGround(e);if(g)snapPlaced(placingCopy,g.x,g.z);placementPop();return;}if(performance.now()-marqueeFinishedAt<250||marqueeMoved||marqueeActive||placementLoading||placingCopies)return;pointer(e);const h=ray.intersectObjects(placed.map(p=>p.root),true)[0],p=h?findPlacedObject(h.object):null;if(p){rotateObjectOrGroup(p);placementPop();}else uiClick();});
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'){cancelPlacement();document.activeElement?.blur();return;}
 if(document.activeElement.matches('input,textarea,select,[contenteditable=true]'))return;
 if(document.querySelector('.helpOverlay.open'))return;
 if(((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey)||e.key==='Backspace'){e.preventDefault();undo();return;}
 if(placementLoading||placingCopy||placingCopies)return;
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='c'){if(currentSelection().length){e.preventDefault();copySelectionToClipboard();uiClick?.();}return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='v'){if(clipboard.length){e.preventDefault();startPasteFromClipboard();}return}
 if(e.key==='Delete'){const arr=currentSelection().filter(p=>!p.locked);if(arr.length){e.preventDefault();remember();deleteCrumble();for(const p of arr)scene.remove(p.root);placed=placed.filter(p=>!arr.includes(p));selected=null;selectedGroup.clear();multiMode=false;refreshSelectionUI();updateParts()}}
});
viewport.addEventListener('dragover',e=>e.preventDefault());viewport.addEventListener('drop',async e=>{e.preventDefault();const id=e.dataTransfer.getData('asset-id');if(!id)return;cancelPlacement();const g=hitGround(e);await addAsset(id,g?.x||0,g?.z||0);placementPop()});
function assetColors(a){
 return a.kind==='road'?['#d7d8d6','#6d7174','#f5f5ef']:
 a.kind==='grass'?['#79c94b','#4fa83b']:
 a.kind==='transition'?['#79c94b','#3f9de2']:
 a.kind==='house'?['#7f2e29','#34383a','#65a744','#d6d1c5']:
 a.kind==='character'?['#e3a06d','#444b4f','#8b603e']:['#bfc8cd'];
}
function partColorDots(a){return `<span class="partColors">${assetColors(a).map(c=>`<i style="background:${c}"></i>`).join('')}</span>`}
function connectorBase(p){return ['Streets','Terrain','Bridges'].includes(p.asset.cat)&&!p.asset.noCollision}
function connectorPinStats(){
 const bases=placed.filter(connectorBase),byAsset={},eps=.5;let total=0;
 for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++){
  const a=bases[i],b=bases[j],da=dimsFor(a),db=dimsFor(b);
  const ax0=a.root.position.x-da.w/2,ax1=a.root.position.x+da.w/2,az0=a.root.position.z-da.d/2,az1=a.root.position.z+da.d/2;
  const bx0=b.root.position.x-db.w/2,bx1=b.root.position.x+db.w/2,bz0=b.root.position.z-db.d/2,bz1=b.root.position.z+db.d/2;
  let overlap=0;
  if(Math.abs(ax1-bx0)<=eps||Math.abs(bx1-ax0)<=eps) overlap=Math.max(0,Math.min(az1,bz1)-Math.max(az0,bz0));
  else if(Math.abs(az1-bz0)<=eps||Math.abs(bz1-az0)<=eps) overlap=Math.max(0,Math.min(ax1,bx1)-Math.max(ax0,bx0));
  if(overlap<49.5)continue;
  // One connector per 5 cm shared section. A full 10×10-to-10×10 edge uses
  // the two outer connectors; its middle slot intentionally stays free.
  const pins=Math.max(1,Math.round(overlap/50));
  total+=pins;
  // Attribute each physical connection once in the BOM so row values add up to TOTAL.
  const owner=a.id<=b.id?a:b;
  byAsset[owner.asset.id]=(byAsset[owner.asset.id]||0)+pins;
 }
 return {total,byAsset};
}
async function updateParts(){
 const counts={};sceneSnapshot().forEach(({p})=>counts[p.asset.id]=(counts[p.asset.id]||0)+1);
 const pinStats=connectorPinStats();
 const list=document.getElementById('partsList');list.innerHTML='';
 for(const [id,n] of Object.entries(counts)){
  const a=byId[id]; if(!a)continue;
  const tr=document.createElement('tr');tr.className='partTableRow';
  tr.innerHTML=`<td><div class="partThumb"></div></td><td class="partName"><b>${catalogEscape(a.name)}</b><small>${a.w/10}×${a.d/10} cm</small></td><td>×${n}</td><td>${pinStats.byAsset[id]||'—'}</td><td>${partColorDots(a)}</td><td>${a.printTime||'—'}</td><td>${a.weightG!=null?(a.weightG*n)+' g':'—'}</td>`;
  tr.insertAdjacentHTML('beforeend',`<td>${platformLink(a.makerworld,'MakerWorld','makerworld-icon.ico')}</td><td>${platformLink(a.snapmaker,'Snapmaker','snapmaker-icon.webp')}</td>`);
  list.appendChild(tr);
  const holder=tr.querySelector('.partThumb');
  if(thumbCache.has(a.id)){const im=new Image();im.src=thumbCache.get(a.id);im.alt=a.name;holder.appendChild(im)}else{try{await makeDockThumb(holder,a)}catch(e){holder.textContent='◻'}}
 }
 document.getElementById('placedTotal').textContent=Object.values(counts).reduce((a,b)=>a+b,0);
 document.getElementById('pinTotal').textContent=pinStats.total;
 const used=[...new Set(Object.keys(counts).flatMap(id=>assetColors(byId[id]||{})))];
 const ct=document.getElementById('colorTotal');if(ct)ct.innerHTML=`<span class="partColors">${used.map(c=>`<i style="background:${c}"></i>`).join('')}</span>`;
 const allWeight=Object.entries(counts).every(([id])=>Number.isFinite(byId[id]?.weightG));
 document.getElementById('weightTotal').textContent=allWeight?Object.entries(counts).reduce((s,[id,n])=>s+byId[id].weightG*n,0)+' g':'—';
 document.getElementById('timeTotal').textContent='—';
}
function createAssetCard(a){
 const card=document.createElement('div');card.className='assetCard';card.draggable=true;
 card.innerHTML=`<div class="thumb"></div><div class="assetMeta"><b>${catalogEscape(a.name)}</b><span>${a.w/10}×${a.d/10} cm · ${a.level} mm</span></div>`;
 card.addEventListener('dragstart',e=>e.dataTransfer.setData('asset-id',a.id));card.addEventListener('dblclick',()=>addAsset(a.id));
 makeThumb(card.querySelector('.thumb'),a);return card;
}
async function makeThumb(el,a){
 // Render once, then dispose the temporary WebGL context. This prevents thumbnail clicks
 // from eventually killing the main world/grid WebGL context.
 const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(120,86);el.appendChild(r.domElement);
 const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x999999,2.5));const obj=await loadModel(a);s.add(obj);
 const box=new THREE.Box3().setFromObject(obj),size=new THREE.Vector3();box.getSize(size);const max=Math.max(size.x,size.y,size.z)||100;
 const c=new THREE.OrthographicCamera(-max,max,max*.72,-max*.72,.1,2000);c.position.set(max*1.4,max*1.3,max*1.4);c.lookAt(0,size.y*.25,0);r.render(s,c);
 const img=document.createElement('img');img.src=r.domElement.toDataURL('image/png');img.alt=a.name;img.className='thumbImage';el.replaceChildren(img);r.dispose();r.forceContextLoss?.();
}
const categoryTree=[
{name:'Streets',icon:'🛣️',subs:['Double','Single']},
{name:'Terrain',icon:'🏞️',subs:['Grass','Water','Sand','Grass on Water','Grass on Sand','Sand on Water','Pavement','Stone']},
{name:'Bridges',icon:'🌉'},
{name:'Fences',icon:'🧱'},
{name:'Houses',icon:'🏘️',subs:['Social','Work']},
{name:'Characters',label:'FIGURES',icon:'👨‍👩‍👧‍👦',subs:['Social','Work']},
{name:'Animals',icon:'🐾'},
{name:'Vehicles',icon:'🚗'},
{name:'Objects',icon:'📦'}
];
const dockItems=document.getElementById('dockItems');
const dockBack=document.getElementById('dockBack');
let dockPath=[];
const thumbCache=new Map();
function dockCategoryLabel(label){
 return '<span class="dockCategoryText">'+String(label).replace(/ on /i,' ON<br>').replace(/ \/ /g,'<br>')+'</span>';
}
function dockButton(label,icon,onClick,cls=''){
 const b=document.createElement('button');b.className='dockItem '+cls;
 b.innerHTML=`<span class="dockIcon">${icon}</span><span class="dockLabel">${dockCategoryLabel(label)}</span>`;
 b.onclick=()=>{const r=b.getBoundingClientRect();dockTransitionOriginX=r.left+r.width/2;b.classList.remove('dock-pop');void b.offsetWidth;b.classList.add('dock-pop');setTimeout(onClick,150)};return b;
}
function assetDockLabel(a){
 if(a.label)return catalogLabel(a.label);
 const name=a.name||a.file.split('/').pop().replace(/\.[^.]+$/,'');
 const match=name.match(/^(\d+(?:\.\d+)?[x×]\d+(?:\.\d+)?)\s+(.+)$/i);
 if(!match)return catalogEscape(name);
 const rest=match[2],shape=rest.match(/^(.*?)\s+(Straight|End|T|X|90|Inner Corner|Outer Corner)$/i);
 return catalogLabel([match[1],...(shape?[shape[1],shape[2]]:[rest])].join(' / '));
}
async function previewDockButton(label,previewAssets,onClick){
 const b=document.createElement('button');b.className='dockItem dockPreviewCategory';
 b.innerHTML=`<span class="dockMosaic"></span><span class="dockLabel">${dockCategoryLabel(label)}</span>`;
 const mosaic=b.querySelector('.dockMosaic');
 const srcs=previewAssets.length?[...previewAssets]:[];
 for(let i=0;i<4;i++){const a=srcs[i];
   const cell=document.createElement('span');cell.className='dockMosaicCell';mosaic.appendChild(cell);if(!a)continue;
   const src=thumbCache.get(a.id)||a.preview||(a.previewReady?a.previewFile:'');if(src){const im=new Image();im.src=src.startsWith('data:')||src.includes('?')?src:src+'?v='+encodeURIComponent(a.thumbKey||'');im.draggable=false;im.onerror=()=>im.remove();cell.appendChild(im)}
 }
 b.onclick=()=>{const r=b.getBoundingClientRect();dockTransitionOriginX=r.left+r.width/2;b.classList.remove('dock-pop');void b.offsetWidth;b.classList.add('dock-pop');setTimeout(onClick,150)};
 return b;
}
async function startDockAssetPlacement(a){
 const requirement=assetRequirement(a);if(requirement){placementNotice(requirement);return;}
 if(placingCopy||placingCopies||placementLoading)return;
 openAutoDock();setRepeater(false);placementLoading=true;const epoch=++placementEpoch;updateUndo();
 try{const q=await addAsset(a.id,controls.target.x,controls.target.z,0,false,false);
 if(epoch!==placementEpoch){scene.remove(q.root);placed=placed.filter(p=>p!==q);updateParts();return;}
 placingCopy=q;select(null);renderer.domElement.style.cursor='copy';
 }catch(error){console.error('Unable to place model',error);}finally{if(epoch===placementEpoch)placementLoading=false;updateUndo();}
}
async function assetDockButton(a){
 const b=document.createElement('div');b.className='dockItem dockAsset';b.draggable=true;b.title=a.name;
 b.innerHTML=`<div class="dockThumb"></div><span class="dockLabel">${assetDockLabel(a)}</span>`;
 b.draggable=false;b.style.touchAction='none';
 let gesture=null,suppressClick=false;
 b.addEventListener('dragstart',e=>e.preventDefault());
 b.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();gesture={x:e.clientX,y:e.clientY,started:false,last:e};b.setPointerCapture(e.pointerId);});
 b.addEventListener('pointermove',e=>{if(!gesture)return;gesture.last=e;if(!gesture.started&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>4){gesture.started=true;gesture.ready=startDockAssetPlacement(a).then(()=>{if(gesture&&placingCopy){const g=hitGround(gesture.last);if(g)snapPlaced(placingCopy,g.x,g.z);}});}});
 b.addEventListener('pointerup',async e=>{const active=gesture;if(!active)return;suppressClick=true;setTimeout(()=>suppressClick=false,0);if(active.started){await active.ready;const rect=renderer.domElement.getBoundingClientRect();if(e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom&&!document.elementFromPoint(e.clientX,e.clientY)?.closest('#assetDock'))commitPlacement(e);}else await startDockAssetPlacement(a);gesture=null;try{b.releasePointerCapture(e.pointerId)}catch(_){};});
 b.addEventListener('pointercancel',()=>{gesture=null;cancelPlacement();});
 b.addEventListener('click',()=>{if(!suppressClick&&!gesture)startDockAssetPlacement(a);});
 const holder=b.querySelector('.dockThumb');
 if(thumbCache.has(a.id)){const im=new Image();im.src=thumbCache.get(a.id);holder.appendChild(im)}else makeDockThumb(holder,a);
 return b;
}
let dockThumbQueue=Promise.resolve();
function makeDockThumb(el,a){dockThumbQueue=dockThumbQueue.then(()=>renderDockThumb(el,a)).catch(error=>console.warn(error));return dockThumbQueue;}
async function renderDockThumb(el,a){
 const imagePath=a.preview||(a.previewReady?a.previewFile:null);
 if(imagePath){
   try{const im=new Image();im.src=imagePath+'?v='+encodeURIComponent(a.thumbKey||assetCatalog?.revision||'');await im.decode();el.appendChild(im);thumbCache.set(a.id,im.src);return}catch(error){console.warn('Saved preview unavailable; rendering model.',a.id)}
 }

 let r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(116,82);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x999999,2.5));const obj=await loadModel(a);sc.add(obj);
 const box=new THREE.Box3().setFromObject(obj),size=new THREE.Vector3();box.getSize(size);const max=Math.max(size.x,size.y,size.z)||100;
 const c=new THREE.OrthographicCamera(-max,max,max*.72,-max*.72,.1,2000);c.position.set(max*1.4,max*1.3,max*1.4);c.lookAt(0,size.y*.25,0);r.render(sc,c);
 const src=r.domElement.toDataURL('image/png');thumbCache.set(a.id,src);const im=new Image();im.src=src;el.appendChild(im);}catch(error){console.warn('Thumbnail unavailable:',a.id,error);el.textContent='□';el.title='Preview unavailable';}finally{r?.dispose();r?.forceContextLoss?.();}
}
let dockTransitionOriginX=null;
let dockRenderSeq=0;
const dockCategoryCache=new Map();
const dockLayouts=new Map();
let dockOriginX=null;
let dockDirection=null;
async function renderDock(){
 const renderSeq=++dockRenderSeq;
 dockItems.style.visibility='hidden';
 dockBack.style.visibility='hidden';
 if(!dockPath.length){dockOriginX=null;dockDirection=null;dockTransitionOriginX=null;}
 else if(dockTransitionOriginX!=null){
   dockOriginX=dockTransitionOriginX;
   const bounds=document.getElementById('assetDock').parentElement.getBoundingClientRect();
   if(!dockDirection) dockDirection=dockOriginX<(bounds.left+bounds.right)/2?'right':'left';
 }
 const pathKey=dockPath.join('/');
 if(dockTransitionOriginX!=null||!dockLayouts.has(pathKey))dockLayouts.set(pathKey,{origin:dockOriginX,direction:dockDirection});
 else{const saved=dockLayouts.get(pathKey);dockOriginX=saved.origin;dockDirection=saved.direction;}
 dockTransitionOriginX=null;
 dockItems.innerHTML='';dockBack.classList.toggle('show',dockPath.length>0);
 if(assetCatalog){await renderCatalogDock(renderSeq);return;}
 if(!dockPath.length){
   for(const c of categoryTree){
     const catAssets=assets.filter(a=>a.cat===c.name);
     if(c.name==='Streets'||c.name==='Terrain'||c.name==='Houses'||c.name==='Fences'||c.name==='Characters'){
       dockItems.appendChild(dockButton(c.label||c.name,c.icon,()=>{dockPath=[c.name];renderDock()}));
     }else if(catAssets.length){
       let previews=catAssets;
       if(c.name==='Terrain'){
         const grass=assets.find(a=>a.id==='grass-5');
         const transition=assets.find(a=>a.sub==='Grass on Water');
         previews=[grass,transition].filter(Boolean);
       }
       {const node=await previewDockButton(c.label||c.name,previews,()=>{dockPath=[c.name];renderDock()});if(renderSeq!==dockRenderSeq)return;dockItems.appendChild(node);}
     }else dockItems.appendChild(dockButton(c.label||c.name,c.icon,()=>{dockPath=[c.name];renderDock()}));
   }
   animateDockFromOrigin();return
 }
 const cat=categoryTree.find(c=>c.name===dockPath[0]);
 if(dockPath.length===1&&cat?.subs){
   for(const sub of cat.subs){
     const subAssets=assets.filter(a=>a.cat===cat.name&&a.sub===sub),count=subAssets.length;
     if(cat.name==='Terrain'&&(sub==='Grass'||sub==='Grass on Water')&&count){
       {const node=await previewDockButton(sub,subAssets,()=>{dockPath=[cat.name,sub];renderDock()});if(renderSeq!==dockRenderSeq)return;dockItems.appendChild(node);}
     }else if(cat.name==='Streets'){
       {const node=await previewDockButton(sub==='Double'?'TWO / LANE':'ONE / LANE',count?subAssets:assets.filter(a=>a.cat==='Streets'),()=>{dockPath=[cat.name,sub];renderDock()});if(renderSeq!==dockRenderSeq)return;dockItems.appendChild(node);}
     }else {
       const subLabel=cat.name==='Streets'&&sub==='Single'?'ONE / LANE':sub;
       dockItems.appendChild(dockButton(subLabel,terrainIcon(sub),()=>{dockPath=[cat.name,sub];renderDock()},count?'hasAssets':''));
     }
   }
   animateDockFromOrigin();return
 }
 const list=assets.filter(a=>a.cat===dockPath[0]&&(dockPath.length<2||a.sub===dockPath[1]));
 if(!list.length){const e=document.createElement('div');e.className='dockEmpty';e.textContent='No assets yet';dockItems.appendChild(e);animateDockFromOrigin();return}
 for(const a of list){const node=await assetDockButton(a);if(renderSeq!==dockRenderSeq)return;dockItems.appendChild(node);}
 animateDockFromOrigin();
}
async function renderCatalogDock(renderSeq){
 const current=dockPath.join('/');
 const cached=dockCategoryCache.get(current);if(cached){dockItems.append(...cached);animateDockFromOrigin();return;}
 const folders=assetCatalog.folders.filter(f=>!f.missing&&f.path.split('/').slice(0,-1).join('/')===current).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name));
 for(const folder of folders){
   let children=assets.filter(a=>a.enabled!==false&&(a.folderPath===folder.path||a.folderPath.startsWith(folder.path+'/')));

   const open=()=>{dockPath=folder.path.split('/');renderDock()};
   let node;
   if(folder.mode==='image'&&folder.preview){
     node=dockButton('', '',open);const img=new Image();img.src=folder.preview+'?v='+assetCatalog.revision;img.alt='';img.style.cssText='width:100%;height:100%;object-fit:contain';node.querySelector('.dockIcon').appendChild(img);
   }else if((folder.mode==='mosaic'||!folder.icon||folder.icon==='✨')){node=await previewDockButton('',children,open)}
   else node=dockButton('',catalogEscape(folder.icon||'📂'),open);
   node.querySelector('.dockLabel').innerHTML=catalogLabel(folder.name);
   if(renderSeq!==dockRenderSeq)return;
   dockItems.appendChild(node);
 }
 for(const asset of assets.filter(a=>a.enabled!==false&&a.folderPath===current).sort((a,b)=>(a.order??1000000)-(b.order??1000000)||a.file.localeCompare(b.file,undefined,{numeric:true}))){
   const node=await assetDockButton(asset);if(renderSeq!==dockRenderSeq)return;dockItems.appendChild(node);
 }
 if(!dockItems.children.length){const empty=document.createElement('div');empty.className='dockEmpty';empty.textContent='No assets yet';dockItems.appendChild(empty)}
 if(renderSeq===dockRenderSeq){dockCategoryCache.set(current,[...dockItems.childNodes]);animateDockFromOrigin();}
}
function animateDockFromOrigin(){
 dockItems.scrollLeft=0;
 positionDockBack();
 dockItems.style.visibility='';
 dockBack.style.visibility='';
}
function positionDockBack(){
 // Lay out the complete row, including BACK, before clamping to the viewport.
 const dock=document.getElementById('assetDock');
 const bounds=dock.parentElement.getBoundingClientRect();
 const nested=dockPath.length>0;
 dock.dataset.flow=nested?(dockDirection||'right'):'home';
 dockItems.style.transform='';
 dockItems.style.opacity='1';
 dockBack.style.position='';dockBack.style.left='';dockBack.style.right='';dockBack.style.transform='';
 dock.style.setProperty('--dock-limit',Math.max(0,bounds.width-36)+'px');
 const width=dock.getBoundingClientRect().width;
 let left=(bounds.width-width)/2;
 if(nested&&dockItems.firstElementChild){
   const first=dockItems.firstElementChild.getBoundingClientRect();
   const row=dock.getBoundingClientRect();
   // Align the first entry with its parent icon; mirror the row on the right.
   left=(dockOriginX??(bounds.left+bounds.width/2))-bounds.left-(first.left+first.width/2+dockItems.scrollLeft-row.left);
 }
 left=Math.max(18,Math.min(bounds.width-18-width,left));
 dock.style.left=left+'px';
}
window.addEventListener('resize',()=>positionDockBack());
document.fonts?.ready.then(()=>positionDockBack());

function terrainIcon(n){return ({Grass:'🌿',Water:'💧',Sand:'🏖️','Grass on Water':'🌿💧','Grass on Sand':'🌿🏖️','Sand on Water':'🏖️💧',Pavement:'🧱',Single:'🛣️',Double:'🛣️'})[n]||'✨'}
dockBack.onclick=()=>{if(assetCatalog)dockPath.pop();else dockPath=[];dockTransitionOriginX=null;dockItems.style.transform='';renderDock()};
// When a nested asset library is open, clicking anywhere outside the dock returns it to the main categories.
document.addEventListener('pointerdown',e=>{if(!dockPath.length||e.target.closest?.('#assetDock')||placingCopy||placingCopies||placementLoading)return;closeAutoDockDelayed();},true);
renderDock();
// Stable delayed autohide dock. Entering the bottom hotspot opens it; leaving waits before closing.
const assetDockEl=document.getElementById('assetDock');
const dockHotZone=document.getElementById('dockHotZone');
let dockHideTimer=null;
let dockAutoHide=true;try{dockAutoHide=localStorage.getItem('mlw-dock-autohide')!=='false'}catch(_){}
const DOCK_HIDE_DELAY=1100;
function openAutoDock(){clearTimeout(dockHideTimer);dockHideTimer=null;assetDockEl.classList.add('dock-open')}
function closeAutoDockNow(){
 if(!dockAutoHide)return;
 if(placingCopy||placingCopies||placementLoading){openAutoDock();return;}
 clearTimeout(dockHideTimer);dockHideTimer=null;
 // Always restore the main category page as the dock starts going down.
 dockPath=[];dockTransitionOriginX=null;positionDockBack(innerWidth/2);
 renderDock();
 assetDockEl.classList.remove('dock-open');
}
function closeAutoDockDelayed(){if(!dockAutoHide)return;clearTimeout(dockHideTimer);dockHideTimer=setTimeout(closeAutoDockNow,DOCK_HIDE_DELAY)}
dockHotZone?.addEventListener('pointerenter',openAutoDock);
dockHotZone?.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){e.preventDefault();openAutoDock();}});
assetDockEl?.addEventListener('pointerenter',openAutoDock);
assetDockEl?.addEventListener('pointerleave',closeAutoDockDelayed);
dockHotZone?.addEventListener('pointerleave',()=>{if(!assetDockEl.matches(':hover'))closeAutoDockDelayed()});
// Cancel a pending close whenever the pointer comes back near the bottom.
document.addEventListener('pointermove',e=>{if(e.clientY>=window.innerHeight-26)openAutoDock()},{passive:true});

grid.visible=true;
const partsBtn=document.getElementById('partsBtn');
const partsOverlay=document.getElementById('partsOverlay');
const partsClose=document.getElementById('partsClose');
function setParts(open){partsOverlay.classList.toggle('open',open);partsOverlay.setAttribute('aria-hidden',String(!open));if(open)updateParts()}
partsBtn.addEventListener('click',()=>setParts(true));partsClose.addEventListener('click',()=>setParts(false));partsOverlay.addEventListener('click',e=>{if(e.target===partsOverlay)setParts(false)});
document.getElementById('clearBtn').onclick=()=>{cancelPlacement();if(placed.length)remember();placed.forEach(p=>scene.remove(p.root));placed=[];select(null);updateParts()};
function projectData(){return {version:2,placed:sceneSnapshot().map(({p})=>({assetId:p.asset.id,x:p.root.position.x,z:p.root.position.z,r:p.rotation,y:p.root.position.y,deckHeight:p.deckHeight,locked:!!p.locked,groupId:p.groupId||null,groupColor:p.groupColor||null}))}}
async function loadProjectData(d){
 if(!d||!Array.isArray(d.placed)||d.placed.some(p=>!byId[p.assetId]))throw Error('Invalid project or missing assets');
 cancelPlacement();const before=sceneSnapshot();placementLoading=true;const epoch=++placementEpoch;updateUndo();
 try{placed.forEach(p=>scene.remove(p.root));placed=[];
 for(const p of d.placed){const q=await addAsset(p.assetId,p.x,p.z,p.r,false,false,true);q.locked=!!p.locked;q.groupId=typeof p.groupId==='string'?p.groupId:null;q.groupColor=q.groupId?colorValue(p.groupColor):null;if(Number.isFinite(p.y)&&role(q)!=='beam')q.root.position.y=p.y;if(Number.isFinite(p.deckHeight))q.deckHeight=p.deckHeight;q.lastValidPosition=q.root.position.clone();q.placementValid=true;}
 for(const q of placed.filter(p=>role(p)==='beam'))snapPlaced(q,q.root.position.x,q.root.position.z);
 // Reconnect moving actors only once the entire saved world exists.
 for(const q of placed){
  if(isVehicle(q)){const pos=q.root.position.clone(),rotation=q.rotation;q.drive=null;vehicleTarget(q,pos.x,pos.z,true);if(q.locked){q.root.position.copy(pos);q.rotation=rotation;q.root.rotation.y=rotation;}}
  if(q.asset.walk){q.walkTo=null;q.walkFrom=null;q.walkT=0;q.walkWait=.2+Math.random()*.4;}
  q.lastValidPosition=q.root.position.clone();
 }

 if(epoch!==placementEpoch){restoreSnapshot(before);return;}
 remember(before);select(null);
 }catch(error){restoreSnapshot(before);throw error;}finally{placementLoading=false;updateParts();updateUndo();}
}

function safeProjectName(){return 'my-little-world'}
async function saveProjectFile(){const text=JSON.stringify(projectData(),null,2);try{if(window.showSaveFilePicker){const h=await showSaveFilePicker({suggestedName:safeProjectName()+'.mlw',types:[{description:'My Little World project',accept:{'application/json':['.mlw','.json']}}]});const w=await h.createWritable();await w.write(text);await w.close();return}const blob=new Blob([text],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=safeProjectName()+'.mlw';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){if(e?.name!=='AbortError')console.error(e)}}
async function openProjectFile(){try{let file;if(window.showOpenFilePicker){const [h]=await showOpenFilePicker({multiple:false,types:[{description:'My Little World project',accept:{'application/json':['.mlw','.json']}}]});file=await h.getFile()}else{file=await new Promise(resolve=>{const i=document.createElement('input');i.type='file';i.accept='.mlw,.json,application/json';i.onchange=()=>resolve(i.files?.[0]);i.click()})}if(!file)return;await loadProjectData(JSON.parse(await file.text()))}catch(e){if(e?.name!=='AbortError')console.error(e)}}
document.getElementById('saveBtn').onclick=saveProjectFile;document.getElementById('loadBtn').onclick=openProjectFile;
document.getElementById('centerBtn').onclick=()=>{camera.position.set(700,700,700);camera.zoom=1;camera.updateProjectionMatrix();controls.target.set(0,0,0);controls.update();};

document.getElementById('groupBtn').onclick=toggleGroup;
document.getElementById('groupColorBtn').onclick=()=>{const panel=document.getElementById('groupColorPanel');panel.hidden=!panel.hidden;};
document.getElementById('groupColorInput').onchange=e=>applyGroupColor(e.target.value);
document.getElementById('groupEyedropper').hidden=!('EyeDropper' in window);
document.getElementById('groupEyedropper').onclick=async()=>{try{const result=await new EyeDropper().open();applyGroupColor(result.sRGBHex);}catch(error){if(error.name!=='AbortError')console.warn(error);}};
document.getElementById('groupTools').addEventListener('pointerdown',e=>e.stopPropagation());
const multiBtn=document.getElementById('multiBtn');
multiBtn.addEventListener('pointerdown',e=>e.stopPropagation());
multiBtn.addEventListener('click',e=>{e.stopPropagation();multiMode=!multiMode;if(selected){if(multiMode)selectedGroup.add(selected);else{selectedGroup=new Set(groupMembers(selected))}}refreshSelectionUI()});
const pinBtn=document.getElementById('pinBtn');
pinBtn.addEventListener('pointerdown',e=>e.stopPropagation());
pinBtn.addEventListener('click',e=>{e.stopPropagation();const arr=currentSelection();if(!arr.length)return;remember();const makeLocked=!arr.every(p=>p.locked);arr.forEach(p=>p.locked=makeLocked);refreshSelectionUI()});
document.getElementById('undoBtn').onclick=undo;updateUndo();
const repeatBtn=document.getElementById('repeatBtn');
repeatBtn.addEventListener('pointerdown',e=>e.stopPropagation());
repeatBtn.onclick=()=>{if(!currentSelection().length||placementLoading||placingCopy||placingCopies)return;copySelectionToClipboard();setRepeater(true);startPasteFromClipboard();};
document.getElementById('stopRepeat').onclick=cancelPlacement;
const copyBtn=document.getElementById('copyBtn');
copyBtn.addEventListener('pointerdown',e=>e.stopPropagation());
copyBtn.addEventListener('click',async e=>{e.stopPropagation();if(!currentSelection().length||placingCopy||placingCopies)return;copySelectionToClipboard();await startPasteFromClipboard()});
const trashBtn=document.getElementById('trashBtn');
trashBtn.addEventListener('pointerdown',e=>e.stopPropagation());
trashBtn.addEventListener('click',e=>{e.stopPropagation();const arr=currentSelection().filter(p=>!p.locked);if(!arr.length)return;remember();deleteCrumble();arr.forEach(p=>scene.remove(p.root));placed=placed.filter(p=>!arr.includes(p));selected=null;selectedGroup.clear();multiMode=false;refreshSelectionUI();updateParts()});
function updatePinPosition(){
  const tools=document.getElementById('selectionTools');
  const arr=currentSelection();if(!arr.length||!tools.classList.contains('show'))return;
  const box=new THREE.Box3();for(const p of arr)box.expandByObject(p.root);
  const w=viewport.clientWidth,h=viewport.clientHeight;
  const xs=[],ys=[];
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const p=new THREE.Vector3(x,y,z).project(camera);
    xs.push((p.x*.5+.5)*w);ys.push((-p.y*.5+.5)*h);
  }
  const left=(Math.min(...xs)+Math.max(...xs))/2;
  const top=Math.min(...ys)-5;
  tools.style.left=left+'px';
  tools.style.top=top+'px';
  const badge=document.getElementById('selectionBadge');
  badge.style.left=left+'px';
  badge.style.top=top+'px';
}
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);composer.setSize(w,h);outlinePass.resolution.set(w,h);for(const pass of groupOutlinePasses)pass.resolution.set(w,h);const fr=700,aspect=w/h;camera.left=-fr*aspect/2;camera.right=fr*aspect/2;camera.top=fr/2;camera.bottom=-fr/2;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();
function animate(){requestAnimationFrame(animate);const now=performance.now(),dt=Math.min(.05,(now-cloudClock)/1000);cloudClock=now;controls.update();updateOuterClouds();updateClouds(dt);updateTraffic(dt);updateWildlife(dt);updateCharacters(dt);updateWeatherFx(dt);updateDayNight(now);updatePinPosition();composer.render()}



// Settings: live city weather + optional real-time day/night.
const settingsBtn=null,settingsOverlay=null,settingsClose=null;
const weatherCity=document.getElementById('weatherCity'),realTimeWeatherEnabled=document.getElementById('realTimeWeatherEnabled'),dayModeControl=document.getElementById('dayModeControl');
const weatherStatusEl=document.getElementById('weatherStatus'),weatherTimeEl=document.getElementById('weatherTime'),weatherNowEl=document.getElementById('weatherNow');
try{const saved=JSON.parse(localStorage.getItem('mlw-world-settings')||'null');if(saved){const hadLive=Object.prototype.hasOwnProperty.call(saved,'live');worldSettings={...worldSettings,...saved};if(!hadLive)worldSettings.live=!!(saved.weather||saved.realtime);worldSettings.weather=worldSettings.realtime=!!worldSettings.live}}catch(e){}
weatherCity.value=worldSettings.city||'Nürnberg';realTimeWeatherEnabled.checked=!!worldSettings.live;worldSettings.clock=true;worldSettings.dayMode=['day','cycle','night'].includes(worldSettings.dayMode)?worldSettings.dayMode:'cycle';syncDayMode();
function setSettings(open){ if(open) updateSettingsClock(); }
function weatherLabel(code){if(code==null)return '—';if(code===0)return '☀️ Clear';if(code<=3)return '☁️ Cloudy';if([45,48].includes(code))return '🌫️ Fog';if((code>=51&&code<=67)||(code>=80&&code<=82))return '🌧️ Rain';if((code>=71&&code<=77)||(code>=85&&code<=86))return '❄️ Snow';if(code>=95)return '⛈️ Thunderstorm';return 'Mixed'}
function updateSettingsClock(){if(!weatherTimeEl)return;try{weatherTimeEl.textContent=new Intl.DateTimeFormat('de-DE',{timeZone:worldSettings.timezone||undefined,hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())}catch(e){weatherTimeEl.textContent=new Date().toLocaleTimeString()}}
const cartoonTextures=new Map();
function cartoonTexture(symbol){if(cartoonTextures.has(symbol))return cartoonTextures.get(symbol);const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');ctx.font='92px "Segoe UI Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(symbol,64,68);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;cartoonTextures.set(symbol,tex);return tex;}
function cartoonSprite(symbol,size,opacity=1){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:cartoonTexture(symbol),transparent:true,opacity,depthWrite:false}));sprite.scale.set(size,size,1);return sprite;}
const rainGroup=new THREE.Group();scene.add(rainGroup);let rainDrops=[];
const snowGroup=new THREE.Group();scene.add(snowGroup);let snowFlakes=[];
const weatherFogColor=new THREE.Color(0xc6d4e3);let lightningTimer=0;
function clearGroup(group,arr){for(const x of arr){group.remove(x);if(x.material)x.material.dispose();}arr.length=0;}
function setRain(amount){clearGroup(rainGroup,rainDrops);if(amount<=0)return;for(let i=0;i<Math.round(90+amount*210);i++){const drop=cartoonSprite('💧',11+Math.random()*5,.65);drop.scale.x*=.6;drop.position.set((Math.random()-.5)*1250,40+Math.random()*550,(Math.random()-.5)*1250);rainGroup.add(drop);rainDrops.push(drop);}}
function setSnow(amount){clearGroup(snowGroup,snowFlakes);if(amount<=0)return;for(let i=0;i<Math.round(60+amount*150);i++){const flake=cartoonSprite('❄️',9+Math.random()*7,.8);flake.position.set((Math.random()-.5)*1250,40+Math.random()*550,(Math.random()-.5)*1250);flake.userData.drift=Math.random()*Math.PI*2;snowGroup.add(flake);snowFlakes.push(flake);}}
const sunnyIcon=cartoonSprite('☀️',85,.8);scene.add(sunnyIcon);
const fogGroup=new THREE.Group(),tornadoGroup=new THREE.Group();scene.add(fogGroup,tornadoGroup);
for(let i=0;i<20;i++){const f=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTexture,transparent:true,opacity:.06,depthWrite:false}));f.scale.set(240,65,1);f.position.set((Math.random()-.5)*1200,18+Math.random()*30,(Math.random()-.5)*1200);fogGroup.add(f);}
for(let i=0;i<30;i++){const puff=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTexture,color:0xa7b5c7,transparent:true,opacity:.35,depthWrite:false}));puff.scale.set(22+i*1.4,14+i*.6,1);tornadoGroup.add(puff);}
function applyWeatherFx(){const c=worldSettings.weatherCode??0,prec=Number(worldSettings.precipitation||0),snow=Number(worldSettings.snowfall||0),cover=Math.max(0,Math.min(100,Number(worldSettings.cloudCover||0)))/100;liveWeather.cloud=Math.max(c===0?.02:0,cover);liveWeather.rain=((c>=51&&c<=67)||(c>=80&&c<=82)||c>=95)?Math.min(1,.25+prec/4):0;liveWeather.snow=((c>=71&&c<=77)||(c>=85&&c<=86))?Math.min(1,.3+snow/1.5):0;liveWeather.fog=[45,48].includes(c)?.78:0;liveWeather.storm=c>=95?1:0;liveWeather.wind=Math.min(1,Number(worldSettings.windSpeed||0)/40);setRain(liveWeather.rain);setSnow(liveWeather.snow);scene.fog=liveWeather.fog?new THREE.FogExp2(weatherFogColor,.0009+liveWeather.fog*.0012):null;}
function updateWeatherFx(dt){
 const t=performance.now()/1000,wind=liveWeather.wind||0;
 for(const r of rainDrops){r.position.y-=220*(.8+liveWeather.rain*.7)*dt;r.position.x+=wind*45*dt;if(r.position.y<0){r.position.y=500+Math.random()*100;r.position.x=(Math.random()-.5)*1250;}}
 for(const f of snowFlakes){f.position.y-=22*dt;f.position.x+=(Math.sin(t*1.5+f.userData.drift)*12+wind*20)*dt;f.material.rotation=Math.sin(t+f.userData.drift)*.3;if(f.position.y<0)f.position.y=500+Math.random()*100;}
 sunnyIcon.visible=worldSettings.weatherCode===0;sunnyIcon.position.set(controls.target.x-200,320,controls.target.z-160);sunnyIcon.material.opacity=(1-(worldSettings.realtime?realTimeNightAmount():worldSettings.dayMode==='day'?0:worldSettings.dayMode==='night'?1:nightAmountAt((performance.now()-dayNightStart)/1000)))*.7;sunnyIcon.material.rotation=Math.sin(t*.4)*.08;
 fogGroup.visible=liveWeather.fog>0;for(const f of fogGroup.children){f.position.x+=9*dt;if(f.position.x>700)f.position.x=-700;f.material.opacity=liveWeather.fog*.13;}
 // A playful storm funnel outside the building area, never a destructive object.
 tornadoGroup.visible=liveWeather.storm>0;tornadoGroup.position.set(820,0,820);
 tornadoGroup.children.forEach((p,i)=>{const radius=4+i*1.1,angle=t*3+i*.72;p.position.set(Math.cos(angle)*radius,i*4.5+6,Math.sin(angle)*radius);});
 if(liveWeather.storm){lightningTimer-=dt;if(lightningTimer<=0){lightningTimer=4+Math.random()*10;const old=hemi.intensity;hemi.intensity=old+1.4;setTimeout(()=>hemi.intensity=old,90);}}
}

function randomWeather(){
 const r=Math.random();let code=0,cloud=.08+Math.random()*.28,prec=0,snow=0;
 if(r<.18){code=61;cloud=.72+Math.random()*.25;prec=.4+Math.random()*2.2}else if(r<.24){code=45;cloud=.65+Math.random()*.3}else if(r<.58){code=3;cloud=.62+Math.random()*.34}else if(r<.78){code=2;cloud=.35+Math.random()*.35}else{code=0;cloud=.02+Math.random()*.15}
 worldSettings.windSpeed=8+Math.random()*32;worldSettings.weatherCode=code;worldSettings.cloudCover=Math.round(cloud*100);worldSettings.precipitation=prec;worldSettings.snowfall=snow;liveWeather.cloud=cloud;applyWeatherFx();weatherStatusEl.textContent='Simulation';weatherNowEl.textContent=weatherLabel(code)+' · '+Math.round(cloud*100)+'% clouds';
}
let weatherRequest=0;
async function checkWeather(){const request=++weatherRequest;worldSettings.city=(weatherCity.value||'Nürnberg').trim();worldSettings.live=realTimeWeatherEnabled.checked;worldSettings.weather=worldSettings.realtime=worldSettings.live;worldSettings.clock=true;syncDayMode();weatherStatusEl.textContent=worldSettings.live?'Checking…':'Simulation';localStorage.setItem('mlw-world-settings',JSON.stringify(worldSettings));if(!worldSettings.live){worldSettings.timezone=null;randomWeather();return}try{const geo=await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name='+encodeURIComponent(worldSettings.city)).then(r=>r.json());if(request!==weatherRequest||!worldSettings.live)return;const loc=geo.results?.[0];if(!loc)throw new Error('City not found');worldSettings.timezone=loc.timezone;const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code,is_day,cloud_cover,precipitation,rain,showers,snowfall,wind_speed_10m&timezone=auto`).then(r=>r.json());if(request!==weatherRequest||!worldSettings.live)return;worldSettings.weatherCode=w.current?.weather_code;worldSettings.temp=w.current?.temperature_2m;worldSettings.cloudCover=w.current?.cloud_cover??0;worldSettings.precipitation=w.current?.precipitation??0;worldSettings.snowfall=w.current?.snowfall??0;worldSettings.windSpeed=w.current?.wind_speed_10m??0;liveWeather.cloud=Math.max(.02,worldSettings.cloudCover/100);weatherStatusEl.textContent=`${loc.name}${loc.country_code?' · '+loc.country_code:''}`;weatherNowEl.textContent=`${weatherLabel(worldSettings.weatherCode)} · ${Math.round(worldSettings.cloudCover)}% clouds${worldSettings.temp!=null?' · '+Math.round(worldSettings.temp)+'°C':''}`;applyWeatherFx();localStorage.setItem('mlw-world-settings',JSON.stringify(worldSettings));updateSettingsClock()}catch(e){if(request!==weatherRequest||!worldSettings.live)return;weatherStatusEl.textContent=e.message||'Weather unavailable';weatherNowEl.textContent='—';}}
function syncDayMode(){dayModeControl.disabled=!!worldSettings.live;dayModeControl.querySelectorAll('input').forEach(input=>input.checked=input.value===(worldSettings.dayMode||'cycle'));}
dayModeControl.addEventListener('change',e=>{worldSettings.dayMode=e.target.value;localStorage.setItem('mlw-world-settings',JSON.stringify(worldSettings));skyTick=0;updateDayNight(performance.now());});
realTimeWeatherEnabled.addEventListener('change',checkWeather);
weatherCity.addEventListener('change',()=>{worldSettings.city=weatherCity.value.trim();localStorage.setItem('mlw-world-settings',JSON.stringify(worldSettings));if(worldSettings.live)checkWeather();});
weatherCity.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();weatherCity.blur();}});
if(worldSettings.live)checkWeather();else randomWeather();
setInterval(()=>{if(worldSettings.live)checkWeather()},10*60*1000);setInterval(()=>{if(!worldSettings.live)randomWeather()},90000);


// Compact top-bar light/cloud dropdown controls.
const cloudBtn=document.getElementById('cloudBtn'),cloudDrop=document.getElementById('cloudDrop');
cloudBtn.addEventListener('click',e=>{e.stopPropagation();uiClick();cloudDrop.classList.toggle('open')});cloudDrop.addEventListener('click',e=>e.stopPropagation());document.addEventListener('click',()=>cloudDrop.classList.remove('open'));
let lastSliderTick=0;const bindRange=(id,obj,key,scale=1)=>{const el=document.getElementById(id);el.value=Math.round(obj[key]*scale);el.addEventListener('input',()=>{obj[key]=Number(el.value)/scale;localStorage.setItem(obj===lightSettings?'mlw-light-settings':'mlw-cloud-settings',JSON.stringify(obj));const now=performance.now();if(now-lastSliderTick>75){uiClick();lastSliderTick=now}})};
bindRange('lightBrightness',lightSettings,'brightness',100);bindRange('lightRotation',lightSettings,'rotation',1);bindRange('lightTemp',lightSettings,'temp',100);bindRange('lightContrast',lightSettings,'contrast',100);
const lightPbrPreset=document.getElementById('lightPbrPreset');if(lightPbrPreset){lightPbrPreset.value=lightSettings.pbrPreset||'neutral';lightPbrPreset.addEventListener('change',()=>{lightSettings.pbrPreset=lightPbrPreset.value;localStorage.setItem('mlw-light-settings',JSON.stringify(lightSettings));uiClick()})}
bindRange('cloudNearDensity',cloudSettings,'nearDensity',100);bindRange('cloudFarDensity',cloudSettings,'farDensity',100);bindRange('cloudCityDensity',cloudSettings,'cityDensity',100);bindRange('cloudSpeed',cloudSettings,'speed',100);bindRange('cloudShape',cloudSettings,'shape',100);

// V6.3 quick guide
const helpBtn=document.getElementById('helpBtn');
const helpOverlay=document.getElementById('helpOverlay');
const helpClose=document.getElementById('helpClose');
function setHelp(open){helpOverlay.classList.toggle('open',open);helpOverlay.setAttribute('aria-hidden',String(!open));helpOverlay.inert=!open;if(open)helpClose.focus({preventScroll:true});else if(helpOverlay.contains(document.activeElement))document.activeElement.blur();}
helpBtn.addEventListener('click',()=>setHelp(true));
helpClose.addEventListener('click',()=>setHelp(false));
helpOverlay.addEventListener('click',e=>{if(e.target===helpOverlay)setHelp(false)});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(helpOverlay.classList.contains('open'))setHelp(false);if(partsOverlay.classList.contains('open'))setParts(false);if(settingsOverlay?.classList.contains('open'))setSettings(false)}});

const dockAutoHideToggle=document.getElementById('dockAutoHide');
dockAutoHideToggle.checked=dockAutoHide;
if(!dockAutoHide)openAutoDock();
dockAutoHideToggle.onchange=()=>{dockAutoHide=dockAutoHideToggle.checked;try{localStorage.setItem('mlw-dock-autohide',String(dockAutoHide))}catch(_){}openAutoDock();if(dockAutoHide)closeAutoDockDelayed();};
const managerLink=document.querySelector('.assetManagerLink');if(managerLink&&(location.protocol==='http:'||location.protocol==='https:'))managerLink.href=location.origin+'/assets/';
const hideWelcomeToggle=document.getElementById('hideWelcomeOnStart');
let hideWelcome=false;try{hideWelcome=localStorage.getItem('mlw-hide-welcome')==='true'}catch(_){}
hideWelcomeToggle.checked=hideWelcome;
hideWelcomeToggle.onchange=()=>{try{localStorage.setItem('mlw-hide-welcome',String(hideWelcomeToggle.checked))}catch(_){}};
setHelp(!hideWelcome);
// Start only after weather/settings state has been initialized.
animate();

// Apple-style dock magnification. Outer shell never moves; only artwork reacts.
(()=>{
 const dock=document.getElementById('assetDock');if(!dock)return;
 let px=null,raf=0,items=[];
 const refresh=()=>{items=[...dock.querySelectorAll('.dockItem')].map(item=>({item,art:item.querySelector('.dockIcon,.dockThumb,.dockMosaic')})).filter(x=>x.art)};
 const reset=()=>{refresh();for(const {art} of items){art.style.setProperty('--dockScale','1');art.style.setProperty('--dockLift','0px')}};
 const paint=()=>{raf=0;if(px==null)return;for(const {item,art} of items){const r=item.getBoundingClientRect(),d=Math.abs(px-(r.left+r.width/2));const influence=Math.max(0,1-d/155);const eased=influence*influence*(3-2*influence);art.style.setProperty('--dockScale',(1+.42*eased).toFixed(3));art.style.setProperty('--dockLift',(-20*eased).toFixed(1)+'px')}};
 dock.addEventListener('pointerenter',refresh,{passive:true});
 dock.addEventListener('pointermove',e=>{px=e.clientX;if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
 dock.addEventListener('pointerleave',()=>{px=null;if(raf){cancelAnimationFrame(raf);raf=0}reset()},{passive:true});
 const dockObserver=new MutationObserver(()=>{refresh();if(px!=null&&!raf)raf=requestAnimationFrame(paint)});dockObserver.observe(dockItems,{childList:true,subtree:true});
 reset();
})();



function validModelLink(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch(_){return '';}}
function platformLink(value,name,image){const href=validModelLink(value);return href?`<a class="modelLink" href="${catalogEscape(href)}" target="_blank" rel="noopener" title="Open on ${name}" aria-label="Open on ${name}"><img src="assets/IMG/${image}" alt="${name}"></a>`:'—';}
function partsText(){const counts={};for(const {p} of sceneSnapshot())counts[p.asset.id]=(counts[p.asset.id]||0)+1;const pins=connectorPinStats();const lines=['My Little World Builder — Print list',''];for(const [id,n] of Object.entries(counts)){const a=byId[id];lines.push(`${a.name} — ${n} ×`, `Size: ${a.w/10} × ${a.d/10} cm`,`Pins: ${pins.byAsset[id]||0}`,`Colors: ${assetColors(a).join(', ')||'—'}`,`Print time: ${a.printTime||'—'}`,`Weight: ${a.weightG!=null?a.weightG*n+' g':'—'}`,`MakerWorld: ${validModelLink(a.makerworld)||'—'}`,`Snapmaker: ${validModelLink(a.snapmaker)||'—'}`,'');}lines.push(`Total parts: ${Object.values(counts).reduce((a,b)=>a+b,0)}`,`Total pins: ${pins.total}`);return lines.join('\r\n');}
document.getElementById('exportParts').onclick=async()=>{const text=partsText(),status=document.getElementById('exportStatus');status.textContent='';try{if(window.showSaveFilePicker){const handle=await window.showSaveFilePicker({suggestedName:'my-little-world-print-list.txt',types:[{description:'Text file',accept:{'text/plain':['.txt']}}]});const writable=await handle.createWritable();await writable.write(text);await writable.close();status.textContent='List exported.';}else{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='my-little-world-print-list.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='List downloaded.';}}catch(error){if(error.name!=='AbortError')status.textContent='Export failed: '+error.message;}};

// Keep all controls together; branding has its own independent screen positions.
{
 const left=document.querySelector('header .topLeft'),right=document.querySelector('header .topRight');
 left.append(...right.children);right.remove();
}

// The clock face is part of the logo image; account for object-fit and responsive sizing.
{
 const logo=document.querySelector('.topTitle>img'),title=logo.parentElement,clock=document.getElementById('worldClock');
 const positionClock=()=>{
  if(!logo.naturalWidth)return;
  const box=logo.getBoundingClientRect(),parent=title.getBoundingClientRect(),scale=Math.min(box.width/logo.naturalWidth,box.height/logo.naturalHeight),w=logo.naturalWidth*scale,h=logo.naturalHeight*scale;
  clock.style.setProperty('--clock-x',(box.left-parent.left+(box.width-w)/2+w*.498)+'px');
  clock.style.setProperty('--clock-y',(box.top-parent.top+(box.height-h)/2+h*.864)+'px');
  clock.style.setProperty('--clock-scale',String(w*.195/54));
 };
 const positionWeather=()=>{
  if(!cloudDrop.classList.contains('open'))return;
  const button=cloudBtn.getBoundingClientRect(),width=cloudDrop.getBoundingClientRect().width;
  cloudDrop.style.setProperty('--weather-x',Math.max(16,Math.min(button.left,innerWidth-width-16))+'px');
  cloudDrop.style.setProperty('--weather-y',(button.bottom+10)+'px');
 };
 new ResizeObserver(positionClock).observe(logo);
 logo.addEventListener('load',positionClock);positionClock();
 cloudBtn.addEventListener('click',positionWeather);
 window.addEventListener('resize',()=>{positionClock();positionWeather();});
}
