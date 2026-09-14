import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {api,query,state,save,name,out,safeDatabase} from './control.mjs';
const s=state();safeDatabase(s.databaseId);assert.equal(s.name,name);assert(s.syntheticOnly);
if(s.tailId&&!s.tailClosed){await api(`/workers/scripts/${name}/tails/${s.tailId}`,'DELETE');save({...state(),tailClosed:true});}
const counts=(await query('SELECT (SELECT COUNT(*) FROM telemetry_events) events,(SELECT COUNT(*) FROM telemetry_runs) runs,(SELECT COUNT(*) FROM telemetry_ingest_batches) receipts'))[0].results[0];
fs.writeFileSync(path.join(out,'final-row-counts.json'),JSON.stringify(counts,null,2)+'\n');
await api('/workers/scripts/'+name,'DELETE');assert((await api('/workers/scripts/'+name)).notFound);save({...state(),workerDeleted:true,workerDeletedAt:new Date().toISOString()});
await api('/d1/database/'+s.databaseId,'DELETE');assert((await api('/d1/database/'+s.databaseId)).notFound);save({...state(),databaseDeleted:true,databaseDeletedAt:new Date().toISOString(),cleanupVerified:true});
const config=path.join(import.meta.dirname,'wrangler.staging.json');if(fs.existsSync(config)){fs.copyFileSync(config,path.join(out,'wrangler.deployed.json'));fs.unlinkSync(config);}
console.log(JSON.stringify({workerDeleted:name,databaseDeleted:s.databaseId,verifiedNotFound:true,productionTouched:false}));
