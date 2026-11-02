'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {createRequire}=require('module'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../..'),req=createRequire(path.join(root,'audit_tools/elite_pool_revision_20261101/resolve.cjs'));
const {chromium}=req('playwright');
const project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),source=read(path.join(project,'source/personal-review-list-data.json'));
const baseline=read(path.join(__dirname,'baseline/personal-review-list-data.json')),ledger=read(path.join(__dirname,'expectations.json'));
const key='masteryquests-personal-review-v1',url=pathToFileURL(path.join(project,'deliverables/MasteryQuests_Question_Review.html')).href,qa=path.join(__dirname,'qa');
async function main(){
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1360,height:1050},acceptDownloads:true});
  await context.addInitScript(({key,records})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,records}));},{key,records:baseline.reviewSeed});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.waitForSelector('.card');
  const embedded=await page.locator('#data').textContent(),data=JSON.parse(embedded);
  assert.equal(data.librarySha256,ledger.afterLibrarySha256);assert.equal(data.questions.length,7143);
  const byId=new Map(data.questions.map(q=>[q.id,q]));
  for(const r of source.questions){const q=byId.get(r.id);assert.equal(q.stem,r.q.q,r.id);assert.deepEqual(q.options,r.q.options,r.id);assert.equal(q.answer,r.answer_index,r.id);assert.equal(q.feedback,r.q.feedback||'',r.id);}
  const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).records,key);
  assert.deepEqual(await state(),source.reviewSeed);assert.equal(await page.locator('#verification').innerText(),'22');
  assert.equal(await page.locator('.card').count(),22);
  await page.screenshot({path:path.join(qa,'review-desktop.png')});
  const search=async id=>{await page.locator('#allQuestions').click();await page.locator('#search').fill(id);await page.waitForFunction(id=>{const cards=[...document.querySelectorAll('.card')];return cards.length===1&&cards[0].dataset.id===id;},id);};
  await search('ECON-NL-INFLATION-RATE-5021');assert.match(await page.locator('.revision-note').innerText(),/Repair → Bridge/);assert.equal(await page.locator('.question-role').innerText(),'Bridge');
  for(const id of source.currentRevisionBatch.acceptedTerminologyQuestionIds){const q=byId.get(id),r=(await state())[id];assert.equal(r.status,'pass');assert.equal(r.reviewedRevision,q.revision);assert(!/\blearner\b/i.test([q.stem,...q.options,q.feedback].join(' ')));assert.equal(r.notes,r.previousReview.notes);}
  await search('LG-R-5036');await page.locator('.meta').evaluate(e=>e.scrollIntoView({block:'center'}));await page.screenshot({path:path.join(qa,'review-rewrite.png')});
  const prior=(await state())['LG-R-5036'];await page.locator('[data-kind="status"][value="pass"]').check();
  const approved=(await state())['LG-R-5036'];assert.equal(approved.status,'pass');assert.deepEqual(approved.previousReview,prior);assert.equal(approved.notes,prior.notes);assert.equal(await page.locator('#verification').innerText(),'21');
  await page.locator('#continueMedium').click();assert.match(await page.locator('#range').innerText(),/1,644 questions/);
  const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise,backup=path.join(qa,'review-backup.json');await download.saveAs(backup);
  const mobileContext=await browser.newContext({viewport:{width:390,height:844}}),mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url);
  await mobile.locator('#importfile').setInputFiles(backup);await mobile.waitForFunction(()=>document.getElementById('verification').textContent==='21');
  const restored=await mobile.evaluate(key=>JSON.parse(localStorage.getItem(key)).records,key);assert.deepEqual(restored,await state());
  await mobile.locator('#allQuestions').click();await mobile.locator('#search').fill('LG-R-5036');await mobile.waitForFunction(()=>document.querySelectorAll('.card').length===1&&document.querySelector('.card').dataset.id==='LG-R-5036');
  await mobile.locator('.meta').evaluate(e=>e.scrollIntoView({block:'center'}));await mobile.screenshot({path:path.join(qa,'review-mobile.png')});
  assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  const report={status:'PASS',librarySha256:ledger.afterLibrarySha256,canonicalReviewParity:7143,pendingRevisions:22,acceptedTerminologyCorrections:55,oldBrowserStateMerged:true,notesAndAnswersPreserved:true,roleChangeDisplayed:true,approvalHistoryAndBackupRestore:true,unmarkedMedium:1644,mobileNoOverflow:true,scriptErrors:errors};
  fs.writeFileSync(path.join(__dirname,'review-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
