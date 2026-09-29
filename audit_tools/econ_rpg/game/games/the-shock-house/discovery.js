// Search progress uses the existing inspectedObjects list, so v1 saves remain valid.
import { HINTS } from './content.js';
import {hasNationalEvidence,householdSources} from './engine.js';
export const seen=(s,id)=>s.inspectedObjects.includes(id);
export const TV_BULLETINS=['output-read','work-read','prices-read'];
const done=(s,id)=>s.solvedPuzzles.includes(id);
export const FRAGMENTS={
 'shipping-date':['Shipping tag','March 16 · first emergency-route arrival.'],
 'old-food':['March grocery receipt','March 30. Same monthly basket: $600.'],
 'new-food':['April grocery receipt','April 30. Same quantities: $800.'],
 'meter-read':['Household utility bill','500 units in March: $200. 500 units in April: $500.'],
 'rent-read':['Rent adjustment','Same rooms. March $1,400; April $1,500.'],
 'output-read':['Output bulletin','National real output index: 200 → 184, at constant prices.'],
 'work-read':['Employment bulletin','National unemployment rate: 5% → 8%.'],
 'prices-read':['Price bulletin','National price index: 100 → 108. Inflation over matching monthly intervals: 2% → 8%.']
};
export const SEARCH_TITLES={bag:'Canvas shopping bag',groceries:'Inside the bag',receipt:'A crumpled receipt',tags:'April grocery receipt',desk:'Writing desk',drawer:'Top drawer',wallet:'A worn wallet',mail:'Letter rack',rent:'A folded notice',meter:'Utility meter',ledger:'Shelf of books',book:'Worn book',tray:'Filing tray',files:'Shipping tag',machine:'Idle machine',counter:'Counter cover',bin:'Storage bin',records:'Shelves of records',register:'A narrow volume',television:'A small television',receiver:'Wooden radio',service:'Radio access panel',utility:'Utility cabinet',coat:'A coat on its hook',clock:'Mantel clock',frame:'An old photograph',lamp:'Reading lamp',plant:'Window plant',window:'The window',cup:'An empty cup',tools:'Tool roll',calendar:'Wall calendar',box:'A biscuit tin',chair:'An armchair',pipes:'Heating pipes',fuse:'Fuse box',schedule:'Time-card rack'};
export function discoveryHint(s,puzzle,level){
 if(puzzle==='cost')return HINTS.cost[level-1];
 if(puzzle==='indicators'&&done(s,'budget')&&!s.evidence.includes('household'))return 'Return to the unlocked household drawer. Inspect the reconciled accounts, then place them in your satchel.';
 if(puzzle==='radio'&&!s.evidence.includes('date'))return 'Inspect and collect the interruption notice from the unlocked household drawer. It supplies the first broadcast date.';
 if(puzzle==='budget'){
  const missing=householdSources(s).filter(x=>!x.found);
  if(missing.length)return [
   'The household comparison is missing '+missing.map(x=>x.label.toLowerCase()).join(', ')+'.',
   missing[0].hint,
   missing.map(x=>x.hint).join(' ')
  ][level-1];
  return HINTS.budget[level-1];
 }
 if(puzzle==='indicators'&&hasNationalEvidence(s)&&seen(s,'search:register'))return HINTS.indicators[level-1];
 if(puzzle==='indicators'&&TV_BULLETINS.every(id=>seen(s,id))&&!seen(s,'national')){
  if(!done(s,'orders'))return ['The workshop records are still incomplete.','Return to the workbench and release the production plan.','Finish the work-order press, then examine the tall bookcase immediately left of the television.'][level-1];
  return ['The register is kept beside the television.','Search the tall bookcase immediately left of the television. The small shelf above the writing desk holds different books.','Back out to the wide view. Find the television, then click the tall bookcase immediately to its left. Pull the narrow ledger from the left side of its second shelf, then examine its brass clasp.'][level-1];
 }
 if(puzzle==='indicators'&&!TV_BULLETINS.every(id=>seen(s,id)))return ['The television has more than one bulletin. Try its tuning knobs.','The upper television knob advances the channel; the lower knob turns it back.','Click the upper television knob repeatedly to read all three channels: output, unemployment, and prices. Then, after releasing the work plan, pull the narrow register from the shelf.'][level-1];
 const searches={budget:[['pay','Near the writing desk, something is still tucked away.','Examine the writing desk’s top drawer.','Click the writing desk, then its top drawer to read both pay envelopes.'],['food','The shopping has not been fully unpacked.','Look beneath the groceries and inspect the separate April receipt.','Open the bag; move the jar and bread. Unfold the March receipt and the separate April receipt.'],['bills','Check the household fittings and incoming mail.','Inspect the utility bill on the writing desk and the letter rack.','Read the utility bill on the desk. Move the postcard in the letter rack and unfold the rent notice.'],['search:desk','The household comparison belongs at the writing desk.','Examine the lower drawer on the writing desk.','Click the lower drawer lock to open the household balance catches.']],cost:[['invoices','Some work records are still filed away.','Search the filing tray beneath its ordinary stationery.','At the workbench filing tray, move the catalogue and pull the delivery folder. Read the shipping tag. Dated input costs are on the cabinet rails.'],['production','The idle equipment has its own memory.','Look under the machine counter’s cover.','Lift the counter cover to compare March 12, 16, and 21.']],orders:[['stock','Look near the workbench before allocating material.','Inspect the lidded storage bin.','Lift the bin lid. Six steel blanks remain; each job needs two.']],indicators:[['national','There are wider reports among the media and records.','Try each television channel, then search the shelf of records.','Read all three television bulletins. After releasing the work plan, pull the narrow register from the shelf.']]};
 const missing=searches[puzzle]?.find(row=>!seen(s,row[0]));
 if(missing)return missing[level];
 if(puzzle==='radio'&&!seen(s,'shipping-date'))return ['The radio dates are scattered through the house.','Look in the workbench filing tray. A shipping tag marks the first emergency arrival.','Move the catalogue in the workbench tray, read the shipping tag beneath it: March 16.'][level-1];
 if(puzzle==='radio'&&!seen(s,'search:schedule'))return ['One dispatch follows the staffing change.','The machine has a time-card rack on its right side.','Click the narrow time-card rack directly to the right of the machine in the wide workshop view: March 21.'][level-1];
 if(puzzle==='radio'&&!seen(s,'index'))return ['Find the wooden radio on the cabinet to the right of the television. Its rounded top and two brass knobs distinguish it.','Click the wooden radio to the right of the television. Open the small rectangular panel below its tuning display, between the two brass knobs.','Find the wooden radio to the right of the television. Click it, then click the small bottom-center panel with a brass button. Read the service card revealed inside. The brass clasp on the book powers the radio.'][level-1];
 return HINTS[puzzle][level-1].replaceAll('Residence','household side').replaceAll('Control Room','utility cabinet').replaceAll('Hall','exit').replaceAll('indicator wall','record mechanism').replaceAll('Activate the wall','Engage the mechanism');
}
