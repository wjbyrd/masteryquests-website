import {districtAnchor} from './district-layout.js';
import { GAME_CONFIG as G, GAME_BALANCE as B, CYCLES, CATEGORIES } from './config.js';
import { createCities, allocationTotal, validAllocation, consequence, gapReport, bottlenecks } from './model.js';
import { createRun, commitRun, finishRunCycle, nextRunCycle, snapshotRun } from './session.js';
import { renderCityMap, syncCityMaps, setConstructionProgress, updateMapSelection, icon, escapeHTML as esc } from './city-renderer.js';
import { visualState, iso, MAP } from './visual-config.js';
import { adjustDevelopment } from './planning-ui.js';
import {upgradeProgress} from './upgrade-progress.js';
import {renderHero} from './hero-scene.js';
import { reportHTML, TRANSFER_FEEDBACK } from './debrief.js';

const $ = selector => document.querySelector(selector);
const fmt = (v, digits = 0) => v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const signed = (v, digits = 0) => `${v >= 0 ? '+' : '−'}${fmt(Math.abs(v), digits)}`;
let run = null, previewCities, selections, view, animationFrame, previousDoctrine = null, opening = 'title';
const cities = () => run?.cities || previewCities;
const phase = () => run?.phase || 'choosing';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export const exportRun = () => snapshotRun(run);
function announce(message) { $('#announcement').textContent = message; }
function reset(screen = 'title') {
  opening = screen;
  cancelAnimationFrame(animationFrame);
  clearTimeout(feedbackTimer);
  setConstructionProgress(0);
  if (run) previousDoctrine = run.rivalDoctrine;
  run = null; previewCities = createCities(); view = 'combined';
  selections = Object.fromEntries(previewCities.map(c => [c.id, 'capital']));
  $('#final-report').hidden = true; $('#final-report').innerHTML = '';
  $('#consequences').innerHTML = ''; $('#allocations').innerHTML = '';
  $('#comparison').open = false; toggleHelp(false); $('#how-to-play').close();
  $('#planning-hud').hidden = true;
  $('#build-progress').value = 0;
  $('.skip-link').href = screen === 'title' ? '#start-game' : '#city-choice'; $('.skip-link').textContent = screen === 'title' ? 'Skip to Start Game' : 'Skip to economy choice';
  render();
}
function renderChoice() {
  $('#city-choice').hidden = !!run || opening !== 'choice';
  if (run) return;
  $('#city-choice').innerHTML = `<h2>Choose your economy</h2><div class="choice-cards">${G.cities.map((c,i) => `<article class="panel"><div class="choice-art" aria-hidden="true"><svg viewBox="0 0 512 360"><image href="assets/sprites/capital.png" width="1536" height="1024" x="${i?-512:0}" y="${i?-110:-622}"/></svg></div><h3>${esc(c.name)}</h3><p>${i?'More room to catch up.':'Advanced and productive.'}</p><p class="choice-challenge"><strong>Challenge</strong>${i?'Build quickly without creating bottlenecks.':'Sustain growth near the frontier.'}</p><button class="primary-button" data-choose="${c.id}">Manage ${esc(c.name)} <span aria-hidden="true">→</span></button></article>`).join('')}</div><button class="text-button" id="back-title">← Back to title</button>`;

}
function renderTabs() {
  $('#city-tabs').innerHTML = [{ id: 'combined', name: 'Combined Comparison' }, ...cities()].map(c => `<button data-view="${c.id}" aria-pressed="${view === c.id}">${esc(c.name)}</button>`).join('');
}
function renderHUD() {
  const selected = view === 'combined' ? cities() : cities().filter(c => c.id === view);
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
    const note = m.key === 'technology' ? 'Technology index. Combined view is a workforce-weighted average.' : m.key === 'labor' ? 'Workforce / sustainable workforce capacity. Workers are rounded for display; production also uses resources.' : `${m.label}. Change since last cycle.`;
    return `<div class="hud-stat ${phase() === 'resolved' && Math.round(now) !== Math.round(then) ? 'updated' : ''}" title="${esc(note)}"><span class="hud-icon">${icon(m.icon)}</span><div><span class="stat-label">${m.label}</span><strong>${fmt(now)}${m.key === 'labor' ? `<small> / ${fmt(sum(selected, 'laborCapacity'))}</small>` : ''}</strong><span class="stat-change">${signed(Math.round(now) - Math.round(then))} <span>last cycle</span></span></div></div>`;
  }).join('');
}
function mapOptions(city) {
  return { city, phase: phase(), selected: selections[city.id], owner: !run ? 'preview' : city.id === run.playerCity ? 'player' : 'rival',
    allocation: phase() === 'building' ? run.committedAllocations[city.id] : {},
    pending: phase() === 'building' ? run.pendingCities.find(c => c.id === city.id) : null };
}
function contextualPanel(city) {
  if (!run || city.id !== run.playerCity || phase() !== 'planning') return `<div class="district-inspection" id="inspect-${city.id}">${districtInfo(city)}</div>`;
  return `<section class="district-context" data-allocation-city="${city.id}" aria-label="Selected district development controls"><div class="context-description"><label for="district-select">Select district</label><select id="district-select">${CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select><p id="district-description"></p><div id="upgrade-progress"></div></div><div class="context-actions"><p>Current investment: <output id="selected-investment">0</output></p><div class="quick-controls"><button data-adjust="-1" aria-label="Remove one point from selected district">−1</button><button data-adjust="1" aria-label="Add one point to selected district">+1</button><button data-adjust="5" aria-label="Add up to five points to selected district">+5</button><button data-adjust="clear" aria-label="Clear selected district allocation">Clear</button></div></div></section>`;
}
function renderMaps() {
  $('#city-maps').classList.toggle('single-city', view !== 'combined');
  const selectedCities=cities().filter(c=>view==='combined'||c.id===view);
  $('#city-maps').innerHTML=selectedCities.map(city=>{
    const options=mapOptions(city), diagnostics=visualState(city).diagnostics;
    const condition=city.constraints.resourceShortage?'Resource strain':'Resources secure';
    return `<article class="city-panel" data-city-map="${city.id}" data-owner="${options.owner}">
      ${view==='combined'?`<header class="city-heading"><h2>${esc(city.name)}</h2><span class="city-condition">${condition}</span></header>`:''}
      <div class="isometric-map"><span class="map-condition">${condition}</span>${renderCityMap(city,options)}</div>
      <div class="map-stats"><div><span>OUTPUT / WORKER</span><strong>${fmt(city.outputPerWorker,1)}</strong></div><div><span>PRODUCTIVITY GROWTH</span><strong>${signed(city.productivityGrowthRate,1)}%</strong></div><div><span>CAPACITY COVERAGE</span><strong>${fmt(city.resourceAdequacy*100)}%</strong></div></div>
      <div class="city-tools">${contextualPanel(city)}${diagnostics.length?`<div class="map-diagnostics" aria-label="Economic conditions">${diagnostics.map(d=>`<details class="condition-badge"><summary>${esc(d.label)} · ${esc(CATEGORIES.find(c=>c.id===d.category).short)}</summary><p>${esc(d.detail)}</p></details>`).join('')}</div>`:''}</div>
    </article>`;
  }).join('');
  syncCityMaps($('#city-maps'),selectedCities.map(mapOptions)).then(()=>selectedCities.forEach(city=>updateMapSelection(city.id,selections[city.id])));
  updateMapControls();
  if (run) updateAllocationControls();
}
function upgradeHTML(city,key,planned=0){
  const p=upgradeProgress(city,key,planned),cat=CATEGORIES.find(c=>c.id===key);
  if(p.complete)return `<div class="upgrade-info"><span class="eyebrow">FULLY FUNDED</span><strong>${esc(p.name)}</strong><p>${p.funded} ${cat.short} points funded. Further investment still supports production.</p></div>`;
  return `<div class="upgrade-info"><span class="eyebrow">NEXT UPGRADE</span><strong>${esc(p.name)}</strong><p>${p.funded} / ${p.required}${planned?` → ${p.projected} / ${p.required}`:''} ${cat.short} points funded</p><span>${p.remaining?`${p.remaining} more needed`:'Ready when you commit'}</span></div>`;
}
function districtInfo(city) {
  const key=selections[city.id];return upgradeHTML(city,key);
}
function updateMapControls() {
  document.querySelectorAll('[data-map-district]').forEach(button=>{
    const city=button.dataset.city, key=button.dataset.mapDistrict, cat=CATEGORIES.find(c=>c.id===key);
    const editable=run&&city===run.playerCity&&phase()==='planning', allocated=editable?run.allocation[key]:null;
    button.setAttribute('aria-pressed',String(selections[city]===key));
    button.setAttribute('aria-label',`${cat.name} district. ${editable?`${allocated} development points currently allocated. Activate to invest one point.`:'Activate to inspect. Rival allocations are revealed after resolution.'}`);
    if(selections[city]===key) button.closest('.city-map').querySelector('.active-district-label').textContent=cat.name;
  });
  if($('#district-select')) {const key=selections[run.playerCity],cat=CATEGORIES.find(c=>c.id===key);$('#district-select').value=key;$('#district-description').textContent=cat.examples+'.';$('#selected-investment').textContent=run.allocation[key];$('#upgrade-progress').innerHTML=upgradeHTML(cities().find(c=>c.id===run.playerCity),key,run.allocation[key]);}
}
function selectDistrict(city,key) {
  selections[city]=key;updateMapSelection(city,key);updateMapControls();
  const inspection=$(`#inspect-${city}`);if(inspection)inspection.innerHTML=districtInfo(cities().find(c=>c.id===city));
  if(run)updateAllocationControls();
}
let feedbackTimer;
function invest(category,action) {
  const changed=adjustDevelopment(run,category,action);
  selectDistrict(run.playerCity,category);
  const remaining=B.developmentPointsPerCycle-allocationTotal(run.allocation),cat=CATEGORIES.find(c=>c.id===category);
  if(changed){
    const map=$(`[data-map="${run.playerCity}"]`),[x,y]=iso(...districtAnchor(run.playerCity,category));
    if(map){const feedback=map.querySelector('.map-click-feedback');clearTimeout(feedbackTimer);feedback.hidden=false;feedback.textContent=`${changed>0?'+':''}${changed} ${cat.short.toUpperCase()}`;feedback.style.left=`${x/MAP.width*100}%`;feedback.style.top=`${(y-75)/MAP.height*100}%`;feedback.classList.remove('show');void feedback.offsetWidth;feedback.classList.add('show');feedbackTimer=setTimeout(()=>{feedback.hidden=true;},900);}
    announce(`${changed>0?'Added':'Returned'} ${Math.abs(changed)} ${cat.short} development ${Math.abs(changed)===1?'point':'points'}. ${run.allocation[category]} allocated. ${remaining} remaining.`);
  }else announce(remaining===0?'All 20 points are allocated. Use −1 or Clear to change your plan.':`${cat.name} selected. ${run.allocation[category]} points allocated.`);
}
function renderComparison() {
  const metrics=[['Output','output',0,''],['Output / worker','outputPerWorker',1,''],['Capital / worker','capitalPerWorker',1,''],['Technology index','technology',0,'',B.technologyDisplayScale],['Education','education',0,''],['Labor / capacity','labor',0,''],['Output growth','growthRate',1,'%'],['Productivity growth','productivityGrowthRate',1,'%'],['Resource utilization','resourceUtilization',0,'%',100],['Technology adoption','technologyAdoption',0,'%',100]];
  const gap=gapReport(run?.initialCities||previewCities,cities());
  const direction=gap.label==='Gap narrowed'?'GAP NARROWING':gap.label==='Gap widened'?'GAP WIDENING':'LITTLE CHANGE';
  $('#comparison-body').innerHTML=`<div class="strategic-comparison">${cities().map(c=>`<section><h3>${esc(c.name)}</h3><dl><div><dt>Output / worker</dt><dd>${fmt(c.outputPerWorker,1)}</dd></div><div><dt>Current growth <small>(output / worker)</small></dt><dd>${signed(c.productivityGrowthRate,1)}%</dd></div><div><dt>Technology</dt><dd>${fmt(c.technology*B.technologyDisplayScale)}</dd></div><div><dt>Current constraint</dt><dd class="constraint-summary">${visualState(c).diagnostics.map(d=>esc(d.label)).join(' · ')||'None active'}</dd></div></dl></section>`).join('')}</div><div class="strategic-gap"><h3>Productivity gap</h3><p>Starting gap: <strong>${fmt(Math.abs(gap.start)*100,1)}%</strong><span aria-hidden="true"> → </span>Current gap: <strong>${fmt(Math.abs(gap.finish)*100,1)}%</strong></p><strong>${direction}</strong></div><details id="detailed-comparison"><summary>View detailed comparison</summary><div class="comparison-grid">${cities().map(c=>`<section><h3>${esc(c.name)}</h3><dl>${metrics.map(([label,key,digits,unit,scale=1])=>`<div><dt>${label}</dt><dd>${fmt(c[key]*scale,digits)}${unit}${key==='labor'?` / ${fmt(c.laborCapacity)}`:''}</dd></div>`).join('')}</dl><p class="constraint-note">${bottlenecks(c).map(esc).join(' ')||'No active bottlenecks.'}</p></section>`).join('')}</div><p class="comparison-note">The relative gap uses Meridian’s output per worker as its reference. Resource utilization above 100% constrains production. Technology adoption measures usable methods before equipment is considered.</p></details>`;
}
function allocationList(allocation) {
  return `<dl class="allocation-report">${CATEGORIES.map(c => `<div><dt>${c.short}</dt><dd>${allocation[c.id]}</dd></div>`).join('')}</dl>`;
}
function renderAllocations() {
  $('#allocations').hidden=phase()!=='planning';
  const rival=cities().find(c=>c.id===run.rivalCity);
  $('#allocations').innerHTML=`<aside class="rival-planning"><strong>${esc(rival.name)}</strong><span>${phase()==='planning'?'Rival plan hidden until resolution.':phase()==='building'?'Development underway…':'Its allocation is revealed below.'}</span>${view===run.rivalCity?`<button class="quiet-button" data-view="${run.playerCity}">Return to your city</button>`:''}</aside>`;
  updateAllocationControls();
}
function updateAllocationControls() {
  if(!run)return;
  const remaining=B.developmentPointsPerCycle-allocationTotal(run.allocation),planning=phase()==='planning';
  $('#planning-hud').hidden=phase()==='finished';
  $('#planning-budget').hidden=!planning;
  $('#compact-cycle').textContent=`Cycle ${run.currentCycle} / ${CYCLES.length}`;
  $('#compact-city').textContent=view==='combined'?'Both cities':cities().find(c=>c.id===view).name;
  $('#points-remaining').innerHTML=`<span>POINTS LEFT</span><strong>${remaining}</strong>`;
  $('#budget-pips').innerHTML=Array.from({length:B.developmentPointsPerCycle},(_,i)=>`<i class="${i<remaining?'available':'spent'}"></i>`).join('');
  $('#planning-instruction').textContent=planning?remaining?'Click a district to invest +1. Use +5 for a larger investment.':'Plan ready. Commit to begin construction.':phase()==='building'?'Plans locked · both cities are developing.':'Cycle resolved · compare the cities, then continue.';
  document.querySelectorAll('[data-adjust]').forEach(button=>{const value=run.allocation[selections[run.playerCity]],action=button.dataset.adjust;button.disabled=!planning||(['1','5'].includes(action)?remaining===0:value===0);});
  if($('#selected-investment'))$('#selected-investment').textContent=run.allocation[selections[run.playerCity]];
  const disabled=phase()==='building'||planning&&!validAllocation(run.allocation);
  $('#advance').disabled=disabled;$('#quick-commit').disabled=disabled;
  const label=phase()==='resolved'?run.currentCycle===CYCLES.length?'View final report':'Next Cycle':phase()==='building'?'Development underway…':'Commit Plan';
  $('#advance').textContent=label;$('#quick-commit').textContent=label;
  $('#budget-instruction').textContent=planning?remaining?`Allocate ${remaining} remaining points.`:'Your plan is ready.':phase()==='building'?'Both plans are locked.':'Compare the results, then continue.';
}
function renderConsequences() {
  $('#consequences').hidden = phase() !== 'resolved';
  $('#consequences').innerHTML = phase() === 'resolved' ? cities().map(c => {
    const id = c.id, h = c.history.at(-1);
    return `<article data-cycle-report="${id}"><p class="eyebrow">${esc(c.name)} ALLOCATION</p>${allocationList(h.allocation)}<dl class="change-report"><div><dt>Output</dt><dd>${signed(h.growthRate, 1)}%</dd></div><div><dt>Output / worker</dt><dd>${signed(h.productivityGrowthRate, 1)}%</dd></div><div><dt>Technology index</dt><dd>${signed(Math.round(h.endState.technology * B.technologyDisplayScale) - Math.round(h.startState.technology * B.technologyDisplayScale))}</dd></div><div><dt>Education</dt><dd>${signed(Math.round(h.endState.education) - Math.round(h.startState.education))}</dd></div></dl><p>${esc(consequence(c))}</p></article>`;
  }).join('') : '';
}
function render() {
  document.body.dataset.gameActive=String(!!run&&phase()!=='finished');
  document.body.dataset.phase=phase();
  document.body.dataset.screen=run?(phase()==='finished'?'report':'game'):opening;
  $('#title-screen').hidden=!!run||opening!=='title';
  $('.region-section').hidden=!run;
  $('#comparison').hidden=!run;
  renderChoice(); renderTabs(); renderHUD(); renderMaps(); renderComparison();
  const state = phase();
  $('#development').hidden = !run || state === 'finished';
  $('#stage-count').textContent = !run ? 'CHOOSE YOUR ECONOMY' : state === 'finished' ? 'SIX CYCLES COMPLETE' : `CYCLE ${String(run.currentCycle).padStart(2, '0')} / ${String(CYCLES.length).padStart(2, '0')}`;
  $('#stage-name').textContent = !run ? '' : state === 'finished' ? 'Your regional report' : CYCLES[run.currentCycle - 1].name;
  $('#region-status').textContent = { choosing: 'INSPECT THE STARTING CITIES', planning: 'PLANNING PHASE', building: 'DEVELOPMENT UNDERWAY', resolved: 'CYCLE RESOLVED', finished: 'REGION COMPLETE' }[state];
  $('#construction-status').hidden = state !== 'building';
  $('#consequences').hidden = state !== 'resolved';
  if (!run || state === 'finished') return;
  const cycle = CYCLES[run.currentCycle - 1];
  $('#stage-marker').textContent = String(run.currentCycle).padStart(2, '0');
  $('#stage-kicker').textContent = cycle.kicker; $('#briefing-title').textContent = cycle.name; $('#objective').textContent = cycle.objective;
  $('#stage-track').innerHTML = CYCLES.map((s, i) => `<li class="${i < run.currentCycle - 1 ? 'complete' : i === run.currentCycle - 1 ? 'current' : ''}" ${i === run.currentCycle - 1 ? 'aria-current="step"' : ''} title="${s.name}"><span class="sr-only">${s.name}: </span>${String(i + 1).padStart(2, '0')}</li>`).join('');
  renderAllocations(); renderConsequences();
  updateAllocationControls();
}
function finishBuilding() {
  if (!finishRunCycle(run)) return;
  view = 'combined'; render();
  announce(`Cycle ${run.currentCycle} resolved. ${cities().map(c => `${c.name}: productivity ${signed(c.productivityGrowthRate, 1)} percent. ${consequence(c)}`).join(' ')} Rival allocation is now available.`);
  $('#advance').focus({ preventScroll: true });
  // Keep the completed cities in view; the revealed results follow immediately below.
}
function commitPlan() {
  if (!commitRun(run)) return;
  clearTimeout(feedbackTimer);
  setConstructionProgress(0);
  view = 'combined'; render();
  $('.region-section').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  announce('Both economies are developing. Your plan is locked.');
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
    nextRunCycle(run); if (phase() === 'planning') view = run.playerCity; render();
    if (phase() === 'finished') {
      $('#final-report').innerHTML = reportHTML(run); $('#final-report').hidden = false;
      $('.skip-link').href = '#final-report'; $('.skip-link').textContent = 'Skip to final report';
      $('#final-report').focus(); announce('Six cycles complete. Your final report reveals the rival strategy.');
    } else {
      $('#build-progress').value = 0;
      $(`[data-map-district="${selections[run.playerCity]}"][data-city="${run.playerCity}"]`).focus(); announce(`Cycle ${run.currentCycle}: ${CYCLES[run.currentCycle - 1].name}. You have ${B.developmentPointsPerCycle} fresh development points.`);
    }
  }
});
$('#quick-commit').addEventListener('click', () => $('#advance').click());
document.addEventListener('change', e => { if(e.target.id==='district-select'&&run) selectDistrict(run.playerCity,e.target.value); });
document.addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  if (button.dataset.choose && !run) {
    run = createRun(button.dataset.choose, { previousDoctrine }); view=run.playerCity; render();
    $('.skip-link').href = '#district-select'; $('.skip-link').textContent = 'Skip to district allocation controls';
    $(`[data-map-district="capital"][data-city="${run.playerCity}"]`).focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); announce(`You manage ${cities().find(c => c.id === run.playerCity).name}. Click a district to invest one point, or use the district controls.`);
  }
  if (button.dataset.adjust && run && phase() === 'planning') {
    invest(selections[run.playerCity],button.dataset.adjust==='clear'?'clear':Number(button.dataset.adjust));
  }
  if (button.dataset.view) {
    view = button.dataset.view; renderTabs(); renderHUD(); renderMaps(); if(run&&phase()!=='finished')renderAllocations();
    $(`[data-view="${view}"]`).focus({ preventScroll: true });
  }
  if (button.dataset.mapDistrict && phase() !== 'building') {
    const { city, mapDistrict } = button.dataset;
    selectDistrict(city,mapDistrict);
    if(run&&city===run.playerCity&&phase()==='planning')invest(mapDistrict,1);
    else announce(`${G.cities.find(c=>c.id===city).name}. ${CATEGORIES.find(c=>c.id===mapDistrict).name}. Inspection only.`);
  }
  if (button.dataset.answer) {
    $('#transfer-feedback').hidden = false; $('#transfer-feedback').textContent = TRANSFER_FEEDBACK[button.dataset.answer];
    document.querySelectorAll('[data-answer]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  }
  if (button.id === 'replay') {
    reset('choice'); window.scrollTo({ top: 0, behavior: 'instant' }); $('#city-choice').focus({ preventScroll: true });
    announce('New run. Choose either economy. All decisions, histories, and bottlenecks have reset.');
  }
});
let guideTrigger;
function toggleHelp(show, trigger = $('#soundless-info')) {
  if(show){guideTrigger=trigger;$('#help').showModal();}else $('#help').close();
  $('#soundless-info').setAttribute('aria-expanded',String(show));
}
$('#soundless-info').addEventListener('click',()=>toggleHelp(true));
$('#quick-guide').addEventListener('click',()=>toggleHelp(true,$('#quick-guide')));
$('#landing-guide').addEventListener('click',()=>toggleHelp(true,$('#landing-guide')));
$('#close-help').addEventListener('click',()=>toggleHelp(false));
$('#help').addEventListener('close',()=>{$('#soundless-info').setAttribute('aria-expanded','false');guideTrigger?.focus({preventScroll:true});});
$('#open-how').addEventListener('click',()=>$('#how-to-play').showModal());
$('#close-how').addEventListener('click',()=>$('#how-to-play').close());
$('#how-to-play').addEventListener('close',()=>$('#open-how').focus({preventScroll:true}));
$('#start-game').addEventListener('click',()=>{opening='choice';render();$('.skip-link').href='#city-choice';$('.skip-link').textContent='Skip to economy choice';$('#city-choice').focus();window.scrollTo({top:0,behavior:'instant'});});
document.addEventListener('click',e=>{if(e.target.closest('#back-title')){reset();$('#start-game').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}});

