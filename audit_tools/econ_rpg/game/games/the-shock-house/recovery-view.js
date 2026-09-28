import {plate,PANORAMAS} from './illustrated.js';
import {sprite} from './tactile.js';
import {has,recoveryHint} from './recovery-state.js';
const button=(text,action,id='',extra='')=>`<button data-action="${action}" data-id="${id}" ${extra}>${text}</button>`;
const hit=(label,action,id,x,y,w,h)=>button('',action,id,`class="component-target" aria-label="${label}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"`);
const paper=content=>`<article class="recovery-paper">${content}</article>`;
const table=rows=>`<table class="paper-table"><tbody>${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table>`;
const knob=(value,action,id,label,shift=false)=>button(`<span>${label}</span><strong>${value===0?'—':value===1?(shift?'RIGHT →':'UP ↑'):(shift?'← LEFT':'DOWN ↓')}</strong>`,action,id,'class="recovery-knob"');
const events={technology:'New methods adopted across industries',costs:'Unit production costs fall',supply:'Short-run aggregate supply increases',outcome:'Real output rises; price level falls'};
export const RECOVERY_OBJECTS={
 hall:[['exit','Exit mechanism',500,296,130,160,'open'],['coat','Coat',243,280,135,285],['frame','Framed photograph',899,147,147,152]],
 residence:[['ledger','Gardening journal on shelf',759,145,197,132]],
 workshop:[['machine','Production cost counter',735,334,205,228]],
 archive:[['television','Television',548,282,135,102]],
 policy:[['mandate','Demand-policy log',395,277,197,408]]
};
export function recoveryLaunch(s){if(!s.solvedPuzzles.includes('exit'))return '';return `<section class="recovery-unlock"><p class="eyebrow">MISSION 2 · THE SECOND HARVEST</p><h2>A new case has arrived.</h2><p>June 30. More is being produced, yet prices are falling. A gardening trial may be connected—but one garden cannot explain a national change.</p><p>Begin at the coat beside the exit. The coin, photograph, tram ticket, and gardening journal now belong to this case.</p>${button(s.recovery?.complete?'Review Mission 2':s.recovery?'Continue Mission 2':'Open Mission 2','recovery-start','','class="primary"')}</section>`;}
export function recoveryPanel(r){return `<aside class="hint-panel" aria-label="Mission 2 hint"><h3>MISSION 2 · HINT ${r.hintLevel} / 3</h3><p>${recoveryHint(r)}</p>${r.hintLevel<3?button('More guidance','more-hint'):''}${button('Close hint','close-hint')}</aside>`;}
export function recoveryTray(r){return `<aside class="satchel" aria-label="Mission 2 satchel">${button('×','satchel','','class="satchel-close" aria-label="Close satchel"')}<h2>The Second Harvest</h2><p>${has(r,'coin')?(has(r,'photo-open')?'Coin · used on photograph fastener':'Brass coin · carried'):'No coin collected yet.'}</p><div class="actions">${has(r,'ticket')?button('Tram ticket','search','ticket'):''}${has(r,'photo-open')?button('Photograph filing note','search','frame'):''}${has(r,'trial')?button('Garden trial notes','search','gardening'):''}${has(r,'costs')?button('Production cost record','search','machine'):''}${has(r,'national')?button('National comparison','search','comparison'):''}${button('Case briefing','search','brief')}</div></aside>`;}
export function recoveryView(view,r){
 const id=view.replace('search:','');let art='panorama_exit',crop=null,layers='',title=id,cls='';
 if(id==='brief')return paper('<p class="eyebrow">JUNE 30 · THE SECOND HARVEST</p><h2 data-heading>More goods. Lower prices.</h2><p>Trace the change from a small field trial to the national economy. Start with both pockets of the coat beside the exit. The photograph near that door has a removable backing.</p><p>The first case is complete. Its records and results are preserved.</p>');
 if(id==='coat'){
  art=has(r,'right-pocket')?'coat_pocket_open':'coat_close';title='Coat pockets';
  layers=hit('Left pocket flap','r-left-pocket','',26,70,15,15);
  if(has(r,'left-pocket')&&!has(r,'coin'))layers+=sprite('coin',30,76,5,7)+hit('Take brass coin','r-coin','',28,74,9,11);
  if(!has(r,'right-pocket'))layers+=hit('Right pocket flap','r-right-pocket','',55,68,15,14);
  else if(!has(r,'ticket'))layers+=sprite('ticket',59,68,8,10,'ticket-edge')+hit('Take tram ticket','r-ticket','',58,66,12,14);
 }
 if(id==='ticket'){
  art='coat_close';cls='artifact-inspection';title='Tram ticket';
  layers=sprite('ticket',15,18,70,64)+`<div class="physical-print ticket-ink" style="left:35%;top:41%;width:30%;height:25%">${r.ticketFace?'NORTH TERMINAL<br><b>14 MAR</b><br>06:14 · SINGLE':'ALDER TRAMWAYS<br><small>ONE JOURNEY</small>'}</div>`+hit('Turn tram ticket over','r-ticket-back','',16,18,68,64);
 }
 if(id==='frame'){
  crop=[82,10,16,25];title='Photograph backing';
  if(!has(r,'photo-back'))layers=hit('Turn photograph over','r-photo-back','',12,12,75,75);
  else layers=paper(has(r,'photo-open')?'<h2>FIELD STATION ARCHIVE</h2><p>North Terminal demonstration plot.</p><p>Filed in the gardening journal under the <strong>journey date on the tram ticket</strong>.</p><p>The successful trial was later shared with growers and equipment makers. Check the June records for its wider use.</p>':`<h2>FRAME BACKING</h2><div class="frame-fastener">${button('⊖','r-photo-open','','aria-label="Turn slotted fastener with coin"')}</div><p class="engraved-note">TURN TO RELEASE</p>`);
 }
 if(id==='ledger'){
  art=PANORAMAS.residence;crop=[63,11,24,24];title='Books above writing desk';
  layers=hit('Pull gardening journal','search','gardening',17,44,11,40);
 }
 if(id==='gardening'){
  art=PANORAMAS.residence;crop=[63,11,24,24];title='Gardening trial journal';
  if(!has(r,'book-open'))layers=sprite('book',27,8,46,84)+hit('Open gardening journal','r-book-open','',30,10,40,80);
  else layers=paper(has(r,'trial')?`<p class="eyebrow">FIELD TRIAL · 14 MARCH</p><h2>Same harvest, fewer pump-hours</h2>${table([['Standard irrigation','6 pump-hours per batch'],['New valve method','3 pump-hours per batch'],['Harvest and quality','Unchanged'],['Land and other inputs','Unchanged']])}<p class="handwritten">June follow-up: the idle machine beside the workbench holds the production cost record.</p>`:`<h2>Dated trial tabs</h2><p>Find the journey date named in the photograph’s filing note.</p><div class="actions">${['12 MAR','14 MAR','16 MAR','21 MAR'].map(date=>button(date,'r-date',date,`aria-pressed="${r.date===date}"`)).join('')}</div>${button('Open selected tab','r-trial','','class="brass-latch"')}`);
 }
 if(id==='machine'){
  art=PANORAMAS.workshop;crop=[62,29,21,35];title='Cost counter';
  layers=paper(`<p class="eyebrow">SAME OUTPUT BATCH · JUNE FOLLOW-UP</p><h2>Recalibrate unit cost</h2>${table([['Energy price','$2 per pump-hour'],['Other unit costs','$9 · unchanged'],['Old method','6 hours × $2 + $9 = $21'],['Trial hours','See the gardening journal']])}<div class="actions">${[9,15,21,27].map(n=>button('$'+n,'r-cost',String(n),`aria-pressed="${r.cost===n}"`)).join('')}</div>${has(r,'costs')?'<p class="ink-stamp">VERIFIED · $21 → $15</p><p>Compare this result with the June television bulletins.</p>':button('Stamp updated cost','r-costs','','class="brass-latch"')}`);
 }
 if(id==='television'){
  art=PANORAMAS.archive;crop=[47,35,16,17];title='June television bulletins';
  const news=['JUNE 30 / The trial valve design and related efficiency methods are now used widely across agriculture and input-producing industries. Firms need fewer resources per unit.','JUNE 1 → JUNE 30 / National real output: 200 → 216. Price index: 100 → 96. Figures use matching national coverage.','JUNE REVIEW / No demand-policy easing or independent spending surge occurred in this case. Hold aggregate demand unchanged. Production costs fell across industries.'];
  if(r.channel>=0)layers+=`<div class="physical-print television-glass" style="left:17%;top:19%;width:50%;height:60%"><small>NATIONAL SERVICE · JUNE · ${r.channel+1} / 3</small><p>${news[r.channel]}</p></div>`;
  layers+=hit('Upper tuning knob: next June bulletin','r-channel','next',75,20,12,16)+hit('Lower tuning knob: previous June bulletin','r-channel','previous',75,36,12,16)+hit('Compare national records on screen','search','comparison',17,19,50,60);
 }
 if(id==='comparison'){
  art=PANORAMAS.archive;crop=[47,35,16,17];title='National comparison';
  layers=paper(`<p class="eyebrow">JUNE 1 → JUNE 30</p><h2>Local trial or national change?</h2>${table([['Real output','200 → 216'],['Price level','100 → 96'],['Coverage','Many industries'],['Aggregate demand','Unchanged']])}<div class="recovery-dials">${knob(r.pattern[0],'r-pattern','0','Real output')}${knob(r.pattern[1],'r-pattern','1','Price level')}</div>${has(r,'national')?'<p class="ink-stamp">COMPARISON SEALED</p><p>Return to the exit door for the final sequence.</p>':button('Seal national comparison','r-national','','class="brass-latch"')}`);
 }
 if(id==='mandate'){
  art=PANORAMAS.policy;layers=paper('<h2>June demand-policy log</h2><p>No new stimulus or tightening. The case holds aggregate demand unchanged.</p><p>Compare the production method, unit costs, and national television records.</p>');
 }
 if(id==='exit')return `<h2 data-heading>Reconstruct the June change</h2><p class="object-instruction">Set the event sequence and the three direction dials. Aggregate demand stays unchanged.</p><div class="instrument-panel recovery-final"><ol class="recovery-sequence">${r.chain.map(key=>`<li>${events[key]}</li>`).join('')}</ol><div class="actions">${['outcome','costs','technology','supply'].filter(key=>!r.chain.includes(key)).map(key=>button(events[key],'r-place',key)).join('')}${r.chain.length?button('Clear sequence','r-clear'):''}</div><div class="recovery-dials">${['SRAS shift','Real output','Price level'].map((label,i)=>knob(r.directions[i],'r-direction',String(i),label,i===0)).join('')}</div>${button('Turn exit mechanism','r-finish','','class="brass-latch"')}</div>`;
 return `<h2 class="object-title" data-heading>${title}</h2><div class="mini-scene recovery-scene ${cls}" data-closeup="${id}">${plate(art,'',crop)}${layers}</div>`;
}
export function recoveryResults(r){return `<article class="debrief"><p class="eyebrow">MISSION 2 · THE SECOND HARVEST · COMPLETE</p><h1 data-heading>You reconstructed a positive aggregate supply shock.</h1><p>The March trial used fewer pump-hours for the same harvest. The coin opened its filing note, and the tram ticket identified the correct journal entry. The cost record showed why the method mattered: <strong>$21 → $15 per batch</strong>.</p><p>The June reports established widespread adoption. With aggregate demand held unchanged, lower costs increased short-run aggregate supply: <strong>SRAS shifted right, real output rose, and the price level fell.</strong></p><div class="recovery-comparison">${table([['First case','Input disruption · costs rise · SRAS left · output falls · prices rise'],['Second case','Efficiency improvement · costs fall · SRAS right · output rises · prices fall']])}</div><p>The garden alone was insufficient evidence for a national conclusion. The broad adoption and national records completed the explanation. A lower price level in this comparison does not imply prices must keep falling forever.</p><p>All five steps complete · ${r.hintUses} hints opened · ${r.attempts} final attempts</p><div class="actions">${button('Review the first case','reveal')}${button('Return to title','title')}${button('New two-mission investigation','restart')}</div></article>`;}
