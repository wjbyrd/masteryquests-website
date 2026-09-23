import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import scenario from './game/scenarios/ppf.js';
import housing from './game/scenarios/housing-crisis.js';
import attraction from './game/scenarios/main-attraction.js';
import { createRun, decide, advance, availableChoices, matches, validateScenario } from './game/engine.js';
import { loadRun, saveRun, clearRun, storageKey } from './game/storage.js';
import { selectScene } from './game/scenes.js';
import { scenarioFor } from './game/scenarios/registry.js';
import { enumerate } from './qa.mjs';
import { coverage, trace } from './ppf-qa.mjs';
const data=coverage();
const frontier=[[2,7],[4,6],[5,5],[6,4],[7,2]];
const pair=s=>[s.consumption,s.capital];
const on=(s,shift=0)=>frontier.some(([c,k])=>s.consumption===c+shift&&s.capital===k+shift);
const delivered=run=>run.history.some(h=>h.nodeID==='final-expanded');
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};

test('PPF schema, every node/choice/gate, six scenes and five endings are covered across 361 six-decision paths',()=>{
  assert.equal(validateScenario(scenario),true);assert.equal(scenario.id,'ppf');assert.equal(scenario.version,1);
  assert.equal(Object.keys(scenario.state).length,4);assert.equal(data.result.complete.length,361);
  assert.deepEqual(data.result.unreachableNodes,[]);assert.deepEqual(data.result.unreachableEndings,[]);
  assert.equal(data.result.nodes.length,scenario.nodes.length);
  assert.equal(data.result.choices.length,scenario.nodes.reduce((n,node)=>n+node.choices.length,0));
  assert.deepEqual(data.summary.endings,{slack:42,growth:43,consumption:94,capital:95,recovered:87});
  assert.deepEqual([...data.summary.scenes].sort(),['balanced','capital','consumption','growth','recovery','slowdown']);
  const allFeatures=new Set();
  for(const end of data.result.complete) {
    assert.equal(end.history.length,6);
    const row=trace(end.history.map(h=>h.choiceID));row.features.forEach(f=>allFeatures.add(f));
    for(const run of row.phases) {
      Object.values(run.state).forEach(v=>assert.ok(Number.isInteger(v)&&v>=0&&v<=8));
      if(run.phase==='decision') {
        assert.ok([2,3].includes(availableChoices(scenario,run).length));
        for(const c of availableChoices(scenario,run)) if(c.outcomes) {
          const outcomes=c.outcomes.filter(o=>matches(o.when,run));
          assert.equal(outcomes.length,1,`Exactly one authored outcome: ${run.nodeID}.${c.id}`);
          const result=decide(scenario,run,c.id);
          for(const key of ['consumption','capital','utilization']) assert.equal(result.state[key],run.state[key]+(c.effects[key]||0)+(outcomes[0].effects[key]||0),'No clipping may conceal an output or utilization inconsistency');
        }
      }
    }
  }
  for(const n of scenario.nodes) for(const c of n.choices.filter(c=>c.when)) for(const gate of ['open','closed']) assert.ok(allFeatures.has(`gate:${n.id}.${c.id}:${gate}`));
  assert.deepEqual(new Set(data.selected.flatMap(r=>r.features)),allFeatures);
});

test('efficient production stays on one frontier; additional output requires sacrificing the other category',()=>{
  for(const end of data.result.complete) for(const run of trace(end.history.map(h=>h.choiceID)).phases) {
    if(run.state.utilization===8) assert.ok(on(run.state,delivered(run)?1:0),JSON.stringify(run));
    else {
      assert.equal(delivered(run),false,'Realized expansion requires full utilization in this scenario');
      const base=run.history[1].after;
      assert.ok(run.state.consumption<=base.consumption&&run.state.capital<=base.capital);
      assert.equal(run.state.utilization,8-(base.consumption-run.state.consumption)-(base.capital-run.state.capital));
      assert.ok(run.state.consumption<base.consumption||run.state.capital<base.capital);
    }
    const h=run.history.at(-1);
    if(h&&h.before.utilization===8&&h.after.utilization===8&&!delivered(run)) {
      const c=h.after.consumption-h.before.consumption,k=h.after.capital-h.before.capital;
      assert.ok((c===0&&k===0)||(c>0&&k<0)||(c<0&&k>0));
    }
  }
  const first=trace(['consumption']).run.history[0], further=trace(['consumption','consumption']).run.history[1];
  assert.equal(first.after.consumption-first.before.consumption,1);assert.equal(first.before.capital-first.after.capital,1);
  assert.equal(further.after.consumption-further.before.consumption,1);assert.equal(further.before.capital-further.after.capital,2);
  const towardCapital=trace(['capital','capital']).run.history;
  assert.equal(towardCapital[0].before.consumption-towardCapital[0].after.consumption,1);
  assert.equal(towardCapital[1].before.consumption-towardCapital[1].after.consumption,2);
});

test('shock lowers both outputs without changing capacity; recovery never exceeds the pre-shock mix',()=>{
  for(const run of data.result.complete) {
    const [,,shock,recovery]=run.history,base=run.history[1].after;
    assert.ok(shock.after.consumption<shock.before.consumption&&shock.after.capital<shock.before.capital);
    assert.ok(shock.after.utilization<8);
    assert.ok(recovery.after.consumption>=recovery.before.consumption&&recovery.after.capital>=recovery.before.capital);
    assert.ok(recovery.after.utilization>recovery.before.utilization);
    assert.ok(recovery.after.consumption<=base.consumption&&recovery.after.capital<=base.capital);
    if(recovery.after.utilization===8) assert.deepEqual(pair(recovery.after),pair(base));
    if(recovery.choiceID==='phased') assert.ok(recovery.after.consumption>recovery.before.consumption&&recovery.after.capital>recovery.before.capital);
  }
});

