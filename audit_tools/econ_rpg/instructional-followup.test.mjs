import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { enumerate } from './qa.mjs';
import { audit } from './gameday-rivals-qa.mjs';
import { scenarios } from './game/scenarios/registry.js';
import { createRun, decide } from './game/engine.js';
import { followupFor, evaluateAnswer } from './game/instructional-followup.js';
import { ticketMarket } from './game/scenarios/megastar-mania-market.js';
import { PARK_VARIANTS, HOUSING_VARIANTS, parkValues, parkQuestion, housingQuestion, variantIndex } from './game/instructional-variants.js';

test('all RPG paths have deterministic outcome-specific applications only after the ending', t => {
  for (const id of ['housing-crisis', 'main-attraction', 'ppf', 'megastar-mania']) {
    const s = scenarios[id], start = createRun(s), runs = enumerate(s).complete;
    assert.equal(followupFor(id, null), null);
    assert.equal(followupFor(id, start), null);
    assert.equal(followupFor(id, decide(s, start, s.nodes[0].choices[0].id)), null);
    const variants = new Set();
    for (const run of runs) {
      const before = JSON.stringify(run), model = followupFor(id, run);
      assert.deepEqual(model, followupFor(id, structuredClone(run)));
      assert.doesNotMatch(JSON.stringify(model), /undefined|NaN/);
      assert.ok(model.intro.includes(id === 'housing-crisis' ? run.history[0].label : run.history.at(-1).label));
      if (id === 'ppf') {
        const expected = run.endingID === 'slack' ? 'B' : run.endingID === 'growth' ? 'C' : 'A';
        assert.equal(model.graph.point, expected); variants.add(expected);
        assert.equal(model.graph.expanded, run.endingID === 'growth');
      }
      if (id === 'megastar-mania') {
        const status = ticketMarket(run).status;
        assert.equal(model.graph.status, status); variants.add(status);
        assert.equal(model.questions[0].correct, ['shortage','balanced','surplus'].indexOf(status));
      }
      for (const task of model.questions) {
        assert.equal(evaluateAnswer(task, -1), null); assert.equal(evaluateAnswer(task, 1.5), null);
        assert.equal(evaluateAnswer(task, 3), null);
        task.options.forEach((_, i) => {
          const answer = evaluateAnswer(task, i);
          assert.equal(answer.correct, i === task.correct);
          assert.ok(answer.feedback.length > 50, 'substantive feedback for every answer');
        });
      }
      assert.equal(JSON.stringify(run), before, 'teaching never mutates outcome');
    }
    if (id === 'ppf' || id === 'megastar-mania') assert.equal(variants.size, 3);
    t.diagnostic(`${id}: ${runs.length} complete paths checked`);
  }
});

test('all 2048 rival seasons retain actual counts and use a genuinely changed best-response problem', () => {
  for (const { run } of audit().seasons) {
    const before = JSON.stringify(run), model = followupFor('gameday-rivals', run);
    const count = run.history.filter(h => h.playerAction === 'aggressive').length;
    assert.ok(model.intro.includes(`${count} Aggressive choices`));
    const q = model.questions[0];
    assert.deepEqual(q.options.map((_, i) => evaluateAnswer(q, i).correct), [false,true,false]);
    assert.equal(followupFor('gameday-rivals', { ...run, phase: 'reveal' }), null);
    assert.equal(JSON.stringify(run), before);
  }
  assert.ok(140 > 120 && 50 > 40, 'opposite best responses in the new matrix');
});

test('application calculations and model distinctions have independent economic checks', () => {
  const park = followupFor('main-attraction', enumerate(scenarios['main-attraction']).complete[0], {variant:0});
  assert.equal(48 * 110 - 50 * 100, 280); assert.equal(280 - 350, -70);
  assert.match(park.questions[0].explanation, /\$28 per extra guest/);
  assert.equal(50 - 30, 20);
  const runs = enumerate(scenarios['megastar-mania']).complete;
  assert.ok(runs.some(run => Math.sign(run.state.demand - run.state.supply) !== Math.sign(ticketMarket(run).wanted - run.state.supply)), 'test includes raw-demand comparisons that would misclassify the market');
});

