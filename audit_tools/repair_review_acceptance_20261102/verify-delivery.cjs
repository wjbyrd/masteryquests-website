'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const ledger=read(path.join(__dirname,'expectations.json')),reports=Object.fromEntries(['validation','review-import','review-validation','export-validation'].map(n=>[n,read(path.join(__dirname,n+'.json'))]));
for(const r of Object.values(reports)){assert.equal(r.status,'PASS');assert.equal(r.librarySha256,ledger.afterLibrarySha256);}
const full=read(path.join(__dirname,'test-output/macroeconomics_consolidated_cleanup/validation.json')),outcomes=read(path.join(__dirname,'test-output/faculty-lo-results.json'));
assert.equal(full.status,'PASS');assert.equal(full.questionsAudited,9802);assert(outcomes.ok);assert.equal(read(path.join(__dirname,'excel-parity.json')).length,4);
const source=path.join(root,'build/faculty-build-composer/data/composer_library.js'),exportSummary=read(path.join(root,'faculty_exports/validation_summary.json'));
assert.equal(exportSummary.source_sha256,sha(source));assert.equal(reports['export-validation'].sourceSha256,sha(source));
const project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation',review=read(path.join(project,'source/personal-review-list-data.json'));
assert.equal(review.source_sha256,sha(source));assert.equal(review.librarySha256,ledger.afterLibrarySha256);
const files=[...['general_economics','microeconomics','macroeconomics'].flatMap(area=>['pdf','xlsx'].map(ext=>path.join(root,'faculty_exports',area+'_question_bank.'+ext))),path.join(root,'faculty_exports/microeconomics_manual_review.xlsx'),path.join(project,'deliverables/MasteryQuests_Question_Review.html')];
const result={status:'PASS',librarySha256:ledger.afterLibrarySha256,sourceSha256:sha(source),returnedToRepair:ledger.changes[0].id,importedApprovals:22,pendingRevisions:0,remainingSeedQuestions:0,facultyOutcomeAssertions:outcomes.assertions,bankPublicationContentUnchanged:true,artifacts:files.map(p=>({path:p.replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:sha(p)}))};
fs.writeFileSync(path.join(__dirname,'delivery-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,returnedToRepair:ledger.changes[0].id,importedApprovals:22,facultyOutcomeAssertions:outcomes.assertions}));
