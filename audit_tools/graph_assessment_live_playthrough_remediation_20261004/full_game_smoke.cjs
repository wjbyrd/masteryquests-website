'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'faculty_exports/audits/graph_assessment_live_playthrough_remediation_20261004_evidence');
const ledger=require('./expectations.json');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 // This is a local test; prevent telemetry and other external requests.
 await page.route(/^https?:/,r=>r.abort());page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(out,'micro-validation-game.html')).href);
 await page.locator('#playerNameInput').fill('Local QA');await page.locator('#startScreen .start-btn').first().click();
 await page.locator('[data-mode="trialGraph"]').click();
 const buttons=await page.locator('button:visible').allTextContents();
 const launch=page.getByRole('button',{name:/Launch Trial/i});
 assert(await launch.count(),JSON.stringify(buttons));await launch.click();
 if(await page.locator('#guideIntroProceed').isVisible())await page.locator('#guideIntroProceed').click();
 await page.locator('#questionImageBox img').waitFor({state:'visible'});
 const first=await page.locator('#question').innerText();assert(first.length>10);
 // Select a repaired graph through the real graph renderer inside the full game.
 const target=ledger.changes.find(c=>c.id==='P62F-PC-B3-055').afterRecord;
 await page.evaluate(q=>{renderQuestionGraph(q);document.getElementById('question').textContent=q.q;},target);
 await page.locator('#questionImageBox img').evaluate(i=>i.decode());
 await page.locator('#questionImageBox img').click();
 assert.equal(await page.locator('#graphLightbox').getAttribute('aria-hidden'),'false');
 await page.locator('#graphLightboxImg').evaluate(i=>i.decode());
 const bounds=await page.locator('#graphLightboxImg').boundingBox();assert(bounds.width>=760);
 const pan=await page.locator('#graphLightbox').evaluate(e=>{e.scrollLeft=e.scrollWidth;return e.scrollLeft});assert(pan>0);
 await page.screenshot({path:path.join(out,'browser/full-game-mobile-pan.png')});
 await page.locator('#graphLightboxClose').click();assert.equal(await page.locator('#graphLightbox').getAttribute('aria-hidden'),'true');
 await page.locator('#questionImageBox img').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#graphLightbox').getAttribute('aria-hidden'),'false');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#graphLightbox').getAttribute('aria-hidden'),'true');
 assert.deepEqual(errors,[]);
 const result={status:'PASS',librarySha256:ledger.afterLibrarySha256,actualUIStart:true,trialRunStarted:true,firstRandomQuestion:first,targetedGraph:target.id,graphInjectedForTargetedUIInspection:true,realClickAndKeyboardHandlers:true,mobileExpandedWidth:bounds.width,panDistance:pan,closeAfterPanning:true,pageErrors:errors,externalRequestsBlocked:true};
 fs.writeFileSync(path.join(out,'full-game-smoke.json'),JSON.stringify(result,null,2)+'\n');await browser.close();console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1});
