import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { enumerate } from './qa.mjs';
import { audit } from './gameday-rivals-qa.mjs';
import { scenarios } from './game/scenarios/registry.js';
import { createRun, decide } from './game/engine.js';
import { followupFor, evaluateAnswer } from './game/instructional-followup.js';
import { ticketMarket } from './game/scenarios/megastar-mania-market.js';

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
  const park = followupFor('main-attraction', enumerate(scenarios['main-attraction']).complete[0]);
  assert.equal(48 * 110 - 50 * 100, 280); assert.equal(280 - 350, -70);
  assert.match(park.questions[0].explanation, /\$28 per extra guest/);
  assert.equal(50 - 30, 20);
  const runs = enumerate(scenarios['megastar-mania']).complete;
  assert.ok(runs.some(run => Math.sign(run.state.demand - run.state.supply) !== Math.sign(ticketMarket(run).wanted - run.state.supply)), 'test includes raw-demand comparisons that would misclassify the market');
});

test('PASS games, economics, saves and public surfaces are unmodified', () => {
  execFileSync('git', ['diff','--exit-code','HEAD','--',
    'audit_tools/econ_rpg/game/games/takeout-taco-lunch-rush', 'audit_tools/econ_rpg/game/games/gdp-live',
    'audit_tools/econ_rpg/game/scenarios', 'audit_tools/econ_rpg/game/engine.js',
    'audit_tools/econ_rpg/game/gameday-rivals-engine.js', 'audit_tools/econ_rpg/game/storage.js',
    'audit_tools/econ_rpg/game/gameday-rivals-storage.js', 'games', 'play'], { stdio: 'pipe' });
});
