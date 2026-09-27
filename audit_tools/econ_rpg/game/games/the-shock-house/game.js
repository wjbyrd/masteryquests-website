import { ROOMS, ROOM_ORDER, DOCUMENTS, EVIDENCE, ITEMS, INVOICES, JOBS, DATES, BROADCASTS, BROADCAST_AUDIO, HINTS } from './content.js';
import { newState, solved, inspect, need, complete, contextualPuzzle, policyGauges, load, save } from './engine.js';
import { sceneArt, HOTSPOTS } from './scenes.js';
import { renderDocument, renderEvidence, renderItem, renderMechanism, tinyArtifact, BUDGET_SLIPS, policyObservation as physicalObservation } from './objects.js';

const main=document.querySelector('#main'), dialog=document.querySelector('#dialog');
const money=n=>'$'+n.toLocaleString('en-US');
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storage;try{storage=window.localStorage;}catch{storage=null;}
const loaded=load(storage);
let state=loaded.state||newState(), hasSave=Boolean(loaded.state), started=false, view=null, notice='', hintOpen=false, storageWarning=loaded.warning, currentAudio=null;
let trayOpen=false, selection={}, lastView=null, lastRoom=null, pan=0;
const btn=(label,action,id='',extra='')=>`<button data-action="${action}" data-id="${id}" ${extra}>${label}</button>`;
function announce(text){const el=document.querySelector('#announcement');el.textContent='';requestAnimationFrame(()=>el.textContent=text);}
function persist(){hasSave=true;if(!save(storage,state))storageWarning='Saving is unavailable in this browser. Keep this tab open to retain your investigation.';}
function inform(text){notice=text;announce(text);}
function focusHeading(){const h=main.querySelector('.view-panel [data-heading]')||main.querySelector('[data-heading]');if(h){h.tabIndex=-1;h.focus();}}
function draw({focus=false,keepFocus=false}={}){
  const active=keepFocus?{...document.activeElement?.dataset}:null;
  const inspectionScroll=main.querySelector('.inspection-layer')?.scrollTop||0;
  const viewport=main.querySelector('.scene-viewport');if(viewport)pan=viewport.scrollLeft;
  document.body.classList.toggle('show-objects',state.settings.showObjects);
  document.body.classList.toggle('playing',started&&state.stage==='investigation');
  document.body.classList.toggle('escaping',started&&state.stage==='escaped');
  if(!started)main.innerHTML=startScreen();
  else if(state.stage==='escaped')main.innerHTML=escapeScreen();
  else if(state.stage==='reveal')main.innerHTML=revealScreen();
  else if(state.stage==='results')main.innerHTML=resultsScreen();
  else main.innerHTML=investigation();
  const nextViewport=main.querySelector('.scene-viewport');if(nextViewport)nextViewport.scrollLeft=lastRoom===state.currentRoom?pan:0;
  const nextInspection=main.querySelector('.inspection-layer');if(nextInspection&&lastView===view)nextInspection.scrollTop=inspectionScroll;
  const inspection=main.querySelector('.inspection-object');
  if(inspection&&lastView!==view)inspection.classList.add('arriving');
  lastView=view;lastRoom=state.currentRoom;
  if(focus)focusHeading();
  else if(active){
    const target=active.focus?main.querySelector(`[data-focus="${active.focus}"]`):active.action?[...main.querySelectorAll('button[data-action]')].find(b=>b.dataset.action===active.action&&b.dataset.id===active.id):null;
    if(target&&!target.disabled)target.focus({preventScroll:true});
    else if(active.action)focusHeading();
  }
}
function startScreen(){return `<section class="start"><div><p class="eyebrow">MASTERY QUESTS / AN ECONOMIC ESCAPE</p><h1 data-heading>THE SHOCK<br>HOUSE</h1><div class="subtitle">An Economic Escape</div><p class="start-intro">The house is intact.<br>The economy recorded inside it is not.<br><br>Something happened here.<br>Find the evidence. Reconstruct the sequence.<br>Open the door.</p><div class="actions">${hasSave?btn('Continue investigation','continue','','class="primary"'):btn('Begin investigation','begin','','class="primary"')}${hasSave?btn('New investigation','restart'):''}${btn('How to play','help')}</div><p class="receipt-summary">An untimed investigation · about 15–25 minutes<br>Progress saves in this browser. Sound is off by default.</p>${storageWarning?`<p class="storage-warning">${escape(storageWarning)}</p>`:''}</div><div class="start-art">${sceneArt('hall').replace('viewBox="0 0 1000 640"', 'viewBox="300 20 400 520"')}<div class="caption">AN EMPTY HOUSE. A CONNECTED MYSTERY.</div></div></section>`;}
function investigation(){const room=ROOMS[state.currentRoom],puzzle=contextualPuzzle(state,view);
  return `<div class="exploration ${view?'inspecting':''}"><h1 class="room-name" data-heading>${room.name}</h1><div class="room-tools">${btn('Hint','hint','',`data-focus="hint" ${puzzle?'':'disabled'}`)}${btn('Case menu','menu')}</div>${roomScene()}
  ${view?`<div class="inspection-layer"><section class="view-panel inspection-object type-${view.replace(':','-')}" aria-label="Object inspection">${btn('←','back','','class="inspection-back" aria-label="Put down object and return to room"')}${viewContent(view)}</section></div>`:''}
  ${notice?`<p class="room-notice" role="status">${escape(notice)}</p>`:''}${storageWarning?`<p class="storage-warning room-warning">${escape(storageWarning)}</p>`:''}
  ${hintOpen&&puzzle?hintPanel(puzzle):''}
  <div class="pocket-access">${btn('<span aria-hidden="true">▱</span> Satchel','satchel','',`aria-expanded="${trayOpen}" data-focus="satchel"`)}</div>${trayOpen?tray():''}</div>`;
}
function roomScene(){const room=ROOMS[state.currentRoom];return `<div class="scene-viewport" ${view?'inert':''}><section class="scene" aria-label="${room.name} interactive scene">${sceneArt(state.currentRoom,state)}${room.objects.map(([id,label,,,type])=>{const [x,y,w,h]=HOTSPOTS[state.currentRoom][id];return btn('',type==='room'?'room':'open',id,`class="environment-object" style="left:${x/10}%;top:${y/6.4}%;width:${w/10}%;height:${h/6.4}%" aria-label="${label}"`);}).join('')}${state.currentRoom!=='hall'?btn('<span aria-hidden="true">‹</span>','room','hall','class="hallway-exit" aria-label="Return through doorway to Central Hall"'):''}</section></div>${!view?`<div class="pan-controls">${btn('‹','pan','left','aria-label="Look left across room"')}${btn('›','pan','right','aria-label="Look right across room"')}</div>`:''}`;}
function tray(){return `<aside class="satchel" aria-label="Inventory and evidence"><div class="satchel-seam"></div>${btn('×','satchel','','class="satchel-close" aria-label="Close satchel"')}<section><h2>Items</h2><div class="pocket-objects">${state.inventory.length?state.inventory.map(id=>btn(tinyArtifact(id)+`<small>${ITEMS[id].title}</small>`,'item',id,'class="pocket-object"')).join(''):'<p class="empty">An empty pocket.</p>'}</div></section><section><h2>Evidence folder</h2><div class="pocket-objects">${state.evidence.map(id=>btn(tinyArtifact(id)+`<small>${EVIDENCE[id].short}</small>`,'evidence',id,'class="pocket-object"')).join('')||'<p class="empty">Nothing filed yet.</p>'}</div></section></aside>`;}
function hintPanel(id){const level=state.hintLevels[id]||1;return `<aside class="hint-panel" aria-label="Contextual hint"><h3>HINT ${level} / 3 · ${puzzleTitle(id)}</h3><p>${HINTS[id][level-1]}</p><div class="actions">${level<3?btn('More guidance','more-hint',id):'<span class="receipt-summary">The explicit guidance stays available.</span>'}${btn('Close hint','close-hint')}</div></aside>`;}
function puzzleTitle(id){return {budget:'Budget drawer',cost:'Invoice cabinet',orders:'Work-order press',indicators:'Indicator wall',radio:'Broadcast receiver',policy:'Policy machine',exit:'Exit mechanism'}[id];}
function viewContent(id){
  if(id.startsWith('evidence:'))return renderEvidence(id.slice(9));
  if(id.startsWith('item:'))return renderItem(id.slice(5));
  if(DOCUMENTS[id])return renderDocument(id);
  return renderMechanism(id,state,selection);
}
const arrow=value=>value===1?'↑':value===-1?'↓':'—';
const direction=value=>value===1?'Up':value===-1?'Down':'Unchanged';
function gauges(values,kind,labels){return `<div class="gauges">${labels.map((label,i)=>`<section class="gauge"><h3>${label}</h3><span class="arrow" aria-hidden="true">${arrow(values[i])}</span>${btn(direction(values[i]),'gauge',`${kind}:${i}`,`aria-label="${label}: ${direction(values[i])}. Rotate direction" data-focus="${kind}-${i}"`)}</section>`).join('')}</div>`;}
function escapeScreen(){return `<section class="escape"><div class="escape-scene" aria-hidden="true">${sceneArt('hall',state)}</div><div class="escape-copy"><h1 data-heading>The door opens.</h1>${btn('Step outside','reveal','','class="primary"')}</div></section>`;}
function economicGraph(){return `<svg class="graph" viewBox="0 0 580 330" role="img" aria-labelledby="graph-title graph-desc"><title id="graph-title">Short-run aggregate supply shifts left</title><desc id="graph-desc">With downward-sloping AD unchanged, SRAS shifts left from SRAS 0 to SRAS 1. The equilibrium moves from higher real output Y0 and lower price level P0 to lower real output Y1 and higher price level P1.</desc><g fill="none" stroke-width="3"><path d="M70 35 V270 H535" stroke="#b7c5bb"/><path d="M100 60 L480 250" stroke="#bccabb"/><path d="M180 250 L460 90" stroke="#7dafa1"/><path d="M100 210 L380 50" stroke="#e1bf7e"/><path d="M70 130 H240 V270 M70 170 H320 V270" stroke="#8c9d90" stroke-width="1" stroke-dasharray="5 5"/><path d="M395 94 L339 94 M351 86 L339 94 L351 102" stroke="#e1bf7e"/></g><g fill="#f1edda" font-size="14" font-family="Arial"><text x="12" y="23">Price level</text><text x="405" y="310">Real output</text><text x="480" y="252">AD</text><text x="455" y="51">SRAS₀</text><text x="363" y="30">SRAS₁</text><text x="29" y="135">P₁</text><text x="29" y="175">P₀</text><text x="229" y="290">Y₁</text><text x="310" y="290">Y₀</text></g><circle cx="240" cy="130" r="6" fill="#e1bf7e"/><circle cx="320" cy="170" r="6" fill="#7dafa1"/></svg>`;}
function revealScreen(){return `<article class="debrief"><span class="eyebrow">OUTSIDE THE HOUSE / THE ECONOMIC REVEAL</span><h1 data-heading>You reconstructed a negative aggregate supply shock.</h1>
  <section><h2>1. WHAT HAPPENED?</h2><p class="cause-strip">${state.evidence.includes('broadcast')?'You recovered three broadcasts and traced the March 14 terminal disruption.':''} You matched the emergency invoices, released a smaller production plan, and connected the revised shift sheet to the national indicators. At the policy machine, you tested both directions and sealed the competing objectives.</p><p>The chain you assembled: input interruption → higher costs → reduced production and employment → weaker output, higher unemployment and rising prices → a policy tradeoff.</p></section>
  <section><h2>2. WHY DID IT HAPPEN ECONOMICALLY?</h2><p>A <strong>negative aggregate supply shock</strong> raised production costs and reduced short-run aggregate supply. With aggregate demand initially unchanged, <strong>SRAS shifted left</strong>: real output fell and the price level rose. Weaker production reduced firms’ demand for workers, worsening employment conditions.</p>${economicGraph()}<p>In these records, the price index rose from 100 to 108 and monthly inflation increased from 2% to 8%. A supply shock can raise the price level during the adjustment; it does not necessarily make inflation accelerate forever.</p><p>The household’s nominal pay rose, but the unchanged essential bundle became even more expensive. Its purchasing power deteriorated. Prices alone would not establish the cause: the broadcasts, cost records, production cuts, and national data establish it together.</p><p>Policymakers faced a <strong>tradeoff</strong>. Tighter demand policy could ease inflation pressure while deepening output and employment weakness. Looser demand policy could support output and work while increasing inflation pressure. Neither control immediately repaired the input network.</p></section>
  <section><h2>3. CAN YOU USE IT SOMEWHERE ELSE?</h2><p>Suppose a widespread improvement in production technology lowers firms’ costs. With aggregate demand unchanged, set this small forecast panel for short-run aggregate supply, real output, and the price level.</p>${gauges(state.transfer,'transfer',['SRAS direction','Real output','Price level'])}<p class="receipt-summary">For SRAS, ↑ means a rightward increase; ↓ means a leftward decrease.</p>${state.transferDone?`<p class="notice">Your forecast fits: lower costs shift SRAS right, raising real output and lowering the price level, other things equal. This reverses the house’s initial cost shock.</p>${btn('View investigation results','results','','class="primary"')}`:`${btn('Test the forecast','transfer','','class="primary"')}${notice?`<p class="notice" role="status">${escape(notice)}</p>`:''}`}</section></article>`;}
