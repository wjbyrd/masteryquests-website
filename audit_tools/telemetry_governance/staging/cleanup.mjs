import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {api,query,state,save,name,out,safeDatabase} from './control.mjs';
const s=state();safeDatabase(s.databaseId);assert.equal(s.name,name);assert(s.syntheticOnly);
if(!fs.existsSync(path.join(out,'row-counts.json')))throw Error('Final staging evidence not captured; cleanup requires review');
const sql=`SELECT (SELECT COUNT(*) FROM telemetry_events) events,
 (SELECT COUNT(*) FROM telemetry_runs) runs,
 (SELECT COUNT(*) FROM telemetry_ingest_batches) receipts,
 (SELECT SUM(event_count) FROM telemetry_runs) run_events,
 (SELECT SUM(inserted_count) FROM telemetry_ingest_batches) receipt_events,
 (SELECT SUM(accepted_event_count) FROM telemetry_build_capabilities) capability_events,
 (SELECT SUM(accepted_event_count) FROM telemetry_build_policies) build_events,
 (SELECT COUNT(*) FROM telemetry_ingest_batches WHERE capability_id IS NULL) unattributed_receipts`;
const counts=(await query(sql))[0].results[0];for(const key of ['runs','receipts','run_events','receipt_events','capability_events','build_events'])assert.equal(counts[key],counts.events);assert.equal(counts.unattributed_receipts,0);
fs.writeFileSync(path.join(out,'accepted-state-verification.json'),JSON.stringify({status:'PASS',counts,syntheticOnly:true},null,2)+'\n');
await api('/workers/scripts/'+name,'DELETE');assert((await api('/workers/scripts/'+name)).notFound);save({...state(),workerDeleted:true,workerDeletedAt:new Date().toISOString()});
await api('/d1/database/'+s.databaseId,'DELETE');assert((await api('/d1/database/'+s.databaseId)).notFound);save({...state(),databaseDeleted:true,databaseDeletedAt:new Date().toISOString(),cleanupVerified:true});
const config=path.join(import.meta.dirname,'wrangler.staging.json');fs.copyFileSync(config,path.join(out,'wrangler.deployed.json'));fs.unlinkSync(config);
console.log(JSON.stringify({workerDeleted:name,databaseDeleted:s.databaseId,verifiedNotFound:true,productionTouched:false,acceptedState:counts}));
