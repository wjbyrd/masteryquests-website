export const ACTIONS = Object.freeze(['standard', 'aggressive']);
// Dollars. The same four cells apply every round, before the common demand multiplier.
export const BASE_PAYOFFS = Object.freeze({
  'standard/standard': Object.freeze([100000,100000]),
  'aggressive/standard': Object.freeze([155000,45000]),
  'standard/aggressive': Object.freeze([45000,155000]),
  'aggressive/aggressive': Object.freeze([70000,70000])
});
export function roundPayoff(playerAction, rivalAction, multiplier) {
  if (!ACTIONS.includes(playerAction) || !ACTIONS.includes(rivalAction) || !Number.isFinite(multiplier) || multiplier <= 0) throw Error('Invalid payoff inputs');
  const [playerBase,rivalBase] = BASE_PAYOFFS[`${playerAction}/${rivalAction}`];
  // Integer hundredths avoid floating-point rounding drift. Every configured payoff is a whole dollar.
  const scale = Math.round(multiplier * 100);
  const player = Math.round(playerBase * scale / 100), rival = Math.round(rivalBase * scale / 100);
  return { player, rival, industry: player + rival };
}
// Percentage of this game's orders, independent of profit.
export const ROUND_ORDER_SHARES = Object.freeze({
  'standard/standard': Object.freeze([50,50]),
  'aggressive/standard': Object.freeze([62,38]),
  'standard/aggressive': Object.freeze([38,62]),
  'aggressive/aggressive': Object.freeze([50,50])
});
export function roundOrderShare(playerAction,rivalAction) {
  const split=ROUND_ORDER_SHARES[`${playerAction}/${rivalAction}`];
  if(!split) throw Error('Invalid order-share actions');
  return {player:split[0],rival:split[1]};
}
export function seasonOrderShares(history) {
  let playerWeightedOrders=0,rivalWeightedOrders=0;
  for(const h of history) {
    if(!Number.isFinite(h.multiplier)||h.multiplier<=0) throw Error('Invalid market weight');
    const split=roundOrderShare(h.playerAction,h.rivalAction);
    // Integer hundredths of market weight keep all configured weighted units exact.
    const weight=Math.round(h.multiplier*100);
    playerWeightedOrders+=split.player*weight;
    rivalWeightedOrders+=split.rival*weight;
  }
  const totalWeightedOrders=playerWeightedOrders+rivalWeightedOrders;
  const player=totalWeightedOrders?100*playerWeightedOrders/totalWeightedOrders:50;
  return {player,rival:100-player,playerWeightedOrders:playerWeightedOrders/100,
    rivalWeightedOrders:rivalWeightedOrders/100,totalWeightedOrders:totalWeightedOrders/100};
}
export function seasonStats(history) {
  const count = predicate => history.filter(predicate).length;
  const playerAggressive = count(h => h.playerAction === 'aggressive'), rivalAggressive = count(h => h.rivalAction === 'aggressive');
  const mutualStandard = count(h => h.playerAction === 'standard' && h.rivalAction === 'standard');
  const mutualAggressive = count(h => h.playerAction === 'aggressive' && h.rivalAction === 'aggressive');
  const playerExploits = count(h => h.playerAction === 'aggressive' && h.rivalAction === 'standard');
  const rivalExploits = count(h => h.playerAction === 'standard' && h.rivalAction === 'aggressive');
  const retaliationTransitions = history.slice(1).filter((h,i) => (h.playerAction === 'aggressive' && history[i].rivalAction === 'aggressive') || (h.rivalAction === 'aggressive' && history[i].playerAction === 'aggressive')).length;
  return { playerStandard: history.length-playerAggressive, playerAggressive, rivalStandard: history.length-rivalAggressive, rivalAggressive, mutualStandard, mutualAggressive, playerExploits, rivalExploits, asymmetric: playerExploits+rivalExploits, retaliationTransitions };
}
export const CLASSIFICATIONS = Object.freeze([
  { id: 'promotion-war', title: 'Promotion War', summary: 'Repeated subsidies made the market busy while cutting margins for both platforms.' },
  { id: 'retaliation-cycle', title: 'Retaliation Cycle', summary: 'Aggression often followed an opponent’s earlier aggressive move. The pattern is consistent with retaliation, though observed choices cannot prove motives.' },
  { id: 'opportunistic-season', title: 'Opportunistic Season', summary: 'One platform repeatedly captured orders while the other kept its normal offers. Individual gains and the distribution of profit pulled apart.' },
  { id: 'stable-competition', title: 'Stable Competition', summary: 'Both platforms usually kept normal offers. Margins held up without any communication or agreement between them.' },
  { id: 'market-share-chase', title: 'Market-Share Chase', summary: 'One platform repeatedly pushed discounts to contest orders. The share ledger tells a different story from the profit ledger.' },
  { id: 'uneasy-restraint', title: 'Uneasy Restraint', summary: 'Normal offers and aggressive discounts alternated without one pattern dominating the season.' }
]);
export function classifySeason(history) {
  const s = seasonStats(history);
  if (s.mutualAggressive >= 3 || s.playerAggressive+s.rivalAggressive >= 9) return 'promotion-war';
  if (s.retaliationTransitions >= 3) return 'retaliation-cycle';
  if (s.asymmetric >= 3 && Math.max(s.playerExploits,s.rivalExploits) > s.asymmetric/2) return 'opportunistic-season';
  if (s.mutualStandard >= 4 && s.mutualAggressive <= 1) return 'stable-competition';
  if (Math.max(s.playerAggressive,s.rivalAggressive) >= 4) return 'market-share-chase';
  return 'uneasy-restraint';
}
export const mutualStandardCounterfactual = rounds => rounds.reduce((sum,r) => sum + roundPayoff('standard','standard',r.multiplier).industry,0);
export const outcomeText = (player, rival) => ({
  'standard/standard': 'Both platforms kept normal offers. Each served its established customers without a major subsidy, preserving margins and splitting this game’s orders equally.',
  'aggressive/standard': 'Your discount pulled orders away from the rival. Added volume outweighed the lower margin per subsidized order, raising your profit and giving you the larger share of this game’s orders.',
  'standard/aggressive': 'The rival’s discount pulled away orders while you protected the margin on each sale. Lost volume reduced your profit and gave the rival the larger share of this game’s orders.',
  'aggressive/aggressive': 'Both platforms pushed large discounts. Subsidized delivery activity was heavy, but this game’s orders were split equally. Paying for those offers cut profit for both.'
})[`${player}/${rival}`];
