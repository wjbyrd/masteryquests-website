import { newRun, start, submit, next, toggleHint, POOLS } from './engine.js';
export const ACTIVE_KEY='mq.cpi-live.active.v2', LAST_KEY='mq.cpi-live.last.v2';
export const selectedIDs=run=>Object.fromEntries(Object.keys(POOLS).map(key=>[key,run[key]]));
export function loadLast(storage){
  try{return JSON.parse(storage.getItem(LAST_KEY))||{};}catch{return {};}
}
export function restore(saved){
  if(!saved||saved.version!==2||typeof saved.runID!=='string'||!saved.runID||!Number.isFinite(saved.startedAt)||!Number.isInteger(saved.seed)||!Array.isArray(saved.history)||saved.history.length>10000)throw Error('Invalid saved run');
  let run=newRun(saved.seed,saved.runID,saved.startedAt,saved.previous);
  for(const entry of saved.history){
    const before=run;
    if(entry.action==='start')run=start(run);
    else if(entry.action==='answer')run=submit(run,entry.value);
    else if(entry.action==='next')run=next(run);
    else if(entry.action==='hint')run=toggleHint(run,entry.value);
    else throw Error('Unknown saved action');
    if(run===before)throw Error('Invalid saved action');
  }
  if(JSON.stringify(run)!==JSON.stringify(saved))throw Error('Saved run differs from replay');
  return run;
}
export function loadActive(storage){
  try{const raw=storage.getItem(ACTIVE_KEY);return {run:raw?restore(JSON.parse(raw)):null,error:null};}
  catch{return {run:null,error:'Saved progress could not be read. A fresh price check will start; your current progress may not survive a reload.'};}
}
export function persist(storage,run){
  try{storage.setItem(ACTIVE_KEY,JSON.stringify(run));storage.setItem(LAST_KEY,JSON.stringify(selectedIDs(run)));return true;}catch{return false;}
}
