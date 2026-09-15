// Canonical transactional admission shared by capability and exact legacy-grace HTTP modes.
import {validateEnvelope, PHASE, MAX_BODY_BYTES} from './telemetry-core.mjs';
import {matchLegacyBuild,legacyGraceEnabled,legacyPermission} from './legacy-grace.mjs';
import {eventRateLimit} from './transport-safety.mjs';
import {stableContractJSON} from '../../audit_tools/telemetry_contract/hash.mjs';
import {requireFeature, reject, parseCapability, hashCapability, readBoundedJSON, validateTuple,
  matchesTuple, capabilityStatus, validateRuntimeManifest, assertNoCredentials, capabilityLimits,
  databaseTime, scopeWindow, buildScopeKey, windowPredicate, windowUpsert,
  safeDatabaseError, isAdmissionRace, CapabilityError} from './capabilities.mjs';

// Read quota result and database clock in the same statement. A stale snapshot
// must be reclassified, never interpreted as quota exhaustion. Transactional
// freshness guards remain in place and roll the entire batch back on a race.
async function checkAdmissionQuota(db, predicate, now, lifetime=false) {
  const row=await db.prepare(`SELECT (${predicate.sql}) AS allowed, unixepoch() AS now`).bind(...predicate.values).first();
  if(Math.floor(row.now/60)!==Math.floor(now/60))reject('ingest_window_changed',503);
  if(!row.allowed) {
    const error=new CapabilityError(lifetime?'ingest_budget_exhausted':'capability_rate_limited',lifetime?403:429);
    if(!lifetime)error.retryAfter=Math.max(1,60-(row.now%60));
    throw error;
  }
}

