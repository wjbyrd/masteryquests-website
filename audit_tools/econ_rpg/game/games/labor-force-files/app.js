import {CONFIG} from './config.js';
import * as engine from './engine.js';
import {board,work} from './view.js';
import {load,last,save} from './storage.js';
import {recorder} from './telemetry.js';
const report=document.querySelector('#report'),view=document.querySelector('#work'),announcement=document.querySelector('#announcement');
let run,log,storage;try{storage=localStorage;}catch{}
const warn=text=>{const el=document.querySelector('#storage-warning');el.textContent=text;el.hidden=false;};
const persist=()=>{if(!save(storage,run))warn('Progress could not be saved. You can continue in this tab; reloading may lose progress.');};
document.title=`${CONFIG.title} | Mastery Quests`;
document.querySelector('#game-title').textContent=CONFIG.title;
document.querySelector('#model-note').textContent=CONFIG.modelNote;
function render(focus) {
  const html=board(run);if(report.innerHTML!==html)report.innerHTML=html;
  view.innerHTML=work(run);
  const target=engine.expected(run);
  if(run.answer&&target&&typeof target==='object')for(const [key,value]of Object.entries(target)){
    const el=view.querySelector(`[name="${key}"]`);if(el&&key!=='participation')el.setAttribute('aria-invalid',String(!engine.accepts(run.answer[key],value,key)));
  }
  if(focus)document.getElementById(focus)?.focus();
}
function reset(initial=false) {
  const restored=initial?load(storage):{};if(restored.error)warn(restored.error);
  run=restored.run||engine.newRun(crypto.getRandomValues(new Uint32Array(1))[0],crypto.randomUUID(),Date.now(),run||last(storage));
  log=recorder(storage,run.runID,warn);persist();announcement.textContent='';render(initial?null:'stage-title');
}
function presented(before) {
  const q=engine.question(run),event={0:'baseline_presented',1:'classification_presented',4:'change_presented',5:'expansion_presented',6:'discouraged_presented',7:'mixed_case_presented',8:'headline_audit_presented'}[q?.stage];
  if(event&&q?.stage!==engine.question(before)?.stage)log.log(event,before,run);
}
function answer(value) {
  const before=run,q=engine.question(run);run=engine.submit(run,value);if(run===before)return;
  const action=q.person!==undefined?'classification_attempt':{base:'labor_force_attempt',ur:'ur_attempt',lfpr:'lfpr_attempt','direct-predict':'change_prediction','direct-calc':'change_calculation','discouraged-interpret':'discouraged_interpretation',headline:'headline_audit_attempt'}[q.id]||q.id.replaceAll('-','_')+'_attempt';
  log.log(action,before,run);if(run.solved)log.log(q.person!==undefined?'classification_complete':q.id==='headline'?'headline_audit_complete':q.id.replaceAll('-','_')+'_complete',before,run);
  persist();render();
  const feedback=document.querySelector('#feedback');announcement.textContent=`Attempt ${run.attempts[q.id]}. ${feedback.textContent}`;
  if(!run.solved&&typeof value==='object'){
    const invalid=view.querySelector('input[aria-invalid=true]');if(invalid){invalid.focus();invalid.select();}else feedback.focus();
  }else feedback.focus();
}
view.addEventListener('submit',event=>{if(event.target.id!=='answer-form')return;event.preventDefault();answer(Object.fromEntries(new FormData(event.target)));});
view.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.answer){answer(button.dataset.answer);return;}
  const before=run;
  if(button.dataset.hint){
    const drafts=[...view.querySelectorAll('input')].map(el=>({name:el.name,value:el.value,checked:el.checked}));
    run=engine.hint(run,button.dataset.hint);if(run===before)return;log.log('hint_toggled',before,run);persist();render();
    for(const d of drafts){const el=view.querySelector(`input[name="${d.name}"]${d.name==='participation'?`[value="${d.value}"]`:''}`);if(el){el.value=d.value;el.checked=d.checked;}}
    view.querySelector(`[data-hint="${button.dataset.hint}"]`).focus({preventScroll:true});return;
  }
  if(button.dataset.action==='start'){run=engine.start(run);if(run===before)return;log.log('run_start',before,run);presented(before);}
  else if(button.dataset.action==='next'){run=engine.next(run);if(run===before)return;presented(before);if(run.step===engine.QUESTIONS.length)log.log('run_complete',before,run);}
  else if(button.dataset.action==='replay'){reset();return;}else return;
  persist();announcement.textContent='';render('stage-title');
});
reset(true);
