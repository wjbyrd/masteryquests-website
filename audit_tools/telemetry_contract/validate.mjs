import {createHash} from 'node:crypto';
import {POLICY as GOVERNANCE_POLICY} from '../../server/anonymous-telemetry-poc/governance-policy.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateManifest,CONTRACT_FIELDS,validateContractField} from '../../server/anonymous-telemetry-poc/measurement-contract.mjs';
export function parseCSV(text){
 const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';}else field+=c;}
 if(quoted)throw Error('Unclosed CSV quote');if(field||row.length){row.push(field);rows.push(row);}if(rows[0]?.[0])rows[0][0]=rows[0][0].replace(/^\uFEFF/,'');return rows;
}
export function validateCSV(text){
 const table=parseCSV(text),columns=table.shift()||[],issues=[],limitations=[],stats={rows:table.length,acceptedAttempts:0,manifestRows:0};
 const issue=(code,row,detail)=>issues.push({code,row,detail});
 const anonymous=columns.includes('event_id'),current=columns.includes('contractID');
 const inventory=JSON.parse(fs.readFileSync(new URL('./schema.json',import.meta.url),'utf8'));
 const recognized=inventory.schemas.find(s=>s.columns.length===columns.length&&s.columns.every((c,i)=>columns[i]===c));
 if(!recognized)issue('UNKNOWN_SCHEMA',0,'Header not a supported ordered schema; no assumptions about future meanings.');
 if(new Set(columns).size!==columns.length)issue('DUPLICATE_COLUMN',0,'Duplicate header');
 if(!recognized)return {status:'UNSUPPORTED_SCHEMA',schema:'unknown',rows:table.length,acceptedAttempts:null,manifestRows:null,versions:[],issues,limitations:['No measurements interpreted for an unrecognized schema.']};
 const records=table.map((r,i)=>{if(r.length!==columns.length)issue('COLUMN_COUNT',i+2,'CSV row has wrong field count');return Object.fromEntries(columns.map((c,j)=>[c,r[j]??'']));});
 if(records.some(r=>r.contractID&&r.contractID!=='mq-measurement/1'||r.schema_version&&!['1','2','3'].includes(r.schema_version)))return {status:'UNSUPPORTED_SCHEMA',schema:recognized.id,rows:records.length,acceptedAttempts:null,manifestRows:null,versions:[],issues:[{code:'UNKNOWN_CONTRACT',row:0,detail:'Future contract/envelope; interpretation stopped.'}],limitations:['No measurements interpreted for an unsupported contract.']};
 const manifests=new Map(),eventIds=new Set(),sequences=new Map(),commits=new Set(),presentations=new Set(),versions=new Set(),runs=new Map();
 for(const [i,r] of records.entries()){
  const event=anonymous?r.event_type:r.event,run=anonymous?r.run_id:r.runID,id=anonymous?r.event_id:r.eventID,row=i+2;
  const meta=anonymous&&r.extras_json?JSON.parse(r.extras_json):{};for(const k of CONTRACT_FIELDS)if(!r[k]&&meta[k]!=null)r[k]=typeof meta[k]==='object'?JSON.stringify(meta[k]):String(meta[k]);
  const contract=r.contractID,manifest=r.manifestID;
  if(contract&&contract!=='mq-measurement/1')issue('UNKNOWN_CONTRACT',row,contract);
  if(anonymous&&r.schema_version&&!['1','2','3'].includes(r.schema_version))issue('UNKNOWN_ENVELOPE',row,r.schema_version);
  if(event==='export_manifest'||event==='run_manifest'){
   stats.manifestRows++;
   try{const m=JSON.parse(r.manifestJSON);validateManifest(m,manifest);manifests.set(manifest,m);}catch(e){issue('MANIFEST_INVALID',row,e.message);}
  }else{
   if(id){if(eventIds.has(id))issue('DUPLICATE_EVENT_ID',row,id);eventIds.add(id);}else limitations.push('Some rows have no event identity.');
   if(contract&&!manifest)issue('MANIFEST_MISSING_REFERENCE',row,'Current row lacks manifestID');
   if(contract&&!anonymous&&r.telemetryVersion!=='mq-tracker-2026.09.10-contract1')issue('STALE_VERSION',row,r.telemetryVersion);
   const seq=anonymous?r.sequence_number:r.localSequence;
   if(seq){const stream=run+':'+(anonymous?'remote':'local');const list=sequences.get(stream)||[];list.push(Number(seq));sequences.set(stream,list);}
   const completed=event==='run_completed'||/(?:^|_)(?:complete|ended_by_student|bust)$/.test(event)||event==='timed_ended_early';
   runs.set(run,Boolean(runs.get(run)||completed));
  }
  if(!['export_manifest','run_manifest'].includes(event))versions.add(anonymous?'anonymous-envelope/'+r.schema_version:r.telemetryVersion||'unknown');
  const accepted=anonymous?event==='answer_evaluated'&&(['true','1'].includes(r.acceptedAttempt)||(!r.acceptedAttempt&&!['true','1'].includes(r.rapid_guess))):event==='question';
  if(accepted){stats.acceptedAttempts++;if(contract&&!r.attemptID)issue('ATTEMPT_MISSING',row,'Accepted outcome cannot be joined');if(r.attemptID){const key=run+':'+r.attemptID;if(commits.has(key))issue('DUPLICATE_COMMIT',row,key);commits.add(key);}if(contract&&r.canonicalSelectedIndex==='')issue('OPTION_MAPPING_MISSING',row,'Committed selection has unknown canonical identity');}
  if(['question_presented','question_shown'].includes(event)&&r.presentationID)presentations.add(run+':'+r.presentationID);
  const response=anonymous?['answer_evaluated','answer_submitted','exam_answer_initial','exam_answer_revision','question_interrupted'].includes(event):['question','rapid_guessing','exam_answer_initial','exam_answer_revision'].includes(event);
  const elapsed=r.responseTimeMs||r.response_time_ms;
  if(response&&contract){
   for(const key of ['responseTimeMs','activeResponseTimeMs','hiddenTimeMs'])if(r[key]===''||r[key]===undefined)issue('MISSING_MEASUREMENT',row,key);
   for(const [countKey,valueKeys] of [['tabSwitchCount',['timeAfterReturnMs','timeCopyToHideMs']],['focusLossCount',['timeAfterFocusMs','timeCopyToBlurMs']],['copyCount',['lastCopyElapsedMs','timeCopyToHideMs','timeCopyToBlurMs']]])if(Number(r[countKey])===0)for(const key of valueKeys)if(r[key]!==undefined&&r[key]!=='')issue('CONDITIONAL_FIELD',row,key+' without '+countKey);
  }
  if(response&&elapsed!==''){
   const total=Number(elapsed),active=r.activeResponseTimeMs,hidden=r.hiddenTimeMs;
   if(!Number.isFinite(total)||total<0)issue('IMPOSSIBLE_TIMING',row,'Invalid elapsed time');
   if(active!==''&&hidden!==''&&Math.abs(Number(active)+Number(hidden)-total)>2)issue('IMPOSSIBLE_TIMING',row,'Visible + hidden differs from elapsed');
   for(const key of ['unfocusedTimeMs','timeAfterReturnMs','timeAfterFocusMs','lastCopyElapsedMs','timeCopyToHideMs','timeCopyToBlurMs'])if(r[key]!==undefined&&r[key]!==''&&(Number(r[key])<0||Number(r[key])>total))issue('IMPOSSIBLE_TIMING',row,key);
  }
  if(r.deliveryQuality)try{const q=JSON.parse(r.deliveryQuality);for(const [k,v] of Object.entries(q))if(['overflow','permanentlyRejected','storageFailures','knownMissingPrefix','cancelled','remoteOverflow','remoteCancelled','remotePermanentlyRejected','remoteStorageFailures'].includes(k)&&v>0)issue('OBSERVED_DELIVERY_LIMIT',row,k+': '+v);}catch(e){issue('QUALITY_INVALID',row,e.message);}
  if(contract)for(const key of ['supportJSON','resourceID','originAttemptID'])if(r[key])try{validateContractField(key,r[key],{});}catch(e){issue('FORBIDDEN_OR_INVALID_METADATA',row,e.message);}
 }
 for(const [i,r] of records.entries()){if(r.contractID&&r.manifestID&&!manifests.has(r.manifestID))issue('MANIFEST_UNRESOLVED',i+2,r.manifestID);if(r.contractID&&r.presentationID&&!(anonymous?['export_manifest','run_manifest']:['export_manifest']).includes(r.event_type||r.event)&&!presentations.has((anonymous?r.run_id:r.runID)+':'+r.presentationID))limitations.push('A referenced presentation is not in this export (possibly truncated or resumed).');}
 for(const [stream,list] of sequences){list.sort((a,b)=>a-b);for(let i=1;i<list.length;i++)if(list[i]!==list[i-1]+1)issue(list[i]===list[i-1]?'DUPLICATE_SEQUENCE':'SEQUENCE_GAP',0,stream+': '+list[i-1]+' -> '+list[i]);if(list[0]>1)limitations.push(stream+': export begins after sequence 1.');}
 for(const [run,complete] of runs)if(!complete)limitations.push(run+': completion was not observed; intent is unknown.');
 if(anonymous&&stats.rows>=50000)limitations.push('Private admin export reaches its existing 50,000-row cap; completeness is uncertain.');
 if(versions.size>1)limitations.push('Mixed versions: interpret rows by their original contract.');
 if(!current||records.some(r=>!r.contractID&&(r.event||r.event_type)!=='export_manifest'))limitations.push('Legacy rows have incomplete provenance/attempt linkage. Missing measurements stay unknown; older 57/75 labels are ambiguous.');
 return {status:issues.length?'NEEDS_REVIEW':'PASS',schema:recognized?.id||'unknown',...stats,versions:[...versions],issues,limitations:[...new Set(limitations)]};
}

