import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,out,pw,serve,isolated,start,scan,save} from './support.mjs';
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});const results=[];
const files=['downloads/resources/mastery-quests-faculty-starter.html','play/economic-realm/market-gate/index.html','play/macro-command-system/national-engine/index.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}save('states.json',results);console.log(name,results.at(-1).status);}
const fits=page=>page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}));
const spacing=page=>page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
async function correct(page){await page.evaluate(()=>{questionStartTime=Date.now()-30000;});const n=await page.evaluate(async()=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i))return i;});await page.locator('#answers button').nth(n).click();}
try{
 for(const file of files)await test(file+' small-phone/text spacing, menu, save, checkpoint and completion',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:320,height:850},hasTouch:true,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));const name=file.split('/').at(-2);
  try{
   await page.goto(origin+'/'+file);await spacing(page);let size=await fits(page);assert(size.content<=size.width+1,JSON.stringify(size));
   await start(page);size=await fits(page);assert(size.content<=size.width+1,JSON.stringify(size));
   await page.screenshot({path:path.join(out,'state-'+name+'-320.png'),fullPage:true});
   await page.locator('#returnMenuBtn').click();await page.waitForTimeout(50);assert(await page.locator('#gameModal').evaluate(el=>el.contains(document.activeElement)));
   for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.querySelector('#gameModal').contains(document.activeElement)||document.activeElement.id==='mqMotionControl'));}
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await page.locator('#returnMenuBtn').evaluate(el=>el===document.activeElement));
   const saved=await page.evaluate(()=>{saveGameState();return {room,runID};});await page.reload();await page.locator('#continueRunBtn').click();
   if(await page.locator('#guideIntroProceed').isVisible())await page.locator('#guideIntroProceed').click();await page.waitForFunction(()=>Boolean(currentQuestion));assert.deepEqual(await page.evaluate(()=>({room,runID})),saved);
   // Test-only fixture reaches a checkpoint without modifying production pathways.
   await page.evaluate(()=>{room=10;loadQuestion();});if(await page.locator('#bossRevealProceed').isVisible())await page.locator('#bossRevealProceed').click();
   await page.waitForFunction(()=>Boolean(currentQuestion));assert(await page.locator('#question').innerText());save('checkpoint-'+name+'.json',await scan(page));
   await page.evaluate(()=>{returnToModeSelectFromRun();setQuizQuestionCount(1);});await start(page,'quiz');await correct(page);await page.waitForTimeout(4500);
   const report=page.getByRole('button',{name:'View Mastery Report',exact:false});if(await report.isVisible())await report.click();
   const download=page.getByRole('button',{name:'Download Game Data',exact:true}).last();await download.waitFor({state:'visible'});
   const [csv]=await Promise.all([page.waitForEvent('download'),download.click()]);await csv.saveAs(path.join(out,'completion-'+name+'.csv'));
   save('completion-'+name+'.json',{scan:await scan(page),size:await fits(page),errors});await page.screenshot({path:path.join(out,'completion-'+name+'.png'),fullPage:true});assert.deepEqual(errors,[]);size=await fits(page);assert(size.content<=size.width+1,JSON.stringify(size));
  }finally{await context.close();}
 });
 for(const hub of ['economic-realm','macro-command-system','managerial-intelligence-directorate','micro-domains'])await test(hub+' splash, motion and modal',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:320,height:850},reducedMotion:'reduce'});try{
   await page.goto(origin+'/play/'+hub+'/');await page.waitForTimeout(150);assert(await page.locator('#mainMenu').evaluate(e=>e.inert));
   assert(await page.locator('#hubMotionControl').getAttribute('aria-pressed')==='true');
   await page.locator('#enterHubButton').click();await page.waitForTimeout(100);assert.equal(await page.locator('#mainMenu').evaluate(e=>e.inert),false);
   await spacing(page);const size=await fits(page);assert(size.content<=size.width+1,JSON.stringify(size));
   const menu=page.locator('#realmMenuButton,#macroMenuButton,#directorateMenuButton,#microMenuButton');if(await menu.count()){
    await menu.click();await page.waitForTimeout(50);assert(await page.locator('[role=dialog].active').first().evaluate(e=>e.contains(document.activeElement)));
    await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await menu.evaluate(e=>e===document.activeElement));
   }
   await page.screenshot({path:path.join(out,'hub-'+hub+'-320.png'),fullPage:true});
  }finally{await context.close();}
 });
 await test('200 percent text resizing, tablet and 400 percent Chrome browser zoom',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:768,height:1024},reducedMotion:'reduce'});try{
   await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await start(page);await page.evaluate(()=>{const sizes=[...document.querySelectorAll('body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,size]of sizes)e.style.fontSize=size*2+'px';});await spacing(page);
   const size=await fits(page);assert(size.content<=size.width+1,JSON.stringify(size));await page.screenshot({path:path.join(out,'text-200-tablet.png'),fullPage:true});
  }finally{await context.close();}
  const zoom=await pw.chromium.launchPersistentContext(path.resolve('tmp/accessibility_cleanup/zoom-profile'),{channel:'chrome',headless:true,viewport:{width:1280,height:900},reducedMotion:'reduce'});
  try{const settings=zoom.pages()[0];await settings.goto('chrome://settings/appearance');await settings.evaluate(()=>new Promise(resolve=>chrome.settingsPrivate.setDefaultZoom(4,resolve)));await settings.close();
   await zoom.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());const page=await zoom.newPage();await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await start(page);const size=await fits(page);assert.equal(size.width,320);assert(size.content<=321);await page.screenshot({path:path.join(out,'chrome-400-percent.png')});save('browser-zoom.json',{browser:zoom.browser()?.version(),viewport:1280,...size});
  }finally{await zoom.close();}
 });
}finally{await browser.close();server.close();}
