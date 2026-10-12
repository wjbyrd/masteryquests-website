import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {games,readBank,readLibrary,bankRows,canonicalRows,uniqueCanonical,answerHash,contentFields,hash,normalize,normalizeGame} from './library.mjs';
import {fullConcepts,existingSkillOnlyConcepts,excludedExpansionText} from './scope.mjs';
import overrides from './overrides.mjs';
import {retained} from './retained.mjs';
const plan=JSON.parse(fs.readFileSync('audit_tools/economic_realm_questions/selection.json'));
const lib=readLibrary(),canonical=new Map(uniqueCanonical(canonicalRows(lib)).map(r=>[String(r.q.id),r]));
assert.equal(lib.librarySha256,plan.librarySha256);
const summary={baselineCommit:plan.baselineCommit,librarySha256:plan.librarySha256,games:{}};
const csv=[['game','local_id','source','composer_id','old_group','old_pool','new_group','new_pool','concept','changed_fields','rationale']];
const fingerprint=q=>normalize(q.q).replace(/[\d,.]+/g,'#');
for(const game of games){
 const before=readBank(game,plan.baselineCommit),after=readBank(game),oldRows=bankRows(before),rows=bankRows(after),selection=plan.games[game];
 assert.equal(selection.mapped.length,oldRows.length);
 assert.equal(rows.length,selection.mapped.length+selection.added.length);
 const concepts=new Set(selection.mapped.map(r=>r.concept));
 const stems=new Set(),used=new Set();let contentChanged=0,rerouted=0,retainedCount=0;
 const fieldsChanged={};
 for(const item of selection.mapped){
  const old=before[item.oldGroup][item.oldPool][item.index];assert.equal(old.id,item.id);
  const q=after[item.group][item.pool].find(q=>q.id===item.id);assert(q,`${game}: lost ${item.id}`);
  if(item.retained){assert(retained[game]?.[item.id]);assert.deepEqual(q,old,`${game}: retained supplement changed`);retainedCount++;}
  else{
   const record=canonical.get(String(item.canonicalId));assert(record);
   if(!overrides[game]?.[item.id])assert([record.q,...record.q.sourceOccurrences||[]].some(o=>normalizeGame(o.sourceGame)===game&&String(o.sourceId)===String(item.id)),`${game}/${item.id}: missing provenance`);
   for(const key of ['q','options','feedback','primarySkill','repairSkill','secondarySkills','objective'])assert.deepEqual(q[key],record.q[key],`${game}/${item.id}: canonical ${key} drift`);
   assert.equal(q.aHash,answerHash(record.q));
   used.add(String(item.canonicalId));
  }
  stems.add(fingerprint(q));
  const changed=contentFields.filter(k=>JSON.stringify(old[k])!==JSON.stringify(q[k]));
  csv.push([game,item.id,item.retained?'retained supplement':'Composer match',item.canonicalId||'',item.oldGroup,item.oldPool,item.group,item.pool,item.concept,changed.join('; '),item.reason]);
  changed.forEach(k=>fieldsChanged[k]=(fieldsChanged[k]||0)+1);
  if(changed.some(k=>['q','options','aHash','feedback','image'].includes(k)))contentChanged++;
  if(item.pool!==item.oldPool||item.group!==item.oldGroup)rerouted++;
 }
 for(const item of selection.added){
  const r=canonical.get(String(item.canonicalId)),q=after[item.group][item.pool].find(q=>q.id===item.id);assert(r&&q);
  assert(concepts.has(item.concept),`${game}: new topic ${item.concept}`);
  assert(fullConcepts[game].includes(item.concept)||existingSkillOnlyConcepts.includes(item.concept));
  if(!fullConcepts[game].includes(item.concept))assert(selection.mapped.some(m=>m.concept===item.concept&&[before[m.oldGroup][m.oldPool][m.index].primarySkill,m.retained?null:canonical.get(String(m.canonicalId)).q.primarySkill].includes(q.primarySkill)),`${game}: new introductory skill`);
  assert([...(r.q.requiredConceptIds||[]),...(r.q.secondaryConceptIds||[])].every(c=>concepts.has(c)),`${game}: new secondary topic`);
  assert(!excludedExpansionText.test(q.q+' '+q.options.join(' ')),`${game}: excluded expansion topic`);
  assert(!used.has(String(item.canonicalId)),`${game}: duplicate added canonical ID`);
  assert(!stems.has(fingerprint(q)),`${game}: duplicate added stem`);
  used.add(String(item.canonicalId));stems.add(fingerprint(q));
  for(const key of ['q','options','feedback','primarySkill','repairSkill','secondarySkills','objective'])assert.deepEqual(q[key],r.q[key]);
  assert.equal(q.aHash,answerHash(r.q));
  csv.push([game,item.id,'Composer addition',item.canonicalId,'','',item.group,item.pool,item.concept,'',item.reason]);
 }
 for(const {q} of rows){
  assert(!Object.hasOwn(q,'a'));assert.equal(new Set(q.options.map(normalize)).size,4);
  assert.equal(q.options.filter(o=>hash(normalize(o))===q.aHash).length,1);
  if(q.image)assert(fs.existsSync(`play/economic-realm/${game}/${q.image}`));
 }
 const quality=JSON.parse(fs.readFileSync(`validation_artifacts/economic_realm_questions/${game}-quality.json`));
 // This option-based identification stem is intentionally shared across two
 // already-existing micro/macro contexts, with distinct option sets and keys.
 const duplicateExceptions=new Set(['ECON-EC-EASYBOSS-17015','ECON-MG-EASY-34']);
 const unresolved=quality.findings.filter(f=>f.severity==='ERROR'&&!(game==='equilibrium-crisis'&&f.rule==='duplicate-stem'&&duplicateExceptions.has(f.questionId)));
 assert.deepEqual(unresolved,[],`${game}: unresolved content errors`);
 const byConcept=Object.fromEntries([...new Set(selection.added.map(r=>r.concept))].sort().map(c=>[c,selection.added.filter(r=>r.concept===c).length]));
 summary.games[game]={before:oldRows.length,after:rows.length,composerMatched:selection.mapped.length-retainedCount,contentChanged,retainedSupplements:retainedCount,added:selection.added.length,ordinaryAndCheckpointAdded:selection.added.filter(r=>r.group==='questionBanks').length,supportAdded:selection.added.filter(r=>r.group!=='questionBanks').length,rerouted,fieldsChanged,additionsByConcept:byConcept,quality:{...quality.counts,reviewedErrorExceptions:quality.findings.filter(f=>f.severity==='ERROR').length,unresolvedErrors:unresolved.length}};
}
execFileSync(process.execPath,['audit_tools/economic_realm_questions/sync.mjs','--check'],{stdio:'pipe'});
fs.writeFileSync('validation_artifacts/economic_realm_questions/summary.json',JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync('validation_artifacts/economic_realm_questions/id-comparison.csv',csv.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n')+'\n');
console.log(JSON.stringify({passed:true,games:Object.fromEntries(Object.entries(summary.games).map(([g,r])=>[g,{before:r.before,after:r.after,composerMatched:r.composerMatched,contentChanged:r.contentChanged,retained:r.retainedSupplements,added:r.added}]))}));

