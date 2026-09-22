import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {previewServer} from './serve.mjs';
import {audit} from './gameday-rivals-qa.mjs';
import scenario from './game/scenarios/gameday-rivals.js';
import {activityFor,sceneFor} from './game/scenarios/gameday-rivals-scenes.js';
import {CLASSIFICATIONS} from './game/scenarios/gameday-rivals-market.js';
import {SAVE_KEY} from './game/gameday-rivals-storage.js';
import {scenarios} from './game/scenarios/registry.js';
import {storageKey} from './game/storage.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=fileURLToPath(new URL('../../tmp/econ-rpg/gameday-rivals/',import.meta.url));await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,url=`${origin}/?scenario=gameday-rivals`;
const data=audit(), cases=[...data.representatives],features=row=>row.run.history.map(h=>`${h.roundIndex}-${h.playerAction}/${h.rivalAction}`);
const covered=new Set(cases.flatMap(features));
for(const row of data.seasons)if(features(row).some(f=>!covered.has(f))){cases.push({label:'Overlay coverage',...row});features(row).forEach(f=>covered.add(f));}
assert.equal(covered.size,24);
const errors=[],external=[],violations=[],passed=[],seen=new Set(),classifications=new Set();let browser;
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const check=t=>{passed.push(t);console.log(`PASS ${t}`);};
try {
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 const context=await browser.newContext({viewport:{width:1280,height:960},reducedMotion:'reduce'});
 await context.route('**/*',route=>{if(!route.request().url().startsWith(origin+'/')){external.push(route.request().url());return route.abort();}return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{window.__violations=[];document.addEventListener('securitypolicyviolation',e=>window.__violations.push(e.violatedDirective));});
 const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE_KEY);
 const bounds=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
 const focus=async()=>assert.equal(await page.evaluate(()=>document.activeElement.id),'view-title');
 const before=async()=>{assert.equal(await page.locator('[data-strategy]').count(),2);assert.equal(await page.locator('.gr-matrix,.gr-reveal-card,.indicator-list,.steps').count(),0);assert.doesNotMatch(await page.locator('main').innerText(),/Prisoner|Nash|dominant strategy|Temptation ·/);assert.equal(await page.locator('.gr-traffic [data-slot]').count(),0);await bounds();};
 const fresh=async seed=>{await page.goto(url);await page.evaluate(k=>localStorage.removeItem(k),SAVE_KEY);await page.goto(seed===undefined?url:`${url}&seed=${seed}`);await page.getByRole('button',{name:'Start Season',exact:true}).click();await before();};
 const panel=async run=>{assert.deepEqual(await page.locator('.gr-stats dd').allTextContents(),[money(run.playerSeasonProfit),money(run.rivalSeasonProfit),`${run.playerShare}%`,`${run.rivalShare}%`]);assert.equal(await page.locator('.gr-ledger>li').count(),run.history.length);await bounds();};
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:960});
  for(const [index,row] of cases.entries()){
   await fresh(row.run.seed);
   for(let i=0;i<6;i++){
    await before();await focus();
    for(const b of await page.locator('[data-strategy]').all())assert.ok((await b.boundingBox()).height>=44);
    const expected=row.run.history[i],img=page.locator('.gr-scene img');assert.equal(await img.getAttribute('src'),sceneFor(scenario,i).src);await img.evaluate(e=>e.decode());
    assert.deepEqual(await img.evaluate(e=>[e.naturalWidth,e.naturalHeight,getComputedStyle(e).objectFit]),[1448,1086,'contain']);
    const box=await img.boundingBox();assert.ok(Math.abs(box.width/box.height-4/3)<.01);
    // Two immediate invocations of the same stale node cannot post twice.
    await page.locator(`[data-strategy="${row.sequence[i]}"]`).evaluate(b=>{b.click();b.click();});
    const run=await saved();assert.equal(run.history.length,i+1);assert.deepEqual(run.history[i],expected);
    assert.deepEqual(await page.locator('.gr-action-revealed').allTextContents(),[expected.playerAction,expected.rivalAction].map(a=>scenario.actions.find(v=>v.id===a).label));
    assert.deepEqual(await page.locator('.gr-profit').allTextContents(),[money(expected.playerProfit),money(expected.rivalProfit)]);
    assert.match(await page.locator('#announcement').textContent(),/Both offers revealed/);await panel(run);await focus();
    const activity=activityFor(expected.playerAction,expected.rivalAction),svg=page.locator('.gr-traffic');assert.equal(await svg.getAttribute('data-activity'),activity.id);
    assert.equal(await svg.locator('[data-slot]').count(),activity.units.length);assert.equal(await svg.getAttribute('aria-label'),activity.description);
    for(const unit of activity.units){const g=svg.locator(`[data-slot="${unit.id}"]`);assert.equal(await g.getAttribute('transform'),`translate(${unit.x} ${unit.y}) rotate(${unit.rotation})`);assert.equal(await g.locator('text').textContent(),scenario.firms[unit.firm].mark);assert.equal(await g.locator('rect').first().getAttribute('fill'),scenario.firms[unit.firm].color);}
    const imageKey=`${width}-${i}-${activity.id}`;if(!seen.has(imageKey)){seen.add(imageKey);await page.locator('.gr-scene').screenshot({path:`${out}/scene-${imageKey}.png`});}
    if(index===0&&i===0)await page.screenshot({path:`${out}/reveal-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:i===5?'Review the season':`Prepare Game Day ${i+2}`,exact:true}).click();
   }
   assert.equal(await page.locator('#view-title').textContent(),CLASSIFICATIONS.find(c=>c.id===row.run.classification).title);classifications.add(row.run.classification);
   assert.equal(await page.locator('.gr-matrix').count(),1);assert.match(await page.locator('main').innerText(),/T > R > P > S/);assert.match(await page.locator('main').innerText(),/Nash equilibrium/);assert.match(await page.locator('main').innerText(),/finite horizon/);
   await panel(row.run);if(index===0)await page.screenshot({path:`${out}/debrief-${width}.png`,fullPage:true});
   violations.push(...await page.evaluate(()=>window.__violations));
  }
 }
 assert.equal(seen.size,72);assert.equal(classifications.size,6);check(`${cases.length*3} complete browser seasons at 1280/390/320px; all six classifications and 24 round/activity combinations at each width`);
 await page.setViewportSize({width:1280,height:960});await fresh(4);
 for(let i=0;i<6;i++){
  await page.locator('[data-strategy="standard"]').focus();await page.keyboard.press(i%2?'Space':'Enter');const snapshot=await saved();await page.reload();
  await page.getByRole('button',{name:i===5?'Review Saved Season':`Resume at Game Day ${i+2}`,exact:true}).click();await panel(snapshot);assert.deepEqual(await saved(),snapshot);if(i<5)await before();
 }
 check('keyboard choices and reload after every reveal resume once with unchanged saved profits, seed, shares and history');
 const priorKeys=Object.values(scenarios).filter(s=>s.id!==scenario.id).map(storageKey);await page.evaluate(keys=>keys.forEach(k=>localStorage.setItem(k,'untouched')),priorKeys);
 const old=await saved();await page.locator('#restart').click();await page.keyboard.press('Escape');assert.deepEqual(await saved(),old);
 await page.locator('#restart').click();await page.locator('#cancel-restart').click();assert.deepEqual(await saved(),old);
 await page.locator('#restart').click();await page.locator('#confirm-restart').click();assert.equal(await saved(),null);assert.deepEqual(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),priorKeys),priorKeys.map(()=>'untouched'));await before();
 await page.locator('[data-strategy="standard"]').click();assert.equal((await saved()).seed,4);assert.notEqual((await saved()).runID,old.runID);
 await fresh();await page.locator('[data-strategy="standard"]').click();const auto=await saved();await page.locator('#restart').click();await page.locator('#confirm-restart').click();await page.locator('[data-strategy="standard"]').click();assert.notEqual((await saved()).seed,auto.seed);
 check('New Season cancels cleanly, preserves four other save keys, clears this run and regenerates ordinary seeds; QA seed stays fixed');
 await page.evaluate(({key,run})=>localStorage.setItem(key,JSON.stringify({...run,scenarioVersion:999})),{key:SAVE_KEY,run:auto});await page.reload();await page.getByText(/This saved season uses a different version/).waitFor();assert.equal(await page.getByRole('button',{name:'Start Season',exact:true}).count(),1);
 await page.goto(`${url}&seed=wrong`);await page.getByText(/QA seed must be an integer/).waitFor();check('incompatible saves and invalid QA seeds show explicit notices');
 const blocked=await context.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});await blocked.goto(url);await blocked.getByRole('button',{name:'Start Season',exact:true}).click();await blocked.locator('[data-strategy="standard"]').click();assert.equal(await blocked.locator('.gr-reveal-card').count(),2);assert.match(await blocked.locator('#storage-notice').textContent(),/could not be saved/);await blocked.close();check('storage denial still permits live play with a visible save warning');
 const missing=await context.newPage();await missing.route('**/round-01-home-opener.webp',r=>r.fulfill({status:404,body:'missing'}));await missing.goto(url);await missing.getByRole('button',{name:'Start Season',exact:true}).click();await missing.getByText(/Missing scene asset:/).waitFor();assert.match(await missing.locator('.gr-scene img').getAttribute('src'),/round-01-home-opener/);await missing.close();check('missing image is named explicitly and never silently substituted');
 const manifest=JSON.parse(readFileSync(new URL('./art/gameday-rivals-assets.json',import.meta.url),'utf8'));
 for(const asset of manifest.filter(a=>a.path.startsWith('game/'))){const response=await context.request.get(`${origin}/${asset.path.slice(5)}`);assert.equal(response.status(),200);assert.equal(createHash('sha256').update(await response.body()).digest('hex'),asset.sha256);}
 assert.equal((await context.request.get(`${origin}/art/sources/round-01-home-opener.png`)).status(),404);check('served WebPs retain supplied hashes; PNG masters are outside the preview root');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(violations,[]);check('no runtime errors, external requests or CSP violations in normal play');
 await writeFile(`${out}/results.json`,JSON.stringify({completeBrowserSeasons:cases.length*3,widths:[1280,390,320],roundActivityScreenshots:seen.size,classifications:[...classifications],passed,errors,external,violations},null,2));
} finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
