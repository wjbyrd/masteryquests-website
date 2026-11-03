'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),data=path.join(root,'build/faculty-build-composer/data'),project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation';
const baseline=path.join(__dirname,'baseline');assert(!fs.existsSync(baseline),'Do not overwrite baseline');fs.mkdirSync(baseline,{recursive:true});
for(const name of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'])fs.copyFileSync(path.join(data,name),path.join(baseline,name));
for(const name of ['personal-review-list-data.json','review-template.html','build-review-html.py'])fs.copyFileSync(path.join(project,'source',name),path.join(baseline,name));
fs.copyFileSync(path.join(root,'faculty_exports/validation_summary.json'),path.join(baseline,'export-summary.json'));
for(const name of ['general_economics_question_bank.xlsx','microeconomics_question_bank.xlsx','macroeconomics_question_bank.xlsx','microeconomics_manual_review.xlsx','microeconomics_manual_review.csv'])fs.copyFileSync(path.join(root,'faculty_exports',name),path.join(baseline,name));
const core=require(path.join(root,'build/faculty-build-composer/composer-core.js')),{questionRecords}=require(path.join(root,'build/faculty-build-composer/tests/composer-integrity-contracts.js'));
const raw=fs.readFileSync(path.join(baseline,'composer_library.js'),'utf8'),lib=JSON.parse(raw.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),review=JSON.parse(fs.readFileSync(path.join(baseline,'personal-review-list-data.json'),'utf8'));
assert.equal(lib.librarySha256,review.librarySha256);const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),seen=new Map();for(const r of questionRecords(lib)){const id=String(r.question.id);if(seen.has(id))assert.deepEqual(r.question,seen.get(id).question);else seen.set(id,r);}
const medium=[...seen.values()].filter(r=>r.question.canonicalDifficulty==='medium');
const items=medium.filter(r=>review.reviewSeed[String(r.question.id)]?.status==='unknown').map((r,i)=>({n:i+1,id:String(r.question.id),conceptId:r.conceptId,topic:lib.concepts[r.conceptId].title,question:r.question,correctIndex:r.question.options.findIndex(o=>sha(core.normalizeAnswerText(o))===r.question.aHash)}));assert.equal(items.length,1586);assert(items.every(r=>r.correctIndex>=0));
fs.writeFileSync(path.join(__dirname,'inventory.json'),JSON.stringify({beforeLibrarySha256:lib.librarySha256,sourceFileSha256:sha(raw),count:items.length,scope:'Complete question/choices/explanation review of every Medium record marked unknown in the saved review queue, including the prior editorial revisions.',totalMedium:medium.length,items},null,2)+'\n');
fs.copyFileSync(path.join(root,'audit_tools/medium_editorial_20261102/apply.cjs'),path.join(__dirname,'apply.cjs'));
console.log(JSON.stringify({count:items.length,topics:new Set(items.map(r=>r.topic)).size,hash:lib.librarySha256}));
