import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { CONFIG } from './game/games/cpi-live/config.js';
import * as e from './game/games/cpi-live/engine.js';
import { work, receipt, auditWork } from './game/games/cpi-live/view.js';
import { restore, persist, loadActive, loadLast, selectedIDs } from './game/games/cpi-live/storage.js';
import { chartGeometry, timelineCharts } from './game/games/cpi-live/charts.js';
import { variantIndex } from './game/instructional-variants.js';
import { createRecorder, STORAGE_PREFIX } from './game/games/cpi-live/telemetry.js';

test('all five base baskets and all 25 basket/shock calculations match reference totals',()=>{
  const bases=[140000,130000,165000,168000,152000];
  const totals=[[145900,144000,143550,145700,143200],[135400,133900,133500,135240,133000],[172000,170100,170100,171440,168900],[175050,172200,172500,175130,172250],[158500,156000,157200,158140,156300]];
  CONFIG.baskets.forEach((b,i)=>CONFIG.shocks.forEach((s,j)=>{
    const m=e.model({...e.newRun(1),basketID:b.id,shockID:s.id});
    assert.equal(m.base.cost,bases[i]);assert.equal(e.cpi(m.base.cost,m.base.cost),100);
    assert.equal(m.current.cost,totals[i][j]);assert.equal(m.index,totals[i][j]/bases[i]*100);
    assert.ok(Math.abs(m.rate-(totals[i][j]-bases[i])/bases[i]*100)<1e-10);
    const prices=b.items.map((r,k)=>r.price*(100+s.changes[k])/100);
    assert.ok(prices.every(Number.isInteger),'authored price changes produce exact cents');
    assert.deepEqual(m.current.rows.map(r=>r.price),prices);
    assert.deepEqual(m.current.rows.map(r=>r.cost),prices.map((p,k)=>p*b.items[k].quantity));
    assert.equal(m.current.rows.reduce((n,r)=>n+r.contribution,0),totals[i][j]-bases[i]);
    assert.ok(m.base.rows[0].cost/m.base.cost>.6);
  }));
  assert.throws(()=>e.basket(CONFIG.baskets[0].items,[1]));
});

test('every weighting comparison uses expenditure effects, not percentage ranking',()=>{
  const winners=['b','a','b','a'];
  for(const basket of CONFIG.baskets)CONFIG.comparisons.forEach((c,i)=>{
    const m=e.model({...e.newRun(1),basketID:basket.id,comparisonID:c.id});
    assert.equal(m.winner,winners[i]);for(const c of m.cases)assert.equal(c.contribution,c.item.quantity*c.item.price*c.percent/100);
    const winner=m.cases[winners[i]==='a'?0:1],other=m.cases[winners[i]==='a'?1:0];
    assert.ok(winner.percent<other.percent);assert.ok(winner.item.cost>other.item.cost);assert.ok(winner.index>other.index);
  });
});

test('all timeline rates, stable prices, disinflation, acceleration and deflation',()=>{
  const types=['slowing','accelerating','stable','deflation','slowing'];
  CONFIG.timelines.forEach((t,i)=>{
    const m=e.model({...e.newRun(1),timelineID:t.id});assert.equal(m.kind,types[i]);
    m.rates.slice(1).forEach((r,j)=>assert.equal(r,(t.values[j+1]-t.values[j])/t.values[j]*100));
    assert.ok(m.rates[3]<0);assert.ok(t.values[3]>100);
  });
  assert.equal(e.classification(4,4),'steady');assert.equal(e.classification(-4,-2),'deflation');
});

test('input normalization and explicit rounding limits',()=>{
  for(const raw of ['1400','1,400','$1400','$1,400','1400.00',' $1,400.00 '])assert.equal(e.parseNumber(raw),1400);
  for(const raw of ['3.7','3.70%','3.7%'])assert.equal(e.parseNumber(raw,'rate'),3.7);
  assert.equal(e.parseNumber('−2.7%','rate'),-2.7);
  for(const raw of ['',null,'NaN','Infinity','1e3','0x10','1,40','1,400,','1.2.3','--4','4cats','<script>','12 34'])assert.equal(e.parseNumber(raw),null);
  assert.equal(e.parseNumber('$103','index'),null);assert.equal(e.parseNumber('103%','index'),null);
  for(const raw of ['103.3','103.32','103'])assert.equal(e.accepts(raw,103.32,'index'),true);
  for(const raw of ['104','103.4','103.9'])assert.equal(e.accepts(raw,103.32,'index'),false);
  assert.ok(e.accepts('3.7%',e.inflation(108,112),'rate'));assert.ok(!e.accepts('4',e.inflation(108,112),'rate'));
  assert.ok(e.accepts('1456',1456,'currency'));assert.ok(!e.accepts('1455.99',1456,'currency'));
});

