import './local-network-only.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {sqliteHarness,miniflareHarness,event,legacyTuple,graceInventory,origin} from './capability-http-fixture.mjs';
const runtime=process.argv.includes('--runtime'),h=await(runtime?miniflareHarness:sqliteHarness)({CAPABILITY_LEGACY_GRACE_ENABLED:'true',CAPABILITY_LEGACY_INVENTORY:JSON.stringify(graceInventory())});
const results=[],out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/portable_telemetry_stage2_redaction';
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){let detail=e.stack;for(const secret of h.secrets)detail=detail.replaceAll(secret,'[REDACTED]');results.push({name,status:'FAIL',detail});}}
async function reject(events,cap,options={}){const before=await h.snapshot(),r=await h.post(events,cap,options);assert(r.status>=400);await r.text();assert.equal(await h.snapshot(),before);}
try{
 const cap=await h.seed();
 await test('New token header authenticates exact tuple',async()=>{const r=await h.post([event()],cap);assert.equal(r.status,202);assert.equal((await r.json()).accepted,1);});
 await test('Old header alone never authorizes capability or legacy grace',async()=>{for(const e of [event(),event(legacyTuple)])for(const value of ['',cap.capability])await reject([e],null,{headers:{'x-mq-ingest-capability':value}});});
 await test('Both headers reject even when new token is valid',async()=>{for(const value of ['',cap.capability])await reject([event()],cap,{headers:{'x-mq-ingest-capability':value}});});
 await test('Malformed new token never falls back to valid legacy tuple',async()=>{for(const value of ['', 'malformed',cap.capability+','+cap.capability])await reject([event(legacyTuple)],null,{headers:{'x-mq-ingest-token':value}});});
 await test('Authorization cookie and alternate header cannot replace token header',async()=>{for(const headers of [{authorization:'Bearer '+cap.capability},{cookie:'ingest='+cap.capability},{'x-alternate-ingest-token':cap.capability}])await reject([event()],null,{headers});});
 await test('Body and operator ID cannot replace token header',async()=>{await reject([event()],null,{body:JSON.stringify({events:[event()],token:cap.capability})});await reject([event()],null,{headers:{'x-mq-ingest-token':cap.capabilityId}});});
 await test('Query authority rejects before writes',async()=>{const before=await h.snapshot();const r=await h.call('/v1/events?token='+cap.capability,{method:'POST',headers:{origin,'content-type':'application/json'},body:'{}'});assert.equal(r.status,400);await r.text();assert.equal(await h.snapshot(),before);});
 await test('Preflight advertises only new header and rejects old header',async()=>{for(const requested of ['x-mq-ingest-token','x-mq-ingest-capability','x-mq-ingest-token,x-mq-ingest-capability']){const r=await h.call('/v1/events',{method:'OPTIONS',headers:{origin,'access-control-request-method':'POST','access-control-request-headers':requested}});assert.equal(r.status,requested==='x-mq-ingest-token'?204:403);assert.equal(r.headers.get('access-control-allow-headers'),'content-type,x-telemetry-phase,x-mq-ingest-token');assert.equal(r.headers.get('access-control-allow-credentials'),null);}});
}finally{await h.close();}
const report={runtime:runtime?'miniflare':'sqlite',passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,results};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/header-'+report.runtime+'-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.failed)process.exitCode=1;
