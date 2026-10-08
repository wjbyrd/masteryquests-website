'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer'),base=path.join(__dirname,'baseline');
fs.mkdirSync(base,{recursive:true});for(const n of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js'])if(!fs.existsSync(path.join(base,n)))fs.copyFileSync(path.join(dir,'data',n),path.join(base,n));
const l=JSON.parse(fs.readFileSync(path.join(base,'composer_library.js'),'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
assert.equal(l.librarySha256,'0fbe5ff4beb0ab909c300d8b8cd6456d8c392b6fb52910be13ed42d8a9f4d66a');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js')),style=require(path.join(dir,'tests/faculty-prose-candidates.js')),area=require(path.join(dir,'course-area-model.js')).create(l.registry.concepts);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),all=new Map();
for(const r of con.questionRecords(l)){const id=String(r.question.id);if(all.has(id))assert.deepEqual(all.get(id).q,r.question);else all.set(id,{id,q:r.question,areas:new Set(),placements:[]});all.get(id).placements.push({conceptId:r.conceptId,pool:r.pool});}
for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid)))for(const a of area.areasFor(cid))all.get(String(q.id)).areas.add(a);
const records=[...all.values()].map(r=>({...r,areas:[...r.areas].sort(),key:r.q.options.findIndex(o=>sha(core.normalizeAnswerText(o))===r.q.aHash),marketGateDerived:(r.q.sourceOccurrences||[]).some(s=>/market.?gate/i.test([s.sourceFile,s.sourceGame,s.sourceGlobal].join(' ')))||/market.?gate/i.test(r.q.sourceGame||'')}));
const exact=['LG-Q-4004','P52B-S1-LRPC-L-002','43196','43313'];
const patterns={
 'Meta/textbook':/\btextbook\b/i,
 'AI abstraction':/\b(?:decomposition|decomposes|durable|configuration|reconciliation|formulation|inference separates|relationship integrates|channel decomposition|particular result of|(?:persistent|lasting|structural) component)\b/i,
 'Noun stack':/\b(?:(?:loanable[- ]funds|LF)[- ](?:supply|demand)|saving[- ]supply|investment-demand (?:shift|effect)|money-supply effect|currency[- ]supply (?:effect|curve|schedule)|policy-channel|spending-response)\b/i,
 'Graph state':/\b(?:(?:new|original|initial|final|marked) equilibrium|after the shift|following the change|moves? (?:to|from) [A-Z]|(?:point|equilibrium) [AB]|new|original|initial|final|after|following)\b/i
};
const macro=records.filter(r=>r.areas.includes('macro')).map(r=>{const text=[r.q.q,...r.q.options].join(' '),metrics=style.screen(r.q,r.key),flags=Object.entries(patterns).filter(([n,re])=>(n!=='Graph state'||r.q.image)&&re.test(text)).map(([n])=>n);if(metrics.lengthOutlier)flags.push('Answer length');if(metrics.medianDistractorWords<=10&&metrics.correctWords>=metrics.medianDistractorWords+6&&/\b(?:because|since|so|therefore|which means|implying|while|despite)\b/i.test(r.q.options[r.key]))flags.push('Explanatory key');if(exact.includes(r.id))flags.push('Faculty seed');return{...r,metrics,flags};});
const candidates=macro.filter(r=>r.flags.length);const write=(n,x)=>fs.writeFileSync(path.join(__dirname,n),JSON.stringify(x,null,2)+'\n');write('records.json',records);write('candidates.json',candidates);write('exact-items.json',macro.filter(r=>exact.includes(r.id)));
const summary={librarySha256:l.librarySha256,macro:macro.length,candidates:candidates.length,editableCandidates:candidates.filter(r=>r.areas.length===1&&!r.marketGateDerived).length,patterns:Object.fromEntries([...Object.keys(patterns),'Answer length','Explanatory key'].map(k=>[k,candidates.filter(r=>r.flags.includes(k)).length]))};write('scan-summary.json',summary);
if(!fs.existsSync(path.join(__dirname,'baseline-pages.json')))write('baseline-pages.json',JSON.parse(fs.readFileSync(path.join(root,'faculty_exports/validation_summary.json'),'utf8')).disciplines.macro.question_pages);
console.log(JSON.stringify(summary));console.log(JSON.stringify(macro.filter(r=>exact.includes(r.id)),null,2));
