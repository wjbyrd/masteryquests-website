import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createWorkerHarness} from '../managerial_classroom/worker-harness.mjs';
const root=process.cwd(),out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/private_telemetry_refresh_regression/diagnostic';
fs.mkdirSync(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const harness=createWorkerHarness(root),trace=[],snapshots=[];
const assertFixed=process.argv.includes('--assert-fixed'),checks=[];
const server=http.createServer((req,res)=>{
  if(req.url.startsWith('/api/anonymous-telemetry-poc/'))return harness.serve(req,res);
  let p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
  if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
    if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(p)]||'application/octet-stream');
    let data=fs.readFileSync(p);
    if(p.endsWith('.html')&&/managerial-directorate-(classroom|telemetry-poc)/.test(p)&&new URL(req.url,'http://local').searchParams.get('qaEnabled')!=='0')data=data.toString().replace('name="anonymous-telemetry-collection" content="disabled"','name="anonymous-telemetry-collection" content="enabled"');
    // Test-only access to closure state, never written into a production artifact.
    if(p.endsWith('telemetry-client.js'))data=data.toString().replace('  if(!Array.isArray(state.queue))', '  window.__MQRefreshDiagnostic={remoteEnabled,getClientId,setRemoteCollection,getQueue:()=>state.queue.slice(),getQuality:()=>({...state.quality}),buildScope:BUILD_SCOPE,activeRun:()=>state.activeRunId,activeRunKey:ACTIVE_RUN_KEY,collectionKey:COLLECTION_KEY,queueKey:QUEUE_KEY};\n  if(!Array.isArray(state.queue))');
    res.end(data);
  }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({channel:'msedge',headless:true});
