import {finalReport} from './results-view.js';
import {FIRST,SECOND,BUDGET,RATE,WAIT_FEE,BULLETIN_ACCURACY} from './data.js';
import {Game,npv,expected,breakeven,zeroNPVUnits,informationValue} from './engine.js';
import {FIRST_LIBRARY} from './first-library.js';
import {projectValue} from './first-scenario.js';
import {firstDesk,firstReport as renderFirstReport} from './first-view.js';
const root=document.querySelector('#game'),dialog=document.querySelector('#project-dialog');
const money=v=>`${v<0?'−':''}$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;
const pct=v=>`${(v*100).toFixed(1).replace('.0','')}%`;
const signed=v=>`<span class="${v<0?'negative':'positive'}">${money(v)}</span>`;
const names=ids=>ids.length?ids.map(id=>[...FIRST_LIBRARY,...SECOND].find(p=>p.id===id).name).join(', '):'None';
// Related Second Quest ventures share their sector's illustration.
const secondArt={distribution:'warehouse',medical:'scanner',development:'property',packing:'processing'};
function art(p){const file=secondArt[p.id]||p.icon;return `<div class="art" aria-hidden="true"><img src="./assets/cards/${file}.webp" alt="" width="768" height="512" decoding="async"></div>`;}
const button=(action,label,disabled=false,primary=false,id='')=>`<button data-action="${action}" ${id?`data-id="${id}" aria-label="${label.replace(' ↗','')}: ${names([id])}"`:''} ${disabled?'disabled':''} ${primary?'class="primary"':''}>${label}</button>`;
const requested=new URLSearchParams(location.search).get('seed');
const seed=requested!==null&&/^\d+$/.test(requested)&&Number(requested)<=0xffffffff?Number(requested):crypto.getRandomValues(new Uint32Array(1))[0];
let game=new Game(seed),inspected=null,runID=crypto.randomUUID(),cardIndex=0,viewingFirst=false;
const firstUI={money,signed,button,art};
function persist(){
  try{
    const key='mq.investment-desk.runs.v1',runs=JSON.parse(localStorage.getItem(key)||'[]');
    const record={gameID:'the-investment-desk',version:1,runID,seed:game.seed,events:game.history};
    localStorage.setItem(key,JSON.stringify([record,...(Array.isArray(runs)?runs:[]).filter(r=>r.runID!==runID)].slice(0,5)));
  }catch{const el=document.querySelector('#storage-warning');el.hidden=false;el.textContent='Local history could not be saved. You can continue playing in this tab.';}
}
function heading(kicker,title,text,badge=''){return `<header class="stage-heading"><div>${kicker?`<p class="eyebrow">${kicker}</p>`:''}<h2 id="stage-title" tabindex="-1">${title}</h2><p>${text}</p></div>${badge?`<span class="stage-badge">${badge}</span>`:''}</header>`;}
function intro(){return `<section class="hero splash"><h1 id="stage-title" tabindex="-1"><span class="splash-overline">The</span>Investment <em>Desk</em></h1><div class="splash-art" aria-hidden="true">${art(FIRST[0])}</div>${button('start','Take your seat →',false,true)}</section>`;}
function budget(){const invested=SECOND.filter(p=>game.second[p.id]?.status==='invested').reduce((sum,p)=>sum+p.cost,0);return `<section class="budget-bar" aria-label="Capital budget"><div><small>Available capital</small><strong>${money(game.remaining())}</strong></div><div><small>Capital invested</small><strong>${money(invested)}</strong></div><div><small>Research + waiting paid</small><strong>${money(game.fees)}</strong></div></section>`;}
function card(p,isSecond){
  const record=game.second[p.id],selected=isSecond?record?.status==='invested':game.selected.includes(p.id),value=isSecond?record?.forecast??expected(p,game.probability(p)):projectValue(p);
  const status=isSecond?(record?.status==='invested'?'Capital committed':record?.status==='waiting'?(game.window===1?'Waiting for bulletin':'Open after waiting'):record?.status==='rejected'?'Rejected':record?.research?'Research received':'Open proposal'):(selected?'In your portfolio':'Open proposal');
  return `<article class="card ${p.color} ${selected?'selected':''} ${record?.status==='rejected'?'rejected':''}" aria-labelledby="card-${p.id}">${art(p)}<div class="card-copy"><span class="company">${p.company}</span><h3 id="card-${p.id}">${p.name}</h3><p>${p.description}</p><div class="card-stats"><div><small>Investment</small><strong>${money(p.cost)}</strong></div><div><small>${isSecond?'Expected NPV':'Projected NPV'}</small><strong>${signed(value)}</strong></div></div><p class="status">${selected?'✓ ':''}${status}</p>${button('inspect',`Inspect ${isSecond&&record?.research?'report':'proposal'} ↗`,false,false,p.id)}</div></article>`;
}
function desk(){
  if(game.phase==='first')return firstDesk(game,firstUI,cardIndex);
  const second=game.phase==='second',projects=second?SECOND:FIRST,selected=projects.filter(p=>second?game.second[p.id]?.status==='invested':game.selected.includes(p.id));
  let body=heading('','The numbers aren’t promises.','A fresh $250,000. Fund any number of proposals, or keep your cash. Research is optional; investments are binding.');
  if(second)body+=game.window===1?`<div class="bulletin"><h3>Opening outlook · ${pct(game.prior)} chance of a strong economy</h3><p>Projects share the same economy. You may pay ${money(WAIT_FEE)} per proposal to decide after a market bulletin, or finish now.</p></div>`:`<div class="bulletin"><h3>Market bulletin · ${game.bulletin?'Retail orders strengthen':'Businesses cut expansion plans'}</h3><p>Forecasts for held proposals now include this imperfect signal. Earlier investments remain committed.</p></div>`;
  body+=budget()+`<div class="desk-layout"><section class="cards" aria-label="Investment proposals">${projects.map(p=>card(p,second)).join('')}</section><aside class="portfolio"><p class="eyebrow">Your portfolio</p><h3>${selected.length} funded proposal${selected.length===1?'':'s'}</h3>${selected.length?selected.map(p=>`<div class="slot">${p.name}<small>${money(p.cost)} committed</small>${!second?button('toggle','Remove',false,false,p.id):''}</div>`).join(''):'<div class="slot empty">An open desk.<br>Your choices go here.</div>'}`;
  if(!second)body+=`<p>Keeping cash is allowed. Aim for the greatest combined NPV, not the biggest single project.</p>${button('confirm-first','Review & commit →',false,true)}`;
  else {
    const pending=SECOND.filter(p=>game.window===1?!game.second[p.id]?.status:game.second[p.id]?.status==='waiting').length;
    const waiting=SECOND.filter(p=>game.second[p.id]?.status==='waiting').length;
    body+=`<p>One investment is enough. Research is optional. Unspent capital stays as cash.</p>${button('confirm-finish','Finish portfolio →',false,true)}${game.window===1&&waiting?button('advance','Read market bulletin →'):''}<p class="portfolio-tip">${pending||waiting?'Finishing passes on all open or held proposals.':'Ready to see your results.'}${game.fees?' Fees already paid are not refunded.':''}</p>`;
  }
  return body+'</aside></div>';
}
function firstReport(){return renderFirstReport(game,firstUI,viewingFirst);}
function flowDetails(p,isSecond){
  if(!isSecond)return `<ul class="financial-list">${p.flows.map((v,i)=>`<li><span>Year ${i+1} net cash flow</span><strong>${money(v)}</strong></li>`).join('')}</ul><p>${p.duration}-year project · ${pct(p.rate)} annual discount rate · cash flows at year end. Independent, fully funded projects only; no borrowing.</p><p>${p.assumptions}</p>`;
  const prob=game.probability(p);return `<p>Favorable outcome: <strong>${pct(prob)}</strong>. Adverse outcome: <strong>${pct(1-prob)}</strong>. These are current information estimates, not promises.</p><ul class="financial-list">${p.good.map((v,i)=>`<li><span>Year ${i+1} · favorable / adverse</span><strong>${money(v)} / ${money(p.bad[i])}</strong></li>`).join('')}</ul><p>Scenario NPVs: ${signed(npv(p.cost,p.good))} favorable; ${signed(npv(p.cost,p.bad))} adverse. Three years · 10% annual discount rate · year-end net cash flows.</p><details><summary>How are these probabilities updated?</summary><p>Before signals, this project has a ${pct(p.success[0])} chance of a favorable outcome in a strong economy and ${pct(p.success[1])} in a soft economy. The opening chance of a strong economy is ${pct(game.prior)}. The bulletin identifies the economy correctly ${pct(BULLETIN_ACCURACY)} of the time.</p><p>Research identifies this project’s favorable or adverse outcome correctly ${pct(p.research.accuracy)} of the time in either case. We update probabilities with Bayes’ rule. Research and the bulletin are generated from the hidden project outcome and economy, respectively. Because projects share the economy, reports on other projects also update this forecast. Selecting several projects does not remove shared market risk.</p></details>`;
}
function demand(p){const prob=game.probability(p),q=prob*p.operations.goodUnits+(1-prob)*p.operations.badUnits;return `<section class="research"><h3>Will enough cases sell?</h3><svg class="demand-plot" viewBox="0 0 520 140" role="img" aria-label="Annual demand ranges from 2,500 to 6,000 cases. Operating breakeven is 3,000 cases. Expected sales are ${Math.round(q)} cases."><path d="M30 75H490" stroke="#4c6a77" stroke-width="8"/><path d="M${30+2500/7000*460} 75H${30+6000/7000*460}" stroke="#86d6c8" stroke-width="8"/><path d="M${30+3000/7000*460} 38V100" stroke="#edcd89" stroke-width="3"/><circle cx="${30+q/7000*460}" cy="75" r="8" fill="#fff"/><text x="30" y="125">0 cases</text><text x="420" y="125">7,000</text><text x="130" y="25">Breakeven: 3,000</text></svg><p><strong>Expected sales: ${Math.round(q).toLocaleString('en-US')} cases/year.</strong><br>Demand range: 2,500–6,000 · operating breakeven: ${breakeven(p).toLocaleString('en-US')} cases.</p><details><summary>Operating costs and investment recovery</summary><p>Price ${money(p.operations.price)} per case − variable cost ${money(p.operations.variable)} = $20 contribution. Fixed operating cost is ${money(p.operations.fixed)} a year. $60,000 ÷ $20 = 3,000 cases covers operations only.</p><p>The investment’s zero-NPV threshold is about <strong>${Math.ceil(zeroNPVUnits(p)).toLocaleString('en-US')} cases/year</strong> sold at a constant level for three years, using discounted cash flows and the ${money(p.cost)} initial cost. Information fees are separate. Operating breakeven does not recover the initial investment.</p></details></section>`;}
function inspect(id){
  const second=game.phase==='second',p=(second?SECOND:game.first.projects).find(x=>x.id===id);if(!p)return;
  dialog.classList.toggle('first-modal',!second);
  inspected=id;const r=game.second[id],available=second&&game.available(p),value=second?r?.forecast??expected(p,game.probability(p)):projectValue(p);
  dialog.innerHTML=`<div class="close-row">${button('close','Close ×')}</div><p class="eyebrow">${p.company} / Proposal</p><h2 id="detail-title">${p.name}</h2>${art(p)}<p>${p.description}</p><div class="facts"><div><small>Initial investment</small><strong>${money(p.cost)}</strong></div><div><small>${r?.status==='invested'?'Expected NPV at commitment':'Expected NPV'}</small><strong>${signed(value)}</strong></div></div>${second&&r?.status==='invested'?'<div class="note">Investment committed. Later signals cannot undo this decision.</div>':''}<details><summary>Cash flows, timing & assumptions</summary>${flowDetails(p,second)}</details>${p.operations?demand(p):''}`;
  if(second){
    if(r?.research)dialog.innerHTML+=`<section class="research"><h3>${r.research.positive?'Encouraging':'Cautionary'} research signal</h3><p class="research-result">${p.research.name} received. Expected NPV changed from ${money(r.research.before)} to ${money(r.research.after)} at purchase. A signal is evidence, not certainty.</p><p>${money(p.research.cost)} paid once, even if you reject the project. Project NPVs exclude this separate fee.</p></section>`;
    else if(available)dialog.innerHTML+=`<details class="research optional-research"><summary>Optional research · ${money(p.research.cost)}</summary><h3>${p.research.name}</h3><p>${money(p.research.cost)} · ${pct(p.research.accuracy)} signal accuracy. Receive an encouraging or cautionary signal before deciding.</p><label for="research-intent">Your tentative plan before research</label><select id="research-intent"><option value="undecided">Still undecided</option><option value="invest">Leaning toward investing</option><option value="reject">Leaning toward rejecting</option></select>${button('research',`Purchase research · ${money(p.research.cost)}`,p.research.cost>game.remaining(),false,id)}<details><summary>Is this information worth its price?</summary><p>For this project alone, before paying, the expected improvement from choosing invest or reject after this signal is ${money(informationValue(p,game.probability(p)))}. Compare that with the ${money(p.research.cost)} fee. This estimate ignores competition for the portfolio budget.</p></details></details>`;
    if(available)dialog.innerHTML+=`<p>${game.window===1?'Investing now is binding. Waiting retains this proposal until the bulletin at a nonrefundable $2,000 fee. Rejection is final.':'The bulletin is available. Invest or pass on this held proposal.'}</p><div class="actions">${button('invest',`Invest · ${money(p.cost)}`,p.cost>game.remaining(),true,id)}${game.window===1?button('wait','Wait · $2,000',WAIT_FEE>game.remaining(),false,id):''}${button('reject','Reject',false,false,id)}</div>${p.cost>game.remaining()?'<p>Not enough available capital to fund this proposal.</p>':''}`;
    else if(r?.status==='waiting'&&game.window===1)dialog.innerHTML+='<div class="note">This proposal is held until the market bulletin. Read the bulletin from your portfolio, or finish without funding this proposal.</div>';
    else if(r?.status==='rejected')dialog.innerHTML+='<div class="note">Proposal rejected. Any information fees remain paid.</div>';
  }else dialog.innerHTML+=`<p class="modal-terms">${p.duration}-year project · ${pct(p.rate)} discount rate</p><details class="rate-explanation"><summary>What does the discount rate mean?</summary><p>The discount rate reflects the return capital could earn in an alternative investment of comparable risk.</p></details><div class="actions">${button('toggle',game.selected.includes(id)?'Remove from portfolio':`Fund · ${money(p.cost)}`,!game.selected.includes(id)&&p.cost>game.remaining(),true,id)}${button('close','Leave on desk')}</div>${!game.selected.includes(id)&&p.cost>game.remaining()?'<p>Not enough capital. Remove another project before funding this one.</p>':''}`;
  if(!dialog.open)dialog.showModal();
}
function researchReview(p){const r=game.second[p.id];if(!r?.research)return 'No research purchased.';const a=r.research,choice=r.status==='invested'?'invest':'reject';return `${p.research.name}: ${money(p.research.cost)}. Its signal moved expected NPV from ${money(a.before)} to ${money(a.after)} when purchased. ${Math.sign(a.before)!==Math.sign(a.after)?'It reversed the invest-versus-reject recommendation for this project alone.':'It did not reverse the invest-versus-reject recommendation for this project alone.'} You ultimately ${r.status==='invested'?'invested':'rejected'}. ${a.intent==='undecided'?'You were undecided before research, so no reversal of an intended choice is recorded.':a.intent===choice?'Your final choice matched your tentative plan before research.':'Your final choice changed from your tentative plan before research; later signals or budget constraints may also have contributed.'}`;}
function reveal(){const outcome=game.outcomes[game.revealIndex],p=SECOND.find(p=>p.id===outcome.id);return `<section class="outcome">${heading('',p.name,'Your investment outcome')}${art(p)}<div class="facts"><div><small>Expected NPV at decision</small><strong>${signed(outcome.forecast)}</strong></div><div><small>Realized project NPV</small><strong>${signed(outcome.realized)}</strong></div></div><h3>${outcome.success?'Favorable outcome':'Adverse outcome'}</h3><p>${p.outcomes[outcome.success?0:1]}</p>${button('next',game.revealIndex+1===game.outcomes.length?'See investment results →':'Reveal next project →',false,true)}</section>`;}
function report(){return finalReport(game,firstUI,researchReview);}
function render(focus=true){
  document.body.classList.toggle('second',!viewingFirst&&['second','reveal','report'].includes(game.phase));
  document.body.classList.toggle('intro-screen',game.phase==='intro');
  document.body.classList.toggle('first-screen',game.phase==='first');
  document.body.classList.toggle('results-screen',!viewingFirst&&game.phase==='report');
  root.innerHTML=viewingFirst?firstReport():game.phase==='intro'?intro():['first','second'].includes(game.phase)?desk():game.phase==='firstReport'?firstReport():game.phase==='reveal'?reveal():report();
  if(!viewingFirst&&['second','reveal','report'].includes(game.phase))root.insertAdjacentHTML('afterbegin',`<div class="prior-review">${button('review-first','Review earlier portfolio')}</div>`);
  if(focus)document.querySelector('#stage-title')?.focus({preventScroll:false});
}
function announce(text){document.querySelector('#announcement').textContent=text;}
function handle(event){
  const b=event.target.closest('button[data-action]');if(!b||b.disabled)return;const {action,id}=b.dataset;
  if(action==='close'){dialog.close();return;}
  if(action==='review-first'||action==='return-second'){viewingFirst=action==='review-first';render();return;}
  if(action==='previous-card'||action==='next-card'){
    cardIndex=(cardIndex+(action==='next-card'?1:5))%6;
    root.querySelectorAll('.first-card').forEach((el,i)=>el.classList.toggle('active',i===cardIndex));
    root.querySelector('.carousel-nav [role="status"]').textContent=`Proposal ${cardIndex+1} of 6: ${game.first.projects[cardIndex].name}`;
    return;
  }
  if(action==='inspect'){game.log('project_inspected',{id});inspect(id);persist();return;}
  if(action==='confirm-first'){
    inspected=null;dialog.classList.add('first-modal');
    dialog.innerHTML=`<h2 id="detail-title">Commit this portfolio?</h2><p>${names(game.selected)}.</p><p>${money(game.firstResult().cost)} invested · ${money(game.firstResult().remaining)} uncommitted · ${money(game.firstResult().value)} combined NPV.</p><p>After commitment, your allocation is final. You can review the results before continuing.</p><div class="actions">${button('commit-first','Commit portfolio',false,true)}${button('close','Keep drafting')}</div>`;dialog.showModal();return;
  }
  if(action==='confirm-finish'){
    const funded=SECOND.filter(p=>game.second[p.id]?.status==='invested'),open=SECOND.filter(p=>!['invested','rejected'].includes(game.second[p.id]?.status));
    inspected=null;dialog.classList.add('first-modal');
    dialog.innerHTML=`<h2 id="detail-title">Finish with ${funded.length} investment${funded.length===1?'':'s'}?</h2><p>${funded.length?names(funded.map(p=>p.id)):'You are keeping your capital out of projects.'}</p><p>${money(game.remaining())} stays uncommitted. ${money(game.fees)} in fees already paid.</p>${open.length?`<p>You will pass on: <strong>${names(open.map(p=>p.id))}</strong>. No more research or waiting fees will be charged.</p>`:''}<div class="actions">${button('finish','Finish & show results',false,true)}${button('close','Keep deciding')}</div>`;dialog.showModal();return;
  }
  if(action==='advance'&&SECOND.some(p=>!game.second[p.id]?.status)){
    const open=SECOND.filter(p=>!game.second[p.id]?.status);
    inspected=null;dialog.classList.add('first-modal');
    dialog.innerHTML=`<h2 id="detail-title">Read the market bulletin?</h2><p>Your paid holds stay open. You will pass on the remaining proposals: <strong>${names(open.map(p=>p.id))}</strong>.</p><div class="actions">${button('proceed-advance','Pass on these & read bulletin',false,true)}${button('close','Keep deciding')}</div>`;dialog.showModal();return;
  }
  if(action==='research'){if(game.research(id,dialog.querySelector('#research-intent').value)){render(false);inspect(id);dialog.querySelector('.research h3')?.setAttribute('tabindex','-1');dialog.querySelector('.research h3')?.focus();announce(`Research received for ${names([id])}. ${money(game.remaining())} capital remains.`);persist();}return;}
  if(action==='complete'){game.log('final_review_completed');persist();document.querySelector('#completion-note').textContent='Review complete. Your committee record is saved in this browser when storage is available.';b.disabled=true;announce('Investment Committee Review complete.');return;}
  if(action==='replay'||action==='same-seed'){game=new Game(action==='same-seed'?game.seed:crypto.getRandomValues(new Uint32Array(1))[0]);runID=crypto.randomUUID();cardIndex=0;viewingFirst=false;inspected=null;render();announce('A new desk is ready.');return;}
  let changed=false;
  if(action==='start')changed=game.start();
  if(action==='toggle'){cardIndex=game.first.projects.findIndex(p=>p.id===id);changed=game.toggle(id);}
  if(action==='commit-first')changed=game.commitFirst();
  if(action==='unlock')changed=game.unlock();
  if(['invest','wait','reject'].includes(action))changed=game.act(id,action);
  if(action==='advance'||action==='proceed-advance')changed=game.advance(action==='proceed-advance');
  if(action==='finish')changed=game.finish();
  if(action==='resolve')changed=game.resolve();
  if(action==='next')changed=game.next();
  if(changed){if(dialog.open)dialog.close();render(!['toggle','invest','wait','reject'].includes(action));if(['toggle','invest','wait','reject'].includes(action)){root.querySelector(`[data-action="inspect"][data-id="${id}"]`)?.focus({preventScroll:true});announce(`${names([id])}: ${action==='toggle'?(game.selected.includes(id)?'funded':'removed'):action==='invest'?'investment committed':action==='wait'?'held for the bulletin':'rejected'}. ${money(game.remaining())} capital remains.`);}else announce(game.phase==='second'?(game.window===1?'Your new investment desk is ready.':'Market bulletin received.'):'Desk updated.');persist();}
}
root.addEventListener('click',handle);dialog.addEventListener('click',handle);
dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const stops=[...dialog.querySelectorAll('button:not(:disabled),select,summary,a[href]')].filter(el=>el.getClientRects().length>0);
  const first=stops[0],last=stops.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
});
dialog.addEventListener('close',()=>{if(inspected)root.querySelector(`[data-action="inspect"][data-id="${inspected}"]`)?.focus({preventScroll:true});});
render(false);
