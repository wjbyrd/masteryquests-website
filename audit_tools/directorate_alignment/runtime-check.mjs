import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
const allGames=['cost-directive','market-signal','strategy-desk','agency-protocol'];
const requestedGame=process.env.AUDIT_GAME;
if(requestedGame&&!allGames.includes(requestedGame))throw Error('Unknown AUDIT_GAME');
const games=requestedGame?[requestedGame]:allGames;
const standardOnly=process.argv.includes('--standard-only');
const results=[];
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname);
 if(!/^\/(play|assets|build)\//.test(relative)){res.writeHead(403).end();return;}
 let file=path.resolve(root,'.'+relative);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 for(const game of games){
  const context=await browser.newContext();
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
  const result=await page.evaluate(async({standardOnly,checkCost})=>{
   let randomState=0x6655;
   Math.random=()=>((randomState=(Math.imul(1664525,randomState)+1013904223)>>>0)/4294967296);
   const bank=Object.values(questionBanks).flat();
   const repairs=Object.values(microSkillRepairPools).flat();const bridges=Object.values(microSkillBridgePools).flat();
   const rows=[...bank,...repairs,...bridges];let checks=0;const invalid=[];
   for(const q of rows){let matches=0;for(const option of q.options){matches+=await isPublishedAnswerCorrect(q,option)?1:0;checks++;}if(matches!==1)invalid.push(q.id);}
   const routeIssues=[];const routeObjectiveMismatches=[];const routeSelections=[];let routeChecks=0;
   gameMode='standard';room=25;
   const routeBank=standardOnly?Object.entries(questionBanks).filter(([pool])=>!['legendary','legendaryBoss'].includes(pool)).flatMap(([,questions])=>questions):bank;
   for(const q of routeBank){
    const state={active:true,skill:getSkillKey(q),objective:inferObjective(q),tag:q.tag,originQuestionId:q.id};
    for(const stage of ['repair','bridge','retest']){
     questionHistory.repair=[];questionHistory.bridge=[];
     const selected=getRemediationQuestion({...state,stage});routeChecks++;
     routeSelections.push({id:q.id,stage,selected:selected?.id,sourceSkill:getSkillKey(q),selectedSkill:selected?getSkillKey(selected):null,sourceObjective:q.objective,selectedObjective:selected?.objective});
     if(!selected)routeIssues.push({id:q.id,stage,issue:'No selection'});
     else if(stage==='repair'&&!repairs.some(r=>r.id===selected.id))routeIssues.push({id:q.id,stage,selected:selected.id,issue:'Main-bank fallback instead of repair'});
     else if(stage==='bridge'&&!bridges.some(r=>r.id===selected.id))routeIssues.push({id:q.id,stage,selected:selected.id,issue:'Main-bank fallback instead of bridge'});
     if(selected && getBossObjectiveKey(selected)!==getBossObjectiveKey(q))routeObjectiveMismatches.push({id:q.id,stage,selected:selected.id,sourceObjective:q.objective,selectedObjective:selected.objective});
    }
   }
   const costRouteSelections=[],costRouteIssues=[],historyRegression=[];
   if(checkCost){
    // Exercise room-appropriate retests, including the final-boss Elite pool.
    for(const [poolName,atRoom] of [['easy',5],['medium',15],['hard',25],['elite',25],['easyBoss',10],['mediumBoss',20],['finalBoss',30]]){
     room=atRoom;
     for(const q of questionBanks[poolName]){
      questionHistory=Object.fromEntries(Object.keys(questionHistory).map(k=>[k,[]]));
      const state={active:true,skill:getSkillKey(q),objective:inferObjective(q),tag:q.tag,originQuestionId:q.id};
      for(let cycle=0;cycle<2;cycle++)for(const stage of ['repair','bridge','retest']){
       const selected=getRemediationQuestion({...state,stage});
       const entry={id:q.id,room:atRoom,cycle,stage,selected:selected?.id,sourceSkill:state.skill,selectedSkill:selected?getSkillKey(selected):null};
       costRouteSelections.push(entry);
       if(!selected||entry.sourceSkill!==entry.selectedSkill)costRouteIssues.push(entry);
      }
     }
    }
    for(const poolName of ['easy','medium','hard','elite']){
     const pool=questionBanks[poolName];
     for(const skill of [...new Set(pool.map(resolveRecordSkill))]){
      const matches=pool.filter(q=>resolveRecordSkill(q)===skill),q=matches[0];
      const withHistory=getQuestionsMatchingNeed(pool,inferObjective(q),q.tag,matches.map(q=>q.id),skill);
      const retry=getQuestionsMatchingNeed(pool,inferObjective(q),q.tag,[],skill);
      questionHistory[poolName]=matches.map(q=>q.id);
      const picked=pickRemediationFromBank(poolName,inferObjective(q),q.tag,'confirm',skill);
      historyRegression.push({pool:poolName,skill,pass:withHistory.length===0&&retry.length===matches.length&&resolveRecordSkill(picked)===skill});
     }
    }
   }
   const bossIssues=[];let bossChecks=0;
   for(const name of (standardOnly?['easyBoss','mediumBoss','finalBoss']:['easyBoss','mediumBoss','finalBoss','legendaryBoss'])){
    const pool=questionBanks[name];
    for(const objective of [...new Set(pool.map(getBossObjectiveKey))]){
     for(let i=0;i<5;i++){
      const group=buildBossQuestionSet(pool,name,objective);bossChecks++;
      if((pool.some(q=>q.bossStage)&&name!=='legendaryBoss'&&group.map(q=>q.bossStage).join(',')!=='opening,middle,final')||group.length!==3||new Set(group.map(q=>q.id)).size!==3)bossIssues.push({pool:name,objective,ids:group.map(q=>q.id)});
     }
    }
   }
   const modes=typeof FACULTY_MODE_REQUIREMENTS==='object'?Object.keys(FACULTY_MODE_REQUIREMENTS):['standard','timed','exam','quiz','unlimited','legendary','score'];
   const modePreflights=Object.fromEntries(modes.map(mode=>[mode,validateFacultyMode(mode)]));
   return {records:rows.length,answerChecks:checks,invalidAnswers:invalid,standardPreflight:validateFacultyMode('standard'),modePreflights,routeChecks,routeIssues,routeObjectiveMismatches,routeSelections,bossChecks,bossIssues,costRouteSelections,costRouteIssues,historyRegression};
  },{standardOnly,checkCost:game==='cost-directive'});
  result.game=game;result.pageErrors=errors;results.push(result);
  console.log(JSON.stringify({game,records:result.records,invalidAnswers:result.invalidAnswers.length,standardPreflight:result.standardPreflight.ok,routeIssues:result.routeIssues.length,routeObjectiveMismatches:result.routeObjectiveMismatches.length,bossIssues:result.bossIssues.length,pageErrors:errors}));
  await context.close();
 }
 const out=path.join(process.env.AUDIT_OUTPUT_DIR||path.join(root,'_private_course_sources/eco6655/alignment-audit'),'runtime-validation.json');
 fs.writeFileSync(out,JSON.stringify(results,null,2));
 if(results.some(r=>r.invalidAnswers.length||Object.values(r.modePreflights).some(p=>!p.ok)||r.routeIssues.length||r.bossIssues.length||r.pageErrors.length||r.costRouteIssues.length||r.historyRegression.some(c=>!c.pass)))process.exitCode=1;
}finally{await browser?.close();await new Promise(r=>server.close(r));}

