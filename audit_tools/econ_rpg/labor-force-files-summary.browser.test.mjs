import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {previewServer} from './serve.mjs';
import * as e from './game/games/labor-force-files/engine.js';
import {ACTIVE_KEY} from './game/games/labor-force-files/storage.js';
import {summaryData,summaryText} from './game/games/labor-force-files/summary-chart.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/labor-force-files/summary';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});let zoom;
const errors=[],checks=[],coverage=new Set(),seeds=[];
for(let seed=0;coverage.size<24&&seed<10000;seed++){const keys=Object.entries(e.selections(seed)).map(([k,v])=>k+v);if(keys.some(k=>!coverage.has(k))){seeds.push(seed);keys.forEach(k=>coverage.add(k));}}
async function check(context,seed,label,capture=false){
  const p=await context.newPage();p.on('pageerror',err=>errors.push(err.message));p.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  let run=e.start(e.newRun(seed,'summary-'+seed,Date.now()));while(e.question(run))run=e.next(e.submit(run,e.expected(run)));
  await p.goto(origin+'/games/labor-force-files/');await p.evaluate(({key,run})=>localStorage.setItem(key,JSON.stringify(run)),{key:ACTIVE_KEY,run});await p.reload();
  await p.locator('.summary-table').waitFor();assert.equal(await p.locator('.results>div').count(),5);assert.equal(await p.locator('.summary-line').count(),2);assert.equal(await p.locator('.ur circle').count(),6);assert.equal(await p.locator('.lfpr rect').count(),6);
  assert.deepEqual(await p.locator('.summary-table tbody tr').evaluateAll(rows=>rows.map(row=>[...row.querySelectorAll('td')].map(c=>c.textContent))),summaryData(run).map(r=>[r.ur.toFixed(1)+'%',r.lfpr.toFixed(1)+'%']));
  assert.equal(await p.locator('.graph-takeaway').innerText(),summaryText(run));assert.ok(await p.locator('.summary-figure svg').getAttribute('aria-labelledby'));
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' page overflow');
  const boxes=await p.locator('.summary-figure svg').evaluate(svg=>[...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,w:b.width,h:b.height};}));assert.ok(boxes.every(b=>b.x>=0&&b.y>=0&&b.x+b.w<=400&&b.y+b.h<=310),JSON.stringify(boxes));
  for(const row of await p.locator('.summary-table tr').all())assert.ok(await row.locator('th[scope]').count());
  if(label==='zoom200'){assert.equal(await p.evaluate(()=>innerWidth),683);assert.equal(await p.evaluate(()=>devicePixelRatio),2);}
  if(capture){if(label==='zoom200'){await p.locator('.summary-figure').evaluate(el=>el.scrollIntoView({block:'start'}));await p.bringToFront();await p.waitForTimeout(100);const cdp=await context.newCDPSession(p);const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(`${out}/${label}.png`,Buffer.from(shot.data,'base64'));}else await p.locator('#work').screenshot({path:`${out}/${label}.png`});}
  await p.reload();assert.deepEqual(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),ACTIVE_KEY),run);assert.equal(await p.locator('.graph-takeaway').innerText(),summaryText(run));
  // The graph adds no keyboard trap or interactive widget between result actions.
  for(let i=0;i<30;i++){if(await p.locator('[data-action=replay]').evaluate(el=>el===document.activeElement))break;await p.keyboard.press('Tab');}
  assert.ok(await p.locator('[data-action=replay]').evaluate(el=>el===document.activeElement&&parseFloat(getComputedStyle(el).outlineWidth)>=3));await p.keyboard.press('Enter');assert.equal(await p.locator('.run-summary').count(),0);assert.notEqual(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).runID,ACTIVE_KEY),run.runID);
  checks.push({seed,label});await p.close();
}
try{
  for(const [i,seed] of seeds.entries()){const c=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});await check(c,seed,'desktop-'+i,i===0);await c.close();}
  for(const size of [{width:1280,height:720},{width:768,height:1024},{width:390,height:844},{width:320,height:720}]){const c=await browser.newContext({viewport:size});await check(c,1972,size.width+'x'+size.height,true);await c.close();}
  zoom=await chromium.launchPersistentContext(`${out}/zoom-profile`,{channel:'chrome',headless:true,viewport:{width:1366,height:768}});const settings=zoom.pages()[0];await settings.goto('chrome://settings/appearance');await settings.evaluate(()=>new Promise(r=>chrome.settingsPrivate.setDefaultZoom(2,r)));await settings.close();await check(zoom,0,'zoom200',true);await zoom.close();zoom=null;
  assert.deepEqual(errors,[]);console.log(`PASS ${checks.length} final-report browser checks across all 24 pool entries and six viewport/zoom sizes; no errors.`);
}finally{await writeFile(`${out}/results.json`,JSON.stringify({checks,errors},null,2));await zoom?.close();await browser.close();await new Promise(r=>server.close(r));}
