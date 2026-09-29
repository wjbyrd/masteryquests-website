import {steelBlanks,storedBlanks} from './workshop-materials.js';
import {groceryReceipt} from './paper-records.js';
import { plate, PANORAMAS, sceneRatio } from './illustrated.js';
import { seen, SEARCH_TITLES, FRAGMENTS, TV_BULLETINS } from './discovery.js';
export function radioServiceCard(){return `<h2 class="object-title" data-heading>Radio service instructions</h2><div class="radio-service-view">${plate('radio_close')}<article class="radio-service-card"><header>NORTHLINE · ARCHIVE RECEIVER</header><h3>Find the station and dispatches</h3><p class="station-rule">Station (kHz) = <strong>10 × latest unit cost</strong></p><ol><li><strong>First date:</strong> interruption notice from the household drawer.</li><li><strong>Second date:</strong> shipping tag in the workbench filing tray.</li><li><strong>Third date:</strong> revised time-card rack beside the machine.</li></ol><p class="service-power">Power comes from the register’s record clasp. Once powered, set the station and each date, listen, and keep the three dispatches.</p></article></div>`;}
// Positions are percentages of the displayed miniature scene, never of the page.
const hit=(label,action,id,x,y,w,h,extra='')=>`<button class="component-target" data-action="${action}" data-id="${id}" aria-label="${label}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" ${extra}></button>`;
const sprites={jar:0,bread:1,receipt:2,postcard:3,book:4,ticket:5,keys:6,coin:7};
export function sprite(id,x,y,w,h,extra=''){const n=sprites[id];return `<span class="painted-object sprite-${id} ${extra}" aria-hidden="true" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;--sprite-x:${n%3*50}%;--sprite-y:${Math.floor(n/3)*50}%"><i class="sprite-art"></i></span>`;}
const prop=(art,label,action,id,x,y,w,h,extra='')=>sprite(art,x,y,w,h,extra)+hit(label,action,id,x,y,w,h);
const printed=(text,x,y,w,h,extra='')=>`<div class="physical-print ${extra}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%">${text}</div>`;
const MINI={
 bag:['residence',[31,55,21,29]],desk:['residence',[58,39,37,37]],
 mail:['hall',[67,20,14,19]],meter:['policy',[13,24,12,17]],ledger:['residence',[63,11,24,24]],book:['residence',[63,11,24,24]],
 tray:['workshop',[21,33,14,16]],files:['workshop',[21,33,14,16]],machine:['workshop',[62,29,21,35]],counter:['workshop',[66,39,16,18]],bin:['workshop',[82,55,16,23]],
 records:['archive',[9,5,26,48]],register:['archive',[9,5,26,48]],television:['archive',[47,35,16,17]],utility:['policy',[28,10,24,68]],
 clock:['hall',[71,9,11,16]],frame:['hall',[82,10,16,25]],lamp:['residence',[82,29,11,20]],plant:['hall',[5,33,16,42]],window:['residence',[31,0,20,48]],cup:['archive',[62,45,6,7]],tools:['workshop',[83,24,14,22]],calendar:['workshop',[27,19,7,15]],box:['archive',[16,44,8,11]],chair:['residence',[9,39,29,40]],pipes:['policy',[61,48,23,30]],fuse:['policy',[53,22,11,18]],schedule:['workshop',[78,30,5,18]]
};
export function inspectionArt(id,room){
 const name=id?.replace('search:','');
 if(name==='coat')return ['coat_close',null];
 if(name==='desk')return ['desk_accounts_close',null];
 if(name==='drawer'||name==='wallet')return ['drawer_close',name==='wallet'?[35,32,35,39]:null];
 if(['groceries','receipt','tags'].includes(name))return ['bag_close',null];
 if(['receiver','service','radio'].includes(name))return ['radio_close',null];
 if(MINI[name])return [PANORAMAS[MINI[name][0]],MINI[name][1]];
 const owner={pay:'residence',food:'residence',bills:'residence',notebook:'residence',budget:'residence',invoices:'workshop',production:'workshop',stock:'workshop',cost:'workshop',orders:'workshop',national:'archive',indicators:'archive',policy:'policy',exit:'hall'}[name]||room;
 return [PANORAMAS[owner],null];
}
export function renderTactile(id,s){
 const moved=x=>seen(s,'moved:'+x),solved=x=>s.solvedPuzzles.includes(x);
 let [art,crop]=inspectionArt(id,s.currentRoom),layers='',cls='';
 if(id==='bag')layers=hit('Bag opening','search','groceries',20,19,65,36);
 if(id==='groceries'){
  layers=sprite('receipt',35,56,19,23);
  if(!moved('jar'))layers+=prop('jar','Jar','move','jar',22,25,35,48);
  if(!moved('bread'))layers+=prop('bread','Bread','move','bread',48,10,38,43);
  if(moved('jar')&&moved('bread'))layers+=hit('Crumpled receipt','search','receipt',35,56,19,23);
  layers+=prop('receipt','April grocery receipt','search','tags',54,56,19,23);
 }
 if(id==='receipt'&&seen(s,'old-food'))return `<h2 class="object-title" data-heading>March grocery receipt</h2>${groceryReceipt(0)}`;
 if(id==='receipt'){
  cls='artifact-inspection';layers=prop('receipt','Unfold receipt','discover','old-food',28,12,44,76,seen(s,'old-food')?'paper-unfolded':'');

 }
 if(id==='tags'&&seen(s,'new-food'))return `<h2 class="object-title" data-heading>April grocery receipt</h2>${groceryReceipt(1)}`;
 if(id==='tags'){
  cls='artifact-inspection';layers=prop('receipt','Unfold April receipt','discover','new-food',29,12,44,76,seen(s,'new-food')?'paper-unfolded':'');

 }
 if(id==='desk')layers=hit('Top drawer: pay envelopes','open','pay',17,40,22,12)+hit('Lower drawer lock','open','budget',66,52,19,12)+hit('Household utility bill on desk','search','utility-bill',17,20,16,7);
 if(id==='utility-bill')return printedEvidence('utility_account','Household utility bill','Alder Utilities · Unit 4. March: 500 units at $0.40 per unit, charge $200. April: 500 units at $1.00 per unit, charge $500. Same household.');
 if(id==='drawer')layers=hit('Wallet','search','wallet',41,37,25,30);
 if(id==='wallet'){
  if(moved('wallet')){art='wallet_open';crop=null;layers=hit('Folded pay stubs','open','pay',43,16,29,14);}
  else layers=hit('Wallet clasp','move','wallet',15,16,72,72);
 }
 if(id==='mail')layers=moved('postcard')?hit('Folded rent notice','search','rent',24,50,52,25):prop('postcard','Postcard','move','postcard',20,35, 60,40);
 if(id==='rent'){
  if(seen(s,'rent-read'))return printedEvidence('rent_notice','Rent notice','Alder Court · Unit 4. Monthly rent: March $1,400; April $1,500. Same rooms. Same tenancy.');
  art=PANORAMAS.hall;crop=MINI.mail[1];cls='artifact-inspection';layers=prop('receipt','Unfold notice','discover','rent-read',27,12,46,76,'');
 }
 if(id==='meter'){
  layers=hit('Meter cover','move','meter-cover',18,14, 60,65);
  if(moved('meter-cover'))return printedEvidence('utility_account','Utility account','Alder Utilities · Unit 4. March: 500 units at $0.40 per unit, charge $200. April: 500 units at $1.00 per unit, charge $500. Same household.');
 }
 if(id==='ledger')layers=hit('Worn books','ambient','books',10,8,80,85);
 if(id==='book'){cls='artifact-inspection';layers=prop('book','Worn book cover','ambient','books',30,8,40,84);}
 if(id==='tray')layers=moved('catalogue')?hit('Shipping tag','search','files',20,30, 60,45):prop('book','Trade catalogue','move','catalogue',24,17,52,70);
 if(id==='files')return `<h2 class="object-title" data-heading>Shipping tag</h2><article class="source-document shipping-record"><header>SHIPPING TAG</header><h2>MARCH 16</h2><p>Emergency route arrival</p></article>`;
 if(id==='machine')layers=hit('Counter cover','search','counter',30,28, 40,28)+hit('Time-card rack','search','schedule',82,1,18,64);
 if(id==='counter')layers=hit('Read counter memory','open','production',14,15,72,70);
 if(id==='bin')layers=moved('bin-lid')?'<div class="bin-materials">'+steelBlanks(storedBlanks(s))+'</div>'+hit('Inspect steel blanks','open','stock',15,15,70,75):hit('Lid handle','move','bin-lid',25,18,50,30);
 if(id==='records')layers=hit('Narrow ledger','search','register',23,23,14,29);
 if(id==='register'){
  cls='artifact-inspection';const ready=true;
  layers=sprite('book',27,8,46,84)+hit('Ledger pages','ambient','register-pages',29,12,38,65)+hit('Brass clasp on register',ready?'open':'locked',ready?'indicators':'register',55,40,13,18);
 }
 if(id==='television'){
  const latest=s.inspectedObjects.filter(x=>TV_BULLETINS.includes(x)).at(-1);
  if(latest){const index=TV_BULLETINS.indexOf(latest),bulletin=[['OUTPUT FALLS','200 → 184','Real output index · constant prices'],['UNEMPLOYMENT RISES','5% → 8%','Share of the workforce without a job'],['PRICES RISE','100 → 108','Price index · monthly inflation: 2% → 8%']][index];layers+=`<div class="television-glass news-broadcast" style="left:17%;top:19%;width:50%;height:60%">${plate('news_map')}<header>NATIONAL NEWS <span>CHANNEL ${index+1} / 3</span></header><div class="news-story"><h3>${bulletin[0]}</h3><strong>${bulletin[1]}</strong><p>${bulletin[2]}</p></div><footer>ECONOMY BULLETIN · ALDER NATIONAL SERVICE</footer></div>`;}

  layers+=hit('Upper tuning knob: next channel','tv-channel','next',75,20,12,16)+hit('Lower tuning knob: previous channel','tv-channel','previous',75,36,12,16);
 }
 if(id==='receiver')layers=hit('Power knob','open','radio', 30, 60,12,16)+hit('Small panel below radio display','search','service',42,69,16,10);
 if(id==='service')return radioServiceCard();
 if(id==='utility')layers=hit('Shutter handle',solved('radio')?'open':'locked',solved('radio')?'policy':'utility', 60,40, 20,24)+(solved('radio')?hit('Objective seals','open','mandate',27,82,20,12)+hit('Operator plate','open','memo',56,82,20,12):'');
 if(id==='schedule')layers=`<article class="staffing-comparison"><header>ALDER WORKS · SHIFT OFFICE</header><h3>30 fewer workers scheduled</h3><div class="staffing-dates">${[['March 12',120,12],['March 21',90,9]].map(([date,count,active])=>`<section><h4>${date}</h4><strong>${count} workers</strong><div class="worker-cards" aria-label="${count} active workers">${Array.from({length:12},(_,i)=>`<span class="worker-card ${i>=active?'withdrawn':''}" aria-hidden="true">${i>=active?'—':'10'}</span>`).join('')}</div></section>`).join('')}</div><p>Each filled card represents 10 workers.</p><footer>120 → 90 employed<br><b>30 workers now seeking new jobs</b></footer></article>`;
 const ambient={calendar:[10,23,80,70]};
 if(ambient[id]){
  layers=hit(SEARCH_TITLES[id]||id,id==='frame'?'flip':'move',id,...ambient[id]);
  if(moved(id)){
   if(id==='calendar')layers+=printed('MAR<br><b>14</b>', 30, 50,40, 30,'calendar-leaf');
  }
 }
 const latestBulletin=id==='television'?s.inspectedObjects.filter(x=>TV_BULLETINS.includes(x)).at(-1):null;
 const caption=latestBulletin?`<article class="news-mobile-copy"><header>NATIONAL NEWS · CHANNEL ${TV_BULLETINS.indexOf(latestBulletin)+1} / 3</header><h3>${FRAGMENTS[latestBulletin][0]}</h3><p>${FRAGMENTS[latestBulletin][1]}</p></article>`:'';
 return `<h2 class="object-title" data-heading>${id==='ticket'?'Tram ticket':SEARCH_TITLES[id]||id}</h2><div style="--scene-ratio:${sceneRatio(crop)}" class="mini-scene search-${id} ${crop&&!cls&&id!=='schedule'?'proportional-scene':''} ${cls} ${moved(id)?'handled':''}" data-closeup="${id}">${plate(art,'',crop)}${layers}</div>${caption}`;
}
export function tactileDocument(id,s){
 let room,region,content;
 if(id==='invoices'){room='workshop';region=MINI.files[1];content='<article class="source-document"><header>NORTHLINE FREIGHT · SAME RECIPE</header><h2>Input costs</h2><table class="paper-table"><thead><tr><th>Per unit</th><th>Regular</th><th>Emergency</th></tr></thead><tbody><tr><th>Input</th><td>$9</td><td>$18</td></tr><tr><th>Other cost</th><td>$9</td><td>$9</td></tr><tr><th>Total cost</th><td><strong>$18</strong></td><td><strong>$27</strong></td></tr></tbody></table><p>The recipe stays the same. Replacement inputs cost more.</p><p class="handwritten">Match the dated deliveries to the machine’s production record.</p></article>';}

 if(id==='production'){room='workshop';region=MINI.counter[1];content=`<article class="counter-readings"><header>COUNTER MEMORY · UNITS PRODUCED</header><dl><div><dt>March 12</dt><dd>1,200</dd></div><div><dt>March 16</dt><dd>1,200</dd></div><div><dt>March 21</dt><dd>900</dd></div></dl><p>Regular delivery / committed batch / revised plan</p><footer>Customer orders remained available.</footer></article>`;}
 if(id==='stock'&&s.solvedPuzzles.includes('orders')){room='workshop';region=MINI.bin[1];content=steelBlanks(2,'stock-blanks')+'<article class="stock-label"><h3>Returned to storage</h3><p><strong>2 steel blanks</strong></p><p>A + C released · B held</p></article>' ;}
 else if(id==='stock'){room='workshop';region=MINI.bin[1];content=steelBlanks(storedBlanks(s),'stock-blanks')+'<article class="stock-label"><header>ALDER WORKS · MATERIAL STORE</header><h3>'+storedBlanks(s)+' steel blanks in storage</h3><p class="stock-definition">Standard pieces of raw steel, ready to be shaped.</p><dl><div><dt>Input price</dt><dd>$18 per blank</dd></div><div><dt>Each job uses</dt><dd>2 steel blanks</dd></div><div><dt>Other added cost</dt><dd>$18 per job</dd></div></dl><p>Lease: $200 already paid, unrecoverable.<br>Unused input can stay in storage.</p></article>' ;}
 if(id==='index')return radioServiceCard();
 if(id==='bills'){room='residence';region=MINI.desk[1];content='<article class="source-document"><header>ALDER COURT · HOUSEHOLD CHARGES</header><h2>March and April</h2><table class="paper-table"><thead><tr><th>Charge</th><th>March</th><th>April</th></tr></thead><tbody><tr><th>Rent</th><td>$1,400</td><td>$1,500</td></tr><tr><th>Utilities</th><td>$200</td><td>$500</td></tr><tr><th>Utility use</th><td>500 units</td><td>500 units</td></tr></tbody></table><p>Same rooms. Same utility use.</p></article>';}

 if(!content)return null;
 return `<h2 class="object-title" data-heading>${id==='production'?'Machine counter':id==='stock'?'Input bin':id==='invoices'?'Material-cost display':'Household fittings'}</h2><div class="mini-scene ${id==='production'?'machine-memory':id==='stock'?'stock-scene':content.includes('source-document')?'source-workspace':''}">${plate(PANORAMAS[room],'',region)}${content}</div>`;
}

function printedEvidence(art,title,transcript){
 return `<h2 class="object-title" data-heading>${title}</h2><figure class="printed-evidence"><img src="assets/illustrated/${art}.webp" alt="${transcript}" draggable="false"><details class="document-transcript"><summary>Read document text</summary><p>${transcript}</p></details></figure>`;
}
