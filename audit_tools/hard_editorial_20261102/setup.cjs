'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),data=path.join(root,'build/faculty-build-composer/data'),project='C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation';
const baseline=path.join(__dirname,'baseline');assert(!fs.existsSync(baseline),'Baseline already captured');fs.mkdirSync(baseline,{recursive:true});
for(const name of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'])fs.copyFileSync(path.join(data,name),path.join(baseline,name));
for(const name of ['personal-review-list-data.json','review-template.html','build-review-html.py'])fs.copyFileSync(path.join(project,'source',name),path.join(baseline,name));
fs.copyFileSync(path.join(root,'faculty_exports/validation_summary.json'),path.join(baseline,'export-summary.json'));
for(const name of ['general_economics_question_bank.xlsx','microeconomics_question_bank.xlsx','macroeconomics_question_bank.xlsx','microeconomics_manual_review.xlsx','microeconomics_manual_review.csv'])fs.copyFileSync(path.join(root,'faculty_exports',name),path.join(baseline,name));
const core=require(path.join(root,'build/faculty-build-composer/composer-core.js')),{questionRecords}=require(path.join(root,'build/faculty-build-composer/tests/composer-integrity-contracts.js'));
const raw=fs.readFileSync(path.join(baseline,'composer_library.js'),'utf8'),lib=JSON.parse(raw.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
assert.equal(lib.librarySha256,'9e8aa88ae3674bde45503cd16ea0bd46167bb6a9b593d03ea7d28c7513ff1003');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),seen=new Map();
for(const r of questionRecords(lib)){const id=String(r.question.id);if(seen.has(id))assert.deepEqual(r.question,seen.get(id).question);else seen.set(id,r);}
const items=[...seen.values()].filter(r=>r.question.canonicalDifficulty==='hard').map((r,i)=>({n:i+1,id:String(r.question.id),conceptId:r.conceptId,topic:lib.concepts[r.conceptId].title,question:r.question,correctIndex:r.question.options.findIndex(o=>sha(core.normalizeAnswerText(o))===r.question.aHash)}));
assert(items.length&&items.every(r=>r.correctIndex>=0));
fs.writeFileSync(path.join(__dirname,'inventory.json'),JSON.stringify({beforeLibrarySha256:lib.librarySha256,sourceFileSha256:sha(raw),count:items.length,items},null,2)+'\n');
for(const name of ['author.cjs','apply.cjs','read.cjs']){
 let text=fs.readFileSync(path.join(root,'audit_tools/legendary_editorial_20261102',name),'utf8');
 text=text.replaceAll('Legendary','Hard').replaceAll("'legendary'","'hard'").replaceAll('draft.audited,1360','draft.audited,'+items.length);
 fs.writeFileSync(path.join(__dirname,name),text);
}
let screen=fs.readFileSync(path.join(root,'audit_tools/legendary_wording_audit_20261102/audit.cjs'),'utf8');
screen=screen.replaceAll("'legendary'","'hard'").replaceAll('canonicalDifficulty=legendary','canonicalDifficulty=hard').replace("path.join(__dirname,'inventory.json')","path.join(__dirname,'screening.json')");
fs.writeFileSync(path.join(__dirname,'screen.cjs'),screen);
console.log(JSON.stringify({baselineCaptured:true,hard:items.length,topics:new Set(items.map(r=>r.topic)).size}));
