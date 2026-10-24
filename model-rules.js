import * as THREE from 'three';
export function placementMarker(name){return /^PLACEMENT_(?:BASE|PLATE)(?:_|$)/i.test(String(name||'').trim());}

function sourceBaseBounds(obj,a){
 const gltf=!!a.glb||['glb','gltf'].includes(a.type)||/\.gl(?:b|tf)$/i.test(a.file||'');
 if(!gltf||a.bridgeRole)return null;
 obj.updateWorldMatrix(true,true);
 const base=new THREE.Box3();let found=false;
 obj.traverse(node=>{
  if(!placementMarker(node.name)&&!node.userData?.placementBaseMarker)return;
  const box=new THREE.Box3().setFromObject(node,true);
  if(!box.isEmpty()){base.union(box);found=true;}
 });
 const size=base.getSize(new THREE.Vector3());
 return found&&size.x>1e-6&&size.z>1e-6?base:null;
}

export function fitModel(obj,a){
 const base=sourceBaseBounds(obj,a);
 if(base){
  const center=base.getCenter(new THREE.Vector3()),size=base.getSize(new THREE.Vector3()),bounds=new THREE.Box3().setFromObject(obj,true);
  const clean=n=>Math.round(n*1e5)/1e5;
  a.placementBase={x:center.x,z:center.z,bottom:base.min.y,w:clean(size.x),d:clean(size.z)};
  a.w=a.placementBase.w;a.d=a.placementBase.d;
  a.sourceBounds={minY:bounds.min.y,maxY:bounds.max.y};a.h=bounds.max.y-bounds.min.y;
  // Do not scale, rotate, translate, or recenter any node of a marked GLB.
  return;
 }
 // Legacy models and every bridge role retain the previous fitting behavior.
 if(Number.isFinite(a.rotationX))obj.rotation.x=THREE.MathUtils.degToRad(a.rotationX);
 const box=new THREE.Box3().setFromObject(obj),size=box.getSize(new THREE.Vector3());
 if(!a.nativeGeometry&&size.x>0&&size.z>0)obj.scale.setScalar(Math.min(a.w/size.x,a.d/size.z));
 const b=new THREE.Box3().setFromObject(obj),center=b.getCenter(new THREE.Vector3());
 if(a.nativeGeometry&&a.modelCenter){center.x=a.modelCenter[0];center.z=a.modelCenter[1];}
 obj.position.x-=center.x;obj.position.z-=center.z;obj.position.y-=b.min.y;
}

export async function gltfRoot(gltf){
 let root=gltf.scene||gltf.scenes?.[0];
 if(!root){root=new THREE.Group();const defs=gltf.parser.json.nodes||[],children=new Set(defs.flatMap(n=>n.children||[]));for(let i=0;i<defs.length;i++)if(!children.has(i))root.add(await gltf.parser.getDependency('node',i));if(!root.children.length)throw Error('Model contains no scene or mesh nodes');}
 // GLTFLoader may replace a mesh name with its node name; retain the source marker.
 root.traverse(node=>{const ref=gltf.parser?.associations?.get(node),json=gltf.parser?.json;const names=[node.name,json?.nodes?.[ref?.nodes]?.name,json?.meshes?.[ref?.meshes]?.name];for(const kind of ['color','nocontact','smoke'])if(names.some(name=>new RegExp('^'+kind+'(?:_|$)','i').test(String(name||'').trim())))node.userData[kind+'Marker']=true;if(names.some(placementMarker))node.userData.placementBaseMarker=true;if(names.some(name=>/^lights?(?:[_\s]|$)/i.test(String(name||'').trim())))node.userData.lightMarker=true;if(names.some(name=>/^(?:lamps?|lights?_lamps?)(?:[_\s]|$)/i.test(String(name||'').trim())))node.userData.lampMarker=true;});
 return root;
}
