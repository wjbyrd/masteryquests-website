'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const core = require('../composer-core.js');
const themes = require('../data/official_theme_library.js');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'template', 'mastery-quests-faculty-template-composer-ready.html');
const source = fs.readFileSync(TEMPLATE, 'utf8');
let checks = 0;

function check(condition, message){
  assert.ok(condition, message);
  checks++;
}

function has(pattern, message){
  check(pattern.test(source), message);
}

function extractFunction(name){
  const start = source.indexOf(`function ${name}(`);
  check(start >= 0, `${name} is missing`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for(let index = bodyStart; index < source.length; index++){
    const char = source[index];
    if(quote){
      if(escaped) escaped = false;
      else if(char === '\\') escaped = true;
      else if(char === quote) quote = '';
      continue;
    }
    if(char === '"' || char === "'" || char === '`'){
      quote = char;
      continue;
    }
    if(char === '{') depth++;
    if(char === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

function evaluateBossIntro({byObjective = {}, recent = [], label = 'Demand', checkpointRoom = 10}){
  const context = {masteryState:{byObjective,recent}, room:checkpointRoom};
  const script = [
    extractFunction('getObjectiveFamilyStats'),
    extractFunction('getBossIntroPresentationState'),
    extractFunction('getBossChallengeLine'),
    `this.result = (() => {
      const state = getBossIntroPresentationState('Demand');
      return {state, line:getBossChallengeLine(${JSON.stringify(label)}, state, ${checkpointRoom})};
    })();`
  ].join('\n');
  vm.runInNewContext(script, context);
  return context.result;
}

function sha256(file){
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function run(){
  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  scripts.forEach((match, index) => new vm.Script(match[1], {filename:`exam-boss-inline-${index + 1}.js`}));
  check(scripts.length > 0, 'Template has no executable script');

  has(/EXAM_DRILL_SECTIONS[\s\S]*start:1,end:9,boss:10[\s\S]*start:11,end:19,boss:20[\s\S]*start:21,end:29,boss:30/, 'Exam sections are not checkpoint-bounded');
  has(/createElement\(interactive \? "button" : "div"\)/, 'Active Exam rooms do not use button semantics');
  has(/section\?\.index === activeSection\?\.index/, 'Future sections are not locked to the active section');
  has(/function navigateExamRoom\(targetRoom\)/, 'Exam skip/navigation entry point is missing');
  has(/examSkippedRevisit:skippedRevisit \? 1 : 0/, 'Skipped-question revisit telemetry is missing');
  has(/examReturnVisit:isReturn \? 1 : 0/, 'Answered-question return telemetry is missing');
  has(/roomState\.revisionCount\+\+/, 'Answer revisions are not counted');
  has(/isExamSectionComplete\(sectionState\)/, 'Checkpoint availability does not require all section responses');
  has(/recordExamDraftAnswer\(choice, isCorrect, responseTime\);\s*return;/, 'Exam draft answers still enter immediate scoring/progression');
  has(/exam-boss-ready/, 'Ready checkpoint state is not presented');
  has(/All section questions have responses[\s\S]*enter the checkpoint when ready/, 'Review-before-commit guidance is missing');
  has(/box\.onclick = \(\) => isBoss \? selectExamCheckpoint\(i\)/, 'Deliberate checkpoint selection is not wired');
  has(/sectionState\.committed = true/, 'Exam section is not committed at checkpoint entry');
  has(/targetSection !== currentSection \|\| targetSection\.committed/, 'Committed or cross-section navigation guard is missing');
  has(/if\(bossRoom !== 30\) room\+\+;/, 'Existing checkpoint completion does not open the next section');
  has(/if\(gameMode === "exam" && loadExamDrillQuestion\(\)\) return;/, 'Exam behavior is not scoped away from ordinary modes');

  check(!/DANGER:\s*BOSS DETECTED|LEGENDARY BOSS DETECTED IN NEXT ROOM/i.test(source), 'Legacy pre-boss warning remains');
  has(/bossMsg\.innerText = "";[\s\S]*questionElement\.innerHTML = `<div>\$\{currentQuestion\.q\}<\/div>`/, 'Ordinary pre-boss rooms do not render normally');
  has(/function openBossReveal\(encounter\)/, 'Boss reveal trigger is missing');
  has(/getFacultyCheckpointSlot\(room\)[\s\S]*getFacultyBossName\(\)/, 'Reveal does not resolve current boss identity and image');
  has(/getWeakestBossObjective\(bank\)[\s\S]*getBossObjectiveLabel/, 'Reveal is not tied to the adaptive boss target');
  has(/getBossIntroPresentationState\(objective\)/, 'Boss intro performance-state selector is missing');
  has(/objectiveStats\.attempts >= 2[\s\S]*objectiveMisses >= 2[\s\S]*objectiveStats\.accuracy <= \(2 \/ 3\)/, 'Targeted weakness copy is not guarded by clear objective evidence');
  has(/getBossChallengeLine\(label,presentationState\)/, 'Boss intro copy does not receive the evidence-backed presentation state');
  has(/proceedBossReveal[\s\S]*loadQuestion\(\)/, 'Reveal does not hand off to existing boss mechanics');
  has(/bossRevealShownKeys\.add\(encounter\.key\)/, 'Boss reveal has no one-time encounter guard');
  has(/id="guideIntroScreen"[\s\S]*function replayGuideIntroduction\(/, 'Guide Introduction or replay hook was damaged');
  has(/recordDailyGameplayEvent\(\{correct:isCorrect,streak,question\}\)/, 'Daily Challenge scoring is not preserved at Exam commit');
  has(/id="returnMenuBtn"[\s\S]*fullscreen/i, 'Game Menu/fullscreen integration is missing');
  has(/aria-current","step"[\s\S]*aria-label/, 'Exam navigator does not expose current/state labels');
  has(/@media\(max-width:760px\)[\s\S]*guide-intro-stage\{grid-template-columns:1fr/, 'Boss reveal does not inherit responsive Guide Intro grammar');

  const perfect = evaluateBossIntro({
    byObjective:{Demand:{attempts:3,correct:3,avgTime:4000}},
    recent:Array.from({length:9}, () => ({correct:true}))
  });
  check(perfect.state === 'strong-no-clear-weakness' && perfect.line === "You've done well. Now face my challenge.", 'Perfect run receives weakness-specific boss copy');

  const targeted = evaluateBossIntro({
    byObjective:{Demand:{attempts:4,correct:2,avgTime:4000}},
    recent:[true,true,true,true,false,false].map(correct => ({correct}))
  });
  check(targeted.state === 'targeted-weakness' && /Demand is where your reasoning has slipped/.test(targeted.line), 'Clear objective weakness does not receive targeted copy');

  const mixed = evaluateBossIntro({
    byObjective:{Demand:{attempts:4,correct:3,avgTime:4000}},
    recent:[true,true,true,false].map(correct => ({correct}))
  });
  check(mixed.state === 'mixed-non-specific' && mixed.line === "You've made progress, but this checkpoint will test your command.", 'Mixed performance receives an unsupported weakness callout');

  const thinEvidence = evaluateBossIntro({
    byObjective:{Demand:{attempts:1,correct:0,avgTime:4000}},
    recent:[{correct:false}]
  });
  check(thinEvidence.state === 'mixed-non-specific' && !/Demand|slipped|weak|trouble/i.test(thinEvidence.line), 'One miss is incorrectly treated as a diagnosed weakness');

  const noEvidence = evaluateBossIntro({});
  check(noEvidence.state === 'strong-no-clear-weakness' && !/Demand|slipped|weak|trouble/i.test(noEvidence.line), 'No-evidence run receives weakness-specific boss copy');

  const defaultSelection = core.resolveThemeSelection({presetId:'default',overrides:{},customOverrides:{}}, themes, {});
  check(defaultSelection.slots.boss1.asset.id === 'default-boss-1' && defaultSelection.slots.boss2.asset.id === 'default-boss-2' && defaultSelection.slots.boss3.asset.id === 'default-boss-3', 'Default boss family does not resolve');
  const themed = core.resolveThemeSelection({presetId:'arcane-archive',overrides:{},customOverrides:{}}, themes, {});
  check(themed.slots.boss1.asset.id === 'arcane-boss-1', 'Official theme boss does not override default');
  const customSource = path.join(ROOT, 'data', 'default-theme-assets', 'default-boss-challenger.webp');
  const customBytes = fs.readFileSync(customSource);
  const customHash = crypto.createHash('sha256').update(customBytes).digest('hex');
  const customId = `faculty-${customHash.slice(0, 24)}`;
  const facultyBoss = {id:customId,label:'Faculty Boss',originalName:'faculty-boss.webp',category:'theme-custom',fileType:'image/webp',width:1086,height:1448,originalWidth:1086,originalHeight:1448,originalSizeBytes:customBytes.length,sizeBytes:customBytes.length,sha256:customHash,dataUrl:`data:image/webp;base64,${customBytes.toString('base64')}`,compatibleSlots:['boss1'],normalized:true};
  const custom = core.resolveThemeSelection({presetId:'default',overrides:{},customOverrides:{boss1:customId}}, themes, {[customId]:facultyBoss});
  check(custom.slots.boss1.source === 'custom' && custom.slots.boss1.asset.id === customId, 'Faculty custom boss does not override default');

  const expectedAssets = [
    ['default-guide.webp','07543456aee95178002b8d9ef09bac1bd5f4c9897f30dea0bb45287d82256854'],
    ['default-boss-challenger.webp','b7ffb0c8b3482abc3e2d46e81c46d1b6d333dbc392cd012fae2ae24e2d5805e1'],
    ['default-boss-enforcer.webp','c755306fb2b1b5cf5b0a7c42436127251ad2a60802010e320f5d73db39a3799a'],
    ['default-boss-warden.webp','9c846508a91c58e2ffc99efc211117297dd9033025ae968f720c21314acb088c']
  ];
  for(const [name, hash] of expectedAssets){
    const file = path.join(ROOT, 'data', 'default-theme-assets', name);
    check(fs.existsSync(file) && sha256(file) === hash, `${name} is missing or changed`);
  }

  console.log(`Exam navigation + adaptive boss reveal validation passed (${checks} checks).`);
}

run();
