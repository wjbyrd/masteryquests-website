// Authored evidence. The explanation of the event lives only in the ending UI.
export const ROOMS = {
  hall: { name: 'The Central Hall', subtitle: 'Five empty positions. One locked door.', objects: [
    ['residence','The Residence',12,52,'room'], ['workshop','The Workshop',30,52,'room'],
    ['exit','The exit mechanism',50,60,'puzzle'], ['archive','The Archive',70,52,'room'], ['policy','The utility cabinet',88,52,'room']
  ]},
  residence: { name: 'The Residence', subtitle: 'Someone left the household books unfinished.', objects: [
    ['pay','Pay envelopes',18,47,'document'], ['food','Grocery receipts',43,67,'document'],
    ['bills','Bills on the mantel',69,40,'document'], ['notebook','Budget notebook',76,70,'document'], ['budget','Desk drawer',22,76,'puzzle']
  ]},
  workshop: { name: 'The Workshop', subtitle: 'The machines are quiet. The paperwork is not.', objects: [
    ['invoices','Supplier invoices',19,43,'document'], ['production','Production log',77,39,'document'],
    ['cost','Invoice cabinet',25,74,'puzzle'], ['orders','Work-order press',60,69,'puzzle'], ['stock','Input store',88,76,'document']
  ]},
  archive: { name: 'The Archive', subtitle: 'Separate records. An unfinished picture.', objects: [
    ['national','Matched bulletins',18,62,'document'], ['indicators','Record clasp',50,37,'puzzle'],
    ['radio','Wooden radio',79,70,'puzzle'], ['index','Broadcast index',84,37,'document']
  ]},
  policy: { name: 'The utility cabinet', subtitle: 'Two objectives share a single control.', objects: [
    ['mandate','Two instructions',19,48,'document'], ['policy','The policy machine',52,62,'puzzle'], ['memo','Operator’s notebook',83,65,'document']
  ]}
};
export const ROOM_ORDER = Object.keys(ROOMS);
export const DOCUMENTS = {
  pay: { title:'Two pay envelopes', eyebrow:'RESIDENCE / INCOME', text:'Same household. Same monthly hours. A wage adjustment took effect in April.', rows:[['March take-home pay','$3,000'],['April take-home pay','$3,200']], note:'“A little more in the envelope this month.”' },
  food: { title:'The same grocery basket', eyebrow:'RESIDENCE / RECEIPTS', text:'The quantities and goods on these monthly receipts match. Nothing extra was bought.', rows:[['March groceries','$600'],['April groceries','$800']], note:'The new receipt is clipped over the old one.' },
  bills: { title:'Household fittings', eyebrow:'RESIDENCE / ESSENTIALS', text:'The household used the same amount of energy in both months. The landlord also sent a rent adjustment.', rows:[['March rent','$1,400'],['April rent','$1,500'],['March utilities','$200'],['April utilities','$500']], note:'“No change in our rooms. No change in how much we used.”' },
  notebook: { title:'The envelope method', eyebrow:'RESIDENCE / NOTEBOOK', text:'“Set aside the rent, groceries, and utilities. What remains must cover everything else. The drawer latch compares both months.”', rows:[['March','Pay − essentials = remainder'],['April','Pay − essentials = remainder']], note:'A small sketch shows two rows of brass sliders. Place the recovered amounts into the notebook.' },
  invoices: { title:'Three supplier invoices', eyebrow:'WORKSHOP / COST RECORDS', text:'Every batch uses the same recipe: one measure of energy/input plus $9 of other variable costs per unit.', rows:[['March 12 · regular delivery','Input $9 + other $9 = $18 / unit'],['March 16 · emergency delivery','Input $18 + other $9 = $27 / unit'],['March 21 · emergency delivery','Input $18 + other $9 = $27 / unit']], note:'Stapled note: “The regular input delivery did not arrive on March 14. Emergency stock costs more.”' },
  production: { title:'A production log', eyebrow:'WORKSHOP / DISPATCH', text:'Orders from customers stayed available through the month. The daily plan changed only after the replacement input arrived.', rows:[['March 12','1,200 units · regular delivery'],['March 16','1,200 units · already committed'],['March 21','900 units · revised plan']], note:'The invoice cabinet has a rail for each production period. It needs an employee badge.' },
  stock: { title:'The last six measures', eyebrow:'WORKSHOP / INPUT STORE', text:'Six measures of expensive input remain. Each pending job uses two measures. Unused material can be stored; there is no rule that all six must be spent.', rows:[['Input cost per measure','$18'],['Other added cost per job','$18'],['Already-paid machine lease','$200 · paid, unrecoverable']], note:'“Only count the revenue and costs that change if we accept a job. Do not spend scarce material on a loss.”' },
  national: { title:'The matched bulletins', eyebrow:'ARCHIVE / MATCHED PERIODS', text:'These countrywide series compare the period before the interruption with the period after it. The household and workshop records explain what is behind the numbers.', rows:[['Real output index','200 → 184'],['Unemployment rate','5% → 8%'],['Price index','100 → 108'],['Inflation over matching monthly intervals','2% previously → 8% now']], note:'Output is measured at constant prices. Unemployment counts people seeking work. One household alone cannot establish a national price trend.' },
  index: { title:'The broadcast index', eyebrow:'ARCHIVE / RADIO TUNING GUIDE', text:'The radio has retained three dated transmissions for each station. Record the matching dispatches in chronological order.', rows:[['Station frequency','10 × the latest unit production cost'],['First dispatch date','On the employee’s interruption notice'],['Next two dates','The emergency supplier invoices']], note:'The record clasp supplies power to the radio. Each transmission has a written transcript; sound is optional.' },
  mandate: { title:'Two instructions', eyebrow:'UTILITY CABINET / MANDATE', text:'Two seals are missing from the central clasp. One reads “Protect living costs.” The other reads “Protect work and output.”', rows:[['Instruction A','Relieve inflation pressure'],['Instruction B','Support output and employment']], note:'Neither instruction cancels the other. Try the control in both directions before sealing the record.' },
  memo: { title:'The operator’s notebook', eyebrow:'UTILITY CABINET / NOTES', text:'“This lever changes economy-wide spending. It does not repair the damaged input network. Watch both gauges when you move it.”', rows:[['Gauge scale','Illustrative pressure / condition indices'],['At the center','Inflation pressure 7 · output/employment 3']], note:'“I could relieve one pressure. I could not make the other disappear.”' }
};
export const EVIDENCE = {
  household: { title:'The household ledger', short:'Household ledger', mark:'▤', text:'Pay rose from $3,000 to $3,200. The same essential bundle rose from $2,200 to $2,800. Only $400 remained in April, compared with $800 in March. More dollars came in, but they bought less.', source:'Residence · budget drawer' },
  date: { title:'The interruption notice', short:'March 14 notice', mark:'14', text:'Employee 047. Notice issued March 14: “Regular input delivery interrupted today. Keep this notice for any later shift revision.” The reverse bears an Archive radio symbol.', source:'Inside the household drawer' },
  costs: { title:'The emergency invoice', short:'Emergency invoice', mark:'▥', text:'March 12: unit cost $18, production 1,200. March 16: unit cost $27, production still 1,200. March 21: cost $27, production 900. Input costs rose before production fell. Latest unit cost: $27.', source:'Workshop · invoice cabinet' },
  staffing: { title:'The revised shift sheet', short:'Revised shift sheet', mark:'⚙', text:'Jobs A and C remained worth completing; job B would cost $54 to earn $48. Two measures were stored. The revised monthly production plan fell from 1,200 to 900 units. Required staffing fell from 120 to 90 workers; 30 workers entered job search.', source:'Workshop · work-order press' },
  indicators: { title:'The national indicator plate', short:'Indicator plate', mark:'↘', text:'Real output 200 → 184. Unemployment 5% → 8%. Price index 100 → 108; monthly inflation rose from 2% to 8%. The household and workshop evidence fits this countrywide pattern.', source:'Archive · record clasp' },
  broadcast: { title:'Three broadcast clippings', short:'Broadcast clippings', mark:'◉', text:'March 14: a major energy-input terminal closes after storm damage. March 16: emergency routes double delivered input prices. March 21: manufacturers reduce production and shifts despite unfilled customer orders. The interruption came first.', source:'Archive · 270 kHz radio' },
  tradeoff: { title:'The two-seal policy record', short:'Two-seal record', mark:'⇄', text:'Tighter demand policy relieved inflation pressure but deepened weak output and employment. Looser policy supported work and output but added inflation pressure. Neither repaired the input disruption. Both objectives belong in the record.', source:'utility cabinet · policy machine' }
};
// Save IDs identify supporting evidence; the exit puzzle orders the events it establishes.
export const FINAL_EVENTS = {
  broadcast:{title:'Storm disrupts input deliveries',source:'Evidence: March 14 radio report and interruption notice'},
  costs:{title:'Replacement inputs raise production costs',source:'Evidence: emergency supplier invoices'},
  staffing:{title:'Firms cut production and shifts',source:'Evidence: revised shift sheet and March 21 radio report'},
  indicators:{title:'National output falls; unemployment and prices rise',source:'Evidence: national indicator records'},
  tradeoff:{title:'Policy faces an inflation–employment tradeoff',source:'Evidence: policy trials and two-seal record'}
};
export const ITEMS = {
  badge: { title:'Employee badge 047', text:'Recovered from the household drawer. Fits the employee slot on the Workshop invoice cabinet.' },
  access: { title:'Utility cabinet key', text:'Recovered from the radio compartment. Opens the shuttered utility cabinet.' }
};
export const INVOICES = [
  {id:'late',name:'March 21',detail:'Emergency input · $27 / unit',stamp:'REPLACEMENT'},
  {id:'early',name:'March 12',detail:'Regular input · $18 / unit',stamp:'REGULAR'},
  {id:'middle',name:'March 16',detail:'Emergency input · $27 / unit',stamp:'REPLACEMENT'}
];
export const JOBS = [
  {id:'A',name:'A · Pump housings',revenue:80,cost:54},
  {id:'B',name:'B · Display frames',revenue:48,cost:54},
  {id:'C',name:'C · Repair couplings',revenue:72,cost:54}
];
export const DATES = ['March 10','March 12','March 14','March 16','March 21','March 28'];
export const BROADCASTS = {
  'March 14':'NORTH TERMINAL / A storm has disabled the country’s main energy-input terminal. Deliveries are interrupted across the manufacturing network. Emergency routes are being arranged.',
  'March 16':'FREIGHT DESK / Emergency routes are operating at higher cost. Delivered input prices have doubled. Manufacturers report rising production costs; earlier orders are still being completed.',
  'March 21':'INDUSTRY WIRE / Manufacturers are cutting production and shifts as replacement inputs remain expensive. Customer orders remain unfilled. More displaced workers are seeking jobs.'
};
// Optional future audio file per transmission; transcripts are always rendered.
export const BROADCAST_AUDIO = { 'March 14':null, 'March 16':null, 'March 21':null };
export const PUZZLES = ['budget','cost','orders','indicators','radio','policy','exit'];
export const HINTS = {
  budget:['Look at the two pay envelopes, the grocery receipts, and the bills. The notebook describes the drawer.', 'Place the recovered slips on the matching notebook pages. Compare what remains after essentials.', 'March: pay 3000, rent 1400, groceries 600, utilities 200. April: pay 3200, rent 1500, groceries 800, utilities 500. Then release the drawer.'],
  cost:['The cabinet has an employee slot. A worker’s things may be in the Residence.', 'Read the production log and supplier invoices. Line the invoices up with the three dated production rails.', 'Use the badge from the household drawer. Order the invoices March 12, March 16, March 21, then seal the cost record.'],
  orders:['Inspect the input store. Some money was spent before these orders arrived.', 'For each job, compare the extra revenue with the extra $54 cost. You may leave material unused.', 'Activate jobs A and C only. B earns $48 but costs $54. Release that production plan.'],
  indicators:['The register has a brass clasp as well as readable pages.', 'Click the brass clasp on the right edge of the register to find three record slots and direction dials.', 'Close the hint. If viewing the pages, step back to the book. Click its brass clasp, then click each of the three record slots to insert the household ledger, invoice, and shift sheet. Set real output DOWN, unemployment UP, and prices UP. Engage the clasp.'],
  radio:['Use the wooden radio to the right of the television. Its tuning instructions and the employee notice identify the station and dates.', 'On the wooden radio, set the frequency to ten times the latest unit cost. The employee notice and later invoices identify three dates.', 'Click the left brass knob on the wooden radio to open its controls. Tune to 270 kHz. Record March 14, then March 16, then March 21. Click Compile dispatches.'],
  policy:['Move the lever to both sides. Watch what happens to both gauges.', 'Relieving inflation pressure costs output/employment support; supporting work adds inflation pressure.', 'Test tighter and looser settings. Place both objective seals into the clasp and acknowledge the tradeoff.'],
  exit:['Arrange the economic events from the initial disruption to its consequences. Each tile names an event and the evidence supporting it.', 'The radio reports describe events that have already happened. Start with the storm disrupting input deliveries, then follow the effects on production costs, firms, the wider economy, and policy.', 'Arrange: storm disrupts input deliveries → production costs rise → firms cut production and shifts → national output falls while unemployment and prices rise → policy faces an inflation–employment tradeoff. Turn the exit mechanism.']
};
