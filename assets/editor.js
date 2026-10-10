let catalog,tab='assets',dirty=false,busy=false;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=p=>'/'+p.split('/').map(encodeURIComponent).join('/');
async function api(route,body){const r=await fetch('/api/'+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Asset-Token':window.assetToken},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error(data.error||'Action failed');return data}
function message(text){$('status').textContent=text}
function mark(){dirty=true;$('dirty').textContent='Unsaved changes'}
function clean(){dirty=false;$('dirty').textContent=''}
function report(){const r=catalog.report||{};message(`${catalog.assets.filter(a=>!a.missing).length} Models · ${r.new?.length||0} new · ${r.changed?.length||0} changed · ${r.moved?.length||0} moved · ${r.missing?.length||0} missing`)}
function preview(item,kind){const custom=kind==='folder'&&item.mode!=='image'?'':item.preview;const automatic=item.previewFile;const icon=kind==='folder'&&item.mode==='icon';return `<div class="preview" draggable="true">${item.missing?'<span class="badge">File missing</span>':''}${icon&&!custom?`<span class="emoji">${esc(item.icon)}</span>`:`<img draggable="false" loading="lazy" alt="Preview" src="${url(custom||automatic)}?v=${catalog.revision}">`}</div>`}
function imageButtons(item,kind){return `<div class="buttons"><button data-action="image">Custom Image …</button>${item.preview?'<button data-action="reset">Automatic</button>':''}<button data-action="defaults" title="Reset text, image and settings for this entry">Reset to default</button></div>`}
function lineFields(item,kind){const field=kind==='asset'?'label':'name',lines=String(item[field]||'').split(' / ');return `<div class="label-lines">${[0,1,2].map(i=>`<label>Line ${i+1}${i===2?' (optional)':''}<input data-line-field="${field}" data-line="${i}" value="${esc(lines[i]||'')}" placeholder="${i===0&&kind==='asset'?'Automatic from filename':'Optional'}"></label>`).join('')}</div><p class="small">Each field is a separate dock text line. ${kind==='asset'?'Leave all lines empty to use the filename.':'Empty lines are omitted.'}</p>`;}
function arrangeScope(item,kind){return kind==='asset'?item.folder:item.path.split('/').slice(0,-1).join('/');}
function arrangeCompare(a,b){return (a.order??1000000)-(b.order??1000000)||(a.file||a.path).localeCompare(b.file||b.path,undefined,{numeric:true});}
function siblings(item,kind){return (kind==='asset'?catalog.assets:catalog.folders).filter(a=>arrangeScope(a,kind)===arrangeScope(item,kind)).sort(arrangeCompare);}
function arrangeControls(item,kind){const items=siblings(item,kind),i=items.indexOf(item);return `<div class="arrangeBar"><span class="arrangeHandle" draggable="true" title="Drag to arrange">⠿ Arrange</span><button type="button" data-action="earlier" aria-label="Move earlier" ${i===0?'disabled':''}>←</button><button type="button" data-action="later" aria-label="Move later" ${i===items.length-1?'disabled':''}>→</button></div>`;}
function reorder(item,target,kind){if(busy)return;if(arrangeScope(item,kind)!==arrangeScope(target,kind)){message('Arrange within the same folder. Select a folder above to see its models together.');return;}const items=siblings(item,kind),from=items.indexOf(item),to=items.indexOf(target);if(from===to)return;items.splice(from,1);items.splice(to,0,item);items.forEach((a,i)=>a.order=i);mark();render();message('Order changed. Click Save changes to apply it to the Builder.');}
let draggedCard=null;
$('cards').addEventListener('dragstart',e=>{const handle=e.target.closest('.arrangeHandle,.preview');if(!handle||busy){e.preventDefault();return;}draggedCard=handle.closest('.card');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedCard.dataset.key);draggedCard.classList.add('arranging');});
$('cards').addEventListener('dragover',e=>{const card=e.target.closest('.card');if(!draggedCard||!card)return;e.preventDefault();e.dataTransfer.dropEffect='move';document.querySelectorAll('.dropTarget').forEach(c=>c.classList.remove('dropTarget'));card.classList.add('dropTarget');});
$('cards').addEventListener('drop',e=>{const card=e.target.closest('.card');if(!draggedCard||!card)return;e.preventDefault();const item=itemFor(draggedCard),target=itemFor(card),kind=card.dataset.kind;if(kind===draggedCard.dataset.kind)reorder(item,target,kind);draggedCard=null;document.querySelectorAll('.dropTarget,.arranging').forEach(c=>c.classList.remove('dropTarget','arranging'));});
$('cards').addEventListener('dragend',()=>{draggedCard=null;document.querySelectorAll('.dropTarget,.arranging').forEach(c=>c.classList.remove('dropTarget','arranging'));});

function render(){
 $('assetCount').textContent=`(${catalog.assets.filter(a=>!a.missing).length})`;$('mainCount').textContent=`(${catalog.folders.filter(f=>!f.missing&&!f.path.includes('/')).length})`;$('subCount').textContent=`(${catalog.folders.filter(f=>!f.missing&&f.path.includes('/')).length})`;
 const q=$('search').value.toLowerCase(),folder=$('folderFilter').value;
 const list=(tab==='assets'?catalog.assets:catalog.folders.filter(f=>tab==='main'?!f.path.includes('/'):f.path.includes('/'))).filter(a=>{const p=a.file||a.path;return (!q||[p,a.name].join(' ').toLowerCase().includes(q))&&(!folder||(a.folder||a.path)===folder||(a.folder||a.path).startsWith(folder+'/'))}).sort((a,b)=>arrangeScope(a,tab==='assets'?'asset':'folder').localeCompare(arrangeScope(b,tab==='assets'?'asset':'folder'))||arrangeCompare(a,b));
 $('cards').innerHTML=list.map(a=>{
 const kind=tab==='assets'?'asset':'folder',key=kind==='asset'?a.id:a.path;
 const top=`<article class="card ${a.missing?'missing':''}" data-kind="${kind}" data-key="${esc(key)}">${arrangeControls(a,kind)}${preview(a,kind)}<div class="file">${esc(kind==='asset'?'assets/'+a.file:'assets/BROWSER/'+a.path+'/')}</div>`;
 if(kind==='asset')return top+`${lineFields(a,kind)}${a.missing?'<button data-action="remove-missing">Remove missing entry</button>':imageButtons(a,kind)}<label>X rotation (degrees)<input type="number" min="-360" max="360" step="90" data-field="rotationX" value="${a.rotationX}"></label><label>MakerWorld link<input type="url" data-field="makerworld" value="${esc(a.makerworld||'')}" placeholder="https://makerworld.com/…"></label><label>Snapmaker link<input type="url" data-field="snapmaker" value="${esc(a.snapmaker||'')}" placeholder="https://space.snapmaker.com/…"></label><label class="toggle"><input type="checkbox" data-field="enabled" ${a.enabled?'checked':''}>Show in Builder</label>${a.warning?`<p class="warning">${esc(a.warning)}</p>`:''}<p class="small">${(a.size/1024/1024).toFixed(1)} MB · ${esc(a.type.toUpperCase())}</p></article>`;
 return top+`${lineFields(a,kind)}<div class="row"><label>Icon / Emoji<input data-field="icon" value="${esc(a.icon)}"></label></div><label>Menu image<select data-field="mode">${[['icon','Icon / Emoji'],['mosaic','Collection'],['image','Custom Image']].map(([v,l])=>`<option value="${v}" ${v===a.mode?'selected':''}>${l}</option>`).join('')}</select></label>${a.missing?'<button data-action="remove-missing">Remove missing entry</button>':imageButtons(a,kind)}<p class="small">The name only changes the display. The folder keeps its filename.</p></article>`;
 }).join('')||'<p class="empty">No matching entries.</p>';
 $('cards').querySelectorAll('img').forEach(img=>img.onerror=()=>{img.alt='Preview will be created on refresh';img.style.fontSize='12px'});
}
function refreshFilters(){const value=$('folderFilter').value;$('folderFilter').innerHTML='<option value="">All folders</option>'+catalog.folders.filter(f=>!f.missing).map(f=>`<option value="${esc(f.path)}">${esc(f.path)}</option>`).join('');$('folderFilter').value=value}
function itemFor(card){return (card.dataset.kind==='asset'?catalog.assets:catalog.folders).find(a=>(a.id||a.path)===card.dataset.key)}
$('cards').addEventListener('input',e=>{if(e.target.dataset.lineField){const card=e.target.closest('.card'),a=itemFor(card),field=e.target.dataset.lineField;a[field]=[...card.querySelectorAll('[data-line-field]')].map(input=>input.value.trim()).join(' / ');mark();return;}if(!e.target.dataset.field)return;const card=e.target.closest('.card'),a=itemFor(card),key=e.target.dataset.field;let value=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?Number(e.target.value):e.target.value;if(key==='w'||key==='d')value*=10;a[key]=value;mark()});
$('cards').addEventListener('change',e=>{if(e.target.tagName==='SELECT'){itemFor(e.target.closest('.card'))[e.target.dataset.field]=e.target.value;mark()}});
async function save(){catalog=await api('save',{revision:catalog.revision,assets:catalog.assets,folders:catalog.folders});clean();refreshFilters();render();message('Saved. Reload the Builder to apply changes.');}
async function run(fn){if(busy)return;busy=true;document.querySelectorAll('.actions button').forEach(b=>b.disabled=true);try{await fn()}catch(e){message(e.message)}finally{busy=false;document.querySelectorAll('.actions button').forEach(b=>b.disabled=false)}}
$('save').onclick=()=>run(async()=>{await save();await generate(false);message('Saved. Reload the Builder to apply changes.');});
$('scan').onclick=()=>run(async()=>{if(dirty)await save();catalog=await api('scan',{});clean();refreshFilters();render();report();await generate(false)});
$('previews').onclick=()=>run(async()=>{if(dirty)await save();await generate(true)});
$('search').oninput=render;$('folderFilter').onchange=render;
const categoryTabs=[['assetsTab','assets'],['mainTab','main'],['subTab','sub']];for(const [id,value] of categoryTabs)$(id).onclick=()=>{tab=value;for(const [otherId,otherValue] of categoryTabs)$(otherId).classList.toggle('selected',value===otherValue);$('folderFilter').value='';render()};
$('cards').addEventListener('click',async e=>{const action=e.target.dataset.action;if(!action)return;const card=e.target.closest('.card'),id=card.dataset.key,kind=card.dataset.kind;
 if(action==='earlier'||action==='later'){const a=itemFor(card),items=siblings(a,kind),next=items[items.indexOf(a)+(action==='earlier'?-1:1)];if(next)reorder(a,next,kind);return;}
 if(action==='remove-missing')return run(async()=>{if(dirty)await save();catalog=await api('remove-missing',{id,kind});clean();refreshFilters();render();message('Missing entry removed. No model files were deleted.');});
 if(action==='defaults')return run(async()=>{if(dirty)await save();catalog=await api('reset',{id,kind});clean();refreshFilters();render();await generate(false);message('Reset to default. Reload the Builder to apply changes.');});
 if(action==='reset')return run(async()=>{if(dirty)await save();catalog=await api('image',{id,kind,reset:true});render();message('Custom image removed; automatic preview restored.');});
 const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.onchange=()=>run(async()=>{if(!input.files[0])return;if(dirty)await save();const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(input.files[0])});catalog=await api('image',{id,kind,data});render();message('Image saved and linked to the Builder.');});input.click();
});
async function generate(force){
 const {renderPreview,disposeRenderer}=await import('./preview.js');let failures=0,done=0;
 const list=catalog.assets.filter(a=>!a.missing);
 try{for(const a of list){message(`Previews: ${++done} / ${list.length} – ${a.name}`);
  try{const cached=!force&&a.previewReady&&await fetch(url(a.previewFile)).then(r=>r.ok);if(!cached||force){const data=await renderPreview(a);await api('preview',{id:a.id,kind:'asset',thumbKey:a.thumbKey,data});}}catch(e){failures++;console.warn(a.file,e)}
 }
 for(const f of catalog.folders.filter(f=>!f.missing)){
  try{const canvas=document.createElement('canvas');canvas.width=320;canvas.height=224;const ctx=canvas.getContext('2d');
   const load=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url(src)});
   if(f.mode==='image'&&f.preview){ctx.drawImage(await load(f.preview),0,0,320,224)}
   else if(f.mode==='icon'){ctx.font='140px "Segoe UI Emoji"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.icon,160,118)}
   else{const children=list.filter(a=>a.enabled!==false&&(a.folder===f.path||a.folder.startsWith(f.path+'/'))).slice(0,4);for(let i=0;i<4;i++){const x=(i%2)*160,y=Math.floor(i/2)*112;ctx.fillStyle='rgba(255,255,255,.05)';ctx.beginPath();ctx.roundRect(x+2,y+2,156,108,10);ctx.fill();if(children[i]){try{const img=await load(children[i].preview||children[i].previewFile);ctx.drawImage(img,x+2,y+2,156,108)}catch(e){console.warn('Preview unavailable',children[i].file)}}}}
   await api('preview',{id:f.path,kind:'folder',thumbKey:f.thumbKey,data:canvas.toDataURL('image/png')});
  }catch(e){failures++;console.warn(f.path,e)}
 }
 }finally{disposeRenderer()}
 render();message(failures?`Done, but ${failures} previews could not be generated. Check the models and internet connection.`:`Done: ${list.length} model previews and menu images are stored in their _Previews folders.`);
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
run(async()=>{catalog=await api('catalog');refreshFilters();render();report();await generate(false)});