test('each audit has one isolated error with valid underlying data and one correct answer',()=>{
  for(const base of CONFIG.baskets)for(const shock of CONFIG.shocks)for(const audit of CONFIG.audits){
    const run={...e.start(e.newRun(1)),phase:'audit',basketID:base.id,auditID:audit.id,shockID:shock.id}, m=e.model(run), a=auditWork(run);
    assert.ok(a.draft.length>70&&a.repair.length>40);assert.doesNotMatch(a.draft+a.repair,/NaN|undefined/);
    assert.equal(CONFIG.audits.filter(option=>e.submit(run,option.id).solved).length,1);
    if(audit.id==='average'){
      const simple=shock.changes.reduce((n,p)=>n+p,0)/5;
      assert.ok(Math.abs(simple-m.rate)>.15,'equal weighting differs by more than the permitted rate-rounding tolerance');
    }
    if(audit.id==='reverse')assert.ok(m.base.cost/m.current.cost*100<100&&m.index>100);
    if(audit.id==='quantities')assert.deepEqual(m.current.rows.map(r=>r.quantity),base.items.map(i=>i.quantity));
    if(audit.id==='period')assert.notEqual(e.inflation(100,112),e.inflation(108,112));
    if(audit.id==='level')assert.match(a.repair,/cannot be recovered without/);
  }
});

test('2500 complete pool combinations: retries, first attempts, fixed quantities, guarded transitions and replay',()=>{
  let count=0;
  for(const base of CONFIG.baskets)for(const shock of CONFIG.shocks)for(const comparison of CONFIG.comparisons)for(const audit of CONFIG.audits)for(const timeline of CONFIG.timelines){
    let run={...e.start(e.newRun(count,'qa',0)),basketID:base.id,shockID:shock.id,comparisonID:comparison.id,auditID:audit.id,timelineID:timeline.id};
    assert.equal(e.next(run),run);
    for(const phase of e.PHASES){
      assert.equal(run.phase,phase);assert.equal(run.solved,false);
      const correct=e.expected(run), numeric=typeof correct==='object';
      const bad=numeric?Object.fromEntries(Object.keys(correct).map(k=>[k,'bad'])):phase==='meaning'?'rate':phase==='weight'?(correct==='a'?'b':'a'):phase==='audit'?CONFIG.audits.find(a=>a.id!==correct).id:phase==='timeline_compare'?(correct==='stable'?'deflation':'stable'):'below';
      const before=JSON.stringify(run);Object.freeze(run);
      let retry=e.submit(run,bad);assert.equal(JSON.stringify(run),before);assert.equal(retry.solved,false);assert.ok(retry.feedback.length>30);
      run=e.submit(retry,numeric?Object.fromEntries(Object.entries(correct).map(([k,v])=>[k,String(v)])):correct);
      assert.equal(run.solved,true);assert.equal(run.attempts[phase],2);assert.equal(run.firstCorrect,0);
      assert.equal(e.submit(run,correct),run,'resolved answer cannot apply twice');
      assert.deepEqual(e.model(run).current.rows.map(r=>r.quantity),base.items.map(i=>i.quantity));
      assert.doesNotMatch(work(run)+receipt(run),/NaN|undefined/);
      run=e.next(run);
    }
    assert.equal(run.phase,'complete');assert.equal(e.next(run),run);assert.equal(e.submit(run,'a'),run);count++;
  }
  assert.equal(count,2500);assert.equal(Object.isFrozen(CONFIG.baskets[0].items[0]),true);
  assert.throws(()=>{CONFIG.baskets[0].items[0].quantity=2;});
  // Even a stray current-quantity property on a run cannot replace the base quantities.
  const m=e.model({...e.newRun(3),quantities:[2,3,4,5,6]});assert.deepEqual(m.current.rows.map(r=>r.quantity),m.base.rows.map(r=>r.quantity));
  let run=e.start(e.newRun(1));while(run.phase!=='complete')run=e.next(e.submit(run,e.expected(run)));
  assert.equal(run.firstCorrect,e.PHASES.length);assert.deepEqual(e.newRun(2).attempts,{});
});

test('progressive hints preserve retrieval, wrong answers, phase scope and fresh-run reset',()=>{
  for(const phase of ['cpi','inflation','timeline_rate']){
    let r={...e.start(e.newRun(1)),phase};assert.doesNotMatch(work(r),/class="cpi-formula"/);
    r=e.submit(r,{value:'0'});assert.doesNotMatch(work(r),/class="cpi-formula"|divided by|÷/);
    r=e.toggleHint(r);assert.match(work(r),/aria-expanded="true"/);assert.doesNotMatch(work(r),/class="cpi-formula"/);
    r=e.toggleHint(r,'formula');assert.match(work(r),/class="cpi-formula"/);assert.match(work(r),/divided by/);
    r=e.toggleHint(r);assert.doesNotMatch(work(r),/class="cpi-formula"/);
    assert.ok(e.submit(r,e.expected(r)).solved);
  }
  assert.deepEqual(e.newRun(1).hints,{});
  const r=e.start(e.newRun(1));assert.doesNotMatch(work(e.submit(r,e.expected(r))),/class="cpi-formula"/);
  assert.doesNotMatch(receipt(r),/Household receipt|Same five items/);
});

