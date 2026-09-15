// Strictly read-only metadata/aggregate verification; never reads provider secrets.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {readAPI,productionQuery,workers,database} from './stage5-readonly.mjs';
const previous=JSON.parse(fs.readFileSync('validation_artifacts/portable_telemetry_stage5_rehearsal/production-final-readonly.json'));
const resources=[];
for(const name of workers){
 const deployments=await readAPI('/workers/scripts/'+name+'/deployments');
 const version=deployments.deployments[0].versions[0].version_id;
 const settings=await readAPI('/workers/scripts/'+name+'/settings');
 const matchesRehearsal=version===previous.versions[name];
 const vars=settings.bindings.filter(b=>b.type==='plain_text'&&['CAPABILITY_INGEST_ENABLED','CAPABILITY_ISSUANCE_ENABLED','CAPABILITY_LEGACY_GRACE_ENABLED','ALLOWED_ORIGINS'].includes(b.name)).map(b=>({name:b.name,value:b.text}));
 assert(vars.filter(v=>v.name.startsWith('CAPABILITY_')).every(v=>v.value==='false'));
 const secretNames=settings.bindings.filter(b=>b.type==='secret_text').map(b=>b.name);
 assert(!secretNames.includes('TURNSTILE_SECRET_KEY'));
 resources.push({name,version,matchesRehearsal,vars,secretNames});
}
const migrations=await productionQuery('SELECT name FROM d1_migrations ORDER BY id');assert.equal(migrations.length,2);
const counts={};for(const table of ['telemetry_runs','telemetry_events','telemetry_ingest_batches','telemetry_rate_limits'])counts[table]=(await productionQuery('SELECT COUNT(*) AS n FROM '+table))[0].n;
const result={checkedAt:new Date().toISOString(),resources,database,migrations,counts,matchesRehearsal:resources.every(r=>r.matchesRehearsal),migration0003Applied:false,productionWrites:0,productionDeployments:0,turnstileModified:false};
fs.writeFileSync('validation_artifacts/portable_telemetry_quota_boundary_fix/production-readonly.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({resources:resources.map(({name,version,matchesRehearsal})=>({name,version,matchesRehearsal})),migration0003Applied:false,productionWrites:0}));
