'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),data=path.join(root,'build/faculty-build-composer/data'),project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation',prior=path.join(root,'audit_tools/hard_editorial_20261102');
const baseline=path.join(__dirname,'baseline');assert(!fs.existsSync(baseline),'Baseline already captured');fs.mkdirSync(baseline,{recursive:true});
for(const name of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'])fs.copyFileSync(path.join(data,name),path.join(baseline,name));
for(const name of ['personal-review-list-data.json','review-template.html','build-review-html.py'])fs.copyFileSync(path.join(project,'source',name),path.join(baseline,name));
fs.copyFileSync(path.join(root,'faculty_exports/validation_summary.json'),path.join(baseline,'export-summary.json'));
for(const name of ['general_economics_question_bank.xlsx','microeconomics_question_bank.xlsx','macroeconomics_question_bank.xlsx','microeconomics_manual_review.xlsx','microeconomics_manual_review.csv'])fs.copyFileSync(path.join(root,'faculty_exports',name),path.join(baseline,name));
const core=require(path.join(root,'build/faculty-build-composer/composer-core.js')),{questionRecords}=require(path.join(root,'build/faculty-build-composer/tests/composer-integrity-contracts.js'));
const raw=fs.readFileSync(path.join(baseline,'composer_library.js'),'utf8'),lib=JSON.parse(raw.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),review=JSON.parse(fs.readFileSync(path.join(baseline,'personal-review-list-data.json'),'utf8'));
assert.equal(lib.librarySha256,'1c6337fb525d5f6514745dad28f50b1e050d112ab11828d315580d9f86865f53');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),seen=new Map();
for(const r of questionRecords(lib)){const id=String(r.question.id);if(seen.has(id))assert.deepEqual(r.question,seen.get(id).question);else seen.set(id,r);}
const medium=[...seen.values()].filter(r=>r.question.canonicalDifficulty==='medium');
const items=medium.filter(r=>review.reviewSeed[String(r.question.id)]?.status==='unknown').map((r,i)=>({n:i+1,id:String(r.question.id),conceptId:r.conceptId,topic:lib.concepts[r.conceptId].title,question:r.question,correctIndex:r.question.options.findIndex(o=>sha(core.normalizeAnswerText(o))===r.question.aHash)}));
assert.equal(items.length,1586);assert(items.every(r=>r.correctIndex>=0));
fs.writeFileSync(path.join(__dirname,'inventory.json'),JSON.stringify({beforeLibrarySha256:lib.librarySha256,sourceFileSha256:sha(raw),count:items.length,scope:'Canonical Medium questions marked unknown in the saved review queue. Approved and previously excluded questions are not in scope.',totalMedium:medium.length,items},null,2)+'\n');
for(const name of ['author.cjs','apply.cjs','read.cjs','audit-view.cjs','helpers.cjs','draft-check.cjs']){
 let s=fs.readFileSync(path.join(prior,name),'utf8').replaceAll('Hard','Medium').replaceAll("'hard'","'medium'").replaceAll('draft.audited,2159','draft.audited,'+items.length);fs.writeFileSync(path.join(__dirname,name),s);
}
let screen=fs.readFileSync(path.join(prior,'screen.cjs'),'utf8').replaceAll("'hard'","'medium'").replaceAll('canonicalDifficulty=hard','canonicalDifficulty=medium');
screen=screen.replace("r.question.canonicalDifficulty==='medium'","r.question.canonicalDifficulty==='medium'&&review.reviewSeed[String(r.question.id)]?.status==='unknown'").replace('All unique canonicalDifficulty=medium questions, regardless of instructionalRole;','Remaining unique canonicalDifficulty=medium questions marked unknown in the saved review queue;');
fs.writeFileSync(path.join(__dirname,'screen.cjs'),screen);
console.log(JSON.stringify({baselineCaptured:true,remainingMedium:items.length,topics:new Set(items.map(r=>r.topic)).size}));