test('investment costs current consumption; only completed improvements shift possibilities outward',()=>{
  let bothBeyondOpening=false;
  for(const end of data.result.complete) {
    const investment=end.history[4],last=end.history[5];
    if(investment.nodeID==='investment-ready'&&investment.choiceID==='invest') {
      assert.ok(investment.after.consumption<investment.before.consumption);
      assert.ok(investment.after.capital>investment.before.capital&&investment.after.growth>investment.before.growth);
      assert.ok(on(investment.after));assert.equal(investment.after.utilization,8);
    }
    if(last.nodeID==='final-expanded') {
      assert.ok(last.before.growth>=3);assert.equal(last.before.utilization,8);
      assert.ok(on(last.after,1));assert.ok(last.after.growth<last.before.growth,'Delivered projects leave the preparation pipeline');
      if(last.choiceID==='hold') { assert.equal(last.after.consumption,last.before.consumption+1);assert.equal(last.after.capital,last.before.capital+1); }
      bothBeyondOpening ||= last.after.consumption>5&&last.after.capital>5;
    }
    if(last.nodeID==='final-slack'&&last.choiceID==='restore') assert.deepEqual(pair(last.after),pair(end.history[1].after));
    if(last.nodeID==='final-slack'&&last.choiceID==='prepare') {
      assert.equal(end.endingID,'slack');assert.equal(selectScene(scenario.sceneSet,end).id,'slowdown');
    }
  }
  assert.equal(bothBeyondOpening,true,'An expanded frontier permits more of both outputs than the opening economy');
  const maxima=Object.keys(scenario.state).map(key=>[key,Math.max(...data.result.complete.map(r=>r.state[key]))]);
  assert.ok(!data.result.complete.some(r=>maxima.every(([k,v])=>r.state[k]===v)));
});

test('all phases reconstruct exactly; all three saves, restart and versions are isolated',()=>{
  const storage=memory(),home=decide(housing,createRun(housing),'registry'),park=decide(attraction,createRun(attraction),'raise');
  saveRun(storage,housing,home);saveRun(storage,attraction,park);
  for(const run of data.result.complete) for(const phase of trace(run.history.map(h=>h.choiceID)).phases) {
    const untouched=JSON.stringify(phase);selectScene(scenario.sceneSet,phase);assert.equal(JSON.stringify(phase),untouched);
    saveRun(storage,scenario,phase);assert.deepEqual(loadRun(storage,scenario).run,phase);
  }
  clearRun(storage,scenario);assert.equal(loadRun(storage,scenario).run,null);
  assert.deepEqual(loadRun(storage,housing).run,home);assert.deepEqual(loadRun(storage,attraction).run,park);
  assert.equal(new Set([housing,attraction,scenario].map(storageKey)).size,3);
  const first=createRun(scenario),second=createRun(scenario);assert.notEqual(first.runID,second.runID);assert.deepEqual(first.state,second.state);
  saveRun(storage,scenario,{...first,scenarioVersion:99});assert.equal(loadRun(storage,scenario).reason,'version');
  saveRun(storage,scenario,{...first,state:{...first.state,consumption:8}});assert.equal(loadRun(storage,scenario).reason,'unavailable');
  assert.equal(scenarioFor('?scenario=ppf'),scenario);assert.equal(scenarioFor(''),housing);assert.equal(scenarioFor('?scenario=main-attraction'),attraction);
});

test('PPF art retains supplied bytes, uses six isolated WebPs and keeps source masters outside the served root',()=>{
  const manifest=JSON.parse(readFileSync(new URL('./art/ppf-assets.json',import.meta.url),'utf8'));
  assert.equal(manifest.length,12);
  for(const item of manifest) {
    const bytes=readFileSync(new URL(item.path,import.meta.url));
    assert.equal(bytes.length,item.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
    assert.equal(item.width,1448);assert.equal(item.height,1086);
    assert.ok(item.path.endsWith('.png')?item.path.startsWith('art/source/ppf/'):item.path.startsWith('game/art/scenes/the-economys-edge/'));
  }
  for(const v of scenario.sceneSet.variants) {assert.equal(v.src,`./art/scenes/the-economys-edge/${v.id}.webp`);assert.ok(v.alt.length>100);}
});

test('current housing v2 and unchanged park paths match frozen references; shared engine/storage are untouched',()=>{
  const hash=s=>createHash('sha256').update(JSON.stringify(enumerate(s).complete)).digest('hex');
  assert.equal(hash(housing),'275c6f29ee1b47d5985f87357cfb6d0cc840443d61679ceae588f9cbffaf70a4');
  assert.equal(hash(attraction),'e9bb3c77ba9f57acc27b1d49a442e911526a761a70fe1bc51b072e40122561ad');
  execFileSync('git',['diff','--exit-code','HEAD','--',...['engine.js','storage.js','scenes.js','scenarios/main-attraction.js','scenarios/main-attraction-scenes.js'].map(f=>`audit_tools/econ_rpg/game/${f}`)],{stdio:'pipe'});
});
