'use strict';
// Read-only coverage analysis using the production Composer's own eligibility rules.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(dir,'composer-core.js'));
const library=require(path.join(dir,'tests/composer-test-helpers.js')).loadComposerLibrary();
const area=require(path.join(dir,'course-area-model.js')).create(library.registry.concepts);
const registry=new Map(library.registry.concepts.map(c=>[c.canonicalConceptId,c]));
const before=JSON.stringify(library),results=[];
function analyze(areaName,kind,id,title,selected,scope){
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Mode coverage audit',slug:'mode-coverage-audit',selectedConceptIds:selected,supportedModes:core.MODE_ORDER,checkpointFocus:Object.fromEntries(core.CHECKPOINT_ORDER.map(k=>[k,null]))};
 if(scope)recipe.contentScopes=scope;
 const c=core.compose(library,recipe);
 const deficits={};
 for(const m of c.validation.modes)for(const d of m.deficiencies)deficits[d.pool]=Math.max(deficits[d.pool]||0,d.minimum-d.count);
 const result={area:areaName,kind,id,title,selectedConceptIds:selected,counts:c.counts,readyModes:c.validation.modes.filter(m=>m.ok).map(m=>m.mode),blockedModes:c.validation.modes.filter(m=>!m.ok),deficits,errors:c.errors};
 results.push(result);return result;
}
for(const a of ['micro','macro']){
 const records=area.conceptsForArea(a),ids=records.map(c=>c.canonicalConceptId);
 for(const r of records){
  const id=r.canonicalConceptId,title=registry.get(id).title||id;
  const row=analyze(a,'concept',id,title,[id]);row.parentConceptId=r.parentConceptId;row.discipline=r.discipline;
  row.coverageStatus=registry.get(id).coverageStatus;row.coverageNote=registry.get(id).coverageStatusNote;
  row.intentionalIntegrationOnly=id==='integrated-economic-analysis';
 }
 for(const family of area.navigationFamiliesForArea(a)){
  const selected=family.conceptIds.filter(id=>!library.concepts[id].derivedFromConceptId||!family.conceptIds.includes(library.concepts[id].derivedFromConceptId));
  analyze(a,'family',family.id,family.label,selected);
 }
 const selected=ids.filter(id=>!library.concepts[id].derivedFromConceptId||!ids.includes(library.concepts[id].derivedFromConceptId));
 if(a==='macro')selected.push('integrated-macroeconomic-analysis');
 analyze(a,'course',a,a,selected);
}
assert.equal(JSON.stringify(library),before,'Analysis must not mutate the library');
const summary={librarySha256:library.librarySha256,modeOrder:core.MODE_ORDER,areas:{}};
for(const a of ['micro','macro']){
 const rows=results.filter(r=>r.area===a&&r.kind==='concept');
 summary.areas[a]={concepts:rows.length,allTen:rows.filter(r=>r.readyModes.length===10).length,blockedByMode:Object.fromEntries(core.MODE_ORDER.map(m=>[m,rows.filter(r=>!r.readyModes.includes(m)).length])),issueCount:rows.reduce((n,r)=>n+r.blockedModes.reduce((n,m)=>n+m.issues.length,0),0),course:results.find(r=>r.area===a&&r.kind==='course').readyModes};
}
const q=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
const pools=['easy','medium','hard','elite','legendary','easyBoss','mediumBoss','finalBoss','legendaryBoss','repair','bridge','graphSafe','fadingFortuneEligible','riskRewardEligible'];
const columns=['area','kind','id','title','parentConceptId','discipline','readyModeCount','readyModes','blockedModes',...pools,'minimumAdditionsByPool','issues'];
const csv=[columns,...results.map(r=>[r.area,r.kind,r.id,r.title,r.parentConceptId,r.discipline,r.readyModes.length,r.readyModes.join('; '),r.blockedModes.map(m=>m.label).join('; '),...pools.map(p=>r.counts[p]),Object.entries(r.deficits).map(([p,n])=>`${p}: ${n}`).join('; '),r.blockedModes.flatMap(m=>m.issues.map(i=>`${m.mode}: ${JSON.stringify(i)}`)).join('; ')])].map(r=>r.map(q).join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(path.join(__dirname,'coverage.json'),JSON.stringify({summary,results},null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'mode-coverage.csv'),'\ufeff'+csv);
const modeRows=[['Area','Scope','Concept ID','Topic','Mode currently blocked','Pool needed','Eligible now','Minimum required','Additional questions needed','Integration-only topic']];
const packages=[];
for(const r of results){
 const seen=new Set();
 for(const m of r.blockedModes){
  for(const d of m.deficiencies)modeRows.push([r.area,r.kind,r.id,r.title,m.label,d.pool,d.count,d.minimum,d.minimum-d.count,Boolean(r.intentionalIntegrationOnly)]);
  const additions=Object.fromEntries(m.deficiencies.map(d=>[d.pool,d.minimum-d.count])),key=JSON.stringify(additions);
  if(seen.has(key))continue;seen.add(key);
  const hypothetical={...r.counts};
  for(const [pool,n]of Object.entries(additions)){
   hypothetical[pool]=(hypothetical[pool]||0)+n;
   // Authoring packages assume valid four-option ordinary questions. Graph
   // additions are ordinary questions whose tier remains to be chosen.
   if(['easy','medium','hard','elite','legendary','graphSafe'].includes(pool)){
    hypothetical.fadingFortuneEligible+=n;hypothetical.riskRewardEligible+=n;
   }
   if(pool==='fadingFortuneEligible')hypothetical.riskRewardEligible+=n;
   if(pool==='riskRewardEligible')hypothetical.fadingFortuneEligible+=n;
  }
  const unlocked=core.validateModes(hypothetical,core.MODE_ORDER).modes.filter(m=>m.ok&&!r.readyModes.includes(m.mode)).map(m=>m.label);
  assert(unlocked.includes(m.label),'Every package must resolve its target mode');
  packages.push({area:r.area,kind:r.kind,id:r.id,title:r.title,additions,total:Object.values(additions).reduce((a,b)=>a+b,0),unlocked,integrationOnly:Boolean(r.intentionalIntegrationOnly)});
 }
}
packages.sort((a,b)=>(b.unlocked.length/b.total)-(a.unlocked.length/a.total)||a.total-b.total||a.id.localeCompare(b.id));
const packageRows=[['Area','Scope','Concept ID','Topic','Questions to add','Minimum package size','Modes unlocked by this package','Number of modes unlocked','Integration-only topic'],...packages.map(p=>[p.area,p.kind,p.id,p.title,Object.entries(p.additions).map(([k,v])=>`${v} ${k}`).join('; '),p.total,p.unlocked.join('; '),p.unlocked.length,p.integrationOnly])];
for(const [name,rows]of [['mode-specific-gaps.csv',modeRows],['authoring-packages.csv',packageRows]])fs.writeFileSync(path.join(__dirname,name),'\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n')+'\r\n');
fs.writeFileSync(path.join(__dirname,'packages.json'),JSON.stringify(packages,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
console.log('FOCUSED TOPIC DEFICITS');
for(const r of results.filter(r=>r.kind==='concept'&&r.blockedModes.length))console.log(JSON.stringify({area:r.area,id:r.id,title:r.title,ready:r.readyModes.length,missing:r.deficits}));
console.log('FAMILY DEFICITS');
for(const r of results.filter(r=>r.kind==='family'))console.log(JSON.stringify({area:r.area,id:r.id,title:r.title,ready:r.readyModes.length,missing:r.deficits}));
