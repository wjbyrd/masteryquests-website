import assert from 'node:assert/strict';
import {newState,complete,restore,inspect,collectDrawerItem,need,contextualPuzzle} from '../../game/games/the-shock-house/engine.js';
import {discoveryHint} from '../../game/games/the-shock-house/discovery.js';
function household(s){s.inspectedObjects.push('pay','food','bills','notebook');s.householdPattern=[1,1,-1];assert(complete(s,'budget').ok);for(const id of ['badge','date','household']){inspect(s,'drawer:'+id);collectDrawerItem(s,id);}assert(restore(s));}
function workshop(s){s.inspectedObjects.push('invoices','production','stock');s.invoices=['early','middle','late'];inspect(s,'badge-used');assert(complete(s,'cost').ok);s.jobs=['A','C'];assert(complete(s,'orders').ok);assert(restore(s));}
for(const order of ['household','workshop']){
 const s=newState();s.currentRoom='workshop';assert.equal(contextualPuzzle(s,'cost'),'cost');assert.deepEqual(need(s,'cost'),[]);
 s.inspectedObjects.push('output-read','work-read','prices-read');s.connected=['household','costs','staffing'];s.indicators=[-1,1,1];assert(!complete(s,'indicators').ok);
 if(order==='workshop'){s.inspectedObjects.push('invoices','production');assert(!complete(s,'cost').ok);}household(s);
 assert(!complete(s,'indicators').ok,'A single branch cannot complete national synthesis');
 workshop(s);
 assert(complete(s,'indicators').ok);s.broadcastSequence=['March 14','March 16','March 21'];
 for(const clue of ['index','shipping-date','search:schedule']){assert(!complete(s,'radio').ok,'Correct dates alone cannot bypass source convergence');s.inspectedObjects.push(clue);}
 assert(complete(s,'radio').ok);assert(restore(s));
}
const workshopFirst=newState();workshopFirst.currentRoom='workshop';assert(!complete(workshopFirst,'cost').ok);assert.equal(workshopFirst.solvedPuzzles.includes('budget'),false);
const householdFirst=newState();household(householdFirst);householdFirst.currentRoom='workshop';assert.equal(contextualPuzzle(householdFirst,'cost'),'cost');
const early=newState();early.currentRoom='archive';early.inspectedObjects=['index','output-read','work-read','prices-read','production'];assert.equal(contextualPuzzle(early,'radio'),'cost');assert(discoveryHint(early,'cost',3).includes('March 12'));
const legacy=newState();delete legacy.branchRevision;delete legacy.householdPattern;legacy.inspectedObjects=['invoices'];legacy.budget={march:[3000,1400,600,200],april:[3200,1500,800,500]};const migrated=restore(legacy);assert.deepEqual(migrated.householdPattern,[1,1,-1]);assert(migrated.inspectedObjects.includes('shipping-date'));assert(migrated.inspectedObjects.includes('search:schedule'));
console.log(JSON.stringify({passed:true,checks:['workshop exploration before badge, completion after badge','either branch alone blocks synthesis','three radio sources','nearest ready hints','early unresolved observations','legacy amount/date migration']}));
