import { newRun,start,submit,next,hint,POOLS } from './engine.js';
export const ACTIVE_KEY='mq.labor-force-files.active.v1',LAST_KEY='mq.labor-force-files.last.v1';
export const selectedIDs=run=>Object.fromEntries(Object.keys(POOLS).map(k=>[k,run[k]]));
export function restore(saved) {
  if(!saved||saved.version!==1||typeof saved.runID!=='string'||!saved.runID||!Number.isFinite(saved.startedAt)||!Number.isInteger(saved.seed)||!Array.isArray(saved.history)||saved.history.length>10000)throw Error('Invalid saved report');
  let run=newRun(saved.seed,saved.runID,saved.startedAt,saved.previous);
  for(const e of saved.history){const before=run;run=e.action==='start'?start(run):e.action==='answer'?submit(run,e.value):e.action==='next'?next(run):e.action==='hint'?hint(run,e.value):null;if(!run||run===before)throw Error('Invalid saved action');}
  if(JSON.stringify(run)!==JSON.stringify(saved))throw Error('Inconsistent saved report');return run;
}
export function load(storage) {try{const raw=storage.getItem(ACTIVE_KEY);return {run:raw?restore(JSON.parse(raw)):null};}catch{return {run:null,error:'Saved progress is unavailable. A fresh report has opened; reload may lose your progress.'};}}
export function last(storage) {try{return JSON.parse(storage.getItem(LAST_KEY))||{};}catch{return {};}}
export function save(storage,run) {try{storage.setItem(ACTIVE_KEY,JSON.stringify(run));storage.setItem(LAST_KEY,JSON.stringify(selectedIDs(run)));return true;}catch{return false;}}
