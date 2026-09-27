// Controlled, seeded Standard selection traversals; no telemetry or user saves.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!/^\/(play|assets|build)\//.test(relative)){res.writeHead(403).end();return;}
 let file=path.resolve(root,'.'+relative);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const out=path.join(root,'_private_course_sources/eco6655/alignment-audit/continuation-2026-09-27');
let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
  const context=await browser.newContext();
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  const page=await context.newPage();
  await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
  const data=await page.evaluate(()=>{
   const runs=[];const originalRandom=Math.random;
   try{
    for(const profile of ['steady-correct','fast-correct'])for(let seed=1;seed<=40;seed++){
     let state=seed;Math.random=()=>((state=(Math.imul(1664525,state)+1013904223)>>>0)/4294967296);
     gameMode='standard';room=1;streak=0;maxStreak=0;totalAttempts=0;conceptMemory={};
     // Skip presentation-only intros so each call actually selects a question.
     if(typeof signalArchitectIntroPlayed!=='undefined')signalArchitectIntroPlayed=true;
     if(typeof principalIntroPlayed!=='undefined')principalIntroPlayed=true;
     if(typeof lastTypes!=='undefined')lastTypes=[];
     if(typeof adaptiveMode!=='undefined')adaptiveMode='support';
     if(typeof legendaryBossObjectivesUsedThisRun!=='undefined')legendaryBossObjectivesUsedThisRun=[];
     masteryState={byTag:{},byObjective:{},bySkill:{},byDifficulty:{},recent:[],attemptEvidence:[]};
     questionHistory=Object.fromEntries(['easy','medium','hard','elite','legendary','easyBoss','mediumBoss','finalBoss','legendaryBoss','repair','bridge','calculation'].map(k=>[k,[]]));
     usedQuestions=Object.fromEntries(Object.keys(questionHistory).map(k=>[k,[]]));tagHistory=[];bossPool=[];bossHealth=3;resetRemediationState();
     const records=[];
     for(let targetRoom=1;targetRoom<=30;targetRoom++){
      room=targetRoom;bossPool=[];bossHealth=3;
      const count=targetRoom%10===0?3:1;
      for(let step=0;step<count;step++){
       currentQuestion=null;loadQuestion();
       if(!currentQuestion)throw Error('No question at room '+targetRoom);
       const q=currentQuestion;
       if(count===3&&!q.__mqDifficulty?.includes('Boss'))throw Error('Expected boss selection at room '+targetRoom);
       if(!Object.values(questionBanks).some(pool=>Array.isArray(pool)&&pool.some(record=>record.id===q.id)))throw Error('Selection outside audited main bank: '+q.id);
       records.push({room:targetRoom,id:q.id,objective:q.objective,pool:q.__mqDifficulty,type:q.type,skill:getSkillKey(q),image:!!q.image,matrix:/<table|payoffs are|payoff matrix/i.test(q.q)});
       const responseTime=getTypeTargetMs(q.type)*(profile==='steady-correct'?1.5:0.9);
       for(const tag in conceptMemory)conceptMemory[tag]*=.95;
       recordAdaptiveAttempt(q,true,responseTime);streak++;maxStreak=Math.max(streak,maxStreak);totalAttempts++;
       if(q.tag)conceptMemory[q.tag]=0;
       if(count===3)bossHealth--;
      }
     }
     if(records.length!==36)throw Error('Expected 27 ordinary questions plus 9 boss stages');
     runs.push({profile,seed,records});
    }
   }finally{Math.random=originalRandom;}
   return runs;
  });
  const profiles={};
  for(const profile of ['steady-correct','fast-correct']){
   const runs=data.filter(r=>r.profile===profile),rows=runs.flatMap(r=>r.records),chapters={},pools={};
   for(const q of rows){const ch=q.objective?.match(/^LO(\d+)/)?.[1]||'unknown';chapters[ch]=(chapters[ch]||0)+1;pools[q.pool]=(pools[q.pool]||0)+1;}
   profiles[profile]={runs:runs.length,questions:rows.length,chapterShares:Object.fromEntries(Object.entries(chapters).map(([ch,n])=>[ch,+(100*n/rows.length).toFixed(2)])),poolCounts:pools,graphQuestions:rows.filter(q=>q.image).length,matrixQuestions:rows.filter(q=>q.matrix).length,meanDistinctObjectives:runs.reduce((n,r)=>n+new Set(r.records.map(q=>q.objective)).size,0)/runs.length};
  }
  results.push({game,profiles,runs:data});console.log(JSON.stringify({game,profiles}));
  // Confirm new table questions render through the same public question surface.
  if(game==='strategy-desk'){
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(()=>{const box=document.getElementById('question');const q=questionBanks.hard.find(q=>q.id===13003);box.innerHTML=q.q;document.body.replaceChildren(box);box.style.cssText='display:block;position:relative;width:350px;max-width:100%;margin:12px;padding:6px;';});
   await page.locator('#question').screenshot({path:path.join(out,'matrix-mobile.png')});
  }
  await context.close();
 }
 const graph=await browser.newPage({viewport:{width:760,height:530}});
 await graph.goto(`${origin}/play/managerial-intelligence-directorate/market-signal/market_curves_independent.svg`);
 await graph.screenshot({path:path.join(out,'independent-market-graph.png')});
 await graph.close();
 fs.writeFileSync(path.join(out,'campaign-exposure.json'),JSON.stringify({method:'Actual loadQuestion and recordAdaptiveAttempt, seeded RNG, fresh state per traversal, all answers correct; direct room advance bypasses UI delays and telemetry. Two response-time profiles. These are controlled selection samples, not observed student behavior or miss/retreat simulations.',results},null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
