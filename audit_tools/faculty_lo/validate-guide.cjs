'use strict';
// Run separately from the 27 Composer runners: node audit_tools/faculty_lo/validate-guide.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const repo=process.env.MQ_LO_REPO_ROOT||path.resolve(__dirname,'../..');
const root=path.join(repo,'build/faculty-build-composer');
const policy=require(path.join(root,'data/faculty-outcomes.js'));
const registry=JSON.parse(fs.readFileSync(path.join(root,'data/composer_registry.json')));
const model=require(path.join(root,'course-area-model.js')).create(registry.concepts);
const expected=registry.concepts.filter(r=>model.get(r.canonicalConceptId)?.cardVisible&&!policy.concepts[r.canonicalConceptId]?.hidden);
const unescape=s=>s.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
function validate(entries,html){
 assert.deepEqual(entries.map(e=>e.conceptId).sort(),expected.map(r=>r.canonicalConceptId).sort(),'Missing, stale, duplicate, or hidden concept');
 const ids=new Set();
 for(const entry of entries){
  const r=expected.find(r=>r.canonicalConceptId===entry.conceptId),c=policy.concepts[entry.conceptId];
  assert.equal(entry.name,r.title,'Concept label mismatch');assert.equal(entry.area,model.disciplineFor(entry.conceptId));assert.deepEqual(entry.areas,model.areasFor(entry.conceptId));
  assert.deepEqual(entry.outcomes,c.outcomes.map(o=>({id:o.id,label:o.label})),'Missing, stale, duplicated outcome or label mismatch');assert.deepEqual(entry.presets,c.presets);
  for(const o of entry.outcomes){assert(!ids.has(o.id),'Duplicate outcome ID');ids.add(o.id);}
 }
 const rendered=[...html.matchAll(/<details\b[^>]*data-concept="([^"]+)"[^>]*>([\s\S]*?)<\/details>/g)].map(m=>({conceptId:m[1],name:unescape(m[2].match(/<summary>([\s\S]*?)<\/summary>/)[1]),outcomes:[...m[2].matchAll(/<li data-outcome="([^"]+)">([\s\S]*?)<\/li>/g)].map(o=>({id:o[1],label:unescape(o[2])}))}));
 assert.deepEqual(rendered.sort((a,b)=>a.conceptId.localeCompare(b.conceptId)),entries.map(({conceptId,name,outcomes})=>({conceptId,name,outcomes})).sort((a,b)=>a.conceptId.localeCompare(b.conceptId)),'Rendered HTML differs from Composer outcomes');
 assert.equal([...html.matchAll(/data-outcome=/g)].length,ids.size,'Unexpected outcome outside concept entries');
 return ids.size;
}
const entries=JSON.parse(fs.readFileSync(path.join(repo,'how-to/learning-outcomes/coverage.json'))),html=fs.readFileSync(path.join(repo,'how-to/learning-outcomes/index.html'),'utf8');
const total=validate(entries,html);
let negativeControls=0;
for(const mutate of [e=>e.pop(),e=>e[0].outcomes.pop(),e=>e[0].outcomes.push({id:'stale-outcome',label:'Stale'}),e=>e[0].outcomes.push(e[0].outcomes[0]),e=>e[0].outcomes[0].label+=' stale',e=>e.push({conceptId:Object.keys(policy.concepts).find(id=>policy.concepts[id].hidden),outcomes:[]})]){
 const altered=structuredClone(entries);mutate(altered);assert.throws(()=>validate(altered,html));negativeControls++;
}
assert.throws(()=>validate(entries,html.replace(entries[0].outcomes[0].label,'Outdated rendered label')));negativeControls++;
for(const script of ['build-policy.cjs','build-guide.cjs'])cp.execFileSync(process.execPath,[path.join(__dirname,script),'--check'],{cwd:repo,env:process.env,stdio:'pipe'});
console.log(JSON.stringify({status:'PASS',publicConcepts:entries.length,publicOutcomes:total,missing:0,stale:0,duplicates:0,labelMismatches:0,hiddenPublished:0,negativeControls,generationChecks:2},null,2));
