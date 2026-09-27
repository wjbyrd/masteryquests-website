const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer');
const core=require(path.join(cdir,'composer-core.js')),contracts=require(path.join(cdir,'tests/composer-integrity-contracts.js'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const source=fs.readFileSync(path.join(cdir,'data/composer_library.js'),'utf8');new vm.Script(source);
const current=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const audit=read('faculty_exports/audits/macroeconomics_audit_findings.json'),ledger=read('faculty_exports/audits/macroeconomics_consolidated_cleanup_changes.json');
const baseSource=execFileSync('git',['show',audit.headAtAudit+':build/faculty-build-composer/data/composer_library.js'],{cwd:root,encoding:'utf8',maxBuffer:128*1024*1024});assert.equal(sha(baseSource),audit.canonicalSHA256);
const old=JSON.parse(baseSource.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,''));
const records=lib=>contracts.questionRecords(lib),map=lib=>new Map(records(lib).map(r=>[String(r.question.id),r.question]));
const prior=map(old),now=map(current),failures=[];
const capture=(name,fn)=>{try{fn();return true}catch(e){failures.push({check:name,error:e.message});return false}};
const same=(a,b)=>core.stableStringify(a)===core.stableStringify(b);
capture('canonical integrity',()=>contracts.assertCanonicalIntegrity(current));
capture('no additions/deletions',()=>assert.deepEqual([...now.keys()].sort(),[...prior.keys()].sort()));
const areaLib=require(path.join(cdir,'course-area-model.js'));
function project(lib){const area=areaLib.create(lib.registry.concepts),out={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(lib.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(lib,cid)))for(const a of area.areasFor(cid))out[a].add(String(q.id));return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,[...v].sort()]));}
const projection=project(current),beforeProjection=project(old),protectedIDs=[...new Set([...beforeProjection.general,...beforeProjection.micro])].sort();
for(const a in projection)capture(a+' exact membership',()=>assert.deepEqual(projection[a],beforeProjection[a]));
const locations=lib=>{const m=new Map();for(const r of records(lib)){const id=String(r.question.id);if(!m.has(id))m.set(id,[]);m.get(id).push([r.conceptId,r.pool]);}for(const a of m.values())a.sort();return m};
const oldLoc=locations(old),newLoc=locations(current),regressions=protectedIDs.filter(id=>!same(prior.get(id),now.get(id))||!same(oldLoc.get(id),newLoc.get(id)));
const integrity={emptyStem:[],emptyFeedback:[],optionCounts:[],duplicateOptions:[],answerFailures:[],aliasConflicts:[],badImages:[]};
const currentRecords=[];
for(const[id,q]of now){
 if(!q.q?.trim())integrity.emptyStem.push(id);if(!q.feedback?.trim())integrity.emptyFeedback.push(id);
 if(q.options?.length!==4)integrity.optionCounts.push(id);
 if(new Set(q.options.map(core.normalizeAnswerText)).size!==4)integrity.duplicateOptions.push(id);
 const answers=q.options.map((x,i)=>sha(core.normalizeAnswerText(x))===q.aHash?i:-1).filter(i=>i>=0);if(answers.length!==1)integrity.answerFailures.push(id);
 if(q.image){const module=core.resolveConceptModule(current,q.primaryConceptId);const asset=(module?.assets||[]).find(a=>[a.runtimePath,a.sourceUrl,a.sourceAssetPath,a.filename].includes(q.image))||current.assetInventory.find(a=>[a.runtimePath,a.sourceUrl,a.sourceAssetPath,a.filename].includes(q.image));if(!asset||!fs.existsSync(path.join(cdir,asset.sourceUrl)))integrity.badImages.push({id,image:q.image});}
 currentRecords.push({id,q,key:answers.length===1?q.options[answers[0]]:null,answer:answers[0],locations:newLoc.get(id)});
}
for(const r of records(current))if(!same(r.question,now.get(String(r.question.id))))integrity.aliasConflicts.push(String(r.question.id));
const targets=[...new Set(audit.findings.flatMap(f=>f.affectedQuestionIDs))].sort(),actualChanged=[...now.keys()].filter(id=>!same(now.get(id),prior.get(id))||!same(newLoc.get(id),oldLoc.get(id))).sort();
const reconciliation=ledger.changes.map(c=>{const actual=now.get(c.id),errors=[];for(const k of c.fields){if(!same(prior.get(c.id)[k]??null,c.before[k]))errors.push('before:'+k);if(c.removedFields.includes(k)?Object.hasOwn(actual,k):!same(actual[k]??null,c.after[k]))errors.push('after:'+k);}const clone=structuredClone(prior.get(c.id));Object.assign(clone,c.after);for(const k of c.removedFields)delete clone[k];if(!same(clone,actual))errors.push('unrecorded field change');return{id:c.id,status:errors.length?'REGRESSED / LOST':'VERIFIED CURRENT',errors};});
const retained=targets.filter(id=>!ledger.changedCanonicalIDs.includes(id)).map(id=>({id,unchanged:same(prior.get(id),now.get(id))&&same(oldLoc.get(id),newLoc.get(id)),findings:audit.findings.filter(f=>f.affectedQuestionIDs.includes(id)).map(f=>f.findingID),q:now.get(id),decision:ledger.reviewedRetained.find(x=>x.id===id)}));
capture('actual exact changed IDs',()=>assert.deepEqual(actualChanged,ledger.changedCanonicalIDs.slice().sort()));
capture('2179 exact union',()=>assert.equal(targets.length,2179));capture('exact ledger scope',()=>assert.deepEqual(targets,ledger.exactActionScope));
const registered=new Map(current.assetInventory.map(a=>[a.runtimePath,a])),imageCases=audit.findings.find(f=>f.findingID==='MAA-0127').affectedQuestionIDs.map(id=>{const q=now.get(id),asset=registered.get(q.image);return{id,image:q.image,registered:!!asset,exists:!!asset&&fs.existsSync(path.join(cdir,asset.sourceUrl)),imageAlt:q.imageAlt,graphDescription:q.graphDescription,graphRequired:q.graphRequired,asset};});
const protectedFileFailures=[];for(const[p,h]of Object.entries(ledger.baseline.fileHashes))if(p.includes('/audits/')||p.includes('/question-assets/'))if(sha(fs.readFileSync(path.join(root,p)))!==h)protectedFileFailures.push(p);
const methods={};for(const c of 'ABCDEFGHIJL')methods[c]=[...new Set(audit.findings.filter(f=>f.category===c).flatMap(f=>f.affectedQuestionIDs))].sort();
const output={sourceSHA256:sha(source),counts:Object.fromEntries(Object.entries(projection).map(([k,v])=>[k,v.length])),global:now.size,projection,integrity,failures,protectedRecordCount:protectedIDs.length,sharedRegressions:regressions,protectedFileFailures,changed:actualChanged.length,targetCount:targets.length,reconciliation,retained,imageCases,scope:methods};
fs.writeFileSync(path.join(__dirname,'structure.json'),JSON.stringify(output,null,2));fs.writeFileSync(path.join(__dirname,'current_records.json'),JSON.stringify(currentRecords));fs.writeFileSync(path.join(__dirname,'prior_records.json'),JSON.stringify([...prior].map(([id,q])=>({id,q,locations:oldLoc.get(id)}))));
console.log(JSON.stringify({counts:output.counts,global:output.global,changed:output.changed,reconciled:reconciliation.filter(x=>x.status==='VERIFIED CURRENT').length,retained:retained.length,integrity:Object.fromEntries(Object.entries(integrity).map(([k,v])=>[k,v.length])),regressions:regressions.length,failures},null,2));
