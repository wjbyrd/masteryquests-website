import { GAME_ID } from './engine.js';
import { debriefMetrics } from './debrief.js';
import { analysisMetrics } from './analysis.js';
export const STORAGE_PREFIX = 'mq.takeout-taco.run.v1.';
// Local-only, one record per run (as in daily Econ-nections). No identity or network queue.
// Retain the latest 20 runs; storage failure leaves this run usable in memory.
export function createRecorder(storage, onWarning = () => {}, runID = crypto.randomUUID()) {
  const record = { schemaVersion: 3, gameID: GAME_ID, runID, events: [] };
  let warned = false;
  return {
    record,
    log(action, state, previousWorkers = state.previousWorkers) {
      record.events.push({ runID, gameID: GAME_ID, timestamp: new Date().toISOString(), sequenceNumber: record.events.length + 1,
        action, round: state.round, workers: state.workers, previousWorkers, output: state.output, addedOutput: state.addedOutput,
        distinctCrewLevelsTested: state.tested.length, finalCrew: state.finalCrew,
        backlog: state.backlog, ...debriefMetrics(state), ...analysisMetrics(state),
        questionID: action === 'debrief_answer' ? state.answers.at(-1)?.id : action.endsWith('_answer') ? state.phase : null,
        answer: action === 'debrief_answer' ? state.answers.at(-1)?.value : action.endsWith('_answer') ? state.analysisAnswers[state.phase]?.value : null,
        completed: state.phase === 'complete' });
      try {
        if (!storage) throw new Error('Storage unavailable');
        storage.setItem(STORAGE_PREFIX + runID, JSON.stringify(record));
        const keys = [];
        for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (key?.startsWith(STORAGE_PREFIX) && key !== STORAGE_PREFIX + runID) keys.push(key); }
        keys.sort((a, b) => {
          const date = key => { try { return JSON.parse(storage.getItem(key)).events?.at(-1)?.timestamp || ''; } catch { return ''; } };
          return date(b).localeCompare(date(a));
        });
        for (const key of keys.slice(19)) storage.removeItem(key);
      } catch { if (!warned) onWarning('Local run history is unavailable. You can still finish this game in this tab.'); warned = true; }
    },
  };
}
