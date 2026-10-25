import {settingsControl} from './browser-controls.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {telemetryRows} from './workbook-fixtures.mjs';
import {csv} from './release-fixtures.mjs';
const require=createRequire(import.meta.url),pw=require(process.env.PLAYWRIGHT_MODULE||'playwright'),root=process.cwd();
const fixtures=path.join(root,'audit_tools/answer_analysis/workbook-fixtures'),out=path.join(root,'audit_tools/answer_analysis/workbook-evidence');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{try{
  let file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(root+path.sep))throw Error('path');
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port,results=[];
try{for(const [engine,options] of [['chromium',{channel:'msedge'}],['firefox',{}],['webkit',{}]]){
  let browser;
  try{browser=await pw[engine].launch({...options,headless:true});}catch(e){if(engine==='chromium')throw e;results.push({engine,status:'unavailable',reason:e.message.split('\n')[0]});continue;}
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),page=await context.newPage(),errors=[],external=[];
    page.on('pageerror',e=>errors.push(e.message));
    context.on('request',r=>{if(!r.url().startsWith(origin))external.push(r.url());});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/tools/answer-analysis/');
    assert((await page.locator('label[for="files"]').innerText()).includes('CSV, Excel, or Apple Numbers'));
    const add=async file=>{await page.locator('#files').setInputFiles(file);await page.waitForFunction(()=>!document.querySelector('#import-status').textContent.startsWith('Reading'));await page.evaluate(()=>importQueue);if(await page.locator('#show-contributions').isVisible())await page.locator('#show-contributions').click();};
    await add(path.join(fixtures,'synthetic-cost.numbers'));
    assert.equal(await page.locator('#errors').innerText(),'');assert((await page.locator('#status').innerText()).startsWith('48 recorded answers'));
    assert((await page.locator('#file-list').innerText()).includes('Apple Numbers'));
    const numbers=await page.locator('#overview').innerText();
    await add(path.join(fixtures,'synthetic-cost.xlsx'));assert((await page.locator('#import-status').innerText()).includes('1 identical file'));
    await add({name:'original.csv',mimeType:'text/csv',buffer:Buffer.from(csv(telemetryRows()))});assert((await page.locator('#import-status').innerText()).includes('1 identical file'));
    await (await settingsControl(page,'#clear')).click();await add(path.join(fixtures,'synthetic-cost.xlsx'));assert.equal(await page.locator('#overview').innerText(),numbers);assert((await page.locator('#file-list').innerText()).includes('Excel'));
    await (await settingsControl(page,'#clear')).click();
    // Genuine binary Numbers file through the drag/drop path.
    await page.evaluate(async bytes=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(bytes)],'dropped.numbers',{type:'application/vnd.apple.numbers'}));document.querySelector('#drop-zone').dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt}));await importQueue;},[...fs.readFileSync(path.join(fixtures,'synthetic-cost.numbers'))]);
    assert.equal(await page.locator('#overview').innerText(),numbers);
    await (await settingsControl(page,'#run')).selectOption({index:1});assert((await page.locator('#status').innerText()).includes('8 shown'));await (await settingsControl(page,'#reset-filters')).click();
    const accessibility=[];
    await page.addScriptTag({path:path.join(root,'tmp/answer-release/a11y/node_modules/axe-core/axe.min.js')});
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const scan=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});return r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));});
      assert.deepEqual(scan,[]);accessibility.push({width,violations:scan});
      if(width!==768)await page.locator('.import-panel').screenshot({path:path.join(out,engine+'-'+width+'.png')});
    }
    await add({name:'renamed.numbers',mimeType:'application/vnd.apple.numbers',buffer:Buffer.from(csv(telemetryRows()))});assert((await page.locator('#errors').innerText()).includes('not a genuine'));assert.equal(await page.locator('#overview').innerText(),numbers);
    await add({name:'empty.numbers',mimeType:'application/vnd.apple.numbers',buffer:Buffer.alloc(0)});assert((await page.locator('#errors').innerText()).includes('empty'));
    await add({name:'bad.xlsx',mimeType:'application/octet-stream',buffer:Buffer.from('broken')});assert((await page.locator('#errors').innerText()).includes('not a genuine'));
    await (await settingsControl(page,'#clear')).click();await add(path.join(fixtures,'synthetic-multiple.numbers'));assert((await page.locator('#status').innerText()).includes('48 shown'));assert((await page.locator('#file-list').innerText()).includes('Second Table'));
    await (await settingsControl(page,'#clear')).click();
    // Clear must invalidate a binary read that has not started its worker yet.
    await page.evaluate(async()=>{let begin,finish;const started=new Promise(r=>begin=r);addFiles([{name:'slow.numbers',size:1,arrayBuffer:()=>{begin();return new Promise(r=>finish=r);}}]);await started;document.querySelector('#clear').click();finish(new ArrayBuffer(1));await importQueue;});
    assert.equal(await page.locator('#file-list li').count(),0);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    results.push({engine,status:'passed',checks:['CSV/XLSX/Numbers equivalence','cross-format duplicates','Numbers drag/drop','filters','multiple tables','malformed/empty files','clear during read','no external requests'],accessibility});
  }finally{await browser.close();}
}}
finally{server.close();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));
