import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),results=[];
const sources=[
 ['private POC',fs.readFileSync('play/managerial-directorate-telemetry-poc/telemetry-client.js','utf8')],
 ['private classroom',fs.readFileSync('play/managerial-directorate-classroom/telemetry-client.js','utf8')],
 ['generated Composer adapter',require('../../build/faculty-build-composer/anonymous-telemetry-source.js')]
];
for(const [name,source] of sources){
 const reader=source.match(/  function readActiveRunId\(key\) \{[\s\S]*?\n  }/)[0];
 for(const value of [null,'11111111-1111-4111-8111-111111111111','', ' ', 'malformed','"11111111-1111-4111-8111-111111111111"','{}','[]','null','11111111-1111-0111-8111-111111111111']){
   const valid=value===null||value==='11111111-1111-4111-8111-111111111111';
   const context=vm.createContext({localStorage:{getItem:key=>{assert.equal(key,'active-key');return value;}}});
   const result=vm.runInContext('let memoryRemoteDisabled=false;'+reader+';({value:readActiveRunId("active-key"),disabled:memoryRemoteDisabled})',context);
   assert.equal(result.value,valid&&value!==null?value:'');assert.equal(result.disabled,!valid);
 }
 const context=vm.createContext({localStorage:{getItem:()=>{throw Error('synthetic denied storage');}}});
 assert.equal(vm.runInContext('let memoryRemoteDisabled=false;'+reader+';readActiveRunId("active-key");memoryRemoteDisabled',context),true);
 assert(source.includes('activeRunId: readActiveRunId(ACTIVE_RUN_KEY)'));
 results.push({source:name,cases:11,status:'PASS'});
}
console.log(JSON.stringify({status:'PASS',cases:33,results},null,2));