document.title = `${G.title} | Mastery Quests`;
$('#game-title').textContent = G.title; $('#region-name').textContent = G.region;
$('#help-budget').textContent = `Choose one economy to manage. Each cycle gives you ${B.developmentPointsPerCycle} development points. Click or tap a district to invest +1. The district selector lets you select without spending; −1, +1, +5 and Clear adjust the selected district. Spend all points, then commit. Buildings change only after commitment. Your rival economy develops independently.`;
$('#help-budget').insertAdjacentHTML('afterend',`<dl>${CATEGORIES.map(c=>`<dt>${c.name}</dt><dd>${c.description}</dd>`).join('')}</dl>`);
// The full header scrolls away. Only the short cycle/budget strip remains sticky.
const hudObserver=new ResizeObserver(()=>document.documentElement.style.setProperty('--compact-hud-height',`${$('#planning-hud').hidden?0:$('#planning-hud').offsetHeight}px`));
hudObserver.observe($('#planning-hud'));
const headerObserver=new IntersectionObserver(([entry])=>document.body.classList.toggle('hud-compact',!entry.isIntersecting));
headerObserver.observe($('.command-header'));
window.addEventListener('pagehide',()=>{clearTimeout(feedbackTimer);hudObserver.disconnect();headerObserver.disconnect();});
reset();
$('#start-game').disabled=false;
renderHero($('#hero-scene'));