async function flush(page){await page.evaluate(()=>window.AnonymousTelemetryPOC?AnonymousTelemetryPOC.flush():window.dispatchEvent(new Event('online')));await page.waitForTimeout(300);}
async function answer(page){await page.evaluate(async()=>{questionStartTime=Date.now()-6000;for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)){await answer(i);return;}});await flush(page);}
async function snapshot(page,family,stage){
  const data=await page.evaluate(()=>{
    const AnonymousTelemetryPOC=window.__MQRefreshDiagnostic;
    const keys=Object.keys(localStorage),telemetry=Object.fromEntries(keys.filter(k=>k.includes('anonymousTelemetry:')).map(k=>[k,localStorage.getItem(k)]));
    const saveKey=typeof getSaveKey==='function'?getSaveKey():null;
    let saved={};try{const s=JSON.parse(localStorage.getItem(saveKey)||'null');if(s)saved={runID:s.runID,runId:s.runId,room:s.room,gameMode:s.gameMode,fields:Object.keys(s)};}catch{saved={malformed:true};}
    return {url:location.href,meta:document.querySelector('meta[name="anonymous-telemetry-collection"]')?.content,remoteEnabled:AnonymousTelemetryPOC.remoteEnabled(),clientId:AnonymousTelemetryPOC.getClientId(),queue:AnonymousTelemetryPOC.getQueue(),quality:AnonymousTelemetryPOC.getQuality(),buildScope:AnonymousTelemetryPOC.buildScope,activeRun:AnonymousTelemetryPOC.activeRun(),runID:typeof runID==='undefined'?null:runID,namespace:window.__MQ_PRIVATE_STORAGE_NAMESPACE__,localStorageKeys:keys,sessionStorageKeys:Object.keys(sessionStorage),telemetry,saveKey,saved};
  });
  const events=[...harness.received.values()].filter(e=>e.buildId===family);
  snapshots.push({family,stage,...data,receivedCount:events.length,received:events.map(e=>({eventId:e.eventId,eventType:e.eventType,runId:e.runId,copyCount:e.copyCount}))});
}
try{
 for(const family of ['managerial-directorate-telemetry-poc','managerial-directorate-classroom']){
  const context=await browser.newContext();await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await context.addInitScript(()=>{
    const parse=JSON.parse;
    JSON.parse=function(value,...args){try{return parse.call(this,value,...args);}catch(e){if(typeof value==='string'&&/^[a-f0-9-]{36}$/i.test(value))console.log('MQ_REFRESH_TRACE '+JSON.stringify({parseFailure:value,stack:new Error().stack}));throw e;}};
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){
      if(String(k).includes('remoteDisabled'))console.log('MQ_REFRESH_TRACE '+JSON.stringify({url:location.href,key:k,value:v,meta:document.querySelector('meta[name="anonymous-telemetry-collection"]')?.content,stack:new Error().stack}));
      return original.call(this,k,v);
    };
  });
  const p=await context.newPage();p.on('pageerror',e=>console.log('PAGEERROR',e.stack));p.on('console',m=>{if(m.text().startsWith('MQ_REFRESH_TRACE '))trace.push({family,...JSON.parse(m.text().slice(17))});});
  await p.goto(origin+'/play/'+family+'/cost-directive/?telemetrySynthetic=1');
  await p.evaluate(()=>startSelectedMode('standard',{quizConfirmed:true}));
  if(await p.locator('#guideIntroProceed').isVisible())await p.locator('#guideIntroProceed').click();
  await p.waitForFunction(()=>Boolean(currentQuestion));
  await p.locator('#question').evaluate(node=>{const r=document.createRange();r.selectNodeContents(node);getSelection().removeAllRanges();getSelection().addRange(r);});await p.waitForTimeout(300);
  await p.evaluate(()=>document.dispatchEvent(new ClipboardEvent('copy')));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('blur'));});await p.waitForTimeout(250);
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'visible'});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));});
  await answer(p);await snapshot(p,family,'before-save');
  await p.evaluate(()=>{room=2;loadQuestion();saveGameState();});await flush(p);await snapshot(p,family,'before-reload');
  await p.reload();await snapshot(p,family,'after-reload');
  await p.evaluate(()=>continueSavedRun());await p.waitForTimeout(150);await answer(p);await snapshot(p,family,'after-continue-answer');
  if(assertFixed){
    const stages=snapshots.filter(s=>s.family===family),first=stages[0],last=stages.at(-1);
    for(const s of stages){assert.equal(s.remoteEnabled,true,s.stage);assert.equal(s.meta,'enabled');assert.equal(s.clientId,first.clientId);assert.equal(s.buildScope,first.buildScope);assert.equal(s.activeRun,first.activeRun);}
    const prior=first.received.findLast(e=>e.eventType==='answer_evaluated'),next=last.received.findLast(e=>e.eventType==='answer_evaluated');
    assert.equal(prior.copyCount,1);assert.equal(next.copyCount,0);assert.notEqual(next.eventId,prior.eventId);assert.equal(next.runId,prior.runId);
    assert.equal(trace.filter(t=>t.family===family&&t.parseFailure).length,0);
    checks.push({family,case:'enabled save-refresh-Continue: same scope/client/run, new answer, copy reset',status:'PASS'});
    // Exercise the actual student control and its persisted restriction/re-enable states.
    for(const enabled of [false,true]){
      await p.locator('#anonymousTelemetryDisclosure input[type="checkbox"]').evaluate(el=>el.click());
      assert.equal(await p.evaluate(()=>__MQRefreshDiagnostic.remoteEnabled()),enabled);
      await p.reload();assert.equal(await p.evaluate(()=>__MQRefreshDiagnostic.remoteEnabled()),enabled);
      checks.push({family,case:'browser preference persists: '+enabled,status:'PASS'});
    }
    await p.goto(origin+'/play/'+family+'/market-signal/?telemetrySynthetic=1');
    assert.notEqual(await p.evaluate(()=>__MQRefreshDiagnostic.buildScope),first.buildScope);
    assert.notEqual(await p.evaluate(()=>__MQRefreshDiagnostic.getClientId()),first.clientId);
    checks.push({family,case:'different build scope has distinct pseudonym/namespace',status:'PASS'});
    await p.goto(origin+'/play/'+family+'/cost-directive/?qaEnabled=0&telemetrySynthetic=1');
    assert.equal(await p.evaluate(()=>__MQRefreshDiagnostic.setRemoteCollection(true)),false);
    await p.reload();assert.equal(await p.evaluate(()=>__MQRefreshDiagnostic.remoteEnabled()),false);
    checks.push({family,case:'build OFF cannot be overridden by browser ON',status:'PASS'});
    for(const [field,unreadable] of [['collectionKey',false],['collectionKey',true],['activeRunKey',false],['activeRunKey',true],['queueKey',false]]){
      const c=await browser.newContext();await c.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
      const q=await c.newPage();await q.goto(origin+'/play/'+family+'/cost-directive/?telemetrySynthetic=1');
      const key=await q.evaluate(field=>__MQRefreshDiagnostic[field],field);
      if(unreadable)await c.addInitScript(key=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(String(k).endsWith(key))throw Error('synthetic unavailable storage');return get.call(this,k);};},key);
      else await q.evaluate(key=>localStorage.setItem(key,'malformed'),key);
      await q.reload();assert.equal(await q.evaluate(()=>__MQRefreshDiagnostic.remoteEnabled()),false,field);
      checks.push({family,case:(unreadable?'unreadable ':'malformed ')+field+' fails closed',status:'PASS'});await c.close();
    }
  }
  await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));harness.close();}
if(assertFixed)assert.deepEqual(harness.errors,[]);
fs.writeFileSync(path.join(out,'trace.json'),JSON.stringify({trace,snapshots,checks,workerErrors:harness.errors},null,2));
console.log(JSON.stringify({trace,snapshots:snapshots.map(({family,stage,remoteEnabled,receivedCount,meta})=>({family,stage,remoteEnabled,receivedCount,meta}))},null,2));
