// Second-case progress is independent of first-case discoveries.
export const RECOVERY_CHAIN=['technology','costs','adoption','supply','outcome'];
export const RECOVERY_FLAGS=['left-pocket','right-pocket','coin','ticket','ticket-back','photo-back','photo-open','book-selected','book-open','trial','rate','overhead','costs','growers','mills','makers','adoption','ad-check','news-0','news-1','news-2','national'];
export const has=(r,id)=>r.flags.includes(id);
const mark=(r,id)=>{if(!has(r,id))r.flags.push(id);};
export function newRecovery(){return {version:2,startedAt:Date.now(),completedAt:null,flags:[],ticketFace:false,date:'12 MAR',cost:21,channel:-1,pattern:[0,0],directions:[0,0,0],adoption:[0,0,0],chain:[],hintLevel:1,hintUses:0,attempts:0,complete:false};}
export function migrateRecovery(raw){
 if(!raw||raw.version!==1)return raw;
 // Validate the legacy shape before granting credit; malformed Mission 2 never destroys Mission 1.
 if(!Array.isArray(raw.flags)||raw.flags.some(x=>!RECOVERY_FLAGS.includes(x))||!Array.isArray(raw.chain)||!Array.isArray(raw.directions))return null;
 const r={...raw,version:2,flags:[...raw.flags],chain:raw.chain.filter(x=>x!=='adoption'),adoption:[0,0,0]};
 if(has(r,'book-open')||has(r,'trial'))mark(r,'book-selected');
 if(has(r,'costs')){mark(r,'rate');mark(r,'overhead');}
 if(r.complete){
  if(!has(r,'national')||raw.chain.join()!=='technology,costs,supply,outcome'||raw.directions.join()!=='1,1,-1')return null;
  for(const id of ['growers','mills','makers','adoption','ad-check'])mark(r,id);
  r.adoption=[2,2,2];r.chain=[...RECOVERY_CHAIN];
 }else{r.flags=r.flags.filter(x=>x!=='national');r.chain=[];}
 return r;
}
export function validRecovery(r){
 if(r&&(['startedAt','completedAt'].some(key=>r[key]!=null&&(!Number.isFinite(r[key])||r[key]<0))||(r.startedAt!=null&&r.completedAt!=null&&r.completedAt<r.startedAt)))return false;
 if(!r||r.version!==2||!Array.isArray(r.flags)||r.flags.some(x=>!RECOVERY_FLAGS.includes(x))||new Set(r.flags).size!==r.flags.length)return false;
 if(typeof r.ticketFace!=='boolean'||!['12 MAR','14 MAR','16 MAR','21 MAR'].includes(r.date)||![9,15,21,27].includes(r.cost)||!Number.isInteger(r.channel)||r.channel< -1||r.channel>2)return false;
 if(!Array.isArray(r.pattern)||r.pattern.length!==2||!Array.isArray(r.directions)||r.directions.length!==3||[...r.pattern,...r.directions].some(x=>![-1,0,1].includes(x)))return false;
 if(!Array.isArray(r.adoption)||r.adoption.length!==3||r.adoption.some(x=>![0,1,2].includes(x)))return false;
 if(!Array.isArray(r.chain)||r.chain.some(x=>!RECOVERY_CHAIN.includes(x))||new Set(r.chain).size!==r.chain.length||!Number.isInteger(r.hintLevel)||r.hintLevel<1||r.hintLevel>3||!Number.isInteger(r.hintUses)||r.hintUses<0||!Number.isInteger(r.attempts)||r.attempts<0||typeof r.complete!=='boolean')return false;
 const requires={coin:['left-pocket'],ticket:['right-pocket'],'ticket-back':['ticket'],'photo-open':['coin','photo-back'],'book-selected':['photo-open'],'book-open':['book-selected'],trial:['photo-open','ticket-back','book-open'],costs:['trial','rate','overhead'],adoption:['trial','growers','mills','makers'],national:['costs','adoption','ad-check','news-0','news-1','news-2']};
 if(Object.entries(requires).some(([flag,deps])=>has(r,flag)&&deps.some(x=>!has(r,x))))return false;
 if(has(r,'trial')&&r.date!=='14 MAR'||has(r,'costs')&&r.cost!==15||has(r,'adoption')&&r.adoption.join()!=='2,2,2'||has(r,'national')&&r.pattern.join()!=='1,-1')return false;
 const earned={technology:'trial',costs:'costs',adoption:'adoption',supply:'national',outcome:'national'};
 if(r.chain.some(x=>!has(r,earned[x])))return false;
 return !r.complete||(has(r,'national')&&r.chain.join()===RECOVERY_CHAIN.join()&&r.directions.join()==='1,1,-1');
}
export function recoveryAction(r,action,id){
 if(r.complete)return 'This case is complete.';
 if(['left-pocket','right-pocket','photo-back','rate','overhead','growers','mills','makers','ad-check'].includes(action))mark(r,action);
 if(action==='coin'&&has(r,'left-pocket')){mark(r,'coin');return 'Coin collected. Use its edge on the slotted fastener behind the photograph beside the exit.';}
 if(action==='ticket'&&has(r,'right-pocket')){mark(r,'ticket');return 'Tram ticket added.';}
 if(action==='ticket-back'&&has(r,'ticket')){r.ticketFace=!r.ticketFace;if(r.ticketFace)mark(r,'ticket-back');}
 if(action==='photo-open'){
  if(!has(r,'coin'))return 'A coin would turn this slotted fastener.';
  if(has(r,'photo-back')){mark(r,'photo-open');return 'The coin turns the fastener. The backing releases, revealing a leaf-marked journal filing note.';}
 }
 if(action==='book-select'){
  if(!has(r,'photo-open'))return 'Three similar bindings. A shelf reference would identify the right one.';
  if(id!=='botany')return 'That spine does not match the leaf and lower-shelf mark behind the photograph.';
  mark(r,'book-selected');return 'The leaf-stamped journal matches the filing note. Open it to find the dated entries.';
 }
 if(action==='book-open'&&has(r,'book-selected'))mark(r,'book-open');
 if(action==='date'&&!has(r,'trial')&&['12 MAR','14 MAR','16 MAR','21 MAR'].includes(id))r.date=id;
 if(action==='trial'){
  if(!has(r,'photo-open')||!has(r,'ticket-back'))return 'Find the filing instruction behind the photograph and turn over the tram ticket.';
  if(!has(r,'book-open')||r.date!=='14 MAR')return 'That tab does not match the date on the travel pass.';
  mark(r,'trial');return 'V2 trial plate recovered: same harvest, half the pump-hours. This is one field trial.';
 }
 if(action==='cost'&&!has(r,'costs')&&[9,15,21,27].includes(Number(id)))r.cost=Number(id);
 if(action==='costs'){
  if(!has(r,'trial'))return 'The dated journal trial supplies the new pump-hours.';
  if(!has(r,'rate'))return 'Read the pump-hour rate on the utility meter.';
  if(!has(r,'overhead'))return 'Inspect the fixed batch-cost plate in the workbench drawer.';
  if(r.cost!==15)return 'Combine the trial hours, the utility rate, and the unchanged batch costs.';
  mark(r,'costs');return 'Cost die stamped: $21 → $15 for the same batch.';
 }
 if(action==='adopt-pin'&&!has(r,'adoption')){const i=Number(id);if(Number.isInteger(i)&&i>=0&&i<3)r.adoption[i]=(r.adoption[i]+1)%3;}
 if(action==='adoption'){
  if(!has(r,'trial'))return 'First identify the resource-saving design in the dated journal.';
  if(['growers','mills','makers'].some(x=>!has(r,x)))return 'Three producer groups have separate marks. Search the letter rack, material bin, and tall bookcase by the TV.';
  if(r.adoption.join()!=='2,2,2')return 'Connect each group to its installed design, not its retired equipment. Compare the V2 trial mark.';
  mark(r,'adoption');return 'Adoption board sealed: the resource-saving design is installed across growers, mills, and equipment makers.';
 }
 if(action==='channel'){r.channel=r.channel<0?(id==='previous'?2:0):(r.channel+(id==='previous'?2:1))%3;mark(r,'news-'+r.channel);}
 if((action==='pattern'&&!has(r,'national'))||(action==='direction'&&!r.complete)){
  const list=action==='pattern'?r.pattern:r.directions,i=Number(id);
  if(Number.isInteger(i)&&i>=0&&i<list.length)list[i]=list[i]===0?1:list[i]===1?-1:0;
 }
 if(action==='national'){
  if(!has(r,'costs'))return 'The machine’s lower-cost die is missing.';
  if(!has(r,'adoption'))return 'The workbench adoption board must establish that the improvement spread beyond one trial.';
  if(!has(r,'ad-check'))return 'Check the June demand log inside the utility cabinet and retain its seal.';
  if([0,1,2].some(i=>!has(r,'news-'+i)))return 'Read all three June television bulletins before sealing the comparison.';
  if(r.pattern.join()!=='1,-1')return 'Compare June 1 with June 30: which way did output and the price level move?';
  mark(r,'national');return 'Cost, adoption, demand, and national records agree. Two comparison plates release for the exit.';
 }
 const earned={technology:'trial',costs:'costs',adoption:'adoption',supply:'national',outcome:'national'};
 if(action==='place'&&RECOVERY_CHAIN.includes(id)&&has(r,earned[id])&&!r.chain.includes(id))r.chain.push(id);
 if(action==='clear')r.chain=[];
 if(action==='finish'){
  r.attempts++;
  if(!has(r,'national'))return 'Complete the national comparison beside the television first.';
  if(r.chain.join()!==RECOVERY_CHAIN.join()||r.directions.join()!=='1,1,-1')return 'Trace the trial through lower costs, wider adoption, supply, and national outcomes. Aggregate demand stays unchanged.';
  r.complete=true;r.completedAt=Date.now();return 'The second case is solved.';
 }
 return '';
}
export function recoveryHint(r,room='hall'){
 const rows={
 coat:['Both coat pockets hold something.','Search the coat beside the exit.','Open both lower pockets. Take the coin and tram ticket, then turn the ticket over.'],
 photo:['A familiar photograph has a removable back.','The coin fits its slotted fastener.','Turn over the photograph to the right of the exit and use the coin on its fastener.'],
 book:['The backing contains a shelf reference, not a book title.','Match the leaf and lower-shelf sketch above the writing desk. The ticket gives the date.','Choose the leaf-stamped book on the lower shelf, open it, flip your tram ticket, and select the 14 MAR tab.'],
 rate:['A running pump has a separate operating rate.','Search the utility meter beside the shuttered cabinet.','Click the meter, then retain its $2 per pump-hour plate.'],
 overhead:['The trial did not change every batch cost.','A workbench drawer holds the service plate.','Open the workbench drawer and retain the unchanged $9 batch-cost plate.'],
 costs:['Bring the three cost clues to the machine.','Combine trial hours, utility rate, and fixed batch costs.','Rotate the cost wheel to $15: 3 × $2 + $9. Stamp the cost die.'],
 growers:['Another producer kept its installation mark.','Inspect the letter rack by the exit.','Retain the growers’ installation tag from the letter rack: V2 installed in 48 cooperatives.'],
 mills:['The material store records a new type of supply order.','Inspect the workshop bin’s dispatch label.','Retain the mills’ dispatch tag from the material bin: 32 mills use V2.'],
 makers:['Equipment makers kept a matching template.','Look in the tall bookcase immediately left of the TV.','Retain the equipment template from the bookcase: 26 makers installed V2.'],
 adoption:['A single trial cannot establish a national change.','Match three installed designs to the journal’s V2 mark on the workbench board.','At the work-order press, rotate all three connectors to V2, then seal the adoption board.'],
 demand:['The national outcome also depends on spending conditions.','The June log is inside the utility cabinet.','Open the June demand log and retain its AD-unchanged seal.'],
 national:['The television comparison needs several independent records.','Read all three June channels and compare the cost, adoption, and demand seals.','At the TV, read three channels. Click the screen, set output UP and price level DOWN, and seal the comparison.'],
 final:['Return to the exit with five earned artifacts.','Follow the trial through cost, adoption, supply, and outcomes.','Place trial → cost die → adoption board → supply plate → national plate. Set SRAS RIGHT, output UP, prices DOWN. Turn the mechanism.']};
 const pending={coat:!has(r,'coin')||!has(r,'ticket'),photo:!has(r,'photo-open'),book:!has(r,'trial'),rate:!has(r,'rate'),overhead:!has(r,'overhead'),costs:has(r,'trial')&&has(r,'rate')&&has(r,'overhead')&&!has(r,'costs'),growers:!has(r,'growers'),mills:!has(r,'mills'),makers:!has(r,'makers'),adoption:has(r,'trial')&&['growers','mills','makers'].every(x=>has(r,x))&&!has(r,'adoption'),demand:!has(r,'ad-check'),national:has(r,'costs')&&has(r,'adoption')&&has(r,'ad-check')&&!has(r,'national'),final:has(r,'national')};
 const nearby={hall:['coat','photo','growers'],residence:['book'],workshop:['overhead','mills','costs','adoption'],archive:['makers','national'],policy:['rate','demand']}[room]||[];
 const key=nearby.find(x=>pending[x]&&(x!=='photo'||has(r,'coin'))&&(x!=='book'||has(r,'photo-open')))||Object.keys(pending).find(x=>pending[x])||'final';
 return rows[key][r.hintLevel-1];
}
