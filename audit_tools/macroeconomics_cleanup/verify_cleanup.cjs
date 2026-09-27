'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),work=path.join(root,'tmp/macroeconomics_cleanup');
const core=require('../../build/faculty-build-composer/composer-core.js'),h=require('../../build/faculty-build-composer/tests/composer-test-helpers.js');
const contracts=require('../../build/faculty-build-composer/tests/composer-integrity-contracts.js'),approved=require('../../build/faculty-build-composer/tests/macroeconomics-approved-revisions.js');
const b=JSON.parse(fs.readFileSync(path.join(__dirname,'inputs/baseline.json'),'utf8')),lib=h.loadComposerLibrary(),baseline=approved.macroBaselineLibrary;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
approved.assertCurrentLibrary(lib);const integrity=contracts.assertCanonicalIntegrity(lib);
const rows=contracts.questionRecords(lib),byId=new Map(rows.map(r=>[String(r.question.id),r.question]));
let hashes=0;
for(const[id,q]of byId){assert.equal(q.options.filter(o=>sha(core.normalizeAnswerText(o))===q.aHash).length,1,'Unique production-normalized key '+id);hashes++;}
for(const r of rows)assert.deepEqual(r.question,byId.get(String(r.question.id)),'Canonical alias parity '+r.question.id);
const graphChecks=[];
for(const[p,hash]of Object.entries(b.fileHashes))if(p.includes('/question-assets/')||p.includes('/audits/')){assert.equal(sha(fs.readFileSync(path.join(root,p))),hash,'Frozen input '+p);graphChecks.push(p);}
const repairId='ECON-NL-INVENTORY-INVESTMENT-5011',importsId='ECON-NL-IMPORTS-EXPORTS-NX-6004';
const references=[];
for(const[cid,m]of Object.entries(lib.concepts))for(const key of ['microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools'])for(const[skill,refs]of Object.entries(m[key]||{}))for(const ref of refs){const id=String(typeof ref==='string'?ref:ref.id);if([repairId,importsId].includes(id))references.push({id,concept:cid,pool:key,skill});}
assert.deepEqual(references.filter(r=>r.id===repairId),[{id:repairId,concept:'budget-accounting-and-public-saving',pool:'microSkillRepairPools',skill:'distinguish_purchase_transfer'}]);
assert(references.some(r=>r.id===importsId&&r.skill==='imports_exports_nx'),'Imports bridge route');
assert(references.filter(r=>r.id===importsId).every(r=>r.concept==='gdp-components'&&r.skill==='imports_exports_nx'),'No stale imports bridge route');
const area=require('../../build/faculty-build-composer/course-area-model.js').create(lib.registry.concepts);
const selections=area.conceptsForArea('macro').map(c=>({id:c.canonicalConceptId,conceptIds:[c.canonicalConceptId],kind:'concept'}));
const composer=fs.readFileSync(path.join(root,'build/faculty-build-composer/composer.js'),'utf8');
const presets=vm.runInNewContext('('+composer.match(/const PRESETS = (\[[\s\S]*?\n\]);/)[1]+')');
selections.push(...presets.filter(p=>p.conceptIds.some(cid=>area.areasFor(cid).includes('macro'))).map(p=>({...p,kind:'preset'})));
const inventory=[];
for(const s of selections){
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Inventory',slug:'inventory',selectedConceptIds:s.conceptIds,supportedModes:[...core.MODE_ORDER],checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
 const old=core.compose(baseline,recipe),now=core.compose(lib,recipe);
 const counts=c=>Object.fromEntries(['easy','medium','hard','elite','legendary','easyBoss','mediumBoss','finalBoss','legendaryBoss'].map(p=>[p,c.banks[p].length]));
 const newlyUnavailable=now.validation.modes.filter(m=>!m.ok&&old.validation.modes.find(x=>x.mode===m.mode)?.ok).map(m=>m.mode);
 inventory.push({id:s.id,kind:s.kind,conceptIds:s.conceptIds,before:counts(old),after:counts(now),beforeErrors:old.errors,afterErrors:now.errors,newlyUnavailable});
}
fs.writeFileSync(path.join(work,'mode_inventory.json'),JSON.stringify(inventory,null,2));
const result={integrity,allAnswerHashesVerified:hashes,protectedRecords:b.protectedQuestionIDs.length,protectedFiles:graphChecks.length,changedIDs:approved.macroIds.size,ordinaryStorageMoves:approved.macroLedger.moves.length,exactRoutes:references,modeSelectionsChecked:inventory.length,newModeShortages:inventory.filter(r=>r.newlyUnavailable.length).map(r=>({id:r.id,kind:r.kind,modes:r.newlyUnavailable,counts:r.after,errors:r.afterErrors})),sourceSha256:sha(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library.js')))};
fs.writeFileSync(path.join(work,'implementation_verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
