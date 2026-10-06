const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const newQuestions=JSON.parse(fs.readFileSync(path.join(root,'phaseGraph1-demand-supply-core-v1_questions.json'),'utf8'));
const expectedAssets=['DEMAND-01','DEMAND-02','DEMAND-03','SUPPLY-01','SUPPLY-02','SUPPLY-03','DEMAND-SUPPLY-01','DEMAND-SUPPLY-02'];
const issues=[];
function norm(v){return String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();}
function answerHash(v){return crypto.createHash('sha256').update(norm(v)).digest('hex');}

if(newQuestions.length!==48) issues.push(`expected 48 new questions, got ${newQuestions.length}`);
const ids=new Set(newQuestions.map(q=>q.id));
if(ids.size!==newQuestions.length) issues.push('duplicate new question IDs');
const graphCounts={};
for(const q of newQuestions){
  const stem=path.basename(q.image||'','.webp'); graphCounts[stem]=(graphCounts[stem]||0)+1;
  if(!q.image) issues.push(`${q.id} missing image`);
  const matches=q.options.filter(o=>answerHash(o)===q.aHash).length;
  if(matches!==1) issues.push(`${q.id} answer hash matches ${matches} options`);
  if(/^(For the same|The same|At that|Using the same|If the price in the same|At the same)\b/i.test(q.q||'')) issues.push(`${q.id} unsafe context start`);
  if(/horizontal axis|vertical axis|x-axis|y-axis/i.test(q.q||'')) issues.push(`${q.id} axis-identification item should not exist`);
}
for(const a of expectedAssets) if(graphCounts[a]!==6) issues.push(`${a} expected 6 questions, got ${graphCounts[a]||0}`);
const posCounts={0:0,1:0,2:0,3:0};
for(const q of newQuestions){const p=q.options.findIndex(o=>answerHash(o)===q.aHash); if(p>=0)posCounts[p]++;}
for(const i of [0,1,2,3]) if(posCounts[i]!==12) issues.push(`correct position ${i} expected 12 got ${posCounts[i]}`);

function recipe(title,ids){return {schemaVersion:'1.2.0',title,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),supportedModes:[...core.MODE_ORDER],selectedConceptIds:ids,checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};}
async function check(name,ids){
  const composition=core.compose(library,recipe(name,ids));
  const answerAudit=await core.verifyAnswers(composition);
  const assetIssues=[];
  for(const asset of composition.assets){
    const disk=path.join(root,'data',asset.runtimePath);
    if(!fs.existsSync(disk)){assetIssues.push({path:asset.runtimePath,issue:'missing'});continue;}
    const actual=crypto.createHash('sha256').update(fs.readFileSync(disk)).digest('hex');
    if(actual!==asset.sha256)assetIssues.push({path:asset.runtimePath,issue:'hash mismatch'});
  }
  const failedModes=(composition.validation?.modes||[]).filter(m=>!m.ok).map(m=>m.mode);
  return {name,ids,ok:composition.errors.length===0&&answerAudit.ok&&assetIssues.length===0&&failedModes.length===0,
    errors:composition.errors,warnings:composition.warnings,failedModes,answerAudit:{ok:answerAudit.ok,checked:answerAudit.checked,failures:answerAudit.failures},assetAudit:{assetCount:composition.assets.length,issues:assetIssues},counts:composition.counts};
}

(async()=>{
  const cases=[];
  cases.push(await check('Demand',['demand']));
  cases.push(await check('Supply',['supply']));
  cases.push(await check('Market Equilibrium',['market-equilibrium']));
  cases.push(await check('Phase Graph 1',['demand','supply','market-equilibrium']));
  cases.push(await check('Market Foundations',['competitive-markets','demand','supply','market-equilibrium','price-signals','elasticity','consumer-and-producer-surplus']));
  cases.push(await check('Principles Micro Core',['competitive-markets','demand','supply','market-equilibrium','price-signals','elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy','costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly']));
  const out={phase:'phaseGraph1-demand-supply-core-v1',composerVersion:core.COMPOSER_VERSION,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,canonicalQuestionCount:library.canonicalQuestionCount,assetCount:library.assetInventory.length,newQuestionCount:newQuestions.length,graphCounts,posCounts,issues,cases,ok:issues.length===0&&cases.every(c=>c.ok)};
  fs.writeFileSync(path.join(root,'tests','phaseGraph1_demand_supply_core_validation_results.json'),JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
  if(!out.ok) process.exit(1);
})();
