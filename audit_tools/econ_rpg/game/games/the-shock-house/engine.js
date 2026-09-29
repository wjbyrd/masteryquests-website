import { PUZZLES, EVIDENCE, ITEMS, ROOM_ORDER, DATES } from './content.js';
import {validRecovery,migrateRecovery} from './recovery-state.js';
export const SAVE_KEY = 'mastery-quests.shock-house.v1';
// Causal order of FINAL_EVENTS, keyed by their supporting records for save compatibility.
// The broadcast key represents the terminal disruption, not the act of reporting it.
export const FINAL_ORDER = ['broadcast','costs','staffing','indicators','tradeoff'];
export function newState() {
  return { version:1,branchRevision:5,drawerCollected:[],currentRoom:'hall',visitedRooms:['hall'],solvedPuzzles:[],inventory:[],evidence:[],inspectedObjects:[],hintLevels:{},hintUses:0,
    finalSequence:[],startedAt:Date.now(),completedAt:null,stage:'investigation',finalAttempts:0,
    settings:{showObjects:false,sound:false,clickSounds:true},
    householdPattern:[0,0,0],budget:{march:[2600,1000,400,100],april:[2600,1000,400,100]},invoices:['late','early','middle'],jobs:[],
    connected:[],indicators:[0,0,0],frequency:240,date:'March 10',tuned:false,broadcastSequence:[],
    policyValue:0,policyTried:[],seals:[],transfer:[0,0,0],transferDone:false,recovery:null
  };
}
export const solved = (s,id) => s.solvedPuzzles.includes(id);
export const hasNationalEvidence = s => solved(s,'indicators')||['output-read','work-read','prices-read'].every(id=>s.inspectedObjects.includes(id));
export function unlock(s,id) { if (!s.evidence.includes(id)) s.evidence.push(id); }
// Count information when it becomes visible, including equivalent legacy views.
export function householdSources(s) {
  const has=id=>s.inspectedObjects.includes(id);
  return [
    {id:'pay',label:'Pay',found:has('pay'),values:'$3,000 → $3,200',hint:'Open the writing desk’s top drawer to read the pay envelopes.'},
    {id:'food',label:'Groceries',found:has('food')||(has('old-food')&&has('new-food')),values:'$600 → $800',hint:'Read both grocery receipts inside the shopping bag: March and April.'},
    {id:'rent',label:'Rent',found:has('bills')||has('rent-read'),values:'$1,400 → $1,500',hint:'Move the postcard in the letter rack and unfold the rent notice.'},
    {id:'utilities',label:'Utilities',found:has('bills')||has('meter-read')||has('moved:meter-cover'),values:'$200 → $500',hint:'Read the household utility bill lying on the writing desk.'}
  ];
}
function syncHouseholdEvidence(s) {
  const add=id=>{if(!s.inspectedObjects.includes(id))s.inspectedObjects.push(id);};
  if(s.inspectedObjects.includes('moved:meter-cover')||s.inspectedObjects.includes('search:utility-bill'))add('meter-read');
  if(s.inspectedObjects.includes('search:service'))add('index');
  if(s.inspectedObjects.includes('search:files'))add('shipping-date');
  const sources=householdSources(s);
  if(sources.find(x=>x.id==='food').found)add('food');
  if(sources.filter(x=>['rent','utilities'].includes(x.id)).every(x=>x.found))add('bills');
}
export function inspect(s,id) { if(!s.inspectedObjects.includes(id)) s.inspectedObjects.push(id);syncHouseholdEvidence(s); }
export function collectDrawerItem(s,id) {
  if(!solved(s,'budget')||!['badge','date','household'].includes(id)||!s.inspectedObjects.includes('drawer:'+id)||s.drawerCollected.includes(id))return false;
  s.drawerCollected.push(id);
  if(id==='badge'){if(!solved(s,'cost'))s.inventory.push(id);}else unlock(s,id);
  return true;
}
export function need(s,id) {
  const prerequisites={budget:[],cost:[],orders:['cost'],indicators:['budget','cost','orders'],radio:['indicators'],policy:['radio'],exit:['budget','cost','orders','indicators','radio','policy']};
  return prerequisites[id].filter(p=>!solved(s,p));
}
export function complete(s,id) {
  if(solved(s,id))return {ok:true,message:'This mechanism is already recorded.'};
  if(need(s,id).length)return {ok:false,message:'Some connected evidence is still missing. Look around the house.'};
  let ok=false;
  if(id==='budget'){
    const missing=householdSources(s).filter(x=>!x.found);
    if(missing.length)return {ok:false,message:'Still missing: '+missing.map(x=>x.label.toLowerCase()).join(', ')+'.'};
    ok=s.householdPattern.join(',')==='1,1,-1';
    if(!ok)return {ok:false,message:'The catches do not match the household accounts.'};
  }
  if(id==='cost'){
    if(!s.inventory.includes('badge')||!s.inspectedObjects.includes('badge-used'))return {ok:false,message:'The employee access slot is empty.'};
    // These dated source records are visible on the rails themselves. No hidden
    // visit flag should reject a correct arrangement of the information shown.
    ok=s.invoices.join(',')==='early,middle,late';
    if(!ok)return {ok:false,message:'The dated records are not in chronological order.'};
  }
  if(id==='orders')ok=[...s.jobs].sort().join(',')==='A,C'&&s.inspectedObjects.includes('stock');
  if(id==='indicators'){
    const missing=['household','costs','staffing'].filter(x=>!s.connected.includes(x));
    if(missing.length)return {ok:false,message:'Insert the missing '+missing.map(x=>({household:'household ledger',costs:'material-cost plate',staffing:'stamped shift board'}[x])).join(' and ')+' into the record slots.'};
    if(!hasNationalEvidence(s))return {ok:false,message:'The national record is incomplete.'};
    ok=s.indicators.join(',')==='-1,1,1';
    if(!ok)return {ok:false,message:'The direction dials do not match the national bulletins.'};
  }
  if(id==='radio'){const missing=['index','shipping-date','search:schedule'].filter(x=>!s.inspectedObjects.includes(x));if(missing.length)return {ok:false,message:'The radio needs its tuning inscription, the shipping tag in the workbench filing tray, and the date on the machine’s time-card rack.'};ok=s.broadcastSequence.join(',')==='March 14,March 16,March 21';}
  if(id==='policy')ok=['tight','loose'].every(x=>s.policyTried.includes(x))&&s.seals.length===2;
  if(id==='exit'){s.finalAttempts++;ok=s.finalSequence.join(',')===FINAL_ORDER.join(',');}
  if(!ok)return {ok:false,message:{budget:'Compare the same household in both months. Pay rises, essentials rise faster, and the remainder shrinks. Check all three catches and the source records.',cost:'That arrangement does not fit the production records.',orders:'That plan does not make the best use of the remaining input. Check what each job adds.',indicators:'The indicators contradict the evidence, or a record has not been connected.',radio:'These dispatches do not trace the interruption from its first day.',policy:'Both objectives need a seal, and both directions of the control need a trial.',exit:'The sequence does not explain the evidence.'}[id]};
  s.solvedPuzzles.push(id);
  if(id==='cost'){unlock(s,'costs');s.inventory=s.inventory.filter(x=>x!=='badge');}
  if(id==='orders')unlock(s,'staffing');
  if(id==='indicators')unlock(s,'indicators');
  if(id==='radio'){unlock(s,'broadcast');if(!s.visitedRooms.includes('policy'))s.inventory.push('access');}
  if(id==='policy')unlock(s,'tradeoff');
  if(id==='exit'){s.completedAt=Date.now();s.stage='escaped';}
  return {ok:true,message:{budget:'The drawer slides open. An employee badge and a dated notice are inside.',cost:'The cabinet opens. A cost record is filed; the work-order press is released.',orders:'The counter settles at 900 units, 90 shifts remain active, and two steel blanks return to storage.',indicators:'Three indicators engage. The broadcast radio now has power.',radio:'The dispatches align. A Utility cabinet key drops into the compartment.',policy:'Both seals lock into place. The final policy record is ready for the exit.',exit:'The sequence holds. The front door is unlocked.'}[id]};
}
export function contextualPuzzle(s,view) {
  const byRoom={hall:['exit'],residence:['budget'],workshop:['cost','orders'],archive:['indicators','radio'],policy:['policy']};
  let target=PUZZLES.includes(view)&&!solved(s,view)?view:byRoom[s.currentRoom].find(x=>!solved(s,x)) || PUZZLES.find(x=>!solved(s,x)) || null;
  if(target&&need(s,target).length){const ready=PUZZLES.filter(x=>!solved(s,x)&&!need(s,x).length);const nearby=byRoom[s.currentRoom].find(x=>ready.includes(x));target=nearby||ready.sort((a,b)=>{const clues={budget:['pay','food','bills','notebook'],cost:['invoices','production'],orders:['stock']};const score=x=>(clues[x]||[]).filter(k=>s.inspectedObjects.includes(k)).length;return score(b)-score(a);})[0]||target;}
  return target;
}
export function policyGauges(value) { return {inflation:7+value,conditions:3+value}; }
// Validate every persisted field, then restore only coherent progress. Broken or
// unknown save formats are rejected without overwriting the user's stored data.
export function restore(raw) {
  if(!raw||raw.version!==1||!ROOM_ORDER.includes(raw.currentRoom))return null;
  const s=newState(), list=(v,allowed)=>Array.isArray(v)&&v.every(x=>allowed.includes(x))&&new Set(v).size===v.length;
  if(!list(raw.solvedPuzzles,PUZZLES)||!list(raw.evidence,Object.keys(EVIDENCE))||!list(raw.inventory,Object.keys(ITEMS)))return null;
  Object.assign(s,raw);
  if(!list(s.visitedRooms,ROOM_ORDER)||!Array.isArray(s.inspectedObjects)||s.inspectedObjects.some(x=>typeof x!=='string')||!Number.isFinite(s.startedAt))return null;
  s.inspectedObjects=[...s.inspectedObjects];
  // Earlier April documents included both prices. Preserve already-read evidence.
  if((raw.branchRevision||0)<5&&s.inspectedObjects.includes('new-food')&&!s.inspectedObjects.includes('food'))s.inspectedObjects.push('food');
  syncHouseholdEvidence(s);
  if(!['investigation','escaped','reveal','results','recovery','recovery-results'].includes(s.stage)||!Number.isFinite(s.hintUses)||!Number.isFinite(s.finalAttempts))return null;
  if(s.recovery!==null){if(!solved(s,'exit'))return null;s.recovery=migrateRecovery(s.recovery);if(!validRecovery(s.recovery)){s.recovery=null;if(['recovery','recovery-results'].includes(s.stage))s.stage='reveal';}}
  if(!Array.isArray(s.householdPattern)||s.householdPattern.length!==3||s.householdPattern.some(x=>![-1,0,1].includes(x)))return null;
  if(!raw.householdPattern){s.householdPattern=solved(s,'budget')?[1,1,-1]:[0,0,0];if(JSON.stringify(s.budget)===JSON.stringify({march:[3000,1400,600,200],april:[3200,1500,800,500]}))s.householdPattern=[1,1,-1];}
  // Prior investigations gathered dispatch dates from the invoice stack.
  if(!raw.branchRevision&&s.inspectedObjects.includes('invoices'))for(const id of ['shipping-date','search:schedule'])inspect(s,id);
  // Earlier builds put all drawer rewards straight into the satchel. Preserve
  // those rewards and completed workshop-first investigations when migrating.
  if(raw.drawerCollected===undefined)s.drawerCollected=solved(s,'budget')?['badge','date','household']:[];
  if(!list(s.drawerCollected,['badge','date','household'])||(!solved(s,'budget')&&s.drawerCollected.length))return null;
  if((raw.branchRevision||0)<4&&s.inspectedObjects.includes('national'))for(const id of ['output-read','work-read','prices-read'])inspect(s,id);
  s.branchRevision=5;
  if(['recovery','recovery-results'].includes(s.stage))s.stage=!s.recovery?'reveal':s.recovery.complete?'recovery-results':'recovery';
  if(!s.hintLevels||typeof s.hintLevels!=='object'||Object.entries(s.hintLevels).some(([k,v])=>!PUZZLES.includes(k)||!Number.isInteger(v)||v<0||v>3))return null;
  if(!s.budget||!['march','april'].every(m=>Array.isArray(s.budget[m])&&s.budget[m].length===4&&s.budget[m].every(n=>Number.isInteger(n)&&n>=0&&n<=5000)))return null;
  if(!list(s.invoices,['early','middle','late'])||s.invoices.length!==3||!list(s.jobs,['A','B','C'])||!list(s.connected,['household','costs','staffing']))return null;
  if(![s.indicators,s.transfer].every(a=>Array.isArray(a)&&a.length===3&&a.every(n=>[-1,0,1].includes(n))))return null;
  if(![240,250,260,270,280,290,300].includes(s.frequency)||!DATES.includes(s.date)||typeof s.tuned!=='boolean'||!Array.isArray(s.broadcastSequence)||s.broadcastSequence.length>3||s.broadcastSequence.some(d=>!['March 14','March 16','March 21'].includes(d)))return null;
  if(!Number.isInteger(s.policyValue)||Math.abs(s.policyValue)>3||!list(s.policyTried,['tight','loose'])||!list(s.seals,['prices','work'])||!list(s.finalSequence,FINAL_ORDER))return null;
  if(!s.settings||typeof s.settings.showObjects!=='boolean'||typeof s.settings.sound!=='boolean')return null;
  if(s.settings.clickSounds!==undefined&&typeof s.settings.clickSounds!=='boolean')return null;
  s.settings={...s.settings,clickSounds:s.settings.clickSounds??true};
  for(const id of s.solvedPuzzles)if(need(s,id).length)return null;
  const rewards={cost:['costs'],orders:['staffing'],indicators:['indicators'],radio:['broadcast'],policy:['tradeoff']};
  for(const [id,ids] of Object.entries(rewards))if(ids.some(e=>s.evidence.includes(e)!==solved(s,id)))return null;
  for(const id of ['household','date'])if(s.evidence.includes(id)!==s.drawerCollected.includes(id))return null;
  if(s.stage!=='investigation'&&(!solved(s,'exit')||!Number.isFinite(s.completedAt)))return null;
  if(s.stage==='investigation'&&solved(s,'exit'))return null;
  if(solved(s,'exit')&&s.finalSequence.join(',')!==FINAL_ORDER.join(','))return null;
  if(typeof s.transferDone!=='boolean'||(s.transferDone&&s.transfer.join(',')!=='1,1,-1'))return null;
  if(s.stage==='results'&&!s.transferDone)return null;
  if(s.inventory.includes('badge')!==Boolean(s.drawerCollected.includes('badge')&&!solved(s,'cost')))return null;
  if(s.inventory.includes('access')!==Boolean(solved(s,'radio')&&!s.visitedRooms.includes('policy')))return null;
  return s;
}
export function load(storage) { try {const raw=storage.getItem(SAVE_KEY);return {state:raw?restore(JSON.parse(raw)):null,warning:raw&&!restore(JSON.parse(raw))?'This save could not be read. Start a new investigation to replace it.':''};}catch{return {state:null,warning:'Saved progress is unavailable. You can still play in this tab.'};} }
export function save(storage,s) {try {storage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;} }
