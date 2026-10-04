import {districtAnchor} from './district-layout.js';
import { GAME_CONFIG as G, GAME_BALANCE as B, CYCLES, CATEGORIES } from './config.js';
import { createCities, allocationTotal, validAllocation, consequence, gapReport, bottlenecks } from './model.js';
import { commitRun, finishRunCycle, nextRunCycle, snapshotRun } from './session.js';
import { renderCityMap, syncCityMaps, setConstructionProgress, updateMapSelection, icon, escapeHTML as esc } from './city-renderer.js';
import { visualState, iso, MAP } from './visual-config.js';
import { adjustDevelopment } from './planning-ui.js';
import {upgradeProgress} from './upgrade-progress.js';
import {portrait} from './characters.js';
import {openingAdvice,roundOneAdvice,laterAdvice,CHECK_IN_ROUNDS} from './advisor.js';
import {renderSplash} from './hero-scene.js';
import {createAssignedRun, rivalRevealed, visibleCities, raceResult, roleGoal} from './rivalry.js';
import { reportHTML } from './debrief.js';
import {mountConceptCheck} from './report-learning.js';

const $ = selector => document.querySelector(selector);
const fmt = (v, digits = 0) => v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const signed = (v, digits = 0) => `${v >= 0 ? '+' : '−'}${fmt(Math.abs(v), digits)}`;
let run = null, previewCities, selections, view, animationFrame, previousDoctrine = null;
// Presentation-only help state survives replay in this tab; never enters the model/save snapshot.
let onboardingStep = 'start', coachDismissed = false, challengeStage = 'pending';
const dismissedCheckIns=new Set();
const firstPlanning = () => run?.currentCycle === 1 && phase() === 'planning';
const cities = () => run?.cities || previewCities;
const phase = () => run?.phase || 'choosing';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export const exportRun = () => snapshotRun(run);
function announce(message) { $('#announcement').textContent = message; }
function reset() {
  onboardingStep = 'start'; coachDismissed = false; challengeStage = 'pending'; dismissedCheckIns.clear();
  cancelAnimationFrame(animationFrame);
  clearTimeout(feedbackTimer);
  setConstructionProgress(0);
  if (run) previousDoctrine = run.rivalDoctrine;
  run = null; previewCities = createCities(); view = 'combined';
  selections = Object.fromEntries(previewCities.map(c => [c.id, 'capital']));
  $('#final-report').hidden = true; $('#final-report').innerHTML = '';
  $('#consequences').innerHTML = ''; $('#allocations').innerHTML = '';
  $('#comparison').open = false; toggleHelp(false);
  $('#planning-hud').hidden = true;
  $('#build-progress').value = 0;
  $('.skip-link').href = '#start-game'; $('.skip-link').textContent = 'Skip to Start Game';
  render();
}
function startGame() {
  if (run) return;
  onboardingStep = 'start'; coachDismissed = false; challengeStage = 'pending'; dismissedCheckIns.clear();
  run = createAssignedRun({previousDoctrine}); view = run.playerCity;
  selections[run.playerCity]=openingAdvice(cities().find(c=>c.id===run.playerCity)).category;
  render();
  $('.skip-link').href = '#city-maps'; $('.skip-link').textContent = 'Skip to city districts';
  $(`[data-map-district="${selections[run.playerCity]}"][data-city="${run.playerCity}"]`).focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
  announce(`Welcome to ${cities().find(c=>c.id===run.playerCity).name}. This is your city. You have ${B.developmentPointsPerCycle} points. Click a district to invest.`);
}
function renderTabs() {
  $('#city-tabs').hidden = !rivalRevealed(run) || phase()==='finished';
  $('#city-tabs').innerHTML = rivalRevealed(run) ? [{id:'combined',name:'Compare cities'}, ...cities()].map(c=>`<button data-view="${c.id}" aria-pressed="${view===c.id}">${esc(c.name)}</button>`).join('') : '';
}
function renderAdvisor() {
  const panel=$('#advisor-panel'),city=run&&cities().find(c=>c.id===run.playerCity);
  let kind='',role='advisor',title='',line='',action='',owner=run?.playerCity;
  if(firstPlanning() && onboardingStep!=='done') {
    kind=onboardingStep;
    const advice=openingAdvice(city);
    title=kind==='start'?`Welcome to ${city.name}.`:'Good. Your first investment is planned.';
    line=kind==='start'?`${advice.reason} You have ${B.developmentPointsPerCycle} points. ${advice.instruction}`:'Spend the rest, then commit your plan.';
    // The opening is mandatory, but every investment control stays available.
    if(kind!=='start')action='<button id="dismiss-advisor" class="dialogue-dismiss">Got it</button>';
  } else if(run?.currentCycle===1 && phase()==='resolved' && !coachDismissed) {
    kind='round-one-coach';title='Our first plan is in place.';line=roundOneAdvice(city);
    action='<button id="dismiss-advisor" class="dialogue-dismiss">Got it</button>';
  } else if(run?.currentCycle===G.rivalRevealRound && phase()==='planning' && challengeStage!=='done') {
    if(challengeStage==='pending'){
      kind='challenge';role='rival';owner=run.rivalCity;title='We’ve been building too.';
      line=owner==='meridian'?'Think your city can keep up?':'Let’s see whose city grows faster.';
      action='<button id="accept-challenge" class="rival-accept">Challenge accepted →</button>';
    }else{
      kind='challenge-reply';title='Now we can see what we’re up against.';
      line='Watch how fast they’re improving. Invest carefully, and we can give them a race.';
      action='<button id="dismiss-advisor" class="dialogue-dismiss">Let’s build</button>';
    }
  }
  if(!kind&&run&&phase()==='planning'&&CHECK_IN_ROUNDS.includes(run.currentCycle)&&!dismissedCheckIns.has(run.currentCycle)){
    kind='check-in';({title,line}=laterAdvice(run));action='<button id="dismiss-advisor" class="dialogue-dismiss">Back to the plan</button>';
  }
  const dock=owner&&$(`[data-city-map="${owner}"] .character-dock`);
  panel.hidden=!kind||!dock;
  panel.dataset.dialogue=kind;panel.dataset.speaker=role;panel.dataset.city=owner||'';
  panel.setAttribute('aria-label',role==='rival'?'Rival mayor':'Your city advisor');
  panel.classList.toggle('rival-reveal',role==='rival');
  document.body.dataset.dialogue=String(!panel.hidden);
  document.body.dataset.reveal=String(!panel.hidden&&role==='rival');
  if(dock)dock.append(panel);
  const name=role==='rival'?`MAYOR OF ${cities().find(c=>c.id===owner).name}`:'ELLIS · YOUR CITY ADVISOR';
  const content=kind?`${portrait(role)}<div class="dialogue-copy"><p class="eyebrow">${esc(name)}</p><p><strong>${esc(title)}</strong>${esc(line)}</p>${action}</div>`:'';
  if(panel.innerHTML!==content)panel.innerHTML=content;
  positionDialogue();
}
function positionDialogue(){
  const panel=$('#advisor-panel');if(!panel||panel.hidden)return;
  const host=panel.closest('[data-city-map]'),bounds=host.getBoundingClientRect();
  panel.dataset.docked='false';
  panel.style.setProperty('--speaker-left',`${Math.max(8,bounds.left+10)}px`);
  panel.style.setProperty('--speaker-width',`${Math.min(440,bounds.width-20)}px`);
  const box=panel.getBoundingClientRect();
  const collides=[...document.querySelectorAll('[data-map-district],.district-local:not([hidden])')].some(e=>{
    const r=e.getBoundingClientRect();return box.left<r.right&&box.right>r.left&&box.top<r.bottom&&box.bottom>r.top;
  });
  panel.dataset.docked=String(innerWidth<900||innerHeight<=650||collides);
}
function showStagedDialogue(){
  positionDialogue();
  const panel=$('#advisor-panel');
  if(!panel.hidden&&panel.dataset.docked==='true')panel.closest('[data-city-map]').scrollIntoView({block:'start',behavior:'instant'});
}
// Let the responsive grid and map dock settle before measuring collision boxes.
window.addEventListener('resize',()=>requestAnimationFrame(()=>{positionLocalControls();positionDialogue();}));
function renderRace() {
  $('#rivalry-score').hidden=!rivalRevealed(run)||phase()==='finished';
  if(!rivalRevealed(run)){$('#rivalry-score').innerHTML='';return;}
  const race=raceResult(run);
  $('#rivalry-score').innerHTML=`<div class="race-goal"><strong>${roleGoal(run)}</strong><span>${race.levelTied?'Cities level':race.overtaken?'Rivermark leads':'Meridian leads'} · gap ${fmt(Math.abs(race.gap.finish)*100,1)}%</span></div><div class="race-scores">${[race.player,race.rival].map(c=>`<div><span>${esc(c.name)} · ${c.id===run.playerCity?'You':'Rival'} · growth</span><strong>${signed(c.score,1)}%</strong></div>`).join('')}</div>`;
}
function renderHUD() {
  if(!run){$('#hud').innerHTML='';return;}
  const selected = visibleCities(run).filter(c=>view==='combined'||c.id===view);
  const previous = selected.map(c => c.history.at(-1)?.startState || c);
  const sum = (list, key) => list.reduce((v, c) => v + c[key], 0);
  const tech = list => list.reduce((v, c) => v + c.technology * c.labor, 0) / sum(list, 'labor');
  const metrics = [
    { label: 'Output', key: 'output', icon: 'output' }, { label: 'Capital', key: 'capital', icon: 'factory' },
    { label: 'Resources', key: 'resources', icon: 'leaf' }, { label: 'Technology index', key: 'technology', icon: 'flask' },
    { label: 'Education', key: 'education', icon: 'book' }, { label: 'Labor', key: 'labor', icon: 'labor' },
  ];
  $('#hud').innerHTML = metrics.map(m => {
    const now = m.key === 'technology' ? tech(selected) * B.technologyDisplayScale : sum(selected, m.key);
    const then = m.key === 'technology' ? tech(previous) * B.technologyDisplayScale : sum(previous, m.key);
    const note = m.key === 'technology' ? 'Technology index. Combined view is a workforce-weighted average.' : m.key === 'labor' ? 'Workforce / sustainable workforce capacity. Workers are rounded for display; production also uses resources.' : `${m.label}. Change since last round.`;
    return `<div class="hud-stat ${phase() === 'resolved' && Math.round(now) !== Math.round(then) ? 'updated' : ''}" title="${esc(note)}"><span class="hud-icon">${icon(m.icon)}</span><div><span class="stat-label">${m.label}</span><strong>${fmt(now)}${m.key === 'labor' ? `<small> / ${fmt(sum(selected, 'laborCapacity'))}</small>` : ''}</strong><span class="stat-change">${signed(Math.round(now) - Math.round(then))} <span>last round</span></span></div></div>`;
  }).join('');
}
function mapOptions(city) {
  return { city, phase: phase(), selected: selections[city.id], owner: !run ? 'preview' : city.id === run.playerCity ? 'player' : 'rival',
    allocation: phase() === 'building' ? run.committedAllocations[city.id] : {},
    pending: phase() === 'building' ? run.pendingCities.find(c => c.id === city.id) : null };
}
function contextualPanel(city) {
  return `<section class="district-board" data-board="${city.id}" aria-label="${esc(city.name)} district status board">${districtBoard(city)}</section>`;
}
function districtBoard(city){
  const own=city.id===run.playerCity,planning=phase()==='planning';
  const allocation=own&&planning?run.allocation:phase()==='resolved'?city.history.at(-1).allocation:own&&phase()==='building'?run.committedAllocations[city.id]:null;
  return `<p class="board-heading">${own?'YOUR CITY PLAN':'DISTRICT STATUS'}</p>${CATEGORIES.map(cat=>{
    const planned=allocation?.[cat.id]||0,p=upgradeProgress(city,cat.id,planning||phase()==='building'?planned:0);
    const diagnostics=visualState(city).diagnostics.filter(d=>d.category===cat.id).map(d=>d.label);
    const note=diagnostics.join(' · ')||(!p.complete&&!p.remaining?'Ready on commit':'');
    return `<button class="district-status" data-plan-district="${cat.id}" data-plan-city="${city.id}" aria-pressed="${selections[city.id]===cat.id}" ${phase()==='building'?'disabled':''}><strong>${esc(cat.name)}</strong><span class="next-upgrade">${p.complete?'Current':'Next'}: ${esc(p.name)}</span><span class="board-progress">${p.funded}${p.complete?'':` / ${p.required}`} funded</span><span class="board-planned">${allocation?`${planning?'Planned':phase()==='building'?'Building':'Last round'}: +${planned}`:'Plan hidden'}</span>${note?`<small>${esc(note)}</small>`:''}</button>`;
  }).join('')}`;
}
function localControls(city){
  if(city.id!==run.playerCity||phase()!=='planning')return '';
  return `<div class="district-local" role="group" aria-label="Selected district investment"><div class="local-heading"><strong id="local-district-name"></strong><span>Planned <output id="selected-investment">0</output></span></div><div class="quick-controls"><button data-adjust="-1" aria-label="Remove one point from selected district">−1</button><button data-adjust="1" aria-label="Add one point to selected district">+1</button><button data-adjust="5" aria-label="Add up to five points to selected district">+5</button><button data-adjust="clear" aria-label="Clear selected district allocation">Clear</button></div></div>`;
}
function positionLocalControls(){
  const control=$('.district-local');if(!control||!run)return;
  const host=control.closest('.isometric-map'),map=host.querySelector('.city-map'),box=map.getBoundingClientRect(),outer=host.getBoundingClientRect();
  const selected=map.querySelector(`[data-map-district="${selections[run.playerCity]}"]`).getBoundingClientRect();
  control.dataset.docked='false';
  const width=control.offsetWidth,height=control.offsetHeight;
  const x=Math.max(box.left+8,Math.min(box.right-width-8,(selected.left+selected.right-width)/2));
  const midY=(selected.top+selected.bottom-height)/2;
  const candidates=[[x,selected.bottom+6],[x,selected.top-height-6],[selected.left-width-6,midY],[selected.right+6,midY],[selected.left-width-6,selected.top-height-6],[selected.right+6,selected.top-height-6],[selected.left-width-6,selected.top],[selected.right+6,selected.top],[selected.left-width-6,selected.top-30],[selected.right+6,selected.top-30]];
  const targets=[...map.querySelectorAll('[data-map-district]')].map(e=>e.getBoundingClientRect());
  const point=candidates.find(([x,y])=>x>=box.left+8&&x+width<=box.right-8&&y>=box.top+8&&y+height<=box.bottom-8&&!targets.some(r=>x<r.right&&x+width>r.left&&y<r.bottom&&y+height>r.top));
  control.dataset.docked=String(!point);
  if(!point&&innerWidth>=900){control.style.setProperty('--local-dock-left',`${Math.max(470,Math.min(host.clientWidth-330,selected.left-outer.left))}px`);}
  if(point){control.style.left=`${point[0]-outer.left}px`;control.style.top=`${point[1]-outer.top}px`;}

}
function renderMaps() {
  // Keep the live dialogue node when rebuilding city articles.
  $('.region-section').before($('#advisor-panel'));
  $('#city-maps').classList.toggle('single-city', view !== 'combined');
  const selectedCities=phase()==='finished'?[]:visibleCities(run).filter(c=>view==='combined'||c.id===view);
  $('#city-maps').innerHTML=selectedCities.map(city=>{
    const options=mapOptions(city), diagnostics=visualState(city).diagnostics;
    const condition=city.constraints.resourceShortage?'Resource strain':'Resources secure';
    return `<article class="city-panel" data-city-map="${city.id}" data-owner="${options.owner}">
      ${view==='combined'?`<header class="city-heading"><h2>${esc(city.name)}</h2><span class="city-condition">${condition}</span></header>`:''}
      <div class="isometric-map"><span class="map-condition">${condition}</span>${renderCityMap(city,options)}${localControls(city)}</div>
      <div class="character-dock"></div><div class="map-stats"><div><span>OUTPUT / WORKER</span><strong>${fmt(city.outputPerWorker,1)}</strong></div><div><span>PRODUCTIVITY GROWTH</span><strong>${signed(city.productivityGrowthRate,1)}%</strong></div><div><span>CAPACITY COVERAGE</span><strong>${fmt(city.resourceAdequacy*100)}%</strong></div></div>
      <div class="city-tools">${contextualPanel(city)}${diagnostics.length?`<div class="map-diagnostics" aria-label="Economic conditions">${diagnostics.map(d=>`<details class="condition-badge"><summary>${esc(d.label)} · ${esc(CATEGORIES.find(c=>c.id===d.category).short)}</summary><p>${esc(d.detail)}</p></details>`).join('')}</div>`:''}</div>
    </article>`;
  }).join('');
  syncCityMaps($('#city-maps'),selectedCities.map(mapOptions)).then(()=>selectedCities.forEach(city=>updateMapSelection(city.id,selections[city.id])));
  updateMapControls();
  if (run) updateAllocationControls();
}
function updateMapControls() {
  document.querySelectorAll('[data-map-district]').forEach(button=>{
    const city=button.dataset.city, key=button.dataset.mapDistrict, cat=CATEGORIES.find(c=>c.id===key);
    const editable=run&&city===run.playerCity&&phase()==='planning', allocated=editable?run.allocation[key]:null;
    button.setAttribute('aria-pressed',String(selections[city]===key));
    button.classList.toggle('tutorial-target',!!editable && firstPlanning() && onboardingStep==='start' && key===openingAdvice(cities().find(c=>c.id===run.playerCity)).category);
    button.setAttribute('aria-label',`${cat.name} district. ${editable?`${allocated} development points currently allocated. Activate to invest one point.`:'Activate to inspect.'}`);
    if(selections[city]===key) button.closest('.city-map').querySelector('.active-district-label').textContent=cat.name;
  });
  const focused=document.activeElement?.dataset.planDistrict;
  document.querySelectorAll('[data-board]').forEach(board=>{const city=cities().find(c=>c.id===board.dataset.board);board.innerHTML=districtBoard(city);});
  if(focused)$(`[data-plan-district="${focused}"][data-plan-city="${run.playerCity}"]`)?.focus({preventScroll:true});
  if($('#local-district-name')){const key=selections[run.playerCity];$('#local-district-name').textContent=CATEGORIES.find(c=>c.id===key).short;$('#selected-investment').textContent=run.allocation[key];}
  positionLocalControls();
}
function selectDistrict(city,key) {
  selections[city]=key;updateMapSelection(city,key);updateMapControls();
  if(run)updateAllocationControls();
}
let feedbackTimer;
function invest(category,action) {
  const changed=adjustDevelopment(run,category,action);
  if(changed>0 && firstPlanning()){
    onboardingStep=onboardingStep==='start'?'invested':'done';
  }
  if(changed>0 && challengeStage==='reply')challengeStage='done';
  if(changed>0&&CHECK_IN_ROUNDS.includes(run.currentCycle))dismissedCheckIns.add(run.currentCycle);
  selectDistrict(run.playerCity,category);
  const remaining=B.developmentPointsPerCycle-allocationTotal(run.allocation),cat=CATEGORIES.find(c=>c.id===category);
  if(changed){
    const map=$(`[data-map="${run.playerCity}"]`),[x,y]=iso(...districtAnchor(run.playerCity,category));
    if(map){const feedback=map.querySelector('.map-click-feedback');clearTimeout(feedbackTimer);feedback.hidden=false;feedback.textContent=`${changed>0?'+':''}${changed} ${cat.short.toUpperCase()}`;feedback.style.left=`${x/MAP.width*100}%`;feedback.style.top=`${(y-75)/MAP.height*100}%`;feedback.classList.remove('show');void feedback.offsetWidth;feedback.classList.add('show');feedbackTimer=setTimeout(()=>{feedback.hidden=true;},900);}
    announce(`${changed>0?'Added':'Returned'} ${Math.abs(changed)} ${cat.short} development ${Math.abs(changed)===1?'point':'points'}. ${run.allocation[category]} allocated. ${remaining} remaining.`);
  }else announce(remaining===0?'All 20 points are allocated. Use −1 or Clear to change your plan.':`${cat.name} selected. ${run.allocation[category]} points allocated.`);
}
function renderComparison() {
  if(!rivalRevealed(run)){$('#comparison-body').innerHTML='';return;}
  const metrics=[['Output','output',0,''],['Output / worker','outputPerWorker',1,''],['Capital / worker','capitalPerWorker',1,''],['Technology index','technology',0,'',B.technologyDisplayScale],['Education','education',0,''],['Labor / capacity','labor',0,''],['Output growth','growthRate',1,'%'],['Productivity growth','productivityGrowthRate',1,'%'],['Resource utilization','resourceUtilization',0,'%',100],['Technology adoption','technologyAdoption',0,'%',100]];
  const gap=gapReport(run?.initialCities||previewCities,cities());
  const direction=gap.label==='Gap narrowed'?'GAP NARROWING':gap.label==='Gap widened'?'GAP WIDENING':'LITTLE CHANGE';
  $('#comparison-body').innerHTML=`<div class="strategic-comparison">${cities().map(c=>`<section><h3>${esc(c.name)}</h3><dl><div><dt>Output / worker</dt><dd>${fmt(c.outputPerWorker,1)}</dd></div><div><dt>Current growth <small>(output / worker)</small></dt><dd>${signed(c.productivityGrowthRate,1)}%</dd></div><div><dt>Technology</dt><dd>${fmt(c.technology*B.technologyDisplayScale)}</dd></div><div><dt>Current constraint</dt><dd class="constraint-summary">${visualState(c).diagnostics.map(d=>esc(d.label)).join(' · ')||'None active'}</dd></div></dl></section>`).join('')}</div><div class="strategic-gap"><h3>Productivity gap</h3><p>Starting gap: <strong>${fmt(Math.abs(gap.start)*100,1)}%</strong><span aria-hidden="true"> → </span>Current gap: <strong>${fmt(Math.abs(gap.finish)*100,1)}%</strong></p><strong>${direction}</strong></div><details id="detailed-comparison"><summary>View detailed comparison</summary><div class="comparison-grid">${cities().map(c=>`<section><h3>${esc(c.name)}</h3><dl>${metrics.map(([label,key,digits,unit,scale=1])=>`<div><dt>${label}</dt><dd>${fmt(c[key]*scale,digits)}${unit}${key==='labor'?` / ${fmt(c.laborCapacity)}`:''}</dd></div>`).join('')}</dl><p class="constraint-note">${bottlenecks(c).map(esc).join(' ')||'No active bottlenecks.'}</p></section>`).join('')}</div><p class="comparison-note">The relative gap uses Meridian’s output per worker as its reference. Resource utilization above 100% constrains production. Technology adoption measures usable methods before equipment is considered.</p></details>`;
}
function allocationList(allocation) {
  return `<dl class="allocation-report">${CATEGORIES.map(c => `<div><dt>${c.short}</dt><dd>${allocation[c.id]}</dd></div>`).join('')}</dl>`;
}
function renderAllocations() {
  $('#allocations').hidden=phase()!=='planning'||!rivalRevealed(run);
  if(!rivalRevealed(run)){$('#allocations').innerHTML='';updateAllocationControls();return;}
  const rival=cities().find(c=>c.id===run.rivalCity);
  $('#allocations').innerHTML=`<aside class="rival-planning"><strong>${esc(rival.name)}</strong><span>${phase()==='planning'?'Rival plan hidden until resolution.':phase()==='building'?'Development underway…':'Its allocation is revealed below.'}</span>${view===run.rivalCity?`<button class="quiet-button" data-view="${run.playerCity}">Return to your city</button>`:''}</aside>`;
  updateAllocationControls();
}
function updateAllocationControls() {
  if(!run)return;
  const remaining=B.developmentPointsPerCycle-allocationTotal(run.allocation),planning=phase()==='planning';
  $('#planning-hud').hidden=phase()==='finished';
  $('#planning-budget').hidden=!planning;
  $('#compact-cycle').textContent=`Round ${run.currentCycle} / ${G.totalRounds}`;
  $('#compact-city').textContent=view==='combined'?'Both cities':cities().find(c=>c.id===view).name;
  $('#points-remaining').innerHTML=`<span>POINTS LEFT</span><strong>${remaining}</strong>`;
  $('#budget-pips').innerHTML=Array.from({length:B.developmentPointsPerCycle},(_,i)=>`<i class="${i<remaining?'available':'spent'}"></i>`).join('');
  const inspectingRival = planning && view===run.rivalCity;
  document.body.dataset.onboarding = firstPlanning() && onboardingStep==='start' ? 'start' : '';
  let instruction = planning ? remaining ? 'Click a district to invest +1.' : 'Plan ready. Commit to build.' : phase()==='building' ? rivalRevealed(run) ? 'Both cities are developing.' : 'Your city is developing.' : 'Round complete. Your next plan is waiting.';
  if(inspectingRival)instruction=`Return to ${cities().find(c=>c.id===run.playerCity).name} to invest.`;
  $('#planning-instruction').textContent=instruction;
  renderAdvisor();
  for(const id of ['advance','quick-commit'])$('#'+id).classList.toggle('commit-ready',planning&&remaining===0);
  document.querySelectorAll('[data-adjust]').forEach(button=>{const value=run.allocation[selections[run.playerCity]],action=button.dataset.adjust;button.disabled=!planning||(['1','5'].includes(action)?remaining===0:value===0);});
  if($('#selected-investment'))$('#selected-investment').textContent=run.allocation[selections[run.playerCity]];
  const disabled=phase()==='building'||planning&&!validAllocation(run.allocation);
  $('#advance').disabled=disabled;$('#quick-commit').disabled=disabled;
  const label=phase()==='resolved'?run.currentCycle===CYCLES.length?'View result':'Next Round':phase()==='building'?'Development underway…':'Commit Plan';
  $('#advance').textContent=label;$('#quick-commit').textContent=label;
  $('#budget-instruction').textContent=planning?remaining?`Allocate ${remaining} remaining points.`:'Your plan is ready.':phase()==='building'?'Your plan is locked.':'Review your results, then continue.';
}
function renderConsequences() {
  $('#consequences').hidden = phase() !== 'resolved';
  $('#consequences').innerHTML = phase() === 'resolved' ? visibleCities(run).map(c => {
    const id = c.id, h = c.history.at(-1);
    return `<article data-cycle-report="${id}"><p class="eyebrow">${esc(c.name)} ALLOCATION</p>${allocationList(h.allocation)}<dl class="change-report"><div><dt>Output</dt><dd>${signed(h.growthRate, 1)}%</dd></div><div><dt>Output / worker</dt><dd>${signed(h.productivityGrowthRate, 1)}%</dd></div><div><dt>Technology index</dt><dd>${signed(Math.round(h.endState.technology * B.technologyDisplayScale) - Math.round(h.startState.technology * B.technologyDisplayScale))}</dd></div><div><dt>Education</dt><dd>${signed(Math.round(h.endState.education) - Math.round(h.startState.education))}</dd></div></dl><p>${rivalRevealed(run)?esc(consequence(c)):'Your investments are in place. Plan your next round.'}</p></article>`;
  }).join('') : '';
}
function render() {
  document.body.dataset.gameActive=String(!!run&&phase()!=='finished');
  document.body.dataset.phase=phase();
  document.body.dataset.firstPlanning=String(firstPlanning());
  document.body.dataset.rivalVisible=String(rivalRevealed(run));
  document.body.dataset.onboarding='';
  document.body.dataset.screen=run?(phase()==='finished'?'report':'game'):'title';
  $('#title-screen').hidden=!!run;
  $('.region-section').hidden=!run||phase()==='finished';
  $('#comparison').hidden=!rivalRevealed(run)||phase()==='finished';
  renderTabs(); renderHUD(); renderMaps(); renderComparison(); renderAdvisor(); renderRace();
  const state = phase();
  $('#development').hidden = !run || state === 'finished';
  $('#stage-count').textContent = !run ? '' : state === 'finished' ? `${G.totalRounds} ROUNDS COMPLETE` : `ROUND ${String(run.currentCycle).padStart(2, '0')} / ${String(G.totalRounds).padStart(2, '0')}`;
  $('#stage-name').textContent = !run ? '' : state === 'finished' ? 'Your regional report' : CYCLES[run.currentCycle - 1].name;
  $('#region-status').textContent = { choosing: 'INSPECT THE STARTING CITIES', planning: 'PLANNING PHASE', building: 'DEVELOPMENT UNDERWAY', resolved: 'ROUND COMPLETE', finished: 'REGION COMPLETE' }[state];
  $('#construction-status').hidden = state !== 'building';
  $('#consequences').hidden = state !== 'resolved';
  if (!run || state === 'finished') return;
  const cycle = CYCLES[run.currentCycle - 1];
  $('#stage-marker').textContent = String(run.currentCycle).padStart(2, '0');
  $('#stage-kicker').textContent = cycle.kicker; $('#briefing-title').textContent = cycle.name; $('#objective').textContent = cycle.objective;
  $('#stage-track').innerHTML = CYCLES.map((s, i) => `<li class="${i < run.currentCycle - 1 ? 'complete' : i === run.currentCycle - 1 ? 'current' : ''}" ${i === run.currentCycle - 1 ? 'aria-current="step"' : ''} title="${s.name}"><span class="sr-only">${s.name}: </span>${String(i + 1).padStart(2, '0')}</li>`).join('');
  renderAllocations(); renderConsequences();
  updateAllocationControls();
  positionLocalControls();positionDialogue();
}
function finishBuilding() {
  if (!finishRunCycle(run)) return;
  view = rivalRevealed(run) ? 'combined' : run.playerCity; render();
  announce(`Round ${run.currentCycle} complete. ${visibleCities(run).map(c=>`${c.name}: productivity ${signed(c.productivityGrowthRate,1)} percent.`).join(' ')} ${rivalRevealed(run)?'Both allocations are now available.':'Your city is ready for its next plan.'}`);
  $('#advance').focus({ preventScroll: true });
  showStagedDialogue();
  // Keep the completed cities in view; the revealed results follow immediately below.
}
function commitPlan() {
  if (!commitRun(run)) return;
  clearTimeout(feedbackTimer);
  setConstructionProgress(0);
  view = rivalRevealed(run) ? 'combined' : run.playerCity; render();
  $('.region-section').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  announce(rivalRevealed(run)?'Both cities are developing. Your plan is locked.':'Your city is developing. Your plan is locked.');
  $('#build-progress').value = 0;
  if (reducedMotion.matches) { finishBuilding(); return; }
  const start = performance.now();
  function tick(now) {
    if (reducedMotion.matches) { finishBuilding(); return; }
    const progress = Math.max(0, Math.min(1, (now - start) / G.constructionMs));
    $('#build-progress').value = progress * 100;
    setConstructionProgress(progress);
    if (progress < 1) animationFrame = requestAnimationFrame(tick); else finishBuilding();
  }
  animationFrame = requestAnimationFrame(tick);
}
$('#advance').addEventListener('click', () => {
  if (!run) return;
  if (phase() === 'planning') commitPlan();
  else if (phase() === 'resolved') {
    nextRunCycle(run); if(phase()==='planning')view=run.currentCycle===G.rivalRevealRound?'combined':run.playerCity; render();
    if (phase() === 'finished') {
      $('#final-report').innerHTML = reportHTML(run); mountConceptCheck($('#final-report')); $('#final-report').hidden = false;
      $('.skip-link').href = '#final-report'; $('.skip-link').textContent = 'Skip to final report';
      $('#final-report').focus(); announce(`${G.totalRounds} rounds complete. ${raceResult(run).headline} Your report explains the result.`);
    } else {
      $('#build-progress').value = 0;
      $(`[data-map-district="${selections[run.playerCity]}"][data-city="${run.playerCity}"]`).focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); showStagedDialogue(); announce(run.currentCycle===G.rivalRevealRound?`${cities().find(c=>c.id===run.rivalCity).name} has been building, too. The race is on. Compare productivity growth since the start.`:`Round ${run.currentCycle}. You have ${B.developmentPointsPerCycle} fresh points.`);
    }
  }
});
$('#quick-commit').addEventListener('click', () => $('#advance').click());

