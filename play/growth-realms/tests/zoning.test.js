import test from 'node:test';
import assert from 'node:assert/strict';
import {GAME_BALANCE as B} from '../config.js';
import {BUILDING_VISUALS,SPRITE_ROUTES} from '../visual-config.js';
import {DISTRICT_PARCELS,PROTECTED_ROADS,SIDEWALKS,CONSTRUCTION_VISUALS,CONSTRUCTION_FOOTPRINT,WORKER_FOOTPRINT,districtAnchor} from '../district-layout.js';
import {layoutAudit,bounds,contains,intersects,footprintCollision,buildingFootprint,parcelBounds,unitFootprint,onSidewalk,constructionWalks} from '../scene-layout.js';
import {routeSample} from '../unit-routes.js';
const cities=['meridian','rivermark'],keys=['capital','resources','research','education'];
const maximum=city=>Object.fromEntries(keys.map(k=>[k,B.initialBuildings[city][k]+B.buildingPointThresholds.length]));
test('A–F: both maximum cities and every individual visual level retain their anchors and fit',()=>{
  for(const city of cities)for(const category of keys)for(let level=0;level<=maximum(city)[category];level++){
    const levels={...maximum(city),[category]:level},before=districtAnchor(city,category);
    for(const construction of [false,true])assert.deepEqual(layoutAudit(city,levels,{construction}).errors,[],`${city} ${category} ${level}`);
    assert.deepEqual(buildingFootprint(city,category,level).center,before);
  }
});
test('Measured ground corners fit their metadata independently of image height',()=>{
  for(const [id,{levels}]of Object.entries(BUILDING_VISUALS))for(const v of levels){
    assert.ok(v.width>0&&v.height>0);assert.ok(v.sourceRect[0]+v.sourceRect[2]<=1536&&v.sourceRect[1]+v.sourceRect[3]<=1024);
    const b=bounds([0,0],v.groundFootprint.widthTiles,v.groundFootprint.heightTiles);
    for(const [sx,sy]of v.sourceGroundCorners){const x=(sx-v.sourceAnchor[0])*v.scale,y=(sy-v.sourceAnchor[1])*v.scale;assert.ok(contains(b,bounds([x/64+y/32,y/32-x/64],0)),`${id} ${v.frame}`);}
  }
  assert.ok(BUILDING_VISUALS.research.levels[4].height>BUILDING_VISUALS.research.levels[3].height);
});
test('Invalid road, neighboring parcel and directional expansion are reported explicitly',()=>{
  const p=DISTRICT_PARCELS.meridian.education,original=structuredClone(p);
  try{
    p.anchorX=7.5;assert.ok(layoutAudit('meridian',maximum('meridian')).errors.some(e=>/Meridian Education Level 9 intersects road/.test(e)));
    p.anchorX=11.25;assert.ok(layoutAudit('meridian',maximum('meridian')).errors.some(e=>/capital intersects education/.test(e)));
    Object.assign(p,structuredClone(original));p.expansionLimits.positiveI=.2;assert.ok(layoutAudit('meridian',maximum('meridian')).errors.some(e=>/allowed expansion/.test(e)));
  }finally{Object.assign(p,original);}
});
test('G: all construction bases and worker routes fit parcels and avoid roads/annexes',()=>{
  for(const v of Object.values(CONSTRUCTION_VISUALS))assert.ok(v.groundFootprint.widthTiles<=CONSTRUCTION_FOOTPRINT.widthTiles&&v.groundFootprint.heightTiles<=CONSTRUCTION_FOOTPRINT.heightTiles);
  for(const city of cities){const a=layoutAudit(city,maximum(city),{construction:true});
    for(const id of keys)for(let tick=0;tick<32;tick+=.125){const sample=routeSample(SPRITE_ROUTES.constructionWorker,tick),anchor=districtAnchor(city,id),point=sample.point.map((v,i)=>v+anchor[i]),worker=bounds(point,WORKER_FOOTPRINT);
      assert.ok(contains(parcelBounds(DISTRICT_PARCELS[city][id]),worker));assert.ok(!PROTECTED_ROADS.some(r=>intersects(r,worker)));
      assert.equal(footprintCollision(point,[...a.occupied,...a.scenery],WORKER_FOOTPRINT/2),null,`${city} ${id} worker`);
    }
  }
});
test('H: full vehicle bodies clear all maximum buildings and protected corridors',()=>{
  for(const city of cities)for(const construction of [false,true]){const a=layoutAudit(city,maximum(city),{construction});
    for(const r of Object.values(SPRITE_ROUTES).filter(r=>r.category&&!r.pedestrian))for(let t=0;t<r.period;t+=.125){const {point,direction}=routeSample(r,t),body=unitFootprint(r.unit,point,direction);
      assert.ok(PROTECTED_ROADS.some(road=>contains(road,body)));assert.ok(![...a.occupied,...a.scenery].some(f=>intersects(body,f)));
    }
  }
});
test('Pedestrians use continuous sidewalks; workers use paved service paths; neither enters traffic',()=>{
  for(const sidewalk of SIDEWALKS)assert.ok(!PROTECTED_ROADS.some(r=>intersects(sidewalk,r)));
  const route=SPRITE_ROUTES.campusStudents;
  for(const city of cities)for(const construction of [false,true]){
    const a=layoutAudit(city,maximum(city),{construction});
    for(const sidewalk of SIDEWALKS)assert.ok(![...a.occupied,...a.scenery].some(f=>intersects(sidewalk,f)));
    for(let t=0;t<route.period;t+=.125){const {point,direction}=routeSample(route,t),body=unitFootprint('students',point,direction);
      assert.ok(onSidewalk(body),`Student off pavement at ${point}`);assert.ok(!PROTECTED_ROADS.some(r=>intersects(body,r)));
    }
    for(const id of keys){const paths=constructionWalks(city,id),anchor=districtAnchor(city,id);
      for(const path of paths)assert.ok(![...PROTECTED_ROADS,...a.occupied].some(f=>intersects(path,f)));
      for(let t=0;t<32;t+=.125){const s=routeSample(SPRITE_ROUTES.constructionWorker,t),body=unitFootprint('worker',s.point.map((n,i)=>n+anchor[i]),s.direction);assert.ok(paths.some(path=>contains(path,body)));}
    }
  }
});
test('I: scenery removes obstructing props as lots grow and during construction',()=>{
  for(const city of cities){const small=layoutAudit(city,Object.fromEntries(keys.map(k=>[k,0]))),large=layoutAudit(city,maximum(city)),building=layoutAudit(city,maximum(city),{construction:true});
    assert.ok(small.scenery.some(p=>p.id==='tree:5'));assert.ok(large.hiddenScenery.includes('tree:5'));
    for(const a of [small,large,building])for(const p of a.scenery)assert.ok(![...PROTECTED_ROADS,...a.occupied,...a.scenery.filter(o=>o!==p)].some(o=>intersects(p,o)));
  }
});
