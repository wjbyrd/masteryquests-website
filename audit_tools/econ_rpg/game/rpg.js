import scenario from './scenarios/housing-crisis.js';
import { createRun, decide, advance, transitionEvent, validateScenario } from './engine.js';
import { loadRun, saveRun, clearRun } from './storage.js';
import { render } from './ui.js';
validateScenario(scenario);
document.title = `${scenario.title} · Mastery Quests development`;
document.querySelector('#scenario-title').textContent = scenario.title;
document.querySelector('#subtitle').textContent = scenario.subtitle;
// Future integration seam only. No listeners, network calls, or event persistence.
const onTransition = () => {};
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let { run: saved, reason } = loadRun(storage, scenario);
let run = null;
function notice(message) {
  const target = document.querySelector('#storage-notice'); target.hidden = !message; target.textContent = message;
}
if (reason) notice(reason === 'version' ? 'A save from a different scenario version cannot be resumed. Start a fresh run.' : 'Saved progress could not be read. You can play, but this run may not survive a reload.');
function event(type, choiceID) { onTransition(transitionEvent(type, run, choiceID)); }
function persist() {
  saved = run;
  if (!saveRun(storage, scenario, run)) notice('Progress could not be saved in this browser. You can continue this session; reloading may lose your path.');
}
function paint(focus = true) { render(scenario, run, saved, actions, focus); }
function start() {
  run = createRun(scenario); persist(); event('scenario_start'); event('decision_presented'); paint();
}
const actions = {
  start,
  resume() { run = saved; paint(); event(run.phase === 'decision' ? 'decision_presented' : run.phase === 'consequence' ? 'consequence_viewed' : 'scenario_complete'); },
  choose(id) {
    run = decide(scenario, run, id); persist(); event('decision_selected', id); paint(); event('consequence_viewed', id);
    const entry = run.history.at(-1);
    document.querySelector('#announcement').textContent = Object.keys(scenario.state).filter(k => entry.before[k] !== entry.after[k]).map(k => `${scenario.state[k].label} ${entry.after[k] > entry.before[k] ? 'increased' : 'decreased'} to ${entry.after[k]} of ${scenario.state[k].max}`).join('. ') || 'Indicators held steady.';
  },
  advance() { run = advance(scenario, run); persist(); paint(); event(run.phase === 'ending' ? 'scenario_complete' : 'decision_presented'); },
  replay() { reset(); }
};
function reset() {
  const cleared = clearRun(storage, scenario);
  notice(cleared ? '' : 'The old save could not be cleared. Browser storage is unavailable.');
  saved = null; run = null; document.querySelector('#announcement').textContent = 'Fresh run started.'; start();
}
const dialog = document.querySelector('#restart-dialog');
document.querySelector('#restart').addEventListener('click', () => dialog.showModal());
document.querySelector('#cancel-restart').addEventListener('click', () => dialog.close());
document.querySelector('#confirm-restart').addEventListener('click', () => { dialog.close(); reset(); });
paint(false);
