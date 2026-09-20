import { createRun, decide, advance } from './engine.js';
export const storageKey = scenario => `mq.econ-rpg.${scenario.id}`;
export function saveRun(storage, scenario, run) {
  try { storage.setItem(storageKey(scenario), JSON.stringify(run)); return true; } catch { return false; }
}
export function clearRun(storage, scenario) {
  try { storage.removeItem(storageKey(scenario)); return true; } catch { return false; }
}
export function loadRun(storage, scenario) {
  try {
    const raw = storage.getItem(storageKey(scenario));
    if (!raw) return { run: null, reason: null };
    const saved = JSON.parse(raw);
    if (saved.scenarioID !== scenario.id || saved.scenarioVersion !== scenario.version) return { run: null, reason: 'version' };
    if (typeof saved.runID !== 'string' || !saved.runID || !Number.isFinite(saved.startedAt) ||
      !Array.isArray(saved.history) || saved.history.length > scenario.nodes.length) throw Error('Malformed save');
    // Recompute from legal decisions; never trust stored state, routing or rendered text.
    let run = createRun(scenario, saved);
    for (let i = 0; i < saved.history.length; i++) {
      const entry = saved.history[i];
      if (entry.nodeID !== run.nodeID) throw Error('Invalid saved path');
      run = decide(scenario, run, entry.choiceID);
      if (i < saved.history.length - 1 || saved.phase !== 'consequence') run = advance(scenario, run);
    }
    if (JSON.stringify(run) !== JSON.stringify(saved)) throw Error('Save differs from replay');
    return { run, reason: null };
  } catch { return { run: null, reason: 'unavailable' }; }
}
