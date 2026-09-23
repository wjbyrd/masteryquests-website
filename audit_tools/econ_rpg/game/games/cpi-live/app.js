import { CONFIG } from './config.js';
import * as engine from './engine.js';
import { receipt, work } from './view.js';
import { createRecorder } from './telemetry.js';
import { loadActive,loadLast,persist } from './storage.js';
const view=document.querySelector('#work'), board=document.querySelector('#receipt'), announcement=document.querySelector('#announcement');
let run, recorder;
let storage;try{storage=localStorage;}catch{}
function warn(message){const target=document.querySelector('#storage-warning');target.textContent=message;target.hidden=false;}
function save(){if(!persist(storage,run))warn('Progress could not be saved in this browser. You can continue in this tab; reloading may lose your progress.');}
document.title=`${CONFIG.title} | Mastery Quests`;
document.querySelector('#game-title').textContent=CONFIG.title;
document.querySelector('#model-note').textContent=CONFIG.modelNote;
document.documentElement.style.setProperty('--cpi-pulse-ms',`${CONFIG.animationMs}ms`);
function reset(initial=false){
  const restored=initial?loadActive(storage):{run:null};
  if(restored.error)warn(restored.error);
  run=restored.run||engine.newRun(crypto.getRandomValues(new Uint32Array(1))[0],crypto.randomUUID(),Date.now(),run||loadLast(storage));
  recorder=createRecorder(storage,run.runID,warn);save();
  announcement.textContent='';render(initial?null:'stage-title');
}
function render(focusID){
  const html=receipt(run);if(board.innerHTML!==html)board.innerHTML=html;
  view.innerHTML=work(run);
  if(run.lastAnswer&&typeof run.lastAnswer==='object')for(const [name,value]of Object.entries(run.lastAnswer)){const field=view.querySelector(`[name="${name}"]`);if(field){field.value=value??'';field.setAttribute('aria-invalid',String(!engine.accepts(value,engine.expected(run)?.[name],['base','reprice'].includes(run.phase)?'currency':run.phase==='cpi'?'index':'rate')));}}
  if(focusID)document.getElementById(focusID)?.focus();
}
function presented(before){
  const event={reprice:'price_shock_presented',audit:'audit_presented',timeline_rate:'timeline_presented'}[run.phase];
  if(event)recorder.log(event,before,run,{phase:run.phase});
}
function answer(value){
  const before=run;run=engine.submit(run,value);if(run===before)return;
  const event={base:'base_basket',reprice:'basket_cost',cpi:'cpi',inflation:'inflation',meaning:'index_meaning',weight:'weight',audit:'audit',timeline_rate:'timeline',timeline_compare:'timeline',deflation:'timeline'}[before.phase];
  const kind=['base','reprice'].includes(before.phase)?'currency':before.phase==='cpi'?'index':'rate';
  const selected=typeof value==='string'?value:Object.fromEntries(Object.entries(value).map(([k,v])=>[k,engine.parseNumber(v,kind)]));
  const attempt={questionID:before.phase,attemptNumber:run.attempts[before.phase],correct:run.solved,firstAttemptCorrect:run.solved&&run.attempts[before.phase]===1,selectedAnswer:selected};
  recorder.log(before.phase==='weight'?'weight_prediction':`${event}_attempt`,before,run,attempt);
  if(before.phase==='weight'&&!before.weightRevealed)recorder.log('weight_reveal',before,run);
  if(run.solved)recorder.log(event==='timeline'?'timeline_step_complete':`${event}_complete`,before,run,attempt);
  save();render(null);
  if(typeof value==='object'){
    for(const [name,text] of Object.entries(value)){const input=document.getElementById(`answer-${name}`);if(input){input.value=text;input.setAttribute('aria-invalid',String(!engine.accepts(text,engine.expected(before)[name],kind)));}}
  }
  const feedback=document.querySelector('#feedback');
  // Announce one complete update; no animated digits are live regions.
  announcement.textContent=`Attempt ${run.attempts[before.phase]}. ${feedback.textContent}`;
  if(!run.solved&&typeof value==='object'){
    const input=view.querySelector('[aria-invalid="true"]')||view.querySelector('input');input.focus();input.select();
  }else feedback.focus();
}
view.addEventListener('submit',event=>{
  if(event.target.id!=='answer-form')return;event.preventDefault();answer(Object.fromEntries(new FormData(event.target)));
});
view.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target||target.disabled)return;
  if(target.dataset.answer){answer(target.dataset.answer);return;}
  const before=run;
  if(target.dataset.hint){
    const drafts=Object.fromEntries([...view.querySelectorAll('input')].map(input=>[input.name,input.value]));
    run=engine.toggleHint(run,target.dataset.hint);if(run===before)return;
    recorder.log('hint_toggled',before,run,{questionID:run.phase,part:target.dataset.hint,expanded:run.hints[run.phase][target.dataset.hint]});
    save();render(null);
    for(const [name,value]of Object.entries(drafts))view.querySelector(`[name="${name}"]`).value=value;
    view.querySelector(`[data-hint="${target.dataset.hint}"]`).focus({preventScroll:true});return;
  }
  if(target.dataset.action==='start'){
    run=engine.start(run);if(run===before)return;recorder.log('run_start',before,run,{seed:run.seed});
  }else if(target.dataset.action==='next'){
    run=engine.next(run);if(run===before)return;presented(before);
    if(run.phase==='complete'){
      recorder.log('timeline_complete',before,run,{correct:true});
      recorder.log('run_complete',before,run,{firstCorrect:run.firstCorrect,questions:engine.PHASES.length,auditCorrect:true,timelineCorrect:true});
    }
  }else if(target.dataset.action==='replay'){reset();return;}else return;
  save();announcement.textContent='';render('stage-title');
});
reset(true);
