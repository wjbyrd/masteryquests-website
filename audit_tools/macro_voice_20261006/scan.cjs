'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(dir,'composer-core.js')),con=require(path.join(dir,'tests/composer-integrity-contracts.js'));
const savedBaseline=path.join(__dirname,'baseline/composer_library.js');
const lib=fs.existsSync(savedBaseline)?JSON.parse(fs.readFileSync(savedBaseline,'utf8').slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1)):require(path.join(dir,'tests/composer-test-helpers.js')).loadComposerLibrary();
const area=require(path.join(dir,'course-area-model.js')).create(lib.registry.concepts);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const all=new Map();
for(const r of con.questionRecords(lib)){
 const id=String(r.question.id);if(all.has(id))assert.deepEqual(all.get(id).q,r.question);else all.set(id,{id,q:r.question,areas:new Set(),placements:[]});
 all.get(id).placements.push({conceptId:r.conceptId,pool:r.pool});
}
for(const cid of Object.keys(lib.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(lib,cid)))for(const a of area.areasFor(cid))all.get(String(q.id)).areas.add(a);
const patterns={
 visual:/\b(?:graphs?|figures?|diagrams?)\b|\bas shown\b|\buse the dollar market\b/ig,
 textbook:/\btextbook (?:model|framework)|\b(?:in|under|according to) (?:the |a |this )?textbook/ig,
 rate:/\b(?:nominal|real) rates?\b|\bnominal and real rates?\b|\b(?:the )?rate (?:rises|falls|increases|decreases)\b/ig,
 reciprocal:/\breciprocal(?: quotation| rate)?\b|\breverse the quotation\b/ig,
 wrapper:/\b(?:a report|an analyst|a planner|an audit)\b|\bwhich (?:correction|inference|diagnosis)\b|\b(?:reconciles?|reconciling) (?:the |these )?(?:model|accounts|observations)\b/ig,
 jargon:/\bFX (?:supply|demand|quantity)\b|\b(?:observed )?configuration\b|\bpolicy channel receives greater weight\b/ig,
 notation:/^(?:At |Given |Use |Suppose |Let )?(?:e\s*=|ε\s*=|r\s*=|S\s*=|NX\s*=|NCO\s*=|P\*?\s*=)|\bAt e\s*=|^A simplified rr\s*=/ig
};
const required=['refer to the graph','use the graph','shown in the graph','shown in the figure','use the dollar market','textbook model','textbook framework','nominal rate','real rate','reciprocal quotation','reciprocal rate','reconciles the model','reconcile the model','FX supply','FX demand','FX quantity','a report','an analyst','which correction','which inference','observed configuration'];
const records=[...all.values()].map(r=>({...r,areas:[...r.areas].sort(),key:r.q.options.findIndex(o=>sha(core.normalizeAnswerText(o))===r.q.aHash),marketGateDerived:(r.q.sourceOccurrences||[]).some(s=>/market.?gate/i.test([s.sourceFile,s.sourceGame,s.sourceGlobal].join(' ')))||/market.?gate/i.test(r.q.sourceGame||'')}));
const candidates=[];const terms=Object.fromEntries(required.map(s=>[s,[]]));
for(const r of records.filter(r=>r.areas.includes('macro'))){
 const fields={q:r.q.q,feedback:r.q.feedback||'',...Object.fromEntries(r.q.options.map((s,i)=>['option'+i,s]))};const hits=[];
 for(const [f,s]of Object.entries(fields))for(const [p,re]of Object.entries(patterns)){re.lastIndex=0;const m=[...s.matchAll(re)];if(m.length)hits.push({field:f,pattern:p,matches:m.map(x=>x[0])});}
 for(const term of required)if(Object.values(fields).some(s=>s.toLowerCase().includes(term.toLowerCase())))terms[term].push(r.id);
 if(hits.length)candidates.push({...r,hits});
}
const write=(n,x)=>fs.writeFileSync(path.join(__dirname,n),JSON.stringify(x,null,2)+'\n');
write('records.json',records);write('candidates.json',candidates);write('required-searches.json',terms);
const base=path.join(__dirname,'baseline');fs.mkdirSync(base,{recursive:true});
for(const name of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']){const dest=path.join(base,name);if(!fs.existsSync(dest))fs.copyFileSync(path.join(dir,'data',name),dest);}
const summary={librarySha256:lib.librarySha256,canonical:records.length,macro:records.filter(r=>r.areas.includes('macro')).length,micro:records.filter(r=>r.areas.includes('micro')).length,candidates:candidates.length,patterns:Object.fromEntries(Object.keys(patterns).map(p=>[p,candidates.filter(c=>c.hits.some(h=>h.pattern===p)).length])),requiredSearches:Object.fromEntries(Object.entries(terms).map(([k,v])=>[k,v.length]))};write('scan-summary.json',summary);
fs.writeFileSync(path.join(__dirname,'candidates.txt'),candidates.map(r=>`\n${r.id} | ${r.q.primaryConceptId} | ${r.q.primarySkill} | ${r.q.canonicalDifficulty} | ${r.hits.map(h=>h.pattern+':'+h.field).join(',')} | image=${r.q.image||'-'} | frozenMicro=${r.areas.includes('micro')} | marketGate=${r.marketGateDerived}\n${r.q.q}\n${r.q.options.map((s,i)=>(i===r.key?'*':' ')+i+': '+s).join('\n')}\nFeedback: ${r.q.feedback}\n`).join(''),'utf8');
console.log(JSON.stringify(summary,null,2));
