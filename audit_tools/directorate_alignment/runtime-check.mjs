import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE);
const games=['cost-directive','market-signal','strategy-desk','agency-protocol'];
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
  const result=await page.evaluate(async()=>{
   const bank=Object.values(questionBanks).flat();
   const repairs=Object.values(microSkillRepairPools).flat();const bridges=Object.values(microSkillBridgePools).flat();
   const rows=[...bank,...repairs,...bridges];let checks=0;const invalid=[];
   for(const q of rows){let matches=0;for(const option of q.options){matches+=await isPublishedAnswerCorrect(q,option)?1:0;checks++;}if(matches!==1)invalid.push(q.id);}
   const routeIssues=[];let routeChecks=0;
   gameMode='standard';room=25;
   for(const q of bank){
    const state={active:true,skill:getSkillKey(q),objective:inferObjective(q),tag:q.tag,originQuestionId:q.id};
    for(const stage of ['repair','bridge','retest']){
     questionHistory.repair=[];questionHistory.bridge=[];
     const selected=getRemediationQuestion({...state,stage});routeChecks++;
     if(!selected)routeIssues.push({id:q.id,stage,issue:'No selection'});
     else if(stage==='repair'&&!repairs.some(r=>r.id===selected.id))routeIssues.push({id:q.id,stage,selected:selected.id,issue:'Main-bank fallback instead of repair'});
     else if(stage==='bridge'&&!bridges.some(r=>r.id===selected.id))routeIssues.push({id:q.id,stage,selected:selected.id,issue:'Main-bank fallback instead of bridge'});
    }
   }
   const bossIssues=[];let bossChecks=0;
   for(const name of ['easyBoss','mediumBoss','finalBoss','legendaryBoss']){
    const pool=questionBanks[name];
    for(const objective of [...new Set(pool.map(getBossObjectiveKey))]){
     for(let i=0;i<5;i++){
      const group=buildBossQuestionSet(pool,name,objective);bossChecks++;
      if((pool.some(q=>q.bossStage)&&name!=='legendaryBoss'&&group.map(q=>q.bossStage).join(',')!=='opening,middle,final')||group.length!==3||new Set(group.map(q=>q.id)).size!==3)bossIssues.push({pool:name,objective,ids:group.map(q=>q.id)});
     }
    }
   }
   return {records:rows.length,answerChecks:checks,invalidAnswers:invalid,standardPreflight:validateFacultyMode('standard'),routeChecks,routeIssues,bossChecks,bossIssues};
  });
  result.game=game;result.pageErrors=errors;results.push(result);
  console.log(JSON.stringify({game,records:result.records,invalidAnswers:result.invalidAnswers.length,standardPreflight:result.standardPreflight.ok,routeIssues:result.routeIssues.length,bossIssues:result.bossIssues.length,pageErrors:errors}));
  await context.close();
 }
 const out=path.join(root,'_private_course_sources/eco6655/alignment-audit/runtime-validation.json');
 fs.writeFileSync(out,JSON.stringify(results,null,2));
 if(results.some(r=>r.invalidAnswers.length||!r.standardPreflight.ok||r.routeIssues.length||r.bossIssues.length||r.pageErrors.length))process.exitCode=1;
}finally{await browser?.close();await new Promise(r=>server.close(r));}

