'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),core=require(path.join(dir,'composer-core.js'));
const library=f=>JSON.parse(fs.readFileSync(f,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const policy=f=>{const c={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(f,'utf8'),c);return JSON.parse(JSON.stringify(c.module.exports));};
const before=library(path.join(__dirname,'baseline/composer_library.js')),after=library(path.join(dir,'data/composer_library.js')),bp=policy(path.join(__dirname,'baseline/faculty-outcomes.js')),ap=policy(path.join(dir,'data/faculty-outcomes.js'));
const changes=[];
for(const[cid,c]of Object.entries(ap.concepts))for(const o of c.outcomes){
 const old=bp.concepts[cid].outcomes.find(x=>x.id===o.id);assert.deepEqual(old.skillIds,o.skillIds);
 if(JSON.stringify(old.coverage)===JSON.stringify(o.coverage))continue;
 const recipe={title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}};
 const b=core.compose(before,recipe).validation.modes,a=core.compose(after,recipe).validation.modes;
 assert.deepEqual(b.map(m=>[m.mode,m.ok]),a.map(m=>[m.mode,m.ok]),'No actual mode availability change '+o.id);
 assert.deepEqual(o.coverage.supportedModes,a.filter(m=>m.ok).map(m=>m.mode));
 changes.push({concept:cid,outcome:o.id,label:o.label,cachedBefore:old.coverage,cachedAfter:o.coverage,actualBefore:b,actualAfter:a,actualModeAvailabilityUnchanged:true});
}
fs.writeFileSync(path.join(__dirname,'coverage-validation.json'),JSON.stringify({status:'PASS',changes},null,2)+'\n');
console.log('PASS: skill membership and actual scoped mode availability preserved; three coverage records refreshed.');
