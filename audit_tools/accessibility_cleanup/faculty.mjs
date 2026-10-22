import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,out,pw,serve,isolated,start,scan,save} from './support.mjs';
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});const results=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack});process.exitCode=1;}save('faculty.json',results);console.log(name,results.at(-1).status);}
try{
 await test('Composer artwork focus, custom image error, upload, reset and recipe round-trip',async()=>{
  const {page,context}=await isolated(browser,origin,{viewport:{width:390,height:844},reducedMotion:'reduce'});try{
   await page.goto(origin+'/build/faculty-build-composer/');await page.locator('#areaFilter').selectOption('general');await page.locator('#conceptSearch').fill('Demand');await page.locator('[data-concept="demand"]').check();await page.locator('[data-step="5"]').click();
   const preset=page.locator('[data-theme-preset]').nth(1),id=await preset.getAttribute('data-theme-preset');await preset.focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.themePreset),id);
   const select=page.locator('[data-theme-slot-select]:visible').first(),slot=await select.getAttribute('data-theme-slot-select');
   const option=await select.locator('option').nth(1).getAttribute('value');await select.focus();await select.selectOption(option);
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.themeSlotSelect),slot);
   await page.locator(`[data-theme-reset="${slot}"]`).click();assert.equal(await page.evaluate(()=>document.activeElement.dataset.themeSlotSelect),slot);
   const upload=page.locator(`[data-custom-upload-button="${slot}"]`),input=page.locator(`[data-custom-upload-input="${slot}"]`);
   await upload.focus();await input.setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('Not an image')});
   await page.locator(`[data-theme-slot="${slot}"] .custom-image-message.error`).waitFor();
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.customUploadButton),slot);assert(await upload.getAttribute('aria-describedby'));
   await input.setInputFiles(path.join(root,'play/managerial-intelligence-directorate/agency-protocol/principal.webp'));
   await page.waitForFunction(s=>document.querySelector(`[data-theme-slot="${s}"] .theme-source-badge`)?.textContent==='Custom image',slot);
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.customUploadButton),slot);
   save('faculty-appearance-axe.json',await scan(page));await page.screenshot({path:path.join(out,'faculty-custom-390.png'),fullPage:true});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.locator('[data-step="7"]').click();const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadRecipe').click()]);
   const recipe=path.join(out,'appearance-recipe.json');await download.saveAs(recipe);await page.locator('#importRecipe').setInputFiles(recipe);
   await page.locator('[data-step="5"]').click();assert.equal(await upload.innerText(),'Replace Image');
   assert.equal(await page.locator('[data-step="5"]').getAttribute('aria-current'),'step');
  }finally{await context.close();}
 });
 for(const file of ['theme-fixtures/default.html','theme-fixtures/arcane-archive.html','theme-fixtures/market-citadel.html','theme-fixtures/managerial-cost-directive.html','theme-fixtures/hybrid.html','custom-fixtures/custom-moderate.html'])await test('Standalone export '+file,async()=>{
  const {page,context,blocked}=await isolated(browser,origin,{viewport:{width:320,height:850},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
   await page.goto(origin+'/tmp/accessibility_cleanup/'+file);await start(page,'trialGraph');
   await page.locator('#questionImageBox summary').click();assert(await page.locator('#questionGraphDescription').innerText());
   const graph=page.locator('#questionImageBox img');await graph.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);
   assert(await page.locator('#graphLightbox').evaluate(e=>e.contains(document.activeElement)));await page.keyboard.press('Escape');
   await page.waitForTimeout(50);assert(await graph.evaluate(e=>e===document.activeElement));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.equal(blocked.length,0);assert.deepEqual(errors,[]);save('export-'+path.basename(file)+'.json',await scan(page));
  }finally{await context.close();}
 });
}finally{await browser.close();server.close();}
