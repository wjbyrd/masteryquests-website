import test from 'node:test';
import assert from 'node:assert/strict';
import {createTraffic,syncTraffic,stepTraffic,distanceSample,routeLength,FOLLOWING_GAP,JUNCTIONS} from '../traffic.js';
import {createCities} from '../model.js';
import {SPRITE_ROUTES,UNIT_GROUND} from '../visual-config.js';
import {FARM_FIELD,PROTECTED_ROADS} from '../district-layout.js';
import {unitFootprint,contains,intersects,layoutAudit} from '../scene-layout.js';
import {walkPose} from '../walking-sprites.js';

test('Five vehicles circulate with same-lane clearance, exclusive junctions and no collisions across many loops',()=>{
  const city=createCities()[0];city.buildings={capital:9,resources:9,research:9,education:9};city.constraints={};
  const before=structuredClone(city),world=createTraffic(),waits=new Set();
  for(let tick=0;tick<6000;tick++){
    syncTraffic(world,city);stepTraffic(world,.125);
    for(const a of world.vehicles){
      const body=unitFootprint(a.unit,a.point,a.direction);if(a.waiting)waits.add(a.waiting);
      for(const b of world.vehicles.filter(b=>b!==a)){
        assert.ok(!intersects(body,unitFootprint(b.unit,b.point,b.direction)),`${a.id} overlaps ${b.id} at ${tick}`);
        if(a.lane===b.lane){const length=routeLength(SPRITE_ROUTES[a.route]),gap=(b.progress-a.progress+length)%length;
          assert.ok(gap>=(UNIT_GROUND[a.unit][0]+UNIT_GROUND[b.unit][0])/2+FOLLOWING_GAP-1e-7);}
      }
    }
    for(const j of JUNCTIONS)assert.ok(world.vehicles.filter(v=>intersects(j,unitFootprint(v.unit,v.point,v.direction))).length<=1,`junction ${j.id} shared`);
  }
  assert.equal(world.vehicles.length,5);
  for(const v of world.vehicles)assert.ok(v.traveled>routeLength(SPRITE_ROUTES[v.route])*12,`${v.id} stalled`);
  assert.ok(waits.has('following')&&waits.has('intersection'));assert.deepEqual(city,before);
});
test('Tractor stays inside agricultural service land, clear of streets and every maximum district',()=>{
  const route=SPRITE_ROUTES.farmTractor;
  for(const city of ['meridian','rivermark']){
    const layout=layoutAudit(city,{capital:9,resources:9,research:9,education:9},{construction:true});
    for(let d=0;d<routeLength(route);d+=.02){const s=distanceSample(route,d),body=unitFootprint('tractor',s.point,s.direction);
      assert.ok(contains(FARM_FIELD,body));assert.ok(![...PROTECTED_ROADS,...layout.occupied,...layout.scenery].some(b=>intersects(b,body)));}
  }
  assert.ok(route.speed<SPRITE_ROUTES.factoryTruck.speed/2);
});
test('Distance drives eight walking poses; stopped people settle without cycling',()=>{
  assert.deepEqual(Array.from({length:8},(_,i)=>walkPose(i*2)),[0,1,2,3,4,5,6,7]);
  assert.equal(walkPose(16),0);assert.equal(walkPose(500,false),8);
});
