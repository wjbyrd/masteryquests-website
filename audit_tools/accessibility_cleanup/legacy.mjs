import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';
import {fn} from '../economic_realm_engine/source.mjs';
import {applyFeedbackProgression} from './progression-source.mjs';
const template=fs.readFileSync('build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html','utf8');
const files=['play/managerial-intelligence-directorate','play/managerial-directorate-classroom','play/managerial-directorate-telemetry-poc'].flatMap(base=>['cost-directive','market-signal','strategy-desk','agency-protocol'].map(g=>`${base}/${g}/index.html`));
files.push('play/micro-domains/labyrinth-of-choice/index.html','beta-testing/composer-telemetry-live-test/index.html','downloads/resources/mastery-quests-faculty-starter.html','downloads/resources/mastery-quests-faculty-template.html');
for(const file of files){
 let html=applyFeedbackProgression(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'));
 // A Standard boss miss must reach the existing setback, even with prior weakness.
 html=html.replaceAll('if (gameMode !== "legendary" && gameMode !== "quiz" && !remediationState.active',
  'if (!(gameMode === "standard" && isBossRoom) && gameMode !== "legendary" && gameMode !== "quiz" && !remediationState.active');
 // The published manual templates have independent release snapshots. Transfer
 // only this checkpoint fix, retaining their question selection and validation.
 if(file.startsWith('downloads/resources/')){
  for(const name of ['getCheckpointOutcome','completeCheckpointEncounter','showKnowledgeRoom'])html=html.replace(fn(html,name),fn(template,name));
  if(html.includes('function failStandardCheckpoint('))html=html.replace(fn(html,'failStandardCheckpoint'),fn(template,'failStandardCheckpoint'));
  else html=html.replace('function completeCheckpointEncounter(){',fn(template,'failStandardCheckpoint')+'\n\nfunction completeCheckpointEncounter(){');
  const answerSource=fn(html,'answer'),wrongStart=answerSource.indexOf('// ❌ WRONG ANSWER BLOCK');
  assert(wrongStart>=0);
  const wrongSource=answerSource.slice(wrongStart);
  if(!wrongSource.includes('failStandardCheckpoint();')){
   const guardedWrong=wrongSource.replace(/^     const checkpointComplete = advanceCheckpointAttempt\(\);/m,'     if(gameMode === "standard"){\n        failStandardCheckpoint();\n        return;\n     }\n     const checkpointComplete = advanceCheckpointAttempt();');
   assert.notEqual(guardedWrong,wrongSource);
   html=html.replace(answerSource,answerSource.slice(0,wrongStart)+guardedWrong);
  }
  const resumeGuard=template.match(/        \/\/ An in-progress save[\s\S]*?        if\(runPhase === "boss-summary"/)[0];
  if(!html.includes('// An in-progress save'))html=html.replace('        if(runPhase === "boss-summary"',resumeGuard);
 }
 // Protect the existing checkpoint callback without replacing independent boss rules.
 const checkpointSummary=fn(html,'showKnowledgeRoom');
 if(!checkpointSummary.includes('session !== runSessionId')){
  const guardedSummary=checkpointSummary.replace(/((?:continueButton|document\.getElementById\("continueBtn"\))\.onclick = \(\) => \{)/,
   'const session = runSessionId;\n    let continued = false;\n    $1\n        if(continued || session !== runSessionId || room !== bossRoom) return;\n        continued = true;\n        document.getElementById("continueBtn").disabled = true;');
  assert.notEqual(guardedSummary,checkpointSummary,`${file}: checkpoint callback missing`);
  html=html.replace(checkpointSummary,guardedSummary);
 }
 html=html.replace(/(<(?:div|section)[^>]*class="[^"]*mastery-section[^"]*"[^>]*>\s*)<h3([^>]*)>([\s\S]*?)<\/h3>/g,'$1<h2$2>$3</h2>');
 html=html.replace(/(<div id="artifactVault"[^>]*>\s*)<h3>([^<]*)<\/h3>/g,'$1<h2>$2</h2>');
 html=html.replaceAll('${resolveQuestionImage(question.image)}','${typeof resolveQuestionImage === \'function\' ? resolveQuestionImage(question.image) : question.image}');
 if(!html.includes('MQ ACCESSIBILITY script START')){
  html=html.replace(/<html>/i,'<html lang="en">').replace(/aria-live="assertive"/g,'aria-live="polite"');
  html=html.replace(/ aria-label="Toggle (?:sound|game sound)"/g,'');
  html=html.replace(/(<img\b[^>]*\bsrc="(?:[^"/]*\/)?(?:seal_of_preferences|prism_of_tradeoffs|scepter_of_elasticity|[^"/]*artifact[^"/]*)\.webp")(?=\s*>)/g,'$1 alt=""');
  html=html.replace(/\s*btn\.blur\(\);/g,'');
  html=html.replace(/\s*btn\.addEventListener\("touchend", \(\) => \{\s*\}, \{ passive: true \}\);/g,'');
  html=html.replaceAll('function beginRunSession(){','function beginRunSession(){\n    window.MQAccessibility?.resetFeedback();');
  html=html.replaceAll('function setAnswerButtonsDisabled(disabled){',`function setAnswerButtonsDisabled(disabled){
    if(disabled && document.getElementById('answers')?.contains(document.activeElement)) document.getElementById('question')?.focus({preventScroll:true});`);
  html=html.replaceAll('const optionsElement = document.getElementById("answers");',`const optionsElement = document.getElementById("answers");
    const previousAnswerFocus = optionsElement.contains(document.activeElement) ? document.activeElement.dataset.answerIndex : null;
    const sameQuestion = optionsElement.dataset.focusQuestionId === String(currentQuestion.id);
    optionsElement.dataset.focusQuestionId = String(currentQuestion.id);`);
  html=html.replaceAll('optionsElement.appendChild(btn);\n    });',`optionsElement.appendChild(btn);
    });
    if(previousAnswerFocus != null){
      const target = sameQuestion ? optionsElement.querySelector('[data-answer-index="'+previousAnswerFocus+'"]:not(:disabled)') : null;
      (target || document.getElementById('question'))?.focus({preventScroll:true});
    }`);
  // Some older renderers have no index attribute; adding it is presentation-only.
  html=html.replaceAll('btn.innerText = option;', 'btn.innerText = option;\n        btn.dataset.answerIndex = String(index);');
  html=html.replace(/<div id="question">/g,'<div id="question" role="heading" aria-level="2" tabindex="-1">');
  const hasDescription=html.includes('id="graphLightboxDescription"');
  if(!hasDescription)html=html.replace(/(<img[^>]*id="graphLightboxImg"[^>]*>)/,'$1\n<p id="graphLightboxDescription" class="sr-only"></p>');
  html=html.replace(/<p id="graphLightboxDescription" class="sr-only"><\/p>/,'<details class="graph-description"><summary>Graph description</summary><p id="graphLightboxDescription"></p></details>');
  for(const name of ['getQuestionGraphAccessibility','renderQuestionGraph','openGraphLightbox','closeGraphLightbox']){
   let replacement=fn(template,name);
   if(name==='renderQuestionGraph' && !html.includes('let questionGraphLoadFailed'))replacement=replacement.replace('questionGraphLoadFailed = false;','').replace('questionGraphLoadFailed = true;','');
   if(html.includes('function '+name+'('))html=html.replace(fn(html,name),replacement);
   else html=html.replace('function renderQuestionGraph(',replacement+'\nfunction renderQuestionGraph(');
  }
  html=html.replaceAll('openGraphLightbox(graphImg.src, graphImg.alt);','openGraphLightbox(graphImg.src, graphImg.alt, graphImg.dataset.graphDescription);');
 }
 for(const kind of ['style','script']){
  const start=`<!-- MQ ACCESSIBILITY ${kind} START -->`,end=`<!-- MQ ACCESSIBILITY ${kind} END -->`;
  const a=template.indexOf(start),b=template.indexOf(end);assert(a>=0&&b>a);
  const block=template.slice(a,b+end.length),x=html.indexOf(start),y=html.indexOf(end);
  html=x>=0?html.slice(0,x)+block+html.slice(y+end.length):html.replace(kind==='style'?'</head>':'</body>',block+'\n'+(kind==='style'?'</head>':'</body>'));
 }
 const graphRenderer=fn(html,'renderQuestionGraph');
 html=html.replace(graphRenderer,graphRenderer.replace(/[ \t]+$/gm,''));
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 if(html!==fs.readFileSync(file,'utf8')){
  const temporary=file+'.a11y-tmp';fs.writeFileSync(temporary,html);fs.renameSync(temporary,file);
 }
}
console.log(`Synchronized presentation and Standard checkpoint guards in ${files.length} independent/legacy game builds; question banks and independent scoring retained.`);
