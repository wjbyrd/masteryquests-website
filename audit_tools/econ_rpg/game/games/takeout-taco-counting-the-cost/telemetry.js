import { GAME_ID } from './config.js';
export const STORAGE_PREFIX = 'mq.takeout-taco-cost.run.v1.';
// Same local-only convention as Lunch Rush: anonymous IDs, 20 retained runs,
// no network queue, no names, and an in-memory fallback on storage failure.
export function createRecorder(storage, onWarning = () => {}, runID = crypto.randomUUID()) {
  const record = { schemaVersion: 1, gameID: GAME_ID, runID, events: [] };
  let warned = false;
  return { record, log(action, data = {}) {
    record.events.push({ ...data, action, runID, gameID: GAME_ID, sequenceNumber: record.events.length + 1, timestamp: new Date().toISOString() });
    try {
      if (!storage) throw new Error('Storage unavailable');
      storage.setItem(STORAGE_PREFIX + runID, JSON.stringify(record));
      const keys = [];
      for (let i = 0; i < storage.length; i++) { const key = storage.key(i); if (key?.startsWith(STORAGE_PREFIX) && key !== STORAGE_PREFIX + runID) keys.push(key); }
      const date = key => { try { return JSON.parse(storage.getItem(key)).events?.at(-1)?.timestamp || ''; } catch { return ''; } };
      keys.sort((a, b) => date(b).localeCompare(date(a)));
      keys.slice(19).forEach(key => storage.removeItem(key));
    } catch { if (!warned) onWarning('Local run history is unavailable. You can still play, review, and replay in this tab.'); warned = true; }
  } };
}
