import scenario from './scenarios/gameday-rivals.js';
import { ACTIONS, roundPayoff, nextShares, classifySeason } from './scenarios/gameday-rivals-market.js';
import { chooseRivalAction, roundRandom } from './scenarios/gameday-rivals-rival.js';
export function newSeed() { return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]; }
export function createSeason({ seed = newSeed(), runID = globalThis.crypto.randomUUID(), startedAt = Date.now() } = {}) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Seed must be an unsigned 32-bit integer');
  return { scenarioID: scenario.id, scenarioVersion: scenario.version, runID, seed, startedAt,
    phase: 'observe', roundIndex: 0, roundKey: scenario.rounds[0].key, demand: scenario.rounds[0].demand, multiplier: scenario.rounds[0].multiplier,
    playerCurrentChoice: null, rivalCurrentChoice: null, playerRoundProfit: 0, rivalRoundProfit: 0, industryRoundProfit: 0,
    playerSeasonProfit: 0, rivalSeasonProfit: 0, industrySeasonProfit: 0, playerShare: 50, rivalShare: 50,
    history: [], classification: null, completed: false };
}
// Build the rival's entire input before the UI accepts a current-round action.
// It contains completed action pairs only, never the current choice or current payoff.
export function commitRival(run, chooser = chooseRivalAction) {
  if (run.phase !== 'observe' || run.completed) throw Error('No open round');
  const previousHistory = Object.freeze(run.history.map(h => Object.freeze({ playerAction: h.playerAction, rivalAction: h.rivalAction })));
  const round = scenario.rounds[run.roundIndex];
  const context = Object.freeze({ roundIndex: run.roundIndex, key: round.key, pressure: round.pressure });
  return Object.freeze({ runID: run.runID, roundIndex: run.roundIndex, action: chooser(previousHistory, context, roundRandom(run.seed,run.roundIndex)) });
}
export function revealRound(run, playerAction, commitment) {
  if (run.phase !== 'observe' || run.completed || !ACTIONS.includes(playerAction)) throw Error('Round is not open or action is invalid');
  const expected = commitRival(run);
  if (!commitment || commitment.runID !== expected.runID || commitment.roundIndex !== expected.roundIndex || commitment.action !== expected.action) throw Error('Invalid pre-round commitment');
  const round = scenario.rounds[run.roundIndex], rivalAction = commitment.action;
  const profit = roundPayoff(playerAction,rivalAction,round.multiplier), shares = nextShares(run.playerShare,playerAction,rivalAction);
  const entry = { roundIndex: run.roundIndex, roundKey: round.key, demand: round.demand, multiplier: round.multiplier,
    playerAction, rivalAction, playerProfit: profit.player, rivalProfit: profit.rival, industryProfit: profit.industry,
    playerShareBefore: run.playerShare, rivalShareBefore: run.rivalShare, playerShare: shares.player, rivalShare: shares.rival,
    playerShareChange: shares.playerChange, rivalShareChange: shares.rivalChange };
  const history = [...run.history,entry], completed = history.length === scenario.rounds.length;
  return { ...run, phase: 'reveal', playerCurrentChoice: playerAction, rivalCurrentChoice: rivalAction,
    playerRoundProfit: profit.player, rivalRoundProfit: profit.rival, industryRoundProfit: profit.industry,
    playerSeasonProfit: run.playerSeasonProfit+profit.player, rivalSeasonProfit: run.rivalSeasonProfit+profit.rival,
    industrySeasonProfit: run.industrySeasonProfit+profit.industry, playerShare: shares.player, rivalShare: shares.rival,
    history, completed, classification: completed ? classifySeason(history) : null };
}
export function nextRound(run) {
  if (run.phase !== 'reveal') throw Error('No revealed round to advance');
  if (run.completed) return { ...run, phase: 'debrief' };
  const roundIndex = run.roundIndex+1, round = scenario.rounds[roundIndex];
  return { ...run, phase: 'observe', roundIndex, roundKey: round.key, demand: round.demand, multiplier: round.multiplier,
    playerCurrentChoice: null, rivalCurrentChoice: null, playerRoundProfit: 0, rivalRoundProfit: 0, industryRoundProfit: 0 };
}
