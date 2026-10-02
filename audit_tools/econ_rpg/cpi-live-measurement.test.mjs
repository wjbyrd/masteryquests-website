import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as core from './game/games/cpi-live/engine.js';
import { CONFIG } from './game/games/cpi-live/config.js';
import { restore, selectedIDs } from './game/games/cpi-live/storage.js';
import { MEASUREMENT, measurementAction as act, measurementModel as model } from './game/games/cpi-live/measurement.js';
import { work, receipt } from './game/games/cpi-live/view.js';
const finish=run=>{run=core.start(run);while(run.phase!=='complete')run=core.next(core.submit(run,core.expected(run)));return run;};
const saved=run=>assert.deepEqual(restore(JSON.parse(JSON.stringify(run))),run);

test('Q5 is index interpretation: six clean levels, five-run recent history, one correct answer, stable saves',()=>{
  let previous={},recent=[];
  for(let i=0;i<120;i++){
    let r=core.newRun(i,'q5-'+i,0,previous);
    assert(!recent.includes(r.meaningID));recent=[...recent,r.meaningID].slice(-5);
    const m=core.model(r);assert(Number.isInteger(m.meaning.index));assert(m.meaning.index>=104&&m.meaning.index<=125);
    r=core.start(r);while(r.phase!=='meaning')r=core.next(core.submit(r,core.expected(r)));
    saved(r);assert.match(work(r),new RegExp(`CPI = ${m.meaning.index}`));
    assert.equal(['level','rate','basket','annual'].filter(a=>core.submit(r,a).solved).length,1);
    assert(core.submit(r,'basket').solved);
    previous=selectedIDs(r);
  }
  assert.equal(CONFIG.meanings.length,6);
});

test('version 2 active saves replay identically, including a real baseline saved history',async()=>{
  // Load HEAD engine as a data module with its unchanged config dependency made absolute.
  const code=execFileSync('git',['show','HEAD:audit_tools/econ_rpg/game/games/cpi-live/engine.js'],{encoding:'utf8'}).replace("'./config.js'",JSON.stringify(new URL('./game/games/cpi-live/config.js',import.meta.url).href));
  const old=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  for(let i=0;i<10;i++){
    let r=old.start(old.newRun(i,'legacy-'+i,1));
    while(r.phase!=='complete'){
      if(r.phase==='meaning'){r=old.submit(r,'level');saved(r);}
      r=old.submit(r,old.expected(r));saved(r);r=old.next(r);saved(r);
    }
    r=act(r,'open');saved(r);
  }
});

test('extension gates, bounded substitution, new-good stages, quality arithmetic, resume and unchanged core score',()=>{
  const coverage=new Set();
  for(let seed=0;seed<300;seed++){
    const intro=core.newRun(seed,'ext-'+seed,0);assert.equal(act(intro,'open'),intro);
    let r=finish(intro);const score=r.firstCorrect,attempts={...r.attempts},basket=core.model(r).current;
    r=act(r,'open');saved(r);const ids=r.extension.ids;coverage.add(JSON.stringify(ids));
    assert.equal(act(r,'shift',2),r);assert.equal(act(r,'shift',-1),r);
    r=act(r,'answer','overstate');assert(!r.extension.solved);saved(r);
    r=act(r,'shift',1);saved(r);let m=model(r.extension);
    assert(m.fixed>m.shifted&&m.shifted>m.base);assert(m.s.current[0]>m.s.current[1]);
    assert.equal(m.fixed,2*m.s.current[0]+2*m.s.current[1]);assert.equal(m.shifted,m.s.current[0]+3*m.s.current[1]);
    assert(m.fixedRate>m.shiftedRate);
    r=act(r,'answer','understate');assert(!r.extension.solved);r=act(r,'answer','overstate');assert(r.extension.solved);saved(r);
    const locked=r;assert.equal(act(r,'shift',0),locked);
    r=act(r,'next');saved(r);assert.equal(r.extension.episode,'newGoods');
    assert.equal(act(r,'answer','update'),r);
    r=act(r,'answer','insert');assert(!r.extension.solved);saved(r);
    r=act(r,'answer','wait');assert.equal(r.extension.newStep,'opportunity');assert(!r.extension.solved);saved(r);
    assert.match(work(r),/Base price: unavailable/);assert(m.n.price<m.n.oldPrice);assert.equal(m.n.basePrice,undefined);
    r=act(r,'answer','ignore');assert(!r.extension.solved);r=act(r,'answer','update');saved(r);assert(r.extension.solved);
    r=act(r,'next');m=model(r.extension);saved(r);
    r=act(r,'answer',{comparable:null,raw:null,adjusted:null});assert(!r.extension.solved);saved(r);
    assert.equal(m.comparable,m.q.price-m.q.adjustment);assert(m.comparable>0&&m.comparable<m.q.oldPrice);
    assert(Math.abs(m.rawRate-10)<1e-10);assert(Math.abs(m.adjustedRate+5)<1e-10);
    r=act(r,'answer',{comparable:m.comparable,raw:10,adjusted:-5});assert(r.extension.solved);saved(r);
    r=act(r,'next');saved(r);assert.equal(r.extension.episode,'complete');assert.match(work(r),/measurement-summary/);
    assert.equal(r.firstCorrect,score);assert.deepEqual(r.attempts,attempts);assert.deepEqual(core.model(r).current,basket);
    assert.doesNotMatch(work(r)+receipt(r),/NaN|Infinity|undefined/);
    r=act(r,'summary');saved(r);assert.match(work(r),/First-attempt accuracy/);
    r=act(r,'open');saved(r);r=act(r,'replay');saved(r);
    for(const key of Object.keys(ids))assert.notEqual(r.extension.ids[key],ids[key]);
    const again=act(finish(core.newRun(seed,'again',0,selectedIDs(r))),'open');
    for(const key of Object.keys(ids))assert.notEqual(again.extension.ids[key],r.extension.ids[key]);
    assert.throws(()=>restore({...r,extension:{...r.extension,shift:99}}));
  }
  assert.equal(coverage.size,27,'all 3 × 3 × 3 combinations reachable');
  for(const pool of Object.values(MEASUREMENT))assert.equal(pool.length,3);
});

test('basket hierarchy has plain quantities, pending cost, closed help and three readouts',()=>{
  const html=receipt(core.newRun(1));
  assert.doesNotMatch(html,/Quantities fixed|fixed-word|To calculate/);
  assert.match(html,/Qty 1/);assert.match(html,/id="basket-total">—/);
  assert.match(html,/<details class="basket-help"><summary>Need help/);
  assert.match(html,/<dt>Base year<\/dt><dd>Year 1/);
});
