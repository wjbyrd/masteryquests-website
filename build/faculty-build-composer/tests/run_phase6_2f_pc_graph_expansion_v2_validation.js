const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const cases=[
 {name:'perfect-competition-only',ids:['perfect-competition'],expected:{easy:46,medium:48,hard:78,elite:44,legendary:100,easyBoss:20,mediumBoss:20,finalBoss:22,legendaryBoss:36,repair:20,bridge:20,calculation:30,graph:120,assets:41,totalCanonical:454}},
 {name:'firms-and-market-structure',ids:['costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']},
 {name:'principles-micro-core',ids:['competitive-markets','demand','supply','market-equilibrium','price-signals','elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy','costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']}
];
(async()=>{
 const results=[];
 for(const tc of cases){
  const recipe={schemaVersion:'1.2.0',title:tc.name,slug:tc.name,supportedModes:['standard','timed','exam','legendary','score'],selectedConceptIds:tc.ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composition=core.compose(library,recipe);
  const answerAudit=await core.verifyAnswers(composition);
  const assetIssues=[];
  for(const asset of composition.assets){
   const diskPath=path.join(root,'data',asset.runtimePath);
   if(!fs.existsSync(diskPath)){assetIssues.push({path:asset.runtimePath,issue:'missing'});continue;}
   const actual=crypto.createHash('sha256').update(fs.readFileSync(diskPath)).digest('hex');
   if(actual!==asset.sha256) assetIssues.push({path:asset.runtimePath,issue:'hash mismatch',expected:asset.sha256,actual});
  }
  const countIssues=[];
  if(tc.expected) for(const [key,value] of Object.entries(tc.expected)) if(composition.counts[key]!==value) countIssues.push({key,expected:value,actual:composition.counts[key]});
  const ok=composition.errors.length===0&&answerAudit.ok&&assetIssues.length===0&&countIssues.length===0&&composition.validation.modes.every(m=>m.ok);
  results.push({name:tc.name,ok,selectedConceptIds:tc.ids,errors:composition.errors,warnings:composition.warnings,counts:composition.counts,countIssues,modes:composition.validation.modes.map(m=>({mode:m.mode,ok:m.ok,deficiencies:m.deficiencies})),answerAudit,assetAudit:{assetCount:composition.assets.length,issues:assetIssues},bossCoverage:composition.bossCoverage});
 }
 const pc=library.concepts['perfect-competition'];
 const newQuestions=Object.values(pc.questions).flat().filter(q=>(q.sourceOccurrences||[]).some(o=>o.sourceFile==='phase6.2f-perfect-competition-graph-expansion-v2'));
 const graphCounts={}; for(const q of newQuestions){const m=(q.image||'').match(/PC-(\d\d)\.webp$/);if(m)graphCounts[m[1]]=(graphCounts[m[1]]||0)+1;}
 const expectedGraphs={'01':12,'02':10,'03':12,'04':12,'06':14,'07':14,'08':10};
 const graphIssues=[]; for(const [g,n] of Object.entries(expectedGraphs))if(graphCounts[g]!==n)graphIssues.push({graph:g,expected:n,actual:graphCounts[g]||0});
 const out={phase:'6.2f-PC-GRAPH-V2',libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,newQuestionCount:newQuestions.length,graphCounts,graphIssues,ok:results.every(r=>r.ok)&&newQuestions.length===84&&graphIssues.length===0,results};
 fs.writeFileSync(path.join(root,'tests','phase6_2f_pc_graph_expansion_v2_validation_results.json'),JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2)); if(!out.ok)process.exit(1);
})();
