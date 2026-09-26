'use strict';
// Exactly the three instructor-authorized post-verification exceptions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),composer=path.join(root,'build/faculty-build-composer'),work=path.join(root,'tmp/microeconomics_exception_closure');
const core=require(path.join(composer,'composer-core.js')),contracts=require(path.join(composer,'tests/composer-integrity-contracts.js'));
const baselineRef='b9846e0d56aa1a883f1507e3a0d4222762975a23',baselineSourceSha256='ec4dd60b42e624eb913515a93bb2537f5fef7a050e1df19e7d83b18c51a0ee99';
const sourceAt=f=>execFileSync('git',['show',baselineRef+':'+f],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),stable=core.stableStringify;
const source=sourceAt('build/faculty-build-composer/data/composer_library.js');assert.equal(sha(source),baselineSourceSha256);
const baseline=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().replace(/;$/,'')),library=structuredClone(baseline);
const map=l=>new Map(contracts.questionRecords(l).map(r=>[String(r.question.id),r.question])),before=map(baseline),current=map(library);
const targets=['P62B-ELAS-B3-019','PM5-PC-BR-088','P62C-CPS-H-026'];
Object.assign(current.get(targets[0]),{
 q:'Demand is perfectly inelastic: quantity demanded remains at the same positive amount when market price increases. A student correctly computes zero midpoint demand elasticity, then concludes that total revenue is unchanged. Which diagnosis is correct?',
 feedback:'Quantity is unchanged while price increases, so the midpoint quantity-change numerator and demand elasticity are zero. Revenue is P×Q: with a positive fixed Q, the higher price produces higher revenue.',
 commonError:'fails_to_connect_elasticity_to_revenue'
});
const bridge=current.get(targets[1]);Object.assign(bridge,{
 q:'Competitive firms initially earn positive economic profit. Entry expands market supply and lowers price from $10 to $6. An incumbent’s marginal costs for units 1–4 are $3, $5, $8 and $12; variable cost at zero output is zero and fixed cost is unavoidable this period. With costs unchanged, how does its profit-maximizing output change?',
 options:['It falls from 3 units to 2 units.','It stays at 3 units because entry does not change marginal cost.','It rises from 3 units to 4 units because market supply expands.','It falls from 3 units to zero because any price fall requires shutdown.'],
 feedback:'Entry adds market supply and lowers price. A price-taking firm compares that price with each unit’s marginal cost: at $10, the first three units add to profit; at $6, only the first two do. Output therefore falls from 3 to 2. Those two units still cover their variable costs, so shutdown would forgo a positive contribution to unavoidable fixed cost.'
});bridge.aHash=sha(core.normalizeAnswerText(bridge.options[0]));
const accounting=current.get(targets[2]);Object.assign(accounting,{
 tag:'costs_of_production',objective:'COP.1',conceptCluster:'micro_costs_of_production',primarySkill:'accounting_profit',repairSkill:'accounting_profit',commonError:'subtracts_implicit_costs',primaryConceptId:'costs-of-production',familyConceptId:'costs-of-production',subtopicIds:['profit-concepts']
});
const from=library.concepts['consumer-and-producer-surplus'],to=library.concepts['costs-of-production'];
assert.equal(from.questions.hard.filter(q=>q.id===accounting.id).length,1);from.questions.hard=from.questions.hard.filter(q=>q.id!==accounting.id);to.questions.hard.push(accounting);
for(const f of ['q','options','aHash','feedback','difficulty','canonicalDifficulty'])assert.deepEqual(accounting[f],before.get(accounting.id)[f],'Approved accounting content unchanged: '+f);
const touched=new Set(['consumer-and-producer-surplus','costs-of-production']);
function entries(module){return contracts.questionRecords({concepts:{x:module}});}
function metadata(entry,module){
 const rows=entries(module),unique=[...new Map(rows.map(r=>[String(r.question.id),r.question])).values()],p=module.questions||{},boss=p.boss||[];
 entry.includedSkills=[...new Set(unique.map(q=>q.primarySkill).filter(Boolean))].sort();
 entry.questionCountByRole={boss:boss.length,bridge:(module.bridgeQuestions||[]).length,calculation:(p.calculation||[]).length,elite:(p.elite||[]).length,integration:(p.integration||[]).length,legendary:(p.legendary||[]).length,legendaryBoss:(p.legendaryBoss||[]).length,main:['easy','medium','hard'].reduce((n,k)=>n+(p[k]||[]).length,0),repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length};
 entry.questionCountByDifficulty={easy:0,medium:0,hard:0,elite:0,legendary:0,unknown:0};for(const q of unique){const tier=q.canonicalDifficulty||q.difficulty;entry.questionCountByDifficulty[tier in entry.questionCountByDifficulty?tier:'unknown']++;}
 entry.repairCoverage={directSkillMatches:(module.repairQuestions||[]).length,mainWithUsableSkill:unique.length};entry.bridgeCoverage={directSkillMatches:(module.bridgeQuestions||[]).length,mainWithUsableSkill:unique.length};entry.calculationCoverage=unique.filter(q=>/calculat/i.test(q.type||'')||q.instructionalRole==='calculation').length;entry.graphCoverage=unique.filter(q=>q.image).length;
 if(entry.runtimeAdaptiveCounts){const counts={easy:0,medium:0,hard:0};for(const pool of Object.keys(counts))counts[pool]=(p[pool]||[]).length;for(const q of [...p.calculation||[],...p.integration||[]]){const tier=q.canonicalDifficulty||q.difficulty;if(tier in counts)counts[tier]++;}entry.runtimeAdaptiveCounts=counts;}
}
for(const entry of library.registry.concepts){const module=library.concepts[entry.canonicalConceptId];if(touched.has(entry.canonicalConceptId)||touched.has(module.derivedFromConceptId))metadata(entry,core.resolveConceptModule(library,entry.canonicalConceptId));}
const area=require(path.join(composer,'course-area-model.js')).create(library.registry.concepts);
function projection(l){const p={general:new Set(),micro:new Set(),macro:new Set()};for(const cid of Object.keys(l.concepts))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(l,cid)))for(const a of area.areasFor(cid))p[a].add(String(q.id));return Object.fromEntries(Object.entries(p).map(([a,ids])=>[a,[...ids].sort()]));}
const areasBefore=projection(baseline),areasAfter=projection(library);assert.deepEqual(areasAfter,areasBefore,'All course-area memberships unchanged');
assert.deepEqual(Object.fromEntries(Object.entries(areasAfter).map(([k,v])=>[k,v.length])),{general:1589,micro:6301,macro:4745});
const after=map(library);assert.equal(after.size,9779);assert.deepEqual([...after.keys()].sort(),[...before.keys()].sort());
const changed=[...after].filter(([id,q])=>stable(q)!==stable(before.get(id))).map(([id,q])=>{const old=before.get(id),fields=[...new Set([...Object.keys(old),...Object.keys(q)])].filter(f=>stable(old[f]??null)!==stable(q[f]??null));return{id,fields,before:Object.fromEntries(fields.map(f=>[f,old[f]??null])),after:Object.fromEntries(fields.map(f=>[f,q[f]??null])),removedFields:[],beforeRecord:old,afterRecord:q};});
assert.deepEqual(changed.map(x=>x.id).sort(),targets.slice().sort(),'STOP if any other canonical ID changes');
for(const id of targets){const q=after.get(id),old=before.get(id);assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(core.normalizeAnswerText)).size,4);assert.equal(q.options.filter(o=>sha(core.normalizeAnswerText(o))===q.aHash).length,1);for(const f of ['sourceId','sourceGame','sourceChapter','sourcePool','sourceHash','sourceOccurrences','originalSourcePool','instructionalRole','difficulty','canonicalDifficulty'])assert.deepEqual(q[f],old[f],'Preserved '+id+'.'+f);}
const stamp='2026-09-26T20:00:00.000Z';library.generatedAt=stamp;library.registry.generatedAt=stamp;delete library.librarySha256;delete library.registry.librarySha256;library.librarySha256=sha(stable(library));library.registry.librarySha256=library.librarySha256;
const manifest=JSON.parse(sourceAt('build/faculty-build-composer/data/composer_library_manifest.json'));Object.assign(manifest,{librarySha256:library.librarySha256,generatedAt:stamp});
contracts.assertCanonicalIntegrity(library,{registry:library.registry,manifest});
const context={module:{exports:{}}};require('node:vm').runInNewContext(sourceAt('build/faculty-build-composer/data/faculty-outcomes.js'),context);const policy=core.FacultyOutcomes.policy;for(const k of Object.keys(policy))delete policy[k];Object.assign(policy,JSON.parse(JSON.stringify(context.module.exports)));
for(const [cid,record]of Object.entries(policy.concepts)){const module=library.concepts[cid];if(!module||(!touched.has(cid)&&!touched.has(module.derivedFromConceptId)))continue;for(const outcome of record.outcomes){const comp=core.compose(library,{title:'Coverage',slug:'coverage',selectedConceptIds:[cid],supportedModes:core.MODE_ORDER,contentScopes:{[cid]:{preset:'custom',outcomeIds:[outcome.id]}}});const difficulty=Object.fromEntries(['easy','medium','hard','elite','legendary'].map(k=>[k,comp.banks[k].length]));outcome.coverage={ordinary:Object.values(difficulty).reduce((a,b)=>a+b,0),checkpoints:['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((n,k)=>n+comp.banks[k].length,0),repair:comp.repairQuestions.length,bridge:comp.bridgeQuestions.length,seed:Object.values(comp.skillRepairSeedPools||{}).flat().length,difficulty,supportedModes:comp.validation.modes.filter(m=>m.ok).map(m=>m.mode)};}}
assert(policy.concepts['profit-concepts'].outcomes.some(o=>o.skillIds.includes('accounting_profit')));assert.deepEqual(to.microSkillRepairPools.accounting_profit,['PMC-COP-R-023']);
policy.librarySha256=library.librarySha256;delete policy.policySha256;policy.policySha256=sha(stable(policy));
const expectations={baselineRef,baselineSourceSha256,changedQuestionIds:targets,changes:changed,moves:[{id:accounting.id,fromConcept:'consumer-and-producer-surplus',toConcept:'costs-of-production',pool:'hard'}],afterLibrarySha256:library.librarySha256,countsBefore:Object.fromEntries(Object.entries(areasBefore).map(([k,v])=>[k,v.length])),countsAfter:Object.fromEntries(Object.entries(areasAfter).map(([k,v])=>[k,v.length])),sharedGeneralTargets:targets.filter(id=>areasAfter.general.includes(id))};
fs.mkdirSync(work,{recursive:true});fs.writeFileSync(path.join(work,'expected_changes.json'),JSON.stringify(expectations,null,2)+'\n');
const outputs=new Map([['composer_library.js','window.MQ_COMPOSER_LIBRARY='+JSON.stringify(library)+';\n'],['composer_registry.json',JSON.stringify(library.registry,null,2)+'\n'],['composer_library_manifest.json',JSON.stringify(manifest,null,2)+'\n'],['faculty-outcomes.js',"// Generated by audit_tools/faculty_lo/build-policy.cjs from reviewed grouping proposals.\n(function(root,data){if(typeof module==='object'&&module.exports)module.exports=data;else root.MQFacultyOutcomePolicy=data;})(typeof globalThis!=='undefined'?globalThis:this,"+JSON.stringify(policy,null,2)+');\n']]);
fs.mkdirSync(path.join(work,'staged'),{recursive:true});for(const [name,data]of outputs)fs.writeFileSync(path.join(work,'staged',name),data);
if(process.argv.includes('--write')){for(const[name,data]of outputs)fs.writeFileSync(path.join(composer,'data',name),data);fs.writeFileSync(path.join(root,'validation_artifacts/question_quality/microeconomics_exception_closure_expectations.json'),JSON.stringify(expectations,null,2)+'\n');}
console.log(JSON.stringify({written:process.argv.includes('--write'),changedIds:changed.map(x=>x.id),counts:expectations.countsAfter,sharedGeneralTargets:expectations.sharedGeneralTargets,librarySha256:library.librarySha256}));
