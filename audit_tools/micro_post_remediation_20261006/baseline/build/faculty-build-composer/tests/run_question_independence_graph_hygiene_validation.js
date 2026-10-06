const fs=require('fs');
const path=require('path');
const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));

function allQuestionRecords(){
  const out=[];
  const walk=(obj)=>{
    if(Array.isArray(obj)){ obj.forEach(walk); return; }
    if(!obj || typeof obj!=='object') return;
    if(obj.id && obj.q && Array.isArray(obj.options)){ out.push(obj); return; }
    Object.values(obj).forEach(walk);
  };
  walk(library.concepts);
  return out;
}

const records=allQuestionRecords();
const byId=new Map();
for(const q of records) if(!byId.has(q.id)) byId.set(q.id,q);

const contextGuard=/^(For the same|The same|At that|Using the same|If the price in the same|At the same)\b/i;
const referGraph=/\brefer to\b[^.]{0,80}\bgraph\b/i;
const axisIds=['ECON-SP-EASY-25','ECON-SP-EASY-26','ECON-SP-EASY-60','ECON-SP-EASY-61'];
const screenshotContextIds=['P62C-CPS-L-004','P62C-CPS-L-010'];
const issues=[];
const knownProtectedFindings=[];
const protectedOutOfScopeIds=new Set(['43192']);

for(const q of byId.values()){
  if(contextGuard.test(q.q||'')){
    const finding=`unsafe context start ${q.id}`;
    if(protectedOutOfScopeIds.has(String(q.id))) knownProtectedFindings.push(finding);
    else issues.push(finding);
  }
  if(!q.image && referGraph.test(q.q||'')) issues.push(`orphan graph reference ${q.id}`);
}
for(const id of axisIds){
  if(byId.get(id)?.image) issues.push(`axis giveaway image remains ${id}`);
}
for(const id of screenshotContextIds){
  const q=byId.get(id);
  if(!q || !/willingness-to-pay values/.test(q.q) || !/with costs/.test(q.q)) issues.push(`screenshot context not self-contained ${id}`);
}

const compositionCases={
  cps:['consumer-and-producer-surplus'],
  monopolisticCompetition:['monopolistic-competition'],
  monopoly:['monopoly'],
  macroGraphHygiene:[
    'aggregate-demand','short-run-phillips-curve','long-run-phillips-curve',
    'quantity-theory-of-money','liquidity-preference-and-money-market','monetary-policy-transmission',
    'fiscal-multipliers-and-crowding-out','inflation-costs','fisher-effect',
    'inflation-tax-and-deflation','stabilization-policy'
  ]
};

(async()=>{
  const compositionResults={};
  for(const [name,selectedConceptIds] of Object.entries(compositionCases)){
    const recipe={
      schemaVersion:'1.2.0',
      title:`Question Hygiene ${name}`,
      slug:`question-hygiene-${name.toLowerCase()}`,
      supportedModes:[...core.MODE_ORDER],
      selectedConceptIds,
      checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
    };
    const composition=core.compose(library,recipe);
    const answerAudit=await core.verifyAnswers(composition);
    const failedModes=(composition.validation?.modes||[]).filter(x=>!x.ok).map(x=>x.mode);
    const result={
      errors:composition.errors,
      warnings:composition.warnings,
      failedModes,
      answerAudit,
      poolCounts:Object.fromEntries(Object.entries(composition.banks||{}).map(([k,v])=>[k,v.length]))
    };
    compositionResults[name]=result;
    if(composition.errors.length) issues.push(`${name} composition errors: ${composition.errors.length}`);
    if(failedModes.length) issues.push(`${name} failed modes: ${failedModes.join(',')}`);
    if(!answerAudit.ok) issues.push(`${name} answer audit failures: ${answerAudit.issues.length}`);
  }

  const result={
    phase:'phaseQH1-question-independence-graph-hygiene-v1',
    ok:issues.length===0,
    composerVersion:core.COMPOSER_VERSION,
    libraryVersion:library.libraryVersion,
    librarySha256:library.librarySha256,
    canonicalQuestionCount:library.canonicalQuestionCount,
    checks:{
      unsafeContextStarts:issues.filter(x=>x.startsWith('unsafe context')).length,
      protectedOutOfScopeFindings:knownProtectedFindings.length,
      orphanGraphReferences:issues.filter(x=>x.startsWith('orphan graph')).length,
      axisGiveawayImages:issues.filter(x=>x.startsWith('axis giveaway')).length,
      screenshotContextFailures:issues.filter(x=>x.startsWith('screenshot context')).length
    },
    knownProtectedFindings,
    compositionResults,
    issues
  };
  fs.writeFileSync(path.join(root,'question_independence_graph_hygiene_validation_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
