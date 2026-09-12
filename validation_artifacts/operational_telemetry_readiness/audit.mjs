import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {NORMALIZED_FIELDS,QA_EXTRA_FIELDS,BEHAVIOR_FIELDS} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
import {CONTRACT_FIELDS} from '../../server/anonymous-telemetry-poc/measurement-contract.mjs';
const out='validation_artifacts/operational_telemetry_readiness';
assert.equal(execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim().replaceAll('\\','/').toLowerCase(),'c:/users/jennings/documents/github/masteryquests-website');
const client=fs.readFileSync('play/managerial-directorate-telemetry-poc/telemetry-client.js','utf8');
const fn=client.slice(client.indexOf('  function remoteEnabled()'),client.indexOf('  function setRemoteCollection'));
const cases=[['missing',undefined,null,true],['invalid','invalid',null,true],['enabled','enabled',null,true],['disabled','disabled',null,false],['browser opt-out','enabled','1',false],['invalid stored value','enabled','bad',true]];
const truth=cases.map(([name,meta,saved,expected])=>{const c=vm.createContext({memoryRemoteDisabled:false,COLLECTION_KEY:'key',document:{querySelector:()=>meta===undefined?null:{content:meta}},localStorage:{getItem:()=>saved}});const actual=vm.runInContext(fn+'remoteEnabled()',c);assert.equal(actual,expected);return {name,actual};});
const files=execFileSync('git',['ls-files','play','games','build/faculty-build-composer'],{encoding:'utf8'}).trim().split('\n').filter(p=>/\.(html|js|json)$/.test(p));
const transportMatches=files.filter(p=>/anonymous-telemetry|telemetry-client\.js/.test(fs.readFileSync(p,'utf8')));
const report={task:'OPERATIONAL_TELEMETRY_PRODUCTION_READINESS_V1',truth,transportMatches,centralFields:[...NORMALIZED_FIELDS,...QA_EXTRA_FIELDS,...BEHAVIOR_FIELDS,...CONTRACT_FIELDS,'selectionReason','weaknessEstimate','sourceEvent'],health:{timestamp:'2026-09-12T20:27:37Z',status:200,body:{ok:true,phase:'phaseAnonymousTelemetryPOC-v1',storage:true},limitation:'Public health does not identify version, actual D1 identity, migrations, secrets or cron.'}};
fs.writeFileSync(out+'/audit-results.json',JSON.stringify(report,null,2)+'\n');
const schema=JSON.parse(fs.readFileSync('audit_tools/telemetry_contract/schema.json','utf8'));
const escape=s=>String(s||'').replaceAll('|','/').replaceAll('\n',' ');
let md='# Field inventory at audited HEAD\n\nAuthoritative sources: telemetry-core.mjs, measurement-contract.mjs, worker.mjs, migrations/0001_initial.sql and audit_tools/telemetry_contract/schema.json. This inventory does not change those contracts.\n\n## Central event fields\n\nEvery row is browser-generated, temporarily persisted in the private outbound queue, transmitted in events[], retained in D1, and available through admin reads/CSV (extras are also retained in extras_json). Camel-case base fields map to snake-case SQL columns; extras retain camel case. Fields describe operational activity; not every field is populated for every event. “Required” below means technical/operational necessity, not a new collection policy. No field intentionally contains a direct student identifier. Arbitrary accepted strings are not semantic proof of anonymity. All event fields share whole-run server-receipt retention.\n\n| Field | Source / operational purpose | Required operationally | Linkage / identity | Retention |\n|---|---|---|---|---|\n';
for(const name of report.centralFields){
 const snake=name.replace(/[A-Z]/g,c=>'_'+c.toLowerCase());
 const d=schema.fields.find(f=>f.name===name)||schema.fields.find(f=>f.name===snake);
 const identity=name==='anonymousClientId'?'HIGH PRIORITY: persistent browser/build-family pseudonym; links runs and potentially courses':/^(runId|sourceRunId|eventId|presentationID|attemptID|originAttemptID)$/.test(name)?'Run/event/attempt linkage; sourceRunId can join a named submitted local file':/Timestamp/.test(name)?'Precise time can aid external linkage':'No direct identity; context can aid linkage in small groups';
 const needed=['eventId','runId','anonymousClientId','schemaVersion','phase','buildId','gameId','eventType','sequenceNumber','eventTimestamp','contractID'].includes(name)?'Required by present transport/validator; client ID supports rate limit and browser grouping':'Conditional measurement/provenance/context; not essential to basic ingestion';
 md+=`| ${name} | ${escape(d?.definition||({selectionReason:'Engine reason for selecting a question/adaptive route',weaknessEstimate:'Up to five engine aggregate rows: key, attempts, accuracy',sourceEvent:'Original engine event label'}[name])||'Producer measurement/context; see frozen dictionary and client mapping')} | ${needed} | ${identity} | Whole run, 730 days after latest stored receipt |\n`;
}
md+='\n## Local CSV columns, including fields that do not leave the browser\n\nThese exact ordered sets describe current maintained local streams and retained legacy streams. Local export preserves historical labels and unknown historical columns; arbitrary legacy columns are therefore not a closed finite list. New current rows use the frozen lists. Local-only does not mean anonymous after a student deliberately submits a file.\n';
for(const s of schema.schemas.filter(s=>!s.id.includes('anonymous'))){md+='\n### '+s.id+' ('+s.columns.length+' columns)\n\n'+s.columns.map(c=>'`'+c+'`').join(', ')+'.\n';}
md+='\n## Exact current admin CSV columns\n\n'+schema.schemas.find(s=>s.id==='anonymous-contract1').columns.map(c=>'`'+c+'`').join(', ')+'.\n\nselectionReason, weaknessEstimate and sourceEvent are available inside extras_json rather than separate columns. responseTimeMs duplicates the SQL response_time_ms field; acceptedAttempt is reconstructed for legacy rows where possible. All base SQL event columns, including server received_at, are exported.\n';
md+='\n## Per-field dictionary for local/export streams\n\n| Field | Definition | Type / units | Applicability |\n|---|---|---|---|\n';
for(const f of schema.fields)md+=`| ${f.name} | ${escape(f.definition)} | ${escape(f.type)} / ${escape(f.units)} | ${escape((f.applicability||[]).join(', '))} |\n`;
fs.writeFileSync(out+'/FIELD_INVENTORY.md',md);
console.log(JSON.stringify({truth,scannedFiles:files.length,transportMatches:transportMatches.length,centralFields:report.centralFields.length}));
