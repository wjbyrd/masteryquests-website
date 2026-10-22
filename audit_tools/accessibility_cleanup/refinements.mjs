import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pw,serve,isolated,start,save,out} from './support.mjs';

const git=args=>execFileSync('git',['-c','core.safecrlf=false',...args],{encoding:'utf8',maxBuffer:30e6});
const baseline=process.env.MQ_A11Y_BASELINE || '7edf5434';
const files=git(['diff',baseline,'--name-only']).trim().split(/\r?\n/).filter(f=>f.endsWith('.html'));
const strip=html=>html.replace(/<!-- MQ ACCESSIBILITY (style|script) START -->[\s\S]*?<!-- MQ ACCESSIBILITY \1 END -->/g,'')
  .replace(/<!-- MQ HUB ACCESSIBILITY START -->[\s\S]*?<!-- MQ HUB ACCESSIBILITY END -->/g,'').replaceAll('\r\n','\n');
const results=[];
async function test(name,fn){
  try{await fn();results.push({name,status:'PASS'});}
  catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}
  save('refinements.json',results);console.log(name,results.at(-1).status);
}
await test('All gameplay, graph, bank and theme source outside presentation blocks unchanged',()=>{
  assert.equal(files.length,32);
  for(const file of files)assert.equal(strip(fs.readFileSync(file,'utf8')),strip(git(['show',baseline+':'+file])),file);
  const bankChanges=git(['diff',baseline,'--name-only']).split(/\r?\n/).filter(f=>/question.*\.(js|json)$|(?:composer_library|engine|model|storage)\.js$/.test(f));
  assert.deepEqual(bankChanges,[]);
});
const games=files.filter(f=>fs.readFileSync(f,'utf8').includes('function startSelectedMode(')&&!f.includes('/template/')&&!f.endsWith('/mastery-quests-faculty-template.html'));
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});
async function menu(page){await page.locator('#returnMenuBtn').focus();await page.keyboard.press('Enter');await page.waitForTimeout(60);}
async function review(page){await page.locator('#mqExplanationReview summary').focus();await page.keyboard.press('Enter');await page.waitForTimeout(60);}
async function close(page){await page.keyboard.press('Escape');await page.waitForTimeout(60);}
try{
 await test('Blank faculty template retains preflight and embedded menu utilities',async()=>{
  const {page,context}=await isolated(browser,origin);
  try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-template.html');
   assert.equal(await page.evaluate(()=>validateFacultyMode('quiz').ok),false);
   assert.equal(await page.locator('#gameMenuOptions #mqMotionControl').count(),1);
   assert.equal(await page.locator('#gameMenuOptions #mqExplanationReview').count(),1);
  }finally{await context.close();}
 });
 for(const file of games)await test('Menu placement, keyboard and focus: '+file,async()=>{
  const {page,context}=await isolated(browser,origin,{reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(origin+'/'+file);assert.equal(await page.locator('#mqMotionControl').count(),1);
   assert.equal(await page.locator('#mqMotionControl').isVisible(),false);
   await start(page,'quiz');await menu(page);
   assert(await page.locator('#mqMotionControl').isVisible());
   await review(page);assert.equal(await page.locator('#mqExplanationReview li').count(),0);
   assert(await page.getByText('No question explanations have been released in this run.').isVisible());
   for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert(await page.locator('#gameModal').evaluate(e=>e.contains(document.activeElement)));}
   await close(page);assert(await page.locator('#returnMenuBtn').evaluate(e=>e===document.activeElement));
   assert.equal(await page.locator('#mqMotionControl').isVisible(),false);
   await page.evaluate(()=>showGameModal({title:'Wrong Turn',text:'Continue through the darkness.'}));await page.waitForTimeout(60);
   assert.equal(await page.locator('#mqMotionControl').isVisible(),false);
   assert.equal(await page.locator('#mqExplanationReview').isVisible(),false);
   assert.equal(await page.locator('#mqReleasedFeedback').count(),0);
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 });
 const representatives=['downloads/resources/mastery-quests-faculty-starter.html','play/economic-realm/market-gate/index.html','play/macro-command-system/national-engine/index.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'];
 for(const file of representatives)await test('Question-only released explanations and Exam isolation: '+file,async()=>{
  const {page,context}=await isolated(browser,origin,{reducedMotion:'reduce'});
  try{
   await page.goto(origin+'/'+file);await start(page,'quiz');
   const q=await page.evaluate(()=>({q:currentQuestion.q,feedback:currentQuestion.feedback}));
   await page.evaluate(()=>{wizardSpeak('Keep going, traveler!');MQAccessibility.recordReleasedFeedback(currentQuestion.feedback);});
   await menu(page);await review(page);assert.equal(await page.locator('#mqExplanationReview li').count(),0);await close(page);
   await page.evaluate(()=>{questionStartTime=Date.now()-30000;});
   const wrong=await page.evaluate(async()=>{for(let i=0;i<4;i++)if(!await isQuestionAnswerCorrect(currentQuestion,i))return i;});
   await page.locator('#answers button').nth(wrong).focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.getElementById('gameModalTitle').textContent==='Answer Recorded');
   assert.equal(await page.locator('#mqMotionControl').isVisible(),false);
   await page.locator('#gameModalConfirm').click();await menu(page);await review(page);
   assert.equal(await page.locator('#mqExplanationReview li').count(),1);
   assert.equal(await page.locator('.mq-review-question').innerText(),q.q);
   assert.equal(await page.locator('#mqExplanationReview li p').nth(1).innerText(),q.feedback);
   assert(!(await page.locator('#mqExplanationReview').innerText()).includes('Keep going, traveler!'));
   await page.screenshot({path:path.join(out,path.basename(path.dirname(file))+'-review.png'),fullPage:true});
   await close(page);
   const next=await page.evaluate(()=>({q:currentQuestion.q,feedback:currentQuestion.feedback}));
   await page.evaluate(()=>{questionStartTime=Date.now()-30000;});
   const correct=await page.evaluate(async()=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i))return i;});
   await page.locator('#answers button').nth(correct).click();
   await page.locator('#hallwayTransition.active').waitFor();
   await page.waitForFunction(()=>!document.getElementById('hallwayTransition').classList.contains('active'));
   await menu(page);await review(page);
   assert.equal(await page.locator('#mqExplanationReview li').count(),2);
   assert.equal(await page.locator('#mqExplanationReview li').last().locator('p').nth(1).innerText(),next.feedback);
   await close(page);
   await page.evaluate(()=>{showModeSelect();});await start(page,'exam');await menu(page);
   assert.equal(await page.locator('#mqExplanationReview').isVisible(),false);
   await page.evaluate(()=>{MQAccessibility.recordReleasedFeedback(currentQuestion.feedback);document.getElementById('mqExplanationReview').open=true;});
   await page.waitForTimeout(60);assert.equal(await page.locator('#mqExplanationReview li').count(),0);
   await close(page);await page.evaluate(()=>{questionStartTime=Date.now()-30000;});
   const examFeedback=await page.evaluate(()=>currentQuestion.feedback);
   await page.locator('#answers button').first().click();await page.waitForTimeout(100);
   assert(!(await page.locator('body').ariaSnapshot()).includes(examFeedback));
  }finally{await context.close();}
 });
 await test('Shared motion: OS default, explicit override, reload, hubs and other tabs',async()=>{
  const {page,context}=await isolated(browser,origin,{reducedMotion:'reduce'});
  const paused=()=>page.locator('html').evaluate(e=>e.classList.contains('mq-motion-paused'));
  try{
   const file='/downloads/resources/mastery-quests-faculty-starter.html';
   await page.goto(origin+file);assert(await paused());await start(page,'quiz');await menu(page);
   const control=page.locator('#mqMotionControl');await control.focus();await page.keyboard.press('End');await page.keyboard.press('Enter');
   assert.equal(await control.inputValue(),'playing');assert.equal(await paused(),false);
   await page.reload();assert.equal(await paused(),false);
   await start(page,'quiz');await menu(page);await control.selectOption('paused');assert(await paused());
   await page.goto(origin+'/play/economic-realm/');assert(await paused());
   assert.equal(await page.locator('#hubMotionControl').isVisible(),false);
   await page.locator('#enterHubButton').click();await page.locator('#realmMenuButton').click();
   assert.equal(await page.locator('#hubMotionControl').inputValue(),'paused');
   const other=await context.newPage();await other.goto(origin+file);
   await page.locator('#hubMotionControl').selectOption('playing');
   await other.waitForFunction(()=>!document.documentElement.classList.contains('mq-motion-paused'));
   await page.locator('#hubMotionControl').selectOption('system');assert(await paused());
   await other.waitForFunction(()=>document.documentElement.classList.contains('mq-motion-paused'));
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.waitForFunction(()=>!document.documentElement.classList.contains('mq-motion-paused'));
   await page.goto(origin+'/play/managerial-directorate-classroom/');
   await page.getByText('Settings',{exact:true}).click();assert(await page.locator('#hubMotionControl').isVisible());
  }finally{await context.close();}
 });
 await test('Graph disclosure and enlarged view unchanged and keyboard accessible',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:390,height:844},reducedMotion:'reduce'});
  try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await start(page,'trialGraph');
   await page.locator('#questionImageBox summary').focus();await page.keyboard.press('Enter');
   const description=await page.locator('#questionGraphDescription').innerText();assert(description);
   const img=page.locator('#questionImageBox img');await img.focus();await page.keyboard.press('Enter');
   await page.locator('#graphLightbox summary').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('#graphLightboxDescription').innerText(),description);
   assert.equal(await page.locator('#mqMotionControl').isVisible(),false);
   await close(page);assert(await img.evaluate(e=>e===document.activeElement));
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();}
