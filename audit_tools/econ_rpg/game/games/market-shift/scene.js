// Shared artwork keeps Linden recognizable across its different market days.
// The pictures provide context, not numerical evidence for a graph answer.
const descriptions={
  market:'Shoppers browse a covered berry pavilion beneath a clock tower, among brick and stone shops, a leafy linden tree, and a fountain.',
  busy:'A crowd of customers gathers around the vendor in Linden’s covered berry pavilion.',
  quiet:'A single customer visits the berry vendor in a quiet market square.',
  storm:'Customers with umbrellas visit a rain-soaked berry pavilion with mostly empty crates.',
  harvest:'Customers browse the berry pavilion overflowing with extra crates and baskets from an abundant harvest.',
  delivery:'A delivery worker unloads insulated produce boxes from a van in the side lane while customers browse the berry pavilion.',
  'busy-harvest':'A crowd of customers gathers around the berry vendor, with abundant stock and extra crates beside the pavilion.',
  'quiet-harvest':'A single customer visits the berry vendor, surrounded by abundant stock and extra produce crates.',
  'busy-storm':'A crowd in raincoats and carrying umbrellas gathers at the berry pavilion, where only a few crates hold berries.',
  'quiet-storm':'A single customer with an umbrella visits the berry vendor, whose pavilion has mostly empty crates.'
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
