import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {previewServer} from './serve.mjs';
import {CONFIG} from './game/games/labor-force-files/config.js';
import * as e from './game/games/labor-force-files/engine.js';
import {ACTIVE_KEY} from './game/games/labor-force-files/storage.js';
import {PREFIX} from './game/games/labor-force-files/telemetry.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/labor-force-files';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});let zoom;
const errors=[],external=[],checks=[],coverage=new Set(),seeds=[];
for(let seed=0;coverage.size<24&&seed<10000;seed++){const picks=Object.entries(e.selections(seed)).map(([k,v])=>k+v);if(picks.some(p=>!coverage.has(p))){seeds.push(seed);picks.forEach(p=>coverage.add(p));}}
assert.equal(coverage.size,24);
async function reach(p,loc){await loc.waitFor();for(let i=0;i<100;i++){if(await loc.evaluate(el=>el===document.activeElement)){assert.ok(await loc.evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth)>=3));return;}await p.keyboard.press('Tab');}throw Error('Keyboard target unreachable: '+await loc.textContent());}
async function press(p,selector){await reach(p,p.locator(selector));await p.keyboard.press('Enter');}
async function fill(p,name,value){await reach(p,p.locator(`[name="${name}"]`));await p.keyboard.press('Control+A');await p.keyboard.type(String(value));}
async function radio(p,value){for(let n=0;n<80;n++){if(await p.evaluate(()=>document.activeElement.name==='participation'))break;await p.keyboard.press('Tab');}for(let n=0;n<4;n++){if(await p.evaluate(value=>document.activeElement.value===value,value)){await p.keyboard.press('Space');return;}await p.keyboard.press('ArrowDown');}throw Error('Radio choice unreachable');}
async function submit(p,target){if(typeof target==='object'){for(const [k,v]of Object.entries(target)){if(k==='participation')await radio(p,v);else await fill(p,k,typeof v==='number'&&k!=='laborForce'?v.toFixed(2)+'%':v);}await press(p,'button[type=submit]');}else await press(p,`[data-answer="${target}"]`);}
async function inspect(p,label){
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow');
  const img=p.locator('.scene img');await img.evaluate(i=>i.decode());assert.equal(await img.evaluate(i=>i.naturalWidth),1672);assert.equal(await img.evaluate(i=>getComputedStyle(i).objectFit),'contain');assert.ok((await img.getAttribute('alt')).length>60);
  for(const input of await p.locator('input').all())assert.ok(await input.evaluate(el=>el.labels.length>0));
  for(const control of await p.locator('button:visible,input[type=text]:visible,.return-games,.radio:visible').all())assert.ok((await control.boundingBox()).height>=44,label+' target');
  assert.equal(await p.locator('.population tbody th[scope=row]').count(),7);assert.equal(await p.locator('#announcement[aria-live=polite][aria-atomic=true]').count(),1);
  assert.equal(await p.locator('#report [aria-live]').count(),0);
}
async function capture(p,label){if(label.startsWith('zoom')){await p.bringToFront();await p.waitForTimeout(100);const cdp=await p.context().newCDPSession(p);const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(`${out}/${label}.png`,Buffer.from(shot.data,'base64'));await cdp.detach();}else await p.screenshot({path:`${out}/${label}.png`,fullPage:true});}
async function play(context,seed,label,captureAll=false,wrong=true){
  const p=await context.newPage();p.on('pageerror',x=>errors.push(x.message));p.on('console',x=>{if(x.type()==='error')errors.push(x.text());});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});p.on('request',r=>{if(!r.url().startsWith(origin+'/'))external.push(r.url());});
  await p.addInitScript(seed=>{const original=crypto.getRandomValues.bind(crypto);Object.defineProperty(crypto,'getRandomValues',{value(a){if(a instanceof Uint32Array&&a.length===1){a[0]=seed;return a;}return original(a);}});},seed);
  await p.goto(origin+'/games/');await p.evaluate(()=>localStorage.clear());const card=p.locator('[data-game=labor-force-files]');assert.equal(await card.locator('h2').innerText(),CONFIG.title);assert.equal(await card.locator('p').innerText(),CONFIG.description);await card.locator('img').evaluate(i=>i.decode());if(captureAll&&!label.startsWith('zoom'))await card.screenshot({path:`${out}/${label}-card.png`});
  await press(p,'[data-game=labor-force-files] a');await p.waitForURL('**'+CONFIG.route);assert.equal(await p.title(),CONFIG.title+' | Mastery Quests');await inspect(p,label);
  if(label==='zoom200'){assert.equal(await p.evaluate(()=>innerWidth),683);assert.equal(await p.evaluate(()=>devicePixelRatio),2);}
  if(captureAll)await capture(p,label+'-intro');
  await press(p,'[data-action=start]');let run=e.start(e.newRun(seed,'qa',0));
  while(e.question(run)){
    const q=e.question(run),target=e.expected(run);assert.equal(await p.evaluate(()=>document.activeElement.id),'stage-title');await inspect(p,label+q.id);
    assert.equal(await p.locator('.formula').count(),0);assert.equal(await p.locator('.scene img').getAttribute('src'),`../../art/scenes/labor-force-files/labor-${e.model(run).scene.id}.webp`);
    if(captureAll)await capture(p,label+'-'+q.id);
    if(wrong){const bad=typeof target==='object'?Object.fromEntries(Object.keys(target).map(k=>[k,k==='participation'?'falls':999])):e.options(run).find(([id])=>id!==target)[0];await submit(p,bad);run=e.submit(run,bad);assert.match(await p.locator('#feedback').innerText(),/Try again/);assert.equal(await p.locator('[data-action=next]').count(),0);assert.equal(await p.locator('.formula').count(),0);}
    if(captureAll&&['ur','lfpr','mixed-calc'].includes(q.id)){
      const name=Object.keys(target).find(k=>k!=='participation');await fill(p,name,123);await press(p,'[data-hint=concept]');run=e.hint(run,'concept');assert.equal(await p.evaluate(()=>document.activeElement.dataset.hint),'concept');assert.equal(await p.locator(`[name=${name}]`).inputValue(),'123');assert.equal(await p.locator('.formula').count(),0);await press(p,'[data-hint=formula]');run=e.hint(run,'formula');assert.equal(await p.evaluate(()=>document.activeElement.dataset.hint),'formula');assert.equal(await p.locator('[data-hint=formula]').getAttribute('aria-expanded'),'true');assert.ok(await p.locator('.formula .sr-only').count());
      const saved=await p.evaluate(k=>localStorage.getItem(k),ACTIVE_KEY);await p.reload();assert.equal(await p.evaluate(k=>localStorage.getItem(k),ACTIVE_KEY),saved);assert.ok(await p.locator('.formula').count());
      if(captureAll)await capture(p,label+'-'+q.id+'-hints');
    }
    await submit(p,target);run=e.submit(run,target);assert.equal(run.solved,true);assert.match(await p.locator('#feedback').innerText(),/Verified/);assert.equal(await p.evaluate(()=>document.activeElement.id),'feedback');assert.ok(await p.locator('#work input,#work button[data-answer],#work button[type=submit]').evaluateAll(es=>es.every(el=>el.disabled)));
    if(captureAll&&['discouraged-interpret','headline','direct-calc','expansion-calc'].includes(q.id))await capture(p,label+'-'+q.id+'-solved');
    await press(p,'[data-action=next]');run=e.next(run);
  }
  assert.match(await p.locator('#work').innerText(),/Labor report complete/);assert.match(await p.locator('.results').innerText(),new RegExp(wrong?'0%':'100%'));await inspect(p,label+' complete');if(captureAll)await capture(p,label+'-complete');
  const finished=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),ACTIVE_KEY);await p.reload();assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),ACTIVE_KEY),finished);
  const record=await p.evaluate(({prefix,id})=>JSON.parse(localStorage.getItem(prefix+id)),{prefix:PREFIX,id:finished.runID});assert.equal(record.events.filter(v=>v.action==='run_start').length,1);assert.equal(record.events.filter(v=>v.action==='run_complete').length,1);assert.equal(record.events.filter(v=>v.action==='classification_complete').length,4);
  await press(p,'[data-action=replay]');const fresh=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),ACTIVE_KEY);assert.notEqual(fresh.runID,finished.runID);for(const k of Object.keys(e.POOLS))assert.notEqual(fresh[k],finished[k]);assert.deepEqual(fresh.hints,{});await p.reload();assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),ACTIVE_KEY),fresh);await press(p,'nav .return-games');await p.waitForURL('**/games/');checks.push({seed,label,selections:e.selections(seed)});console.log('PASS '+label+' seed '+seed);await p.close();
}
try{
  for(const [i,seed]of seeds.entries()){const c=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});await play(c,seed,'desktop-'+i,i===0);await c.close();}
  for(const size of [{width:1280,height:720},{width:768,height:1024},{width:390,height:844},{width:320,height:720}]){const c=await browser.newContext({viewport:size,reducedMotion:'reduce'});await play(c,seeds.at(-1),size.width+'x'+size.height,true);await c.close();}
  zoom=await chromium.launchPersistentContext(`${out}/zoom-profile`,{channel:'chrome',headless:true,viewport:{width:1366,height:768},reducedMotion:'reduce'});const settings=zoom.pages()[0];await settings.goto('chrome://settings/appearance');await settings.evaluate(()=>new Promise(r=>chrome.settingsPrivate.setDefaultZoom(2,r)));await settings.close();await play(zoom,0,'zoom200',true);await zoom.close();zoom=null;
  const c=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'no-preference'});await play(c,3,'perfect',false,false);await c.close();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(`PASS ${checks.length} full keyboard runs; all 24 variants; zero console/page/network errors.`);
}finally{await writeFile(`${out}/browser-results.json`,JSON.stringify({seeds,checks,errors,external},null,2));await zoom?.close();await browser.close();await new Promise(r=>server.close(r));}
