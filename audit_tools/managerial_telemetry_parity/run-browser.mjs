import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createWorkerHarness} from '../managerial_classroom/worker-harness.mjs';
import {BEHAVIOR_FIELDS} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=process.env.MQ_EVIDENCE_DIR||path.join(root,'validation_artifacts/managerial_telemetry_parity');fs.mkdirSync(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const harness=createWorkerHarness(root),results=[],errors=[];
const server=http.createServer(async(req,res)=>{
 if(req.url.startsWith('/api/anonymous-telemetry-poc/'))return harness.serve(req,res);
 let p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}console.log(name+': '+results.at(-1).status);}
async function start(page,mode){await page.evaluate(mode=>startSelectedMode(mode,{quizConfirmed:true,fadingFortuneConfirmed:true,riskRewardConfirmed:true,trialGraphConfirmed:true}),mode);if(await page.locator('#guideIntroProceed').isVisible().catch(()=>false))await page.locator('#guideIntroProceed').click();await page.waitForFunction(()=>Boolean(currentQuestion));if(mode==='riskReward')await page.evaluate(()=>lockRiskRewardWager(.1));await page.waitForFunction(()=>document.getElementById('answers')?.querySelector('button'));}
async function answer(page){await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}throw Error('No valid option');});}
async function flush(page){await page.evaluate(async()=>{if(window.AnonymousTelemetryPOC)await AnonymousTelemetryPOC.flush();else window.dispatchEvent(new Event('online'));});await page.waitForTimeout(150);}
const captured=()=>[...harness.received.values()];
try{
 for(const branch of ['managerial-directorate-telemetry-poc','managerial-directorate-classroom']){
  for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
   const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
   const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push({branch,game,message:e.message}));
   await page.goto(`${origin}/play/${branch}/${game}/?telemetrySynthetic=1`);
   await check(branch+'/'+game+' live selection/copy → answer → Worker/D1',async()=>{
    await start(page,'standard');
    await page.locator('#question').evaluate(node=>{const range=document.createRange();range.selectNodeContents(node);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);});
    await page.waitForTimeout(300);
    await page.evaluate(()=>document.dispatchEvent(new ClipboardEvent('copy')));
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('blur'));});
    await page.waitForTimeout(250);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});
    await page.waitForTimeout(100);await answer(page);await flush(page);
    const e=captured().findLast(e=>e.gameId===game&&e.buildId===branch&&e.eventType==='answer_evaluated');assert(e,'answer received');
    assert.equal(e.schemaVersion,2);assert.equal(e.tabSwitchCount,1);assert(e.hiddenTimeMs>=200);assert.equal(e.copyCount,1);assert(e.selectionCount>=1);assert(e.timeCopyToHideMs!==null);assert.equal(e.activeResponseTimeMs+e.hiddenTimeMs,e.responseTimeMs);assert(e.responseTimeMs<6000,'telemetry ignores mutated gameplay timer');
    for(const key of BEHAVIOR_FIELDS)assert(key in e,key);
   });
   if(game==='cost-directive'){
    await check(branch+' save/refresh/Continue resets timing state',async()=>{
     await page.evaluate(()=>{room=2;loadQuestion();saveGameState();});await flush(page);const run=captured().findLast(e=>e.buildId===branch&&e.gameId===game).runId;
     await page.reload();await page.evaluate(()=>continueSavedRun());await page.waitForTimeout(150);await answer(page);await flush(page);
     const e=captured().findLast(e=>e.buildId===branch&&e.gameId===game&&e.eventType==='answer_evaluated');assert.equal(e.runId,run);assert.equal(e.copyCount,0);assert.equal(e.hiddenTimeMs,0);assert(e.activeResponseTimeMs>0);assert.equal(e.timeAfterReturnMs,null);
    });
    for(const mode of ['timed','exam','quiz','unlimited','legendary','score','fadingFortune','riskReward'])await check(branch+' '+mode+' response instrumentation',async()=>{
     await page.evaluate(()=>returnToModeSelectFromRun());await start(page,mode);await page.waitForTimeout(100);await answer(page);await flush(page);
     const e=captured().findLast(e=>e.buildId===branch&&e.gameId===game&&e.mode===mode&&['answer_evaluated','exam_answer_initial'].includes(e.eventType));assert(e,'mode response received');assert(e.activeResponseTimeMs>0);assert.equal(e.hiddenTimeMs,0);assert.equal(e.copyCount,0);
    });
   }
   if(game==='market-signal')await check(branch+' trialGraph response instrumentation',async()=>{await page.evaluate(()=>returnToModeSelectFromRun());await start(page,'trialGraph');await page.waitForTimeout(100);await answer(page);await flush(page);const e=captured().findLast(e=>e.buildId===branch&&e.gameId===game&&e.mode==='trialGraph'&&e.eventType==='answer_evaluated');assert(e);assert(e.activeResponseTimeMs>0);});
   await context.close();
  }
 }
 await check('Actual browser payloads export/reconstruct with privacy allowlist',async()=>{
  assert.deepEqual(harness.errors,[]);assert.deepEqual(errors,[]);
  const csv=await(await harness.call('/v1/admin/export.csv?includeSynthetic=1',{admin:true})).text();for(const key of BEHAVIOR_FIELDS)assert(csv.split('\r\n')[0].includes(key));
  for(const e of captured())for(const key of ['questionText','selectedText','copiedText','email','name','userAgent','ipAddress'])assert(!(key in e));
  const run=captured().find(e=>e.copyCount===1).runId;const r=await(await harness.call('/v1/admin/runs/'+run+'/reconstruct',{admin:true})).json();fs.writeFileSync(path.join(out,'browser-reconstruction.json'),JSON.stringify(r,null,2));
 });
}finally{await browser.close();server.close();harness.close();}
const report={passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,receivedEvents:captured().length,results,errors};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