document.addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  if (button.dataset.adjust && run && phase() === 'planning') {
    invest(selections[run.playerCity],button.dataset.adjust==='clear'?'clear':Number(button.dataset.adjust));
  }
  if(button.id==='accept-challenge' && challengeStage==='pending'){
    challengeStage='reply';view=run.playerCity;render();
    window.scrollTo({top:0,behavior:'instant'});showStagedDialogue();
    $('#dismiss-advisor')?.focus({preventScroll:true});
  }
  if(button.id==='dismiss-advisor'){
    const kind=$('#advisor-panel').dataset.dialogue;
    if(kind==='start')return;
    if(kind==='invested')onboardingStep='done';
    if(kind==='round-one-coach')coachDismissed=true;
    if(kind==='challenge-reply')challengeStage='done';
    if(kind==='check-in')dismissedCheckIns.add(run.currentCycle);
    updateMapControls();updateAllocationControls();
    $(`[data-map-district="${selections[run.playerCity]}"][data-city="${run.playerCity}"]`)?.focus({preventScroll:true});
  }
  if (button.dataset.view && run && (rivalRevealed(run)||button.dataset.view===run.playerCity)) {
    view = button.dataset.view; renderTabs(); renderHUD(); renderMaps(); if(run&&phase()!=='finished')renderAllocations();
    $(`#city-tabs [data-view="${view}"]`)?.focus({ preventScroll: true });
  }
  if(button.dataset.planDistrict&&phase()!=='building')selectDistrict(button.dataset.planCity,button.dataset.planDistrict);
  if (button.dataset.mapDistrict && phase() !== 'building') {
    const { city, mapDistrict } = button.dataset;
    selectDistrict(city,mapDistrict);
    if(run&&city===run.playerCity&&phase()==='planning')invest(mapDistrict,1);
    else announce(`${G.cities.find(c=>c.id===city).name}. ${CATEGORIES.find(c=>c.id===mapDistrict).name}. Inspection only.`);
  }
  if (button.id === 'replay') {
    reset(); startGame();
  }
});
let guideTrigger;
function toggleHelp(show, trigger = $('#soundless-info')) {
  if(show){guideTrigger=trigger;$('#help').showModal();}else $('#help').close();
  $('#soundless-info').setAttribute('aria-expanded',String(show));
}
$('#soundless-info').addEventListener('click',()=>toggleHelp(true));
$('#quick-guide').addEventListener('click',()=>toggleHelp(true,$('#quick-guide')));
$('#close-help').addEventListener('click',()=>toggleHelp(false));
$('#help').addEventListener('close',()=>{$('#soundless-info').setAttribute('aria-expanded','false');guideTrigger?.focus({preventScroll:true});});
$('#start-game').addEventListener('click',startGame);

