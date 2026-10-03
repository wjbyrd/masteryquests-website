import {BUILDING_VISUALS, UNIT_GROUND, ROADS, iso} from './visual-config.js';
import {DISTRICT_PARCELS, PROTECTED_ROADS, SIDEWALKS, WORKER_PATH, WORKER_FOOTPRINT, districtAnchor, ANNEX_SITES, ANNEX_SCALE, CONSTRUCTION_FOOTPRINT, SERVICE_AREAS} from './district-layout.js';

export const VEHICLE_CLEARANCE=.45;
export const SCENERY={
  // Trees sit on the inner side of the east road. On its outer side their tall
  // canopies obscured passing vehicles even when their trunks cleared the road.
  trees:[[.5,1],[.5,7],[14.95,1],[14.95,4],[14.95,12],[5.5,3.75]],
  houses:[[1.8,.8],[10.2,.8],[.8,11]],
  apartments:[[1.8,.8],[4.2,.8],[10.2,.8],[12.6,.8],[.8,11]],
  warehouse:[.95,4.1],power:[.8,13.6],
};
export const bounds=(center,width,height=width)=>({minI:center[0]-width/2,maxI:center[0]+width/2,minJ:center[1]-height/2,maxJ:center[1]+height/2});
const EPSILON=1e-9; // Floating-point equality at touching service-walk boundaries.
export const intersects=(a,b)=>a.minI<b.maxI-EPSILON&&a.maxI>b.minI+EPSILON&&a.minJ<b.maxJ-EPSILON&&a.maxJ>b.minJ+EPSILON;
export const contains=(a,b)=>b.minI>=a.minI-EPSILON&&b.maxI<=a.maxI+EPSILON&&b.minJ>=a.minJ-EPSILON&&b.maxJ<=a.maxJ+EPSILON;
export const parcelBounds=p=>bounds([p.anchorX,p.anchorY],p.width,p.height);
export function unitFootprint(unit,point,direction){const [length,width]=UNIT_GROUND[unit];return ['NW','SE'].includes(direction)?bounds(point,length,width):bounds(point,width,length);}
export function constructionWalks(city,id){
  const anchor=districtAnchor(city,id),half=WORKER_FOOTPRINT/2;
  return WORKER_PATH.map((p,i)=>{const q=WORKER_PATH[(i+1)%WORKER_PATH.length];return {minI:anchor[0]+Math.min(p[0],q[0])-half,maxI:anchor[0]+Math.max(p[0],q[0])+half,minJ:anchor[1]+Math.min(p[1],q[1])-half,maxJ:anchor[1]+Math.max(p[1],q[1])+half};});
}
// Screen-space ground effects have a separate projected envelope. They may
// overlay their own district, but still may not paint a neighboring road.
export function effectFootprint(city,id,[x0,y0,x1,y1]){
  const anchor=districtAnchor(city,id),points=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>[anchor[0]+x/64+y/32,anchor[1]+y/32-x/64]);
  return {minI:Math.min(...points.map(p=>p[0])),maxI:Math.max(...points.map(p=>p[0])),minJ:Math.min(...points.map(p=>p[1])),maxJ:Math.max(...points.map(p=>p[1]))};
}
export function buildingFootprint(city,id,level,offset=[0,0],scale=1){
  const v=BUILDING_VISUALS[id].levels[Math.min(5,level)],anchor=districtAnchor(city,id),center=anchor.map((n,i)=>n+offset[i]);
  return {id,level,center,...bounds(center,v.groundFootprint.widthTiles*scale,v.groundFootprint.heightTiles*scale)};
}
export function districtOccupancy(city,id,level,{construction=false}={}){
  const main={...buildingFootprint(city,id,level),kind:'building'},items=[main];
  for(let n=0;n<Math.max(0,level-5);n++){
    if(!ANNEX_SITES[n])throw new Error(`No annex parcel for ${city} ${id} Level ${level}`);
    items.push({...buildingFootprint(city,id,1,ANNEX_SITES[n],ANNEX_SCALE),id:`${id}:annex:${n}`,district:id,kind:'annex'});
  }
  if(construction){
    const center=districtAnchor(city,id);
    items.push({id:`${id}:construction`,district:id,kind:'construction',center,...bounds(center,CONSTRUCTION_FOOTPRINT.widthTiles,CONSTRUCTION_FOOTPRINT.heightTiles)});
  }
  // These strips remain reserved between cycles for partly funded materials.
  for(const [name,a]of Object.entries(SERVICE_AREAS)){
    const center=districtAnchor(city,id).map((v,i)=>v+a.offset[i]);
    items.push({id:`${id}:${name}`,district:id,kind:name,center,...bounds(center,a.widthTiles,a.heightTiles)});
  }
  return items;
}
export function sceneryCandidates(dense=true){
  return [...SCENERY.trees.map((center,i)=>({id:`tree:${i}`,type:'tree',center,half:.45})),
    ...(dense?SCENERY.apartments:SCENERY.houses).map((center,i)=>({id:`house:${i}`,type:dense?'apartments':'house',center,half:.75})),
    ...(dense?[{id:'warehouse',type:'warehouse',center:SCENERY.warehouse,half:.95},{id:'power',type:'power',center:SCENERY.power,half:.8}]:[])
  ].map(p=>({...p,...bounds(p.center,p.half*2)}));
}
export function visibleScenery(city,occupied,dense=true){
  const accepted=[];
  for(const p of sceneryCandidates(dense)){
    if(!contains({minI:0,maxI:ROADS.extent+1,minJ:0,maxJ:ROADS.river},p))continue;
    // Protect the service walk during construction, including worker width.
    const constructionParcels=occupied.filter(x=>x.kind==='construction').map(x=>parcelBounds(DISTRICT_PARCELS[city][x.district]));
    if([...PROTECTED_ROADS,...SIDEWALKS,...occupied,...constructionParcels,...accepted].some(b=>intersects(p,b)))continue;
    accepted.push(p);
  }
  return accepted;
}
export function layoutAudit(city,levels,{construction=false}={}){
  const occupied=Object.entries(levels).flatMap(([id,level])=>districtOccupancy(city,id,level,{construction})),errors=[];
  for(const f of occupied){
    const id=f.district||f.id,p=DISTRICT_PARCELS[city][id],prefix=`District footprint collision: ${city==='meridian'?'Meridian':'Rivermark'} ${id==='capital'?'Industry':id[0].toUpperCase()+id.slice(1)} Level ${levels[id]}`;
    const road=PROTECTED_ROADS.find(r=>intersects(f,r));
    if(road)errors.push(`${prefix} intersects road (${road.id}; ${f.kind}).`);
    if(SIDEWALKS.some(s=>intersects(f,s)))errors.push(`${prefix} intersects sidewalk (${f.kind}).`);
    if(!contains(parcelBounds(p),f))errors.push(`${prefix} exceeds parcel (${f.kind}).`);
    const lim=p.expansionLimits,allowed={minI:p.anchorX-lim.negativeI,maxI:p.anchorX+lim.positiveI,minJ:p.anchorY-lim.negativeJ,maxJ:p.anchorY+lim.positiveJ};
    if(!contains(allowed,f))errors.push(`${prefix} exceeds allowed expansion (${f.kind}).`);
  }
  for(let a=0;a<occupied.length;a++)for(let b=a+1;b<occupied.length;b++){
    const x=occupied[a],y=occupied[b];
    // Main/construction are successive states occupying the same lot.
    if((x.district||x.id)===(y.district||y.id)&&(x.kind==='construction'||y.kind==='construction'))continue;
    if(intersects(x,y))errors.push(`District footprint collision: ${city} ${x.id} intersects ${y.id}.`);
  }
  const effects=Object.keys(levels).flatMap(id=>[[-78,46,78,52],[-45,2,50,31],[-43,43,43,60]].map(rect=>({id,...effectFootprint(city,id,rect)})));
  for(const e of effects)if(PROTECTED_ROADS.some(r=>intersects(e,r))||!contains(parcelBounds(DISTRICT_PARCELS[city][e.id]),e))errors.push(`District effect collision: ${city} ${e.id} exceeds protected parcel.`);
  const scenery=visibleScenery(city,occupied,levels.capital>=3);
  return {errors,occupied,effects,scenery,hiddenScenery:sceneryCandidates(levels.capital>=3).filter(p=>!scenery.some(s=>s.id===p.id)).map(p=>p.id)};
}
// Compatibility helpers for route/depth tests now use measured maximum lots.
export function occupiedFootprints(dense=true){const levels={capital:5,resources:5,research:5,education:5};const a=layoutAudit('meridian',levels);return [...a.occupied,...visibleScenery('meridian',a.occupied,dense)].map(p=>({...p,half:Math.max(p.maxI-p.minI,p.maxJ-p.minJ)/2}));}
export function onRoad(point){return PROTECTED_ROADS.some(r=>contains(r,bounds(point,0)));}
export function onSidewalk(footprint){return SIDEWALKS.some(s=>contains(s,footprint));}
export function roadClearance([i,j]){return Math.min(Math.abs(i-ROADS.spine),Math.abs(i-ROADS.east),Math.abs(j-ROADS.cross),Math.abs(j-ROADS.front));}
export function footprintCollision(point,footprints=occupiedFootprints(),clearance=VEHICLE_CLEARANCE){return footprints.find(f=>intersects(bounds(point,clearance*2),f))?.id||null;}
export function groundContact(i,j,offset=0){const [x,y]=iso(i,j);return {x,y:y+offset};}
export function depthOrder(a,b){return a.foot.y-b.foot.y||a.foot.x-b.foot.x||a.id.localeCompare(b.id);}