const columns = 'event_id,run_id,anonymous_client_id,build_id,build_version,schema_version,phase,game_id,mode,event_type,sequence_number,event_timestamp,elapsed_time_ms,position,question_id,concept_id,learning_objective,question_type,difficulty,selected_response,correct,response_time_ms,rapid_guess,remediation_stage,bridge_stage,retest_stage,boss_stage,graph_question,score,streak,daily_progress,artifact,completion_status,mastery_attempts,mastery_correct,mastery_accuracy,synthetic,extras_json'.split(',');
const fields = 'eventId,runId,anonymousClientId,buildId,buildVersion,schemaVersion,phase,gameId,mode,eventType,sequenceNumber,eventTimestamp,elapsedTimeMs,position,questionId,conceptId,learningObjective,questionType,difficulty,selectedResponse,correct,responseTimeMs,rapidGuess,remediationStage,bridgeStage,retestStage,bossStage,graphQuestion,score,streak,dailyProgress,artifact,completionStatus,masteryAttempts,masteryCorrect,masteryAccuracy,synthetic,extras'.split(',');
const ownerColumns = ['anonymous_client_id','game_id','build_id','build_version'];
const ownerFields = ['anonymousClientId','gameId','buildId','buildVersion'];
function storedValues(event) {
  return fields.map(k => k === 'extras' ? stableContractJSON(event.extras) :
    ['correct','rapidGuess','graphQuestion','synthetic'].includes(k) ? event[k] === null ? null : Number(event[k]) : event[k]);
}
function equivalent(row, event) {
  const values = storedValues(event);
  return columns.every((c,i) => {
    if (c !== 'extras_json') return row[c] === values[i];
    try { return stableContractJSON(JSON.parse(row[c])) === values[i]; } catch { return false; }
  });
}
function snapshot(row) {
  return {sql: `EXISTS(SELECT 1 FROM telemetry_events WHERE ${columns.map(c=>c+' IS ?').join(' AND ')})`, values: columns.map(c=>row[c])};
}
function ownerGuard(event) {
  const mismatch = ownerColumns.map(c=>c+' IS NOT ?').join(' OR ');
  return {sql: `NOT EXISTS(SELECT 1 FROM telemetry_runs WHERE run_id=? AND (${mismatch})) AND
    NOT EXISTS(SELECT 1 FROM telemetry_events WHERE run_id=? AND (${mismatch} OR schema_version<>3)) AND
    NOT EXISTS(SELECT 1 FROM telemetry_events e WHERE e.run_id=? AND NOT EXISTS(SELECT 1 FROM telemetry_runs r WHERE r.run_id=e.run_id)) AND
    NOT EXISTS(SELECT 1 FROM telemetry_runs r WHERE r.run_id=? AND r.event_count<>(SELECT COUNT(*) FROM telemetry_events e WHERE e.run_id=r.run_id))`,
    values: [event.runId,...ownerFields.map(k=>event[k]),event.runId,...ownerFields.map(k=>event[k]),event.runId,event.runId]};
}
function permission(cap) {
  return {sql: `EXISTS(SELECT 1 FROM telemetry_build_capabilities c JOIN telemetry_build_policies p
    ON p.game_id=c.game_id AND p.build_id=c.build_id WHERE c.capability_id=? AND c.capability_hash=?
    AND c.game_id=? AND c.build_id=? AND c.build_version=? AND c.schema_version=3
    AND c.revoked_at IS NULL AND p.blocked_at IS NULL AND c.issued_at<=unixepoch() AND c.expires_at>unixepoch())`,
    values: [cap.capability_id,cap.capability_hash,cap.game_id,cap.build_id,cap.build_version]};
}
async function allowed(db, p, code='ingest_conflict', status=409) {
  if (!(await db.prepare(`SELECT (${p.sql}) AS allowed`).bind(...p.values).first()).allowed) reject(code,status);
}
function guard(db, id, p) {
  return db.prepare(`UPDATE telemetry_ingest_batches SET admission_valid=CASE WHEN ${p.sql} THEN 1 ELSE 0 END WHERE batch_id=?`).bind(...p.values,id);
}
function runUpsert(db,e) {
  const completed = Number(e.eventType === 'run_completed');
  return db.prepare(`INSERT INTO telemetry_runs (run_id,anonymous_client_id,build_id,build_version,game_id,mode,
    first_event_at,last_event_at,event_count,max_sequence,completed,completion_status,synthetic)
    VALUES(?,?,?,?,?,?,?,?,1,?,?,?,?) ON CONFLICT(run_id) DO UPDATE SET
    last_event_at=MAX(last_event_at,excluded.last_event_at),last_received_at=CURRENT_TIMESTAMP,
    event_count=event_count+1,max_sequence=MAX(max_sequence,excluded.max_sequence),completed=MAX(completed,excluded.completed),
    completion_status=CASE WHEN excluded.completed=1 AND excluded.completion_status<>'' THEN excluded.completion_status ELSE completion_status END,
    synthetic=MIN(synthetic,excluded.synthetic)`)
    .bind(e.runId,e.anonymousClientId,e.buildId,e.buildVersion,e.gameId,e.mode,e.eventTimestamp,e.eventTimestamp,
      e.sequenceNumber,completed,completed?e.completionStatus:'',Number(e.synthetic));
}
function unresolved(e) {
  const x=e.extras;
  return ['mode_selected','run_started','run_resumed','run_paused','run_completed'].includes(e.eventType) &&
    x.manifestID===null && x.provenanceStatus==='unresolved' &&
    ['questionId','conceptId','learningObjective','questionType','difficulty'].every(k=>e[k]==='') &&
    e.selectedResponse===null && e.correct===null && e.responseTimeMs===0 &&
    ['presentationID','attemptID','originAttemptID','supportJSON','resourceID','manifestJSON','canonicalSelectedIndex'].every(k=>x[k]==null);
}
async function manifestGuards(db,events,tuple) {
  const guards=[];
  for (const e of events) {
    const x=e.extras;
    if (x.manifestID===null) { if (!unresolved(e)) reject('ingest_scope_mismatch',403); continue; }
    if (!/^[a-f0-9]{64}$/.test(x.manifestID||'')) reject('ingest_scope_mismatch',403);
    let source=events.find(m=>m.runId===e.runId && m.eventType==='run_manifest' && m.extras.manifestID===x.manifestID);
    let manifest;
    if(source) { try { manifest=JSON.parse(source.extras.manifestJSON); } catch { reject('ingest_scope_mismatch',403); } }
    else {
      const rows=await db.prepare(`SELECT * FROM telemetry_events WHERE run_id=? AND event_type='run_manifest'
        AND build_id=? AND game_id=? AND build_version=? AND schema_version=3
        AND CASE WHEN json_valid(extras_json) THEN json_extract(extras_json,'$.manifestID') END=?`)
        .bind(e.runId,e.buildId,e.gameId,e.buildVersion,x.manifestID).all();
      const row=rows.results[0]; if(!row) reject('manifest_required',403);
      try { manifest=JSON.parse(JSON.parse(row.extras_json).manifestJSON); } catch { reject('ingest_scope_mismatch',403); }
      guards.push(snapshot(row));
    }
    validateRuntimeManifest(manifest,x.manifestID,tuple);
    if(manifest.mode!==e.mode) reject('ingest_scope_mismatch',403);
  }
  return guards;
}

