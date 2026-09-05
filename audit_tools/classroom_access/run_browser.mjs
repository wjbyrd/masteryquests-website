import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {createWorkerHarness} from '../managerial_classroom/worker-harness.mjs';
const require=createRequire(import.meta.url),{Miniflare,convertV4MiniflareOptions}=require(process.env.MINIFLARE_MODULE||'miniflare'),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.argv[2]||'.'),out=path.join(root,'validation_artifacts/classroom_access');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mq-classroom-gate-')),assets=path.join(tmp,'assets');fs.mkdirSync(assets);
// Only synthetic in-memory credentials, never persisted to config, logs or screenshots.
const code=crypto.randomBytes(24).toString('base64url'),secret=crypto.randomBytes(48).toString('base64url');
for(const dir of ['play/managerial-directorate-classroom','play/managerial-intelligence-directorate','play/managerial-directorate-telemetry-poc'])fs.cpSync(path.join(root,dir),path.join(assets,dir),{recursive:true});
const config=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc')));
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,scriptPath:path.join(root,config.main),compatibilityDate:config.compatibility_date,bindings:{CLASSROOM_ACCESS_CODE:code,CLASSROOM_SESSION_SECRET:secret},assets:{directory:assets,binding:'ASSETS',routerConfig:{has_user_worker:true},run_worker_first:config.assets.run_worker_first},ratelimits:{CLASSROOM_LOGIN_LIMIT:{namespace_id:config.ratelimits[0].namespace_id,simple:config.ratelimits[0].simple}}}));
const backend=createWorkerHarness(root),results=[],screenshots=[],errors=[],cookieLeaks=[];
const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url());if(url.origin!=='https://classroom.test')return route.abort();
 const headers=await req.allHeaders();
 if(url.pathname.startsWith('/api/anonymous-telemetry-poc/')){
  if(headers.cookie)cookieLeaks.push('cookie');const body=req.postDataJSON();const response=await backend.call(url.pathname,{events:body.events});if(response.status===202)for(const e of body.events)backend.received.set(e.eventId,e);
  return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
 }
 const response=await mf.dispatchFetch(req.url(),{method:req.method(),headers,body:req.postDataBuffer()||undefined,redirect:'manual'});
 await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});
});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',detail:e.message.replaceAll(code,'[fixture]').replaceAll(secret,'[fixture]')});}console.log(name+': '+results.at(-1).status);}
async function shot(name){await page.screenshot({path:path.join(out,name+'.png')});screenshots.push(name+'.png');}
const base='/play/managerial-directorate-classroom';
try{
 await check('Real Cloudflare asset runtime gates hub, every title, scripts and encoded path aliases',async()=>{
  for(const p of [base+'/',...['cost-directive','market-signal','strategy-desk','agency-protocol'].flatMap(g=>[base+'/'+g+'/',base+'/'+g+'/index.html']),base+'/telemetry-client.js','/%70lay/managerial-directorate-classroom/cost-directive/','/play/%6danagerial-directorate-classroom/cost-directive/',base+'%2fcost-directive/','//play//managerial-directorate-classroom/cost-directive/']){let r=await mf.dispatchFetch('https://classroom.test'+p,{redirect:'manual'});if([307,308].includes(r.status)){const location=r.headers.get('location');assert.ok(location.startsWith(base+'/'),p);r=await mf.dispatchFetch('https://classroom.test'+location,{redirect:'manual'});}assert.ok((await r.text()).includes('Enter the class access code'),p+' status='+r.status);}
 });
 await check('Gate desktop/mobile layout, accessible label, focus and empty screenshot',async()=>{
  await page.goto('https://classroom.test'+base+'/cost-directive/');await shot('gate-desktop');await page.setViewportSize({width:390,height:844});await page.getByLabel('Access code',{exact:true}).focus();assert.equal(await page.getByLabel('Access code',{exact:true}).evaluate(n=>n===document.activeElement),true);assert.equal(await page.getByLabel('Access code',{exact:true}).inputValue(),'');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('gate-mobile');
 });
 await check('Wrong form code shows accessible generic error and sets no session',async()=>{
  await page.getByLabel('Access code',{exact:true}).fill(crypto.randomBytes(12).toString('hex'));await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.getByRole('alert').textContent(),'That access code is not valid.');assert.equal(await page.getByLabel('Access code',{exact:true}).inputValue(),'');assert.equal((await context.cookies()).length,0);await shot('gate-error-mobile');
 });
 await check('Correct form issues secure HttpOnly cookie and returns to original child',async()=>{
  await page.getByLabel('Access code',{exact:true}).fill(code);await page.getByRole('button',{name:'Continue',exact:true}).click();await page.waitForFunction(()=>typeof startSelectedMode==='function');assert.equal(new URL(page.url()).pathname,base+'/cost-directive/');
  const cookie=(await context.cookies()).find(c=>c.name==='__Secure-MQClassroom');assert.ok(cookie&&cookie.secure&&cookie.httpOnly&&cookie.sameSite==='Lax');assert.equal(cookie.path,base+'/');assert.ok(!cookie.value.includes(code));assert.ok(!(await page.evaluate(()=>document.cookie)).includes('__Secure-MQClassroom'));
 });
 for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol'])await check(game+' authenticated real game, intro, Daily/menu and anonymous telemetry',async()=>{
  await page.goto('https://classroom.test'+base+'/'+game+'/');assert.equal(await page.getByLabel('Access code',{exact:true}).count(),0);await page.evaluate(()=>startSelectedMode('standard'));await page.locator('#guideIntroProceed').click();await page.waitForFunction(()=>Boolean(currentQuestion));
  await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('anonymousTelemetry:queue:v1')||'[]').length===0);
  const e=[...backend.received.values()].filter(e=>e.gameId===game);assert.ok(e.some(e=>e.eventType==='run_started'));assert.ok(e.some(e=>e.eventType==='answer_evaluated'));assert.ok(e.every(e=>e.synthetic===false&&e.sourceRunId&&e.anonymousClientId));
  for(const item of e)for(const field of ['accessCode','sessionId','cookie','authorizationTimestamp','ip','CLASSROOM_ACCESS_CODE','CLASSROOM_SESSION_SECRET'])assert.ok(!Object.hasOwn(item,field));assert.ok(!JSON.stringify(e).includes(code)&&!JSON.stringify(e).includes(secret));
  await page.locator('#returnMenuBtn').click();assert.equal(await page.locator('#gameMenuFullscreen').isVisible(),true);assert.equal(await page.locator('#gameMenuDaily').isVisible(),true);assert.equal(await page.locator('#anonymousTelemetryDebug').count(),0);await shot(game+'-authorized-menu-mobile');
 });
 await check('Public assets and POC remain ungated in actual asset runtime',async()=>{
  for(const p of ['/play/managerial-intelligence-directorate/cost-directive/','/play/managerial-intelligence-directorate/managerial-parity.js','/play/managerial-directorate-telemetry-poc/cost-directive/']){const r=await mf.dispatchFetch('https://classroom.test'+p);assert.equal(r.status,200);assert.ok(!(await r.text()).includes('Enter the class access code'));}
  await page.goto('https://classroom.test/play/managerial-directorate-telemetry-poc/cost-directive/?telemetryDebug=1&telemetrySynthetic=1');assert.equal(await page.locator('#anonymousTelemetryDebug').count(),1);
 });
 await check('Native Cloudflare rate limiter throttles repeated unauthenticated login attempts',async()=>{
 let limited=false;for(let i=0;i<125;i++){const r=await mf.dispatchFetch('https://classroom.test'+base+'/',{method:'POST',headers:{origin:'https://classroom.test','content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({accessCode:'synthetic-incorrect-fixture'}).toString()});if(r.status===429){limited=true;assert.equal(r.headers.get('retry-after'),'60');break;}}assert.ok(limited);
});
await check('No gate cookie reaches telemetry; no browser errors',async()=>{assert.deepEqual(cookieLeaks,[]);assert.deepEqual(errors,[]);});
}finally{
 await browser.close();await mf.dispose();backend.close();
 if(!path.resolve(tmp).startsWith(path.resolve(os.tmpdir())+path.sep)||!path.basename(tmp).startsWith('mq-classroom-gate-'))throw Error('Unexpected temporary directory');fs.rmSync(tmp,{recursive:true});
 const failed=results.filter(r=>r.status==='FAIL'),report={passed:results.length-failed.length,failed:failed.length,total:results.length,results,screenshots,errors};fs.writeFileSync(path.join(out,'browser_results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failed.length)process.exitCode=1;
}
