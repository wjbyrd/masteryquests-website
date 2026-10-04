import {DISTRICT_SPRITES} from './district-layout.js';

// World coordinates are shared by portrait and landscape. Scaling the camera
// also scales the sprites, so a phone never changes their occupied land.
export const SPLASH_ROADS = [
  ...[8,21,29,42].map(i=>({minI:i-.5,maxI:i+.5,minJ:9.5,maxJ:34.5})),
  ...[10,22,34].map(j=>({minI:7.5,maxI:42.5,minJ:j-.5,maxJ:j+.5})),
];
export const riverBanks=j=>[23+.45*Math.sin(j/7),27+.45*Math.sin(j/7)];
export const SPLASH_BUILDINGS = [
  ['capital',5,12.5,16],['research',4,17.5,16],
  ['education',4,12.5,28],['resources',3,17.5,28],
  ['capital',1,33,16],['research',1,38,16],
  ['education',1,33,28],['resources',1,38,28],
].map(([key,frame,i,j])=>{
  const f=DISTRICT_SPRITES[key][frame].groundFootprint;
  return {key,frame,i,j,footprint:{minI:i-f.widthTiles/2,maxI:i+f.widthTiles/2,minJ:j-f.heightTiles/2,maxJ:j+f.heightTiles/2}};
});
export const SPLASH_TREES = [[6,14],[6,19],[6,27],[6,31],[12,37],[18,37],[33,37],[39,37],[44,15],[44,28],[17,7],[37,7]];
// Small support sprites use bottom/front contact, unlike centered district lots.
// Reserve the complete ground base plus a setback around each neighborhood.
export const SPLASH_NEIGHBORHOODS = [[12.5,12],[17.5,12],[12.5,24],[17.5,24],[33,12],[38,12],[33,24],[38,24]];
export const supportLot=([i,j])=>({minI:i-1.4,maxI:i+.65,minJ:j-1.4,maxJ:j+.65});
export const overlaps=(a,b)=>a.minI<b.maxI&&a.maxI>b.minI&&a.minJ<b.maxJ&&a.maxJ>b.minJ;
export function splashLayoutAudit(){
  const errors=[];
  for(const [n,b] of SPLASH_BUILDINGS.entries()){
    for(const r of SPLASH_ROADS)if(overlaps(b.footprint,r))errors.push(`building ${n} overlaps road`);
    // The whole meandering water corridor, including embankment, is reserved.
    if(overlaps(b.footprint,{minI:22,maxI:28,minJ:-100,maxJ:100}))errors.push(`building ${n} overlaps riverbank`);
    for(const other of SPLASH_BUILDINGS.slice(n+1))if(overlaps(b.footprint,other.footprint))errors.push(`building ${n} overlaps building`);
  }
  for(const [i,j] of SPLASH_TREES)for(const road of SPLASH_ROADS)if(overlaps({minI:i-.5,maxI:i+.5,minJ:j-.5,maxJ:j+.5},road))errors.push('tree overlaps road');
  for(const p of SPLASH_NEIGHBORHOODS){
    for(const road of SPLASH_ROADS)if(overlaps(supportLot(p),road))errors.push('neighborhood overlaps road');
    for(const building of SPLASH_BUILDINGS)if(overlaps(supportLot(p),building.footprint))errors.push('neighborhood overlaps district');
  }
  return errors;
}
