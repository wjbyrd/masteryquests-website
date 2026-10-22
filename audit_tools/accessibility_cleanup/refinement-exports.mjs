import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {pw,root,serve,isolated,start,save} from './support.mjs';
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}save('exports.json',results);console.log(name,results.at(-1).status);}
try{
 for(const file of ['default','arcane-archive','market-citadel','managerial-cost-directive','hybrid'])await test('Fresh portable export: '+file,async()=>{
  const {page,context,blocked}=await isolated(browser,origin,{viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+'/tmp/accessibility_cleanup/refinement-exports/'+file+'.html');await start(page,'trialGraph');
   assert.equal(await page.locator('#mqMotionControl').isVisible(),false);
   await page.locator('#returnMenuBtn').click();await page.locator('#mqMotionControl').selectOption('playing');
   assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused')),false);
   await page.locator('#mqExplanationReview summary').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('#mqExplanationReview li').count(),0);
   await page.keyboard.press('Escape');await page.waitForTimeout(50);
   assert(await page.locator('#returnMenuBtn').evaluate(e=>e===document.activeElement));
   await page.locator('#questionImageBox summary').click();assert(await page.locator('#questionGraphDescription').innerText());
   assert.equal(blocked.length,0);assert.deepEqual(errors,[]);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }finally{await context.close();}
 });
 await test('Embedded preference helper works with denied storage and all network blocked',async()=>{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),external=[];
  try{
   await context.route('**/*',route=>{const protocol=new URL(route.request().url()).protocol;if(['file:','data:','blob:'].includes(protocol))return route.continue();external.push(route.request().url());return route.abort();});
   await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}}));
   // The legacy game itself requires storage, so isolate the self-contained preference
   // helper from a real export to verify its failure-safe behavior independently.
   const fs=await import('node:fs');
   const helper=fs.readFileSync(path.join(root,'build/faculty-build-composer/template/motion-preference.js'),'utf8');
   await page.goto('about:blank');await page.addScriptTag({content:helper});
   await page.evaluate(()=>document.body.append(MQMotionPreference.createControl('offlineMotion')));
   await page.locator('#offlineMotion').selectOption('playing');
   assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused')),false);
   await page.locator('#offlineMotion').selectOption('paused');
   assert(await page.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused')));
   assert.deepEqual(external,[]);
  }finally{await context.close();}
 });
 await test('Downloaded HTML opens directly from disk without remote dependencies',async()=>{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),external=[];
  try{
   await context.route('**/*',route=>{const protocol=new URL(route.request().url()).protocol;if(['file:','data:','blob:'].includes(protocol))return route.continue();external.push(route.request().url());return route.abort();});
   await page.goto(pathToFileURL(path.join(root,'tmp/accessibility_cleanup/refinement-exports/default.html')).href);await start(page,'quiz');
   await page.locator('#returnMenuBtn').click();assert(await page.locator('#mqMotionControl').isVisible());
   await page.locator('#mqExplanationReview summary').click();assert.equal(await page.locator('#mqExplanationReview li').count(),0);
   await page.keyboard.press('Escape');await page.waitForTimeout(60);
   const question=await page.evaluate(()=>({q:currentQuestion.q,feedback:currentQuestion.feedback}));
   await page.evaluate(()=>{questionStartTime=Date.now()-30000;});
   const wrong=await page.evaluate(async()=>{for(let i=0;i<4;i++)if(!await isQuestionAnswerCorrect(currentQuestion,i))return i;});
   await page.locator('#answers button').nth(wrong).click();
   await page.waitForFunction(()=>document.getElementById('gameModalTitle').textContent==='Answer Recorded');
   await page.locator('#gameModalConfirm').click();await page.locator('#returnMenuBtn').click();
   await page.locator('#mqExplanationReview summary').click();
   await page.locator('#mqExplanationReview li').waitFor();
   assert.equal(await page.locator('#mqExplanationReview li').count(),1);
   assert.equal(await page.locator('.mq-review-question').innerText(),question.q);
   assert.equal(await page.locator('#mqExplanationReview li p').nth(1).innerText(),question.feedback);
   assert.deepEqual(external,[]);
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();}
