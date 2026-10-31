import {clamp,initialValues,market,atPrice,missions,isPolicy,missionText,check,freshRun,restoreRun,quizQuestions,answerQuiz,advanceQuiz,allRecords} from './model.js';
import {plot,graphMarkup,number} from './graph.js';
import {scene} from './scene.js';
const root=document.getElementById('game'),KEY='mq-market-shift-prototype-v2';
let run=freshRun(),saved=false,view='intro',tool='d',feedback=null,showHint=false,placing=false;
let explore=initialValues(),explorePolicy='';
const $=id=>document.getElementById(id),esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=text=>{$('announcement').textContent=text;},current=()=>missionText(missions(run)[run.index],run.index);
try{const stored=localStorage.getItem(KEY);if(stored){run=restoreRun(JSON.parse(stored));saved=true;}}catch{storageWarning('The earlier browser save could not be read. This prototype will start a new market.');}
function storageWarning(message){$('storageWarning').hidden=false;$('storageWarning').textContent=message;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(run));saved=true;}catch{storageWarning('This browser could not save progress. Keep this tab open and download your notebook at the end.');}}
function focusHeading(){root.querySelector('h1,h2')?.focus();}
function intro(){
  root.innerHTML=`<section class="splash" aria-labelledby="splash-title">
    <div class="splash-art" aria-hidden="true">${scene('festival').replace('<svg ','<svg preserveAspectRatio="xMidYMid slice" ')}</div>
    <div class="splash-copy"><h1 id="splash-title" tabindex="-1">Market<br><em>Shift.</em></h1><p>Read the news. Shape your forecast.</p>
      <div class="actions"><button class="primary" data-action="start">${saved?(run.stage==='report'?'Open your notebook':'Continue your market'):'Enter Linden'} →</button><button class="quiet" data-action="explore">Explore freely</button></div>
    </div>
  </section>`;
}
function bulletin(){
  const m=current();
  root.innerHTML=`<section class="bulletin" aria-labelledby="bulletin-heading">
    <header class="bulletin-masthead"><p>Market day ${run.index+1} of 5</p><h1 id="bulletin-heading" tabindex="-1">The Linden Bulletin</h1></header>
    <div class="bulletin-layout"><div class="scene-frame">${scene(m.art,isPolicy(m)?m:null)}</div><article><h2>${m.title}</h2><p>${m.event}</p><button class="primary" data-action="forecast">${run.bulletinRead?'Back to your forecast':'Make your forecast'} →</button></article></div>
  </section>`;
}
const storyNames={
  'festival-buyers':'Festival day','recipe-buzz':'Recipe rush','apple-sale':'Apple season','cancelled-fair':'A quiet weekend',
  'storm-crop':'Storm watch','fuel-costs':'Fuel squeeze','bumper-crop':'Harvest time','cold-storage':'Fresh thinking',
  'festival-harvest':'A full square','recipe-storage':'Fresh favorites','fair-storm':'Double trouble','sale-fuel':'Mixed news',
  'festival-storm':'Crowds & clouds','recipe-fuel':'A costly favorite','sale-harvest':'Plenty to spare','fair-storage':'A quieter harvest'
};
const storyName=m=>storyNames[m.id]||(m.type==='ceiling'?'The price promise':'The price guarantee');
const range=(key,label,min,max,step=5)=>`<div class="control-group"><label class="control-label" for="input-${key}"><span>${label}</span><output id="out-${key}" for="input-${key}" aria-hidden="true"></output></label><input id="input-${key}" data-value="${key}" type="range" min="${min}" max="${max}" step="${step}"></div>`;
const numeric=(key,label,max,delta=false)=>`<label for="input-${key}"><span>${label}</span><input id="input-${key}" data-value="${key}" type="number" min="0" max="${max}" step="1" inputmode="decimal" ${delta?`aria-describedby="delta-${key}"`:''}>${delta?`<small id="delta-${key}"></small>`:''}</label>`;
function graphHelp(isExplore=false){
  const policy=isExplore?!!explorePolicy:isPolicy(current());
  return `<details class="graph-help"><summary>Graph help</summary><p>${isExplore?'Drag either curve to explore. E follows the intersection.':policy?'Drag the purple price label, then drag Qs and Qd to the two intersections.':'Drag either curve or its D/S handle. Move E₁ to your forecast intersection.'}</p><p>${policy&&!isExplore?'Qs is the quantity sellers offer; Qd is what buyers want.':'Sliders shift curves horizontally: negative values move left, positive values move right.'} You can also ${isExplore?'use the sliders':'type values into the fields above the graph'}.</p><p>The gray dashed curves show the original market: $60 and 50 crates.</p><div id="graphTools" class="graph-tools" role="group" aria-label="Click placement tool"></div></details>`;
}
function graphCard(isExplore=false){
  const policy=isExplore?!!explorePolicy:isPolicy(current()),locked=!isExplore&&run.completed;
  const title=isExplore?'Market equilibrium':policy?'Quantities at the legal price':'Your equilibrium · E₁';
  return `<section class="graph-card" aria-labelledby="graph-heading">
    <div class="graph-top"><h3 id="graph-heading">${title}</h3></div>
    ${isExplore?'<div id="liveValues" class="live-values" aria-label="Current market coordinates"></div>':`<fieldset id="forecastFields" class="forecast-fields" ${locked?'disabled':''}><legend class="sr-only">${title}</legend><div id="liveValues" class="live-values forecast-values">${policy?numeric('qs','Qs · crates offered',100)+numeric('qd','Qd · crates wanted',100):numeric('p','Price · $ per crate',120,true)+numeric('q','Quantity · crates',100,true)}</div></fieldset>`}
    <div class="graph-legend"><span><i class="d-key"></i>D · Demand</span><span><i class="s-key"></i>S · Supply</span><span><i class="base-key"></i>Before</span></div>
    <svg id="graph" class="graph" viewBox="0 0 760 440" role="img" aria-labelledby="graph-title graph-desc"></svg>
    <div id="resultStrip" class="result-strip" hidden></div>
  </section>`;
}
function mission(){
  const m=current(),policy=isPolicy(m);
  root.innerHTML=`<ol class="progress" aria-label="Mission progress">${missions(run).map((item,i)=>`<li class="${i===run.index?'active':i<run.index?'done':''}" ${i===run.index?'aria-current="step"':''}><span class="step-number">${i<run.index?'✓':i+1}</span><span>${storyName(item)}</span></li>`).join('')}</ol>
    <section class="forecast-brief"><div><h2 tabindex="-1">${m.title}</h2><button class="quiet" data-action="bulletin">Read bulletin</button></div><div class="scene-frame">${scene(m.art,policy?m:null)}</div></section>
    <div class="workbench">${graphCard()}<aside class="controls" aria-labelledby="task-title">
      <h3 id="task-title" class="task">${run.completed?'✓ Forecast filed':policy?'Set the legal price':'Adjust the curves'}</h3>
      <fieldset id="inputFields" ${run.completed?'disabled':''}><legend class="sr-only">Graph adjustments</legend>${policy?range('price',m.type==='ceiling'?'Maximum price':'Minimum price',0,120,1):range('d','Demand',-30,30)+range('s','Supply',-30,30)}</fieldset>
      ${run.completed?'':`<button class="primary" data-action="check">Check forecast</button><div class="control-actions"><button data-action="hint">Hint</button><button data-action="reset">Reset</button></div>`}
      <p id="feedback" class="feedback" role="status" ${feedback&&!feedback.ok?'':'hidden'}>${esc(feedback?.text||'')}</p><p class="hint" ${showHint&&!run.completed?'':'hidden'}>${m.hint}</p>
      ${graphHelp()}
    </aside></div>
    ${run.completed?`<section class="debrief"><div><h3>${m.concept}</h3><p>${m.debrief}</p>${!policy?'<details class="model-note"><summary>About these numbers</summary><p>The numbers illustrate the shifts you drew. The news establishes direction, not exact size. Each bulletin starts from the original market.</p></details>':''}</div><button class="primary" data-action="next">${run.index===4?'Try the quiz':'Next market day'} →</button></section>`:''}`;
  bindGraph();update();
}
function exploration(){
  root.innerHTML=`<section class="explore-head"><div><p class="eyebrow">Explore</p><h2 tabindex="-1">What moves the market?</h2></div><button data-action="return">${saved?'Back to your market':'Back to Market Shift'}</button></section>
    <div class="workbench">${graphCard(true)}<aside class="controls"><h3>Adjust the curves</h3>${range('d','Demand',-30,30)}${range('s','Supply',-30,30)}
      <div class="control-group"><label for="policySelect">Price rule</label><select id="policySelect"><option value="">No price control</option><option value="ceiling" ${explorePolicy==='ceiling'?'selected':''}>Price ceiling · maximum</option><option value="floor" ${explorePolicy==='floor'?'selected':''}>Price floor · minimum</option></select><div id="explorePrice" ${explorePolicy?'':'hidden'}>${range('price','Legal price',0,120,1)}</div><p id="exploreResult" class="explore-result"></p></div>
      <button data-action="reset">Reset market</button>${graphHelp(true)}
    </aside></div>`;
  bindGraph();update();
}
function quiz(){
  const i=run.quiz.index,q=quizQuestions(run)[i],m=missions(run)[i],answers=run.quiz.answers[i],last=answers.at(-1),correct=!!last?.correct;
  root.innerHTML=`<section class="quiz"><p class="eyebrow">Market debrief · Question ${i+1} of 5</p><h1 tabindex="-1">Read the market.</h1>
    <div class="quiz-card"><section class="quiz-bulletin" aria-labelledby="quiz-story-title"><p class="eyebrow">From the bulletin</p><h3 id="quiz-story-title">${m.title}</h3><p id="quiz-event">${m.event}</p></section>
      <h2 id="question-title">${q.prompt}</h2><div class="quiz-options" role="group" aria-labelledby="question-title" aria-describedby="quiz-event">${run.quiz.orders[i].map((choice,n)=>{const attempted=answers.find(a=>a.choice===choice);return `<button data-choice="${choice}" class="quiz-option ${attempted?(attempted.correct?'correct':'incorrect'):''}" ${correct||attempted?'disabled':''}><span class="option-letter">${'ABCD'[n]}</span><span>${q.options[choice]}${attempted?`<small>${attempted.correct?'✓ Correct':'Try another answer'}</small>`:''}</span></button>`;}).join('')}</div>
      ${last?`<div class="quiz-feedback ${correct?'success':''}" tabindex="-1"><strong>${correct?'That’s it.':'Take another look.'}</strong><p>${q.explanation}</p></div>`:''}
      ${correct?`<button class="primary" data-action="quiz-next">${i===4?'Open my notebook':'Next question'} →</button>`:''}
    </div>
  </section>`;
}
function report(){
  const first=run.quiz.answers.filter(a=>a[0]?.correct).length;
  root.innerHTML=`<section class="report"><p class="eyebrow">Five market days, one bigger picture</p><h1 tabindex="-1">Your market<br><em>notebook.</em></h1><p>You built forecasts, explored a price rule, and explained the economics behind them.</p><div class="recall-summary"><div><span>Quiz · first answers</span><strong>${first} / 5</strong></div><p>All five questions completed with feedback. Your first responses remain separate from retries.</p></div><div class="report-list">${allRecords(run).map((record,i)=>{const m=missionText(missions(run)[i],i),answers=run.quiz.answers[i];return `<article class="report-item"><p class="eyebrow">${m.tag}</p><h3>${m.title}</h3><p class="evidence">${record.attempts.length===1&&!record.hints?'Correct on your first forecast':'Completed with practice'} · ${record.attempts.length} forecast${record.attempts.length===1?'':'s'} · ${record.hints} hint${record.hints===1?'':'s'}</p><p>${m.debrief}</p><p class="recall-evidence">Quiz: ${answers[0]?.correct?'correct on first answer':`correct after ${answers.length} answers`}.</p></article>`;}).join('')}</div><div class="actions"><button class="primary" data-action="explore">Keep exploring</button><button data-action="download">Download notebook</button><button data-action="replay">Play new scenarios</button></div><p class="hint">Completion after feedback is practice evidence, not a full mastery assessment.</p></section>`;
}
function render(){placing=false;document.body.dataset.view=view;$('home').hidden=view==='intro';({intro,bulletin,mission,explore:exploration,quiz,report}[view])();}
function policyType(){return view==='explore'?(explorePolicy||null):(isPolicy(current())?current().type:null);}
function update(){
  const isExplore=view==='explore',v=isExplore?explore:run.values,policy=policyType(),actual=isExplore||run.completed;
  const e=actual?market(v.d,v.s):{q:v.q,p:v.p},data=atPrice(v.price,v.d,v.s,policy||'ceiling');
  const displayed={...v,...(!isExplore&&run.completed?(policy?{qs:data.qs,qd:data.qd}:{q:e.q,p:e.p}):{})};
  for(const [key,value] of Object.entries(displayed)){
    const input=$('input-'+key);if(input&&input.value!==String(value))input.value=value;
    const output=$('out-'+key);if(output)output.textContent=key==='price'?'$'+number(value):`${value>0?'+':''}${number(value)}`;
    if(input?.type==='range')input.setAttribute('aria-valuetext',key==='price'?`$${number(value)} per crate`:value===0?'Original position':`${number(Math.abs(value))} crates ${value<0?'left':'right'} of the original curve`);
  }
  $('graph').innerHTML=graphMarkup(v,{explore:isExplore,locked:!isExplore&&run.completed,policy});
  const tools=isExplore?(policy?[['price','Set price']]:[]):policy?[['price','Set price'],['qs','Place Qs'],['qd','Place Qd']]:[['e','Place E₁']];
  if($('graphTools').dataset.signature!==tools.map(t=>t[0]).join(',')){$('graphTools').innerHTML=tools.map(([key,label])=>`<button data-tool="${key}" aria-pressed="${tool===key}">${label}</button>`).join('');$('graphTools').dataset.signature=tools.map(t=>t[0]).join(',');}
  root.querySelectorAll('[data-tool]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.tool===tool));b.disabled=!isExplore&&run.completed;});
  const delta=(value,base)=>value===base?'Unchanged':`${value>base?'+':'−'}${number(Math.abs(value-base))} from start`;
  if(isExplore)$('liveValues').innerHTML=`<div><span>Price · $ per crate</span><strong>$${number(e.p)}</strong><small>${delta(e.p,60)}</small></div><div><span>Quantity · crates</span><strong>${number(e.q)}</strong><small>${delta(e.q,50)}</small></div>`;
  else if(!policy){$('delta-p').textContent=delta(e.p,60);$('delta-q').textContent=delta(e.q,50);}
  const strip=$('resultStrip');strip.hidden=!(actual&&policy);
  if(!strip.hidden){const gap=policy==='ceiling'?'shortage':'surplus';strip.innerHTML=`<div>${data.binding?(gap==='shortage'?'Shortage':'Surplus'):'Price rule'}<strong>${data.binding?number(data[gap])+' crates':'Not binding'}</strong></div><div>${data.binding?'At most traded':'Equilibrium trade'}<strong>${number(data.traded)} crates</strong></div>`;}
  if(isExplore){
    $('explorePrice').hidden=!policy;$('exploreResult').hidden=!policy;
    $('exploreResult').textContent=!policy?'':data.binding?`At $${number(v.price)}: sellers offer ${number(data.qs)} crates; buyers want ${number(data.qd)}.`:`The $${number(v.price)} ${policy} is not binding. It does not force price ${policy==='ceiling'?'up':'down'}; trade remains at the equilibrium.`;
  }
}
function pointFromEvent(event){const matrix=$('graph').getScreenCTM();if(!matrix)return null;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());return {q:(p.x-plot.left)/(plot.right-plot.left)*100,p:(plot.bottom-p.y)/(plot.bottom-plot.top)*120};}
function bindGraph(){
  const graph=$('graph');let drag=null;
  graph.addEventListener('pointerdown',event=>{
    if(event.button!==0||view==='mission'&&run.completed)return;
    const v=view==='explore'?explore:run.values,hit=event.target.closest('[data-drag]')?.dataset.drag,kind=placing?tool:hit||(['e','price','qs','qd'].includes(tool)?tool:null),useHandle=!placing&&!!hit;
    if(!kind||view==='explore'&&['e','qs','qd'].includes(kind)||kind==='price'&&!policyType())return;
    const start=pointFromEvent(event);if(!start)return;
    placing=false;drag={kind,start,value:v[kind],relative:useHandle};tool=kind;graph.setPointerCapture(event.pointerId);event.preventDefault();
    // A label is an offset handle: picking it up must not jump the value.
    if(!useHandle)move(event);
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
function resume(){view=run.stage==='mission'&&!run.bulletinRead?'bulletin':run.stage;tool=isPolicy(current())?'price':'d';render();focusHeading();}
function download(){
  const questions=quizQuestions(run),content=['MARKET SHIFT — MARKET NOTEBOOK','Practice prototype; no identity or verified grade.','',...allRecords(run).flatMap((r,i)=>{const m=missionText(missions(run)[i],i),q=questions[i];return [m.tag,m.title,m.event,`${r.attempts.length} forecast(s); ${r.hints} hint(s).`,...r.attempts.map((a,n)=>`Forecast ${n+1}: ${a.ok?'Accepted':a.code}. ${JSON.stringify(a.values)}`),m.debrief,'Quiz: '+q.prompt,...run.quiz.answers[i].map((a,n)=>`Answer ${n+1}: ${q.options[a.choice]} (${a.correct?'correct':'retry'})`),''];})].join('\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain'})),a=document.createElement('a');a.href=url;a.download='market-shift-notebook.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.tool){tool=button.dataset.tool;placing=true;update();say(`Selected ${button.textContent}. Click the graph to place it.`);return;}
  if(button.dataset.choice!==undefined){if(answerQuiz(run,Number(button.dataset.choice))){save();render();const q=quizQuestions(run)[run.quiz.index];say((run.quiz.answers[run.quiz.index].at(-1).correct?'Correct. ':'Try again. ')+q.explanation);root.querySelector('[data-action=quiz-next],.quiz-feedback')?.focus();}return;}
  const action=button.dataset.action;
  if(action==='start'){save();resume();}
  if(action==='forecast'){run.bulletinRead=true;save();resume();}
  if(action==='bulletin'){view='bulletin';render();focusHeading();}
  if(action==='explore'){view='explore';explore=initialValues();explorePolicy='';tool='d';render();focusHeading();}
  if(action==='return'){if(saved)resume();else{view='intro';render();focusHeading();}}
  if(action==='reset'){if(view==='explore'){explore=initialValues();explorePolicy='';render();say('Exploration reset to the original market.');}else if(!run.completed){run.values=initialValues();feedback=null;save();render();say('Graph reset. Earlier forecasts remain in your notebook.');}}
  if(action==='hint'&&!run.completed){run.hints++;showHint=true;save();render();say(current().hint);}
  if(action==='check'&&!run.completed){feedback=check(current(),run.values);run.attempts.push({...feedback,values:{...run.values}});run.completed=feedback.ok;save();render();say(feedback.text);if(feedback.ok)root.querySelector('[data-action=next]').focus();}
  if(action==='next'&&run.completed){if(run.index===4){run.stage='quiz';view='quiz';}else{run.records.push({id:run.plan[run.index],values:{...run.values},attempts:run.attempts,hints:run.hints});run.index++;run.bulletinRead=false;view='bulletin';run.values=initialValues();run.attempts=[];run.hints=0;run.completed=false;feedback=null;showHint=false;tool=isPolicy(current())?'price':'d';}save();render();focusHeading();}
  if(action==='quiz-next'&&advanceQuiz(run)){view=run.stage;save();render();focusHeading();}
  if(action==='replay'){run=freshRun(run);feedback=null;showHint=false;view='bulletin';tool='d';save();render();focusHeading();}
  if(action==='download')download();
});
$('home').onclick=()=>{view='intro';render();focusHeading();};
render();
