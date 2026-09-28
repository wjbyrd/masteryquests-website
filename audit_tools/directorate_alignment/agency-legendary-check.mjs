// Agency-only, real answer/lifecycle runs; synthetic users and local traffic.
import {fs,path,root,chromium,out,server,origin,snap,settle} from './closeout-support.mjs';
import {createHash} from 'node:crypto';
const bankSHA256=createHash('sha256').update(fs.readFileSync(path.join(root,'play/managerial-intelligence-directorate/agency-protocol/agency_protocol_question_bank_student.js'))).digest('hex');
const probe=process.argv.includes('--before-selector');
const results=[];const browser=await chromium.launch({channel:'msedge',headless:true});
const seeds=probe?[6655]:Array.from({length:20},(_,i)=>6655+i*313);
try {
 for(const seed of seeds){
  const context=await browser.newContext();
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));
  const page=await context.newPage();const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))missing.push(r.url().replace(origin,''));});
  await page.clock.install();await page.addInitScript(seed=>{let n=seed;Math.random=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);},seed);
  await page.goto(`${origin}/play/managerial-intelligence-directorate/agency-protocol/`);
  const profiles=probe?['correct']:['correct',...(seed===6655?['second-fresh','mixed']:[])];
  for(const profile of profiles){
   await page.evaluate(()=>startSelectedMode('legendary'));
   let state=await settle(page);const questions=[];const missedRooms=new Set();let saveCheck;
   for(let i=0;i<180&&!state.ending;i++){
    if(state.mode!=='legendary'||state.phase!=='question'||state.pending)throw Error('Not ready '+JSON.stringify(state));
    const q=await page.evaluate(async()=>{
     let choice=-1;for(let n=0;n<currentQuestion.options.length;n++)if(await isPublishedAnswerCorrect(currentQuestion,currentQuestion.options[n]))choice=n;
     return {id:currentQuestion.id,room,choice,target:getTypeTargetMs(currentQuestion.type),pool:currentQuestion.__mqDifficulty,objective:currentQuestion.objective,chapter:currentQuestion.objective.match(/\d+/)?.[0],stage:currentQuestion.bossStage||null,bossHealth,encounter:bossPool.map(q=>q.id)};
    });
    if(q.choice<0)throw Error('Unkeyed question');
    if(i===3){saveCheck=await page.evaluate(()=>{const before=localStorage.getItem(getSaveKey());saveGameState();return {allowsSave:modeAllowsSave(),before,after:localStorage.getItem(getSaveKey())};});if(saveCheck.allowsSave||saveCheck.before!==saveCheck.after)throw Error('Legendary changed save behavior');}
    q.correct=!(profile==='mixed'&&[3,10,16,20,26,30].includes(q.room)&&!missedRooms.has(q.room));
    if(!q.correct)missedRooms.add(q.room);questions.push(q);
    await page.clock.fastForward(Math.max(15000,q.target));
    await page.evaluate(async n=>answer(n),q.correct?q.choice:(q.choice+1)%4);state=await settle(page);
   }
   if(!state.ending||state.completed==='true')throw Error('Legendary completion failed or unlocked Standard '+JSON.stringify(state));
   const report=await page.evaluate(()=>{showMasteryReportScreen();return {mode:gameMode,data:getMasteryReportData(),telemetry:readLocalTelemetry(),text:document.body.innerText};});
   const events=report.telemetry.filter(e=>e.runID===state.runID);
   if(report.data.mode!=='Legendary Mode'||report.data.totalAttempts!==state.attempts||!report.text.includes('Legendary Mode')||!events.length||events.some(e=>e.mode!=='legendary'))throw Error('Report or telemetry misidentified the run');
   const ordinary=questions.filter(q=>q.pool==='legendary'),boss=questions.filter(q=>q.pool==='legendaryBoss');
   const repeats=ordinary.filter((q,i)=>ordinary.findIndex(p=>p.id===q.id)<i).map(q=>q.id);
   const poolSize=await page.evaluate(()=>questionBanks.legendary.length);
   const cycles=Array.from({length:Math.ceil(ordinary.length/poolSize)},(_,i)=>ordinary.slice(i*poolSize,(i+1)*poolSize).map(q=>q.id));
   const exhaustedBeforeRecycle=cycles.every(ids=>new Set(ids).size===ids.length);
   const result={seed,profile,bankSHA256,questions,ordinaryCount:ordinary.length,ordinaryDistinct:new Set(ordinary.map(q=>q.id)).size,repeats,exhaustedBeforeRecycle,bossCount:boss.length,state,report,saveCheck,errors:[...errors],missing:[...missing]};
   results.push(result);fs.writeFileSync(path.join(out,probe?'legendary-before-selector.json':'legendary-runs.json'),JSON.stringify(results,null,2));
   if(!probe&&!exhaustedBeforeRecycle)throw Error('Premature ordinary recycling '+JSON.stringify({seed,profile,repeats}));
   if(errors.length||missing.length)throw Error('Runtime errors '+JSON.stringify({errors,missing}));
   console.log(JSON.stringify({seed,profile,ordinary:ordinary.length,distinct:result.ordinaryDistinct,repeats,boss:boss.length,attempts:state.attempts,standardComplete:state.completed}));
  }
  await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
