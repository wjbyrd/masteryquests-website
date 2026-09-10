import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {fields}=JSON.parse(read('how-to/telemetry-data-dictionary/fields.json'));
const names=fields.map(f=>f.name);
assert.equal(new Set(names).size,names.length,'Duplicate dictionary fields');
export function compare(columns,entries){return {missing:columns.filter(n=>!entries.includes(n)),stale:entries.filter(n=>!columns.includes(n))};}
assert.deepEqual(compare(['a','new'],['a','old']),{missing:['new'],stale:['old']},'Drift detection self-test');
const results=[];
for(const build of ['managerial-directorate-classroom','managerial-directorate-telemetry-poc']){
 const adapter=read(`play/${build}/telemetry-client.js`);
 const behavior=adapter.match(/const BEHAVIOR_FIELDS\s*=\s*(\[[^;]+\]);/);assert(behavior,'Behavior schema source missing');
 const install=adapter.match(/function installLocalTelemetryColumns\(\)\{[\s\S]*?\n  \}/);assert(install,'Canonical installer changed: update extraction');
 for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
  const html=read(`play/${build}/${game}/index.html`);
  const base=html.match(/const TELEMETRY_COLUMNS\s*=\s*(\[[\s\S]*?\]);/);assert(base,'Local export schema missing');
  const columns=vm.runInNewContext(base[1]);
  vm.runInNewContext(`const BEHAVIOR_FIELDS=${behavior[1]};${install[0]};installLocalTelemetryColumns();`,{globalValue:()=>columns},{timeout:1000});
  const diff=compare([...columns],names);assert.deepEqual(diff,{missing:[],stale:[]},`${build}/${game}: ${JSON.stringify(diff)}`);
  results.push({build,game,columns:columns.length,...diff});
 }
}
const page=read('how-to/telemetry-data-dictionary/index.html');
assert.deepEqual([...page.matchAll(/data-field="([^"]+)"/g)].map(m=>m[1]),names,'Rendered dictionary differs from inventory');
for(const f of fields){for(const key of ['name','category','type','units','events','definition','possibleValues','blankMeaning','zeroMeaning','notes','caution'])assert(f[key],`${f.name}: missing ${key}`);for(const key of ['facultyNormallyNeeds','technical'])assert.equal(typeof f[key],'boolean');assert(page.includes(f.definition.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')),`${f.name}: stale rendered definition`);}
assert(!/ADMIN_TOKEN|\/admin\/|Bearer\s|api\/anonymous/.test(page),'Administrative instructions exposed');
console.log(JSON.stringify({status:'PASS',dictionaryFields:names.length,driftSelfTest:'PASS',results},null,2));

