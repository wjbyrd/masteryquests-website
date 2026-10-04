import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,commitRun} from '../session.js';
import {adjustDevelopment} from '../planning-ui.js';
import {routeSample,segmentDirection} from '../unit-routes.js';
import {SPRITE_ROUTES,UNIT_VISUALS,iso,MAP,CAMERA,DISTRICT_HITBOX} from '../visual-config.js';

test('A–E: direct/quick allocations, clamping, undo and commit use the unchanged session contract',()=>{
  const r=createRun('rivermark',{random:()=>.2});const before=structuredClone(r.cities);
  assert.equal(adjustDevelopment(r,'capital',1),1);
  for(let n=0;n<5;n++)adjustDevelopment(r,'research',1);
  assert.equal(r.allocation.research,5);assert.equal(commitRun(r),false);
  assert.equal(adjustDevelopment(r,'education',5),5);assert.equal(adjustDevelopment(r,'education',-1),-1);assert.equal(adjustDevelopment(r,'education','clear'),-4);assert.equal(adjustDevelopment(r,'education',-1),0);
  for(let n=0;n<2;n++)adjustDevelopment(r,'resources',5);
  assert.equal(adjustDevelopment(r,'education',5),4);assert.equal(adjustDevelopment(r,'capital',1),0);const stocks=cities=>cities.map(({developmentPoints,...c})=>c);assert.deepEqual(stocks(r.cities),stocks(before),'planning changes no city stocks/buildings');
  assert.equal(commitRun(r),true);assert.equal(adjustDevelopment(r,'capital','clear'),0,'locked after commitment');
});
test('Reject invalid UI commands and unknown categories without mutation',()=>{const r=createRun('meridian');for(const [k,a]of[['capital',1.5],['capital',100],['capital',0],['wat',5]])assert.equal(adjustDevelopment(r,k,a),0);assert.equal(Object.values(r.allocation).reduce((a,b)=>a+b),0);});
test('I/J: every route segment and closing segment faces its projected movement vector',()=>{
  assert.deepEqual([[0,-1],[-1,0],[1,0],[0,1]].map(v=>segmentDirection([0,0],v)),['NE','NW','SE','SW']);
  for(const [name,route]of Object.entries(SPRITE_ROUTES)){
    const directions=new Set();
    for(let s=0;s<route.points.length;s++){
      const a=route.points[s],b=route.points[(s+1)%route.points.length];
      assert.ok((a[0]===b[0])!==(a[1]===b[1]),`${name}: diagonal world-space road segment`);
      const tick=(s+.2)*route.period/route.points.length, first=routeSample(route,tick),second=routeSample(route,tick+.1);
      assert.equal(first.direction,segmentDirection(first.point,second.point),name);assert.equal(first.segment,s);directions.add(first.direction);
      assert.ok(UNIT_VISUALS[route.unit][first.direction]);
      const [x0,y0]=iso(...first.point),[x1,y1]=iso(...second.point);assert.ok(Math.abs(Math.abs((y1-y0)/(x1-x0))-.5)<1e-8,name);
    }
    assert.ok(directions.size>=2,name);
  }
});
test('Every moving unit has distinct rear/front poses and four discrete facings',()=>{
  assert.equal(Object.keys(UNIT_VISUALS).length,6);
  for(const unit of Object.values(UNIT_VISUALS)){assert.deepEqual(Object.keys(unit).sort(),['NE','NW','SE','SW']);assert.notEqual(unit.NE.frame,unit.SW.frame);assert.equal(unit.NE.frame,unit.NW.frame);assert.notEqual(unit.NE.flip,unit.NW.flip);assert.equal(unit.SW.frame,unit.SE.frame);assert.notEqual(unit.SW.flip,unit.SE.flip);}
  assert.ok(MAP.width>=CAMERA.width);assert.ok(DISTRICT_HITBOX.width/CAMERA.width*280>44);assert.ok(DISTRICT_HITBOX.height/CAMERA.width*280>44);
});

// Compare distance on the ground plane, not just animation cycle lengths.
test('Walking is slower than every traffic route while preserving route geometry',()=>{
  const speeds=Object.fromEntries(Object.entries(SPRITE_ROUTES).map(([name,r])=>[name,r.points.map((a,i)=>{const b=r.points[(i+1)%r.points.length];return Math.hypot(a[0]-b[0],a[1]-b[1])*r.points.length/r.period*MAP.fps;})]));
  const walking=Math.max(...speeds.campusStudents,...speeds.constructionWorker);
  const slowestTraffic=Math.min(...speeds.factoryTruck,...speeds.campusBus,...speeds.farmTractor,...speeds.researchService);
  assert.ok(walking<slowestTraffic*.6);assert.ok(Math.min(...speeds.campusStudents)>.3);
});
