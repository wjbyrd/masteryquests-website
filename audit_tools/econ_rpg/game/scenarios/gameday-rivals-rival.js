// Mulberry32: unsigned 32-bit state, one deterministic draw per round.
// No DOM, payoff, current player action or untracked randomness enters this module.
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function roundRandom(seed, roundIndex) {
  const rng = seededRandom(seed);
  for (let i = 0; i < roundIndex; i++) rng();
  return rng;
}
export function aggressionProbability(previousHistory, roundContext) {
  let probability = .22 + roundContext.pressure;
  if (previousHistory.at(-1)?.playerAction === 'aggressive') probability += .22;
  if (previousHistory.slice(-3).filter(h => h.playerAction === 'aggressive').length >= 2) probability += .10;
  if (previousHistory.length >= 2 && previousHistory.slice(-2).every(h => h.playerAction === 'standard')) probability -= .12;
  return Math.max(.10, Math.min(.85, probability));
}
export function chooseRivalAction(previousHistory, roundContext, rng) {
  return rng() < aggressionProbability(previousHistory, roundContext) ? 'aggressive' : 'standard';
}
