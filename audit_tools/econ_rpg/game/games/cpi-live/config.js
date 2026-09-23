const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
// Authored base baskets: once selected, quantities stay fixed throughout the run.
const categories = ['rent','groceries','gas','streaming','haircuts'];
const names = ['Rent','Groceries','Gas','Streaming','Haircuts'];
const base = (id, quantities, prices) => ({ id, items: categories.map((id,i)=>({id,name:names[i],quantity:quantities[i],price:prices[i]})) });
export const CONFIG = freeze({
  title: 'CPI LIVE', gameID: 'cpi-live', route: '/games/cpi-live/',
  description: 'Reprice a fixed household basket, build the CPI, calculate inflation, audit bad calculations, and learn why some price changes matter more than others.',
  modelNote: 'Simulated household market basket · simplified fixed-basket CPI model',
  decimals: { currency: 2, index: 1, rate: 1 },
  tolerance: { currency: .005, index: .05, rate: .05 },
  animationMs: 450, retainedRuns: 20,
  baskets: [
    base('original', [1,10,40,2,2], [100000,2000,300,1500,2500]),
    base('compact', [1,8,30,1,2], [90000,2500,400,2000,3000]),
    base('commuter', [1,12,40,2,2], [110000,2500,400,1500,3000]),
    base('city', [1,10,30,2,2], [120000,2500,400,2000,3500]),
    base('shared', [1,12,30,2,2], [100000,2500,400,2000,3000]),
  ],
  shocks: [
    { id: 'housing-pressure', name: 'Rent and other prices increase', changes: [4,5,5,10,0] },
    { id: 'fuel-pressure', name: 'Gas prices increase', changes: [1,0,25,0,0] },
    { id: 'food-pressure', name: 'Grocery prices increase', changes: [0,15,0,10,5] },
    { id: 'mixed-prices', name: 'Prices change across the basket', changes: [6,5,-10,-10,4] },
    { id: 'service-pressure', name: 'Service prices increase', changes: [0,5,0,40,20] },
  ],
  comparisons: [
    { id: 'streaming-rent', cases: [{ item: 'streaming', percent: 40 }, { item: 'rent', percent: 5 }] },
    { id: 'groceries-haircuts', cases: [{ item: 'groceries', percent: 10 }, { item: 'haircuts', percent: 30 }] },
    { id: 'streaming-gas', cases: [{ item: 'streaming', percent: 40 }, { item: 'gas', percent: 15 }] },
    { id: 'rent-gas', cases: [{ item: 'rent', percent: 4 }, { item: 'gas', percent: 25 }] },
  ],
  audits: [
    { id: 'quantities', label: 'The analyst changed the fixed basket quantities.', feedback: 'Keep the base quantities. Otherwise the comparison mixes buying a different amount with paying different prices.', wrong: 'Check which quantities the analyst used. The prices and arithmetic are consistent; the basket itself changed.' },
    { id: 'average', label: 'The analyst gave each percentage price change equal weight.', feedback: 'Reprice the fixed basket. A simple average treats a small streaming bill as equally important as rent, despite their different base expenditures.', wrong: 'Look at the equal weighting in the average. This calculation ignores how much of the basket is spent on each item.' },
    { id: 'reverse', label: 'The CPI numerator and denominator are reversed.', feedback: 'Divide current cost by base cost, then multiply by 100. Reversing that ratio would make rising basket costs look like a falling index.', wrong: 'The fixed quantities and costs are correct. Check which cost belongs on top of the CPI ratio.' },
    { id: 'level', label: 'The analyst called an index level an inflation rate.', feedback: 'An index level is not a percentage change. Inflation needs both a current and a previous CPI.', wrong: 'The reported number is a CPI level. A rate of inflation must compare two periods.' },
    { id: 'period', label: 'The analyst used the base year instead of the previous year.', feedback: 'For annual inflation, compare this year with the immediately preceding year. The change since the base year measures a different period.', wrong: 'The CPI values are valid. Check which two years the requested annual inflation rate compares.' },
  ],
  timelines: [
    { id: 'slower-rise', values: [100, 108, 112, 109] },
    { id: 'faster-rise', values: [100, 104, 112, 110] },
    { id: 'stable-prices', values: [100, 106, 106, 103] },
    { id: 'falling-prices', values: [100, 110, 108, 105] },
    { id: 'high-level-slow-rise', values: [100, 120, 122, 118] },
  ],
  auditExample: [100, 108, 112],
  disinflationExample: [100, 108, 112],
});
