// Shared artwork keeps Linden recognizable across its different market days.
// The pictures provide context, not numerical evidence for a graph answer.
const descriptions={
  market:'Shoppers browse a berry stall between terracotta and cream shopfronts, with tiled roofs, arched windows, and flowering plants.',
  busy:'A crowd of shoppers gathers around the berry stall in Linden’s leafy market square.',
  quiet:'One shopper visits the berry stall in a quiet market square.',
  storm:'Shoppers in raincoats visit a rain-soaked berry stall with mostly empty crates.',
  harvest:'Shoppers browse a berry stall overflowing with extra crates and baskets from an abundant harvest.',
  delivery:'A driver unloads insulated produce boxes from a delivery van while shoppers browse the berry stall.',
  'busy-harvest':'A crowd of shoppers gathers around an abundant harvest of berries, with extra crates beside the stall.',
  'quiet-harvest':'One shopper visits a berry stall surrounded by an abundant harvest and extra produce crates.',
  'busy-storm':'A crowd with umbrellas gathers at the rain-soaked berry stall, where only a few crates hold berries.',
  'quiet-storm':'One shopper visits a rain-soaked berry stall with mostly empty crates.'
};
const byKind={intro:'market',festival:'busy',quiet:'quiet',storm:'storm',orchard:'harvest',truck:'delivery',policy:'market'};
const byScenario={
  'festival-harvest':'busy-harvest','recipe-storage':'busy-harvest',
  'fair-storm':'quiet-storm','festival-storm':'busy-storm',
  'sale-harvest':'quiet-harvest','fair-storage':'quiet-harvest',
  'sale-fuel':'quiet','recipe-fuel':'busy'
};
export function sceneAsset(kind='intro',scenario=null){return byScenario[scenario?.id]||byKind[kind]||'market';}
export function scene(kind='intro',scenario=null){
  const key=sceneAsset(kind,scenario),policy=scenario&&['ceiling','floor'].includes(scenario.type)&&Number.isFinite(scenario.price);
  return `<div class="market-art" data-scene="${key}"><img src="assets/linden-${key}.webp" width="1774" height="887" alt="${descriptions[key]}" decoding="async">${policy?`<div class="policy-notice"><span>${scenario.type==='ceiling'?'Maximum':'Minimum'}</span><strong>$${scenario.price}</strong></div>`:''}</div>`;
}
