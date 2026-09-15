import './local-network-only.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {serializedHttpsOrigin} from '../../server/anonymous-telemetry-poc/dual-mode-ingest.mjs';
import {sqliteHarness,miniflareHarness,event,body,legacyTuple,graceInventory} from './capability-http-fixture.mjs';
const runtime=process.argv.includes('--runtime'),external='https://faculty.github.io';
const out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/portable_telemetry_stage4/cors';
fs.mkdirSync(out,{recursive:true});
const results=[];
async function test(name,fn,env={}) {
  const h=await(runtime?miniflareHarness:sqliteHarness)(env);
  try {await fn(h);results.push({name,status:'PASS'});}
  catch(e){let detail=String(e.stack);for(const secret of h.secrets)detail=detail.replaceAll(secret,'[REDACTED]');results.push({name,status:'FAIL',detail});}
  finally{await h.close();}
  console.log(name+': '+results.at(-1).status);
}
const accepted=['https://faculty.github.io','https://user.github.io','https://example.edu','https://sub.example.edu','https://example.org:8443','https://[::1]'];
const rejected=['http://faculty.github.io','file:///tmp/game.html','null','data:text/html,hi','blob:null/test','ftp://example.org','https://user:pass@example.org','https://example.org/path','https://example.org/','https://example.org?x=1','https://example.org/#frag','https://example.org,https://evil.example',' https://example.org','https://example.org ','https://example.org\nX-Evil: yes','https://[broken','https://%FF.example','https://example.org:443','https://EXAMPLE.org'];
await test('Serialized HTTPS origin syntax rejects non-origin and smuggled values',async()=>{for(const value of accepted)assert.equal(serializedHttpsOrigin(value),value);for(const value of rejected)assert.equal(serializedHttpsOrigin(value),null,value);});
function preflight(h,origin=external,method='POST',headers='content-type,x-telemetry-phase,x-mq-ingest-token',route='/v1/events'){return h.call(route,{method:'OPTIONS',headers:{origin,'access-control-request-method':method,'access-control-request-headers':headers}});}
function readable(r,origin=external){assert.equal(r.headers.get('access-control-allow-origin'),origin);assert.match(r.headers.get('vary'),/Origin/);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('access-control-allow-credentials'),null);}
await test('All valid HTTPS origins receive narrowly scoped preflight',async h=>{for(const origin of accepted){const r=await preflight(h,origin);assert.equal(r.status,204);readable(r,origin);assert.equal(r.headers.get('access-control-allow-methods'),'POST,OPTIONS');assert.equal(r.headers.get('access-control-allow-headers'),'content-type,x-telemetry-phase,x-mq-ingest-token');assert.equal(r.headers.get('vary'),'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');}});
await test('Unsupported preflight method and headers reject',async h=>{for(const method of ['GET','DELETE','PUT'])assert.equal((await preflight(h,external,method)).status,403);for(const header of ['authorization','x-telemetry-maintenance','x-mq-ingest-capability','x-admin-token'])assert.equal((await preflight(h,external,'POST',header)).status,403);});
await test('Invalid browser origins and duplicate Origin fields reject',async h=>{for(const origin of rejected.filter(x=>x===x.trim()&&!/[\r\n]/.test(x))){const r=await preflight(h,origin);assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);}const headers=new Headers([['origin',external],['origin','https://evil.example'],['access-control-request-method','POST']]);assert.equal((await h.call('/v1/events',{method:'OPTIONS',headers})).status,403);});
await test('Valid token works from unrelated HTTPS hosts and without Origin',async h=>{const c=await h.seed();for(const origin of accepted){const r=await h.post([event()],c,{headers:{origin}});assert.equal(r.status,202);readable(r,origin);}const r=await h.call('/v1/events',{method:'POST',headers:{'content-type':'application/json','x-mq-ingest-token':c.capability},body:body([event()])});assert.equal(r.status,202);assert.equal(r.headers.get('access-control-allow-origin'),null);});
for(const state of ['missing','malformed','random','expired','revoked','blocked','wrong game','wrong build','wrong version','wrong schema','old only','both headers','authorization'])await test('External capability authorization: '+state,async h=>{
  const c=await h.seed();let cap=c,e=event(),headers={origin:external};
  if(state==='missing')cap=null;
  if(state==='malformed'){cap=null;headers['x-mq-ingest-token']='bad';}
  if(state==='random'){cap=null;headers['x-mq-ingest-token']='mqic1_'+'Z'.repeat(43);}
  if(state==='expired')await h.db.prepare('UPDATE telemetry_build_capabilities SET issued_at=unixepoch()-2,expires_at=unixepoch()-1').run();
  if(state==='revoked')await h.db.prepare('UPDATE telemetry_build_capabilities SET revoked_at=issued_at').run();
  if(state==='blocked')await h.db.prepare('UPDATE telemetry_build_policies SET blocked_at=created_at').run();
  if(state==='wrong game')e.gameId='cost-directive';
  if(state==='wrong build')e.buildId='composer-'+'c'.repeat(64);
  if(state==='wrong version')e.buildVersion='c'.repeat(64);
  if(state==='wrong schema')e.schemaVersion=2;
  if(state==='old only'||state==='both headers'){headers['x-mq-ingest-capability']=c.capability;if(state==='old only')cap=null;}
  if(state==='authorization'){headers.authorization='Bearer '+c.capability;cap=null;}
  const before=await h.snapshot(),r=await h.post([e],cap,{headers});assert.equal(r.status,403);assert.equal(await h.snapshot(),before);
  if(cap||'x-mq-ingest-token'in headers)readable(r);else assert.equal(r.headers.get('access-control-allow-origin'),null);
});
await test('Invalid Origin rejects even valid capability without writes',async h=>{const c=await h.seed();for(const origin of ['null','http://example.org','https://example.org/path']){const before=await h.snapshot(),r=await h.post([event()],c,{headers:{origin}});assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);assert.equal(await h.snapshot(),before);}});
await test('Legacy grace stays exact first-party and invalid token never falls back',async h=>{assert.equal((await h.post([event(legacyTuple)])).status,202);for(const patch of [legacyTuple,{}]){const r=await h.post([event(patch)],null,{headers:{origin:external}});assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);}assert.equal((await h.post([event(legacyTuple)],null,{headers:{'x-mq-ingest-token':'invalid'}})).status,403);},{CAPABILITY_LEGACY_GRACE_ENABLED:'true',CAPABILITY_LEGACY_INVENTORY:JSON.stringify(graceInventory())});
await test('Activation, admin, maintenance and health do not gain external CORS',async h=>{for(const route of ['/v1/build-capabilities','/v1/admin/summary','/v1/admin/export.csv','/v1/admin/cleanup','/v1/admin/retention','/v1/admin/reconstruct','/v1/admin/capabilities','/v1/health','/cleanup','/retention'])for(const method of ['OPTIONS','GET','POST']){const r=await h.call(route,{method,headers:{origin:external,'content-type':'application/json','access-control-request-method':'POST'},...(method==='POST'?{body:'{}'}:{})});assert.equal(r.headers.get('access-control-allow-origin'),null,route);if(method==='OPTIONS')assert.notEqual(r.status,204);}const r=await preflight(h,'https://masteryquests.org','POST','content-type','/v1/build-capabilities');assert.equal(r.status,204);assert.equal(r.headers.get('access-control-allow-headers'),'content-type');},{CAPABILITY_ISSUANCE_ENABLED:'true'});
await test('Controlled 400 409 413 415 503 errors remain readable and sanitized',async h=>{const c=await h.seed(),e=event(),cases=[];cases.push([await h.post([e],c,{headers:{origin:external},body:'{bad'}),400]);await h.post([e],c,{headers:{origin:external}});cases.push([await h.post([{...e,score:1}],c,{headers:{origin:external}}),409]);cases.push([await h.post([e],c,{headers:{origin:external},body:runtime?body(Array.from({length:51},()=>event())):'x'.repeat(131073)}),413]);cases.push([await h.post([e],c,{headers:{origin:external,'content-type':'text/plain'}}),415]);h.throwPrepare=c.capability;cases.push([await h.post([e],c,{headers:{origin:external}}),503]);for(const [r,status]of cases){assert.equal(r.status,status);readable(r);const text=await r.text();for(const secret of h.secrets)assert(!text.includes(secret));}});
await test('Expected quota 429 exposes Retry-After through external CORS',async h=>{const c=await h.seed();assert.equal((await h.post([event()],c,{headers:{origin:external}})).status,202);const r=await h.post([event()],c,{headers:{origin:external}});assert.equal(r.status,429);readable(r);assert.equal(r.headers.get('retry-after'),'60');assert.equal(r.headers.get('access-control-expose-headers'),'Retry-After');},{MQ_CAP_CAP_ACCEPTED_EVENTS:'1'});
await test('Disabled capability ingest retains original external-origin rejection',async h=>{assert.equal((await preflight(h)).status,403);const r=await h.post([event()],null,{headers:{origin:external}});assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);},{CAPABILITY_INGEST_ENABLED:'false'});
const report={runtime:runtime?'workerd':'sqlite',passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length,results,productionCalls:0};
fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
