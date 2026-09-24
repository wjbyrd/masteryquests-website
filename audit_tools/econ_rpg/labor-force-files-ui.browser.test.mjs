import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {previewServer} from './serve.mjs';
import * as e from './game/games/labor-force-files/engine.js';
import {ACTIVE_KEY} from './game/games/labor-force-files/storage.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='tmp/econ-rpg/labor-force-files/ui-cleanup';await mkdir(out,{recursive:true});
const server=previewServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true});let zoom;const errors=[],checks=[];
const seed=Array.from({length:10000},(_,i)=>i).find(i=>{const r=e.newRun(i);return r.baselineID==='district-e'&&r.directID==='losses-8';});assert.ok(seed!==undefined);
function fixture(id){let r=e.start(e.newRun(seed,'ui-'+id,0));while(e.question(r).id!==id)r=e.next(e.submit(r,e.expected(r)));return r;}
async function load(p,r){await p.evaluate(({key,r})=>localStorage.setItem(key,JSON.stringify(r)),{key:ACTIVE_KEY,r});await p.reload();await p.locator('#answer-form').waitFor();}
async function reach(p,selector){const loc=p.locator(selector);for(let i=0;i<100;i++){if(await loc.evaluate(el=>el===document.activeElement)){assert.ok(await loc.evaluate(el=>parseFloat(getComputedStyle(el).outlineWidth)>=3));return;}await p.keyboard.press('Tab');}throw Error('Unreachable: '+selector);}
async function press(p,selector){await reach(p,selector);await p.keyboard.press('Enter');}
async function fill(p,name,text){await reach(p,`[name=${name}]`);await p.keyboard.press('Control+A');await p.keyboard.type(String(text));}
async function radio(p,value){for(let i=0;i<50;i++){if(await p.evaluate(()=>document.activeElement.name==='participation'))break;await p.keyboard.press('Tab');}for(let i=0;i<4;i++){if(await p.evaluate(value=>document.activeElement.value===value,value)){await p.keyboard.press('Space');return;}await p.keyboard.press('ArrowDown');}throw Error('Radio unreachable');}
async function imageFit(p,selector){const img=p.locator(selector);await img.evaluate(i=>i.decode());const image=await img.boundingBox(),report=await p.locator('.population').boundingBox();assert.ok(Math.abs(image.width-report.width)<1,'image spans the Population Report width');assert.equal(await img.evaluate(i=>getComputedStyle(i).objectFit),'fill');}
async function screenshot(p,name){if(name.startsWith('zoom')){await p.bringToFront();await p.waitForTimeout(100);const cdp=await p.context().newCDPSession(p);const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(`${out}/${name}.png`,Buffer.from(shot.data,'base64'));await cdp.detach();}else await p.screenshot({path:`${out}/${name}.png`,fullPage:true});}
async function contrast(p){
  return p.evaluate(()=>{
    const rgb=s=>{const m=s.match(/rgba?\(([^)]+)\)/);return m?m[1].split(',').map(Number):null;};
    const light=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>{const x=light(a),y=light(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    function backgrounds(el){for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p),solid=rgb(s.backgroundColor);if(s.backgroundImage!=='none'){const colors=[...s.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(m=>rgb(m[0]));if(colors.length)return colors;}if(solid&&(solid.length===3||solid[3]===1))return [solid];}return [[3,22,56]];}
    const results=[];
    for(const selector of ['.population h2','.case-note','.population th','.population td','#work .prompt','#work .flow-note','#work label','#work legend','#work .help','.field-feedback:not(:empty)','#work button:visible']){
      const safe=selector.replace(':visible','');for(const el of document.querySelectorAll(safe)){if(!el.getBoundingClientRect().height)continue;const s=getComputedStyle(el);results.push({text:el.textContent.trim().slice(0,50),ratio:Math.min(...backgrounds(el).map(bg=>ratio(rgb(s.color),bg)))});}
    }
    return results;
  });
}
async function check(context,label){
  const p=await context.newPage();p.on('pageerror',err=>errors.push(err.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await p.goto(origin+'/games/');const hubImage=p.locator('[data-game=labor-force-files] img');await hubImage.evaluate(i=>i.decode());assert.ok(await hubImage.evaluate(i=>Math.abs(i.clientWidth/i.clientHeight-4/3)<.02),'hub image matches the shared 4:3 card frame');assert.equal(await hubImage.evaluate(i=>getComputedStyle(i).objectFit),'fill');if(!label.startsWith('zoom'))await p.locator('[data-game=labor-force-files]').screenshot({path:`${out}/${label}-hub.png`});
  await p.goto(origin+'/games/labor-force-files/');assert.equal(await p.locator('.edition').count(),0);assert.doesNotMatch(await p.locator('.hero').innerText(),/POPULATION · EMPLOYMENT · PARTICIPATION/);
  const r=fixture('direct-calc'),target=e.expected(r);await load(p,r);await imageFit(p,'.scene img');await screenshot(p,label+'-paper');
  if(label==='1366x768'){
    await p.route('**/dark-comparison.css',route=>route.fulfill({contentType:'text/css',body:'.population{background:#191f21;color:#f1f0eb;border-color:#525c5f}.population h2{color:#f1f0eb}.population .case-note,.population thead th{color:#bfc5c5}.population .rate-row th,.population .rate-row td{background:#191f21}'}));
    await p.evaluate(()=>new Promise(resolve=>{const link=document.createElement('link');link.id='dark-comparison';link.rel='stylesheet';link.href='./dark-comparison.css';link.onload=resolve;document.head.append(link);}));await screenshot(p,label+'-dark-comparison');await p.locator('#dark-comparison').evaluate(el=>el.remove());await p.unroute('**/dark-comparison.css');
  }
  await fill(p,'ur',target.ur.toFixed(1)+'%');await radio(p,'rises');await press(p,'button[type=submit]');
  assert.match(await p.locator('#field-ur-feedback').innerText(),/UR: Correct — 11.7%/);assert.match(await p.locator('#field-participation-feedback').innerText(),/LFPR: Recheck.*unchanged/);assert.equal(await p.locator('[name=ur]').getAttribute('aria-invalid'),'false');assert.equal(await p.evaluate(()=>document.activeElement.name),'participation');
  assert.match(await p.locator('#announcement').innerText(),/UR: Correct.*LFPR: Recheck/);assert.equal(await p.locator('[name=ur]').inputValue(),'11.7');
  const metrics=await contrast(p);assert.ok(metrics.every(v=>v.ratio>=4.5),JSON.stringify(metrics.filter(v=>v.ratio<4.5)));
  await screenshot(p,label+'-partial');
  const saved=await p.evaluate(k=>localStorage.getItem(k),ACTIVE_KEY);await p.reload();assert.equal(await p.evaluate(k=>localStorage.getItem(k),ACTIVE_KEY),saved);assert.match(await p.locator('#field-ur-feedback').innerText(),/Correct/);
  // Correct only the missed direction; do not touch the accepted UR value.
  await radio(p,'unchanged');await press(p,'button[type=submit]');assert.match(await p.locator('#feedback').innerText(),/Verified/);assert.equal(await p.locator('[name=ur]').inputValue(),'11.7');
  for(const [ur,part,correct]of [[999,'unchanged',[false,true]],[999,'rises',[false,false]]]){await load(p,r);await fill(p,'ur',ur);await radio(p,part);await press(p,'button[type=submit]');assert.deepEqual(await p.locator('.field-feedback').evaluateAll(es=>es.map(el=>el.classList.contains('correct'))),correct);assert.equal(await p.evaluate(()=>document.activeElement.name),'ur');}
  const mixed=fixture('mixed-calc'),answer=e.expected(mixed);await load(p,mixed);for(const [key,value]of Object.entries(answer))await fill(p,key,key==='lfpr'?999:key==='ur'?value.toFixed(2):value);await press(p,'button[type=submit]');assert.deepEqual(await p.locator('.field-feedback').evaluateAll(es=>es.map(el=>el.classList.contains('correct'))),[true,true,false]);assert.equal(await p.evaluate(()=>document.activeElement.name),'lfpr');assert.match(await p.locator('#field-lfpr-feedback').innerText(),/adult population/);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(label==='zoom200'){assert.equal(await p.evaluate(()=>innerWidth),683);assert.equal(await p.evaluate(()=>devicePixelRatio),2);}
  checks.push({label,minTextContrast:Math.min(...metrics.map(v=>v.ratio)),partialCases:4});await p.close();
}
try{
  for(const size of [{width:1366,height:768},{width:1280,height:720},{width:768,height:1024},{width:390,height:844},{width:320,height:720}]){const c=await browser.newContext({viewport:size,reducedMotion:'reduce'});await check(c,size.width+'x'+size.height);await c.close();}
  zoom=await chromium.launchPersistentContext(`${out}/zoom-profile`,{channel:'chrome',headless:true,viewport:{width:1366,height:768},reducedMotion:'reduce'});const settings=zoom.pages()[0];await settings.goto('chrome://settings/appearance');await settings.evaluate(()=>new Promise(r=>chrome.settingsPrivate.setDefaultZoom(2,r)));await settings.close();await check(zoom,'zoom200');await zoom.close();zoom=null;assert.deepEqual(errors,[]);console.log('PASS all six sizes: uncropped images without letterboxing, contrast, field feedback, keyboard correction, saved partial answers; zero errors.');
}finally{await writeFile(`${out}/results.json`,JSON.stringify({checks,errors},null,2));await zoom?.close();await browser.close();await new Promise(r=>server.close(r));}
