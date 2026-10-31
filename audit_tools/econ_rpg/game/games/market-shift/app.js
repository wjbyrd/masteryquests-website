import {clamp,initialValues,market,atPrice,STEP_LABELS,missions,isPolicy,missionText,check,freshRun,restoreRun,quizQuestions,answerQuiz,advanceQuiz,allRecords} from './model.js';
import {plot,graphMarkup,number} from './graph.js';
import {scene} from './scene.js';
const root=document.getElementById('game'),KEY='mq-market-shift-prototype-v2';
let run=freshRun(),saved=false,view='intro',tool='d',feedback=null,showHint=false;
let explore=initialValues(),explorePolicy='';
const $=id=>document.getElementById(id),esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=text=>{$('announcement').textContent=text;},current=()=>missionText(missions(run)[run.index],run.index);
try{const stored=localStorage.getItem(KEY);if(stored){run=restoreRun(JSON.parse(stored));saved=true;}}catch{storageWarning('The earlier browser save could not be read. This prototype will start a new market.');}
function storageWarning(message){$('storageWarning').hidden=false;$('storageWarning').textContent=message;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(run));saved=true;}catch{storageWarning('This browser could not save progress. Keep this tab open and download your notebook at the end.');}}
function focusHeading(){root.querySelector('h1,h2')?.focus();}
function intro(){
  root.innerHTML=`<section class="intro"><div><p class="eyebrow">A Mastery Quests graphing game</p><h1 tabindex="-1">Markets move.<br><em>Make sense of it.</em></h1><p class="lead">You’re the new market analyst in Linden. Read the news, move the curves, and show the council what happens next.</p><div class="actions"><button class="primary" data-action="start">${saved?'Continue your market':'Enter the market'} →</button><button data-action="explore">Explore freely</button></div><small>Five missions · A quick recall quiz · Fresh stories each run</small></div><div class="intro-art"><div class="scene-frame">${scene('festival')}</div><div class="intro-stamp"><strong>Market Shift</strong><span>Your graph. Your forecast.</span></div></div></section><section class="mission-cards" aria-label="Your five missions">${STEP_LABELS.map((label,i)=>`<article><span class="number">0${i+1}</span><h3>${label}</h3><p>${['Follow the buyers.','Follow the sellers.','Two shifts in the same direction.','Two shifts in opposite directions.','A ceiling or a floor.'][i]}</p></article>`).join('')}</section>`;
}
const range=(key,label,min,max,step=5)=>`<div class="control-group"><label class="control-label" for="input-${key}"><span>${label}</span><output id="out-${key}" for="input-${key}"></output></label><input id="input-${key}" data-value="${key}" type="range" min="${min}" max="${max}" step="${step}"><div class="end-labels"><span>${key==='price'?'$0':'← Left'}</span><span>${key==='price'?'$120':'Right →'}</span></div></div>`;
const numeric=(key,label,max)=>`<label for="input-${key}">${label}<input id="input-${key}" data-value="${key}" type="number" min="0" max="${max}" step="1" inputmode="decimal"></label>`;
function graphCard(isExplore=false){
  const policy=isExplore?!!explorePolicy:isPolicy(current());
  return `<section class="graph-card" aria-labelledby="graph-heading"><div class="graph-top"><h3 id="graph-heading">${isExplore?'Market workbench':'Your forecast board'}</h3><span>Starting market: $60 · 50 crates</span></div><div id="liveValues" class="live-values" aria-label="Current graph coordinates"></div><div class="graph-legend"><span><i class="d-key"></i>D · Demand</span><span><i class="s-key"></i>S · Supply</span><span><i class="base-key"></i>Starting curves</span></div><div id="graphTools" class="graph-tools" role="group" aria-label="Graph tool"></div><svg id="graph" class="graph" viewBox="0 0 760 440" role="img" aria-labelledby="graph-title graph-desc"></svg><div id="resultStrip" class="result-strip" hidden></div><p class="graph-note">${isExplore?'Drag a curve left or right to explore.':policy?'Drag the purple price label, then place Qs and Qd on the line.':'Drag D or S left or right. Move E₁ to the new intersection.'} You can also use the controls.</p></section>`;
}
function mission(){
  const m=current(),policy=isPolicy(m);
  root.innerHTML=`<ol class="progress" aria-label="Mission progress">${STEP_LABELS.map((label,i)=>`<li class="${i===run.index?'active':i<run.index?'done':''}" ${i===run.index?'aria-current="step"':''}>${i<run.index?'✓':i+1} · ${label}</li>`).join('')}</ol><section class="brief"><div><p class="eyebrow">Linden market bulletin · Mission ${run.index+1} of 5</p><h2 tabindex="-1">${m.title}</h2><p>${m.event}</p>${run.index>0&&!policy?'<small>Each bulletin starts from the original market: $60 and 50 crates.</small>':''}</div><div class="scene-frame">${scene(m.art,policy?m:null)}</div></section><div class="workbench">${graphCard()}<aside class="controls" aria-labelledby="task-title"><p class="eyebrow">${run.completed?'Forecast filed':'Your move'}</p><h3 id="task-title" class="task">${m.task}</h3><fieldset id="inputFields" ${run.completed?'disabled':''}><legend class="sr-only">Graph values</legend>${!policy?range('d','Demand',-30,30)+range('s','Supply',-30,30)+`<div class="control-group"><h3>Place your equilibrium E₁</h3><div class="numeric-row">${numeric('q','Quantity · crates',100)}${numeric('p','Price · $ per crate',120)}</div></div>`:range('price',m.type==='ceiling'?'Maximum price':'Minimum price',0,120,1)+`<div class="control-group"><h3>Read the two quantities</h3><div class="numeric-row">${numeric('qs','Qs · crates offered',100)}${numeric('qd','Qd · crates wanted',100)}</div></div>`}</fieldset>${run.completed?'':`<button class="primary" data-action="check">Check my forecast</button><div class="control-actions"><button data-action="hint">Give me a hint</button><button data-action="reset">Reset graph</button></div>`}<p id="feedback" class="feedback ${feedback?.ok?'success':''}" role="status" ${feedback?'':'hidden'}>${esc(feedback?.text||'')}</p><p class="hint" ${showHint?'':'hidden'}>${m.hint}</p></aside></div>${run.completed?`<section class="debrief"><div><p class="eyebrow">The economics behind your forecast</p><h3>${m.concept}</h3><p>${m.debrief}</p>${!policy?'<p class="hint">The numbers illustrate the shifts you drew. The news establishes direction, not exact size.</p>':''}</div><button class="primary" data-action="next">${run.index===4?'Try the recall quiz':'Next market day'} →</button></section>`:''}`;
  bindGraph();update();
}
function exploration(){
  root.innerHTML=`<section class="explore-head"><div><p class="eyebrow">Explore · No scores or attempts</p><h2 tabindex="-1">What moves the market?</h2><p>Change a relationship and watch the model respond.</p></div><button data-action="return">${saved?'Back to your market':'Back to Market Shift'}</button></section><div class="workbench">${graphCard(true)}<aside class="controls"><h3>Change the market</h3>${range('d','Demand',-30,30)}${range('s','Supply',-30,30)}<div class="control-group"><label for="policySelect">Price rule</label><select id="policySelect"><option value="">No price control</option><option value="ceiling" ${explorePolicy==='ceiling'?'selected':''}>Price ceiling · maximum</option><option value="floor" ${explorePolicy==='floor'?'selected':''}>Price floor · minimum</option></select><div id="explorePrice" ${explorePolicy?'':'hidden'}>${range('price','Legal price',0,120,1)}</div><p id="exploreResult" class="explore-result"></p></div><button data-action="reset">Reset market</button><p class="hint">A price rule sets a legal limit; it does not move either curve. Assume no government purchases.</p></aside></div>`;
  bindGraph();update();
}
function quiz(){
  const i=run.quiz.index,q=quizQuestions(run)[i],answers=run.quiz.answers[i],last=answers.at(-1),correct=!!last?.correct;
  root.innerHTML=`<section class="quiz"><p class="eyebrow">Market debrief · Recall ${i+1} of 5</p><h1 tabindex="-1">What did the<br><em>market teach you?</em></h1><p>Five quick questions about the markets you just worked through. Your first answers stay in your notebook; feedback helps you try again.</p><div class="quiz-card"><p class="quiz-topic">${STEP_LABELS[i]}</p><h2 id="question-title">${q.prompt}</h2><div class="quiz-options" role="group" aria-labelledby="question-title">${run.quiz.orders[i].map((choice,n)=>{const attempted=answers.find(a=>a.choice===choice);return `<button data-choice="${choice}" class="quiz-option ${attempted?(attempted.correct?'correct':'incorrect'):''}" ${correct||attempted?'disabled':''}><span class="option-letter">${'ABCD'[n]}</span><span>${q.options[choice]}${attempted?`<small>${attempted.correct?'✓ Correct':'Try another answer'}</small>`:''}</span></button>`;}).join('')}</div>${last?`<div class="quiz-feedback ${correct?'success':''}" tabindex="-1"><strong>${correct?'That’s it.':'Take another look.'}</strong><p>${q.explanation}</p></div>`:''}${correct?`<button class="primary" data-action="quiz-next">${i===4?'Open my notebook':'Next question'} →</button>`:''}</div><p class="quiz-progress">${i} of 5 questions finished${correct?' · this one is ready to file':''}</p></section>`;
}
function report(){
  const first=run.quiz.answers.filter(a=>a[0]?.correct).length;
  root.innerHTML=`<section class="report"><p class="eyebrow">Five market days, one bigger picture</p><h1 tabindex="-1">Your market<br><em>notebook.</em></h1><p>You built forecasts, explored a price rule, and explained the economics behind them.</p><div class="recall-summary"><div><span>Recall · first answers</span><strong>${first} / 5</strong></div><p>All five questions completed with feedback. Your first responses remain separate from retries.</p></div><div class="report-list">${allRecords(run).map((record,i)=>{const m=missionText(missions(run)[i],i),answers=run.quiz.answers[i];return `<article class="report-item"><p class="eyebrow">${m.tag}</p><h3>${m.title}</h3><p class="evidence">${record.attempts.length===1&&!record.hints?'Correct on your first forecast':'Completed with practice'} · ${record.attempts.length} forecast${record.attempts.length===1?'':'s'} · ${record.hints} hint${record.hints===1?'':'s'}</p><p>${m.debrief}</p><p class="recall-evidence">Recall: ${answers[0]?.correct?'correct on first answer':`correct after ${answers.length} answers`}.</p></article>`;}).join('')}</div><div class="actions"><button class="primary" data-action="explore">Keep exploring</button><button data-action="download">Download notebook</button><button data-action="replay">Play new scenarios</button></div><p class="hint">Completion after feedback is practice evidence, not a full mastery assessment.</p></section>`;
}
function render(){({intro,mission,explore:exploration,quiz,report}[view])();}
function policyType(){return view==='explore'?(explorePolicy||null):(isPolicy(current())?current().type:null);}
function update(){
  const isExplore=view==='explore',v=isExplore?explore:run.values,policy=policyType(),actual=isExplore||run.completed;
  for(const [key,value] of Object.entries(v)){const input=$('input-'+key);if(input&&document.activeElement!==input)input.value=value;const output=$('out-'+key);if(output)output.textContent=key==='price'?'$'+number(value):value===0?'Starting position':number(Math.abs(value))+' '+(value<0?'left':'right');}
  $('graph').innerHTML=graphMarkup(v,{explore:isExplore,locked:!isExplore&&run.completed,policy});
  const tools=isExplore||!policy?[['d','Move D'],['s','Move S'],...(!isExplore?[['e','Place E₁']]:[]),...(isExplore&&policy?[['price','Set price']]:[])]:[['price','Set price'],['qs','Place Qs'],['qd','Place Qd']];
  if($('graphTools').dataset.signature!==tools.map(t=>t[0]).join(',')){$('graphTools').innerHTML=tools.map(([key,label])=>`<button data-tool="${key}" aria-pressed="${tool===key}">${label}</button>`).join('');$('graphTools').dataset.signature=tools.map(t=>t[0]).join(',');}
  root.querySelectorAll('[data-tool]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.tool===tool));b.disabled=!isExplore&&run.completed;});
  const e=actual?market(v.d,v.s):{q:v.q,p:v.p},data=atPrice(v.price,v.d,v.s,policy||'ceiling');
  const delta=(value,base)=>value===base?'unchanged':`${value>base?'+':'−'}${number(Math.abs(value-base))}`;
  $('liveValues').innerHTML=policy&&!isExplore?`<div><span>${policy==='ceiling'?'Maximum':'Minimum'} price</span><strong>$${number(v.price)}</strong></div><div><span>Qs · offered</span><strong>${number(actual?data.qs:v.qs)}</strong></div><div><span>Qd · wanted</span><strong>${number(actual?data.qd:v.qd)}</strong></div>`:`<div><span>${isExplore?'Market-clearing':'Your E₁'} price</span><strong>$${number(e.p)} <small>${delta(e.p,60)}</small></strong></div><div><span>${isExplore?'Market-clearing':'Your E₁'} quantity</span><strong>${number(e.q)} <small>${delta(e.q,50)}</small></strong></div>`;
  const strip=$('resultStrip');strip.hidden=!(actual&&policy);
  if(!strip.hidden){const gap=policy==='ceiling'?'shortage':'surplus';strip.innerHTML=`<div>${data.binding?(gap==='shortage'?'Shortage':'Surplus'):'Price rule'}<strong>${data.binding?number(data[gap])+' crates':'Not binding'}</strong></div><div>${data.binding?'At most traded':'Equilibrium trade'}<strong>${number(data.traded)} crates</strong></div>`;}
  if(isExplore){$('explorePrice').hidden=!policy;$('exploreResult').textContent=!policy?'E marks the intersection of your current curves.':data.binding?`At $${number(v.price)}, sellers offer ${number(data.qs)} crates and buyers want ${number(data.qd)}. At most ${number(data.traded)} trade. Quantities beyond 100 are outside this graph.`:`The $${number(v.price)} ${policy} is not binding. It does not force price ${policy==='ceiling'?'up':'down'}; trade remains at the equilibrium.`;}
}
function pointFromEvent(event){const matrix=$('graph').getScreenCTM();if(!matrix)return null;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());return {q:(p.x-plot.left)/(plot.right-plot.left)*100,p:(plot.bottom-p.y)/(plot.bottom-plot.top)*120};}
function bindGraph(){
  const graph=$('graph');let drag=null;
  graph.addEventListener('pointerdown',event=>{
    if(event.button!==0||view==='mission'&&run.completed)return;
    const v=view==='explore'?explore:run.values,hit=event.target.closest('[data-drag]')?.dataset.drag,kind=hit||(['e','price','qs','qd'].includes(tool)?tool:null);
    if(!kind||view==='explore'&&['e','qs','qd'].includes(kind)||kind==='price'&&!policyType())return;
    const start=pointFromEvent(event);if(!start)return;
    drag={kind,start,value:v[kind],relative:!!hit};tool=kind;graph.setPointerCapture(event.pointerId);event.preventDefault();
    // A label is an offset handle: picking it up must not jump the value.
    if(!hit)move(event);
  });
  function move(event){if(!drag)return;const point=pointFromEvent(event);if(!point)return;const v=view==='explore'?explore:run.values;
    if(['d','s'].includes(drag.kind))v[drag.kind]=Math.round(clamp(drag.value+point.q-drag.start.q,-30,30)/5)*5;
    else if(drag.kind==='e'){v.q=Math.round(clamp(point.q,0,100));v.p=Math.round(clamp(point.p,0,120));}
    else v[drag.kind]=drag.kind==='price'?Math.round(clamp(drag.relative?drag.value+point.p-drag.start.p:point.p,0,120)):Math.round(clamp(drag.relative?drag.value+point.q-drag.start.q:point.q,0,100));
    clearFeedback();update();
  }
  graph.addEventListener('pointermove',move);
  const finish=()=>{if(drag){drag=null;if(view==='mission')save();}};
  graph.addEventListener('pointerup',finish);graph.addEventListener('pointercancel',finish);graph.addEventListener('lostpointercapture',finish);
}
root.addEventListener('input',event=>{if(event.target.type==='range')changeValue(event.target);});
root.addEventListener('change',event=>{if(event.target.type==='number')changeValue(event.target);if(event.target.id==='policySelect'){explorePolicy=event.target.value;tool='d';update();}});
function clearFeedback(){if(view==='mission'&&feedback&&!feedback.ok){feedback=null;$('feedback').hidden=true;}}
function changeValue(input){const key=input.dataset.value;if(!key||view==='mission'&&run.completed)return;const v=view==='explore'?explore:run.values,value=Number(input.value);if(input.value===''||!Number.isFinite(value)){input.value=v[key];say('Enter a number within the control’s range.');return;}v[key]=clamp(value,Number(input.min),Number(input.max));input.value=v[key];clearFeedback();update();if(view==='mission')save();}
function resume(){view=run.stage;tool=isPolicy(current())?'price':'d';render();focusHeading();}
function download(){
  const questions=quizQuestions(run),content=['MARKET SHIFT — MARKET NOTEBOOK','Practice prototype; no identity or verified grade.','',...allRecords(run).flatMap((r,i)=>{const m=missionText(missions(run)[i],i),q=questions[i];return [m.tag,m.title,m.event,`${r.attempts.length} forecast(s); ${r.hints} hint(s).`,...r.attempts.map((a,n)=>`Forecast ${n+1}: ${a.ok?'Accepted':a.code}. ${JSON.stringify(a.values)}`),m.debrief,'Recall: '+q.prompt,...run.quiz.answers[i].map((a,n)=>`Answer ${n+1}: ${q.options[a.choice]} (${a.correct?'correct':'retry'})`),''];})].join('\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain'})),a=document.createElement('a');a.href=url;a.download='market-shift-notebook.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.tool){tool=button.dataset.tool;update();say(`Selected ${button.textContent}. Use the graph or its controls.`);return;}
  if(button.dataset.choice!==undefined){if(answerQuiz(run,Number(button.dataset.choice))){save();render();const q=quizQuestions(run)[run.quiz.index];say((run.quiz.answers[run.quiz.index].at(-1).correct?'Correct. ':'Try again. ')+q.explanation);root.querySelector('[data-action=quiz-next],.quiz-feedback')?.focus();}return;}
  const action=button.dataset.action;
  if(action==='start'){save();resume();}
  if(action==='explore'){view='explore';explore=initialValues();explorePolicy='';tool='d';render();focusHeading();}
  if(action==='return'){if(saved)resume();else{view='intro';render();focusHeading();}}
  if(action==='reset'){if(view==='explore'){explore=initialValues();explorePolicy='';render();say('Exploration reset to the original market.');}else if(!run.completed){run.values=initialValues();feedback=null;save();render();say('Graph reset. Earlier forecasts remain in your notebook.');}}
  if(action==='hint'&&!run.completed){run.hints++;showHint=true;save();render();say(current().hint);}
  if(action==='check'&&!run.completed){feedback=check(current(),run.values);run.attempts.push({...feedback,values:{...run.values}});run.completed=feedback.ok;save();render();say(feedback.text);if(feedback.ok)root.querySelector('[data-action=next]').focus();}
  if(action==='next'&&run.completed){if(run.index===4){run.stage='quiz';view='quiz';}else{run.records.push({id:run.plan[run.index],values:{...run.values},attempts:run.attempts,hints:run.hints});run.index++;run.values=initialValues();run.attempts=[];run.hints=0;run.completed=false;feedback=null;showHint=false;tool=isPolicy(current())?'price':'d';}save();render();focusHeading();}
  if(action==='quiz-next'&&advanceQuiz(run)){view=run.stage;save();render();focusHeading();}
  if(action==='replay'){run=freshRun(run);feedback=null;showHint=false;view='mission';tool='d';save();render();focusHeading();}
  if(action==='download')download();
});
$('home').onclick=()=>{view='intro';render();focusHeading();};
render();
