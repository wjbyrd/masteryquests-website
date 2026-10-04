import {GAME_CONFIG as G} from './config.js';
import {createRun} from './session.js';

// Assignment changes the opening, not the two-city simulation or rival decision rules.
export function createAssignedRun({random = Math.random, previousDoctrine = null} = {}) {
  const index = Math.min(G.cities.length - 1, Math.max(0, Math.floor(random() * G.cities.length)));
  return createRun(G.cities[index].id, {random, previousDoctrine});
}
export const rivalRevealed = run => !!run && run.currentCycle >= G.rivalRevealRound;
export const visibleCities = run => !run ? [] : run.cities.filter(city => rivalRevealed(run) || city.id === run.playerCity);

// Compare proportional improvement, never raw output or city size. Use the same
// one-decimal precision as the score display so equal displayed scores are a draw.
export function raceResult(run) {
  const scores = run.cities.map(city => {
    const initial = run.initialCities.find(start => start.id === city.id);
    const growth = (city.outputPerWorker / initial.outputPerWorker - 1) * 100;
    return {id: city.id, name: city.name, growth, score: Math.round(growth * 10) / 10 || 0};
  });
  const player = scores.find(city => city.id === run.playerCity);
  const rival = scores.find(city => city.id === run.rivalCity);
  const outcome = player.score === rival.score ? 'draw' : player.score > rival.score ? 'win' : 'loss';
  return {scores, player, rival, outcome,
    headline: {win: 'You grew faster.', loss: 'The rival city outpaced you.', draw: 'A photo finish. The race is tied.'}[outcome]};
}
