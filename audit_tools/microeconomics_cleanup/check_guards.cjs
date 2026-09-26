'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),tests=path.join(root,'build/faculty-build-composer/tests');
const micro=require(path.join(tests,'microeconomics-approved-revisions.js'));
const integrity=require(path.join(tests,'composer-integrity-contracts.js'));
const library=JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library.js'),'utf8').replace(/^window.MQ_COMPOSER_LIBRARY=/,'').trim().replace(/;$/,''));
micro.assertCurrentLibrary(library);
const rows=integrity.questionRecords(library),checks=[];
function rejected(name,mutate,restore){mutate();assert.throws(()=>micro.assertCurrentLibrary(library),undefined,name);restore();checks.push(name);}
const changed=rows.find(r=>micro.approvedIds.has(String(r.question.id))).question;
const feedback=changed.feedback;
rejected('Unapproved feedback on an approved ID',()=>changed.feedback+=' Unauthorized change.',()=>changed.feedback=feedback);
const untouched=rows.find(r=>!micro.approvedIds.has(String(r.question.id))).question;
rejected('New field on an untouched ID',()=>untouched.unapprovedField=true,()=>delete untouched.unapprovedField);
const accepted=rows.find(r=>String(r.question.id)==='ECON-MG-LEGENDARYBOSS-9138').question;
const originalType=accepted.type;
rejected('Instructor-accepted record remains immutable',()=>accepted.type='unauthorized',()=>accepted.type=originalType);
const originalHash=changed.aHash;
rejected('Answer hash mutation',()=>changed.aHash='0'.repeat(64),()=>changed.aHash=originalHash);
const ordinary=Object.values(library.concepts).find(m=>m.questions?.easy?.length>1),moved=ordinary.questions.easy.pop();
ordinary.questions.medium.push(moved);
assert.throws(()=>micro.assertCurrentLibrary(library),undefined,'Unauthorized storage move');
ordinary.questions.medium.pop();ordinary.questions.easy.push(moved);checks.push('Unauthorized storage move');
const before=micro.beforeApprovedRevisions(changed.id);before.tag='unauthorized';
assert.throws(()=>micro.applyApprovedRevisions(before),undefined,'Changed historical expectation');checks.push('Changed historical expectation');
micro.assertCurrentLibrary(library);
for(const id of ['ECON-MG-LEGENDARYBOSS-9138','P62B-ELAS-EL-022']){
 const old=integrity.questionRecords(micro.baselineLibrary).find(r=>String(r.question.id)===id).question;
 assert.deepEqual(rows.find(r=>String(r.question.id)===id).question,old);
}
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'inputs/audit_input_hashes.json'),'utf8'));
for(const [file,expected] of Object.entries(hashes)){
 const full=path.isAbsolute(file)?file:path.join(root,'faculty_exports/audits',file);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'),expected,'Preserved original audit '+file);
}
const result={canonicalIds:9779,approvedIds:micro.approvedIds.size,mutationGuards:checks,acceptedRecordsUnchanged:true,originalAuditInputsUnchanged:true};
fs.writeFileSync(path.join(root,'tmp/microeconomics_cleanup/guard_results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