document.title = `${G.title} | Mastery Quests`;
$('#game-title').textContent = G.title;
for(const element of document.querySelectorAll('[data-game-title]'))element.textContent=G.title;
$('#region-name').textContent = G.region;
$('#run-length-note').textContent=`${G.totalRounds} rounds. A new path each play.`;
$('#stage-track').setAttribute('aria-label',`${G.totalRounds}-round progress`);
$('#help-steps').innerHTML=`<li>Your assigned city is yours to build.</li><li>Spend ${B.developmentPointsPerCycle} points each round. Click a district to invest +1.</li><li>Commit your plan and watch it develop.</li><li>From Round ${G.rivalRevealRound}, compare cities and adapt through Round ${G.totalRounds}.</li>`;
$('#help-goal').textContent=`Across ${G.totalRounds} rounds, an advanced city aims to hold its lead while growing; a catch-up city aims to close the gap or overtake. Compare final output per worker, gap change and growth from each city’s starting point together.`;
$('#help-budget').textContent = `Each round gives you ${B.developmentPointsPerCycle} development points. Click or tap a district to invest +1. The district status board selects without spending. Use −1, +1, +5 or Clear beside the selected district to adjust its plan. Spend all points, then commit. Buildings change only after commitment. Your rival economy develops independently.`;
$('#help-categories').innerHTML=`<dl>${CATEGORIES.map(c=>`<dt>${c.name}</dt><dd>${c.description.replaceAll('cycles','rounds').replaceAll('cycle','round')}</dd>`).join('')}</dl>`;
// The full header scrolls away. Only the short cycle/budget strip remains sticky.
const hudObserver=new ResizeObserver(()=>document.documentElement.style.setProperty('--compact-hud-height',`${$('#planning-hud').hidden?0:$('#planning-hud').offsetHeight}px`));
hudObserver.observe($('#planning-hud'));
const headerObserver=new IntersectionObserver(([entry])=>document.body.classList.toggle('hud-compact',!entry.isIntersecting));
headerObserver.observe($('.command-header'));
window.addEventListener('pagehide',()=>{clearTimeout(feedbackTimer);hudObserver.disconnect();headerObserver.disconnect();});
reset();
$('#start-game').disabled=false;
renderSplash($('#hero-scene'));
const splashObserver=new ResizeObserver(()=>{if(!run)renderSplash($('#hero-scene'));});
splashObserver.observe($('#hero-scene'));
window.addEventListener('pagehide',()=>splashObserver.disconnect());
