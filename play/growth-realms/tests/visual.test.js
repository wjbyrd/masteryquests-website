import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {GAME_BALANCE, CPU_DOCTRINES, CYCLES} from '../config.js';
import {createRun, commitRun, finishRunCycle, nextRunCycle} from '../session.js';
import {createCities} from '../model.js';
import {ASSETS, BUILDING_VISUALS, LAYERS, SPRITE_ROUTES, visualState, intensity, constructionStage} from '../visual-config.js';
const lock=JSON.parse(fs.readFileSync(new URL('./visual-economy-lock.json',import.meta.url)));
const keys=['capital','resources','research','education'];
const plan=(...values)=>Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
function commit(run,allocation){run.allocation=allocation;assert.ok(commitRun(run));return run.cities.map(city=>visualState(city,{allocation:run.committedAllocations[city.id],pending:run.pendingCities.find(c=>c.id===city.id),phase:'building'}));}
test('Economic lock: formulas, doctrines, thresholds, point budgets, and session are unchanged',()=>{
  assert.deepEqual(GAME_BALANCE,lock.GAME_BALANCE);assert.deepEqual(CPU_DOCTRINES,lock.CPU_DOCTRINES);assert.deepEqual(CYCLES,lock.CYCLES);
  for(const [file,hash] of Object.entries(lock.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+file,import.meta.url))).digest('hex'),hash,file);
});
test('1/2: only authoritative thresholds complete a structure; small education spending leaves materials',()=>{
  const r=createRun('rivermark',{random:()=>.2}),before=structuredClone(r.cities);
  const views=commit(r,plan(10,4,3,3)),v=views.find(v=>v.city.id==='rivermark');
  assert.equal(v.districts.find(d=>d.id==='capital').changed,true);
  assert.equal(v.districts.find(d=>d.id==='education').changed,false);
  assert.deepEqual(r.cities,before);finishRunCycle(r);
  const final=visualState(r.cities.find(c=>c.id==='rivermark'));
  const edu=final.districts.find(d=>d.id==='education');assert.equal(edu.level,1);assert.equal(edu.partial,true);assert.equal(edu.progress,.75);
});
test('3/4/5: research/resource priorities and both cities use their own allocations',()=>{
  for(const priority of ['research','resources']){const r=createRun('rivermark',{random:()=>.2}),allocation=plan(2,2,2,2);allocation[priority]=14;const views=commit(r,allocation);assert.equal(views.length,2);for(const v of views){assert.ok(v.districts.some(d=>d.intensity>0));assert.equal(v.districts.reduce((s,d)=>s+d.points,0),20);}assert.equal(views.find(v=>v.city.id==='rivermark').districts.find(d=>d.dominant).id,priority);}
  assert.deepEqual([0,1,3,4,6,7,9,10,20].map(intensity),[0,1,1,2,2,3,3,4,4]);
});
test('6/12: replay changes doctrine and restores exact starting visual state',()=>{
  const a=createRun('rivermark',{random:()=>.2});commit(a,plan(10,4,3,3));finishRunCycle(a);
  const b=createRun('meridian',{random:()=>.2,previousDoctrine:a.rivalDoctrine});assert.notEqual(b.rivalDoctrine,a.rivalDoctrine);
  assert.deepEqual(b.cities.map(c=>visualState(c)),createCities().map(c=>visualState(c)));
});
test('7/8: catch-up and frontier paths modernize existing districts; raw levels above five have annexes',()=>{
  for(const id of ['rivermark','meridian']){const r=createRun(id,{random:()=>.2});for(let i=0;i<6;i++){commit(r,id==='rivermark'?plan(10,4,3,3):plan(2,3,8,7));finishRunCycle(r);if(i<5)nextRunCycle(r);}const city=r.cities.find(c=>c.id===id);const v=visualState(city);assert.ok(v.districts.every(d=>d.level>GAME_BALANCE.initialBuildings[id][d.id]));assert.ok(v.roadLevel>=3);}
  const c=createCities()[0];c.buildings.capital=9;const d=visualState(c).districts.find(d=>d.id==='capital');assert.equal(d.frame,5);assert.equal(d.annexes,4);
});
test('9/10: indicators mirror existing diagnostics and never mutate economic state',()=>{
  const c=createCities()[1];for(const k of Object.keys(c.constraints))c.constraints[k]=true;const before=structuredClone(c),v=visualState(c);assert.deepEqual(c,before);assert.equal(v.diagnostics.length,5);assert.ok(v.diagnostics.some(d=>d.key==='technologyAdoption'));assert.ok(v.diagnostics.some(d=>d.key==='resourceShortage'));
});
test('11: complete is a direct state swap; five construction phases are explicit',()=>{assert.deepEqual([0,.2,.4,.6,.8,1].map(constructionStage),['site-prep','foundation','frame','finishing','complete','complete']);});
test('Asset and layer contract: complete atlases, six levels/category, bounded source rectangles, fixed routes',()=>{
  assert.equal(constructionStage(-.001),'site-prep','rAF timestamp may slightly precede performance.now at commit');
  assert.equal(LAYERS.length,9);
  for(const key of keys)assert.equal(BUILDING_VISUALS[key].levels.length,6);
  for(const a of Object.values(ASSETS).filter(a=>a.src)){const data=fs.readFileSync(new URL('../'+a.src,import.meta.url)),w=data.readUInt32BE(16),h=data.readUInt32BE(20);assert.equal(data[25],6,'RGBA PNG');for(const [x,y,sw,sh]of a.rects||[])assert.ok(x>=0&&y>=0&&x+sw<=w&&y+sh<=h);}
  assert.equal(Object.keys(SPRITE_ROUTES).length,6);
});
