import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {start} from '../labyrinth_alignment/test-start.mjs';import {parseCSV} from '../telemetry_contract/validate.mjs';
process.env.MQ_A11Y_OUT='tmp/unified-rpg-telemetry/semantics';const {pw,serve,isolated}=await import('../accessibility_cleanup/support.mjs');
const out=path.resolve(process.env.MQ_A11Y_OUT);fs.mkdirSync(out,{recursive:true});
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
async function download(page,label){const pending=page.waitForEvent('download');await page.evaluate(()=>downloadTelemetryCsv());const file=path.join(out,label+'.csv');await(await pending).saveAs(file);const table=parseCSV(fs.readFileSync(file,'utf8')),header=table.shift();return table.map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]])));}
async function test(name,action){try{await action();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(name+': '+results.at(-1).status);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));}
try{
 for(const game of ['managerial-intelligence-directorate/cost-directive','economic-realm/market-gate','micro-domains/labyrinth-of-choice'])await test(game+' observed visibility/copy/focus, resume and nonduplicating download',async()=>{
  const x=await isolated(browser,origin,{acceptDownloads:true});try{
   const p=x.page;await p.clock.install({time:new Date('2026-10-23T18:00:00Z')});await p.clock.pauseAt(new Date('2026-10-23T18:00:01Z'));await p.goto(origin+'/play/'+game+'/');await start(p,'standard');
   await p.clock.runFor(1000);
   await p.locator('#question').evaluate(n=>{const range=document.createRange();range.selectNodeContents(n);getSelection().removeAllRanges();getSelection().addRange(range);document.dispatchEvent(new Event('selectionchange'));});await p.clock.runFor(300);
   await p.evaluate(()=>{document.dispatchEvent(new Event('copy'));Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('blur'));});
   await p.clock.runFor(2000);
   await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});await p.clock.runFor(3000);
   const i=await p.evaluate(async()=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i))return i;});await p.locator('#answers button').nth(i).click();await p.waitForTimeout(50);
   const label=game.split('/').at(-1);const rows=await download(p,label),r=rows.findLast(r=>r.event==='question');assert.equal(r.correct,'1');
   if(!game.includes('micro-domains')){assert.equal(Number(r.hiddenTimeMs),2000);assert.equal(Number(r.tabSwitchCount),1);assert.equal(Number(r.copyCount),1);assert.equal(Number(r.questionCopied),1);assert(Number(r.selectionCount)>=1);assert(Number(r.focusLossCount)>=1);assert.equal(Number(r.activeResponseTimeMs)+Number(r.hiddenTimeMs),Number(r.responseTimeMs));}
   else{assert.equal(r.hiddenTimeMs,'');assert.equal(r.copyCount,'');}
   const before=await p.evaluate(()=>({run:runID,rows:readLocalTelemetry(runID),attempts:totalAttempts}));await download(p,label+'-again');assert.equal(await p.evaluate(()=>totalAttempts),before.attempts);assert.equal(await p.evaluate(()=>readLocalTelemetry(runID).length),before.rows.length);
   await p.reload();const pending=p.waitForEvent('download');await p.evaluate(run=>downloadTelemetryCsv(run),before.run);const file=path.join(out,label+'-resume.csv');await(await pending).saveAs(file);const table=parseCSV(fs.readFileSync(file,'utf8'));const row=table.slice(1).find(v=>v[table[0].indexOf('eventID')]===r.eventID);for(const key of ['responseTimeMs','activeResponseTimeMs','hiddenTimeMs','copyCount','correct'])assert.equal(row[table[0].indexOf(key)],r[key],key);
  }finally{await x.context.close();}
 });
 await test('Active Labyrinth Exam export never discloses draft correctness, scoring, Daily progress or a key',async()=>{const x=await isolated(browser,origin,{acceptDownloads:true});try{const p=x.page;await p.goto(origin+'/play/micro-domains/labyrinth-of-choice/');await start(p,'exam');await p.locator('#answers button').first().click();const rows=await download(p,'active-exam');for(const r of rows.filter(r=>r.mode==='exam')){for(const key of ['correct','streak','maxStreak','score','bestScore','examChangedCorrect','dailyProgressAfter','dailyCompleted'])assert.equal(r[key],'',key);if(r.answerSnapshotJSON)assert.equal(JSON.parse(r.answerSnapshotJSON).correctOptionIndices,null);}}finally{await x.context.close();}});
}finally{await browser.close();await new Promise(r=>server.close(r));}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
