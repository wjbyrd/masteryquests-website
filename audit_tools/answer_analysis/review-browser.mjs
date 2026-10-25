import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {releaseRows,csv} from './release-fixtures.mjs';
import {statsRows} from './run-stats-check.mjs';
import {parseCSV} from '../telemetry_contract/validate.mjs';

const require=createRequire(import.meta.url),root=process.cwd(),out=path.join(root,'tmp/answer-release/browser-review');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
  try{
    let file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
    if(!file.startsWith(root+path.sep))throw Error('path');
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  await page.goto(origin+'/tools/answer-analysis/');
  const rows=statsRows();
  // Multiple versions of the same prompt must link to their own answer distribution.
  const versions=rows.filter(row=>row.answerSnapshotJSON&&JSON.parse(row.answerSnapshotJSON).questionID==='T2').flatMap(row=>['c','d'].map(version=>({
    ...row,eventID:row.eventID+version,attemptID:row.attemptID+version,
    answerSnapshotJSON:JSON.stringify({...JSON.parse(row.answerSnapshotJSON),questionRevision:version.repeat(64)})
  })));
  async function load(data){
    if(await page.locator('#clear').isVisible())await page.locator('#clear').click();
    await page.locator('#files').setInputFiles({name:'synthetic-review.csv',mimeType:'text/csv',buffer:Buffer.from(csv(data))});
    await page.waitForFunction(()=>document.querySelector('#import-status').textContent.startsWith('1 file added.'));
  }
  await load([...rows,...versions]);
  const completion=page.locator('#progression tr').filter({hasText:'Mean ended-run duration'}).locator('td').nth(1);
  assert.equal(await completion.innerText(),'3m 30s');
  assert.equal(await page.locator('.run-metrics .metric').count(),4);
  assert.equal(await page.locator('.review-link').count(),5);
  async function checkLinks(){
    const links=page.locator('.review-link');
    for(let i=0;i<await links.count();i++){
      const link=links.nth(i),target=await link.getAttribute('href'),card=page.locator(target);
      assert.equal(await page.locator('.question').nth(i).getAttribute('id'),target.slice(1));
      assert.equal(await card.locator('.review-badge').innerText(),`Review ${i+1}`);
      assert.equal(await link.innerText(),`Review ${i+1}: ${await card.locator('h3').innerText()}`);
      await link.focus();await page.keyboard.press('Enter');
      assert.equal(await card.getAttribute('open'),'');
      assert(await card.locator('table').isVisible());
      assert(await card.locator('summary').evaluate(node=>node===document.activeElement));
    }
  }
  await checkLinks();
  await page.locator('#copy-summary').click();
  assert((await page.locator('#summary-text').inputValue()).includes('Review 1: Which side'));
  assert((await page.locator('#summary-text').inputValue()).includes('Mean ended-run duration: 3m 30s'));
  await page.locator('#overview').screenshot({path:path.join(out,'overview-desktop.png')});
  await page.locator('#results').screenshot({path:path.join(out,'review-desktop.png')});
  await page.locator('#mode').selectOption('quiz');
  await page.locator('#more-options > summary').click();
  await page.locator('#minimum').selectOption('1');
  await checkLinks();
  assert.equal(await completion.innerText(),'3m');
  await page.locator('.export-options > summary').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download-summary').click()]);
  const downloaded=path.join(out,'summary.csv');await download.saveAs(downloaded);
  const exported=parseCSV(fs.readFileSync(downloaded,'utf8')),headers=exported.shift().map(value=>value.replace(/^\uFEFF/,''));
  assert(exported.every(row=>row.length===headers.length));
  const overall=Object.fromEntries(headers.map((name,i)=>[name,exported.find(row=>row[0]==='class')[i]]));
  assert.equal(overall.averageCompletionTimeMs,'180000');assert.equal(overall.runsWithCompletionTime,'3');
  await page.locator('#minimum').selectOption('20');
  assert.equal(await page.locator('.review-link').count(),0);assert.equal(await page.locator('.review-badge').count(),0);
  const rates=await page.locator('.question summary p').allTextContents();
  const numbers=rates.map(text=>Number(text.match(/(\d+)% correct/)[1]));
  assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));
  await page.locator('#minimum').selectOption('5');await page.locator('#mode').selectOption('all');
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await checkLinks();
  await page.locator('.run-metrics').screenshot({path:path.join(out,'metrics-mobile.png')});
  const positions=await page.locator('.run-metrics .metric').evaluateAll(cards=>cards.map(card=>({top:card.offsetTop,left:card.offsetLeft})));
  assert.equal(positions[0].top,positions[1].top);assert.equal(positions[2].top,positions[3].top);
  await load(rows.filter(row=>row.event==='question'));
  assert.equal(await completion.innerText(),'Not available');
  await load(releaseRows().map(row=>({...row,correct:''})));
  assert.equal(await page.locator('.review-link').count(),0);
  assert((await page.locator('.question summary p').first().innerText()).includes('Unavailable'));
  await page.locator('#clear').click();
  assert.equal(await page.locator('.question').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: completion card and CSV; five review links, duplicate prompts and revisions, keyboard focus, summary numbers, filtered links, no-review sorting, unknown results, partial runs, mobile grid and clear.');
}finally{await browser?.close();server.close();}
