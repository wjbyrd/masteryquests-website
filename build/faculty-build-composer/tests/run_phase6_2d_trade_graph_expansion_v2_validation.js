const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const newQuestions=JSON.parse(fs.readFileSync(path.join(root,'phase6_2d_international_trade_graph_expansion_v2_questions.json'),'utf8'));
const expectedGraphCounts={'TRD-01':12,'TRD-02':12,'TRD-03':16,'TRD-04':16};
const graphCounts={};
for(const q of newQuestions){const m=(q.image||'').match(/(TRD-\d+)\.webp$/);if(m)graphCounts[m[1]]=(graphCounts[m[1]]||0)+1;}
const graphIssues=[];
for(const [k,v] of Object.entries(expectedGraphCounts)) if(graphCounts[k]!==v) graphIssues.push({graph:k,expected:v,actual:graphCounts[k]||0});
for(const q of newQuestions){if(!q.image||!/^question-assets\/international-trade-and-trade-policy\/TRD-(01|02|03|04)\.webp$/.test(q.image))graphIssues.push({id:q.id,issue:'invalid graph path',image:q.image});}
const duplicateNewIds=newQuestions.length-new Set(newQuestions.map(q=>q.id)).size;
function recipe(title,ids){return {schemaVersion:'1.2.0',title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),supportedModes:['standard','timed','exam','legendary','score'],selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
async function check(name,ids,expected=null){
 const composition=core.compose(library,recipe(name,ids));
 const answerAudit=await core.verifyAnswers(composition);
 const assetIssues=[];
 for(const asset of composition.assets){
   const disk=path.join(root,'data',asset.runtimePath);
   if(!fs.existsSync(disk)){assetIssues.push({path:asset.runtimePath,issue:'missing'});continue;}
   const actual=crypto.createHash('sha256').update(fs.readFileSync(disk)).digest('hex');
   if(actual!==asset.sha256)assetIssues.push({path:asset.runtimePath,issue:'hash mismatch',expected:asset.sha256,actual});
 }
 const countIssues=[];
 if(expected) for(const [k,v] of Object.entries(expected)) if(composition.counts[k]!==v) countIssues.push({key:k,expected:v,actual:composition.counts[k]});
 return {name,ids,ok:composition.errors.length===0&&answerAudit.ok&&assetIssues.length===0&&countIssues.length===0&&composition.validation.modes.every(m=>m.ok),errors:composition.errors,warnings:composition.warnings,counts:composition.counts,countIssues,modes:composition.validation.modes,answerAudit:{ok:answerAudit.ok,questionCount:answerAudit.questionCount,issues:answerAudit.issues},assetAudit:{assetCount:composition.assets.length,issues:assetIssues},bossCoverage:composition.bossCoverage};
}
(async()=>{
 const cases=[];
 cases.push(await check('International Trade and Trade Policy',['international-trade-and-trade-policy'],{easy:40,medium:42,hard:72,elite:38,legendary:100,easyBoss:20,mediumBoss:19,finalBoss:19,legendaryBoss:36,repair:20,bridge:20,calculation:30,graph:92,assets:53,totalCanonical:426}));
 cases.push(await check('Trade & Welfare',['gains-from-trade','elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy']));
 cases.push(await check('Principles Micro Core',['competitive-markets','demand','supply','market-equilibrium','price-signals','elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy','costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']));
 for(const id of ['elasticity','costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']) cases.push(await check('Regression '+id,[id]));
 const out={phase:'phase6.2d-international-trade-graph-expansion-v2',libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,newQuestionCount:newQuestions.length,graphCounts,graphIssues,duplicateNewIds,ok:newQuestions.length===56&&graphIssues.length===0&&duplicateNewIds===0&&cases.every(c=>c.ok),cases};
 fs.writeFileSync(path.join(root,'tests','phase6_2d_trade_graph_expansion_v2_validation_results.json'),JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 if(!out.ok)process.exit(1);
})();