export function admitCapabilityRequest(request,env,options={}) {
  return admitRequest(request,env,options,false);
}
export function admitLegacyGraceRequest(request,env,options={}) {
  return admitRequest(request,env,options,true);
}
async function lookupCapability(db,hash) {
  const cap=await db.prepare(`SELECT c.*,p.blocked_at FROM telemetry_build_capabilities c JOIN telemetry_build_policies p
    ON p.game_id=c.game_id AND p.build_id=c.build_id WHERE c.capability_hash=?`).bind(hash).first();
  if(capabilityStatus(cap,cap,await databaseTime(db))!=='active')reject('ingest_not_authorized',403);
  return cap;
}
async function admitRequest(request,env,{afterRead,httpSemantics=false}={},grace) {
  requireFeature(env,'ingest');
  // Retired authority headers are never aliases and cannot select legacy grace.
  if(request.headers.has('x-mq-ingest-capability'))reject('ingest_not_authorized',403);
  if(new URL(request.url).search)reject('invalid_request');
  if(grace && (request.headers.has('x-mq-ingest-token')||!legacyGraceEnabled(env)))reject('ingest_not_authorized',403);
  if(request.method!=='POST')reject('invalid_request');
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json'||request.headers.has('content-encoding'))reject('unsupported_media_type',415);
  const raw=grace?null:parseCapability(request.headers.get('x-mq-ingest-token'));
  const hash=grace?null:await hashCapability(raw);
  const db=env.TELEMETRY_DB;if(!db)reject('capability_storage_unavailable',503);
  let initialCap;
  try { if(!grace)initialCap=await lookupCapability(db,hash); } catch(error){throw safeDatabaseError(error);}
  const input=await readBoundedJSON(request,MAX_BODY_BYTES);
  assertNoCredentials(input,[raw,hash,env.ADMIN_TOKEN,env.MAINTENANCE_TOKEN,request.headers.get('authorization')]);
  if(!input||Object.keys(input).some(k=>!['phase','events'].includes(k)))reject('invalid_batch');
  if(Array.isArray(input.events)&&input.events.length>50)reject('request_too_large',413);
  if(httpSemantics&&!grace&&Array.isArray(input.events))input.events.forEach(validateTuple);
  let events;
  try { events=validateEnvelope(input); } catch(error) {
    if(httpSemantics&&String(error.message).startsWith('Measurement contract:'))reject('ingest_scope_mismatch',403);
    reject('invalid_batch');
  }
  if(!grace)input.events.forEach(validateTuple);
  if(new Set(events.map(e=>e.anonymousClientId)).size!==1)reject('invalid_batch');
  const limits=capabilityLimits(env);
  try {
    for(let attempt=0;attempt<3;attempt++) {
      try {
      requireFeature(env,'ingest');
      const cap=grace?null:attempt===0?initialCap:await lookupCapability(db,hash);
      const now=await databaseTime(db);
      const legacy=grace?matchLegacyBuild(input.events,request.headers.get('origin'),env,now):null;
      if(!grace&&events.some(e=>!matchesTuple(e,cap)))reject('ingest_scope_mismatch',403);
      const authorize=()=>grace?legacyPermission(legacy):permission(cap);
      const predicates=[authorize()];await allowed(db,predicates[0],'ingest_not_authorized',403);
      for(const e of events) { const p=ownerGuard(e);await allowed(db,p);predicates.push(p); }
      const novel=[];
      for(const e of events) {
        const row=await db.prepare('SELECT * FROM telemetry_events WHERE event_id=?').bind(e.eventId).first();
        if(row) { if(!equivalent(row,e)) reject('ingest_conflict',409);predicates.push(snapshot(row)); }
        else {
          const p={sql:'NOT EXISTS(SELECT 1 FROM telemetry_events WHERE event_id=? OR (run_id=? AND sequence_number=?))',values:[e.eventId,e.runId,e.sequenceNumber]};
          await allowed(db,p);predicates.push(p);novel.push(e);
        }
      }
      predicates.push(...await manifestGuards(db,events,validateTuple(events[0])));
      const bytes=novel.reduce((n,e)=>n+new TextEncoder().encode(stableContractJSON(e)).length,0);
      const submittedBytes=events.reduce((n,e)=>n+new TextEncoder().encode(stableContractJSON(e)).length,0);
      const increments={requests:1,events:events.length,bytes:submittedBytes};
      const windows=[...(cap?[scopeWindow('ingest-capability',cap.capability_id,60,now,increments,{requests:limits.CAP_REQUESTS_MINUTE,events:limits.CAP_EVENTS_MINUTE})]:[]),
        scopeWindow('ingest-build',buildScopeKey(events[0]),60,now,increments,{events:limits.BUILD_EVENTS_MINUTE}),
        scopeWindow('ingest-global','global',60,now,increments,{requests:limits.GLOBAL_REQUESTS_MINUTE,events:limits.GLOBAL_EVENTS_MINUTE}),
        scopeWindow('ingest-global','global',0,now,{requests:1,events:novel.length,bytes},{bytes:limits.GLOBAL_ACCEPTED_BYTES})];
      // Lifetime exhaustion is terminal even when a minute limit is also full.
      for(const w of windows.filter(w=>!w.seconds))await checkAdmissionQuota(db,windowPredicate(w),now,true);
      predicates.push(...windows.map(windowPredicate));
      const budgets=[...(cap?[{sql:`EXISTS(SELECT 1 FROM telemetry_build_capabilities WHERE capability_id=? AND accepted_event_count+?<=? AND accepted_bytes+?<=?)`,values:[cap.capability_id,novel.length,limits.CAP_ACCEPTED_EVENTS,bytes,limits.CAP_ACCEPTED_BYTES]}]:[]),
        {sql:`COALESCE((SELECT accepted_event_count FROM telemetry_build_policies WHERE game_id=? AND build_id=?),0)+?<=? AND COALESCE((SELECT accepted_bytes FROM telemetry_build_policies WHERE game_id=? AND build_id=?),0)+?<=?`,values:[events[0].gameId,events[0].buildId,novel.length,limits.BUILD_ACCEPTED_EVENTS,events[0].gameId,events[0].buildId,bytes,limits.BUILD_ACCEPTED_BYTES]}];
      const minute=Math.floor(now/60),client=events[0].anonymousClientId;
      for(const p of budgets)await checkAdmissionQuota(db,p,now,true);
      for(const w of windows.filter(w=>w.seconds))await checkAdmissionQuota(db,windowPredicate(w),now);
      const clientQuota={sql:`COALESCE((SELECT event_count FROM telemetry_rate_limits WHERE anonymous_client_id=? AND window_minute=?),0)+?<=? AND CAST(unixepoch()/60 AS INTEGER)=?`,values:[client,minute,events.length,eventRateLimit(env.MAX_EVENTS_PER_CLIENT_MINUTE),minute]};
      await checkAdmissionQuota(db,clientQuota,now);
      budgets.push(clientQuota);
      predicates.push(...budgets);
      const id=crypto.randomUUID();
      const statements=[...(grace?[db.prepare('INSERT INTO telemetry_build_policies(game_id,build_id,created_at) VALUES(?,?,unixepoch()) ON CONFLICT(game_id,build_id) DO NOTHING').bind(events[0].gameId,events[0].buildId)]:[]),db.prepare(`INSERT INTO telemetry_ingest_batches
        (batch_id,anonymous_client_id,event_count,inserted_count,duplicate_count,synthetic,capability_id)
        VALUES(?,?,?,?,?,?,?)`).bind(id,client,events.length,novel.length,events.length-novel.length,Number(events.every(e=>e.synthetic)),cap?.capability_id??null),
        ...predicates.map(p=>guard(db,id,p))];
      for(const e of novel) statements.push(db.prepare(`INSERT INTO telemetry_events (${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).bind(...storedValues(e)),runUpsert(db,e));
      statements.push(...(cap?[db.prepare(`UPDATE telemetry_build_capabilities SET accepted_request_count=accepted_request_count+1,
        accepted_event_count=accepted_event_count+?,accepted_bytes=accepted_bytes+?,last_used_at=unixepoch() WHERE capability_id=?`).bind(novel.length,bytes,cap.capability_id)]:[]),
        db.prepare(`UPDATE telemetry_build_policies SET accepted_event_count=accepted_event_count+?,accepted_bytes=accepted_bytes+? WHERE game_id=? AND build_id=?`).bind(novel.length,bytes,events[0].gameId,events[0].buildId),
        ...windows.map(w=>windowUpsert(db,w)),
        db.prepare(`INSERT INTO telemetry_rate_limits(anonymous_client_id,window_minute,event_count) VALUES(?,?,?)
          ON CONFLICT(anonymous_client_id,window_minute) DO UPDATE SET event_count=event_count+excluded.event_count`).bind(client,minute,events.length),
        guard(db,id,authorize()));
      if(afterRead) await afterRead({attempt});
      if(grace)matchLegacyBuild(input.events,request.headers.get('origin'),env,await databaseTime(db));
      requireFeature(env,'ingest');
      try { await db.batch(statements);return {ok:true,phase:PHASE,batchId:id,accepted:novel.length,duplicates:events.length-novel.length,acknowledgedEventIds:events.map(e=>e.eventId)}; }
      catch(error) { if(!isAdmissionRace(error)) throw error;if(attempt===2) {
        if(Math.floor((await databaseTime(db))/60)!==minute)reject('ingest_window_changed',503);
        reject('ingest_conflict',409);
      } }
      } catch(error) {
        if(error?.code!=='ingest_window_changed')throw error;
        if(attempt===2)reject('ingest_window_unavailable',503);
      }
    }
  } catch(error) { throw safeDatabaseError(error); }
}
