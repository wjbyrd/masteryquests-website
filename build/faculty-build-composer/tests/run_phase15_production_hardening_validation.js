'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  REPO_ROOT,
  readText,
  assertInlineScriptsCompile,
  getCanonicalComposerVersion
} = require('./composer-test-helpers.js');

const MODERN_FILES = [
  'downloads/resources/mastery-quests-faculty-template.html',
  'build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html',
  'play/economic-realm/market-gate/index.html',
  'play/economic-realm/national-ledger/index.html',
  'play/economic-realm/equilibrium-crisis/index.html',
  'play/economic-realm/liquidity-grid/index.html',
  'play/economic-realm/stabilization-protocol/index.html',
  'play/macro-command-system/mint-ash-gold/index.html',
  'play/macro-command-system/command-nexus/index.html',
  'play/macro-command-system/exchange-citadel/index.html',
  'play/managerial-intelligence-directorate/cost-directive/index.html',
  'play/managerial-intelligence-directorate/market-signal/index.html',
  'play/managerial-intelligence-directorate/strategy-desk/index.html',
  'play/managerial-intelligence-directorate/agency-protocol/index.html',
  'play/micro-domains/labyrinth-of-choice/index.html'
];
const NATIONAL_ENGINE = 'play/macro-command-system/national-engine/index.html';
const ALL_ENGINE_FILES = [...MODERN_FILES, NATIONAL_ENGINE];

function source(relative){ return readText(path.join(REPO_ROOT, relative)); }

function extractFunction(text, name){
  const start = text.indexOf(`function ${name}`);
  assert(start >= 0, `Missing function ${name}.`);
  const brace = text.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for(let index = brace; index < text.length; index++){
    const char = text[index];
    if(quote){
      if(escaped){ escaped = false; continue; }
      if(char === '\\'){ escaped = true; continue; }
      if(char === quote) quote = '';
      continue;
    }
    if(char === '"' || char === "'" || char === '`'){ quote = char; continue; }
    if(char === '{') depth++;
    if(char === '}' && --depth === 0) return text.slice(start, index + 1);
  }
  throw new Error(`Unclosed function ${name}.`);
}

function extractAssignedFunction(text, name){
  const assignment = text.lastIndexOf(`${name} = function(`);
  assert(assignment >= 0, `Missing assigned function ${name}.`);
  const start = text.indexOf('function(', assignment);
  const brace = text.indexOf('{', start);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for(let index = brace; index < text.length; index++){
    const char = text[index];
    if(quote){
      if(escaped){ escaped = false; continue; }
      if(char === '\\'){ escaped = true; continue; }
      if(char === quote) quote = '';
      continue;
    }
    if(char === '"' || char === "'" || char === '`'){ quote = char; continue; }
    if(char === '{') depth++;
    if(char === '}' && --depth === 0) return text.slice(start, index + 1);
  }
  throw new Error(`Unclosed assigned function ${name}.`);
}

function testCompileAndArchitecture(){
  ALL_ENGINE_FILES.forEach(relative => {
    const html = source(relative);
    assertInlineScriptsCompile(html, relative);
    assert(html.includes('PHASE 1.5 PRODUCTION HARDENING'), `${relative} lacks Phase 1.5 hardening.`);
    assert(html.includes('function renderQuestionMedia(question)'), `${relative} lacks the shared media renderer.`);
    assert(html.includes('persistStandardRunAfterStateChange'), `${relative} lacks state-change persistence.`);
    assert(html.includes('elapsedMs'), `${relative} does not persist accumulated active time.`);
    assert(html.includes('PauseActiveClock'), `${relative} does not pause run time while the page is hidden.`);
    assert(html.includes('runPhase'), `${relative} does not persist lifecycle phase.`);
    assert(html.includes('pagehide'), `${relative} does not save on close/pagehide.`);
    assert(html.includes('phase15CompletionLocked') || html.includes('nationalCompletionLocked'), `${relative} lacks completion locking.`);
    assert(/2026\.08\.24-phase1\.5/.test(html), `${relative} lacks a Phase 1.5 game/build version.`);
  });

  const manual = source(MODERN_FILES[0]);
  assert(manual.includes('TARGETED MASTERY REPAIR — PHASE 1'), 'Manual template lacks targeted repair compatibility.');
  assert(manual.includes('function ensureRemediationHistory(state)'), 'Manual template lacks remediation anti-repeat history.');
  assert(manual.includes('getRemediationSelectionPool'), 'Manual template lacks least-recently-seen remediation selection.');
  const canonicalVersion = getCanonicalComposerVersion();
  const composerCore = source('build/faculty-build-composer/composer-core.js');
  assert(canonicalVersion, 'Canonical Composer version must be readable.');
  assert(composerCore.includes(`const COMPOSER_VERSION = '${canonicalVersion}'`));
  assert(composerCore.includes('phase1.5-hardening'));
}

