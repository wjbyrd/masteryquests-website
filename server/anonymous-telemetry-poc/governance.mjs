import {configuration,cutoffFor} from './governance-policy.mjs';
import {UUID_PATTERN} from './telemetry-core.mjs';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
export function requireMaintenance(request,env){const expected=env.MAINTENANCE_TOKEN;const supplied=request.headers.get('x-telemetry-maintenance')||'';if(!expected||expected===env.ADMIN_TOKEN||supplied!==expected)fail('maintenance authorization required',403);}
export async function govern(request,env,kind,now=Date.now(),source='manual'){
 const config=configuration(env);if(kind==='policy')return {ok:true,governance:config};
 const raw=await request.text();if(raw.length>2048)fail('administrative request too large',413);let body;try{body=JSON.parse(raw);}catch{fail('Invalid JSON');}
 if(!body||typeof body!=='object'||Array.isArray(body))fail('Expected administrative object');
 const allowed=kind==='retention'?['action','confirm','cutoff']:kind==='run'?['action','confirm','runId']:['action','confirm','scope','buildId'];
 if(Object.keys(body).some(k=>!allowed.includes(k)))fail('Unknown or inapplicable administrative field');
 const action=body.action??(kind==='cleanup'&&body.confirm==='DELETE'?'execute':'dry-run');if(!['dry-run','execute'].includes(action))fail('action must be dry-run or execute');
 const execute=action==='execute';let selection,bindings=[],cutoff=null,scope=kind;
 if(kind==='retention'){
  const latest=cutoffFor(config,now);cutoff=body.cutoff??latest;
  if(typeof cutoff!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(cutoff)||!Number.isFinite(Date.parse(cutoff))||new Date(cutoff).toISOString()!==cutoff||cutoff>latest)fail('Cutoff must be a valid UTC ISO instant no newer than the configured cutoff');
  if(execute&&(!body.cutoff||body.confirm!=='PURGE_EXPIRED_RUNS'))fail('Execute requires reviewed cutoff and confirm PURGE_EXPIRED_RUNS');
  // Server receipt, never the client clock. Invalid timestamps and any recent event protect the whole run.
  selection="julianday(r.last_received_at) < julianday(?) AND NOT EXISTS (SELECT 1 FROM telemetry_events e WHERE e.run_id=r.run_id AND (julianday(e.received_at) IS NULL OR julianday(e.received_at)>=julianday(?)))";bindings=[cutoff,cutoff];
 }else if(kind==='run'){
  if(typeof body.runId!=='string'||!UUID_PATTERN.test(body.runId))fail('runId must be a UUID');
  selection='r.run_id = ?';bindings=[body.runId.toLowerCase()];if(execute&&body.confirm!=='DELETE_RUN:'+body.runId.toLowerCase())fail('Execute requires confirm DELETE_RUN:<runId>');
 }else{
  scope=body.scope;
  if(scope==='synthetic')selection='r.synthetic=1 AND NOT EXISTS (SELECT 1 FROM telemetry_events e WHERE e.run_id=r.run_id AND e.synthetic<>1)';
  else if(scope==='build'&&typeof body.buildId==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(body.buildId)){selection='r.build_id=? AND NOT EXISTS (SELECT 1 FROM telemetry_events e WHERE e.run_id=r.run_id AND e.build_id<>?)';bindings=[body.buildId,body.buildId];}
  else fail('scope must be synthetic or a bounded build ID');
  if(execute&&body.confirm!=='DELETE')fail('Execute requires confirm DELETE');
 }
 const db=env.TELEMETRY_DB;if(!db)fail('telemetry storage unavailable',503);
 const selected=kind==='run'?'SELECT ?':'SELECT r.run_id FROM telemetry_runs r WHERE '+selection;
 const plan=[db.prepare('SELECT COUNT(*) AS count FROM telemetry_runs r WHERE '+selection).bind(...bindings),db.prepare('SELECT COUNT(*) AS count FROM telemetry_events WHERE run_id IN ('+selected+')').bind(...bindings)];
 // SELECT batch is a consistent dry-run snapshot. Execute eligibility is recalculated inside its atomic batch.
 let counts;
 if(!execute){const a=await db.batch(plan.map(s=>s));counts={runs:Number(a[0].results?.[0]?.count??0),events:Number(a[1].results?.[0]?.count??0)};}
 else{
  const statements=[db.prepare('DELETE FROM telemetry_events WHERE run_id IN ('+selected+')').bind(...bindings),db.prepare('DELETE FROM telemetry_runs AS r WHERE '+selection+' AND NOT EXISTS (SELECT 1 FROM telemetry_events e WHERE e.run_id=r.run_id)').bind(...bindings)];
  if(kind==='retention'){statements.push(db.prepare('DELETE FROM telemetry_ingest_batches WHERE julianday(received_at)<julianday(?)').bind(cutoff),db.prepare('DELETE FROM telemetry_rate_limits WHERE window_minute < ?').bind(Math.floor(Date.parse(cutoff)/60000)));}
  const result=await db.batch(statements);counts={events:Number(result[0].meta?.changes||0),runs:Number(result[1].meta?.changes||0),ingestBatches:Number(result[2]?.meta?.changes||0),rateLimitWindows:Number(result[3]?.meta?.changes||0)};
 }
 if(!execute&&kind==='retention'){counts.ingestBatches=Number((await db.prepare('SELECT COUNT(*) AS count FROM telemetry_ingest_batches WHERE julianday(received_at)<julianday(?)').bind(cutoff).first()).count);counts.rateLimitWindows=Number((await db.prepare('SELECT COUNT(*) AS count FROM telemetry_rate_limits WHERE window_minute < ?').bind(Math.floor(Date.parse(cutoff)/60000)).first()).count);}
 return {ok:true,operationId:crypto.randomUUID(),governancePolicyVersion:config.version,measurementContract:config.measurementContract,source,action,scope,cutoff,buildId:scope==='build'?body.buildId:undefined,runId:kind==='run'?body.runId.toLowerCase():undefined,counts,executedAt:new Date(now).toISOString(),unit:config.unit,retentionDays:config.days,notes:['Counts in execute are actual database changes; dry-run counts can change before execution.','No downloaded copies, provider logs or backups are deleted.','Late arrivals or retries after deletion can recreate a run; deletion is not a permanent collection block.','Run/build deletion leaves ingestion batch receipts because they do not identify individual runs.']};
}
