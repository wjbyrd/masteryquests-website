import assert from 'node:assert/strict';
import {newState,inspect,restore,complete,householdSources} from '../../game/games/the-shock-house/engine.js';
import {discoveryHint} from '../../game/games/the-shock-house/discovery.js';
const s=newState();s.householdPattern=[1,1,-1];
for(const id of ['pay','rent-read','old-food','new-food'])inspect(s,id);
assert(!complete(s,'budget').ok);assert(complete(s,'budget').message.startsWith('Still missing: utilities.'));
assert.equal(householdSources(s).filter(x=>!x.found).length,1);
assert(discoveryHint(s,'budget',3).includes('utility bill lying on the writing desk'));
inspect(s,'moved:meter-cover');assert(s.inspectedObjects.includes('meter-read'));assert(s.inspectedObjects.includes('food'));assert(s.inspectedObjects.includes('bills'));assert(complete(s,'budget').ok,'Visible comparisons suffice without redundant number or notebook clicks');
const legacy=newState();legacy.branchRevision=4;legacy.householdPattern=[1,1,-1];legacy.inspectedObjects=['pay','rent-read','new-food','moved:meter-cover'];const restored=restore(structuredClone(legacy));assert(complete(restored,'budget').ok);assert(!legacy.inspectedObjects.includes('bills'),'Migration does not mutate raw save');
const wrong=restore(legacy);wrong.householdPattern=[0,0,0];assert(complete(wrong,'budget').message.includes('do not match the household accounts'));
const olderOnly=newState();olderOnly.inspectedObjects=['pay','rent-read','moved:meter-cover','old-food'];olderOnly.householdPattern=[1,1,-1];assert(complete(olderOnly,'budget').message.startsWith('Still missing: groceries.'));
console.log(JSON.stringify({passed:true,checks:['visible meter auto-recorded','both separate receipts required','no redundant notebook gate','exact missing clue','legacy save repaired','wrong dials distinguished','older receipt alone insufficient']}));

// One receipt cannot supply the other month's amount or unlock its comparison.
for(const first of ['old-food','new-food']){
 const partial=newState();for(const id of ['pay','bills',first])inspect(partial,id);partial.householdPattern=[1,1,-1];
 assert(!householdSources(partial).find(x=>x.id==='food').found);assert(!partial.inspectedObjects.includes('food'));assert(!complete(partial,'budget').ok);
 const resumed=restore(structuredClone(partial));assert(!resumed.inspectedObjects.includes('food'),'Reload does not invent missing receipt');
 inspect(resumed,first==='old-food'?'new-food':'old-food');assert(complete(resumed,'budget').ok);
}
const {groceryReceipt}=await import('../../game/games/the-shock-house/paper-records.js');
const march=groceryReceipt(0),april=groceryReceipt(1);
assert(!march.includes('$800')&&!march.includes('April'));assert(!april.includes('$600')&&!april.includes('March'));
assert.equal(march.replaceAll('March 30','DATE').replace('$600','AMOUNT'),april.replaceAll('April 30','DATE').replace('$800','AMOUNT'));
const {renderEvidence}=await import('../../game/games/the-shock-house/objects.js');const bulletin=renderEvidence('indicators');assert(!bulletin.includes('plate-arrows'));assert(bulletin.includes('200 → 184'));
console.log(JSON.stringify({passed:true,checks:['single-month content','identical receipt forms','both discovery orders','partial receipt reload','legacy comparison retained','redundant bulletin arrows removed']}));
