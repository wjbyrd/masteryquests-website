import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const require=createRequire(import.meta.url),bundled=createRequire(path.join(root,'audit_tools/elite_pool_revision_20261101/resolve.cjs'));
const {chromium}=bundled('playwright');
const core=require(path.join(root,'build/faculty-build-composer/composer-core.js')),con=require(path.join(root,'build/faculty-build-composer/tests/composer-integrity-contracts.js')),h=require(path.join(root,'build/faculty-build-composer/tests/composer-test-helpers.js'));
const lib=h.loadComposerLibrary(),canonical=new Map(con.questionRecords(lib).map(r=>[String(r.question.id),r.question])),ledger=require('./expectations.json');
const original=JSON.parse(await fs.readFile(path.join(here,'baseline/personal-review-list-data.json'),'utf8'));
const file='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation/deliverables/MasteryQuests_Question_Review.html';
await fs.mkdir(path.join(here,'qa'),{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1365,height:1000},acceptDownloads:true});
 await context.addInitScript(records=>localStorage.setItem('masteryquests-personal-review-v1',JSON.stringify({version:1,records})),original.reviewSeed);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(file).href);await page.waitForSelector('.card');
 const data=await page.evaluate(()=>JSON.parse(document.getElementById('data').textContent));
 assert.equal(data.questions.length,7143);assert.equal(data.librarySha256,lib.librarySha256);assert.equal(Object.keys(data.images).length,218);assert.deepEqual(data.reviewSeed,original.reviewSeed);
 for(const q of data.questions){const c=canonical.get(q.id);assert.equal(q.stem,c.q);assert.deepEqual(q.options,c.options);assert.equal(q.feedback,c.feedback||'');assert.equal(q.difficulty,c.canonicalDifficulty||c.difficulty||'unknown');assert.equal(crypto.createHash('sha256').update(core.normalizeAnswerText(q.options[q.answer])).digest('hex'),c.aHash);}
 const pending=data.questions.filter(q=>q.revision&&data.reviewSeed[q.id]?.status!=='unknown'&&data.reviewSeed[q.id]?.reviewedRevision!==q.revision);
 assert.deepEqual(pending.map(q=>q.id).sort(),ledger.changes.map(c=>c.id).sort());assert.equal(pending.filter(q=>q.difficulty==='legendary').length,41);
 assert.equal(await page.locator('#difficulty').inputValue(),'');assert.equal(await page.locator('#status').inputValue(),'needsVerification');assert.match(await page.locator('#range').innerText(),/of 54 questions/);assert.equal(await page.locator('#verification').innerText(),'54');
 async function select(id){await page.locator('#verifyElite').click();await page.locator('#search').fill(id);await page.waitForFunction(id=>document.querySelectorAll('.card').length===1&&document.querySelector('.card').dataset.id===id,id);}
 await select('P62G-MON-EL-006');assert((await page.locator('.revision-note').innerText()).includes('elite → legendary'));await page.screenshot({path:path.join(here,'qa/review-reclassification.png')});
 await select('42196');const currentGraph=page.locator('.card > img.graph');await currentGraph.scrollIntoViewIfNeeded();await currentGraph.evaluate(im=>im.decode());await page.screenshot({path:path.join(here,'qa/review-graph.png')});
 await page.locator('.revision-note summary').click();assert.equal(await page.locator('.revision-note img.graph').count(),1);await page.locator('.revision-note img.graph').evaluate(im=>im.decode());
 await select('ECON-SP-EASYBOSS-2011');const old=data.reviewSeed['ECON-SP-EASYBOSS-2011'];assert.equal(await page.locator('textarea').inputValue(),old.notes);await page.locator('[data-kind=status][value=pass]').check();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('masteryquests-personal-review-v1')).records['ECON-SP-EASYBOSS-2011']);assert.equal(saved.reviewedRevision,data.questions.find(q=>q.id==='ECON-SP-EASYBOSS-2011').revision);assert.equal(saved.previousReview.status,'flag');assert.equal(saved.previousReview.notes,old.notes);assert.equal(await page.locator('#verification').innerText(),'53');
 const backupEvent=page.waitForEvent('download');await page.locator('#export').click();const backup=await backupEvent,backupPath=path.join(here,'qa/review-backup.json');await backup.saveAs(backupPath);
 const csvEvent=page.waitForEvent('download');await page.locator('#csv').click();const csv=await csvEvent,csvPath=path.join(here,'qa/review-export.csv');await csv.saveAs(csvPath);const csvText=await fs.readFile(csvPath,'utf8');assert(csvText.includes('"Current difficulty","Previous difficulty"'));
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true}),mobile=await mobileContext.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(pathToFileURL(file).href);await mobile.waitForSelector('.card');
 await mobile.locator('#importfile').setInputFiles(backupPath);await mobile.waitForFunction(()=>document.getElementById('message').textContent.startsWith('Restored'));assert.equal(await mobile.locator('#verification').innerText(),'53');assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.screenshot({path:path.join(here,'qa/review-mobile.png')});
 // Newer browser work on unrelated questions must survive a refresh/import.
 const approvedId=original.eliteReviewApproval.ids[0];await mobile.evaluate(id=>{const b=JSON.parse(localStorage.getItem('masteryquests-personal-review-v1'));b.records[id].notes='Newer browser note';b.records[id].updated='2099-01-01T00:00:00.000Z';localStorage.setItem('masteryquests-personal-review-v1',JSON.stringify(b));},approvedId);await mobile.reload();assert.equal(await mobile.evaluate(id=>JSON.parse(localStorage.getItem('masteryquests-personal-review-v1')).records[id].notes,approvedId),'Newer browser note');assert.equal(await mobile.locator('#verification').innerText(),'53');
 assert.deepEqual(errors,[]);const result={status:'PASS',canonicalParity:7143,embeddedGraphs:218,revisionQueue:54,legendaryInRevisionQueue:41,allPreviousReviewsPreserved:true,newApprovalAndHistoryPersist:true,backupRestore:true,newerBrowserReviewsPreserved:true,mobileNoOverflow:true,scriptErrors:errors};await fs.writeFile(path.join(here,'review-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();}