test('all eight numeric variants have distinct answers, exact arithmetic, dynamic explanations and stable selection', () => {
  for(const [i,v] of PARK_VARIANTS.entries()){
    const x=parkValues(v), q=parkQuestion(i);
    assert.equal(x.beforeTR,v.beforeP*v.beforeQ);assert.equal(x.afterTR,v.afterP*v.afterQ);
    assert.equal(x.lostRevenue,v.beforeQ*(v.beforeP-v.afterP));assert.equal(x.addedRevenue,(v.afterQ-v.beforeQ)*v.afterP);
    assert.equal(x.deltaTR,x.addedRevenue-x.lostRevenue);assert.equal(x.deltaProfit,x.afterTR-x.beforeTR-v.extraCost);
    assert.ok(Number.isInteger(x.incrementalRevenue)&&x.incrementalRevenue<v.afterP);
    assert.equal(new Set(q.options.map(o=>o.text)).size,3);
    const expected=x.deltaProfit===0?'Profit is unchanged.':`Profit ${x.deltaProfit>0?'rises':'falls'} by $${Math.abs(x.deltaProfit)}.`;
    assert.equal(q.options[q.correct].text,expected);
    for(const n of [x.beforeTR,x.afterTR,x.lostRevenue,x.addedRevenue,x.deltaTR,v.extraCost]) assert.ok(q.explanation.includes(`$${n.toLocaleString('en-US')}`));
    assert.ok(q.explanation.includes(expected));
    q.options.forEach((_,j)=>assert.equal(evaluateAnswer(q,j).correct,j===q.correct));
  }
  for(const [i,v] of HOUSING_VARIANTS.entries()){
    const q=housingQuestion(i);assert.ok(v.baseline<v.supported);
    assert.equal(q.options[q.correct].text,`${v.supported-v.baseline} units`);
    assert.match(q.explanation,new RegExp(`${v.supported} − ${v.baseline} = ${v.supported-v.baseline}`));
    assert.ok(q.explanation.includes(String(v.repaired)));assert.equal(new Set(q.options.map(o=>o.text)).size,3);
    q.options.forEach((_,j)=>assert.equal(evaluateAnswer(q,j).correct,j===q.correct));
  }
  for(const id of ['housing-crisis','main-attraction']){
    const run=enumerate(scenarios[id]).complete[0], seen=new Set();
    for(let n=0;n<64;n++){
      const r={...run,runID:`qa-run-${n}`},before=JSON.stringify(r),m=followupFor(id,r);
      const task=m.questions.find(q=>q.variantID);seen.add(task.variantID);
      assert.deepEqual(followupFor(id,structuredClone(r)),m);assert.equal(JSON.stringify(r),before);
      assert.doesNotMatch(JSON.stringify(m),/NaN|undefined/);
      assert.equal(variantIndex(r,'test'),variantIndex({...r,state:{},history:[]},'test'),'no dependence on economic path');
    }
    assert.equal(seen.size,4);
    for(let variant=0;variant<4;variant++)assert.ok(followupFor(id,run,{variant}).questions.some(q=>q.variantID));
  }
  assert.throws(()=>variantIndex({runID:'qa'},'test',4));
});

test('unrequested games, shared engines, saves and public surfaces are unmodified', () => {
  execFileSync('git', ['diff','--exit-code','HEAD','--',
    'audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush', 'audit_tools/econ_rpg/game/games/gdp-live',
    ...['main-attraction','ppf','megastar-mania','gameday-rivals'].map(s=>`audit_tools/econ_rpg/game/scenarios/${s}.js`), 'audit_tools/econ_rpg/game/engine.js',
    'audit_tools/econ_rpg/game/gameday-rivals-engine.js', 'audit_tools/econ_rpg/game/storage.js',
    'audit_tools/econ_rpg/game/gameday-rivals-storage.js', 'games', 'play'], { stdio: 'pipe' });
});
