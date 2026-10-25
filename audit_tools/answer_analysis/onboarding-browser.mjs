import {settingsControl} from './browser-controls.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {dashboardRows} from './dashboard-fixtures.mjs';
import {csv} from './release-fixtures.mjs';

const require=createRequire(import.meta.url),root=process.cwd();
const out=path.join(root,'tmp/answer-release/onboarding');fs.mkdirSync(out,{recursive:true});
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=http.createServer((req,res)=>{try{
  let file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep))throw Error('path');
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;let browser;
try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
  const page=await context.newPage(),errors=[],external=[],accessibility=[];
  page.on('pageerror',error=>errors.push(error.message));
  await context.route('**/*',route=>{if(route.request().url().startsWith(origin))return route.continue();external.push(route.request().url());return route.abort();});
  await page.goto(origin+'/tools/answer-analysis/');
  assert(await page.locator('#selection-controls').isHidden());
  assert(await page.locator('#loaded-files').isHidden());
  assert((await page.locator('#getting-started').innerText()).includes('Download Game Data (.csv)'));
  assert.equal(await page.locator('.welcome-steps li').count(),3);
  await page.addScriptTag({path:process.env.AXE_MODULE||path.join(root,'tmp/answer-release/a11y/node_modules/axe-core/axe.min.js')});
  async function inspect(state){
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),state+' overflow at '+width);
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:path.join(out,`${state}-${width}.png`),fullPage:state==='welcome'});
      const violations=await page.evaluate(async()=>{const results=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});return results.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));});
      accessibility.push({state,width,violations});assert.deepEqual(violations,[]);
    }
  }
  await inspect('welcome');await page.setViewportSize({width:1440,height:1000});
  await page.locator('#try-sample').focus();await page.keyboard.press('Enter');
  assert(await page.locator('#sample-notice').isVisible());
  assert(!await page.locator('#data-settings').evaluate(node=>node.open));
  assert(await page.locator('#exposure').isHidden());
  assert((await page.locator('#status').innerText()).startsWith('48 recorded answers'));
  assert.equal(await page.locator('#file-list li').count(),1);
  assert((await page.locator('#overview').innerText()).includes('not a mastery score'));assert.equal(await page.locator('#overview .metric').count(),4);
  assert.equal(await page.locator('.review-card').count(),3);
  assert.deepEqual(await page.locator('#dashboard > section').evaluateAll(nodes=>nodes.slice(0,4).map(node=>node.id)),['overview','instructor-summary','review','topics']);
  assert((await page.locator('#overview').innerText()).includes('11m'));
  assert((await page.locator('.streak-summary').innerText()).includes('Typical best streak: 3'));
  assert((await page.locator('.review-card').first().innerText()).includes('Small question sample'));
  assert(!(await page.locator('#review').innerText()).includes('Broader sample'));
  assert((await page.locator('#topic-results').innerText()).includes('Relative priority'));
  assert((await page.locator('#topic-results').innerText()).includes('Some errors observed'));
  assert(!(await page.locator('#topic-results').innerText()).includes('Review candidate'));
  await page.locator('#summary-highlights a').click();
  assert((await page.locator('.question[open] h3').innerText()).includes('Which side of a market'));
  assert((await page.locator('#encounters').innerText()).includes('does not show learning gain or decline'));
  assert((await page.locator('.support-finding').innerText()).includes('5 of 6'));
  await page.getByText('Questions missed after support',{exact:true}).click();
  await page.locator('.retest-questions a').first().click();
  assert((await page.locator('.question[open] h3').innerText()).includes('Who bears more of a tax'));
  await inspect('sample');await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('link',{name:'View answer choices for Review 1',exact:true}).click();
  assert(await page.locator('.question[open] summary').evaluate(node=>document.activeElement===node));
  await page.locator('#edit-summary').click();
  assert(await page.locator('#summary-text').evaluate(node=>document.activeElement===node));
  assert((await page.locator('#summary-text').inputValue()).startsWith('SAMPLE DATA'));
  const draft='Instructor edits: revisit tax incidence, then use a new example.';
  await page.locator('#summary-text').fill(draft);
  for(let i=0;i<2;i++){
    await page.locator('#copy-summary').click();
    await page.waitForFunction(()=>document.querySelector('#copy-status').textContent==='Your edited summary was copied.');
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),draft);
    assert.equal(await page.locator('#summary-text').inputValue(),draft);
  }
  await (await settingsControl(page,'#mode')).selectOption('quiz');
  assert.equal(await page.locator('#summary-text').inputValue(),draft);
  assert((await page.locator('#draft-status').innerText()).includes('results have changed'));
  await page.locator('#copy-summary').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),draft);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download-feedback').click()]);
  const destination=path.join(out,'edited-summary.txt');await download.saveAs(destination);assert.equal(fs.readFileSync(destination,'utf8'),draft);
  await page.locator('#regenerate-summary').click();
  assert((await page.locator('#summary-text').inputValue()).includes('24 accepted responses'));
  await page.locator('#undo-summary').click();assert.equal(await page.locator('#summary-text').inputValue(),draft);
  assert((await page.locator('#draft-status').innerText()).includes('results have changed'));
  await (await settingsControl(page,'#more-options > summary')).click();
  await (await settingsControl(page,'#minimum')).selectOption('20');
  assert((await page.locator('#advanced-filter-count').innerText()).includes('1 changed'));
  await (await settingsControl(page,'#grouping')).selectOption('objectives');
  await (await settingsControl(page,'#reset-filters')).click();
  assert.equal(await page.locator('#grouping').inputValue(),'topics');
  assert.equal(await page.locator('#advanced-filter-count').innerText(),'');
  assert.equal(await page.locator('#summary-text').inputValue(),draft);
  await page.locator('.export-options > summary').click();
  await inspect('editing');await page.setViewportSize({width:1440,height:1000});
  await page.locator('#instructor-summary').screenshot({path:path.join(out,'summary-editor.png')});
  await page.locator('#files').setInputFiles({name:'invalid.csv',mimeType:'text/csv',buffer:Buffer.from('not game data')});
  await page.waitForFunction(()=>document.querySelector('#errors').textContent.includes('invalid.csv'));
  assert(await page.locator('#sample-notice').isVisible());
  assert((await page.locator('#status').innerText()).startsWith('48 recorded answers'));
  await page.locator('#files').setInputFiles({name:'class.csv',mimeType:'text/csv',buffer:Buffer.from(csv(dashboardRows().filter(r=>r.runID==='run-0')))});
  await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('8 recorded answers'));
  assert(await page.locator('#sample-notice').isHidden());
  assert(await page.locator('#try-sample').isHidden());
  assert.equal(await page.locator('#file-list li').count(),1);
  assert((await page.locator('#file-list').textContent()).includes('class.csv'));
  assert.equal(await page.locator('#summary-text').inputValue(),draft);
  assert((await page.locator('#draft-status').innerText()).includes('results have changed'));
  await page.locator('#regenerate-summary').click();
  assert(!(await page.locator('#summary-text').inputValue()).includes('SAMPLE DATA'));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Denied');}}}));
  await page.locator('#summary-text').fill(draft);await page.locator('#copy-summary').click();
  await page.waitForFunction(()=>document.querySelector('#copy-status').textContent.includes('Clipboard access is unavailable'));
  assert(await page.locator('#summary-text').evaluate(node=>document.activeElement===node&&node.selectionEnd===node.value.length));
  assert.equal(await page.locator('#summary-text').inputValue(),draft);
  const classRows=dashboardRows().filter(r=>r.runID==='run-0');
  const badSnapshot={...classRows.find(r=>r.event==='question'),attemptID:'missing-snapshot',eventID:'missing-snapshot',answerSnapshotJSON:''};
  await page.locator('#files').setInputFiles([
    {name:'overlap.csv',mimeType:'text/csv',buffer:Buffer.from(csv(classRows.map(r=>({...r,containerNote:'overlap'}))))},
    {name:'no-question-details.csv',mimeType:'text/csv',buffer:Buffer.from(csv([badSnapshot]))},
    {name:'run-context.csv',mimeType:'text/csv',buffer:Buffer.from(csv([{event:'start',eventID:'context-only',runID:'other'}]))}
  ]);
  await page.waitForFunction(()=>document.querySelector('#file-list').children.length===4);
  await page.locator('#show-contributions').click();
  assert(await page.locator('#loaded-files > summary').evaluate(node=>document.activeElement===node));
  assert((await page.locator('#dataset-context').innerText()).includes('4 files imported · 1 file contributing answers'));
  const contribution=name=>page.locator('#file-list li').filter({hasText:name});
  assert((await contribution('overlap.csv').innerText()).includes('duplicate rows'));
  assert((await contribution('no-question-details.csv').innerText()).includes('without usable or consistent question details'));
  assert((await contribution('run-context.csv').innerText()).includes('may provide run context'));
  await (await settingsControl(page,'#exposure')).selectOption('repeat');
  assert((await contribution('class.csv').innerText()).includes('4 answers outside the current filters'));
  await contribution('class.csv').getByRole('button',{name:'Remove class.csv',exact:true}).click();
  assert((await contribution('overlap.csv').innerText()).includes('4 answers included'));
  await (await settingsControl(page,'#reset-filters')).click();
  await (await settingsControl(page,'#clear')).click();assert(await page.locator('#empty-state').isVisible());
  await page.locator('#try-sample').click();await page.locator('#leave-sample').click();
  assert(await page.locator('#try-sample').evaluate(node=>document.activeElement===node));
  assert(await page.locator('#selection-controls').isHidden());
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({accessibility,errors,external},null,2));
  console.log('PASS: first-use guidance, keyboard sample, sample isolation/replacement, review links, draft edit/copy/filter/download/regenerate/undo, clipboard fallback, reset, responsive layout and nine accessibility scans.');
}finally{await browser?.close();server.close();}