function testClockSemantics(){
  const template = source(MODERN_FILES[1]);
  const context = {now:0};
  context.Date = {now:() => context.now};
  vm.createContext(context);
  vm.runInContext(`
    let accumulatedElapsedMs = 0;
    let startTime = null;
    let finalElapsedTimeMs = null;
    let phase15ResumeClockOnVisible = false;
    const getElapsedTimeMs = ${extractAssignedFunction(template, 'getElapsedTimeMs')};
    const freezeCompletionTime = ${extractAssignedFunction(template, 'freezeCompletionTime')};
    ${extractFunction(template, 'phase15PauseActiveClock')}
    ${extractFunction(template, 'phase15ResumeActiveClock')}
    globalThis.clock = {
      set:(prior, start, finalValue = null) => { accumulatedElapsedMs = prior; startTime = start; finalElapsedTimeMs = finalValue; phase15ResumeClockOnVisible = false; },
      elapsed:getElapsedTimeMs,
      freeze:freezeCompletionTime,
      pause:phase15PauseActiveClock,
      resume:phase15ResumeActiveClock
    };
  `, context);

  context.now = 30 * 60 * 1000;
  context.clock.set(20 * 60 * 1000, 20 * 60 * 1000);
  assert.strictEqual(context.clock.elapsed(), 30 * 60 * 1000, '20m + 10m active sessions must report 30m.');

  context.now = 7 * 24 * 60 * 60 * 1000;
  context.clock.set(20 * 60 * 1000, context.now);
  assert.strictEqual(context.clock.elapsed(), 20 * 60 * 1000, 'Offline wall-clock time must be excluded.');

  context.clock.set(0, context.now);
  context.now += 90 * 1000;
  assert.strictEqual(context.clock.elapsed(), 90 * 1000, 'Legacy saves must default elapsed time to zero.');

  context.clock.set(5 * 60 * 1000, context.now);
  context.now += 2 * 60 * 1000;
  context.clock.pause();
  context.now += 24 * 60 * 60 * 1000;
  assert.strictEqual(context.clock.elapsed(), 7 * 60 * 1000, 'Hidden-tab time must be excluded.');
  context.clock.resume();
  context.now += 3 * 60 * 1000;
  assert.strictEqual(context.clock.elapsed(), 10 * 60 * 1000, 'Active time must resume after the page becomes visible.');

  const frozen = context.clock.freeze();
  context.now += 5 * 60 * 1000;
  assert.strictEqual(context.clock.elapsed(), frozen, 'Completion time must freeze once.');
}

function testSaveIsolationAndWording(){
  const template = source(MODERN_FILES[1]);
  const context = {runPhase:'question', gameMode:'standard', saves:0};
  context.runEnding = false;
  context.phase15CompletionLocked = false;
  context.modeAllowsSave = () => context.gameMode === 'standard';
  context.saveGameState = () => context.saves++;
  vm.createContext(context);
  vm.runInContext(`${extractFunction(template, 'persistStandardRunAfterStateChange')}; globalThis.persist = persistStandardRunAfterStateChange;`, context);
  context.persist('resolved');
  assert.strictEqual(context.saves, 1, 'Standard state transitions must persist.');
  context.gameMode = 'unlimited';
  context.persist('question');
  assert.strictEqual(context.saves, 1, 'Unlimited must not overwrite Standard save state.');
  context.gameMode = 'standard';
  context.phase15CompletionLocked = true;
  context.persist('complete');
  assert.strictEqual(context.saves, 1, 'Completion/pagehide must not recreate a cleared save.');

  const wordingContext = {};
  vm.createContext(wordingContext);
  vm.runInContext(`${extractFunction(template, 'phase15SkillRecommendation')}; globalThis.recommend = phase15SkillRecommendation;`, wordingContext);
  assert.match(wordingContext.recommend({label:'Elasticity', accuracy:1, timeRatio:1}), /Recheck|limited/);
  assert.match(wordingContext.recommend({label:'Elasticity', accuracy:1, timeRatio:1.5}), /Accuracy was strong.*slower than expected/);
  assert.match(wordingContext.recommend({label:'Elasticity', accuracy:0.5, timeRatio:1}), /Accuracy on this skill needs improvement/);
  assert.match(wordingContext.recommend({label:'Elasticity', accuracy:0.5, timeRatio:1.5}), /Accuracy needs improvement.*slower than expected/);
}

