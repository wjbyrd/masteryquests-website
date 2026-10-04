import test from 'node:test';
import assert from 'node:assert/strict';
import {createCities,advanceRegion} from '../model.js';
import {upgradeProgress} from '../upgrade-progress.js';
import {SPRITE_ROUTES,DISTRICTS,ROADS} from '../visual-config.js';
import {routeSample} from '../unit-routes.js';
import {onRoad,roadClearance,footprintCollision,occupiedFootprints,groundContact,depthOrder,layoutAudit,intersects} from '../scene-layout.js';

test('Road routes clear all occupied district and scenery footprints for both city densities',()=>{
  for(const [name,route]of Object.entries(SPRITE_ROUTES)){
    if(!route.category||route.pedestrian||route.service)continue;
    for(let tick=0;tick<route.period;tick+=.125){const {point}=routeSample(route,tick);assert.ok(onRoad(point),`${name} off road: ${point}`);for(const dense of [false,true])assert.equal(footprintCollision(point,occupiedFootprints(dense)),null,`${name} hits building at ${point}`);}
  }
});
test('Construction workers use service edges clear of every district and support building',()=>{
  for(const [key,[i,j]]of Object.entries(DISTRICTS))for(let tick=0;tick<32;tick+=.125){const {point:[a,b]}=routeSample(SPRITE_ROUTES.constructionWorker,tick);const layout=layoutAudit('meridian',{capital:9,resources:8,research:8,education:9},{construction:true});assert.equal(footprintCollision([i+a,j+b],[...layout.occupied.filter(f=>f.kind!=='construction'),...layout.scenery],.1),null,key);}
});
test('Scenery, including tree footprints, stays off road surfaces and clear of district lots',()=>{
  for(const dense of [false,true]){
    const all=occupiedFootprints(dense);
    for(const prop of all){assert.ok(roadClearance(prop.center)>=Math.min(prop.maxI-prop.minI,prop.maxJ-prop.minJ)/2+.5+.1,`${prop.id} intersects road surface`);
      for(const other of all){if(prop===other)continue;assert.ok(!intersects(prop,other),`${prop.id} overlaps ${other.id}`);}
    }
  }
});
test('One ground-contact ordering places a moving vehicle behind and in front of the same building',()=>{
  const building={id:'district:research',foot:groundContact(...DISTRICTS.research,40)};
  const behind={id:'truck',foot:groundContact(DISTRICTS.research[0],ROADS.cross,17)},front={id:'truck',foot:groundContact(DISTRICTS.research[0],ROADS.front,17)};
  assert.ok(depthOrder(behind,building)<0);assert.ok(depthOrder(front,building)>0);
  assert.deepEqual([front,building,behind].sort(depthOrder),[behind,building,front]);
});
test('Upgrade labels follow initial building offsets, cumulative goals and real resolution',()=>{
  let cities=createCities();const before=structuredClone(cities);
  assert.equal(upgradeProgress(cities[0],'capital').name,'Advanced manufacturing');assert.equal(upgradeProgress(cities[1],'capital').name,'Factory');
  const plan={capital:9,resources:3,research:4,education:4};cities=advanceRegion(cities,{meridian:plan,rivermark:plan},1);
  const p=upgradeProgress(cities[1],'capital',4);assert.equal(p.name,'Industrial complex');assert.equal(p.funded,9);assert.equal(p.required,15);assert.equal(p.projected,13);assert.equal(p.remaining,2);
  const first=upgradeProgress(before[1],'education',3);assert.equal(first.name,'Technical college');assert.equal(first.remaining,1);assert.deepEqual(before,createCities());
  const max={...cities[0],invested:{...cities[0].invested,capital:120}};assert.equal(upgradeProgress(max,'capital').complete,true);
});