function resultsScreen(){const minutes=Math.floor((state.completedAt-state.startedAt)/60000),seconds=Math.floor((state.completedAt-state.startedAt)/1000)%60;return `<section><header class="result-title"><span class="eyebrow">CASE 12 / INVESTIGATION COMPLETE</span><h1 data-heading>ESCAPED</h1><p>You made the evidence explain the door.</p></header><div class="stats"><div><strong>${minutes}:${String(seconds).padStart(2,'0')}</strong><span>ELAPSED TIME</span></div><div><strong>${state.hintUses}</strong><span>HINTS OPENED</span></div><div><strong>${state.evidence.length} / 7</strong><span>EVIDENCE RECOVERED</span></div><div><strong>${state.solvedPuzzles.length} / 7</strong><span>PUZZLES SOLVED</span></div></div><div class="results-note">${Object.keys(DOCUMENTS).every(id=>state.inspectedObjects.includes(id))?'<span class="badge">NO STONE UNTURNED</span>':''}${!Object.values(state.hintLevels).includes(3)?'<span class="badge">COLD CASE · NO HINT 3</span>':''}${state.finalAttempts===1?'<span class="badge">CHAIN REACTION · FIRST SEQUENCE</span>':''}<p>Time includes breaks between visits. It is a record of your investigation, not an economic mastery score.</p></div><div class="actions result-actions">${btn('Revisit the economic reveal','reveal')}${btn('New investigation','restart')}${btn('Return to title','title')}</div></section>`;}

