import {placementCenter,verticalRange} from './placement-rules.js?v=desktop-release-20261031-up-light-origin';
export const role=p=>p.asset.bridgeRole||'';
export const elevated=p=>['deck','rail'].includes(role(p));
export function dimensions(p){const turn=Math.round(p.rotation/(Math.PI/2))%2;return turn?{w:p.asset.d,d:p.asset.w}:{w:p.asset.w,d:p.asset.d};}
function direction(p,sign=1){const z=p.asset.bridgeAxis===2;const x=z?0:sign,v=z?sign:0,c=Math.cos(p.rotation),s=Math.sin(p.rotation);return {x:Math.round(x*c+v*s),z:Math.round(v*c-x*s)};}
export function overlap(a,b){const x=dimensions(a),y=dimensions(b),ap=placementCenter(a),bp=placementCenter(b);return Math.abs(ap.x-bp.x)<(x.w+y.w)/2-.5&&Math.abs(ap.z-bp.z)<(x.d+y.d)/2-.5;}
export function collides(a,b){if(a===b||!overlap(a,b))return false;const ground=p=>['Terrain','Streets'].includes(p.asset.cat)&&!role(p);if(ground(a)&&ground(b))return true;if(a.asset.noCollision||b.asset.noCollision)return false;const beam=role(a)==='beam'?a:role(b)==='beam'?b:null,deck=beam===a?b:a;if(beam&&elevated(deck)){const top=beam.root.position.y+Number(beam.asset.h),surface=deck.root.position.y+(deck.asset.roadSurface||5);if(top<=surface+.5&&beam.root.position.y<deck.root.position.y)return false;}const ay=verticalRange(a),by=verticalRange(b);return ay.min<by.max-.5&&by.min<ay.max-.5;}
function length(p){return p.asset.bridgeAxis===2?p.asset.d:p.asset.w;}
export function bridgeTarget(p,x,z,others){const candidates=[],half=length(p)/2;
 for(const q of others){if(q===p||(!elevated(q)&&role(q)!=='ramp'))continue;
  const sides=role(q)==='ramp'?[q.asset.highSide||-1]:[-1,1];
  for(const side of sides){const d=direction(q,side);const rotation=q.rotation+(q.asset.bridgeAxis===2?Math.PI/2:0)-(p.asset.bridgeAxis===2?Math.PI/2:0);const at=q.root.position,height=elevated(q)?q.deckHeight:at.y+q.asset.deckHeight;if(!Number.isFinite(height))continue;
   candidates.push({x:at.x+d.x*(length(q)/2+half),z:at.z+d.z*(length(q)/2+half),y:height-(p.asset.roadSurface||5),height,rotation});
  }
 }
 candidates.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));
 const old=p.root.position.clone(),oldRotation=p.rotation;for(const c of candidates){if(Math.hypot(c.x-x,c.z-z)>Math.max(80,half))continue;p.rotation=c.rotation;if(p.root.rotation)p.root.rotation.y=c.rotation;p.root.position.set(c.x,c.y,c.z);if(!others.some(q=>collides(p,q))){p.deckHeight=c.height;return true;}}
 p.root.position.copy(old);p.rotation=oldRotation;if(p.root.rotation)p.root.rotation.y=oldRotation;return false;
}
function baseTile(p){return !role(p)&&['Terrain','Streets'].includes(p.asset.cat)&&!p.asset.noCollision;}
export function beamTarget(p,x,z,others){
 const bases=others.filter(baseTile),candidates=[];
 for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++){
  const a=bases[i],b=bases[j],da=dimensions(a),db=dimensions(b),ap=placementCenter(a),bp=placementCenter(b);
  for(const axis of ['x','z']){const cross=axis==='x'?'z':'x',aw=axis==='x'?da.w:da.d,bw=axis==='x'?db.w:db.d,ad=axis==='x'?da.d:da.w,bd=axis==='x'?db.d:db.w;if(Math.abs(Math.abs(ap[axis]-bp[axis])-(aw+bw)/2)>.5)continue;
   const low=Math.max(ap[cross]-ad/2,bp[cross]-bd/2),high=Math.min(ap[cross]+ad/2,bp[cross]+bd/2);if(high-low<1)continue;
   const seam=ap[axis]+Math.sign(bp[axis]-ap[axis])*aw/2,desired=cross==='x'?x:z;
   for(const along of [Math.max(low,Math.min(high,Math.round(desired/25)*25)),(low+high)/2])candidates.push({x:axis==='x'?seam:along,z:axis==='z'?seam:along});
  }
 }
 const anchors=[];for(const q of others.filter(elevated)){for(const side of [-1,1]){const d=direction(q,side),half=length(q)/2;anchors.push({x:q.root.position.x+d.x*half,z:q.root.position.z+d.z*half,rotation:q.rotation+(q.asset.bridgeAxis===2?Math.PI/2:0)});}}
 const near=anchors.filter(c=>Math.hypot(c.x-x,c.z-z)<=75);if(near.length){candidates.length=0;candidates.push(...near);}
 const old=p.root.position.clone();candidates.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));
 for(const c of candidates){if(Math.hypot(c.x-x,c.z-z)>60)continue;
  const left=c.x-25,right=c.x+25,top=c.z-25,bottom=c.z+25;
  const rects=bases.map(q=>{const d=dimensions(q),pos=placementCenter(q);return {q,l:Math.max(left,pos.x-d.w/2),r:Math.min(right,pos.x+d.w/2),t:Math.max(top,pos.z-d.d/2),b:Math.min(bottom,pos.z+d.d/2),y:verticalRange(q).max};}).filter(r=>r.r-r.l>.01&&r.b-r.t>.01);
  if(rects.length<2||Math.max(...rects.map(r=>r.y))-Math.min(...rects.map(r=>r.y))>10)continue;
  const xs=[...new Set([left,right,...rects.flatMap(r=>[r.l,r.r])])].sort((a,b)=>a-b),zs=[...new Set([top,bottom,...rects.flatMap(r=>[r.t,r.b])])].sort((a,b)=>a-b);let covered=true;
  for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){const mx=(xs[i-1]+xs[i])/2,mz=(zs[j-1]+zs[j])/2;if(!rects.some(r=>mx>=r.l&&mx<=r.r&&mz>=r.t&&mz<=r.b))covered=false;}
  if(!covered)continue;p.root.position.set(c.x,Math.max(...rects.map(r=>r.y)),c.z);
  if(!others.some(q=>!rects.some(r=>r.q===q)&&collides(p,q))){if(c.rotation!=null){p.rotation=c.rotation;p.root.rotation.y=c.rotation;}return true;}
 }
 p.root.position.copy(old);return false;
}
