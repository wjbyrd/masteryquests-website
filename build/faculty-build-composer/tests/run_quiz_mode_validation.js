const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0) throw new Error(`missing ${name}`);
  const brace=src.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<src.length;i++){
    if(src[i]==='{') depth++;
    else if(src[i]==='}'){
      depth--;
      if(depth===0) return src.slice(start,i+1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

function difficultySequence(target){
  const normalize=extractFunction(template,'normalizeQuizQuestionTarget');
  const diff=extractFunction(template,'getDifficultyForMode');
  const ctx={gameMode:'quiz',quizQuestionTarget:target,quizQuestionsCompleted:0,QUIZ_MAX_QUESTIONS:15,Math,Number};
  vm.createContext(ctx);
  vm.runInContext(`${normalize}\n${diff}`,ctx);
  const seq=[];
  for(let i=0;i<target;i++){
    ctx.quizQuestionsCompleted=i;
    seq.push(vm.runInContext('getDifficultyForMode()',ctx));
  }
  return seq;
}

function countSeq(seq){
  return seq.reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{});
}

(async()=>{
  const issues=[];
  const recipe={
    schemaVersion:'1.2.0',
    title:'Quiz Mode Validation',
    slug:'quiz-mode-validation',
    supportedModes:['quiz'],
    selectedConceptIds:['mcomp-efficiency-variety-limits'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  // Fall back to parent if child id ever changes; this test is about mode mechanics.
  let composition=core.compose(library,recipe);
  if(composition.errors.length){
    recipe.selectedConceptIds=['oligopoly'];
    composition=core.compose(library,recipe);
  }
  if(composition.errors.length) issues.push(...composition.errors);
  const quizValidation=composition.validation.modes.find(m=>m.mode==='quiz');
  if(!quizValidation?.ok) issues.push('quiz preflight failed');
  const req=Object.fromEntries((quizValidation?.requirements||[]).map(r=>[r.pool,r]));
  for(const pool of ['easy','medium','hard']){
    if(req[pool]?.minimum!==5) issues.push(`quiz ${pool} minimum ${req[pool]?.minimum}`);
  }
  if((quizValidation?.requirements||[]).some(r=>['repair','bridge','easyBoss','mediumBoss','finalBoss'].includes(r.pool))){
    issues.push('quiz requires non-quiz pools');
  }

  const config=await core.createConfig(recipe,library,await core.sha256Hex(template));
  const metadata={schemaVersion:core.RECIPE_SCHEMA_VERSION,composerVersion:core.COMPOSER_VERSION,title:config.title,slug:config.slug,selectedConceptIds:config.selectedConceptIds,checkpointFocus:config.checkpointFocus,bossCoverage:composition.bossCoverage,supportedModes:config.supportedModes,saveKeyNamespace:config.saveKeyNamespace,compositionFingerprint:config.compositionFingerprint,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,templateSha256:config.templateSha256};
  const html=core.buildHtml(template,composition,config,metadata);
  fs.writeFileSync(path.join(__dirname,'quiz-only.html'),html);

  const checks={
    quizCard: html.includes('data-mode="quiz"'),
    quizSetup: html.includes('id="quizSetupModal"'),
    countSelector: html.includes('id="quizQuestionCountSelect"'),
    max15: html.includes('<option value="15">15 questions</option>'),
    fixedCompletion: html.includes('quizQuestionsCompleted >= quizQuestionTarget'),
    noQuizRemediation: html.includes('gameMode !== "quiz" && !remediationState.active'),
    noQuizSetbackBranch: html.includes('QUIZ MODE: FIXED LENGTH, NO SETBACKS OR REMEDIATION DETOURS'),
    quizNoBosses: html.includes('gameMode === "exam" || gameMode === "timed" || gameMode === "quiz"'),
    quizReport: html.includes('if(gameMode === "quiz") return "Quiz";'),
    quizConfigOnly: config.supportedModes.length===1 && config.supportedModes[0]==='quiz'
  };
  Object.entries(checks).forEach(([k,v])=>{if(!v) issues.push(`missing ${k}`);});

  const seq10=difficultySequence(10);
  const seq15=difficultySequence(15);
  const counts10=countSeq(seq10);
  const counts15=countSeq(seq15);
  if(JSON.stringify(counts10)!==JSON.stringify({easy:4,medium:3,hard:3})) issues.push(`10-question distribution ${JSON.stringify(counts10)}`);
  if(JSON.stringify(counts15)!==JSON.stringify({easy:5,medium:5,hard:5})) issues.push(`15-question distribution ${JSON.stringify(counts15)}`);

  const result={
    phase:'quiz-mode-v1',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,
    canonicalQuestionCount:library.canonicalQuestionCount,
    supportedModes:core.MODE_ORDER,
    quizValidation:quizValidation ? {ok:quizValidation.ok,requirements:quizValidation.requirements}:null,
    distributions:{ten:{sequence:seq10,counts:counts10},fifteen:{sequence:seq15,counts:counts15}},
    checks,generatedHtmlBytes:Buffer.byteLength(html),issues
  };
  fs.writeFileSync(path.join(root,'quiz_mode_validation_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
