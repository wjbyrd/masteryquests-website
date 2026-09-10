'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=process.env.MQ_LO_REPO_ROOT||path.resolve(__dirname,'../..');
const root=path.join(repo,'build/faculty-build-composer');
const policy=require(path.join(root,'data/faculty-outcomes.js'));
const registry=JSON.parse(fs.readFileSync(path.join(root,'data/composer_registry.json')));
const model=require(path.join(root,'course-area-model.js')).create(registry.concepts);
const areaNames={general:'General Economics',micro:'Microeconomics',macro:'Macroeconomics'};
const entries=registry.concepts.filter(r=>model.get(r.canonicalConceptId)?.cardVisible&&!policy.concepts[r.canonicalConceptId]?.hidden).map(r=>{
 const id=r.canonicalConceptId,c=policy.concepts[id];assert(c,'Missing outcome policy: '+id);
 return {conceptId:id,name:r.title,area:model.disciplineFor(id),areas:model.areasFor(id),outcomes:c.outcomes.map(o=>({id:o.id,label:o.label})),presets:c.presets};
}).sort((a,b)=>a.name.localeCompare(b.name,'en'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const groups=Object.entries(areaNames).map(([area,title])=>`<section class="lo-area" id="${area}" aria-labelledby="heading-${area}">
<h2 id="heading-${area}">${title}</h2>
${area==='general'?'<p>Shared foundations also appear in relevant Microeconomics and Macroeconomics selections. Each concept is listed once here.</p>':'<p>Also explore the <a href="#general">shared General Economics foundations</a>.</p>'}
<div class="lo-grid">${entries.filter(e=>e.area===area).map(e=>`<details class="lo-concept" id="concept-${e.conceptId}" data-concept="${e.conceptId}" data-areas="${e.areas.join(' ')}">
<summary>${escape(e.name)}</summary><div class="lo-content"><p class="lo-shared">Available in: ${e.areas.map(a=>areaNames[a]).join(' · ')}</p>
<p>Available learning outcomes:</p><ul>${e.outcomes.map(o=>`<li data-outcome="${o.id}">${escape(o.label)}</li>`).join('')}</ul>
${e.outcomes.length===1?'<p class="lo-note">One coherent outcome. Brief, Standard, and Full select the same coverage.</p>':''}
</div></details>`).join('\n')}</div></section>`).join('\n');
const site=fs.readFileSync(path.join(repo,'how-to/composer/index.html'),'utf8');
const header=site.match(/<header\b[\s\S]*?<\/header>/)[0],footer=site.match(/<footer\b[\s\S]*?<\/footer>/)[0];
const template=fs.readFileSync(path.join(__dirname,'guide-template.html'),'utf8');
const html=template.replace('<!-- SITE HEADER -->',header).replace('<!-- CONCEPT ENTRIES -->',groups).replace('<!-- SITE FOOTER -->',footer);
const destination=process.env.MQ_LO_GUIDE_OUTPUT_DIR||path.join(repo,'how-to/learning-outcomes');
const files={'index.html':html,'coverage.json':JSON.stringify(entries,null,2)+'\n'};
for(const [name,text] of Object.entries(files)){
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path.join(destination,name),'utf8'),text,'Learning-outcome guide is stale: '+name);
 else {fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,name),text);}
}
console.log(JSON.stringify({concepts:entries.length,outcomes:entries.reduce((n,e)=>n+e.outcomes.length,0),areas:Object.fromEntries(Object.keys(areaNames).map(a=>[a,entries.filter(e=>e.area===a).length])),status:'PASS'}));
