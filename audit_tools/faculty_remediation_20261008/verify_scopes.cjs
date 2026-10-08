'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),core=require(path.join(dir,'composer-core.js')),h=require(path.join(dir,'tests/composer-test-helpers.js'));
const ledger=require('./expectations.json'),before=JSON.parse(fs.readFileSync(path.join(__dirname,'baseline/composer_library.js'),'utf8').slice(27).trim().slice(0,-1)),after=h.loadComposerLibrary(),policy=require(path.join(dir,'data/faculty-outcomes.js'));
const affected=new Set(ledger.changes.filter(c=>c.fields.includes('canonicalDifficulty')).map(c=>c.afterRecord.primaryConceptId)),checks=[],stale=[];
for(const [cid,p]of Object.entries(policy.concepts)){
 const m=after.concepts[cid];if(!affected.has(cid)&&!affected.has(m?.derivedFromConceptId))continue;
 for(const o of p.outcomes){
  const recipe={title:'Scope verification',slug:'scope-verification',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[o.id]}}},a=core.compose(after,recipe),b=core.compose(before,recipe);
  const modes=c=>c.validation.modes.filter(m=>m.ok).map(m=>m.mode);assert.deepEqual(modes(a),modes(b),cid+'/'+o.id+' actual mode availability');
  for(const bank of ['easyBoss','mediumBoss','finalBoss','legendaryBoss'])assert.deepEqual(a.banks[bank].map(core.idOf).sort(),b.banks[bank].map(core.idOf).sort(),cid+'/'+o.id+'/'+bank);
  assert.deepEqual(o.coverage.supportedModes,modes(a));
  const prior=ledger.facultyOutcomePolicyBefore.concepts[cid].outcomes.find(x=>x.id===o.id);
  if(JSON.stringify(prior.coverage.supportedModes)!==JSON.stringify(modes(b)))stale.push({concept:cid,outcome:o.id,previousCachedModes:prior.coverage.supportedModes,actualModesBeforeAndAfter:modes(a)});
  checks.push({concept:cid,outcome:o.id,actualModesPreserved:true,checkpointMembershipPreserved:true});
 }
}
const result={status:'PASS',checks,correctedPreexistingCachedAvailability:stale};fs.writeFileSync(path.join(__dirname,'scope-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:'PASS',outcomes:checks.length,stale}));
