// Local evidence/integrity checks only. No provider, production or staging calls.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const out='validation_artifacts/portable_telemetry_quota_boundary_fix/',read=n=>JSON.parse(fs.readFileSync(out+n+'.json','utf8'));
const regressions=read('regressions/summary'),boundary=read('boundary'),client=read('client');
assert.equal(regressions.length,45);assert(regressions.every(r=>r.status==='PASS'&&r.passed===r.expected&&r.exitCode===0));
assert.equal(boundary.passed,34);assert.equal(boundary.total,34);assert.equal(client.passed,22);assert.equal(client.total,22);
const protectedPaths=[...Object.keys(JSON.parse(fs.readFileSync('validation_artifacts/portable_telemetry_stage5_rehearsal/baseline.json')).hashes),'wrangler.jsonc','server/anonymous-telemetry-poc/worker.mjs','server/anonymous-telemetry-poc/turnstile-verifier.mjs','server/anonymous-telemetry-poc/migrations/0003_build_ingest_capabilities.sql','play/managerial-intelligence-directorate/local-telemetry.js'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const protectedHashes={};
for(const file of protectedPaths){const prior=execFileSync('git',['show','HEAD:'+file]),current=fs.readFileSync(file);assert.equal(sha(current),sha(prior),'Protected source drift: '+file);protectedHashes[file]=sha(current);}
execFileSync('git',['diff','--check']);
for(const script of ['audit_tools/telemetry_contract/generate.mjs','audit_tools/managerial_telemetry_parity/sync-composer-behavior.mjs','audit_tools/telemetry_governance/composer-activation-source.mjs','audit_tools/telemetry_governance/composer-transport.mjs'])execFileSync(process.execPath,[script,'--check'],{stdio:'pipe'});
const production=read('production-readonly'),first=read('production-first-observation');assert.deepEqual(production.resources,first.resources);assert.equal(production.migration0003Applied,false);
const staging=read('staging');assert.equal(staging.active,0);assert.equal(staging.tailCount,0);
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
let evidenceScanned=0,distScanned=0;
for(const dir of [out,'dist'])for(const file of walk(dir)){
 if(!/\.(?:json|md|mjs|js|html|log|csv|txt)$/i.test(file))continue;
 const text=fs.readFileSync(file,'utf8');
 assert(!/mqic1_[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/.test(text),'Raw capability-shaped value in '+file);
 assert(!/Bearer\s+[A-Za-z0-9_-]{30,}/.test(text),'Bearer credential-shaped value in '+file);
 if(dir==='dist'){assert(!/stage3\.masteryquests\.org|masteryquests-telemetry-stage3-staging|0x4AAAAAAE0fGN3DW-5u-dBd/.test(text),'Staging configuration in '+file);distScanned++;}else evidenceScanned++;
}
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const result={schema:'mq-quota-boundary-fix/1',generatedAt:new Date().toISOString(),repository:path.resolve('.'),branch:'main',startingHEAD:'e8f5ac78588dce28049d3170124bc0d7fb61d09d',initialStatus:'clean',committed:false,pushed:false,
 original:read('before'),engineeringBlocker:'CLEARED',productionDecision:'NO-GO',productionDeployment:'NOT DEPLOYED',
 rootCause:'Preliminary quota predicates combined counter ceilings and freshness; stale database minute N versus SQL minute N+1 escaped transaction retry as false 429.',
 clockModel:{authority:'D1 unixepoch()',classification:'One SELECT reads predicate and current database seconds; compare to classified minute',clientTimeTrusted:false,freshnessGuardsRetained:true,attemptsMaximum:3,staleExhaustion:{status:503,error:'ingest_unavailable'},legacyFlagsOffClock:'Worker Date.now() unchanged',issuanceHourDayPathChanged:false},
 quotas:{ceilingsChanged:false,atomicAccounting:true,duplicateInflation:false,ownershipChecksPreserved:true,perClientPreserved:true,lifetimeFailure:{status:403,error:'ingest_budget_exhausted'},shortWindowFailure:{status:429,error:'ingest_rate_limited',retryAfter:'max(1,60-(databaseSeconds % 60))'},lifetimePrecedesMinute:true},
 clientContract:{authority:'Accepted design response table; explicitly reconciles historical Stage 2/3 behavior',recognizedRetryCode:'ingest_rate_limited',maxRetries:3,horizonMs:300000,jitterMs:[0,1000],backoffMs:[1000,2000,4000],minimumDelayMs:1000,invalidHeaderFallbackMs:60000,queueMaximum:2000,sameEventIds:true,cooldownCannotBeBypassed:true,cancelOnOptOutOrExpiry:true,authorizationAndBudget403Terminal:true,unknown429Terminal:true,network503Bounded:true,exhaustion:'Cancel queued remote work; pause current page without permanent descriptor marker',gameplayAndLocalCSVPreserved:true},
 tests:{boundary,client,releaseCritical:regressions,finalServer:{capabilities:56,http:39,corsRuntime:24},deterministicClock:true,arbitrarySleeps:false},
 historicalStage3CauseProven:false,historicalConclusion:'Reproduced defect is a plausible mechanism consistent with the historical symptom; no retrospective proof.',
 staging,production:{...production,unchangedBetweenTaskObservations:true,websiteDiffersFromRehearsal:true,websiteProvenanceVerified:false},
 integrity:{protectedHashes,changedTrackedFiles:changed,measurementContract:'mq-measurement/1 unchanged',governance:'mq-governance/2 unchanged',disclosure:'mq-disclosure/2 unchanged',retentionDays:730,provenanceRegistryRegenerated:true,diffCheck:'PASS',generatorChecks:'PASS',evidenceFilesScanned:evidenceScanned,distTextFilesScanned:distScanned,credentialPatternMatches:0,stagingDistMatches:0},
 dist:read('dist'),runbook:'PRODUCTION_RUNBOOK_portable_telemetry.md',report:'FINAL_REPORT_portable_telemetry_quota_boundary_fix.md',
 remainingPrerequisites:['Dedicated production Turnstile widget/public key/secure owner-installed secret','Owner approval of pilot quotas, verified account tier and capacity','Exact approved rollout/legacy sunset','Review current website provenance and rollback target','Accepted candidate commit/evidence and explicit human GO at release holds']};
fs.writeFileSync(out+'fix.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({engineeringBlocker:result.engineeringBlocker,productionDecision:result.productionDecision,boundary:boundary.passed,client:client.passed,releaseEntries:regressions.length,productionWrites:0}));
