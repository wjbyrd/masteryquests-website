import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { CONFIG } from './game/games/cpi-live/config.js';
import * as e from './game/games/cpi-live/engine.js';
import { work, receipt, auditWork } from './game/games/cpi-live/view.js';
import { createRecorder, STORAGE_PREFIX } from './game/games/cpi-live/telemetry.js';

test('fixed basket, exact cent arithmetic and every authored price shock',()=>{
  assert.equal(e.BASE.cost,140000);assert.equal(e.cpi(e.BASE.cost),100);
  assert.deepEqual(e.BASE.rows.map(r=>r.cost),[100000,20000,12000,3000,5000]);
  const totals=[145600,144000,144000,145000,142700], biggest=['rent','gas','groceries','rent','streaming'];
  CONFIG.shocks.forEach((s,i)=>{
    const run={...e.newRun(1),shockID:s.id}, m=e.model(run);
    assert.equal(m.current.cost,totals[i]);assert.equal(m.index,totals[i]/140000*100);
    assert.ok(Math.abs(m.rate-(totals[i]-140000)/140000*100)<1e-10);
    assert.deepEqual(m.current.rows.map(r=>r.cost),s.prices.map((p,j)=>p*[1,10,40,2,2][j]));
    assert.equal(m.current.rows.reduce((n,r)=>n+r.contribution,0),totals[i]-140000);
    assert.equal(m.pressures[0].id,biggest[i]);
  });
  assert.throws(()=>e.basket([1]));assert.throws(()=>e.basket([1,2,3,4,NaN]));
});

test('every weighting comparison uses expenditure effects, not percentage ranking',()=>{
  const expected=[[1200,5000],[2000,1500],[1200,1800],[4000,3000]], winners=['b','a','b','a'];
  CONFIG.comparisons.forEach((c,i)=>{
    const m=e.model({...e.newRun(1),comparisonID:c.id});
    assert.deepEqual(m.cases.map(c=>c.contribution),expected[i]);assert.equal(m.winner,winners[i]);
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
  for(const shock of CONFIG.shocks)for(const audit of CONFIG.audits){
    const run={...e.start(e.newRun(1)),phase:'audit',auditID:audit.id,shockID:shock.id}, m=e.model(run), a=auditWork(run);
    assert.ok(a.draft.length>70&&a.repair.length>40);assert.doesNotMatch(a.draft+a.repair,/NaN|undefined/);
    assert.equal(CONFIG.audits.filter(option=>e.submit(run,option.id).solved).length,1);
    if(audit.id==='average'){
      const simple=shock.prices.reduce((n,p,i)=>n+(p/CONFIG.basket[i].price-1)*100,0)/5;
      assert.ok(Math.abs(simple-m.rate)>.15,'equal weighting differs by more than the permitted rate-rounding tolerance');
    }
    if(audit.id==='reverse')assert.ok(e.BASE.cost/m.current.cost*100<100&&m.index>100);
    if(audit.id==='quantities')assert.deepEqual(m.current.rows.map(r=>r.quantity),[1,10,40,2,2]);
    if(audit.id==='period')assert.notEqual(e.inflation(100,112),e.inflation(108,112));
    if(audit.id==='level')assert.match(a.repair,/cannot be recovered without/);
  }
});

test('500 complete pool combinations: retries, first attempts, fixed quantities, guarded transitions and replay',()=>{
  let count=0;
  for(const shock of CONFIG.shocks)for(const comparison of CONFIG.comparisons)for(const audit of CONFIG.audits)for(const timeline of CONFIG.timelines){
    let run={...e.start(e.newRun(count,'qa',0)),shockID:shock.id,comparisonID:comparison.id,auditID:audit.id,timelineID:timeline.id};
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
      assert.deepEqual(e.model(run).current.rows.map(r=>r.quantity),[1,10,40,2,2]);
      assert.doesNotMatch(work(run)+receipt(run),/NaN|undefined/);
      run=e.next(run);
    }
    assert.equal(run.phase,'complete');assert.equal(e.next(run),run);assert.equal(e.submit(run,'a'),run);count++;
  }
  assert.equal(count,500);assert.equal(Object.isFrozen(CONFIG.basket[0]),true);
  assert.throws(()=>{CONFIG.basket[0].quantity=2;});
  // Even a stray current-quantity property on a run cannot replace the base quantities.
  const m=e.model({...e.newRun(3),quantities:[2,3,4,5,6]});assert.deepEqual(m.current.rows.map(r=>r.quantity),[1,10,40,2,2]);
  let run=e.start(e.newRun(1));while(run.phase!=='complete')run=e.next(e.submit(run,e.expected(run)));
  assert.equal(run.firstCorrect,e.PHASES.length);assert.deepEqual(e.newRun(2).attempts,{});
});

test('formula timing, display labels and every pool reachable through seeded authored selection',()=>{
  const run=e.start(e.newRun(1));assert.doesNotMatch(work(run),/Current cost of the fixed basket ÷/);
  assert.match(work(e.submit(run,e.expected(run))),/indexed to.*100/);assert.match(work(e.submit(run,e.expected(run))),/Current cost of the fixed basket ÷/);
  assert.match(receipt(run),/Quantities fixed/);assert.match(receipt(run),/Basket cost is a dollar amount/);
  const seen={shockID:new Set(),comparisonID:new Set(),auditID:new Set(),timelineID:new Set()};
  for(let seed=0;seed<10000;seed++){const r=e.newRun(seed);for(const key of Object.keys(seen))seen[key].add(r[key]);assert.deepEqual(e.selections(seed),e.selections(seed));}
  assert.deepEqual(Object.values(seen).map(s=>s.size),[5,4,5,5]);
});

test('local telemetry retention, safe failure, anonymous fields, no other-game mutation',()=>{
  const values=new Map([['unrelated','keep']]),storage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  for(let i=0;i<25;i++){const r=e.newRun(i,`run-${i}`),rec=createRecorder(storage,r.runID,()=>{},()=>i);rec.log('run_start',r);}
  assert.equal([...values.keys()].filter(k=>k.startsWith(STORAGE_PREFIX)).length,20);assert.equal(values.get('unrelated'),'keep');
  let warns=0;const r=e.newRun(1),rec=createRecorder(null,r.runID,()=>warns++);rec.log('run_start',r);rec.log('cpi_attempt',r);assert.equal(warns,1);assert.equal(rec.record.events.length,2);
  assert.doesNotMatch(JSON.stringify(rec.record),/email|studentName|userID/);
  execFileSync('git',['diff','--exit-code','HEAD','--','audit_tools/econ_rpg/game/games/gdp-live','audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush','audit_tools/econ_rpg/game/scenarios','audit_tools/econ_rpg/game/instructional-followup.js','audit_tools/econ_rpg/game/rpg.css','games','play'],{stdio:'pipe'});
});
