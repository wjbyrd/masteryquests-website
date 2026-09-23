import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {CONFIG} from './game/games/labor-force-files/config.js';
import * as e from './game/games/labor-force-files/engine.js';
import {board,work,explanation} from './game/games/labor-force-files/view.js';
import {restore,load,last,save,selectedIDs} from './game/games/labor-force-files/storage.js';
import {recorder,PREFIX} from './game/games/labor-force-files/telemetry.js';
const eq=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const invariant=b=>{assert.equal(b.employed+b.unemployed,b.laborForce);assert.equal(b.laborForce+b.nilf,b.adultPopulation);for(const k of ['adultPopulation','employed','unemployed','laborForce','nilf'])assert.ok(Number.isSafeInteger(b[k])&&b[k]>=0);eq(b.ur,b.unemployed/b.laborForce*100);eq(b.lfpr,b.laborForce/b.adultPopulation*100);};
test('five independent baseline reference calculations and invalid population guards',()=>{
  const golden=[[250,160,10,170,80,100/17,68],[300,180,20,200,100,10,200/3],[400,228,12,240,160,5,60],[500,285,15,300,200,5,60],[200,114,6,120,80,5,60]];
  CONFIG.baselines.forEach((b,i)=>{const m=e.labor(b);assert.deepEqual(Object.values(m).slice(0,5),golden[i].slice(0,5));eq(m.ur,golden[i][5]);eq(m.lfpr,golden[i][6]);invariant(m);});
  for(const b of [{adultPopulation:0,employed:0,unemployed:0},{adultPopulation:100,employed:110,unemployed:1},{adultPopulation:100,employed:1.1,unemployed:1},{adultPopulation:100,employed:-1,unemployed:2}])assert.throws(()=>e.labor(b));
  assert.throws(()=>e.move(e.labor(CONFIG.baselines[0]),{hired:11}));assert.throws(()=>e.move(e.labor(CONFIG.baselines[0]),{toEmployed:81}));
});
test('all direct, expansion, discouraged, mixed and six headline cases preserve flows and rate directions',()=>{
  const seen=new Set();
  for(const baseline of CONFIG.baselines)for(const direct of CONFIG.direct)for(const expansion of CONFIG.expansions)for(const discouraged of CONFIG.discouraged)for(const mixed of CONFIG.mixed)for(const headline of CONFIG.headlines){
    const run={...e.newRun(1),baselineID:baseline.id,directID:direct.id,expansionID:expansion.id,discouragedID:discouraged.id,mixedID:mixed.id,headlineID:headline.id};
    const m=e.model(run),b=m.base;Object.values(m).filter(x=>x?.adultPopulation).forEach(invariant);
    assert.equal(m.direct.laborForce,b.laborForce);assert.equal(m.direct.nilf,b.nilf);eq(m.direct.lfpr,b.lfpr);assert.equal(e.direction(b.ur,m.direct.ur),direct.kind==='hiring'?'falls':'rises');
    assert.equal(m.direct.employed-b.employed,direct.kind==='hiring'?direct.count:-direct.count);
    const f=m.flows.expansion;assert.equal(m.expansion.employed-b.employed,f.toEmployed);assert.equal(m.expansion.unemployed-b.unemployed,f.toUnemployed);assert.equal(b.nilf-m.expansion.nilf,f.toEmployed+f.toUnemployed);assert.ok(m.expansion.lfpr>b.lfpr);seen.add(e.direction(b.ur,m.expansion.ur));
    assert.equal(m.discouraged.employed,b.employed);assert.equal(m.discouraged.unemployed,b.unemployed-discouraged.count);assert.equal(m.discouraged.laborForce,b.laborForce-discouraged.count);assert.equal(m.discouraged.nilf,b.nilf+discouraged.count);assert.ok(m.discouraged.ur<b.ur&&m.discouraged.lfpr<b.lfpr);
    assert.equal(m.mixed.employed,b.employed+mixed.hired+mixed.toEmployed);assert.equal(m.mixed.unemployed,b.unemployed-mixed.hired+mixed.toUnemployed);assert.equal(m.mixed.nilf,b.nilf-mixed.toEmployed-mixed.toUnemployed);
    const h=m.headline;
    if(headline.id==='hiring'){assert.equal(h.employed,b.employed+3);eq(h.lfpr,b.lfpr);assert.ok(h.ur<b.ur);}
    if(headline.id==='discouraged'){assert.equal(h.employed,b.employed);assert.ok(h.lfpr<b.lfpr&&h.ur<b.ur);}
    if(headline.id==='losses'){assert.equal(h.employed,b.employed-5);eq(h.lfpr,b.lfpr);assert.ok(h.ur>b.ur);}
    if(headline.id==='search-entry'){assert.equal(h.employed,b.employed+3);assert.equal(h.unemployed,b.unemployed+12);assert.ok(h.ur>b.ur&&h.lfpr>b.lfpr);}
    if(headline.id==='same-share'){eq(h.ur,b.ur);assert.ok(h.employed>b.employed&&h.lfpr>b.lfpr);}
    if(headline.id==='job-entry'){assert.equal(h.unemployed,b.unemployed);assert.ok(h.employed>b.employed&&h.ur<b.ur&&h.lfpr>b.lfpr);}
  }
  assert.deepEqual([...seen].sort(),['falls','rises','unchanged']);
});
test('classification criteria, count/rate formats, tolerances and malformed answers',()=>{
  assert.deepEqual(CONFIG.people.map(p=>p.answer),['employed','unemployed','nilf','nilf']);assert.match(CONFIG.people[3].text,/available.*stopped searching/);
  for(const n of ['170','170.0'])assert.ok(e.accepts(n,170,'laborForce'));
  for(const n of ['5.9','5.9%','5.88','5.88%'])assert.ok(e.accepts(n,100/17,'ur'));
  assert.ok(!e.accepts('170%',170,'laborForce'));assert.ok(!e.accepts('6',100/17,'ur'));
  for(const n of ['',null,'NaN','Infinity','1e2','0x10','1,00','<script>','-1'])assert.equal(e.parseNumber(n),null);
});
test('3,240 complete authored combinations: corrections, one accepted interpretation, scores and immutability',()=>{
  let runs=0;
  for(const baseline of CONFIG.baselines)for(const direct of CONFIG.direct)for(const expansion of CONFIG.expansions)for(const discouraged of CONFIG.discouraged)for(const mixed of CONFIG.mixed)for(const headline of CONFIG.headlines){
    let r=e.start({...e.newRun(1),baselineID:baseline.id,directID:direct.id,expansionID:expansion.id,discouragedID:discouraged.id,mixedID:mixed.id,headlineID:headline.id});
    const baselineJSON=JSON.stringify(e.model(r).base);
    while(e.question(r)){
      const q=e.question(r),target=e.expected(r),before=JSON.stringify(r);assert.equal(e.next(r),r);
      const bad=typeof target==='object'?Object.fromEntries(Object.keys(target).map(k=>[k,k==='participation'?'falls':'999'])):e.options(r).find(([id])=>id!==target)[0];
      let failed=e.submit(r,bad);assert.equal(failed.solved,false);assert.ok(failed.feedback.length>30);assert.equal(JSON.stringify(r),before);
      if(typeof target==='string'){const correct=e.options(r).filter(([id])=>e.submit(r,id).solved);assert.equal(correct.length,1,q.id);}
      r=e.submit(failed,target);assert.equal(r.solved,true);assert.equal(e.submit(r,target),r);assert.equal(r.first[q.id],false);assert.equal(JSON.stringify(e.model(r).base),baselineJSON);
      assert.doesNotMatch(work(r)+board(r),/NaN|undefined|Infinity/);assert.ok(explanation(r).length>25);r=e.next(r);
    }
    assert.equal(r.step,17);assert.equal(Object.values(r.first).filter(Boolean).length,0);assert.match(work(r),/Labor report complete/);runs++;
  }
  assert.equal(runs,3240);
});
test('10,000 fresh selections rotate every pool; replay-validated saves retain all stages and hints',()=>{
  let previous={},coverage=Object.fromEntries(Object.keys(e.POOLS).map(k=>[k,new Set()]));
  for(let seed=0;seed<10000;seed++){const r=e.newRun(seed,'qa',0,previous);for(const k of Object.keys(e.POOLS)){assert.notEqual(r[k],previous[k]);coverage[k].add(r[k]);}previous=r;}
  assert.deepEqual(Object.values(coverage).map(s=>s.size),[5,4,3,3,3,6]);
  for(let seed=0;seed<24;seed++){
    let r=e.start(e.newRun(seed,'save-'+seed,0));
    while(e.question(r)){
      const target=e.expected(r);
      assert.doesNotMatch(work(r),/class="formula"/);
      if(typeof target==='object'&&('ur'in target||'lfpr'in target)){assert.equal(e.hint(r,'formula'),r);r=e.hint(r,'concept');assert.doesNotMatch(work(r),/class="formula"/);r=e.hint(r,'formula');assert.match(work(r),/class="formula"/);assert.deepEqual(restore(r),r);}
      r=e.submit(r,target);assert.deepEqual(restore(JSON.parse(JSON.stringify(r))),r);r=e.next(r);
    }
    assert.equal(Object.values(r.first).filter(Boolean).length,17);assert.deepEqual(restore(r),r);assert.throws(()=>restore({...r,step:0}));assert.throws(()=>restore({...r,baselineID:'missing'}));assert.deepEqual(e.newRun(seed,'next',1,r).hints,{});
  }
  let bad=e.start(e.newRun(2));bad=e.submit(bad,{laborForce:'170%'});assert.deepEqual(restore(bad),bad);
});
test('safe local persistence, telemetry retention and unavailable-storage behavior',()=>{
  const values=new Map([['unrelated','keep']]),storage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const r=e.newRun(1);assert.ok(save(storage,r));assert.deepEqual(load(storage).run,r);assert.deepEqual(last(storage),selectedIDs(r));assert.ok(!save(null,r));assert.ok(load(null).error);
  for(let n=0;n<25;n++){const run=e.newRun(n,'run-'+n,0);recorder(storage,run.runID,()=>{},()=>n).log('run_start',run);}
  assert.equal([...values.keys()].filter(k=>k.startsWith(PREFIX)).length,20);assert.equal(values.get('unrelated'),'keep');
  const resumed=recorder(storage,'run-24');assert.equal(resumed.record.events.length,1);assert.doesNotMatch(JSON.stringify(resumed.record),/email|studentName|userID/);
  let warnings=0;const local=recorder(null,r.runID,()=>warnings++);local.log('run_start',r);local.log('again',r);assert.equal(warnings,1);
});
test('all six supplied image bytes are untouched and scene selection deterministic',()=>{
  const manifest=JSON.parse(readFileSync(new URL('./art/labor-force-files-assets.json',import.meta.url)));
  assert.equal(manifest.length,6);for(const art of manifest){const bytes=readFileSync(new URL('./game/art/scenes/labor-force-files/'+art.file,import.meta.url));assert.equal(bytes.length,art.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),art.sha256);assert.deepEqual(art.dimensions,[1672,941]);}
  for(const d of CONFIG.direct)for(let step=0;step<17;step++){const r={...e.newRun(1),step,directID:d.id},m=e.model(r);assert.deepEqual(e.model(r),m);assert.ok(m.scene.alt.length>60);const stage=e.question(r).stage;assert.equal(m.scene.id,stage<4?1:stage===4?(d.kind==='hiring'?2:3):stage===5?4:stage===6?5:6);}
  execFileSync('git',['diff','--exit-code','HEAD','--','audit_tools/econ_rpg/game/games/cpi-live','audit_tools/econ_rpg/game/games/gdp-live','audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush','audit_tools/econ_rpg/game/scenarios','audit_tools/econ_rpg/game/rpg.js','audit_tools/econ_rpg/game/rpg.css','audit_tools/econ_rpg/game/instructional-followup.js'],{stdio:'pipe'});
});
