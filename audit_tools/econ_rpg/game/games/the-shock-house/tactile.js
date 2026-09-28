import { plate, PANORAMAS } from './illustrated.js';
import { seen, SEARCH_TITLES, FRAGMENTS, TV_BULLETINS } from './discovery.js';
import {hasNationalEvidence} from './engine.js';
// Positions are percentages of the displayed miniature scene, never of the page.
const hit=(label,action,id,x,y,w,h,extra='')=>`<button class="component-target" data-action="${action}" data-id="${id}" aria-label="${label}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" ${extra}></button>`;
const sprites={jar:0,bread:1,receipt:2,postcard:3,book:4,ticket:5,keys:6,coin:7,spools:8};
export function sprite(id,x,y,w,h,extra=''){const n=sprites[id];return `<span class="painted-object sprite-${id} ${extra}" aria-hidden="true" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;--sprite-x:${n%3*50}%;--sprite-y:${Math.floor(n/3)*50}%"></span>`;}
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
 if(name==='drawer'||name==='wallet')return ['drawer_close',name==='wallet'?[35,32,35,39]:null];
 if(['groceries','receipt','tags'].includes(name))return ['bag_close',null];
 if(['receiver','service','radio'].includes(name))return ['radio_close',null];
 if(MINI[name])return [PANORAMAS[MINI[name][0]],MINI[name][1]];
 const owner={pay:'residence',food:'residence',bills:'policy',notebook:'residence',budget:'residence',invoices:'workshop',production:'workshop',stock:'workshop',cost:'workshop',orders:'workshop',national:'archive',indicators:'archive',policy:'policy',exit:'hall'}[name]||room;
 return [PANORAMAS[owner],null];
}
export function renderTactile(id,s){
 const moved=x=>seen(s,'moved:'+x),solved=x=>s.solvedPuzzles.includes(x);
 let [art,crop]=inspectionArt(id,s.currentRoom),layers='',cls='';
 if(id==='bag')layers=hit('Bag opening','search','groceries',20,19,65,36);
 if(id==='groceries'){
  layers=sprite('receipt',43,54,17,20);
  if(!moved('jar'))layers+=prop('jar','Jar','move','jar',22,25,35,48);
  if(!moved('bread'))layers+=prop('bread','Bread','move','bread',48,35,38,45);
  if(moved('jar')&&moved('bread'))layers+=hit('Crumpled receipt','search','receipt',43,54,17,20);
  layers+=prop('receipt','Layered price stickers','search','tags',73,24,13,17);
 }
 if(id==='receipt'){
  cls='artifact-inspection';layers=prop('receipt','Unfold receipt','discover','old-food',28,12,44,76,seen(s,'old-food')?'paper-unfolded':'');
  if(seen(s,'old-food'))layers+=printed('ALDER GROCER<br><small>MARCH 30 · MONTHLY BASKET</small><hr>Grain · milk · produce<br>Household goods<hr><b>$600</b><br><small>Same goods · same quantities</small>',35,29,30, 40,'receipt-ink');
 }
 if(id==='tags'){
  cls='artifact-inspection';layers=prop('receipt','Peel price stickers','discover','new-food',29,12,44,76,seen(s,'new-food')?'paper-unfolded':'');
  if(seen(s,'new-food'))layers+=printed('APRIL 30<br><small>SAME MONTHLY QUANTITIES</small><hr><s>$600</s><br><b>$800</b>',35,30,30,35,'receipt-ink');
 }
 if(id==='desk')layers=hit('Top drawer handle','search','drawer',15,28,31,20)+hit('Lower drawer lock','open',solved('budget')?'budget':'notebook',66,41,25,21);
 if(id==='drawer')layers=hit('Wallet','search','wallet',41,37,25,30);
 if(id==='wallet'){
  if(moved('wallet')){art='wallet_open';crop=null;layers=hit('Folded pay stubs','open','pay',43,16,29,14);}
  else layers=hit('Wallet clasp','move','wallet',15,16,72,72);
 }
 if(id==='mail')layers=moved('postcard')?hit('Folded rent notice','search','rent',24,50,52,25):prop('postcard','Postcard','move','postcard',20,35, 60,40);
 if(id==='rent'){
  art=PANORAMAS.hall;crop=MINI.mail[1];cls='artifact-inspection';layers=prop('receipt','Unfold notice','discover','rent-read',27,12,46,76,seen(s,'rent-read')?'paper-unfolded':'');
  if(seen(s,'rent-read'))layers+=printed('ALDER COURT<br><small>Unit 4 · same rooms</small><hr>MARCH &nbsp; $1,400<br>APRIL &nbsp; $1,500',34,32,32,33,'receipt-ink');
 }
 if(id==='meter'){
  layers=hit('Meter cover','move','meter-cover',18,14, 60,65);
  if(moved('meter-cover'))layers=printed('<small>MARCH / APRIL<br>UNITS USED</small><b>500 / 500</b><small>CHARGE</small><b>$200 / $500</b>',24,22, 50,49,'meter-face')+hit('Stored readings','discover','meter-read',20,17,58, 60);
 }
 if(id==='ledger')layers=hit('Clothbound notebook','search','book',53,50,11,37);
 if(id==='book'){cls='artifact-inspection';layers=prop('book','Notebook clasp','open','notebook',30,8,40,84);}
 if(id==='tray')layers=moved('catalogue')?hit('Delivery folder','search','files',20,30, 60,45):prop('book','Trade catalogue','move','catalogue',24,17,52,70);
 if(id==='files'){cls='artifact-inspection';layers=prop('receipt','Dated supplier deliveries','open','invoices',22,14,43,72);}
 if(id==='machine')layers=hit('Counter cover','search','counter',30,28, 40,28)+hit('Time-card rack','search','schedule',82,1,18,64);
 if(id==='counter')layers=hit('Read counter memory','open','production',14,15,72,70);
 if(id==='bin')layers=moved('bin-lid')?prop('spools','Remaining input','open','stock',20,18, 60, 60):hit('Lid handle','move','bin-lid',25,18,50,30);
 if(id==='records')layers=hit('Narrow ledger','search','register',23,23,14,29);
 if(id==='register'){
  cls='artifact-inspection';const ready=solved('orders')&&hasNationalEvidence(s);
  layers=sprite('book',27,8,46,84)+hit('Ledger pages',ready?'open':'locked',ready?'national':'register',29,12,38,65)+hit('Brass clasp on register',ready?'open':'locked',ready?'indicators':'register',55,40,13,18);
 }
 if(id==='television'){
  const latest=s.inspectedObjects.filter(x=>TV_BULLETINS.includes(x)).at(-1);
  if(latest)layers+=printed(`<small>NATIONAL SERVICE · CHANNEL ${TV_BULLETINS.indexOf(latest)+1} / 3</small><p>${FRAGMENTS[latest][1]}</p>`,17,19, 50, 60,'television-glass');
  layers+=hit('Upper tuning knob: next channel','tv-channel','next',75,20,12,16)+hit('Lower tuning knob: previous channel','tv-channel','previous',75,36,12,16);
 }
 if(id==='receiver')layers=hit('Power knob','open','radio', 30, 60,12,16)+hit('Small panel below radio display','search','service',42,69,16,10);
 if(id==='service')layers=printed('<small>STATION</small><b>10 × UNIT COST</b><small>FIRST DATE: EMPLOYEE NOTICE<br>NEXT DATES: EMERGENCY INVOICES</small>',36, 50,28,27,'service-engraving')+hit('Tuning inscription','open','index',35,48,30, 30);
 if(id==='utility')layers=hit('Shutter handle',solved('radio')?'open':'locked',solved('radio')?'policy':'utility', 60,40, 20,24)+(solved('radio')?hit('Objective seals','open','mandate',27,82,20,12)+hit('Operator plate','open','memo',56,82,20,12):'');
 if(id==='schedule')layers=printed('<small>MARCH 12 / MARCH 21</small><b>120 / 90</b><div class="crossed-shifts">||||| ||||| |||||<br><s>||||| ||||| |||||</s></div><small>REVISED SHIFTS</small>',12,8,76,84,'schedule-board');
 const ambient={calendar:[10,23,80,70]};
 if(ambient[id]){
  layers=hit(SEARCH_TITLES[id]||id,id==='frame'?'flip':'move',id,...ambient[id]);
  if(moved(id)){
   if(id==='calendar')layers+=printed('MAR<br><b>14</b>', 30, 50,40, 30,'calendar-leaf');
  }
 }
 return `<h2 class="object-title" data-heading>${id==='ticket'?'Tram ticket':SEARCH_TITLES[id]||id}</h2><div class="mini-scene search-${id} ${cls} ${moved(id)?'handled':''}" data-closeup="${id}">${plate(art,'',crop)}${layers}</div>`;
}
export function tactileDocument(id,s){
 let room,region,content;
 if(id==='production'){room='workshop';region=MINI.counter[1];content=printed('<small>COUNTER MEMORY · UNITS</small><hr>MAR 12 &nbsp; 1,200<br>MAR 16 &nbsp; 1,200<br>MAR 21 &nbsp; 900<hr><small>REGULAR / EMERGENCY / REVISED<br>CUSTOMER ORDERS: AVAILABLE</small>',17,17,66,66,'meter-face');}
 if(id==='stock'){room='workshop';region=MINI.bin[1];content=sprite('spools',15,35,23,33)+sprite('spools',38,35,23,33)+sprite('spools',61,35,23,33)+printed('<small>BIN 06 · 6 MEASURES<br>$18 EACH · 2 PER JOB<br>OTHER ADDED COST: $18 / JOB<br>LEASE $200 · PAID, UNRECOVERABLE<br>UNUSED INPUT MAY BE STORED</small>',15,5,70,26,'service-engraving');}
 if(id==='index')return `<h2 class="object-title" data-heading>Radio tuning instructions</h2><div class="mini-scene">${plate('radio_close')}${printed('<small>STATION</small><b>10 × LATEST UNIT COST</b><hr><small>FIRST DATE · EMPLOYEE NOTICE<br>NEXT DATES · EMERGENCY INVOICES<br>POWER · RECORD CLASP</small>',24,27,52, 50,'service-engraving')}</div>`;
 if(id==='bills'){room='policy';region=MINI.meter[1];content=printed('<small>MARCH / APRIL</small><hr>RENT &nbsp; $1,400 / $1,500<br><small>SAME ROOMS</small><hr>UTILITIES &nbsp; $200 / $500<br><small>500 UNITS EACH MONTH</small>',17,17,66,66,'meter-face');}
 if(!content)return null;
 return `<h2 class="object-title" data-heading>${id==='production'?'Machine counter':id==='stock'?'Input bin':'Household fittings'}</h2><div class="mini-scene ${id==='production'?'machine-memory':''}">${plate(PANORAMAS[room],'',region)}${content}</div>`;
}