export function validateGovernanceExport(text,sidecar){
 if(!sidecar)return {status:'UNKNOWN',policyVersion:null,applicability:'No governance sidecar: policy at export/collection is unknown; do not infer one from a measurement version.',issues:[]};
 const issues=[];const bad=detail=>issues.push({code:'GOVERNANCE_METADATA',detail});
 if(sidecar.format!=='mq-export-governance/1'||sidecar.governancePolicyVersion!==GOVERNANCE_POLICY.version)bad('Unknown governance sidecar/policy version');
 if(sidecar.measurementContract!==GOVERNANCE_POLICY.measurementContract)bad('Policy/measurement contract mismatch');
 if(sidecar.exportSha256!==createHash('sha256').update(text).digest('hex'))bad('Sidecar belongs to different export bytes');
 const retention=sidecar.retention;
 if(!retention||!['manual','disabled'].includes(retention.mode)||retention.unit!=='whole-run'||retention.clock!=='latest-server-receipt'||!(retention.days===null||Number.isInteger(retention.days)&&retention.days>=GOVERNANCE_POLICY.minimumDays&&retention.days<=GOVERNANCE_POLICY.maximumDays))bad('Unsupported retention metadata');
 return {status:issues.length?'NEEDS_REVIEW':'PASS',policyVersion:sidecar.governancePolicyVersion,retention,exportedAt:sidecar.exportedAt,scope:sidecar.scope,applicability:'Current server policy at export only; historical event policy unknown. No retention is enforced on this local file.',issues};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const input=process.argv[2];if(!input){console.error('Usage: node audit_tools/telemetry_contract/validate.mjs export.csv [report.json] [export.csv.governance.json]');process.exitCode=2;}
 else{let report;try{const text=fs.readFileSync(input,'utf8');report=validateCSV(text);report.governance=validateGovernanceExport(text,process.argv[4]?JSON.parse(fs.readFileSync(process.argv[4],'utf8')):null);report.issues.push(...report.governance.issues);if(report.governance.issues.length)report.status='NEEDS_REVIEW';}catch(e){report={status:'NEEDS_REVIEW',issues:[{code:'MALFORMED_EXPORT',detail:e.message}]};}const output=JSON.stringify(report,null,2)+'\n';if(process.argv[3])fs.writeFileSync(process.argv[3],output);console.log(output);console.error(`${report.status}: ${report.rows??0} rows; ${report.acceptedAttempts===null?'uninterpreted':report.acceptedAttempts??0} accepted responses; ${report.issues.length} findings.`);if(report.issues.length)process.exitCode=1;}
}
