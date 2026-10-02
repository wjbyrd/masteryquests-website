import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir,writeFile } from 'node:fs/promises';
import { previewServer } from './serve.mjs';
import * as core from './game/games/cpi-live/engine.js';
import { ACTIVE_KEY } from './game/games/cpi-live/storage.js';
import { measurementModel } from './game/games/cpi-live/measurement.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/cpi-live-measurement';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[],results=[];
const state=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),ACTIVE_KEY);
async function key(page,selector){const el=page.locator(selector);await el.focus();await page.keyboard.press('Enter');}
async function resume(page){const before=await state(page);await page.reload();assert.deepEqual(await state(page),before);}
async function inspect(page,label){
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow');
  for(const el of await page.locator('button:visible,input:visible,summary:visible,a.button:visible').all())assert((await el.boundingBox()).height>=44,label+' target');
  assert.doesNotMatch(await page.locator('body').innerText(),/NaN|Infinity|undefined/);
  await page.screenshot({path:`${out}/${label}.png`,fullPage:true});
}
try{
  for(const [i,viewport]of [{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1366,height:900}].entries()){
    const page=await browser.newPage({viewport,reducedMotion:'reduce'});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
    await page.goto(origin+'/games/cpi-live/');const label=String(viewport.width);
    assert.equal(await page.locator('#basket-total').innerText(),'—');
    assert.equal(await page.locator('.basket-help').getAttribute('open'),null);
    assert.equal(await page.locator('.locked,.fixed-word').count(),0);
    assert.equal(await page.locator('.index-monitor>div').count(),3);
    for(const el of await page.locator('.basket-quantity').all())assert(await el.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=13.5));
    await inspect(page,label+'-opening');
    await key(page,'.basket-help>summary');assert(await page.locator('.basket-help>p').isVisible());
    assert(!await page.locator('.basket-help details p').isVisible());
    await key(page,'.basket-help details summary');assert(await page.locator('.basket-help details p').isVisible());
    let r=core.start(core.newRun(i,'browser-extension-'+i,0));while(r.phase!=='complete')r=core.next(core.submit(r,core.expected(r)));
    await page.evaluate(({k,r})=>localStorage.setItem(k,JSON.stringify(r)),{k:ACTIVE_KEY,r});await page.reload();
    await key(page,'[data-measurement=open]');await resume(page);await inspect(page,label+'-substitution');
    const ids=(await state(page)).extension.ids;
    await key(page,'[data-measurement-answer=overstate]');assert.match(await page.locator('#extension-feedback').innerText(),/Move one/);
    await key(page,'[data-shift="1"]');assert.equal(await page.locator('[data-shift="1"]').isDisabled(),true);await resume(page);
    await key(page,'[data-measurement-answer=overstate]');assert((await state(page)).extension.solved);
    await inspect(page,label+'-substitution-compared');
    await key(page,'[data-measurement=next]');await inspect(page,label+'-new-goods');
    await key(page,'[data-measurement-answer=insert]');assert(!(await state(page)).extension.solved);
    await key(page,'[data-measurement-answer=wait]');await resume(page);await inspect(page,label+'-opportunity');
    await key(page,'[data-measurement-answer=update]');await key(page,'[data-measurement=next]');
    const m=measurementModel((await state(page)).extension);
    await inspect(page,label+'-quality');
    await page.locator('#quality-comparable').fill('bad');await page.locator('#quality-raw').fill('10');await page.locator('#quality-adjusted').fill('10');await key(page,'#quality-form button');assert(!(await state(page)).extension.solved);await resume(page);
    await page.locator('#quality-comparable').fill(String(m.comparable));await page.locator('#quality-raw').fill('10%');await page.locator('#quality-adjusted').fill('-5%');await key(page,'#quality-form button');assert((await state(page)).extension.solved);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'extension-feedback');
    await inspect(page,label+'-quality-compared');await key(page,'[data-measurement=next]');await resume(page);
    assert.equal(await page.locator('.measurement-summary section').count(),3);await inspect(page,label+'-complete');
    const completed=await state(page);assert.equal(completed.firstCorrect,10);assert.deepEqual(completed.attempts,r.attempts);
    await key(page,'[data-measurement=summary]');assert.match(await page.locator('#work').innerText(),/100%/);await key(page,'[data-measurement=open]');
    await key(page,'[data-measurement=replay]');const replay=await state(page);for(const k of Object.keys(ids))assert.notEqual(replay.extension.ids[k],ids[k]);await resume(page);
    await key(page,'[data-measurement=summary]');await key(page,'[data-action=replay]');const fresh=await state(page);assert.notEqual(fresh.meaningID,completed.meaningID);assert(!fresh.extension);assert.equal(fresh.phase,'intro');
    results.push({viewport,ids,replay:replay.extension.ids,score:completed.firstCorrect});await page.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({results,errors},null,2));
}finally{await writeFile(out+'/results.json',JSON.stringify({results,errors},null,2));await browser.close();await new Promise(r=>server.close(r));}
