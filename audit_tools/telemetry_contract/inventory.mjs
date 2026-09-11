import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const schema=JSON.parse(fs.readFileSync(new URL('./schema.json',import.meta.url))),dict=JSON.parse(read('how-to/telemetry-data-dictionary/fields.json'));
const extract=p=>vm.runInNewContext(read(p).match(/const TELEMETRY_COLUMNS\s*=\s*(\[[\s\S]*?\]);/)[1]);
for(const family of ['managerial-intelligence-directorate','managerial-directorate-classroom','managerial-directorate-telemetry-poc'])for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
 const columns=extract('play/'+family+'/'+game+'/index.html'),source=read('play/'+family+'/'+(family==='managerial-intelligence-directorate'?'local-telemetry.js':'telemetry-client.js'));
 vm.runInNewContext('const BEHAVIOR_FIELDS='+source.match(/const BEHAVIOR_FIELDS\s*=\s*(\[[^;]+\]);/)[1]+';'+source.match(/function installLocalTelemetryColumns\(\)\{[\s\S]*?\n  \}/)[0]+';installLocalTelemetryColumns();',{globalValue:()=>columns});
 assert.deepEqual([...columns],schema.schemas.find(s=>s.id==='managerial-local-contract1').columns);assert.deepEqual([...columns].sort(),dict.fields.map(f=>f.name).sort());
}
assert.deepEqual([...extract('build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html')],schema.schemas.find(s=>s.id==='composer-local-contract1').columns);
const {CONTRACT_FIELDS}=await import('../../server/anonymous-telemetry-poc/measurement-contract.mjs');
const anonymous=vm.runInNewContext(read('server/anonymous-telemetry-poc/worker.mjs').match(/const columns = (\["event_id"[\s\S]*?\]);/)[1],{CONTRACT_FIELDS});assert.deepEqual([...anonymous],schema.schemas.find(s=>s.id==='anonymous-contract1').columns);
for(const name of new Set(schema.schemas.flatMap(s=>s.columns))){const field=schema.fields.find(f=>f.name===name);assert(field?.definition&&field.type&&field.units,'Undocumented field '+name);}
console.log(JSON.stringify({status:'PASS',schemas:schema.schemas.map(s=>({id:s.id,fields:s.columns.length})),documentedFields:schema.fields.length},null,2));
