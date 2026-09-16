import { createPuzzle, restoreRecord } from './engine.js';

export const STORAGE_PREFIX = 'mq.econnections.result.';
// A key per puzzle avoids overwriting another domain or day's history.
export function createStore(storage, onWarning = () => {}) {
  const memory = new Map();
  const pending = new Set();
  let warned = false;
  const warn = () => { if (!warned) onWarning('Local saving is unavailable or a saved record could not be read. Keep this tab open; new progress may not survive a reload.'); warned = true; };
  function read(key) {
    if (pending.has(key)) return memory.get(key);
    try { return storage?.getItem(key) ?? memory.get(key) ?? null; }
    catch { warn(); return memory.get(key) ?? null; }
  }
  function decode(raw) {
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const restored = restoreRecord(createPuzzle(data.domain, data.date, data.poolVersion), data);
      if (!restored) warn();
      return restored;
    } catch { warn(); return null; }
  }
  return {
    get(puzzle) { return decode(read(STORAGE_PREFIX + puzzle.puzzleId)); },
    save(record) {
      const key = STORAGE_PREFIX + record.puzzleId, raw = JSON.stringify(record);
      memory.set(key, raw);
      try { if (!storage) throw new Error('Storage unavailable'); storage.setItem(key, raw); pending.delete(key); }
      catch { pending.add(key); warn(); }
    },
    all() {
      const keys = new Set(memory.keys());
      try { for (let i = 0; i < (storage?.length || 0); i++) { const key = storage.key(i); if (key?.startsWith(STORAGE_PREFIX)) keys.add(key); } }
      catch { warn(); }
      return [...keys].map(key => decode(read(key))).filter(Boolean);
    },
  };
}
