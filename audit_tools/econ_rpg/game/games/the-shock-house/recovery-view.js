import {plate,PANORAMAS,sceneRatio} from './illustrated.js';
import {sprite} from './tactile.js';
import {gaugeFace} from './instruments.js';
import {elapsedTime,statCards} from './stats.js';
import {has,recoveryHint} from './recovery-state.js';
const button=(text,action,id='',extra='')=>`<button data-action="${action}" data-id="${id}" ${extra}>${text}</button>`;
const hit=(label,action,id,x,y,w,h)=>button('',action,id,`class="component-target" aria-label="${label}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"`);
const leaf='<svg class="leaf-mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M9 35C3 16 18 6 40 6C40 27 30 41 12 35Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M6 43L33 14M16 32L15 22M22 26L32 27" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const paper=content=>`<article class="recovery-paper">${content}</article>`;
const table=rows=>`<table class="paper-table"><tbody>${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table>`;
const knob=(value,action,id,label,shift=false)=>button(`<span>${label}</span>${gaugeFace(value,{labels:shift?['LEFT','STEADY','RIGHT']:undefined})}<strong>${value===0?'UNCHANGED':value===1?(shift?'RIGHT →':'UP ↑'):(shift?'← LEFT':'DOWN ↓')}</strong>`,action,id,'class="recovery-knob recovery-gauge" aria-label="'+label+': '+(value===0?'unchanged':value===1?(shift?'right':'up'):(shift?'left':'down'))+'. Change direction"');
const events={technology:['V2 trial plate','Same harvest · 6 → 3 pump-hours'],costs:['Stamped cost die','$21 → $15 per batch'],adoption:['Connected adoption board','Growers · mills · equipment makers'],supply:['Supply-shift plate','Lower costs across producers · SRAS right'],outcome:['National comparison plate','Output 200 → 216 · price index 100 → 96']};
const artifact=key=>'<span class="recovery-artifact artifact-'+key+'"><strong>'+events[key][0]+'</strong><small>'+events[key][1]+'</small></span>';
export const RECOVERY_OBJECTS={
 hall:[['exit','Exit mechanism',500,296,130,160,'open'],['coat','Coat',243,280,135,285],['frame','Framed photograph',899,147,147,152],['mail','Letter rack',731,191,95,93]],
 residence:[['ledger','Books above writing desk',759,145,197,132]],
 workshop:[['machine','Production cost counter',735,334,205,228],['service-cost','Workbench drawer',269,267,105,88],['bin','Material bin',900,424,144,135],['adoption','Work-order press',447,261,83,92]],
 archive:[['television','Television',548,282,135,102],['records','Tall bookcase',217,208,234,278]],
 policy:[['mandate','Utility cabinet',395,277,197,408],['meter','Utility meter',185,204,85,83]]
};
export function recoveryLaunch(s){if(!s.solvedPuzzles.includes('exit'))return '';return `<section class="recovery-unlock"><p class="eyebrow">MISSION 2 · THE SECOND HARVEST</p><h2>A new case has arrived.</h2><p>June 30. More is being produced, yet prices are falling. A gardening trial may be connected—but one garden cannot explain a national change.</p><p>Begin at the coat beside the exit. The coin, photograph, tram ticket, and gardening journal now belong to this case.</p>${button(s.recovery?.complete?'Review Mission 2':s.recovery?'Continue Mission 2':'Open Mission 2','recovery-start','','class="primary"')}</section>`;}
export function recoveryPanel(r,room){return `<aside class="hint-panel" aria-label="Mission 2 hint"><h3>MISSION 2 · HINT ${r.hintLevel} / 3</h3><p>${recoveryHint(r,room)}</p>${r.hintLevel<3?button('More guidance','more-hint'):''}${button('Close hint','close-hint')}</aside>`;}
export function recoveryTray(r){return `<aside class="satchel" aria-label="Mission 2 satchel">${button('×','satchel','','class="satchel-close" aria-label="Close satchel"')}<h2>The Second Harvest</h2><p>${has(r,'coin')?(has(r,'photo-open')?'Coin · used on photograph fastener':'Brass coin · carried'):'No coin collected yet.'}</p><div class="actions">${has(r,'coin')?button(has(r,'photo-open')?'Coin · fastener released':'Coin · photograph tool','search','coin'):''}${has(r,'ticket')?button('Tram ticket','search','ticket'):''}${has(r,'photo-open')?button('Photograph filing note','search','frame'):''}${has(r,'trial')?button('Garden trial notes','search','gardening'):''}${has(r,'costs')?button('Production cost record','search','machine'):''}${has(r,'national')?button('National comparison','search','comparison'):''}${has(r,'adoption')?button('Adoption board','search','adoption'):''}${has(r,'rate')?button('Pump rate','search','meter'):''}${has(r,'overhead')?button('Batch costs','search','service-cost'):''}${has(r,'ad-check')?button('Demand seal','search','mandate'):''}${['growers','mills','makers'].filter(x=>has(r,x)).map(x=>button(x+' installation','search',{growers:'mail',mills:'bin',makers:'records'}[x])).join('')}${button('Case briefing','search','brief')}</div></aside>`;}
export function recoveryView(view,r){
 const id=view.replace('search:','');let art='panorama_exit',crop=null,layers='',title=id,cls='',caption='';
 if(id==='brief')return paper('<p class="eyebrow">JUNE 30 · THE SECOND HARVEST</p><h2 data-heading>More goods. Lower prices.</h2><p>Trace the change from a small field trial to the national economy. Start with both pockets of the coat beside the exit. The photograph near that door has a removable backing.</p><p>The Broken Signal is complete. Its records and results are preserved.</p>');
 if(id==='coat'){
  art=has(r,'right-pocket')?'coat_pocket_open':'coat_close';title='Coat pockets';
  layers=hit('Left pocket flap','r-left-pocket','',26,70,15,15);
  if(has(r,'left-pocket')&&!has(r,'coin'))layers+=sprite('coin',30,76,5,7)+hit('Take brass coin','r-coin','',28,74,9,11);
  if(!has(r,'right-pocket'))layers+=hit('Right pocket flap','r-right-pocket','',55,68,15,14);
  else if(!has(r,'ticket'))layers+=sprite('ticket',59,68,8,10,'ticket-edge')+hit('Take tram ticket','r-ticket','',58,66,12,14);
 }
 if(id==='coin'){
  art='photo_backing';title='Brass coin';cls='coin-inspection';
  layers=sprite('coin',35,16,30,42);
  caption=has(r,'photo-open')?'Used: the coin released the photograph’s slotted fastener and revealed the journal filing note.':'Use the coin’s edge to turn the slotted brass fastener on the back of the photograph beside the exit.';
 }
 if(id==='ticket'){
  art=r.ticketFace?'tram_back':'tram_front';cls='ticket-inspection';title='Tram ticket';
  layers='<span class="sr-only ticket-ink">'+(r.ticketFace?'NORTH TERMINAL · 14 MAR · 06:14 · SINGLE':'ALDER TRAMWAYS · ONE JOURNEY')+'</span>'+hit('Turn tram ticket over','r-ticket-back','',3,8,94,84);
  caption=button('Turn ticket over','r-ticket-back')+'<span>'+(r.ticketFace?'Use the journey date to find the matching garden-journal entry.':'The reverse carries the journey date.')+'</span>';
 }
 if(id==='frame'){
  crop=[82,10,16,25];title='Photograph backing';
  if(!has(r,'photo-back'))layers=hit('Turn photograph over','r-photo-back','',12,12,75,75);
  else {
   art='photo_backing';crop=null;cls='frame-reverse';
   if(has(r,'photo-open')){layers=paper('<p class="eyebrow">FOUND BEHIND THE PHOTOGRAPH</p><h2>Field station filing note</h2><div class="botanical-mark" aria-label="leaf symbol">'+leaf+'</div><p>Lower shelf · leaf-stamped volume</p><p class="handwritten">The field entry follows the journey date.</p>');caption='The coin released the backing. Match this leaf to the journal above the writing desk, then use the date on the tram ticket.';}
   else {layers=hit('Turn slotted fastener with coin','r-photo-open','',76,39,12,16);caption=button(has(r,'coin')?'Use coin on brass fastener':'Try the slotted fastener','r-photo-open')+'<span>'+(has(r,'coin')?'Fit the coin’s edge into the slot to release the backing.':'The wide slot needs a coin. Search the coat pockets.')+'</span>';}
  }
 }
 if(id==='ledger'){
  art='journal_shelf';title='Books above writing desk';
  layers=[['botany','Leaf-stamped lower-shelf book',24.5],['repairs','Gear-stamped lower-shelf book',42],['travel','Compass-stamped lower-shelf book',59.5]].map(([key,label,x])=>hit(label,'r-book-select',key,x,8,16.5,80)).join('');
  caption='Three worn bindings: leaf, gear, and compass. Match the filing note from behind the photograph.';
  if(has(r,'book-selected')){layers=hit('Inspect selected leaf-stamped journal','search','gardening',24.5,8,16.5,80);caption='The leaf-stamped journal is ready to open.';}
 }
 if(id==='gardening'){
  art='journal_shelf';title='Gardening trial journal';
  if(!has(r,'book-open')){layers=hit('Open gardening journal','r-book-open','',24.5,8,16.5,80);caption='Open the leaf-stamped journal on the left.';}
  else layers=paper(has(r,'trial')?`<p class="eyebrow">FIELD TRIAL · 14 MARCH · DESIGN V2</p><h2>Same harvest, fewer pump-hours</h2>${table([['Standard irrigation','6 pump-hours per batch'],['New valve method','3 pump-hours per batch'],['Harvest and quality','Unchanged'],['Land and other inputs','Unchanged']])}<p class="handwritten">V2 saves resource-hours for the same batch. Operating rate and other costs are kept with the equipment.</p>`:`<h2>Dated trial tabs</h2><p>Find the journey date named in the photograph’s filing note.</p><div class="actions">${['12 MAR','14 MAR','16 MAR','21 MAR'].map(date=>button(date,'r-date',date,`aria-pressed="${r.date===date}"`)).join('')}</div>${button('Open selected tab','r-trial','','class="brass-latch"')}`);
 }
 if(id==='meter'){
  art=PANORAMAS.policy;crop=[13,24,12,17];title='Pump energy meter';
  layers='<article class="recovery-console rate-instrument"><header>ALDER UTILITIES · PUMP SERVICE</header><h2>Operating rate</h2><div class="meter-window"><strong>$2</strong><span>PER PUMP-HOUR</span></div><p>June tariff · the same rate applies to both irrigation methods.</p>'+button(has(r,'rate')?'Rate plate retained':'Retain rate plate','r-rate','','class="brass-latch"')+'</article>';
 }
 if(id==='service-cost'){
  art='filing_tray_close';crop=null;title='Workbench service drawer';
  layers=paper('<p class="eyebrow">ALDER WORKS · BATCH COST RECORD</p><h2>Other inputs stay the same</h2>'+table([['Materials and services','$9 per batch'],['Standard method','$9'],['V2 method','$9'],['Pump operation','Billed separately']])+'<p>Combine this unchanged charge with the pump-hours and operating rate.</p>'+button(has(r,'overhead')?'Service plate retained':'Retain service plate','r-overhead','','class="brass-latch"'));
 }
 if(id==='machine'){
  art=PANORAMAS.workshop;crop=[62,29,21,35];title='Cost counter';
  layers='<div class="recovery-console cost-instrument"><small>SAME OUTPUT BATCH · COST DIE</small><div class="cost-inputs">'+[has(r,'trial')?'V2 · 3 pump-hours':'Trial socket empty',has(r,'rate')?'$2 / hour':'Rate socket empty',has(r,'overhead')?'$9 other':'Service socket empty'].map(x=>'<span>'+x+'</span>').join('')+'</div><p>Old method: 6 pump-hours. Reconstruct the new batch cost.</p>'+button('<span>UNIT COST</span>'+gaugeFace([9,15,21,27].indexOf(r.cost)*2/3-1,{labels:['9','15','21','27'],caption:'DOLLARS'})+'<strong>$'+r.cost+'</strong>','r-cost',String([9,15,21,27][([9,15,21,27].indexOf(r.cost)+1)%4]),'class="recovery-knob cost-wheel" aria-label="Rotate unit cost wheel"')+(has(r,'costs')?'<p class="ink-stamp">COST DIE · $21 → $15</p>':button('Stamp updated cost','r-costs','','class="brass-latch"'))+'</div>';
 }
 const tag={mail:['hall',[67,20,14,19],'growers','GROWERS COOPERATIVE','48 cooperatives · 8 growing districts','V2 installed · same harvest, fewer pump-hours'],bin:['workshop',[82,55,16,23],'mills','MILL DISPATCH LABEL','32 mills · 6 industrial districts','V1 retired · V2 installed · fewer input-hours per batch'],records:['archive',[9,5,26,48],'makers','EQUIPMENT TEMPLATE','26 equipment makers · national supplier network','V2 installed · unchanged product quality, fewer resource-hours']}[id];
 if(tag){const dedicated={mail:'mail_rack_close',bin:'material_bin_close'}[id];art=dedicated||PANORAMAS[tag[0]];crop=dedicated?null:tag[1];title=tag[3];layers=paper('<p class="eyebrow">JUNE · INSTALLATION RECORD</p><h2>'+tag[3]+'</h2><div class="installation-stamp"><small>INSTALLED DESIGN</small><strong>V2</strong></div><p class="record-coverage">'+tag[4]+'</p><p>'+tag[5]+'</p><p class="filing-purpose">Match this installed design to the field trial on the workbench adoption board.</p>'+button(has(r,tag[2])?'Installation mark retained':'Retain installation mark','r-'+tag[2],'','class="brass-latch"'));}
 if(id==='adoption'){
  art=PANORAMAS.workshop;crop=[35,22,25,26];title='Installed-design connections';
  layers='<div class="recovery-console adoption-board"><small>JUNE INSTALLATIONS · CONNECT TO TRIAL DESIGN</small><h3>One trial or a wider change?</h3><div class="adoption-connectors">'+['growers','mills','makers'].map((key,i)=>'<section><span>'+({growers:'Growers · 48 co-ops',mills:'Mills · 32 plants',makers:'Equipment · 26 makers'}[key])+'</span><small>'+(has(r,key)?'Installation mark retained':'Tag socket empty')+'</small>'+button('<span class="connector-label">INSTALLED DESIGN</span>'+gaugeFace(r.adoption[i]-1,{labels:['—','V1','V2'],caption:'DESIGN'})+'<strong>'+['—','V1','V2'][r.adoption[i]]+'</strong>','r-adopt-pin',String(i),'class="recovery-knob" aria-label="Rotate '+key+' installed-design connector"')+'</section>').join('')+'</div>'+(has(r,'adoption')?'<p class="ink-stamp">WIDESPREAD ADOPTION · V2</p>':button('Seal connected adoption board','r-adoption','','class="brass-latch"'))+'</div>';
 }
 if(id==='television'){
  art=PANORAMAS.archive;crop=[47,35,16,17];title='June television bulletins';
  const news=[['OUTPUT RISES','200 → 216','National real output index · constant prices'],['PRICES FALL','100 → 96','National price index · same basket'],['A NATIONAL CHANGE','MANY INDUSTRIES','Check producer installations and the separate demand log to explain these outcomes.']];
  if(r.channel>=0){const story=news[r.channel];layers+=`<div class="television-glass news-broadcast" style="left:17%;top:19%;width:50%;height:60%">${plate('news_map')}<header>NATIONAL NEWS <span>JUNE · CHANNEL ${r.channel+1} / 3</span></header><div class="news-story"><h3>${story[0]}</h3><strong>${story[1]}</strong><p>${story[2]}</p></div><footer>JUNE 1 → JUNE 30 · ECONOMY BULLETIN</footer></div>`;caption='<div class="june-transcript"><strong>'+story[0]+' · '+story[1]+'</strong><p>'+story[2]+'</p></div>'+button('Compare national records','search','comparison');}
  layers+=hit('Upper tuning knob: next June bulletin','r-channel','next',75,20,12,16)+hit('Lower tuning knob: previous June bulletin','r-channel','previous',75,36,12,16)+hit('Compare national records on screen','search','comparison',17,19,50,60);
 }
 if(id==='comparison'){
  art=PANORAMAS.archive;crop=[47,35,16,17];title='National comparison';
  layers=paper(`<p class="eyebrow">JUNE 1 → JUNE 30</p><h2>Local trial or national change?</h2>${table([['Real output','200 → 216'],['Price level','100 → 96'],['Cost die',has(r,'costs')?'Filed':'Missing'],['Adoption board',has(r,'adoption')?'Filed':'Missing'],['Demand seal',has(r,'ad-check')?'AD unchanged':'Missing — utility cabinet']])}<div class="recovery-dials">${knob(r.pattern[0],'r-pattern','0','Real output')}${knob(r.pattern[1],'r-pattern','1','Price level')}</div>${has(r,'national')?'<p class="ink-stamp">COMPARISON SEALED</p><p>Return to the exit door for the final sequence.</p>':button('Seal national comparison','r-national','','class="brass-latch"')}`);
 }
 if(id==='mandate'){
  art=PANORAMAS.policy;layers=paper('<h2>June demand log</h2><p>No new stimulus or tightening, and no independent spending shift in the case records. Aggregate demand is held unchanged.</p><p>A policy setting alone would not establish all demand conditions; this log includes the spending review.</p>'+button(has(r,'ad-check')?'Demand seal retained':'Retain AD-unchanged seal','r-ad-check','','class="brass-latch"'));
 }
 if(id==='exit')return `<h2 data-heading>Reconstruct the June change</h2><p class="object-instruction">Set the event sequence and the three direction dials. Aggregate demand stays unchanged.</p><div class="instrument-panel recovery-final"><ol class="recovery-sequence">${r.chain.map(key=>`<li>${artifact(key)}</li>`).join('')}</ol><div class="actions">${['outcome','costs','adoption','technology','supply'].filter(key=>!r.chain.includes(key)&&has(r,({technology:'trial',costs:'costs',adoption:'adoption',supply:'national',outcome:'national'})[key])).map(key=>button(artifact(key),'r-place',key,'class="earned-artifact"')).join('')}${r.chain.length?button('Clear sequence','r-clear'):''}</div><div class="recovery-dials">${['SRAS shift','Real output','Price level'].map((label,i)=>knob(r.directions[i],'r-direction',String(i),label,i===0)).join('')}</div>${button('Turn exit mechanism','r-finish','','class="brass-latch"')}</div>`;
 if(layers.includes('recovery-paper')||layers.includes('recovery-console'))cls+=' recovery-workspace';
 if(id==='coat'&&has(r,'coin'))caption=has(r,'photo-open')?'The coin has released the photograph’s backing.':'Coin collected. Its edge fits the slotted fastener on the back of the photograph beside the exit.';
 return `<h2 class="object-title" data-heading>${title}</h2><div style="--scene-ratio:${sceneRatio(crop)}" class="mini-scene recovery-scene ${crop&&!cls?'proportional-scene':''} ${cls}" data-closeup="${id}">${plate(art,'',crop)}${layers}</div>${caption?'<div class="artifact-caption">'+caption+'</div>':''}`;
}
export function recoveryResults(r){return `<article class="debrief"><p class="eyebrow">MISSION 2 · THE SECOND HARVEST · COMPLETE</p><h1 data-heading>You reconstructed a positive aggregate supply shock.</h1>${statCards([['ELAPSED TIME',elapsedTime(r.startedAt,r.completedAt)],['HINTS OPENED',r.hintUses],['MECHANISMS SOLVED','7 / 7'],['FINAL ATTEMPTS',r.attempts]])}<p class="receipt-summary">Time includes breaks between visits.${!Number.isFinite(r.startedAt)?' This older save has no recorded start time.':''}</p><p>The March trial used fewer pump-hours for the same harvest. The coin opened its filing note, and the tram ticket identified the correct journal entry. The cost record showed why the method mattered: <strong>$21 → $15 per batch</strong>.</p><p>The matching installed-design tags linked the trial to growers, mills, and equipment makers. The separate June demand log ruled out a demand shift in this case. With aggregate demand held unchanged, lower costs increased short-run aggregate supply: <strong>SRAS shifted right, real output rose, and the price level fell.</strong></p><div class="recovery-comparison">${table([['The Broken Signal','Input disruption · costs rise · SRAS left · output falls · prices rise'],['The Second Harvest','Efficiency improvement · costs fall · SRAS right · output rises · prices fall']])}</div><p>The garden alone was insufficient evidence for a national conclusion. The broad adoption and national records completed the explanation. A lower price level in this comparison does not imply prices must keep falling forever.</p><p>All seven mechanisms complete · ${r.hintUses} hints opened · ${r.attempts} final attempts</p><div class="actions">${button('Review The Broken Signal','reveal')}${button('Return to title','title')}${button('New two-mission investigation','restart')}</div></article>`;}
