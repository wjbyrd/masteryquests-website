import { PUZZLES, EVIDENCE, ITEMS, ROOM_ORDER, DATES } from './content.js';
export const SAVE_KEY = 'mastery-quests.shock-house.v1';
export const FINAL_ORDER = ['broadcast','costs','staffing','indicators','tradeoff'];
export function newState() {
  return { version:1,currentRoom:'hall',visitedRooms:['hall'],solvedPuzzles:[],inventory:[],evidence:[],inspectedObjects:[],hintLevels:{},hintUses:0,
    finalSequence:[],startedAt:Date.now(),completedAt:null,stage:'investigation',finalAttempts:0,
    settings:{showObjects:false,sound:false},
    budget:{march:[2600,1000,400,100],april:[2600,1000,400,100]},invoices:['late','early','middle'],jobs:[],
    connected:[],indicators:[0,0,0],frequency:240,date:'March 10',tuned:false,broadcastSequence:[],
    policyValue:0,policyTried:[],seals:[],transfer:[0,0,0],transferDone:false
  };
}
export const solved = (s,id) => s.solvedPuzzles.includes(id);
export function unlock(s,id) { if (!s.evidence.includes(id)) s.evidence.push(id); }
export function inspect(s,id) { if(!s.inspectedObjects.includes(id)) s.inspectedObjects.push(id); }
export function need(s,id) {
  const prerequisites={budget:[],cost:['budget'],orders:['cost'],indicators:['budget','cost','orders'],radio:['indicators'],policy:['radio'],exit:['budget','cost','orders','indicators','radio','policy']};
  return prerequisites[id].filter(p=>!solved(s,p));
}
export function complete(s,id) {
  if(solved(s,id))return {ok:true,message:'This mechanism is already recorded.'};
  if(need(s,id).length)return {ok:false,message:'Some connected evidence is still missing. Explore the other rooms.'};
  let ok=false;
  if(id==='budget')ok=JSON.stringify(s.budget)===JSON.stringify({march:[3000,1400,600,200],april:[3200,1500,800,500]})&&['pay','food','bills','notebook'].every(x=>s.inspectedObjects.includes(x));
  if(id==='cost')ok=s.invoices.join(',')==='early,middle,late'&&s.inspectedObjects.includes('invoices')&&s.inspectedObjects.includes('production')&&s.inspectedObjects.includes('badge-used');
  if(id==='orders')ok=[...s.jobs].sort().join(',')==='A,C'&&s.inspectedObjects.includes('stock');
  if(id==='indicators')ok=s.indicators.join(',')==='-1,1,1'&&['household','costs','staffing'].every(x=>s.connected.includes(x))&&s.inspectedObjects.includes('national');
  if(id==='radio')ok=s.broadcastSequence.join(',')==='March 14,March 16,March 21';
  if(id==='policy')ok=['tight','loose'].every(x=>s.policyTried.includes(x))&&s.seals.length===2;
  if(id==='exit'){s.finalAttempts++;ok=s.finalSequence.join(',')===FINAL_ORDER.join(',');}
  if(!ok)return {ok:false,message:{budget:'The books still do not line up. Check the records and the notebook.',cost:'That arrangement does not fit the production records.',orders:'That plan does not make the best use of the remaining input. Check what each job adds.',indicators:'The indicators contradict the evidence, or a record has not been connected.',radio:'These dispatches do not trace the interruption from its first day.',policy:'Both objectives need a seal, and both directions of the control need a trial.',exit:'The sequence does not explain the evidence.'}[id]};
  s.solvedPuzzles.push(id);
  if(id==='budget'){unlock(s,'household');unlock(s,'date');s.inventory.push('badge');}
  if(id==='cost'){unlock(s,'costs');s.inventory=s.inventory.filter(x=>x!=='badge');}
  if(id==='orders')unlock(s,'staffing');
  if(id==='indicators')unlock(s,'indicators');
  if(id==='radio'){unlock(s,'broadcast');s.inventory.push('access');}
  if(id==='policy')unlock(s,'tradeoff');
  if(id==='exit'){s.completedAt=Date.now();s.stage='escaped';}
  return {ok:true,message:{budget:'The drawer slides open. An employee badge and a dated notice are inside.',cost:'The cabinet opens. A cost record is filed; the work-order press is released.',orders:'The press stamps a reduced production plan. A revised shift sheet slides out.',indicators:'Three indicators engage. The broadcast receiver now has power.',radio:'The dispatches align. A Control Room pass drops into the compartment.',policy:'Both seals lock into place. The final policy record is ready for the Hall.',exit:'The sequence holds. The front door is unlocked.'}[id]};
}
export function contextualPuzzle(s,view) {
  if(PUZZLES.includes(view)&&!solved(s,view))return view;
  const byRoom={hall:['exit'],residence:['budget'],workshop:['cost','orders'],archive:['indicators','radio'],policy:['policy']};
  return byRoom[s.currentRoom].find(x=>!solved(s,x)) || PUZZLES.find(x=>!solved(s,x)) || null;
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
  if(!['investigation','escaped','reveal','results'].includes(s.stage)||!Number.isFinite(s.hintUses)||!Number.isFinite(s.finalAttempts))return null;
  if(!s.hintLevels||typeof s.hintLevels!=='object'||Object.entries(s.hintLevels).some(([k,v])=>!PUZZLES.includes(k)||!Number.isInteger(v)||v<0||v>3))return null;
  if(!s.budget||!['march','april'].every(m=>Array.isArray(s.budget[m])&&s.budget[m].length===4&&s.budget[m].every(n=>Number.isInteger(n)&&n>=0&&n<=5000)))return null;
  if(!list(s.invoices,['early','middle','late'])||s.invoices.length!==3||!list(s.jobs,['A','B','C'])||!list(s.connected,['household','costs','staffing']))return null;
  if(![s.indicators,s.transfer].every(a=>Array.isArray(a)&&a.length===3&&a.every(n=>[-1,0,1].includes(n))))return null;
  if(![240,250,260,270,280,290,300].includes(s.frequency)||!DATES.includes(s.date)||typeof s.tuned!=='boolean'||!Array.isArray(s.broadcastSequence)||s.broadcastSequence.length>3||s.broadcastSequence.some(d=>!['March 14','March 16','March 21'].includes(d)))return null;
  if(!Number.isInteger(s.policyValue)||Math.abs(s.policyValue)>3||!list(s.policyTried,['tight','loose'])||!list(s.seals,['prices','work'])||!list(s.finalSequence,FINAL_ORDER))return null;
  if(!s.settings||typeof s.settings.showObjects!=='boolean'||typeof s.settings.sound!=='boolean')return null;
  for(const id of s.solvedPuzzles)if(need(s,id).length)return null;
  const rewards={budget:['household','date'],cost:['costs'],orders:['staffing'],indicators:['indicators'],radio:['broadcast'],policy:['tradeoff']};
  for(const [id,ids] of Object.entries(rewards))if(ids.some(e=>s.evidence.includes(e)!==solved(s,id)))return null;
  if(s.currentRoom==='policy'&&!solved(s,'radio'))return null;
  if(s.stage!=='investigation'&&(!solved(s,'exit')||!Number.isFinite(s.completedAt)))return null;
  if(s.stage==='investigation'&&solved(s,'exit'))return null;
  if(solved(s,'exit')&&s.finalSequence.join(',')!==FINAL_ORDER.join(','))return null;
  if(typeof s.transferDone!=='boolean'||(s.transferDone&&s.transfer.join(',')!=='1,1,-1'))return null;
  if(s.stage==='results'&&!s.transferDone)return null;
  if(s.inventory.includes('badge')!==Boolean(solved(s,'budget')&&!solved(s,'cost')))return null;
  if(s.inventory.includes('access')!==Boolean(solved(s,'radio')&&!s.visitedRooms.includes('policy')))return null;
  return s;
}
export function load(storage) { try {const raw=storage.getItem(SAVE_KEY);return {state:raw?restore(JSON.parse(raw)):null,warning:raw&&!restore(JSON.parse(raw))?'This save could not be read. Start a new investigation to replace it.':''};}catch{return {state:null,warning:'Saved progress is unavailable. You can still play in this tab.'};} }
export function save(storage,s) {try {storage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;} }
