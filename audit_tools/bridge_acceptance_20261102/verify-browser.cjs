'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{createRequire}=require('module'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../..'),req=createRequire(path.join(root,'audit_tools/elite_pool_revision_20261101/resolve.cjs')),{chromium}=req('playwright');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation';
const source=read(path.join(project,'source/personal-review-list-data.json')),baseline=read(path.join(__dirname,'baseline/personal-review-list-data.json'));
const report=read(path.join(__dirname,'acceptance.json')),approval=report.approval,ids=Object.keys(approval.questionRevisions),idSet=new Set(ids),key='masteryquests-personal-review-v1';
const url=pathToFileURL(path.join(project,'deliverables/MasteryQuests_Question_Review.html')).href;
const qa=path.join(__dirname,'qa');fs.mkdirSync(qa,{recursive:true});
const clone=x=>JSON.parse(JSON.stringify(x));
async function records(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records,key);}
async function main(){
 const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
 try{
  async function open(saved){
   const context=await browser.newContext({viewport:{width:1280,height:1000}});
   if(saved)await context.addInitScript(({key,saved})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,records:saved}));},{key,saved});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForSelector('.card');return {context,page};
  }
  const fresh=await open();let actual=await records(fresh.page);
  assert.deepEqual(actual,source.reviewSeed);
  for(const id of ids){assert.equal(actual[id].status,'pass');assert.equal(actual[id].reviewedRevision,approval.questionRevisions[id]);}
  for(const [id,r]of Object.entries(baseline.reviewSeed))if(!idSet.has(id))assert.deepEqual(actual[id],r);
  const embedded=await fresh.page.evaluate(()=>JSON.parse(document.getElementById('data').textContent));
  assert.equal(embedded.questions.length,7219);assert.equal(embedded.librarySha256,source.librarySha256);assert.deepEqual(embedded.batchApprovals,source.batchApprovals);
  const qById=new Map(embedded.questions.map(q=>[q.id,q]));
  for(const q of source.questions){const r=qById.get(q.id);assert.equal(r.stem,q.q.q);assert.deepEqual(r.options,q.q.options);assert.equal(r.answer,q.answer_index);}
  assert.equal(await fresh.page.locator('#difficulty').inputValue(),'medium');assert.equal(await fresh.page.locator('#status').inputValue(),'unknown');assert.match(await fresh.page.locator('#range').innerText(),/1,586 questions/);
  assert.equal(await fresh.page.locator('#verification').innerText(),'0');await fresh.page.screenshot({path:path.join(qa,'accepted-medium-handoff.png')});
  await fresh.page.locator('#reviewBridgeRevisions').click();assert.equal(await fresh.page.locator('#range').innerText(),'No matching questions');
  await fresh.page.locator('#reviewBridge').click();assert.match(await fresh.page.locator('#range').innerText(),/515 questions/);

  const sampled=clone(baseline.reviewSeed),target='P62C-CPS-BR-020',other=Object.keys(sampled).find(id=>!idSet.has(id));assert(idSet.has(target));
  const beforeApproval=new Date(Date.parse(approval.approvedAt)-1000).toISOString();
  sampled[target]={...sampled[target],status:'flag',notes:'Sampling note preserved by batch acceptance.',reasons:['wording'],answer:1,answerRevision:approval.questionRevisions[target],reviewedRevision:approval.questionRevisions[target],updated:beforeApproval};
  sampled[other]={...sampled[other],status:'flag',notes:'Unrelated review stays untouched.',updated:beforeApproval};
  const sampledTarget=clone(sampled[target]),merged=await open(sampled);actual=await records(merged.page);
  assert.equal(actual[target].status,'pass');assert.equal(actual[target].reviewedRevision,approval.questionRevisions[target]);
  for(const field of ['notes','reasons','answer','answerRevision','updated'])assert.deepEqual(actual[target][field],sampledTarget[field]);
  assert.deepEqual(actual[target].previousReview,sampledTarget.previousReview||sampledTarget);assert.deepEqual(actual[other],sampled[other]);
  // Importing an older backup preserves sampled notes and the batch acceptance.
  const olderPath=path.join(qa,'older-backup.json');fs.writeFileSync(olderPath,JSON.stringify({app:'MasteryQuests personal review',version:1,records:baseline.reviewSeed}));
  await merged.page.locator('#importfile').setInputFiles(olderPath);await merged.page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Restored'));
  assert.deepEqual((await records(merged.page))[target],actual[target]);
  const [download]=await Promise.all([merged.page.waitForEvent('download'),merged.page.locator('#export').click()]);const backupPath=path.join(qa,'accepted-backup.json');await download.saveAs(backupPath);
  assert.deepEqual(read(backupPath).records[target],actual[target]);
  // A backup imported into a clean browser also preserves newer pre-approval notes.
  await fresh.page.locator('#importfile').setInputFiles(backupPath);await fresh.page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Restored'));
  assert.deepEqual((await records(fresh.page))[target],actual[target]);
  // A later manual flag must survive reload and restoration of an older backup.
  await merged.page.locator('#reviewBridge').click();await merged.page.locator('#search').fill(target);await merged.page.waitForFunction(()=>document.querySelectorAll('.card').length===1);
  assert.equal(await merged.page.locator('.card').getAttribute('data-status'),'pass');
  await merged.page.setViewportSize({width:430,height:932});assert(await merged.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await merged.page.screenshot({path:path.join(qa,'accepted-bridge-mobile.png'),fullPage:true});
  await merged.page.locator('[data-kind="status"][value="flag"]').check();const later=(await records(merged.page))[target];assert(Date.parse(later.updated)>Date.parse(approval.approvedAt));assert.equal(later.status,'flag');
  await merged.page.reload();await merged.page.waitForSelector('.card');assert.deepEqual((await records(merged.page))[target],later);
  await merged.page.locator('#importfile').setInputFiles(backupPath);await merged.page.waitForFunction(()=>document.querySelector('#message').textContent.includes('Restored'));assert.deepEqual((await records(merged.page))[target],later);
  assert.deepEqual(errors,[]);
  const result={status:'PASS',acceptedRevisions:336,questionParity:7219,unaffectedReviewRecordsPreserved:6883,mediumUnmarked:1586,defaultQueue:'Medium, not yet marked',pendingBridgeRevisions:0,notesAnswersAndHistoryPreserved:true,olderBackupCannotUndoAcceptance:true,postApprovalFlagsSurviveReloadAndRestore:true,mobileNoOverflow:true,scriptErrors:errors};
  fs.writeFileSync(path.join(__dirname,'browser-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
