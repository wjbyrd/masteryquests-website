import { createSeason, commitRival, revealRound, nextRound } from './gameday-rivals-engine.js';
export const SAVE_KEY = 'gamedayRivalsSave_v1';
export function saveSeason(storage, run) {
  if (run.phase !== 'reveal' || !run.history.length) return false;
  try { storage.setItem(SAVE_KEY,JSON.stringify(run)); return true; } catch { return false; }
}
export function clearSeason(storage) { try { storage.removeItem(SAVE_KEY); return true; } catch { return false; } }
// Legacy share caches are discarded, never combined with the weighted model.
// Every other saved field (including rival actions and profits) must still replay exactly.
function withoutShares(run) {
  const {marketShareVersion,playerShare,rivalShare,history,...rest}=run;
  return {...rest,history:history.map(entry=>{
    const {playerShareBefore,rivalShareBefore,playerShare,rivalShare,playerShareChange,rivalShareChange,
      playerRoundOrderShare,rivalRoundOrderShare,...round}=entry;
    return round;
  })};
}
export function loadSeason(storage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return {run:null,reason:null};
    const saved = JSON.parse(raw);
    if (saved.scenarioID !== 'gameday-rivals' || saved.scenarioVersion !== 1) return {run:null,reason:'version'};
    if (!Array.isArray(saved.history) || !saved.history.length || saved.history.length > 6 || typeof saved.runID !== 'string' || !saved.runID || !Number.isFinite(saved.startedAt)) throw Error('Malformed season');
    let replay = createSeason({seed:saved.seed,runID:saved.runID,startedAt:saved.startedAt});
    for (const [index,entry] of saved.history.entries()) {
      if (index) replay = nextRound(replay);
      replay = revealRound(replay,entry.playerAction,commitRival(replay));
    }
    if(saved.marketShareVersion===undefined) {
      if(JSON.stringify(withoutShares(saved))!==JSON.stringify(withoutShares(replay))) throw Error('Legacy season does not match replay');
    } else if(saved.marketShareVersion!==2 || JSON.stringify(saved)!==JSON.stringify(replay)) throw Error('Season does not match replay');
    // Completed reveals are durable. Resume advances once, without adding another payoff.
    return {run:nextRound(replay),reason:null};
  } catch { return {run:null,reason:'unavailable'}; }
}
