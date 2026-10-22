import assert from 'node:assert/strict';import {pw,serve,isolated,start,save,scan} from './support.mjs';
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});const results=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}save('interactions.json',results);console.log(name,results.at(-1).status);}
try{
 await test('Realm recovery, sequential access, nested artifact and achievements keyboard dialogs',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});try{
   await page.goto(origin+'/play/economic-realm/');await page.locator('#enterHubButton').click();await page.locator('#realmMenuButton').click();
   await page.getByRole('button',{name:'Restore Progress',exact:true}).click();await page.locator('#recoveryMission').selectOption('marketGate');
   await page.locator('#recoveryCode').fill('QA-invalid');const restore=page.locator('button[onclick="restoreMissionFromCode()"]');await restore.focus();await page.keyboard.press('Enter');
   await page.waitForTimeout(50);assert.equal(await page.locator('#recoveryCode').getAttribute('aria-invalid'),'true');assert.match(await page.locator('#recoveryMessage').innerText(),/does not match/);
   await page.locator('#recoveryCode').fill('MARKET-RESTORED');await restore.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);
   assert.equal(await page.locator('#recoveryCode').getAttribute('aria-invalid'),null);assert.match(await page.locator('#recoveryMessage').innerText(),/restored on this device/);
   assert.equal(await page.evaluate(()=>localStorage.getItem(games.marketGate.statusKey)),'true');
   const next=await page.locator('#status-nationalLedger').innerText();assert(!/locked/i.test(next));
   await page.getByRole('button',{name:'Artifact Vault',exact:true}).click();const artifact=page.locator('.artifact-image-button').first();await artifact.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);
   assert(await page.locator('#artifactModal').evaluate(el=>el.contains(document.activeElement)&&!el.closest('[inert]')));
   for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert(await page.locator('#artifactModal').evaluate(el=>el.contains(document.activeElement)));}
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await artifact.evaluate(el=>el===document.activeElement));
   await page.getByRole('button',{name:'Achievements',exact:true}).click();const achievement=page.locator('button[onclick*="openAchievementModal"]').first();
   if(await achievement.count()){await achievement.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);assert(await page.locator('#achievementModal').evaluate(el=>el.contains(document.activeElement)));await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await achievement.evaluate(el=>el===document.activeElement));}
   save('hub-menu-axe.json',await scan(page));await page.keyboard.press('Escape');await page.waitForTimeout(50);assert(await page.locator('#realmMenuButton').evaluate(el=>el===document.activeElement));
  }finally{await context.close();}
 });
 for(const file of ['downloads/resources/mastery-quests-faculty-starter.html','play/managerial-intelligence-directorate/cost-directive/index.html','play/micro-domains/labyrinth-of-choice/index.html'])await test(file+' repeated Enter and modal background isolation',async()=>{
  const {page,context}=await isolated(browser,origin,{hasTouch:true,reducedMotion:'reduce'});try{
   await page.goto(origin+'/'+file);await start(page,'quiz');await page.evaluate(()=>{questionStartTime=Date.now()-30000;});const before=await page.evaluate(()=>totalAttempts);
   await page.locator('#answers button').first().focus();for(let i=0;i<5;i++)await page.keyboard.down('Enter');await page.keyboard.up('Enter');await page.waitForTimeout(100);
   assert.equal(await page.evaluate(()=>totalAttempts),before+1);
   await page.evaluate(()=>showGameModal({title:'QA confirmation',text:'Synthetic fixture',cancelText:'Cancel'}));await page.waitForTimeout(50);
   const outside=await page.evaluate(()=>[...document.querySelectorAll('button,input,select,a[href]')].filter(e=>e.getClientRects().length&&!e.disabled&&!e.closest('#gameModal,[inert]')&&getComputedStyle(e).visibility!=='hidden').map(e=>e.id||e.outerHTML.slice(0,80)));
   assert.deepEqual(outside,[]);assert.equal(await page.locator('[tabindex]').evaluateAll(es=>es.some(e=>e.tabIndex>0)),false);
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();}
