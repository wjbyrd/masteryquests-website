'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const composerRoot = path.resolve(__dirname, '..');
const core = require(path.join(composerRoot, 'composer-core.js'));
const helpers = require(path.join(composerRoot, 'tests', 'composer-test-helpers.js'));
const templatePath = process.argv[2] || path.join(composerRoot, 'template', 'mastery-quests-faculty-template-composer-ready.html');

(async function run(){
  const template = fs.readFileSync(templatePath, 'utf8');
  const library = helpers.loadComposerLibrary();
  const recipe = {
    schemaVersion:core.RECIPE_SCHEMA_VERSION,
    title:'Visibility Telemetry Smoke',
    slug:'visibility-telemetry-smoke',
    supportedModes:['standard'],
    selectedConceptIds:['aggregate-demand'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  const built = await helpers.buildFacultyGame(core, recipe, {library, template});
  const scripts = helpers.extractInlineScripts(built.html);
  scripts.forEach((source, index) => new vm.Script(source, {filename:`generated-telemetry-smoke-${index + 1}.js`}));
  const required = [
    'activeResponseTimeMs','hiddenTimeMs','tabSwitchCount','timeAfterReturnMs',
    'focusLossCount','unfocusedTimeMs','timeAfterFocusMs',
    'selectionCount','maxSelectedChars','questionSelected','answersSelected',
    'copyCount','questionCopied','answersCopied','lastCopyElapsedMs',
    'timeCopyToHideMs','timeCopyToBlurMs',
    'document.addEventListener("selectionchange", scheduleQuestionSelectionTelemetry);',
    'document.addEventListener("copy"',
    'window.addEventListener("blur"',
    'recordAdaptiveAttempt(currentQuestion, isCorrect, activeResponseTime);',
    'checkRapidGuessing(isCorrect, responseTime);'
  ];
  required.forEach(marker => {
    if(!built.html.includes(marker)) throw new Error(`Generated game missing ${marker}`);
  });
  console.log(JSON.stringify({
    ok:true,
    bytes:Buffer.byteLength(built.html),
    inlineScripts:scripts.length,
    questionCount:built.composition.counts.totalCanonical,
    modes:built.composition.validation.modes
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