function testMediaAndResumeContracts(){
  MODERN_FILES.forEach(relative => {
    const html = source(relative);
    assert(html.includes('currentQuestion: phase15Clone(currentQuestion, null)'), `${relative} does not save the active question.`);
    assert(html.includes('phase15ResumeLifecyclePending'), `${relative} lacks resume lifecycle routing.`);
    assert(html.includes('runPhase === "boss-summary"'), `${relative} cannot restore a resolved boss summary safely.`);
    assert(html.includes('const beforeAttempts = Number(totalAttempts || 0)'), `${relative} lacks scored-attempt resume guard evidence.`);
  });
  const national = source(NATIONAL_ENGINE);
  assert(national.includes('NATIONAL_PHASE15_SAVE_KEY'));
  assert(national.includes('function continueSavedRun()'));
  assert(national.includes('remediationState: nationalClone(remediationState'));
  assert(national.includes('currentQuestion: nationalClone(currentQuestion'));
  assert(national.includes('artifacts:'));
  assert(national.includes('const legacyState = hasPhase15Save ? null'), 'National Engine lacks legacy gauntletRoom migration.');
  assert(national.includes('nationalResumeBootstrap = true'), 'National Engine resume must suppress duplicate start telemetry.');

  const storage = new Map();
  const legacyContext = {
    NATIONAL_PHASE15_SAVE_KEY:'NationalEngine:standard:save:phase1.5',
    localStorage:{getItem:key => storage.has(key) ? storage.get(key) : null}
  };
  vm.createContext(legacyContext);
  vm.runInContext(`${extractFunction(national, 'hasSavedGame')}; globalThis.hasSave = hasSavedGame;`, legacyContext);
  storage.set('gauntletRoom', '12');
  assert.strictEqual(legacyContext.hasSave(), true, 'National Engine must expose a legacy room save for migration.');
  storage.set('gauntletRoom', '1');
  assert.strictEqual(legacyContext.hasSave(), false, 'Room 1 alone is not meaningful legacy progress.');
}

function testSharedMediaRendererBehavior(){
  const template = source(MODERN_FILES[1]);
  const box = {
    style:{display:'block'},
    children:[],
    appendChild(node){ this.children.push(node); },
    set innerHTML(value){ this.children = []; },
    get innerHTML(){ return ''; }
  };
  const mediaContext = {
    phase15NativeMediaRenderer:null,
    document:{
      getElementById:id => id === 'questionImageBox' ? box : null,
      createElement:tag => ({tag, setAttribute(name, value){ this[name] = value; }})
    }
  };
  vm.createContext(mediaContext);
  vm.runInContext(`${extractFunction(template, 'renderQuestionMedia')}; globalThis.render = renderQuestionMedia;`, mediaContext);
  mediaContext.render({image:'graph.webp', imageAlt:'Supply and demand graph'});
  assert.strictEqual(box.style.display, 'block');
  assert.strictEqual(box.children[0].src, 'graph.webp');
  assert.strictEqual(box.children[0].alt, 'Supply and demand graph');
  assert.strictEqual(box.children[0].role, 'button');
  mediaContext.render({q:'Text-only follow-up'});
  assert.strictEqual(box.style.display, 'none', 'A text-only remediation item must clear stale graph media.');
  assert.strictEqual(box.children.length, 0, 'Stale graph nodes must be removed.');
}

function testArtworkRealmAndAuditOutputs(){
  const addedUnlimited = [
    ...MODERN_FILES.slice(0, 10),
    NATIONAL_ENGINE
  ];
  addedUnlimited.forEach(relative => {
    assert(source(relative).includes('src="unlimited-mode.webp"'), `${relative} lacks canonical Unlimited artwork wiring.`);
  });
  const realm = source('play/economic-realm/index.html');
  assert(/\.game-card\{[\s\S]*?min-height:calc\(100vh - 300px\);[\s\S]*?height:auto;/.test(realm));
  assert(/\.game-card\.restored\{[\s\S]*?height:auto;[\s\S]*?overflow:visible;/.test(realm));

  [
    'PHASE-1.5-PRODUCTION-INVENTORY.md',
    'PHASE-1.5-REMEDIATION-AUDIT.md',
    'PHASE-1.5-MARKET-GATE-CH4-CH6-GRAPH-AUDIT.md'
  ].forEach(relative => assert(fs.existsSync(path.join(REPO_ROOT, relative)), `Missing ${relative}.`));
  const remediation = source('PHASE-1.5-REMEDIATION-AUDIT.md');
  assert(remediation.includes('## Item-Level Audit'));
  assert(remediation.includes('The Market Gate'));
  assert(remediation.includes('REMEDIATION CONTENT GAP'));
}

function testExcludedMicroUntouched(){
  [
    'play/micro-domains/strategic-vault',
    'play/micro-domains/the-foundry',
    'play/micro-domains/dominion-of-power'
  ].forEach(relative => assert(!fs.existsSync(path.join(REPO_ROOT, relative)), `${relative} unexpectedly exists as a playable upgraded engine.`));
  const hub = source('play/micro-domains/index.html');
  assert(hub.includes('available: false'));
  assert(hub.includes('Strategic Vault') && hub.includes('The Foundry') && hub.includes('Dominion of Power'));
}

testCompileAndArchitecture();
testClockSemantics();
testSaveIsolationAndWording();
testMediaAndResumeContracts();
testSharedMediaRendererBehavior();
testArtworkRealmAndAuditOutputs();
testExcludedMicroUntouched();

console.log(JSON.stringify({
  ok:true,
  htmlTargets:ALL_ENGINE_FILES.length,
  games:14,
  templates:2,
  checks:['syntax','save-resume','legacy save migration','double-score lifecycle','elapsed/offline/hidden time','completion freeze','mode isolation','media','mastery wording','artwork','realm re-entry','audits','Micro exclusions']
}, null, 2));
