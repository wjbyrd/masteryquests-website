import {CONTRACT_FIELDS} from '../../server/anonymous-telemetry-poc/measurement-contract.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createWorkerHarness} from '../managerial_classroom/worker-harness.mjs';
import {BEHAVIOR_FIELDS} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=process.env.MQ_EVIDENCE_DIR||path.join(root,'validation_artifacts/managerial_local_csv_parity');fs.mkdirSync(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const harness=createWorkerHarness(root),results=[],examples=[],errors=[];
const server=http.createServer(async(req,res)=>{
 if(req.url.startsWith('/api/anonymous-telemetry-poc/'))return harness.serve(req,res);
 let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.stack});}console.log(name+': '+results.at(-1).status);}
function parseCsv(text){text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';}else field+=c;}if(field||row.length){row.push(field);rows.push(row);}assert(!quoted);return rows;}
async function answer(page){await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}throw Error('No valid option');});}
async function select(page){await page.locator('#question').evaluate(n=>{const r=document.createRange();r.selectNodeContents(n);getSelection().removeAllRanges();getSelection().addRange(r);});await page.waitForTimeout(300);}
async function visibility(page,hidden){await page.evaluate(hidden=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>hidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event(hidden?'blur':'focus'));},hidden);}
async function download(page,name){
 if(await page.locator("#bossRevealProceed").isVisible().catch(()=>false))await page.locator("#bossRevealProceed").click();
 await page.evaluate(()=>{beginRunSession();runEnding=true;stopTimedModeClock();return showMasteryReportScreen();});
 const [d]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download Game Data',exact:true}).last().click()]);const file=path.join(out,name+'.csv');await d.saveAs(file);const text=fs.readFileSync(file,'utf8'),rows=parseCsv(text),header=rows.shift();assert.equal(text.charCodeAt(0),0xFEFF,'UTF-8 marker for Excel');assert(new Set(header).size===header.length);assert(rows.every(r=>r.length===header.length));
 return {header,text,rows:rows.map(r=>Object.fromEntries(header.map((k,i)=>[k,r[i]])))};
}
const scenarios=['normal','tab-switch','selection-only','copy','copy-leave','next-question','pause-resume','incomplete','exam','legacy-quoting','offline'];
try{
 for(const branch of ['managerial-directorate-classroom','managerial-directorate-telemetry-poc'])for(const game of ['cost-directive','market-signal'])for(const scenario of scenarios){
  if(game==='market-signal'&&!['normal','copy-leave','exam'].includes(scenario))continue;
  const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  await check(branch+'/'+game+'/'+scenario,async()=>{
   await page.goto(`${origin}/play/${branch}/${game}/?telemetrySynthetic=1`);
   await page.evaluate(mode=>startSelectedMode(mode),scenario==='exam'?'exam':'standard');if(await page.locator('#guideIntroProceed').isVisible().catch(()=>false))await page.locator('#guideIntroProceed').click();await page.waitForFunction(()=>Boolean(currentQuestion));await page.waitForTimeout(100);
   if(['selection-only','copy','copy-leave','next-question','pause-resume'].includes(scenario))await select(page);
   if(['copy','copy-leave','next-question','pause-resume'].includes(scenario))await page.evaluate(()=>document.dispatchEvent(new ClipboardEvent('copy')));
   if(['tab-switch','copy-leave'].includes(scenario)){await visibility(page,true);await page.waitForTimeout(220);await visibility(page,false);await page.waitForTimeout(100);}
   if(scenario==='next-question'){await answer(page);await page.evaluate(()=>{getSelection().removeAllRanges();room++;loadQuestion();});await page.waitForTimeout(100);}
   if(scenario==='pause-resume'){await page.evaluate(()=>{saveGameState();returnToModeSelectFromRun();});await visibility(page,true);await page.waitForTimeout(100);await page.reload();await page.evaluate(()=>continueSavedRun());await page.waitForTimeout(100);}
   if(scenario==='offline')harness.setOffline(true);
   if(scenario!=='incomplete')await answer(page);
   if(scenario==='exam'&&branch.includes('classroom')){for(let n=2;n<=9;n++){await page.evaluate(n=>navigateExamRoom(n),n);await page.waitForTimeout(20);await answer(page);}await page.evaluate(()=>commitExamSection(getExamSectionState(1)));}
   if(scenario==='legacy-quoting')await page.evaluate(()=>{const rows=readLocalTelemetry();rows.unshift({eventID:'legacy-fixture',runID,event:'legacy',responseTimeMs:777,tag:'Comma, "quote"\nΩ'});localStorage.setItem(getTelemetryKey(),JSON.stringify(rows));});
   await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.waitForTimeout(160);
   const queue=await page.evaluate(()=>JSON.parse(localStorage.getItem('anonymousTelemetry:queue:v1')||'[]'));
   const source=await page.evaluate(()=>String(runID));
   const remote=[...new Map([...harness.received.values(),...queue].filter(e=>e.buildId===branch&&e.gameId===game&&e.sourceRunId===source).map(e=>[e.eventId,e])).values()];
   const csv=await download(page,branch+'-'+game+'-'+scenario);
   const html=fs.readFileSync(path.join(root,'play/managerial-intelligence-directorate',game,'index.html'),'utf8');const original=vm.runInNewContext(html.match(/const TELEMETRY_COLUMNS = (\[[\s\S]*?\]);/)[1]);assert.deepEqual(csv.header.slice(0,original.length),Array.from(original));assert.deepEqual(csv.header.slice(original.length),[...BEHAVIOR_FIELDS,'gameplayResponseTimeMs',...CONTRACT_FIELDS]);
   const responseRows=csv.rows.filter(r=>['question','rapid_guessing','exam_answer_initial','exam_answer_revision'].includes(r.event));
   for(const row of responseRows){const candidates=remote.filter(e=>e.position===Number(row.room)&&String(e.questionId)===row.questionID&&(row.event.startsWith('exam_')?e.eventType===row.event:e.eventType==='answer_evaluated'));
    assert(candidates.some(e=>['responseTimeMs',...BEHAVIOR_FIELDS].every(k=>String(e[k]??'')===row[k])),'Exact snapshot match for '+row.event+' room '+row.room);
   }
   const row=responseRows.at(-1);
   if(scenario==='incomplete'){assert.equal(responseRows.length,0);assert(csv.rows.length>0);assert(csv.rows.every(r=>BEHAVIOR_FIELDS.every(k=>r[k]==='')));}
   else {assert(row);assert(Number(row.responseTimeMs)>0);assert(Number(row.gameplayResponseTimeMs)>=6000 || scenario==='exam');
    if(['normal','next-question','pause-resume','offline'].includes(scenario))for(const key of ['hiddenTimeMs','tabSwitchCount','selectionCount','copyCount'])assert.equal(row[key],'0',key);
    if(['tab-switch','copy-leave'].includes(scenario)){assert(Number(row.hiddenTimeMs)>0);assert(Number(row.responseTimeMs)>Number(row.activeResponseTimeMs));assert.equal(row.tabSwitchCount,'1');assert.notEqual(row.timeAfterReturnMs,'');}
    if(['selection-only','copy','copy-leave'].includes(scenario)){assert(Number(row.selectionCount)>0);assert(Number(row.maxSelectedChars)>0);assert.equal(row.questionSelected,'1');}
    if(scenario==='selection-only')assert.equal(row.copyCount,'0');
    if(['copy','copy-leave'].includes(scenario)){assert.equal(row.copyCount,'1');assert.equal(row.questionCopied,'1');}
    if(scenario==='copy-leave'){assert.notEqual(row.timeCopyToHideMs,'');assert.notEqual(row.timeCopyToBlurMs,'');}
    examples.push({branch,game,scenario,event:row.event,local:Object.fromEntries(['responseTimeMs',...BEHAVIOR_FIELDS,'gameplayResponseTimeMs'].map(k=>[k,row[k]])),anonymous:remote.find(e=>['responseTimeMs',...BEHAVIOR_FIELDS].every(k=>String(e[k]??'')===row[k]))});
   }
   if(scenario==='legacy-quoting'){const old=csv.rows.find(r=>r.event==='legacy');assert.equal(old.tag,'Comma, "quote"\nΩ');assert.equal(old.responseTimeMs,'777');for(const k of BEHAVIOR_FIELDS)assert.equal(old[k],'');}
   for(const forbidden of ['selectedText','copiedText','clipboardContents','questionText','keystrokes','userAgent','browserHistory'])assert(!csv.header.includes(forbidden));
   const stem=await page.evaluate(()=>currentQuestion?.q||'');if(stem&&stem.length>20)assert(!csv.text.includes(stem));
   const localCount=await page.evaluate(()=>readLocalTelemetry().length);assert.equal(csv.rows.filter(r=>r.event!=='export_manifest').length,localCount,'Original event count is preserved alongside explicit manifest rows');
  });
  harness.setOffline(false);await context.close();
 }
 await check('Worker receives valid schema 3 and no browser exceptions',()=>{assert.deepEqual(harness.errors,[]);assert.deepEqual(errors,[]);});
}finally{await browser.close();server.close();harness.close();}
const report={passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,results,examples:examples.map(e=>({...e,anonymous:Object.fromEntries(['eventType','responseTimeMs',...BEHAVIOR_FIELDS].map(k=>[k,e.anonymous?.[k]??null]))}))};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:results.filter(r=>r.status==='FAIL')},null,2));if(report.failed)process.exitCode=1;
