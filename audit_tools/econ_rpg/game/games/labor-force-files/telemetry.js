import {CONFIG} from './config.js';
import {model,question,QUESTIONS} from './engine.js';
import {selectedIDs} from './storage.js';
export const PREFIX='mq.labor-force-files.run.v1.';
export function recorder(storage,runID,warn=()=>{},now=()=>Date.now()) {
  let record={gameID:CONFIG.gameID,runID,events:[]},warned=false;
  try{const saved=JSON.parse(storage.getItem(PREFIX+runID));if(saved?.runID===runID&&Array.isArray(saved.events))record=saved;}catch{}
  return {record,log(action,before,after=before,extra={}) {
    const m=model(after),q=question(before);
    record.events.push({action,gameID:CONFIG.gameID,runID,...selectedIDs(after),scenarioID:m.group||'baseline',phase:q?.stage??null,caseID:q?.id??'intro',...m.current,attemptNumber:after.attempts[q?.id]||0,correct:after.solved,firstAttemptCorrect:after.first[q?.id]??false,hintLevel:after.hints[q?.id]?.formula?2:after.hints[q?.id]?.concept?1:0,selectedAnswer:after.answer,completed:after.step===QUESTIONS.length,elapsedMs:Math.max(0,now()-after.startedAt),timestamp:new Date(now()).toISOString(),...extra});
    try{storage.setItem(PREFIX+runID,JSON.stringify(record));const keys=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith(PREFIX)&&k!==PREFIX+runID)keys.push(k);}const date=k=>{try{return JSON.parse(storage.getItem(k)).events.at(-1)?.timestamp||'';}catch{return '';}};keys.sort((a,b)=>date(b).localeCompare(date(a))).slice(CONFIG.retainedRuns-1).forEach(k=>storage.removeItem(k));}
    catch{if(!warned)warn('Local history could not be saved. You can continue in this tab.');warned=true;}
  }};
}
