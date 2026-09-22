export const sceneSize = { width:1448, height:1086 };
export const canonicalReference = './art/scenes/gameday-rivals/canonical-day.webp';
// Presentation only: segments indicate relative activity, never profit or order totals.
export function activityFor(playerAction,rivalAction) {
  if(!playerAction||!rivalAction) return {id:'unrevealed',player:0,rival:0};
  const player=playerAction==='aggressive'?4:2,rival=rivalAction==='aggressive'?4:2;
  return {id:player===rival?(player===4?'both-heavy':'balanced-moderate'):player>rival?'player-heavy':'rival-heavy',player,rival};
}
export function sceneFor(scenario, roundIndex) {
  const round = scenario.rounds[roundIndex];
  if (!round) throw Error('Unknown game-day scene');
  return { ...sceneSize, src:`./art/scenes/gameday-rivals/${round.image}`, night:roundIndex === 5,
    alt:`${round.name} in Alderwick: restaurants, the campus stadium and the same diagonal streets. ${round.demand} underlying game-day demand. ${roundIndex === 5 ? 'The final game takes place under stadium lights at night.' : 'The town is visible before nightfall.'} Background crowds and traffic represent the market opportunity, not either platform’s current promotion.` };
}
