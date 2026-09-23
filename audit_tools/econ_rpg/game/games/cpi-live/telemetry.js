import { CONFIG } from './config.js';
import { BASE, model, isRepriced } from './engine.js';
export const STORAGE_PREFIX = 'mq.cpi-live.run.v1.';
// Same local-only retention convention as GDP Live; no identity, requests or backend.
export function createRecorder(storage, runID, warn = () => {}, now = () => Date.now()) {
  const started = now(), record = { schemaVersion: 1, gameID: CONFIG.gameID, runID, events: [] };
  let warned = false;
  return { record, log(action, before, after = before, extra = {}) {
    const a = model(before), b = model(after);
    record.events.push({ action, runID, gameID: CONFIG.gameID, sequenceNumber: record.events.length + 1,
      timestamp: new Date(now()).toISOString(), elapsedMs: Math.max(0, now() - started), phase: before.phase,
      scenarioID: after.shockID, comparisonID: after.comparisonID, auditCaseID: after.auditID, timelineID: after.timelineID,
      basketCostBefore: (isRepriced(before) ? a.current.cost : BASE.cost) / 100,
      basketCostAfter: (isRepriced(after) ? b.current.cost : BASE.cost) / 100,
      cpiBefore: isRepriced(before) ? a.index : 100, cpiAfter: isRepriced(after) ? b.index : 100,
      inflationRate: b.rate, completed: after.phase === 'complete', ...extra });
    try {
      if (!storage) throw Error('No storage');
      storage.setItem(STORAGE_PREFIX + runID, JSON.stringify(record));
      const keys = [];
      for (let i=0;i<storage.length;i++) { const key=storage.key(i); if(key?.startsWith(STORAGE_PREFIX)&&key!==STORAGE_PREFIX+runID)keys.push(key); }
      const date = key => { try { return JSON.parse(storage.getItem(key)).events?.at(-1)?.timestamp || ''; } catch { return ''; } };
      keys.sort((a,b)=>date(b).localeCompare(date(a))).slice(CONFIG.retainedRuns-1).forEach(key=>storage.removeItem(key));
    } catch { if(!warned)warn('Local run history is unavailable. You can still finish this game in this tab.'); warned=true; }
  } };
}
