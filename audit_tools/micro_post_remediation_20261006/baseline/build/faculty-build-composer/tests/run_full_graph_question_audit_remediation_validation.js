const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const exportFiles=[
 'phaseGraph1-demand-supply-core-audit-corrected_questions.json',
 'phaseGraph2-price-controls-taxes-audit-corrected_questions.json',
 'phaseGraph3-macro-ad-as-core-audit-corrected_questions.json',
 'phaseGraph4-money-market-ad-transmission-audit-corrected_questions.json',
 'phaseGraph5-phillips-curve-audit-corrected_questions.json'
];
const newQuestions=exportFiles.flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')));
const issues=[];
function norm(v){return String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();}
function answerHash(v){return crypto.createHash('sha256').update(norm(v)).digest('hex');}
if(newQuestions.length!==186) issues.push(`expected 186 audited questions, got ${newQuestions.length}`);
const ids=new Set(newQuestions.map(q=>q.id)); if(ids.size!==186) issues.push('duplicate audited IDs');
const liveById=new Map();
for(const c of Object.values(library.concepts)) for(const arr of Object.values(c.questions||{})) for(const q of arr) liveById.set(q.id,q);
for(const qx of newQuestions){
 const q=liveById.get(qx.id); if(!q){issues.push(`${qx.id} missing from live library`); continue;}
 const matches=q.options.filter(o=>answerHash(o)===q.aHash).length; if(matches!==1) issues.push(`${q.id} answer hash matches ${matches} options`);
 if(q.image){
   const p=path.join(root,'data',q.image); if(!fs.existsSync(p)) issues.push(`${q.id} missing image ${q.image}`);
 }
 if(/^(For the same|The same|At that|Using the same|As before|Previously|In the previous)\b/i.test(q.q||'')) issues.push(`${q.id} unsafe context start`);
 if(/refer to the .*graph|refer to the graph/i.test(q.q||'')) issues.push(`${q.id} stale refer-to-graph wording`);
 if(/ADASLRAS|PHILLIPS-0/i.test(q.image||'')) issues.push(`${q.id} renamed asset alias remains: ${q.image}`);
 const correct=q.options.find(o=>answerHash(o)===q.aHash);
 const ci=q.options.indexOf(correct); const clen=correct.length; const maxOther=Math.max(...q.options.filter((_,i)=>i!==ci).map(o=>o.length));
 if(clen>maxOther) issues.push(`${q.id} correct option remains uniquely longest by ${clen-maxOther}`);
}
if(library.canonicalQuestionCount!==8371) issues.push(`canonicalQuestionCount ${library.canonicalQuestionCount} != 8371`);
if(library.assetInventory.length!==461) issues.push(`asset count ${library.assetInventory.length} != 461`);
const assetIssues=[];
for(const a of library.assetInventory){
 const disk=path.join(root,'data',a.runtimePath);
 if(!fs.existsSync(disk)){assetIssues.push({path:a.runtimePath,issue:'missing'}); continue;}
 const actual=crypto.createHash('sha256').update(fs.readFileSync(disk)).digest('hex');
 if(actual!==a.sha256) assetIssues.push({path:a.runtimePath,issue:'hash mismatch'});
}
function recipe(title,ids){return {schemaVersion:'1.2.0',title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),supportedModes:[...core.MODE_ORDER],selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
async function check(name,ids){
 const composition=core.compose(library,recipe(name,ids));
 const answerAudit=await core.verifyAnswers(composition);
 const failedModes=(composition.validation?.modes||[]).filter(m=>!m.ok).map(m=>m.mode);
 const compAssetIssues=[];
 for(const asset of composition.assets){
   const disk=path.join(root,'data',asset.runtimePath);
   if(!fs.existsSync(disk)){compAssetIssues.push({path:asset.runtimePath,issue:'missing'});continue;}
   const actual=crypto.createHash('sha256').update(fs.readFileSync(disk)).digest('hex');
   if(actual!==asset.sha256) compAssetIssues.push({path:asset.runtimePath,issue:'hash mismatch'});
 }
 return {name,ids,ok:composition.errors.length===0&&answerAudit.ok&&failedModes.length===0&&compAssetIssues.length===0,errors:composition.errors,warnings:composition.warnings,failedModes,answerAudit:{ok:answerAudit.ok,checked:answerAudit.checked,failures:answerAudit.failures},assetAudit:{assetCount:composition.assets.length,issues:compAssetIssues},counts:composition.counts};
}
(async()=>{
 const cases=[];
 cases.push(await check('Demand Supply Equilibrium',['demand','supply','market-equilibrium']));
 cases.push(await check('Market Policy Set',['market-equilibrium','binding-price-ceilings','binding-price-floors','tax-wedges-and-revenue','tax-incidence','statutory-versus-economic-tax-incidence']));
 cases.push(await check('AD AS Macro Equilibrium',['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks']));
 cases.push(await check('Money Market and Monetary Transmission',['liquidity-preference-and-money-market','monetary-policy-transmission']));
 cases.push(await check('Phillips Curve Family',['short-run-phillips-curve','long-run-phillips-curve','phillips-curve-expectations']));
 cases.push(await check('Macro Graph Core',['aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks','liquidity-preference-and-money-market','monetary-policy-transmission','short-run-phillips-curve','long-run-phillips-curve','phillips-curve-expectations']));
 const out={phase:'phaseGraphAudit-remediation-v1',composerVersion:core.COMPOSER_VERSION,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,canonicalQuestionCount:library.canonicalQuestionCount,assetCount:library.assetInventory.length,auditedQuestionCount:newQuestions.length,issues,globalAssetIssues:assetIssues,cases,ok:issues.length===0&&assetIssues.length===0&&cases.every(c=>c.ok)};
 const outputRoot=process.env.MQ_COMPOSER_TEST_OUTPUT_DIR?path.resolve(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR):root;
 const outputFile=path.join(outputRoot,'tests','full_graph_question_audit_remediation_validation_results.json');
 fs.mkdirSync(path.dirname(outputFile),{recursive:true});
 fs.writeFileSync(outputFile,JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2)); if(!out.ok) process.exit(1);
})();
