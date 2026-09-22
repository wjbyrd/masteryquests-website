import { MAX_WINDOWS, TOTAL_PRODUCT, productionRows, newRun, canAct, canReview, advance, resultText, operationalText } from './engine.js';
import { SCENES, sceneIndex } from './scenes.js';
import { debriefQuestions, currentQuestion, answerDebrief, continueDebrief, explorationMessage } from './debrief.js';
import { answerAnalysis, continueAnalysis } from './analysis.js';
import { renderAnalysis } from './analysis-view.js';
import { chooseAllocation, answerTwoTruck, continueTwoTruck } from './two-truck.js';
import { renderTwoTruck } from './two-truck-view.js';
import { createRecorder } from './telemetry.js';

const game = document.querySelector('#game');
let storage;
try { storage = window.localStorage; } catch { /* Recorder reports its memory fallback on first event. */ }
const warn = message => { const el = document.querySelector('#storage-warning'); el.textContent = message; el.hidden = false; };
let state = newRun();
let recorder = createRecorder(storage, warn);
const crew = n => `${n} ${n === 1 ? 'worker' : 'workers'}`;
const signed = n => n === null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`;
const button = (action, label) => `<button data-action="${action}" ${canAct(state, action) ? '' : 'disabled'}>${label}</button>`;
const rows = (data, formal = false) => data.map(({ workers, output, added }) => `<tr ${formal && workers === 4 ? 'class="turning-point"' : ''}><th scope="row">${formal ? workers : crew(workers)}</th><td>${output}</td>${added === undefined ? '' : `<td>${formal ? added : signed(added)}</td>`}</tr>`).join('');
function scene() {
  const s = SCENES[sceneIndex(state)];
  return `<figure class="scene"><img src="${s.src}" alt="${s.alt}" width="1599" height="984" fetchpriority="high"></figure>`;
}
function render(focus) {
  if (state.phase === 'intro') {
    game.innerHTML = `<section class="intro layout">${scene()}<div class="intro-copy"><p>One worker is scheduled. The truck, grill, prep space, and equipment are fixed. Demand will stay strong throughout the rush.</p><button class="primary" data-action="start_rush">START THE LUNCH RUSH</button></div></section>`;
  } else if (state.phase === 'active') {
    game.innerHTML = `<div class="layout active-layout">${scene()}
      <section class="operations" aria-label="Truck operations"><p class="window-count">Window ${state.round} / ${MAX_WINDOWS}</p><dl><div><dt>Crew</dt><dd id="crew">${crew(state.workers)}</dd></div><div><dt>Tacos completed this window</dt><dd id="output">${state.output} <small>tacos</small></dd></div><div><dt>Change from previous crew</dt><dd id="change">${signed(state.addedOutput)} <small>${state.addedOutput === null ? 'first window' : 'tacos'}</small></dd></div></dl><p class="rush-status">Demand stays strong</p><p class="operational-status">${operationalText(state)}</p><p id="result">${resultText(state)}</p></section>
      <section class="production-log" aria-labelledby="log-title"><h3 id="log-title">Production Log <span>${state.tested.length} / 6 crews tested</span></h3><table><thead><tr><th scope="col">Crew Tested</th><th scope="col">Output</th></tr></thead><tbody>${rows(state.tested.map(workers => ({ workers, output: TOTAL_PRODUCT[workers] })))}</tbody></table></section>
      <section class="controls" aria-labelledby="controls-title"><h3 id="controls-title">Manage your next window</h3><div class="staffing-actions">${button('call_worker', 'CALL IN A WORKER')}${button('hold_crew', 'KEEP CURRENT CREW')}${button('send_worker_home', 'SEND A WORKER HOME')}</div><p class="small">Each choice runs one service window. Crew range: 1–6.</p>
      ${canReview(state) ? `<p class="review-hint">${state.round === MAX_WINDOWS ? 'Your 10 windows are complete. Review the production record to continue.' : 'Keep experimenting, or review what you observed.'}</p><button class="primary" data-action="review_record">REVIEW THE PRODUCTION RECORD</button>` : `<p class="review-hint">Test ${4 - state.tested.length} more ${4 - state.tested.length === 1 ? 'crew size' : 'crew sizes'} to review the production record.</p>`}</section></div>`;
  } else if (state.phase === 'debrief') {
    const q = currentQuestion(state), answered = state.answers[state.questionIndex];
    // Only Q1 shows evidence. At the cap with <4 tested crews, supply a labeled
    // partial reference (1–4), never the full final table or fabricated observations.
    const reference = state.tested.length < 4;
    const evidence = reference ? [1, 2, 3, 4] : state.tested;
    game.innerHTML = `<section class="review debrief"><h2 id="stage-title" tabindex="-1">Production Debrief</h2><p class="small">Question ${state.questionIndex + 1} of ${debriefQuestions(state).length}</p>
      ${q.id === 'turning' ? `<table><caption>${reference ? 'Kitchen reference: crews 1–4, including untested sizes' : 'Your Production Log'} · tacos per equal-length window</caption><thead><tr><th scope="col">Crew Tested${reference ? ' / Reference' : ''}</th><th scope="col">Output</th></tr></thead><tbody>${rows(evidence.map(workers => ({ workers, output: TOTAL_PRODUCT[workers] })))}</tbody></table>` : ''}
      <fieldset><legend>${q.prompt}</legend>${q.kind === 'calculation' ? `<form id="calculation-form"><label for="extra-tacos">Additional tacos</label><div class="calculation-entry"><input id="extra-tacos" name="extra-tacos" type="number" inputmode="numeric" min="0" max="1000" step="1" required ${answered ? `disabled value="${answered.value}"` : ''}><button class="primary" type="submit" ${answered ? 'disabled' : ''}>CHECK CALCULATION</button></div></form>` : `<div class="answer-options ${q.id === 'turning' ? '' : 'concept-options'}">${q.options.map((option, index) => `<button data-answer="${index}" ${answered ? 'disabled' : ''} ${answered?.value === index ? 'aria-pressed="true"' : ''}>${option}</button>`).join('')}</div>`}</fieldset>
      ${answered ? `<div class="question-feedback" tabindex="-1" role="status"><p><strong>${answered.correct ? 'Yes.' : 'Here’s the comparison.'}</strong> ${q.explanation}</p><button class="primary" data-action="continue_debrief">${state.questionIndex + 1 === debriefQuestions(state).length ? 'BUILD THE PRODUCTION PICTURE' : 'CONTINUE'}</button></div>` : ''}</section>`;
  } else if (state.phase === 'reveal') {
    game.innerHTML = `<section class="review reveal"><p class="eyebrow">The pattern behind the rush</p><h2 id="stage-title" tabindex="-1">DIMINISHING MARGINAL RETURNS</h2><p class="exploration-message">${explorationMessage(state)}</p><p>The third worker added <strong>13 tacos</strong>. The fourth worker still increased total production, but only by <strong>11</strong>. The fixed truck, grill, prep space, and equipment were beginning to constrain the additional labor. Marginal product had started to fall even though total product was still rising.</p><table><caption>Tacos per production window</caption><thead><tr><th scope="col">Labor</th><th scope="col">Total Product</th><th scope="col">Marginal Product</th></tr></thead><tbody>${rows(productionRows(), true)}</tbody></table><p class="small"><strong>Total product:</strong> all tacos made in one window. <strong>Marginal product of labor:</strong> the extra tacos from one more worker, with other inputs fixed. The first worker adds 8 tacos relative to zero workers; the opening scene was not a production window.</p><div class="explanation-grid"><section><h3>First, divide the work.</h3><p>Early workers can increase one another’s productivity because tasks can be divided. One worker can cook while another handles orders, prep, or assembly. That specialization helps explain why marginal product initially rises.</p></section><section><h3>Then, share the same space.</h3><p>As the crew grew, more workers had to share the same truck, grill, prep space, and equipment. Additional workers still increased total production, but by smaller amounts. In the short run, labor can change while the truck and equipment stay fixed.</p></section></div><p class="takeaway">Smaller additions. Still more tacos.</p><p>You finished with ${crew(state.finalCrew)}. This experiment compares production; it does not rank your final crew.</p><button class="primary" data-action="continue_analysis">THE NEXT RUSH</button></section>`;
  } else if (['two_truck', 'allocation_result', 'capacity_question', 'dmr_transfer', 'complete'].includes(state.phase)) {
    game.innerHTML = renderTwoTruck(state);
  } else {
    game.innerHTML = renderAnalysis(state);
  }
  if (focus === 'stage') (document.querySelector('#stage-title') || document.querySelector('#game-title')).focus();
  else if (focus === 'feedback') document.querySelector('.question-feedback').focus();
  else if (focus) {
    const target = game.querySelector(`[data-action="${focus}"]:not(:disabled)`) || game.querySelector('[data-action="review_record"]') || game.querySelector('[data-action="hold_crew"]');
    target?.focus({ preventScroll: true });
  }
}
game.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target || target.disabled) return;
  if (target.dataset.action === 'replay') {
    state = newRun(); recorder = createRecorder(storage, warn);
    document.querySelector('#announcement').textContent = '';
    render('stage'); return;
  }
  const before = state;
  if (target.dataset.answer) {
    submitAnswer(Number(target.dataset.answer));
    return;
  }
  if (target.dataset.analysisAnswer !== undefined) {
    state = answerAnalysis(state, Number(target.dataset.analysisAnswer));
    if (state !== before) {
      recorder.log({ total_graph: 'total_product_graph_answer', marginal_graph: 'marginal_product_graph_answer' }[state.phase], state, state.workers);
      render('feedback');
    }
    return;
  }
  if (target.dataset.allocation !== undefined) {
    state = chooseAllocation(state, Number(target.dataset.allocation));
    if (state !== before) {
      recorder.log('two_truck_allocation', state, state.workers);
      if (!before.twoTruck.bestAllocationFound && state.twoTruck.bestAllocationFound) recorder.log('two_truck_best_allocation_found', state, state.workers);
      render('stage');
    }
    return;
  }
  if (target.dataset.truckAnswer !== undefined) {
    state = answerTwoTruck(state, Number(target.dataset.truckAnswer));
    if (state !== before) {
      recorder.log(state.phase === 'capacity_question' ? 'two_truck_concept_answer' : 'two_truck_dmr_transfer_answer', state, state.workers);
      render('feedback');
    }
    return;
  }
  const action = target.dataset.action;
  state = action === 'continue_debrief' ? continueDebrief(state) : action === 'continue_analysis' ? continueAnalysis(state) : action === 'continue_two_truck' ? continueTwoTruck(state) : advance(state, action);
  if (state === before) return;
  if (!['continue_debrief', 'continue_analysis', 'continue_two_truck'].includes(action)) recorder.log(action, state, before.workers || null);
  if (before.phase === 'debrief' && state.phase === 'total_graph') recorder.log('production_review_complete', state, state.workers);
  if (before.phase === 'reveal' && state.phase === 'two_truck') recorder.log('two_truck_challenge_start', state, state.workers);
  if (state.phase === 'complete') recorder.log('game_complete', state, state.workers);
  render(state.phase !== before.phase || action === 'continue_debrief' ? 'stage' : action);
  if (state.phase === 'active') document.querySelector('#announcement').textContent = `Window ${state.round}. ${resultText(state)} ${operationalText(state)}${state.round === MAX_WINDOWS ? ' Review the production record to continue.' : ''}`;
});
function submitAnswer(value) {
  const next = answerDebrief(state, value);
  if (next === state) return;
  state = next; recorder.log('debrief_answer', state, state.workers); render('feedback');
}
game.addEventListener('submit', event => {
  if (event.target.id !== 'calculation-form') return;
  event.preventDefault();
  const input = document.querySelector('#extra-tacos');
  if (input.reportValidity()) submitAnswer(input.valueAsNumber);
});
render();
