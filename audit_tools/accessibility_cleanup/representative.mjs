import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,out,pw,serve,isolated,scan,start,save} from './support.mjs';
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});
const results=[];const report=(name,data)=>{results.push({name,...data});save('representative.json',results);};
async function test(name,fn){try{await fn();report(name,{status:'PASS'});}catch(e){report(name,{status:'FAIL',error:e.stack});process.exitCode=1;}console.log(name,results.at(-1).status);}
try{
 for(const mode of ['standard','timed','exam','quiz','unlimited','legendary','score','trialGraph','fadingFortune','riskReward'])await test(mode+' release and focus',async()=>{
  const {page,context}=await isolated(browser,origin,{reducedMotion:'reduce'});try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');
   assert(await page.locator('.dungeon-container').evaluate(e=>e.inert),'underlying game inert at title');
   await start(page,mode);
   assert.equal(await page.locator('.dungeon-container').evaluate(e=>e.inert),false);
   const released=await page.evaluate(()=>modeAllowsImmediateCorrectnessFeedback());
   const q=await page.evaluate(()=>({feedback:currentQuestion.feedback,id:currentQuestion.id}));
   await page.evaluate(()=>{questionStartTime=Date.now()-30000;});
   const wrong=await page.evaluate(async()=>{for(let i=0;i<4;i++)if(!await isQuestionAnswerCorrect(currentQuestion,i))return i;});
   await page.locator('#answers button').nth(wrong).focus();await page.keyboard.press('Enter');
   await page.waitForTimeout(100);
   if(!released){
    assert.equal(await page.locator('#mqExplanationReview li').count(),0);
    const tree=await page.locator('body').ariaSnapshot();assert(!tree.includes(q.feedback),'unreleased feedback absent from accessibility tree');
   }
   assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY','answer activation must retain focus');
   save('representative-'+mode+'.json',{scan:await scan(page),released,tree:await page.locator('body').ariaSnapshot()});
  }finally{await context.close();}
 });
 await test('Graph description, dialog trap, close and focus restoration',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:320,height:800},hasTouch:true,reducedMotion:'reduce'});try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await start(page,'trialGraph');
   const graph=page.locator('#questionImageBox img');await graph.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);
   assert(await page.locator('#graphLightbox').evaluate(e=>e.contains(document.activeElement)));
   for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.querySelector('#graphLightbox').contains(document.activeElement)));}
   await page.locator('#graphLightbox summary').click();assert(await page.locator('#graphLightboxDescription').isVisible());
   await page.screenshot({path:path.join(out,'after-graph-320.png'),fullPage:true});
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await graph.evaluate(e=>e===document.activeElement));
   // Test fixture opens the higher-z-index graph over a confirmation, matching visual stacking.
   await page.evaluate(()=>{
    showGameModal({title:'Nested QA confirmation',text:'Synthetic confirmation',cancelText:'Cancel'});
    document.getElementById('gameModalConfirm').addEventListener('click',e=>{e.stopImmediatePropagation();const img=document.querySelector('#questionImageBox img');openGraphLightbox(img.src,img.alt,img.dataset.graphDescription);},{once:true,capture:true});
   });
   await page.waitForTimeout(50);await page.locator('#gameModalConfirm').focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);
   assert(await page.locator('#graphLightbox').evaluate(e=>e.contains(document.activeElement)&&!e.closest('[inert]')));
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await page.locator('#gameModalConfirm').evaluate(e=>e===document.activeElement));
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await graph.evaluate(e=>e===document.activeElement));
   await page.locator('#questionImageBox summary').click();assert(await page.locator('#questionGraphDescription').isVisible());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }finally{await context.close();}
 });
 await test('Missing required graph blocks answer controls',async()=>{
  const {page,context}=await isolated(browser,origin);try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await start(page,'trialGraph');
   const attempts=await page.evaluate(()=>totalAttempts);
   await page.evaluate(()=>renderQuestionGraph({...currentQuestion,image:'/__audit/missing-required-graph.png'}));
   await page.getByRole('alert').filter({hasText:'Required graph failed to load'}).waitFor();
   assert.equal(await page.locator('#answers button:disabled').count(),4);assert.equal(await page.evaluate(()=>totalAttempts),attempts);
  }finally{await context.close();}
 });
 await test('Setup cancel, exit cancel and motion control',async()=>{
  const {page,context}=await isolated(browser,origin);try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await page.locator('#playerNameInput').fill('QA');await page.getByRole('button',{name:'START GAME',exact:true}).click();
   const quiz=page.locator('[data-mode=quiz]');await quiz.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);
   assert(await page.locator('#quizSetupModal').evaluate(e=>e.contains(document.activeElement)));
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await quiz.evaluate(e=>e===document.activeElement));
   await start(page,'quiz');await page.locator('#returnMenuBtn').click();
   await page.locator('#mqMotionControl').selectOption('paused');assert(await page.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused')));
   await page.reload();assert(await page.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused')));
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();}
