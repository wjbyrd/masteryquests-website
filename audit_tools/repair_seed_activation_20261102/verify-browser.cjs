'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{createRequire}=require('module'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../..'),req=createRequire(path.join(root,'audit_tools/elite_pool_revision_20261101/resolve.cjs')),{chromium}=req('playwright');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation';
const source=read(path.join(project,'source/personal-review-list-data.json')),baseline=read(path.join(__dirname,'baseline/personal-review-list-data.json')),ledger=require('./expectations.json'),key='masteryquests-personal-review-v1';
async function main(){
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:1000}});await context.addInitScript(({key,records})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,records}));},{key,records:baseline.reviewSeed});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(project,'deliverables/MasteryQuests_Question_Review.html')).href);await page.waitForSelector('.card');
  assert.equal(await page.locator('#verification').innerText(),'22');assert.equal(await page.locator('#done').innerText(),'2,638');
  const actual=await page.evaluate(key=>({data:JSON.parse(document.getElementById('data').textContent).questions,hash:JSON.parse(document.getElementById('data').textContent).librarySha256,records:JSON.parse(localStorage.getItem(key)).records}),key);
  assert.equal(actual.hash,ledger.afterLibrarySha256);assert.deepEqual(actual.records,source.reviewSeed);const byId=new Map(actual.data.map(q=>[q.id,q]));
  for(const r of source.questions){const q=byId.get(r.id);assert.equal(q.stem,r.q.q);assert.deepEqual(q.options,r.q.options);assert.equal(q.answer,r.answer_index);}
  const promoted=ledger.changes.filter(c=>byId.has(c.id));assert.equal(promoted.length,8);
  for(const c of promoted){assert.equal(byId.get(c.id).role,'repair');assert.equal(actual.records[c.id].status,'pass');}
  assert(!actual.data.some(q=>q.role==='repairSeed'));assert.equal(await page.locator('#role option[value="repairSeed"]').count(),0);
  await page.locator('#allQuestions').click();await page.locator('#search').fill('ECON-MG-CORE-SCARCITY-30003');await page.waitForFunction(()=>document.querySelectorAll('.card').length===1&&document.querySelector('.card').dataset.id==='ECON-MG-CORE-SCARCITY-30003');assert.equal(await page.locator('.question-role').innerText(),'Repair');assert.equal(await page.locator('.card').getAttribute('data-status'),'pass');
  await page.locator('.meta').evaluate(e=>e.scrollIntoView({block:'center'}));fs.mkdirSync(path.join(__dirname,'qa'),{recursive:true});await page.screenshot({path:path.join(__dirname,'qa/promoted-repair.png')});assert.deepEqual(errors,[]);
  const result={status:'PASS',librarySha256:ledger.afterLibrarySha256,reviewParity:7143,importedApprovals:8,remainingSeedRoleQuestions:0,pendingEarlierRevisions:22,browserProgressMerged:true,scriptErrors:errors};fs.writeFileSync(path.join(__dirname,'review-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
