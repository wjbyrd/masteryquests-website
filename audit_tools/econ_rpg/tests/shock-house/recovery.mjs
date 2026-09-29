import assert from 'node:assert/strict';
import {newRecovery,recoveryAction as act,validRecovery,migrateRecovery,RECOVERY_CHAIN,recoveryHint} from '../../game/games/the-shock-house/recovery-state.js';
import {newState,restore,complete,inspect,collectDrawerItem,FINAL_ORDER} from '../../game/games/the-shock-house/engine.js';
const r=newRecovery();assert(validRecovery(r));
act(r,'finish');assert(!r.complete);act(r,'photo-open');assert(!r.flags.includes('photo-open'));
// Independent utility/adoption discoveries can precede the coat chain.
for(const a of ['rate','overhead','growers','mills','makers','ad-check'])act(r,a);
assert(recoveryHint(r,'hall').includes('coat'));act(r,'adoption');assert(!r.flags.includes('adoption'));
act(r,'date','14 MAR');act(r,'trial');assert(!r.flags.includes('trial'));
for(const a of ['left-pocket','coin','right-pocket','ticket','ticket-back','photo-back','photo-open'])act(r,a);
act(r,'book-select','repairs');assert(!r.flags.includes('book-selected'));act(r,'book-select','botany');act(r,'book-open');act(r,'trial');assert(r.flags.includes('trial'));assert(validRecovery(r));
act(r,'ticket-back');assert(!r.ticketFace);assert(r.flags.includes('ticket-back'));
act(r,'costs');assert(!r.flags.includes('costs'));act(r,'cost','15');
for(const flag of ['rate','overhead']){const copy=structuredClone(r);copy.flags=copy.flags.filter(x=>x!==flag);act(copy,'costs');assert(!copy.flags.includes('costs'));}
act(r,'costs');assert(validRecovery(r));
for(let i=0;i<3;i++)act(r,'channel','next');act(r,'pattern','0');act(r,'pattern','1');act(r,'pattern','1');act(r,'national');assert(!r.flags.includes('national'),'TV cannot replace diffusion evidence');
for(const i of ['0','0','1','1','2','2'])act(r,'adopt-pin',i);
for(const flag of ['growers','mills','makers']){const copy=structuredClone(r);copy.flags=copy.flags.filter(x=>x!==flag);act(copy,'adoption');assert(!copy.flags.includes('adoption'));}
act(r,'adoption');assert(r.flags.includes('adoption'));const noDemand=structuredClone(r);noDemand.flags=noDemand.flags.filter(x=>x!=='ad-check');act(noDemand,'national');assert(!noDemand.flags.includes('national'));
act(r,'national');assert(r.flags.includes('national'));assert(validRecovery(r));
act(r,'place','outcome');act(r,'finish');assert(!r.complete);act(r,'clear');for(const key of RECOVERY_CHAIN)act(r,'place',key);
for(const i of ['0','1','2','2'])act(r,'direction',i);act(r,'finish');assert(r.complete);assert(validRecovery(r));
const before=JSON.stringify(r);act(r,'clear');assert.equal(JSON.stringify(r),before);
assert(Number.isFinite(r.startedAt)&&Number.isFinite(r.completedAt)&&r.completedAt>=r.startedAt);
const withoutTiming=structuredClone(r);delete withoutTiming.startedAt;delete withoutTiming.completedAt;
assert(validRecovery(withoutTiming),'Existing second-case saves remain valid without timing fields');
const {elapsedTime}=await import('../../game/games/the-shock-house/stats.js');
assert.equal(elapsedTime(undefined,undefined),'Not recorded');assert.equal(elapsedTime(0,61000),'1:01');
assert(!validRecovery({...r,completedAt:r.startedAt-1}));
for(const patch of [{flags:['trial']},{date:'99 MAY'},{cost:-1},{channel:12},{directions:[1]},{hintLevel:4},{complete:true,chain:[]},{ticketFace:'yes'}])assert(!validRecovery({...r,...patch}));
const old=newState();delete old.recovery;delete old.branchRevision;delete old.householdPattern;assert.equal(restore(old).recovery,null);
assert.equal(restore({...newState(),recovery:newRecovery()}),null);
const legacy={...r,version:1,flags:r.flags.filter(x=>!['book-selected','rate','overhead','growers','mills','makers','adoption','ad-check'].includes(x)),chain:['technology','costs','supply','outcome']};delete legacy.adoption;
assert(validRecovery(migrateRecovery(legacy)));assert(migrateRecovery(legacy).complete);
const partial=migrateRecovery({...legacy,complete:false});assert(validRecovery(partial));assert(partial.flags.includes('costs'));assert(!partial.flags.includes('national'));assert.deepEqual(partial.chain,[]);
const first=newState();Object.assign(first,{householdPattern:[1,1,-1],inspectedObjects:['pay','food','bills','notebook','invoices','production','stock','output-read','work-read','prices-read','index','shipping-date','search:schedule'],invoices:['early','middle','late'],jobs:['A','C'],connected:['household','costs','staffing'],indicators:[-1,1,1],broadcastSequence:['March 14','March 16','March 21'],policyTried:['tight','loose'],seals:['prices','work'],finalSequence:[...FINAL_ORDER]});for(const id of ['budget','cost','orders','indicators','radio','policy','exit']){assert(complete(first,id).ok);if(id==='budget'){for(const item of ['badge','date','household']){inspect(first,'drawer:'+item);collectDrawerItem(first,item);}inspect(first,'badge-used');}}
const oldCompleted=structuredClone(first);delete oldCompleted.branchRevision;delete oldCompleted.householdPattern;delete oldCompleted.recovery;assert(restore(oldCompleted).solvedPuzzles.includes('exit'),'Completed pre-revision Mission 1 remains valid');
assert.equal(restore({...first,stage:'recovery-results',recovery:newRecovery()}).stage,'recovery','Inconsistent second-case stage does not discard the first case');
first.recovery={version:999};first.stage='recovery';const repaired=restore(first);assert(repaired.solvedPuzzles.includes('exit'));assert.equal(repaired.recovery,null);assert.equal(repaired.stage,'reveal');
console.log(JSON.stringify({passed:true,checks:['seven mechanisms','independent early clues','distributed rates','adoption required','all three installation sources','AD seal required','five earned artifacts','malformed states','legacy partial migration','legacy completed migration','corrupt second case preserves first']}));
