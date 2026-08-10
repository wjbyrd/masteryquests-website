const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const cases=[
  {name:'costs-only',slug:'costs-only',ids:['costs-of-production']},
  {name:'firms-and-market-structure',slug:'firms-and-market-structure',ids:['costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']},
  {name:'principles-micro-core',slug:'principles-micro-core',ids:['competitive-markets','demand','supply','market-equilibrium','price-signals','elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy','costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']}
];
(async()=>{
 const results=[];
 for(const tc of cases){
  const recipe={schemaVersion:'1.2.0',title:tc.name,slug:tc.slug,supportedModes:['standard','timed','exam','legendary','score'],selectedConceptIds:tc.ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composition=core.compose(library,recipe);
  const answerAudit=await core.verifyAnswers(composition);
  const assetIssues=[];
  for(const asset of composition.assets){
   const diskPath=path.join(root,'data',asset.runtimePath);
   if(!fs.existsSync(diskPath)){assetIssues.push({path:asset.runtimePath,issue:'missing'});continue;}
   const actual=crypto.createHash('sha256').update(fs.readFileSync(diskPath)).digest('hex');
   if(actual!==asset.sha256)assetIssues.push({path:asset.runtimePath,issue:'hash mismatch',expected:asset.sha256,actual});
  }
  const ok=composition.errors.length===0&&answerAudit.ok&&assetIssues.length===0&&composition.validation.modes.every(m=>m.ok);
  results.push({name:tc.name,ok,selectedConceptIds:tc.ids,errors:composition.errors,warnings:composition.warnings,counts:composition.counts,modes:composition.validation.modes.map(m=>({mode:m.mode,ok:m.ok,deficiencies:m.deficiencies})),answerAudit,assetAudit:{assetCount:composition.assets.length,issues:assetIssues}});
 }
 const out={phase:'6.2e-COP-GRAPH-V2',libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,ok:results.every(r=>r.ok),cases:results};
 fs.writeFileSync(path.join(root,'tests','phase6_2e_cost_graph_expansion_v2_validation_results.json'),JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 if(!out.ok)process.exit(1);
})();
