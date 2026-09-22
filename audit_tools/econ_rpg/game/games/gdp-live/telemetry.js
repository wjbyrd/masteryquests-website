import { CONFIG } from './config.js';
import { gdp, currentScenario } from './engine.js';
export const STORAGE_PREFIX = 'mq.gdp-live.run.v1.';
export function createRecorder(storage, warn = () => {}, runID = crypto.randomUUID(), now = () => Date.now()) {
  const started = now(), record = { schemaVersion: 1, gameID: CONFIG.gameID, runID, events: [] };
  let warned = false;
  return { record, log(action, before, after = before, extra = {}) {
    const event = { sequenceNumber: record.events.length + 1, runID, gameID: CONFIG.gameID, timestamp: new Date(now()).toISOString(),
      elapsedMs: Math.max(0, now() - started), action, phase: after.stage, scenarioID: ['posting', 'posted'].includes(before.stage) ? currentScenario(before).id : null,
      selectedAccounts: [...before.selection], gdpBefore: gdp(before.accounts), gdpAfter: gdp(after.accounts), gdpDelta: gdp(after.accounts) - gdp(before.accounts),
      componentChanges: Object.fromEntries(Object.keys(before.accounts).map(k => [k, after.accounts[k] - before.accounts[k]])),
      auditCaseID: after.auditID, completed: after.stage === 'complete', ...extra };
    record.events.push(event);
    try {
      if (!storage) throw new Error('No storage');
      storage.setItem(STORAGE_PREFIX + runID, JSON.stringify(record));
      const keys = [];
      for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (key?.startsWith(STORAGE_PREFIX) && key !== STORAGE_PREFIX + runID) keys.push(key); }
      const date = key => { try { return JSON.parse(storage.getItem(key)).events?.at(-1)?.timestamp || ''; } catch { return ''; } };
      keys.sort((a, b) => date(b).localeCompare(date(a)));
      keys.slice(19).forEach(key => storage.removeItem(key));
    } catch { if (!warned) warn('Local run history is unavailable. You can still complete this game in this tab.'); warned = true; }
  } };
}
