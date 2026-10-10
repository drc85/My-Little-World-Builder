(()=>{
 const el=id=>document.getElementById(id),player=el('soundPreview');let data;
 const status=text=>el('soundStatus').textContent=text;
 async function request(body){const r=await fetch('/api/sound',{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Asset-Token':window.assetToken},body:body?JSON.stringify(body):undefined});const value=await r.json();if(!r.ok)throw Error(value.error);return value;}
 function preview(){player.pause();const file=el('soundFile').value;player.src=file?'/'+file.split('/').map(encodeURIComponent).join('/'):'';player.volume=Number(el('soundVolume').value)/100;el('soundUse').disabled=!file;}
 function render(selected){el('soundFile').replaceChildren(...data.files.map(f=>{const o=document.createElement('option');o.value=f.file;o.textContent=f.name+' · '+(f.size/1e6).toFixed(1)+' MB';return o}));el('soundFile').value=selected||data.settings.file;el('soundVolume').value=data.settings.volume*100;volume();preview();}
 function volume(){player.volume=Number(el('soundVolume').value)/100;el('soundVolumeLabel').value=el('soundVolume').value+'%';}
 async function busy(fn){el('soundUpload').disabled=true;el('soundUse').disabled=true;try{await fn()}catch(e){status(e.message)}finally{el('soundUpload').disabled=false;el('soundUse').disabled=!el('soundFile').value}}
 el('soundTab').onclick=async()=>{document.body.classList.add('sound-view');el('soundPanel').hidden=false;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('selected',b.id==='soundTab'));await busy(async()=>{data=await request();render();status('Choose a track and use the player to preview it.');});};
 for(const id of ['assetsTab','foldersTab'])el(id).addEventListener('click',()=>{document.body.classList.remove('sound-view');el('soundPanel').hidden=true;el('soundTab').classList.remove('selected');player.pause();});
 el('soundFile').onchange=preview;el('soundVolume').oninput=volume;
 el('soundUse').onclick=()=>busy(async()=>{data=await request({action:'save',file:el('soundFile').value,volume:Number(el('soundVolume').value)/100});status('Saved. Reload the Builder to use this music.');});
 el('soundUpload').onclick=()=>el('soundUploadInput').click();
 el('soundUploadInput').onchange=()=>busy(async()=>{const file=el('soundUploadInput').files[0];if(!file)return;if(file.size>40e6)throw Error('Please choose an audio file under 40 MB.');status('Uploading…');const encoded=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=()=>reject(Error('Unable to read audio file.'));r.readAsDataURL(file)});data=await request({action:'upload',name:file.name,data:encoded});render(data.uploaded);status('Uploaded. Preview the audio, then click Use in Builder.');el('soundUploadInput').value='';});
})();
