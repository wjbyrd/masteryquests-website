'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),core=require('../composer-core.js');
const ledger=require('../../../audit_tools/hard_pool_expansion_20261105/approved-release.json');
const additions=new Map(ledger.additions.map(r=>[r.question.id,r]));
const hash=library=>{const p=structuredClone(library);delete p.librarySha256;delete p.registry.librarySha256;return crypto.createHash('sha256').update(core.stableStringify(p)).digest('hex');};
function beforeHardPoolExpansion(current){
 if(current.librarySha256!==ledger.afterLibrarySha256)return current;
 assert.equal(hash(current),ledger.afterLibrarySha256);
 const restored=structuredClone(current);
 for(const {conceptId,pool,question}of additions.values()){
  const questions=restored.concepts[conceptId].questions[pool],index=questions.findIndex(q=>q.id===question.id);
  assert(index>=0,'Approved addition present: '+question.id);assert.deepEqual(questions[index],question);questions.splice(index,1);
 }
 for(const change of ledger.metadataChanges){assert.deepEqual(restored[change.path[0]],change.after);restored[change.path[0]]=structuredClone(change.before);}
 assert.equal(hash(restored),ledger.beforeLibrarySha256,'Only approved additions and coverage metadata changed');
 return restored;
}
function wrap(prior){return {...prior,hardPoolExpansionLedger:ledger,beforeHardPoolExpansion,approvedIds:new Set([...prior.approvedIds,...additions.keys()]),
 assertCurrentLibrary(current){prior.assertCurrentLibrary(beforeHardPoolExpansion(current));},
 beforeFacultyValidationLibrary(current){return prior.beforeFacultyValidationLibrary(beforeHardPoolExpansion(current));},
 applyApprovedRevisions(question){if(question&&additions.has(String(question.id))){assert.deepEqual(question,additions.get(String(question.id)).question);return structuredClone(question);}return prior.applyApprovedRevisions(question);},
 approvedQuestion(id){return additions.has(String(id))?structuredClone(additions.get(String(id)).question):prior.approvedQuestion(id);},
 beforeApprovedRevisions(id,fallback){return additions.has(String(id))?undefined:prior.beforeApprovedRevisions(id,fallback);}
};}
module.exports={ledger,additions,beforeHardPoolExpansion,wrap};
