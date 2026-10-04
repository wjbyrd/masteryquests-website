import {SPRITE_ROUTES, ROADS, UNIT_GROUND} from './visual-config.js';
import {segmentDirection} from './unit-routes.js';
import {unitFootprint, intersects, bounds} from './scene-layout.js';

export const FOLLOWING_GAP=.7;
export const JUNCTIONS=[ROADS.spine,ROADS.east].flatMap(i=>[ROADS.cross,ROADS.front].map(j=>({id:`${i}:${j}`,...bounds([i,j],3)})));
export const routeLength=r=>r.points.reduce((s,a,i)=>{const b=r.points[(i+1)%r.points.length];return s+Math.hypot(b[0]-a[0],b[1]-a[1]);},0);
export function distanceSample(route,distance){
  let d=((distance%routeLength(route))+routeLength(route))%routeLength(route);
  for(let n=0;n<route.points.length;n++){
    const a=route.points[n],b=route.points[(n+1)%route.points.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(d<length||n===route.points.length-1){const f=d/length;return{point:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],direction:segmentDirection(a,b),segment:n};}
    d-=length;
  }
}
const body=v=>unitFootprint(v.unit,v.point,v.direction);
const expanded=(b,p)=>({minI:b.minI-p,maxI:b.maxI+p,minJ:b.minJ-p,maxJ:b.maxJ+p});
const sweep=(a,b)=>({minI:Math.min(a.minI,b.minI),maxI:Math.max(a.maxI,b.maxI),minJ:Math.min(a.minJ,b.minJ),maxJ:Math.max(a.maxJ,b.maxJ)});
export const createTraffic=()=>({vehicles:[],locks:{},time:0});
export function syncTraffic(world,city){
  const desired=Object.entries(SPRITE_ROUTES).filter(([id,r])=>r.lane&&city.buildings[r.category]>=r.minLevel&&!(id==='researchService'&&city.constraints.resourceShortage));
  world.vehicles=world.vehicles.filter(v=>desired.some(([id])=>id===v.id));
  for(const [key,id]of Object.entries(world.locks))if(!world.vehicles.some(v=>v.id===id))delete world.locks[key];
  for(const [id,route]of desired){
    if(world.vehicles.some(v=>v.id===id))continue;
    const sample=distanceSample(route,route.offset),v={id,route:id,lane:route.lane,unit:route.unit,progress:route.offset,speed:route.speed,...sample,traveled:0,actualSpeed:0,ahead:null,waiting:null};
    const b=body(v),junctions=JUNCTIONS.filter(j=>intersects(j,b));
    if(world.vehicles.some(other=>intersects(expanded(b,FOLLOWING_GAP),body(other)))||junctions.some(j=>world.locks[j.id]))continue;
    world.vehicles.push(v);for(const j of junctions)world.locks[j.id]=id;
  }
}
export function stepTraffic(world,seconds){
  // Small bounded steps stop fast actors tunneling through stationary traffic.
  const steps=Math.max(1,Math.ceil(seconds/.025)),dt=seconds/steps;
  for(const v of world.vehicles){v.actualSpeed=0;v.waiting=null;}
  for(let step=0;step<steps;step++){
    for(const j of JUNCTIONS){const owner=world.vehicles.find(v=>v.id===world.locks[j.id]);if(!owner||!intersects(j,body(owner)))delete world.locks[j.id];}
    for(const v of world.vehicles){
      const route=SPRITE_ROUTES[v.route],length=routeLength(route);
      const leaders=world.vehicles.filter(o=>o!==v&&o.lane===v.lane).map(o=>({o,gap:((o.progress-v.progress)%length+length)%length})).sort((a,b)=>a.gap-b.gap);
      const ahead=leaders[0];v.ahead=ahead?.o.id||null;
      const room=ahead?Math.max(0,ahead.gap-(UNIT_GROUND[v.unit][0]+UNIT_GROUND[ahead.o.unit][0])/2-FOLLOWING_GAP):Infinity;
      const travel=Math.min(v.speed*dt,room),sample=distanceSample(route,v.progress+travel),old=body(v),next=unitFootprint(v.unit,sample.point,sample.direction),swept=sweep(old,next);
      const junctions=JUNCTIONS.filter(j=>intersects(j,swept));
      if(junctions.some(j=>world.locks[j.id]&&world.locks[j.id]!==v.id)){v.waiting='intersection';continue;}
      if(world.vehicles.some(o=>o!==v&&intersects(expanded(swept,.06),body(o)))){v.waiting='clearance';continue;}
      for(const j of junctions)world.locks[j.id]=v.id;
      v.progress=(v.progress+travel)%length;v.traveled+=travel;v.actualSpeed+=travel/seconds;Object.assign(v,sample);
      if(travel<v.speed*dt)v.waiting='following';
    }
    world.time+=dt;
  }
  return world;
}

