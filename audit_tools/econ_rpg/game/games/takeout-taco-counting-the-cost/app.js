import { COSTS } from './config.js';
import { perService, equipmentLabel, marginalSchedule } from './engine.js';
import { newRun, transition, choices, ROUND_TITLES, TARGETS, labGraphState } from './gameplay.js';
import { money, challenge, consequence, changeExplanation, review } from './content.js';
import { labView } from './lab.js';
import { primaryGraphs, curvesView } from './graphs.js';
import { SCENES, TWO_TRUCK_SCENE } from '../takeout-taco-lunch-rush/scenes.js';
import { createRecorder } from './telemetry.js';

const $ = s => document.querySelector(s), game = $('#game'), dialog = $('#detail-dialog');
const mobile = matchMedia('(max-width:760px)');
const compactCharts = matchMedia('(max-width:1000px)');
let state = newRun(), curves = { kind: 'total', key: null, reference: false, full: false }, graphExpanded = false;
let storage, dialogMode = null, returnFocus = null;
try { storage = localStorage; } catch { /* Play remains available without persistence. */ }
const warn = message => { $('#storage-warning').textContent = message; $('#storage-warning').hidden = false; };
let recorder = createRecorder(storage, warn);
const archives = [];
function log(action, extra = {}) {
  const t = state.trials.at(-1);
  recorder.log(action, { round: state.round, phase: state.phase, step: state.step, selected: state.selected,
    trialNumber: state.trials.length, completed: state.completed, ...extra,
    ...(action === 'service_trial' ? { plan: t.plan, scenario: t.key, output: t.output, capacity: t.capacity, shortfall: t.shortfall,
      feasible: t.feasible, Q: t.Q, FC: t.FC, VC: t.VC, TC: t.TC, AFC: t.AFC, AVC: t.AVC, ATC: t.ATC, MC: t.MC,
      perService: perService(t), ingredientMode: 'automatic_exact_output' } : {}) });
}
function scene() {
  const p = state.plan, workers = p.workers[0];
  const art = p.trucks === 2 ? TWO_TRUCK_SCENE : SCENES[Math.max(1, workers)];
  const target = state.round === 8 ? state.target : TARGETS[state.round];
  return `<figure class="scene ${workers === 0 ? 'parked' : ''}"><div class="scene-image"><img src="${art.src}" alt="${art.alt}${p.trucks === 2 ? ' The artwork illustrates expansion; the actual allocation is stated below.' : workers === 0 ? ' The illustration is parked; your plan has zero workers.' : ''}" width="1599" height="984" fetchpriority="high"><span class="scene-tag">${state.round === 1 ? 'Before the first taco' : state.phase === 'result' ? `Service complete · ${state.trials.at(-1).output} tacos made` : `${target || '?'} tacos promised`}</span></div><figcaption><span>${p.trucks === 2 ? `Truck A: ${p.workers[0]} · Truck B: ${p.workers[1]}` : `${workers} workers · 1 truck · 1 grill`}</span><span class="crew-dots" aria-hidden="true">${Array.from({ length: Math.min(6, p.workers.reduce((a, b) => a + b, 0)) }, () => '<i></i>').join('')}</span></figcaption></figure>`;
}
function roundBar() {
  return `<div class="round-bar"><p>${ROUND_TITLES[state.round - 1]}</p><ol aria-label="Round progress">${ROUND_TITLES.map((t, i) => `<li class="${i + 1 === state.round ? 'current' : i + 1 < state.round ? 'done' : ''}" ${i + 1 === state.round ? 'aria-current="step"' : ''} aria-label="Round ${i + 1}: ${t}${i + 1 === state.round ? ', current' : ''}">${i + 1}</li>`).join('')}</ol></div>`;
}
function render(focus = true) {
  $('#tools').hidden = !currentTrials().length;
  if (state.phase === 'intro') {
    game.innerHTML = `<section class="intro"><img src="${SCENES[3].src}" width="1599" height="984" alt="Three workers prepare food at Takeout Taco’s bright green truck."><div><h2 id="stage-title" tabindex="-1">Make the tacos.<br>Discover the costs.</h2><p>Orders are coming. Decide who to hire, how much to promise, and whether to expand. Your choices build the cost picture.</p><button class="primary" data-action="start">OPEN TAKEOUT TACO →</button></div></section>`;
  } else if (state.phase === 'lab') {
    game.innerHTML = labView(state, { ...curves, compact: compactCharts.matches });
  } else if (state.phase === 'choice') {
    const c = challenge(state);
    game.innerHTML = `${roundBar()}<div class="play-layout choice-layout">${scene()}<section class="decision"><p class="eyebrow">Your call</p><h2 id="stage-title" tabindex="-1">${c.title}</h2><p class="story">${c.text}</p><fieldset><legend>${c.question}</legend><div class="choices">${choices(state).map(option => `<button class="choice-card" data-choice="${option.id}" aria-pressed="${state.selected === option.id}"><strong>${option.title}</strong><span>${option.text}</span></button>`).join('')}</div></fieldset><p class="small choice-note">${c.note}</p><button class="primary" id="commit" data-action="commit" ${!state.selected ? 'disabled' : ''}>${c.action} →</button>${state.round === 8 && state.step !== 'commitment' ? '<button class="text-button" data-action="back">← Change the previous decision</button>' : ''}</section></div>`;
  } else if (state.phase === 'result') {
    const result = consequence(state), t = state.trials.at(-1);
    game.innerHTML = `${roundBar()}<div class="play-layout result-layout">${scene()}<div class="result-side"><section class="result"><p class="eyebrow">What happened?</p><h2 id="stage-title" tabindex="-1">${result.title}</h2><p class="headline">${result.headline}</p><dl class="result-numbers"><div><dt>Tacos made / promised</dt><dd id="actual-output">${result.output}</dd></div><div><dt>Total cost / lunch</dt><dd id="total-cost">${result.cost}</dd></div></dl><p class="outcome-label">${state.round === 1 ? 'No production · fixed bill remains' : result.feasible ? 'Order fulfilled' : `${t.shortfall} tacos short · you can still continue`}</p><h3>Why?</h3><p class="why">${result.why}</p>${result.insight ? `<details class="insight"><summary>Compare with the reference</summary><p>${result.insight}</p></details>` : ''}</section><nav class="next-actions" aria-label="Next decision"><button class="primary" data-action="continue">${state.round === 8 ? 'Review my eight rounds' : 'Continue'} →</button>${state.round > 1 ? '<button data-action="revise">Explore Another Choice</button>' : ''}</nav></div><section class="plot" aria-label="This decision’s graph"><button class="mobile-graph-toggle" data-action="expand-graph" aria-expanded="${graphExpanded}">${graphExpanded ? 'Hide graph' : 'See the new graph point'} ↓</button><div class="plot-content ${graphExpanded ? 'expanded' : ''}">${primaryGraphs(state, { compact: compactCharts.matches })}</div></section></div>`;
  } else {
    game.innerHTML = `<section class="review"><p class="eyebrow">Your eight-round record</p><h2 id="stage-title" tabindex="-1">Cost of Production Review</h2>${review(state)}<section id="final-curves"><h3>Your cost curves</h3><div id="final-curves-content">${curvesView(graphState(), { ...curves, compact: compactCharts.matches })}</div></section><div class="actions"><button data-action="report">Open the complete Cost Report</button><button data-action="lab-start">Free Play / Cost Lab</button><button class="primary" data-action="replay">Play again →</button></div>${archives.length ? `<details><summary>Earlier playthroughs in this tab</summary>${archives.map((a, i) => `<button data-archive="${i}">Review earlier run ${i + 1} · ${a.state.trials.length} trials</button>`).join('')}</details>` : ''}</section>`;
  }
  if (focus) $('#stage-title')?.focus();
}
const currentTrials = () => state.phase === 'lab' ? state.lab.trials : state.trials;
const graphState = () => state.phase === 'lab' ? labGraphState(state) : state;
function act(action, value) {
  if (action === 'report' || action === 'curves') { openDetails(action); return; }
  if (action === 'expand-graph') {
    graphExpanded = !graphExpanded; $('.plot-content').classList.toggle('expanded', graphExpanded);
    const button = $('[data-action="expand-graph"]'); button.setAttribute('aria-expanded', String(graphExpanded)); button.textContent = graphExpanded ? 'Hide graph ↑' : 'See the new graph point ↓'; return;
  }
  if (action === 'replay') {
    log('replay'); archives.push({ state, recorder }); state = newRun(); recorder = createRecorder(storage, warn);
    curves = { kind: 'total', key: null, reference: false, full: false }; graphExpanded = false; render(); $('#announcement').textContent = 'New playthrough ready. Earlier runs remain available after the review.'; return;
  }
  const previous = state, next = transition(state, action, value); if (next === state) return;
  state = next;
  if (action.startsWith('lab-')) {
    curves.key = state.phase === 'lab' ? state.lab.trials.at(-1)?.key : state.trials.at(-1)?.key;
    log(action, { source: 'lab', trial: action === 'lab-run' ? state.lab.trials.at(-1) : undefined }); render();
    $('#announcement').textContent = action === 'lab-run' ? `Lab trial recorded: ${state.lab.trials.at(-1).output} tacos. Story history unchanged.` : action === 'lab-start' ? 'Cost Lab unlocked. Configure your optional experiment.' : 'Returned to your eight-round review.'; return;
  }
  log(action === 'select' ? 'choice_selected' : action === 'start' ? 'run_started' : action === 'revise' ? 'decision_revised' : action === 'commit' ? 'decision_committed' : 'round_advanced');
  if (state.trials.length > previous.trials.length) {
    const t = state.trials.at(-1);
    if (!previous.trials.some(old => old.key === t.key)) log('scenario_created', { scenario: t.key, equipment: { trucks: t.plan.trucks, grills: t.plan.grills } });
    log('service_trial');
    if (state.round === 8) log('expansion_decision', { target: state.target, trucks: t.plan.trucks, workers: t.plan.workers });
    curves.key = t.key;
  }
  if (state.completed && !previous.completed) log('completion');
  if (action === 'select') {
    document.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === state.selected)));
    $('#commit').disabled = false; return;
  }
  render();
  $('#announcement').textContent = state.phase === 'result' ? `${consequence(state).headline} Total cost ${consequence(state).cost} per lunch. A new observation was recorded. ${consequence(state).why}` : state.phase === 'review' ? 'Eight rounds complete. Your personal cost review and full trial history are available.' : `Round ${state.round}: ${challenge(state).question}`;
}
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.choice) act('select', button.dataset.choice);
  else if (button.dataset.action) act(button.dataset.action);
  else if (button.dataset.archive !== undefined) {
    const index = Number(button.dataset.archive), saved = archives[index]; archives[index] = { state, recorder };
    ({ state, recorder } = saved); curves.key = null; render(); log('run_restored');
  }
});
function reportHTML(id) {
  const trials = currentTrials(), t = trials.find(t => t.id === id) || trials.at(-1), r = perService(t);
  const rows = ['FC', 'labor', 'ingredients', 'VC', 'TC', 'AFC', 'AVC', 'ATC'];
  return `<label for="report-trial">Recorded decision<select id="report-trial">${trials.map(a => `<option value="${a.id}" ${a.id === t.id ? 'selected' : ''}>${a.source === 'lab' ? 'Lab trial' : 'Trial'} ${a.id} · ${a.source === 'lab' ? 'sandbox' : `round ${a.round}`}  · ${a.output}/${a.plan.target} tacos</option>`).join('')}</select></label><p>${equipmentLabel(t.plan)} · workers ${t.plan.workers.slice(0, t.plan.trucks).join(' + ')} · capacity ${t.capacity} tacos/lunch · ${t.plan.kits} automatically purchased kits · ${t.unused} unused.</p><dl class="report-values">${rows.map(f => `<div><dt>${f} ${['AFC', 'AVC', 'ATC'].includes(f) ? '/ taco' : '/ lunch'}</dt><dd>${money(r[f], ['AFC', 'AVC', 'ATC'].includes(f) ? 2 : 0)}</dd></div>`).join('')}</dl><p class="small">FC + VC = TC. AFC = FC/output, AVC = VC/output, ATC = TC/output. Averages are undefined at zero output.</p><p><strong>Efficiency:</strong> minimum cost for this actual output with the same equipment is ${money(perService(t.minimum).TC)} per lunch. Avoidable expense: ${money(r.avoidable)} per lunch.</p><p>${changeExplanation(t)}</p>${t.staffingReference ? `<p><strong>Separate staffing MC reference:</strong> worker ${t.staffingReference.workers} adds ${t.staffingReference.MP} tacos at full capacity, at ${money(t.staffingReference.MC, 2)} per additional taco. This does not assume that your order used all of the new capacity.</p>` : ''}<details><summary>Monthly projection and assumptions</summary><p>Repeat this plan for ${COSTS.shifts} identical services: ${t.Q} tacos, FC ${money(t.FC)}, VC ${money(t.VC)}, TC ${money(t.TC)}. These are alternative plans, not an accumulated bill.</p><p>Truck ${money(COSTS.truck)}/month; grill ${money(COSTS.grill)}/month; worker ${money(COSTS.wage)}/service; ingredients ${money(COSTS.kit)}/taco. All prices are illustrative.</p></details><details><summary>Complete trial history</summary><div class="table-scroll" tabindex="0" role="region" aria-label="All trial observations"><table><caption>${state.phase === 'lab' ? 'Cost Lab only; story excluded' : 'Story decisions, including experiments; lab excluded'} · dollars per lunch service</caption><thead><tr>${['Trial', 'Round', 'Trucks', 'Crew A+B', 'Target', 'Actual', 'FC', 'VC', 'TC', 'ATC/taco'].map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${trials.map(t => { const s = perService(t); return `<tr><th scope="row">${t.id}</th><td>${t.round ?? 'Lab'}</td><td>${t.plan.trucks}</td><td>${t.plan.workers.join('+')}</td><td>${t.plan.target}</td><td>${t.output}</td><td>${money(s.FC)}</td><td>${money(s.VC)}</td><td>${money(s.TC)}</td><td>${money(t.ATC, 2)}</td></tr>`; }).join('')}</tbody></table></div><button id="download">Download trial data</button></details>${state.completed ? `<details><summary>Canonical full-capacity staffing references</summary><table><caption>Calculated one-truck technology, not additional student trials</caption><thead><tr><th scope="col">Workers</th><th scope="col">Capacity</th><th scope="col">MP</th><th scope="col">MC/taco</th></tr></thead><tbody>${marginalSchedule({ trucks: 1, grills: [true, false] }).map(r => `<tr><th scope="row">${r.workers}</th><td>${r.output}</td><td>${r.MP ?? '—'}</td><td>${money(r.MC, 2)}</td></tr>`).join('')}</tbody></table></details>` : ''}`;
}
function openDetails(mode) {
  if (!currentTrials().length) return;
  if (mode === 'curves' && ['review', 'lab'].includes(state.phase)) { $(state.phase === 'lab' ? '#lab-curves-content' : '#final-curves').scrollIntoView(); $('#curve-kind').focus(); return; }
  returnFocus = document.activeElement; dialogMode = mode;
  $('#dialog-title').textContent = mode === 'report' ? (state.phase === 'lab' ? 'Lab Cost Report' : 'Cost Report') : 'Your Cost Curves';
  $('#dialog-content').innerHTML = mode === 'report' ? reportHTML() : curvesView(graphState(), { ...curves, compact: compactCharts.matches });
  dialog.showModal(); $('#close-dialog').focus(); log(mode === 'report' ? 'report_opened' : 'curves_opened');
}
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { dialogMode = null; $('#dialog-content').replaceChildren(); returnFocus?.focus(); });
document.addEventListener('change', event => {
  const id = event.target.id;
  if (id === 'report-trial') { $('#dialog-content').innerHTML = reportHTML(Number(event.target.value)); $('#report-trial').focus(); return; }
  if (!id.startsWith('curve-')) return;
  const container = state.phase === 'lab' ? $('#lab-curves-content') : state.phase === 'review' ? $('#final-curves-content') : $('#dialog-content');
  curves = { kind: container.querySelector('#curve-kind').value, key: container.querySelector('#curve-equipment').value,
    reference: container.querySelector('#curve-reference').checked, full: container.querySelector('#curve-full')?.checked || false };
  container.innerHTML = curvesView(graphState(), { ...curves, compact: compactCharts.matches }); $(`#${id}`).focus();
  log('graph_explored', curves);
});
$('#dialog-content').addEventListener('click', event => {
  if (event.target.id !== 'download') return;
  const rows = [['source', 'trial', 'round', 'trucks', 'workers_A', 'workers_B', 'target_per_lunch', 'actual_per_lunch', 'kits_per_lunch', 'FC_per_lunch', 'VC_per_lunch', 'TC_per_lunch', 'AFC_per_taco', 'AVC_per_taco', 'ATC_per_taco'], ...currentTrials().map(t => { const r = perService(t); return [t.source, t.id, t.round, t.plan.trucks, ...t.plan.workers, t.plan.target, t.output, t.plan.kits, r.FC, r.VC, r.TC, r.AFC, r.AVC, r.ATC]; })];
  const url = URL.createObjectURL(new Blob([rows.map(row => row.map(v => v ?? '').join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = state.phase === 'lab' ? 'takeout-taco-lab-trials.csv' : 'takeout-taco-cost-trials.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); log('history_exported');
});
mobile.addEventListener('change', () => { render(false); if (dialog.open && dialogMode === 'curves') $('#dialog-content').innerHTML = curvesView(graphState(), { ...curves, compact: compactCharts.matches }); });
compactCharts.addEventListener('change', () => { render(false); if (dialog.open && dialogMode === 'curves') $('#dialog-content').innerHTML = curvesView(graphState(), { ...curves, compact: compactCharts.matches }); });
document.addEventListener('submit', event => {
  if (event.target.id !== 'lab-form') return;
  event.preventDefault(); if (!event.target.reportValidity()) return;
  const data = new FormData(event.target);
  act('lab-run', { target: Number(data.get('target')), trucks: Number(data.get('trucks')), workers: [Number(data.get('workers-a')), Number(data.get('workers-b'))], grills: [data.has('grill-a'), data.has('grill-b')] });
});
render(false);

