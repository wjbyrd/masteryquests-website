// Assemble nonsecret rehearsal evidence; no network or deployment operations.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir='validation_artifacts/portable_telemetry_stage5_rehearsal/';
const read=name=>JSON.parse(fs.readFileSync(dir+name+'.json','utf8'));
const baseline=read('baseline'), regressions=read('regressions/summary');
assert.equal(regressions.length,45);assert(regressions.every(r=>r.status==='PASS'&&r.passed===r.expected));
const protectedHashes=Object.fromEntries(Object.entries(baseline.hashes).map(([file,hash])=>{
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);
  return [file,true];
}));
execFileSync('git',['diff','--check']);
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changed,['validation_artifacts/portable_telemetry_stage3_staging/resources.json']);
const productionFinal=read('production-final-readonly');
assert(productionFinal.productionVersionsUnchanged&&productionFinal.aggregateCountsUnchanged&&!productionFinal.migration0003Applied);
const dryRuns={status:'PASS',wrangler:'4.72.0',evidenceBasis:'Observed successful exit code 0 from each local Wrangler dry run during rehearsal',productionDeployment:false,configs:['server/anonymous-telemetry-poc/wrangler.jsonc','wrangler.jsonc','.wrangler/stage5-release/pause.json']};
fs.writeFileSync(dir+'dry-runs.json',JSON.stringify(dryRuns,null,2)+'\n');
const inputs=JSON.parse(fs.readFileSync('.wrangler/stage5-release/release-inputs.json','utf8'));
const result={
  schema:'mq-stage5-rehearsal/1',generatedAt:new Date().toISOString(),rehearsal:'COMPLETE',productionDecision:'NO-GO',
  blockers:['Reproduced below-quota minute-boundary 429; client currently treats 429 as terminal. Fix and regress before production activation.','Dedicated production Turnstile widget, public sitekey and secure secret installation remain owner provisioning steps.','Owner must approve exact rollout/sunset, verify account tier and accept bounded pilot quotas.'],
  repository:{branch:baseline.branch,head:baseline.head,initialWorkingTree:baseline.workingTree,originMain:baseline.head,aheadOfOrigin:false,pushPerformed:false},
  production:{baseline:read('production-baseline'),finalReadOnly:productionFinal,source:read('deployed-source-summary'),publicComposer:read('public-composer-baseline'),writes:0,deployed:false,secretValuesRead:false},
  regressions:{suiteRunnerEntries:45,status:'PASS',results:regressions},
  migration:read('migration-rehearsal'),
  migrationPolicy:{remoteApplied:false,pauseRequired:true,routineRollback:'Leave additive unused schema; no destructive down-migration',postCapabilityRollback:'Capability-enforcing Worker or deny-ingest pause only'},
  flags:{initial:{ingest:false,issuance:false,grace:false},sequence:['bounded intake pause','migration 0003','new Worker all flags false','legacy compatibility proof','ingest true / issuance false / exact grace true','dedicated production provider provisioning','issuance true','configured public Composer publication','owner smoke and monitoring'],offMeans:'Legacy compatibility, not denial of all ingestion'},
  legacy:{inventory:inputs.inventory.map(({sunset_at,...entry})=>({...entry,sunsetPolicy:'owner-approved rollout UTC + 90 days'})),liveArtifact:read('legacy-live-artifact'),sunsetDays:90,exactInstantApproved:false,exampleGeneratedInstantIsNotApproval:true,communications:'Notify operators before activation and 30/7 days before sunset',exclusions:['collection-disabled Private Managerial','arbitrary Composer builds','public polished games','National Engine']},
  turnstile:{recommendation:'Dedicated production Managed widget',hostname:'masteryquests.org',action:'mq_build_activate',secretInstallation:'Owner interactive Wrangler secure prompt in subsequent authorized task',created:false,stagingReused:false},
  dist:read('dist'),distScan:read('dist-scan'),dryRuns,
  cors:read('planned-cors'),
  quotas:{proposed:inputs.pilotLimits,ownerApproved:false,perClientEventsMinuteUnchanged:300,pilot:'At most one approximately 30-person class-equivalent before review'},
  capacity:{accountTierVerified:false,conservativeAssumption:'Free pending owner verification',physicalBytesPerEventEstimate:[2048,4096],eventsPerIllustrativeRun:200,classSizeScenario:30,sessionsPerYearScenario:100,annualGiBApprox:[1.2,2.4],warningPhysicalMiB:100,pausePhysicalMiB:250,physicalThresholdAutomatic:false,logicalBudgetWarningFractionConsumed:0.5,retentionDays:730},
  quotaDiagnostic:read('window-diagnostic'),
  monitoring:{initialMinutes:[5,15,30,60],cadence:'Each pilot session and daily initially; weekly only after stable evidence',signals:['issuance','Turnstile failures','authorization/scope rejection','429','503','D1 errors','accepted events','duplicates','quota headroom','D1 size','retention','revocations','credential redaction'],rawCredentialsAllowed:false},
  killSwitches:{issuance:'issuance-off config; preserve ingest',ingest:'deny-ingest pause entry; NEVER ingest=false after activation',compromise:'Scoped capability revoke or build block',website:'Independent website rollback; preserve D1 authorization state',proof:read('pause-check')},
  recovery:{timeTravel:read('time-travel'),restorePerformed:false,warning:'Restore may lose events and resurrect revoked capabilities or rewind blocks/quotas; separate incident authorization and reconciliation required'},
  smoke:{ownerOperated:true,students:false,steps:['OFF downloads without activation','ON real Turnstile 201 and ZIP','first-party 202','unchanged GitHub Pages 204/202','D1 receipt/run matching','opt-out','exact duplicate without inflation','revocation 403 and local gameplay/CSV','tail redaction and closure','revoke designated smoke capabilities']},
  humanHolds:{executionOrder:[1,2,3,5,4,6],required:true,details:'PRODUCTION_RUNBOOK_portable_telemetry.md'},
  runbook:'PRODUCTION_RUNBOOK_portable_telemetry.md',report:'FINAL_REPORT_portable_telemetry_stage5_rehearsal.md',
  staging:{rehearsal:read('staging-rehearsal'),cleanliness:read('staging-cleanliness'),retainUntil:'Production smoke acceptance',newEvents:0,newCapabilities:0,syntheticFlagCaveat:'All retained 98 events have synthetic=0 despite owner/harness test provenance; no students and no relabeling/deletion'},
  documentation:{publishNow:false,targets:['Privacy','Responsible Telemetry Use','Composer guide','faculty Build guide','Telemetry Data Dictionary control-plane note','CAPABILITY_OPERATOR.md'],draftInReport:true,contractVersionBump:false,nationalEngine:'Separate legacy identifying-transport exception; outside this rollout'},
  integrity:{protectedHashes,trackedChanges:changed,diffCheck:'PASS',canonicalApplicationChanged:false,productionConfigChanged:false,telemetrySemanticsChanged:false,productionDeployment:'NOT DEPLOYED'}
};
fs.writeFileSync(dir+'rehearsal.json',JSON.stringify(result,null,2)+'\n');
const report='FINAL_REPORT_portable_telemetry_stage5_rehearsal.md';
fs.writeFileSync(report,fs.readFileSync(report,'utf8').replace('50% remaining logical-budget consumption','50% of the logical byte budget consumed'));
console.log(JSON.stringify({rehearsal:result.rehearsal,decision:result.productionDecision,suites:45,protectedFiles:Object.keys(protectedHashes).length,productionWrites:0}));
