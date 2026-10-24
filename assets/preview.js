import {fitModel,gltfRoot} from '../model-rules.js?v=desktop-release-20261024-window-glow-half';
import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {PLYLoader} from 'three/addons/loaders/PLYLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
let renderer;
const assetURL=p=>'/assets/'+p.split('/').map(encodeURIComponent).join('/');
export async function renderPreview(a){
 let obj;
 if(a.type==='ply'){const geometry=await new PLYLoader().loadAsync(assetURL(a.file));geometry.computeVertexNormals();obj=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:!!geometry.getAttribute('color'),roughness:.78,metalness:0}));}
 else if(a.type==='obj'){const loader=new OBJLoader();if(a.mtl){const path=assetURL(a.mtl),split=path.lastIndexOf('/');const mtl=await new MTLLoader().setPath(path.slice(0,split+1)).loadAsync(path.slice(split+1));mtl.preload();loader.setMaterials(mtl)}obj=await loader.loadAsync(assetURL(a.file));}
 else obj=await gltfRoot(await new GLTFLoader().loadAsync(assetURL(a.file)));
 fitModel(obj,a);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x999999,2.5),obj);
 const box=new THREE.Box3().setFromObject(obj),focus=box.getCenter(new THREE.Vector3()),s=box.getSize(new THREE.Vector3()),max=Math.max(s.x,s.y,s.z)||100;
 const camera=new THREE.OrthographicCamera(-max,max,max*.7,-max*.7,.1,10000);camera.position.copy(focus).add(new THREE.Vector3(max*1.4,max*1.3,max*1.4));camera.lookAt(focus);
 if(!renderer){renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(320,224);renderer.setPixelRatio(1)}
 renderer.render(scene,camera);const data=renderer.domElement.toDataURL('image/png');obj.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){m.map?.dispose();m.dispose()}});return data;
}
export function disposeRenderer(){renderer?.dispose();renderer?.forceContextLoss();renderer=null}
