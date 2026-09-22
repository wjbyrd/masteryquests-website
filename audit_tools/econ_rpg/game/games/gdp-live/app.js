import { CONFIG, COMPONENTS } from './config.js';
import * as engine from './engine.js';
import { renderWork, componentBoard, ledgerView, money } from './view.js';
import { createCounter } from './counter.js';
import { createRecorder } from './telemetry.js';

const work = document.querySelector('#work');
const counter = createCounter(document.querySelector('#gdp-number'));
const announcement = document.querySelector('#announcement');
let state, recorder, componentChanges = {};
document.title = `${CONFIG.title} | Mastery Quests`;
document.querySelector('#game-title').textContent = CONFIG.title;

function reset() {
  state = engine.newRun(crypto.getRandomValues(new Uint32Array(1))[0]);
  componentChanges = {};
  let storage;
  try { storage = localStorage; } catch { /* Private browsing may block storage. */ }
  recorder = createRecorder(storage, message => {
    const warning = document.querySelector('#storage-warning');
    warning.textContent = message; warning.hidden = false;
  });
  announcement.textContent = '';
  render(null);
}
function render(before, focus = true) {
  const changed = before && before.accounts !== state.accounts;
  if (changed) componentChanges = Object.fromEntries([...COMPONENTS, 'NX'].map(k => [k,
    k === 'NX' ? engine.nx(state.accounts) - engine.nx(before.accounts) : state.accounts[k] - before.accounts[k]]));
  else if (!before || before.stage !== state.stage) componentChanges = {};
  const ledgerOpen = before ? document.querySelector('#ledger')?.open : false;
  work.innerHTML = renderWork(state);
  if (!before || changed || before.stage !== state.stage) document.querySelector('#component-board').innerHTML = componentBoard(state, componentChanges);
  document.querySelector('#ledger-panel').innerHTML = ledgerView(state, ledgerOpen);
  if (!before || changed) counter.update(engine.gdp(state.accounts), !!before);
  document.querySelector('#gdp-change').textContent = state.lastDelta === null ? 'Ready to post' : `GDP CHANGE: ${money(state.lastDelta)}`;
  document.querySelector('#counter-mode').textContent = state.stage.startsWith('audit') && !state.auditCorrected ? 'Draft batch · under review' : state.stage === 'intro' ? 'Opening accounts' : state.stage === 'complete' ? 'Reconciled accounts' : 'Live national accounts';
  if (focus) document.querySelector('#stage-title').focus({ preventScroll: true });
  if (before) {
    const attempt = state.postAttempts !== before.postAttempts ? `Posting attempt ${state.attempts}. `
      : state.auditFindAttempts !== before.auditFindAttempts ? `Inspection ${state.auditFindAttempts}. `
      : state.auditRepairAttempts !== before.auditRepairAttempts ? `Repair attempt ${state.auditRepairAttempts}. `
      : state.shockAttempts !== before.shockAttempts ? `Final challenge attempt ${state.shockAttempts}. ` : '';
    if (attempt || state.feedback !== before.feedback || changed) announcement.textContent = `${attempt}${state.feedback} ${changed ? `GDP change ${money(engine.gdp(state.accounts) - engine.gdp(before.accounts))}. Simulated GDP ${engine.gdp(state.accounts).toLocaleString('en-US')} billion.` : ''}`;
  }
}
const log = (name, before, extra = {}) => recorder.log(name, before, state, extra);
function presented() {
  recorder.log('scenario_presented', state, state, { phase: engine.currentScenario(state).phase, attemptNumber: 0 });
}

work.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  const before = state;
  if (button.dataset.account) {
    state = engine.toggleAccount(state, button.dataset.account);
    render(before, false);
    work.querySelector(`[data-account="${button.dataset.account}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (button.dataset.audit) {
    state = engine.identifyAudit(state, button.dataset.audit);
    log('audit_attempt', before, { step: 'identify', entryID: button.dataset.audit, attemptNumber: state.auditFindAttempts, correct: state.auditIdentified });
  } else switch (button.dataset.action) {
    case 'start':
      state = engine.start(state); log('run_start', before, { seed: state.seed }); presented(); break;
    case 'post': {
      state = engine.postTransaction(state);
      if (before === state) return;
      const correct = state.stage === 'posted', scenario = engine.currentScenario(state);
      log('post_attempt', before, { phase: scenario.phase, attemptNumber: state.attempts, correct, firstAttemptCorrect: correct && state.attempts === 1 });
      if (correct) log('transaction_posted', before, { phase: scenario.phase, postings: scenario.postings, firstAttemptCorrect: state.attempts === 1 });
      break;
    }
    case 'next':
      state = engine.nextTransaction(state);
      if (state.stage === 'identity' || engine.currentScenario(before).phase !== engine.currentScenario(state).phase) log('phase_complete', before, { phase: engine.currentScenario(before).phase });
      if (state.stage === 'identity') log('identity_reveal', before); else presented();
      break;
    case 'audit': state = engine.beginAudit(state); log('audit_presented', before); break;
    case 'repair':
      state = engine.repairAudit(state);
      if (before === state) return;
      log('audit_attempt', before, { step: 'repair', attemptNumber: state.auditRepairAttempts, correct: state.auditCorrected });
      if (state.auditCorrected) log('audit_corrected', before, { auditCorrect: true, firstAttemptCorrect: state.auditFindAttempts === 1 && state.auditRepairAttempts === 1, postings: state.lastPostings });
      break;
    case 'shock': state = engine.beginShock(state); log('shock_presented', before); break;
    case 'replay': reset(); return;
    default: return;
  }
  render(before);
});
work.addEventListener('submit', event => {
  if (event.target.id !== 'shock-form') return;
  event.preventDefault();
  const raw = document.querySelector('#shock-value').value, before = state;
  state = engine.answerShock(state, raw);
  if (state === before) return;
  log('shock_attempt', before, { attemptNumber: state.shockAttempts, correct: state.shockCorrected, answer: engine.parseAmount(raw) });
  if (state.shockCorrected) log('run_complete', before, { shockCorrect: true, auditCorrect: state.auditCorrected, firstAttemptCorrect: state.shockAttempts === 1, transactionsPosted: state.deck.length, firstCorrect: state.firstCorrect, postAttempts: state.postAttempts });
  render(before);
  if (!state.shockCorrected) {
    const input = document.querySelector('#shock-value');
    input.value = raw; input.focus({ preventScroll: true }); input.select();
  }
});
reset();
