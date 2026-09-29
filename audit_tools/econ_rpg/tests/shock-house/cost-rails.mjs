import assert from 'node:assert/strict';
import {newState,complete,restore,inspect,collectDrawerItem} from '../../game/games/the-shock-house/engine.js';
import {renderMechanism} from '../../game/games/the-shock-house/objects.js';
const opened=()=>{const s=newState();s.inspectedObjects=['pay','food','bills'];s.householdPattern=[1,1,-1];assert(complete(s,'budget').ok);return s;};
for(const tags of [['early','middle','late'],['early','late','middle'],['middle','early','late'],['middle','late','early'],['late','early','middle'],['late','middle','early']]){
 const s=opened();s.invoices=tags;
 assert(!complete(s,'cost').ok,'A correct order cannot bypass the badge');
 assert(!collectDrawerItem(s,'badge'),'Must inspect before collecting');
 inspect(s,'drawer:badge');assert(collectDrawerItem(s,'badge'));
 assert(!complete(s,'cost').ok,'Possessing a badge does not insert it');inspect(s,'badge-used');
 const result=complete(s,'cost');assert.equal(result.ok,tags.join(',')==='early,middle,late',tags.join());
 assert(restore(s),'Partially collected drawer can resume');
 if(result.ok){assert(s.evidence.includes('costs'));assert(!s.inventory.includes('badge'));assert(!s.inspectedObjects.includes('invoices'),'No hidden reread gate');}
 else assert(result.message.includes('not in chronological order'));
}
const s=opened();assert.deepEqual(s.inventory,[]);assert.deepEqual(s.evidence,[]);
inspect(s,'drawer:date');assert.equal(s.drawerCollected.length,0,'Preview alone does not collect');
assert(renderMechanism('budget',s).includes('drawer-preview'));
assert(collectDrawerItem(s,'date'));assert(!collectDrawerItem(s,'date'),'No duplicate collection');
let resumed=restore(structuredClone(s));assert.deepEqual(resumed.drawerCollected,['date']);
assert.equal((renderMechanism('budget',resumed).match(/data-action="drawer-preview"/g)||[]).length,2);
for(const id of ['badge','household']){inspect(resumed,'drawer:'+id);assert(collectDrawerItem(resumed,id));}
assert(restore(resumed));assert.equal((renderMechanism('budget',resumed).match(/data-action="drawer-preview"/g)||[]).length,0);
const old={...resumed};delete old.drawerCollected;old.branchRevision=2;assert.deepEqual(restore(old).drawerCollected,['badge','date','household']);
const workshopLegacy=newState();delete workshopLegacy.drawerCollected;workshopLegacy.branchRevision=2;workshopLegacy.solvedPuzzles=['cost'];workshopLegacy.evidence=['costs'];assert(restore(workshopLegacy),'Previously completed workshop-first saves survive');
assert.equal(restore({...s,drawerCollected:['badge']}),null,'Invalid collected/inventory mismatch rejected');
console.log(JSON.stringify({passed:true,checks:['six dated permutations','badge acquisition and insertion','no hidden source gate','individual inspection and collection','partial drawer reload','legacy saves']}));
