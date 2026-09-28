// Mission 2 has its own progress. Old first-case discoveries never unlock its puzzles.
export const RECOVERY_CHAIN=['technology','costs','supply','outcome'];
export const RECOVERY_FLAGS=['left-pocket','right-pocket','coin','ticket','ticket-back','photo-back','photo-open','book-open','trial','costs','news-0','news-1','news-2','national'];
export const has=(r,id)=>r.flags.includes(id);
const mark=(r,id)=>{if(!has(r,id))r.flags.push(id);};
export function newRecovery(){return {version:1,flags:[],ticketFace:false,date:'12 MAR',cost:21,channel:-1,pattern:[0,0],directions:[0,0,0],chain:[],hintLevel:1,hintUses:0,attempts:0,complete:false};}
export function validRecovery(r){
 if(!r||r.version!==1||!Array.isArray(r.flags)||r.flags.some(x=>!RECOVERY_FLAGS.includes(x))||new Set(r.flags).size!==r.flags.length)return false;
 if(typeof r.ticketFace!=='boolean'||!['12 MAR','14 MAR','16 MAR','21 MAR'].includes(r.date)||![9,15,21,27].includes(r.cost)||!Number.isInteger(r.channel)||r.channel< -1||r.channel>2)return false;
 if(!Array.isArray(r.pattern)||r.pattern.length!==2||!Array.isArray(r.directions)||r.directions.length!==3||[...r.pattern,...r.directions].some(x=>![-1,0,1].includes(x)))return false;
 if(!Array.isArray(r.chain)||r.chain.some(x=>!RECOVERY_CHAIN.includes(x))||new Set(r.chain).size!==r.chain.length||!Number.isInteger(r.hintLevel)||r.hintLevel<1||r.hintLevel>3||!Number.isInteger(r.hintUses)||r.hintUses<0||!Number.isInteger(r.attempts)||r.attempts<0||typeof r.complete!=='boolean')return false;
 const requires={'coin':['left-pocket'],'ticket':['right-pocket'],'ticket-back':['ticket'],'photo-open':['coin','photo-back'],'trial':['photo-open','ticket-back','book-open'],'costs':['trial'],'national':['costs','news-0','news-1','news-2']};
 if(Object.entries(requires).some(([flag,deps])=>has(r,flag)&&deps.some(x=>!has(r,x))))return false;
 if(has(r,'trial')&&r.date!=='14 MAR'||has(r,'costs')&&r.cost!==15||has(r,'national')&&r.pattern.join()!=='1,-1')return false;
 return !r.complete||(has(r,'national')&&r.chain.join()===RECOVERY_CHAIN.join()&&r.directions.join()==='1,1,-1');
}
export function recoveryAction(r,action,id){
 if(r.complete)return 'This case is complete.';
 if(action==='left-pocket'||action==='right-pocket'||action==='photo-back'||action==='book-open')mark(r,action);
 if(action==='coin'&&has(r,'left-pocket')){mark(r,'coin');return 'Brass coin added.';}
 if(action==='ticket'&&has(r,'right-pocket')){mark(r,'ticket');return 'Tram ticket added.';}
 if(action==='ticket-back'&&has(r,'ticket')){r.ticketFace=!r.ticketFace;if(r.ticketFace)mark(r,'ticket-back');}
 if(action==='photo-open'){
  if(!has(r,'coin'))return 'A coin would turn this slotted fastener.';
  if(has(r,'photo-back')){mark(r,'photo-open');return 'The backing releases.';}
 }
 if(action==='date'&&!has(r,'trial')&&['12 MAR','14 MAR','16 MAR','21 MAR'].includes(id))r.date=id;
 if(action==='trial'){
  if(!has(r,'photo-open')||!has(r,'ticket-back'))return 'Find the filing instruction behind the photograph and turn over the tram ticket.';
  if(!has(r,'book-open')||r.date!=='14 MAR')return 'That tab does not match the date on the travel pass.';
  mark(r,'trial');return 'Trial notes filed.';
 }
 if(action==='cost'&&!has(r,'costs')&&[9,15,21,27].includes(Number(id)))r.cost=Number(id);
 if(action==='costs'){
  if(!has(r,'trial'))return 'Find the trial notes in the gardening journal first.';
  if(r.cost!==15)return 'Use the trial pump hours, the hourly energy price, and the unchanged other costs.';
  mark(r,'costs');return 'Updated unit cost recorded.';
 }
 if(action==='channel'){r.channel=r.channel<0?(id==='previous'?2:0):(r.channel+(id==='previous'?2:1))%3;mark(r,'news-'+r.channel);}
 if(action==='pattern'&&!has(r,'national')||action==='direction'){
  const list=action==='pattern'?r.pattern:r.directions,i=Number(id);
  if(Number.isInteger(i)&&i>=0&&i<list.length)list[i]=list[i]===0?1:list[i]===1?-1:0;
 }
 if(action==='national'){
  if(!has(r,'costs')||[0,1,2].some(i=>!has(r,'news-'+i)))return 'Compare the updated unit cost with all three June television bulletins.';
  if(r.pattern.join()!=='1,-1')return 'Compare June 1 with June 30: which way did output and the price level move?';
  mark(r,'national');return 'National comparison recorded. Return to the exit door.';
 }
 if(action==='place'&&RECOVERY_CHAIN.includes(id)&&!r.chain.includes(id))r.chain.push(id);
 if(action==='clear')r.chain=[];
 if(action==='finish'){
  r.attempts++;
  if(!has(r,'national'))return 'Complete the national comparison beside the television first.';
  if(r.chain.join()!==RECOVERY_CHAIN.join()||r.directions.join()!=='1,1,-1')return 'Follow the lower production costs through supply, output, and prices. Aggregate demand stays unchanged.';
  r.complete=true;return 'The second case is solved.';
 }
 return '';
}
export function recoveryHint(r){
 const row=!has(r,'coin')||!has(r,'ticket')?['Begin with the coat beside the exit.','Search both lower coat pockets.','Open the left pocket and take the coin. Open the right pocket and take the tram ticket.']:
 !has(r,'photo-open')?['The framed photograph beside the exit has a removable backing.','Turn over the photograph and examine its slotted fastener.','Click the photograph to the right of the exit. Turn it over, then click the fastener to use the coin.']:
 !has(r,'trial')?['The photograph points to a dated gardening journal.','Flip the tram ticket in your satchel. Find the gardening book on the shelf above the writing desk.','The tram ticket reads 14 MAR. Open the gardening book on the left side of the lower shelf above the desk, choose 14 MAR, and open that tab.']:
 !has(r,'costs')?['The trial changed the resources needed for each batch.','At the idle machine beside the workbench, compare the trial pump hours with the energy rate.','Use 3 pump-hours × $2 per hour + $9 other costs = $15 per batch. Set $15 at the machine and stamp the cost record.']:
 !has(r,'national')?['One garden trial cannot establish a national supply change.','Read all three June bulletins on the television, then click its screen to compare the national figures.','Use the upper TV knob to read all three channels. Click the screen: real output rose 200 → 216 and the price level fell 100 → 96. Set output UP and prices DOWN, then seal the comparison.']:
 ['Return to the exit and reconstruct the new sequence.','Widespread adoption lowers unit costs. With demand unchanged, identify the supply shift and its effects.','Arrange adoption → lower costs → increased short-run supply → higher output and lower prices. Set SRAS RIGHT, output UP, prices DOWN, then turn the exit mechanism.'];
 return row[r.hintLevel-1];
}
