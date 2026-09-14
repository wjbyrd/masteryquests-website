import './local-network-only.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {miniflareHarness,event,body,origin} from './capability-http-fixture.mjs';
const out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/portable_telemetry_stage2_http_followup';
fs.mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE);
const h=await miniflareHarness(),cap=await h.seed(),records=[],browserErrors=[],browserNetwork=[];
const digest=s=>createHash('sha256').update(s).digest('hex');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext();
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.origin===origin)return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Local body rejection fixture</title>'});
  if(u.hostname==='127.0.0.1')return route.continue();
  return route.abort();
 });
 await context.grantPermissions(['local-network-access'],{origin});
 const page=await context.newPage();page.on('pageerror',e=>browserErrors.push(e.message));
 page.on('response',r=>{if(new URL(r.url()).hostname==='127.0.0.1')browserNetwork.push({status:r.status(),headers:r.headers()});});
 page.on('requestfailed',r=>browserNetwork.push({failed:r.failure()?.errorText}));
 await page.goto(origin+'/local-fixture');
 // Seed accepted work so rejection snapshots prove preservation, not just empty tables.
 const accepted=await h.post([event()],cap);assert.equal(accepted.status,202);await accepted.json();
 for(const client of ['undici','undici-chunked','edge'])for(const bytes of [100,131072,131073,524288,2097152])for(const multibyte of [false,true])for(let trial=0;trial<3;trial++){
  const e=event({artifact:multibyte?'é':'x'}),json=body([e]);
  // Small trial is valid JSON; boundary trials pad valid JSON with ASCII whitespace.
  const payload=bytes===100?json:json+' '.repeat(bytes-Buffer.byteLength(json));
  const before=await h.snapshot(),row={client,requestedBytes:bytes,actualBytes:Buffer.byteLength(payload),multibyte,trial,status:null,readableBody:false};
  const headers={'content-type':'application/json','x-mq-ingest-token':cap.capability};
  try{
   if(client==='edge')Object.assign(row,await page.evaluate(async({url,headers,payload})=>{
    const r={status:null,readableBody:false};try{const response=await fetch(url,{method:'POST',headers,body:payload});r.status=response.status;r.headers=Object.fromEntries(response.headers);r.body=await response.text();r.readableBody=true;}catch(e){r.exception=e.message;}return r;
   },{url:new URL('/v1/events',h.baseURL).href,headers,payload}));
   else{const chunked=client==='undici-chunked',upload=chunked?new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(payload));c.close();}}):payload;const response=await fetch(new URL('/v1/events',h.baseURL),{method:'POST',headers:{...headers,origin},body:upload,...(chunked?{duplex:'half'}:{}),signal:AbortSignal.timeout(5000)});row.status=response.status;row.headers=Object.fromEntries(response.headers);row.body=await response.text();row.readableBody=true;}
  }catch(e){row.exception=e.message;row.cause=e.cause?.code;}
  if(bytes>131072){const after=await h.snapshot();assert.equal(after,before);row.noWrites=true;row.beforeHash=digest(before);row.afterHash=digest(after);assert(row.status===413||row.status===null);}
  else{assert.equal(row.status,202,JSON.stringify(row));assert(row.readableBody);}
  records.push(row);
 }
 // Deliberately inconsistent framing is a transport failure, never accepted work.
 for(const declared of ['1','131074']){
  const before=await h.snapshot(),row={client:'undici',malformedContentLength:declared,actualBytes:131073,status:null};
  try{const response=await fetch(new URL('/v1/events',h.baseURL),{method:'POST',headers:{origin,'content-type':'application/json','x-mq-ingest-token':cap.capability,'content-length':declared},body:'x'.repeat(131073),signal:AbortSignal.timeout(5000)});row.status=response.status;assert.notEqual(row.status,202);try{row.body=await response.text();}catch(e){row.exception=e.message;row.cause=e.cause?.code;}}
  catch(e){row.exception=e.message;row.cause=e.cause?.code;}
  const after=await h.snapshot();assert.equal(after,before);row.noWrites=true;row.beforeHash=digest(before);row.afterHash=digest(after);records.push(row);
 }
 const health=await h.post([event()],cap);assert.equal(health.status,202);await health.json();
 assert.equal(browserErrors.length,0);
 const result={localOnly:true,browser:browser.version(),firstPartyOrigin:origin,browserOriginSimulation:'HTTPS document fulfilled in memory; local-network-access permission granted only to that origin; API calls use actual loopback HTTP with normal browser CORS; all other network blocked',records,browserErrors,browserNetwork,runtimeLogs:h.logs,healthAfterMalformed:'PASS',snapshotTables:['telemetry_events','telemetry_runs','telemetry_ingest_batches','telemetry_rate_limits','telemetry_build_policies','telemetry_build_capabilities','telemetry_scope_windows']};
 const text=JSON.stringify(result,null,2);assert(!h.secrets.some(s=>text.includes(s)));fs.writeFileSync(path.join(out,'body-runtime-results.json'),text+'\n');
 console.log(JSON.stringify({trials:records.length,noWriteProofs:records.filter(r=>r.noWrites).length,edgeOversized:records.filter(r=>r.client==='edge'&&r.noWrites).map(r=>({status:r.status,readable:r.readableBody,error:r.exception})),browserErrors},null,2));
}finally{await browser.close();await h.close();}
