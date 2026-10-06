'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Core = require('../composer-core.js');

const root = path.resolve(__dirname, '..');
const outputRoot = path.join(__dirname, 'concept-review-qa', 'generated');

function loadLibrary(){
  const source = fs.readFileSync(path.join(root, 'data', 'composer_library.js'), 'utf8').trim();
  return JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length, -1));
}

function injectFixture(html, fixture){
  const script = `\nsetTimeout(() => {\n` +
    `gameMode = "quiz"; username = "QA Student"; totalAttempts = ${fixture.total}; correctAnswers = ${fixture.correct}; maxStreak = ${fixture.streak};\n` +
    `masteryState = ${JSON.stringify(fixture.masteryState)};\n` +
    `document.getElementById("startScreen").style.display = "none"; document.getElementById("gameBox").style.display = "block";\n` +
    `showMasteryReportScreen();\n` +
    `}, 0);\n`;
  const index = html.lastIndexOf('</script>');
  if(index < 0) throw new Error('Generated HTML has no script closing tag.');
  return html.slice(0,index) + script + html.slice(index);
}

async function run(){
  fs.mkdirSync(outputRoot, {recursive:true});
  const library = loadLibrary();
  const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'concept-reviews', 'manifest.json'), 'utf8'));
  const template = fs.readFileSync(path.join(root, 'template', 'mastery-quests-faculty-template-composer-ready.html'), 'utf8');
  const runtimeSource = fs.readFileSync(path.join(root, 'concept-review-runtime.js'), 'utf8');
  const input = {
    schemaVersion:Core.RECIPE_SCHEMA_VERSION,
    title:'Concept Review Visual QA',
    slug:'concept-review-visual-qa',
    supportedModes:[...Core.MODE_ORDER],
    selectedConceptIds:['scarcity-and-tradeoffs','demand','costs-of-production'],
    checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}
  };
  const composition = Core.compose(library, input);
  if(composition.errors.length) throw new Error(composition.errors.join('\n'));
  composition.conceptReviewRuntimeSource = runtimeSource;
  composition.embeddedQuestionAssets = {};
  const config = await Core.createConfig(input, library, crypto.createHash('sha256').update(template).digest('hex'));
  const resolution = Core.resolveConceptReviews(library, sourceManifest, input.selectedConceptIds);
  if(resolution.errors.length) throw new Error(resolution.errors.join('\n'));
  const baseHtml = Core.buildHtml(template, composition, config, {conceptReviewManifestPath:'concept-reviews/manifest.json'});
  const reviewDir = path.join(outputRoot, 'concept-reviews');
  fs.mkdirSync(reviewDir, {recursive:true});
  fs.writeFileSync(path.join(reviewDir, 'manifest.json'), Core.stableStringify(resolution.runtimeIndex, 2) + '\n');
  for(const asset of resolution.assets){
    fs.copyFileSync(path.join(root, ...asset.sourcePath.split('/')), path.join(outputRoot, ...asset.destinationPath.split('/')));
  }

  const bucket = (attempts, correct, difficulty='hard') => ({attempts,correct,avgTime:11000,byDifficulty:{[difficulty]:{attempts,correct}},byType:{application:{attempts,correct,avgTime:11000,byDifficulty:{[difficulty]:{attempts,correct}}}}});
  const base = {byObjective:{},bySkill:{},recent:[],attemptEvidence:[]};
  const fixtures = {
    'direct-review':{total:4,correct:1,streak:1,masteryState:{...base,byTag:{scarcity:bucket(4,1)},byDifficulty:{hard:{attempts:4,correct:1}},attemptEvidence:[
      {questionId:'qa-scarcity-1',canonicalConceptId:'scarcity-and-tradeoffs',correct:false,responseTime:12000,tag:'scarcity',primarySkill:'scarcity_choice'},
      {questionId:'qa-scarcity-2',canonicalConceptId:'scarcity-and-tradeoffs',correct:false,responseTime:13000,tag:'scarcity',primarySkill:'scarcity_choice'}
    ]}},
    'two-review-routing':{total:5,correct:1,streak:1,masteryState:{...base,byTag:{demand:bucket(5,1)},byDifficulty:{hard:{attempts:5,correct:1}},attemptEvidence:[
      {questionId:'qa-demand-1',canonicalConceptId:'demand',correct:false,responseTime:12000,tag:'demand',repairSkill:'law_of_demand'},
      {questionId:'qa-demand-2',canonicalConceptId:'demand',correct:false,responseTime:12000,tag:'demand',repairSkill:'demand_shifters_income'}
    ]}},
    'family-chooser':{total:4,correct:1,streak:1,masteryState:{...base,byTag:{costs_of_production:bucket(4,1)},byDifficulty:{hard:{attempts:4,correct:1}},attemptEvidence:[
      {questionId:'qa-family-1',canonicalConceptId:'costs-of-production',familyConceptId:'costs-of-production',correct:false,responseTime:12000,tag:'costs_of_production'}
    ]}},
    'clean-no-review':{total:12,correct:12,streak:12,masteryState:{...base,byTag:{scarcity:bucket(12,12,'legendary')},byDifficulty:{legendary:{attempts:12,correct:12}},recent:Array.from({length:8},() => ({correct:true,responseTime:5000,tag:'scarcity',type:'application',difficulty:'legendary'})),attemptEvidence:[]}}
  };
  for(const [name, fixture] of Object.entries(fixtures)){
    fs.writeFileSync(path.join(outputRoot, `${name}.html`), injectFixture(baseHtml, fixture), 'utf8');
  }
  console.log(JSON.stringify({outputRoot,files:Object.keys(fixtures).map(name => `${name}.html`),pdfCount:resolution.assets.length},null,2));
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
