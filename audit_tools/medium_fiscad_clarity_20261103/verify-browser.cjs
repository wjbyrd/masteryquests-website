'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{createRequire}=require('module'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../..'),req=createRequire(path.join(root,'audit_tools/elite_pool_revision_20261101/resolve.cjs')),{chromium}=req('playwright');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation',source=read(path.join(project,'source/personal-review-list-data.json')),baseline=read(path.join(__dirname,'baseline/personal-review-list-data.json')),ledger=require('./expectations.json'),change=ledger.changes[0],id=change.id,key='masteryquests-personal-review-v1';
async function main(){const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await browser.newContext({viewport:{width:1280,height:1100}});await context.addInitScript(({key,records})=>localStorage.setItem(key,JSON.stringify({version:1,records})),{key,records:baseline.reviewSeed});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(project,'deliverables/MasteryQuests_Question_Review.html')).href);await page.waitForSelector('.card');
 await page.locator('#reviewMediumRevisions').click();await page.locator('#search').fill(id);await page.waitForFunction(id=>document.querySelectorAll('.card').length===1&&document.querySelector('.card').dataset.id===id,id);
 const actual=await page.evaluate(key=>({data:JSON.parse(document.getElementById('data').textContent),records:JSON.parse(localStorage.getItem(key)).records}),key);
 assert.equal(actual.data.librarySha256,ledger.afterLibrarySha256);assert.deepEqual(actual.records,baseline.reviewSeed);
 const row=actual.data.questions.find(q=>q.id===id);assert.equal(row.stem,change.afterRecord.q);assert.deepEqual(row.options,change.afterRecord.options);assert.equal(row.answer,2);assert.equal(row.feedback,change.afterRecord.feedback);assert.notEqual(actual.records[id].reviewedRevision,row.revision);assert.equal(row.previous.stem,change.beforeRecord.q);
 assert.match(await page.locator('.revision-note').innerText(),/Changed: question, answer choices, explanation/);assert.equal(await page.locator('.stem').innerText(),change.afterRecord.q);await page.screenshot({path:path.join(__dirname,'qa/review.png'),fullPage:true});
 await page.setViewportSize({width:430,height:932});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(__dirname,'qa/review-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 const out={status:'PASS',id,currentQuestionDisplayed:true,answer:'C. $120',allPriorReviewRecordsPreserved:true,newRevisionPending:true,mobileNoOverflow:true};fs.writeFileSync(path.join(__dirname,'review-validation.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
 }finally{await browser.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
