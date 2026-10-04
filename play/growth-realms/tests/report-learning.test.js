import test from 'node:test';
import assert from 'node:assert/strict';
import {CONCEPTS, QUESTIONS, runConnection, shuffledOptions} from '../report-learning.js';
import {reportHTML} from '../debrief.js';
import {createRun, commitRun, finishRunCycle, nextRunCycle} from '../session.js';

function finished(city, allocation) {
  const run = createRun(city, {doctrine: 'balanced'});
  for (let n = 0; n < 10; n++) {
    run.allocation = {...allocation};
    commitRun(run); finishRunCycle(run); nextRunCycle(run);
  }
  return run;
}

test('Learning report keeps evidence before synthesis, interpretation after it, and one transfer item', () => {
  for (const city of ['meridian', 'rivermark']) {
    const run = finished(city, {capital: 5, resources: 5, research: 5, education: 5});
    const before = structuredClone(run), html = reportHTML(run);
    const order = ['Two productivity paths', 'synthesis-title', 'Your decisions, economically', 'You were making growth policy.', 'check-title', 'Open your round ledger'];
    for (let i = 1; i < order.length; i++) assert.ok(html.indexOf(order[i]) > html.indexOf(order[i - 1]));
    assert.equal(CONCEPTS.length, 6);
    for (const [name] of CONCEPTS) assert.ok(html.includes(name));
    assert.match(html, /Growth Rate ≠ Economic Level/);
    assert.match(html, /catch-up is not guaranteed/);
    assert.doesNotMatch(html, /class="transfer panel"/);
    assert.equal(QUESTIONS.filter(q => q.title === 'Another economy. A new decision.').length, 1);
    assert.deepEqual(run, before);
  }
});

test('Personalization reports observed early investment or actual resource/adoption constraints', () => {
  const capital = finished('rivermark', {capital: 20, resources: 0, research: 0, education: 0});
  assert.match(runConnection(capital), /40 of 40 early development points/);
  const run = finished('meridian', {capital: 0, resources: 0, research: 20, education: 0});
  const player = run.cities.find(c => c.id === run.playerCity);
  const strained = player.history.filter(h => h.endState.constraints.resourceShortage).length;
  const adoption = player.history.filter(h => h.endState.constraints.technologyAdoption).length;
  const line = runConnection(run);
  if (strained) assert.ok(line.includes(`resource constraints in ${strained} of 10 rounds`));
  else if (adoption) assert.ok(line.includes(`limited technology adoption in ${adoption} of 10 rounds`));
  else assert.ok(line.includes('200 points'));
  assert.doesNotMatch(line, /caused|proved|optimal/);
});

test('Exactly four concept items each retain four unique choices, one key and instructional feedback after shuffling', () => {
  assert.equal(QUESTIONS.length, 4);
  assert.deepEqual(QUESTIONS.map(q => q.id), ['catch-up', 'capital', 'skills', 'transfer']);
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map(o => o[0])).size, 4);
    assert.equal(q.options.filter(o => o[0] === q.answer).length, 1);
    const before = structuredClone(q);
    for (const draw of [0, .2, .5, .99]) {
      const options = shuffledOptions(q, () => draw);
      assert.deepEqual(new Set(options.map(o => o[0])), new Set(q.options.map(o => o[0])));
      for (const [id, , feedback] of options) {
        assert.ok(feedback.length > 60);
        assert.match(feedback, id === q.answer ? /^Exactly\./ : /try again/i);
      }
    }
    assert.notDeepEqual(shuffledOptions(q, () => 0), shuffledOptions(q, () => .99));
    assert.deepEqual(q, before);
  }
  const transfer = QUESTIONS[3];
  assert.equal(transfer.answer, 'potential');
  assert.match(transfer.prompt, /little equipment per worker, strong schools, reliable infrastructure/);
});
