import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {api,name,account,root,out,save,state,query} from './control.mjs';
import {approvedEnvironment} from '../../../server/anonymous-telemetry-poc/governance-policy.mjs';
if(fs.existsSync(path.join(out,'resources.json')))throw Error('Existing staging state: inspect before creating anything');
const existing=await api('/workers/scripts/'+name);if(!existing.notFound)throw Error('Staging Worker name already exists; will not replace it');
const db=await api('/d1/database','POST',{name});
if(!db.uuid)throw Error('New D1 UUID missing');save({name,databaseName:name,databaseId:db.uuid,account,createdAt:new Date().toISOString(),syntheticOnly:true,workerDeployed:false,migrations:[],cleanupDecision:'Delete this new Worker and this new D1 after evidence capture'});
const migrations=path.join(root,'server/anonymous-telemetry-poc/migrations');
for(const file of fs.readdirSync(migrations).filter(x=>x.endsWith('.sql')).sort()){
 const sql=fs.readFileSync(path.join(migrations,file),'utf8');await query(sql);
 const s=state();s.migrations.push({file,sha256:createHash('sha256').update(sql).digest('hex')});save(s);
}
const config={name,account_id:account,main:'worker.mjs',compatibility_date:'2026-08-07',workers_dev:true,routes:[],d1_databases:[{binding:'TELEMETRY_DB',database_name:name,database_id:db.uuid}],vars:{...approvedEnvironment(),ALLOWED_ORIGINS:'https://masteryquests.org',CAPABILITY_ISSUANCE_ENABLED:'false',CAPABILITY_INGEST_ENABLED:'true',CAPABILITY_LEGACY_GRACE_ENABLED:'false',MAX_EVENTS_PER_CLIENT_MINUTE:'300'},observability:{logs:{enabled:true,head_sampling_rate:1,invocation_logs:false,persist:true},traces:{enabled:false}},triggers:{crons:[]}};
fs.writeFileSync(path.join(import.meta.dirname,'wrangler.staging.json'),JSON.stringify(config,null,2)+'\n');
console.log(JSON.stringify({createdDatabase:name,databaseId:db.uuid,migrations:state().migrations.map(x=>x.file),productionTouched:false}));