function changeRoom(id){if(id==='policy'&&!solved(state,'radio')){inform('Locked. The key slot bears the Archive receiver’s mark.');return;}
  state.currentRoom=id;view=null;hintOpen=false;trayOpen=false;selection={};
  if(!state.visitedRooms.includes(id))state.visitedRooms.push(id);
  if(id==='policy'&&state.inventory.includes('access')){state.inventory=state.inventory.filter(x=>x!=='access');inform('The receiver pass releases the Control Room door.');}
  else notice='';
}
function showDialog(kind){
  if(kind==='settings')dialog.innerHTML=`<h2 id="dialog-title">Accessibility</h2><label><input type="checkbox" data-setting="showObjects" ${state.settings.showObjects?'checked':''}>Show interactive objects</label><p>Optional outlines expose the interaction regions. Tab moves between objects; Enter examines them. Arrow keys turn knobs and move the policy lever. All objects have generous touch areas.</p><p>On a narrow screen, swipe the room or use its edge arrows to look around. Place paper slips by dragging, or select a slip and then its destination. Reorder records with their small arrow controls.</p><label><input type="checkbox" data-setting="sound" ${state.settings.sound?'checked':''}>Enable optional mechanism sounds</label><p>Broadcasts always have transcripts. Motion follows your device’s reduced-motion setting.</p>${btn('Done','close-dialog','','class="primary"')}`;
  if(kind==='help')dialog.innerHTML=`<h2 id="dialog-title">How to investigate</h2><p>Examine the objects themselves: papers, handles, books, and machines. Doorways lead through the house. The back arrow puts down what you are holding.</p><p>On a phone, swipe the room to look around. Open your satchel to revisit collected records. Some clues matter much later.</p><p>Move slips into the notebook, arrange invoices, allocate material, and turn the controls. Drag or use the equivalent tap and keyboard controls. Hints are always available.</p>${btn('Ready','close-dialog','','class="primary"')}`;
  if(kind==='menu')dialog.innerHTML=`<h2 id="dialog-title">Case menu</h2><div class="actions">${btn('Resume investigation','close-dialog','','class="primary"')}${btn('Accessibility','settings')}${btn('How to play','help')}${btn('Return to title','title')}${btn('New investigation','restart')}</div>`;
  if(kind==='restart')dialog.innerHTML=`<h2 id="dialog-title">Start a new investigation?</h2><p>This replaces your saved progress for The Shock House in this browser.</p><div class="actions">${btn('Keep my investigation','close-dialog','','class="primary"')}${btn('Replace save and begin','confirm-new')}</div>`;
  if(!dialog.open)dialog.showModal();else dialog.querySelector('input,button')?.focus();
}
function sound(){if(!state.settings.sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const ctx=new Audio(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.setValueAtTime(330,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(490,ctx.currentTime+.12);gain.gain.setValueAtTime(.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);osc.start();osc.stop(ctx.currentTime+.22);osc.onended=()=>ctx.close();}catch{/* Transcripts and visual feedback remain available. */}}
function stopAudio(){if(currentAudio){currentAudio.pause();currentAudio=null;}}
document.addEventListener('click',event=>{
  const control=event.target.closest('button[data-action]');if(!control||control.disabled)return;
  const {action,id}=control.dataset;let focus=false;notice='';
  selection.freshReward=null;
  if(['settings','help','menu','restart'].includes(action)){showDialog(action);return;}
  if(action==='close-dialog'){dialog.close();return;}
  if(action==='pan'){const viewport=main.querySelector('.scene-viewport');viewport?.scrollBy({left:(id==='left'?-1:1)*viewport.clientWidth*.65,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
  if(action==='begin'||action==='confirm-new'){if(action==='confirm-new'){const settings=state.settings;state=newState();state.settings=settings;}else state.startedAt=Date.now();started=true;view=null;hintOpen=false;dialog.close();focus=true;}
  if(action==='continue'){started=true;view=null;focus=true;}
  if(action==='title'){started=false;view=null;dialog.close();focus=true;}
  if(action==='room'){stopAudio();changeRoom(id);focus=true;}
  if(action==='prev'||action==='next'){stopAudio();const i=ROOM_ORDER.indexOf(state.currentRoom);changeRoom(ROOM_ORDER[(i+(action==='next'?1:4))%5]);focus=true;}
  if(action==='open'){view=id;inspect(state,id);hintOpen=false;trayOpen=false;focus=true;}
  if(action==='back'){stopAudio();view=null;hintOpen=false;focus=true;}
  if(action==='evidence'){view='evidence:'+id;inspect(state,view);hintOpen=false;trayOpen=false;focus=true;}
  if(action==='item'){view='item:'+id;inspect(state,view);hintOpen=false;trayOpen=false;focus=true;}
  if(action==='satchel')trayOpen=!trayOpen;
  if(action==='select-slip'){selection.budget=id;announce('Slip selected. Choose a notebook entry.');}
  if(action==='place-budget'){const slip=BUDGET_SLIPS.find(x=>x.id===selection.budget);if(slip){const [month,index]=id.split(':');state.budget[month][Number(index)]=slip.value;selection.budget=null;sound();}else inform('Take a loose slip first.');}
  if(action==='hint'||action==='more-hint'){
    const p=contextualPuzzle(state,view);if(p){if(action==='more-hint')state.hintLevels[p]=Math.min(3,(state.hintLevels[p]||1)+1);else state.hintLevels[p]||=1;state.hintUses++;hintOpen=true;announce(HINTS[p][state.hintLevels[p]-1]);}
  }
  if(action==='close-hint')hintOpen=false;
  if(action==='use-badge'&&state.inventory.includes('badge')){inspect(state,'badge-used');inform('Click. The cabinet rails release.');sound();}
  if(action==='reorder'){const [kind,index,delta]=id.split(':'),i=Number(index),j=i+Number(delta);if(j>=0&&j<state[kind].length)[state[kind][i],state[kind][j]]=[state[kind][j],state[kind][i]];}
  if(action==='job'){state.jobs=state.jobs.includes(id)?state.jobs.filter(x=>x!==id):[...state.jobs,id];}
  if(action==='connect'&&state.evidence.includes(id)){if(!state.connected.includes(id))state.connected.push(id);inform('The record seats in its slot.');sound();}
  if(action==='gauge'){const [kind,index]=id.split(':'),i=Number(index);state[kind][i]=state[kind][i]===0?1:state[kind][i]===1?-1:0;if(kind==='transfer')state.transferDone=false;}
  if(action==='tune'){state.tuned=true;stopAudio();if(state.settings.sound&&state.frequency===270&&BROADCAST_AUDIO[state.date]){currentAudio=new Audio(BROADCAST_AUDIO[state.date]);currentAudio.play().catch(()=>{});}sound();announce(state.frequency===270&&BROADCASTS[state.date]?BROADCASTS[state.date]:'A routine bulletin. Check the index for the relevant station and dates.');}
  if(action==='record-dispatch'&&solved(state,'indicators')&&state.tuned&&state.frequency===270&&BROADCASTS[state.date]&&state.broadcastSequence.length<3){state.broadcastSequence.push(state.date);inform(`${state.date} recorded in position ${state.broadcastSequence.length}.`);}
  if(action==='clear-dispatches'){state.broadcastSequence=[];inform('Recording positions cleared. The archive broadcasts remain available.');}
  if(action==='seal'){state.seals=state.seals.includes(id)?state.seals.filter(x=>x!==id):[...state.seals,id];}
  if(action==='place-final'&&state.evidence.includes(id)&&!state.finalSequence.includes(id)&&state.finalSequence.length<5)state.finalSequence.push(id);
  if(action==='remove-final')state.finalSequence=state.finalSequence.filter(x=>x!==id);
  if(action==='solve'){const result=complete(state,id);inform(result.ok?{budget:'The drawer slides open.',cost:'The cabinet releases the press.',orders:'A shift sheet slides from the press.',indicators:'The receiver light comes on.',radio:'A Control Room pass drops into the compartment.',policy:'Both seals engage.',exit:'The door unlocks.'}[id]:result.message);if(result.ok){selection.freshReward=id;hintOpen=false;sound();focus=true;}}
  if(action==='reveal'){state.stage='reveal';focus=true;}
  if(action==='transfer'){if(state.transfer.join(',')==='1,1,-1'){state.transferDone=true;inform('Your forecast fits the lower-cost technology improvement.');}else inform('Follow the lower costs through the firms: producing at each price becomes easier. Then consider the new intersection with unchanged demand. Adjust the forecast and try again.');}
  if(action==='results'&&state.transferDone){state.stage='results';focus=true;}
  if(started)persist();draw({focus,keepFocus:!focus});
});
function updateRange(input){const value=Number(input.value);
  if(input.dataset.input==='policy'){
    state.policyValue=value;const trial=value<0?'tight':value>0?'loose':null;if(trial&&!state.policyTried.includes(trial))state.policyTried.push(trial);
    const g=policyGauges(value);for(const key of ['inflation','conditions']){document.querySelector(`#${key}-reading`).textContent=g[key]+' / 10';document.querySelector(`#${key}-needle`).style.setProperty('--angle',(g[key]-5)*12+'deg');}
    document.querySelector('#policy-label').textContent=value<0?'Tighter':value>0?'Looser':'Center';document.querySelector('#policy-observation').textContent=physicalObservation(value);
    document.querySelector('#trials').innerHTML=`<span class="${state.policyTried.includes('tight')?'lit':''}">Tighter trial</span><span class="${state.policyTried.includes('loose')?'lit':''}">Looser trial</span>`;
  }
  persist();
}
document.addEventListener('input',event=>{if(event.target.matches('input[type=range]'))updateRange(event.target);});
document.addEventListener('change',event=>{
  const input=event.target;
  if(input.dataset.setting){state.settings[input.dataset.setting]=input.checked;document.body.classList.toggle('show-objects',state.settings.showObjects);if(!state.settings.sound)stopAudio();if(started||hasSave)persist();return;}
  if(input.matches('input[type=range]')){updateRange(input);if(input.dataset.input==='policy')announce(physicalObservation(state.policyValue));return;}
  if(input.dataset.input==='frequency'||input.dataset.input==='date'){state[input.dataset.input]=input.dataset.input==='frequency'?Number(input.value):input.value;state.tuned=false;stopAudio();persist();draw({keepFocus:true});}
});
// Mouse drag, touch selection, and keyboard arrows all operate the same state.
let dragging=null;
document.addEventListener('dragstart',event=>{const el=event.target.closest('[data-drag]');if(!el)return;dragging={kind:el.dataset.drag,id:el.dataset.id};event.dataTransfer.setData('text/plain',JSON.stringify(dragging));event.dataTransfer.effectAllowed='move';});
document.addEventListener('dragover',event=>{if(event.target.closest('[data-drop]'))event.preventDefault();});
document.addEventListener('drop',event=>{
 const destination=event.target.closest('[data-drop]');if(!destination||!dragging||destination.dataset.drop!==dragging.kind)return;event.preventDefault();
 if(dragging.kind==='budget'){const slip=BUDGET_SLIPS.find(x=>x.id===dragging.id);if(slip){const [month,index]=destination.dataset.slot.split(':');state.budget[month][Number(index)]=slip.value;selection.budget=null;}}
 else{const list=state[dragging.kind],from=Number(dragging.id),to=Number(destination.dataset.slot);if(from<list.length&&to<list.length){const [item]=list.splice(from,1);list.splice(to,0,item);}}
 dragging=null;persist();draw();sound();
});
document.addEventListener('dragend',()=>dragging=null);
function setFrequency(value,redraw=true){state.frequency=Math.max(240,Math.min(300,Math.round(value/10)*10));state.tuned=false;stopAudio();persist();if(redraw){draw();main.querySelector('[data-knob]')?.focus({preventScroll:true});}}
let knobGesture=null;
document.addEventListener('pointerdown',event=>{const knob=event.target.closest('[data-knob]');if(!knob||knob.disabled)return;knob.setPointerCapture(event.pointerId);knobGesture={knob,startY:event.clientY,startX:event.clientX,start:state.frequency,moved:false};});
document.addEventListener('pointermove',event=>{if(!knobGesture)return;const delta=knobGesture.startY-event.clientY+event.clientX-knobGesture.startX;if(Math.abs(delta)>8)knobGesture.moved=true;if(!knobGesture.moved)return;setFrequency(knobGesture.start+delta/3,false);const knob=knobGesture.knob;knob.setAttribute('aria-valuenow',state.frequency);knob.setAttribute('aria-valuetext',state.frequency+' kilohertz');knob.querySelector('span').style.transform=`rotate(${(state.frequency-270)*4}deg)`;document.querySelector('#frequency-readout').textContent=state.frequency+' kHz';document.querySelector('.radio-needle').style.left=(8+(state.frequency-240)/60*84)+'%';});
document.addEventListener('pointerup',()=>{if(!knobGesture)return;const moved=knobGesture.moved;knobGesture=null;setFrequency(moved?state.frequency:state.frequency===300?240:state.frequency+10);});
document.addEventListener('pointercancel',()=>knobGesture=null);
document.addEventListener('keydown',event=>{
 const knob=event.target.closest?.('[data-knob]');
 if(knob&&!knob.disabled&&['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End','Enter',' '].includes(event.key)){event.preventDefault();setFrequency(event.key==='Home'?240:event.key==='End'?300:state.frequency+(['ArrowLeft','ArrowDown'].includes(event.key)?-10:10));return;}
 if(event.key==='Escape'&&!dialog.open){if(trayOpen){trayOpen=false;draw({focus:true});}else if(view){view=null;stopAudio();draw({focus:true});}else if(hintOpen){hintOpen=false;draw({focus:true});}}
});
draw();
