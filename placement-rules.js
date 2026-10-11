// Placement coordinates are independent of the visible model's exported origin.
// Bridge roles continue to use their established catalog footprint and origin.
export function placementBase(p){return p.asset.bridgeRole?null:p.asset.placementBase||null;}
export function placementCenter(p,position=p.root.position,rotation=p.rotation){
 const base=placementBase(p);if(!base)return {x:position.x,y:position.y,z:position.z};
 const c=Math.cos(rotation),s=Math.sin(rotation);
 return {x:position.x+base.x*c+base.z*s,y:position.y+base.bottom,z:position.z-base.x*s+base.z*c};
}
export function setPlacementCenter(p,x,y,z){
 const base=placementBase(p),c=Math.cos(p.rotation),s=Math.sin(p.rotation);
 p.root.position.set(x-(base?base.x*c+base.z*s:0),y-(base?base.bottom:0),z-(base?-base.x*s+base.z*c:0));
}
export function verticalRange(p){
 const b=placementBase(p)&&p.asset.sourceBounds;
 return b?{min:p.root.position.y+b.minY,max:p.root.position.y+b.maxY}:{min:p.root.position.y,max:p.root.position.y+(Number(p.asset.h)||5)};
}