test('10,000 fresh selections cover every pool and never repeat any previous category',()=>{
  let prior={},seen=Object.fromEntries(Object.keys(e.POOLS).map(k=>[k,new Set()]));
  for(let seed=0;seed<10000;seed++){
    const r=e.newRun(seed,`run-${seed}`,0,prior);
    for(const key of Object.keys(seen)){seen[key].add(r[key]);assert.notEqual(r[key],prior[key]);}
    assert.deepEqual(e.selections(seed,prior),e.selections(seed,prior));prior=r;
  }
  assert.deepEqual(Object.values(seen).map(s=>s.size),[5,5,4,5,5]);
});

test('all phases and hints survive replay-validated saves; corrupt values are rejected',()=>{
  for(let seed=0;seed<20;seed++){
    let r=e.start(e.newRun(seed,`saved-${seed}`,0));
    while(r.phase!=='complete'){
      if(['cpi','inflation','timeline_rate'].includes(r.phase)){r=e.toggleHint(r);r=e.toggleHint(r,'formula');assert.deepEqual(restore(r),r);}
      const a=e.expected(r);r=e.submit(r,typeof a==='object'?Object.fromEntries(Object.keys(a).map(k=>[k,'bad'])):a);
      assert.deepEqual(restore(JSON.parse(JSON.stringify(r))),r);
      r=e.submit(r,a);assert.deepEqual(restore(r),r);r=e.next(r);assert.deepEqual(restore(r),r);
    }
    assert.throws(()=>restore({...r,firstCorrect:100}));assert.throws(()=>restore({...r,basketID:'missing'}));
  }
  const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const r=e.newRun(4);assert.ok(persist(storage,r));assert.deepEqual(loadActive(storage).run,r);assert.deepEqual(loadLast(storage),selectedIDs(r));
  assert.equal(loadActive(null).run,null);assert.equal(persist(null,r),false);
});

test('timeline charts use each selected series and reveal rate bars only after interpretation',()=>{
  for(const timeline of CONFIG.timelines){
    const r={...e.start(e.newRun(1)),timelineID:timeline.id,phase:'timeline_compare'},m=e.model(r);
    assert.match(work(r),/data-chart="cpi"/);assert.doesNotMatch(work(r),/data-chart="inflation"/);
    assert.match(work(e.submit(r,m.kind)),/data-chart="inflation"/);
    const html=timelineCharts(m,true,true);assert.match(html,/PRICE LEVEL — CPI/);assert.match(html,/INFLATION RATE/);assert.match(html,/aria-labelledby/);
    for(const rate of [false,true]){
      const v=rate?m.rates.slice(1):m.values,g=chartGeometry(v,rate);
      assert.deepEqual(g.points.map(p=>p.value),v);
      assert.ok(g.points.every(p=>p.x>=62&&p.x<=334&&p.y>=42&&p.y<=190));
      if(rate)assert.ok(g.points.at(-1).y>g.zero,'negative inflation below zero');
    }
  }
});

test('Main Attraction verification only: UUID-based variants vary and survive saved outcome review',()=>{
  const values=new Set();let repeats=0,previous;
  for(let i=0;i<100;i++){
    const run={runID:`review-${i}`,history:[],state:{}},v=variantIndex(run,'attraction-margin');values.add(v);
    assert.equal(variantIndex(JSON.parse(JSON.stringify(run)),'attraction-margin'),v);
    if(v===previous)repeats++;previous=v;
  }
  assert.equal(values.size,4);
  // Existing selection has no no-repeat memory. This pass standardizes CPI only.
  const original={runID:'same'};assert.equal(variantIndex(original,'attraction-margin'),variantIndex(original,'attraction-margin'));
  execFileSync('git',['diff','--exit-code','HEAD','--','audit_tools/econ_rpg/game/instructional-variants.js','audit_tools/econ_rpg/game/rpg.js','audit_tools/econ_rpg/game/storage.js'],{stdio:'pipe'});
});

test('local telemetry retention, safe failure, anonymous fields, no other-game mutation',()=>{
  const values=new Map([['unrelated','keep']]),storage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  for(let i=0;i<25;i++){const r=e.newRun(i,`run-${i}`),rec=createRecorder(storage,r.runID,()=>{},()=>i);rec.log('run_start',r);}
  assert.equal([...values.keys()].filter(k=>k.startsWith(STORAGE_PREFIX)).length,20);assert.equal(values.get('unrelated'),'keep');
  let warns=0;const r=e.newRun(1),rec=createRecorder(null,r.runID,()=>warns++);rec.log('run_start',r);rec.log('cpi_attempt',r);assert.equal(warns,1);assert.equal(rec.record.events.length,2);
  assert.doesNotMatch(JSON.stringify(rec.record),/email|studentName|userID/);
  execFileSync('git',['diff','--exit-code','HEAD','--','audit_tools/econ_rpg/game/games/gdp-live','audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush','audit_tools/econ_rpg/game/scenarios','audit_tools/econ_rpg/game/instructional-followup.js','audit_tools/econ_rpg/game/rpg.css','games','play'],{stdio:'pipe'});
});
