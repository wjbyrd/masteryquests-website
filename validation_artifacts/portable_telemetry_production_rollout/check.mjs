// Local-only documentation/source reconciliation. No network or production calls.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {LEGACY_BUILDS} from '../../server/anonymous-telemetry-poc/legacy-builds.mjs';
import {CAPABILITY_LIFETIME_SECONDS} from '../../server/anonymous-telemetry-poc/capabilities.mjs';
const dir='validation_artifacts/portable_telemetry_production_rollout';
const read=p=>fs.readFileSync(p,'utf8');
const state=JSON.parse(read(dir+'/production.json'));
const runbook=read('PRODUCTION_RUNBOOK_portable_telemetry.md');
const operator=read('server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md');
const results=[];
function check(name,fn){fn();results.push({name,status:'PASS'});}
check('Legacy tuple, approved sunset and original generator input',()=>{
  assert.deepEqual({...LEGACY_BUILDS[0],sunset_at:state.legacyGrace.sunset_at},state.legacyGrace);
  assert.equal(new Date(Date.parse('2026-09-15T14:30:00.000Z')+90*86400000).toISOString(),state.legacyGrace.sunset_at);
  for(const value of Object.values(state.legacyGrace))assert(runbook.includes(String(value)));
});
check('Approved pilot limits match existing release generator',()=>{
  const source=read('audit_tools/telemetry_governance/stage5-release-config.mjs');
  const literal=source.match(/pilotLimits=(\{[^;]+\})/)[1];
  const limits=Object.fromEntries([...literal.matchAll(/([A-Z_]+):(\d+)/g)].map(m=>[m[1],Number(m[2])]));
  assert.deepEqual(state.pilotQuotas,limits);
});
check('D1 identity, lifetime, retention, public sitekey and base-config hazard',()=>{
  const config=JSON.parse(read('server/anonymous-telemetry-poc/wrangler.jsonc'));
  assert.equal(config.d1_databases[0].database_id,state.d1.uuid);
  assert.equal(CAPABILITY_LIFETIME_SECONDS,365*86400);
  assert.equal(config.vars.TELEMETRY_RETENTION_DAYS,'730');
  assert.equal(config.vars.MAX_EVENTS_PER_CLIENT_MINUTE,'300');
  assert.deepEqual(config.triggers.crons,[state.retention.cron]);
  assert(read('build/faculty-build-composer/index.html').includes(state.turnstile.publicSitekey));
  for(const flag of Object.keys(state.flags)){assert.equal(config.vars[flag],'false');assert.equal(state.flags[flag],true);}
  assert(runbook.includes('Do not deploy it directly to production'));
});
check('Current operator status, rollback anchors and kill-switch semantics',()=>{
  for(const text of [runbook,operator]){
    assert(!/BLOCKED \/ DO NOT EXECUTE YET|production remains OFF|Production configuration keeps issuance/i.test(text));
    assert(text.includes('CAPABILITY_INGEST_ENABLED=false'));
    assert(text.includes('restores legacy admission semantics'));
    assert(text.includes('issuance-off.json')&&text.includes('pause.json'));
  }
  for(const value of [state.telemetryWorker.version,state.telemetryWorker.issuanceOffAnchor,state.websiteWorker.version,state.websiteWorker.priorKnownGood,state.websiteWorker.preSitekeyFallback])assert(runbook.includes(value));
  const pause=read('audit_tools/telemetry_governance/stage5-pause-worker.mjs');
  assert(pause.includes('status:503')&&pause.includes('scheduled:base.scheduled')&&pause.includes('return base.fetch'));
});
check('Five public pages retain factual host, choice, lifetime and exception language',()=>{
  for(const p of ['privacy/index.html','how-to/responsible-telemetry-use/index.html','how-to/composer/index.html','build/index.html','how-to/telemetry-data-dictionary/index.html']){
    const s=read(p);
    for(const term of ['Telemetry-enabled generated games can submit from supported HTTPS hosts.','365-day','730-day','Browser opt-out','revocation','file://','LMS sandbox','no learner identity assurance','National Engine'])assert(s.includes(term),p+': '+term);
    assert(!/host anywhere/i.test(s));
    const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,p+': duplicate IDs');
  }
});
check('Operator SQL compiles and scoped mutations preserve accepted telemetry locally',()=>{
  const db=new DatabaseSync(':memory:');
  for(const name of state.d1.migrations)db.exec(read('server/anonymous-telemetry-poc/migrations/'+name));
  const id='00000000-0000-4000-8000-000000000001', build='composer-'+'a'.repeat(64);
  db.prepare('INSERT INTO telemetry_build_policies(game_id,build_id,created_at) VALUES(?,?,unixepoch()-1)').run('faculty-composer',build);
  db.prepare('INSERT INTO telemetry_build_capabilities(capability_id,capability_hash,game_id,build_id,build_version,schema_version,issued_at,expires_at,issuance_request_id,activation_digest) VALUES(?,?,?,?,?,3,unixepoch()-1,unixepoch()+1000,?,?)').run(id,'0'.repeat(64),'faculty-composer',build,'a'.repeat(64),'00000000-0000-4000-8000-000000000002','0'.repeat(64));
  db.exec("INSERT INTO telemetry_ingest_batches(batch_id,anonymous_client_id,event_count,inserted_count,duplicate_count) VALUES('local-doc-receipt','local-doc-client',1,1,0)");
  const sql=[...operator.matchAll(/--command "([^"]+)"/g)].map(m=>m[1].replaceAll('$CapabilityId',id).replaceAll('$BuildId',build));
  assert.equal(sql.length,7);
  for(const q of sql){const stmt=db.prepare(q);if(q.startsWith('SELECT'))stmt.all();else assert.equal(stmt.run().changes,1);}
  assert(db.prepare('SELECT revoked_at FROM telemetry_build_capabilities').get().revoked_at);
  assert(db.prepare('SELECT blocked_at FROM telemetry_build_policies').get().blocked_at);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM telemetry_ingest_batches').get().n,1);
  db.close();
});
for(const [name,args] of [
  ['Governance renderer consistency',['audit_tools/telemetry_governance/render.mjs','--check']],
  ['Dictionary renderer consistency',['audit_tools/telemetry_data_dictionary/render.mjs','--check']],
  ['Dictionary field/source consistency',['audit_tools/telemetry_data_dictionary/check.mjs']]
])check(name,()=>execFileSync(process.execPath,args,{stdio:'pipe'}));
check('git diff --check',()=>execFileSync('git',['-c','core.safecrlf=false','diff','--check'],{stdio:'pipe'}));
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split(/\r?\n/).filter(Boolean);
const additions=fs.readdirSync(dir).filter(n=>n!=='validation.json').map(n=>dir+'/'+n);
const filesChanged=[...new Set([...changed,'FINAL_REPORT_portable_telemetry_production_rollout.md',...additions,dir+'/validation.json'])].sort();
const allowed=new Set(['PRODUCTION_RUNBOOK_portable_telemetry.md','server/anonymous-telemetry-poc/CAPABILITY_OPERATOR.md','audit_tools/telemetry_governance/render.mjs','privacy/index.html','how-to/responsible-telemetry-use/index.html','how-to/composer/index.html','build/index.html','how-to/telemetry-data-dictionary/index.html']);
check('Tracked changes restricted to documentation and its renderer',()=>{for(const p of changed)assert(allowed.has(p),p);});
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8',maxBuffer:16*1024*1024}).split('\0').filter(Boolean);
const scanFiles=[...new Set([...tracked,...filesChanged])];let scanned=0;const matches=[],syntheticFixtures=[];
for(const p of scanFiles){if(!fs.existsSync(p))continue;const b=fs.readFileSync(p);if(b.includes(0))continue;scanned++;const s=b.toString('utf8');
  // Report file names only, never matched values. This scans complete token forms,
  // provider private keys and literal secret assignments, not generic identifier names.
  const rawCapability=/mqic1_[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/.test(s);
  const privateKey=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(s);
  const assignments=[...s.matchAll(/TURNSTILE_SECRET_KEY["']?\s*[:=]\s*["']([A-Za-z0-9_-]{20,})["']/g)];
  const realAssignments=assignments.filter(m=>{
    if(p==='audit_tools/telemetry_governance/stage3-issuance-check.mjs'&&m[1]==='fixture-provider-key'&&s.includes('fetchProvider:async')){
      assert.equal(s.replace(/\r\n/g,'\n'),execFileSync('git',['show','HEAD:'+p],{encoding:'utf8'}).replace(/\r\n/g,'\n'));
      syntheticFixtures.push({file:p,reason:'unchanged pre-existing injected-provider dummy value, not a production credential'});return false;
    }
    return true;
  });
  if(rawCapability||privateKey||realAssignments.length)matches.push(p);
}
check('Tracked and delivered text credential-pattern scan',()=>assert.deepEqual(matches,[]));
const result={status:'PASS',localOnly:true,productionRequests:0,results,filesChanged,credentialScan:{textFilesScanned:scanned,matchingFiles:matches,syntheticFixtures,scope:'all tracked text plus closeout delivery files; binary files excluded',limitations:'pattern scan cannot prove absence of every unknown secret format; no production secret value read or compared'},sqlValidation:'in-memory SQLite only; synthetic hash-only row, no token issuance or production D1',evidenceAttribution:'production acceptance is owner-attested; local checks do not independently verify remote state'};
fs.writeFileSync(dir+'/validation.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
