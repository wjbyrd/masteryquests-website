'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const Core = require(path.join(root, 'composer-core.js'));
const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data/composer_library.js'), 'utf8'), context);
const library = context.window.MQ_COMPOSER_LIBRARY;

const EXPECTED_PROTECTED_HASHES = {
  'data/composer_library.js': '3cd84a004f9d96404210baa60bdddcb8a1b29febb4881231ce83382b40581b64',
  'data/composer_library_manifest.json': '5dd2a359d7f6ddebba6af82f4c5a67e0a192e3bd0ce89aca82f873a96520290b',
  'data/composer_registry.json': '090f6d4c91eb00a3484e13b0b9942f0dd7038bc705bac2a8d32206b6c89fd416',
  'template/mastery-quests-faculty-template-composer-ready.html': '614b33cd7d7d05fc5516270d6883aff292bf315fbf181f751aa4184baadf2bb3'
};

function sha256File(relativePath){
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');
}

function ids(items){
  return [...new Set((items || []).map(Core.idOf))].sort();
}

function routeIds(routes){
  return Object.fromEntries(Object.entries(routes || {}).sort().map(([key, questions]) => [key, ids(questions)]));
}

function globalSnapshot(composition){
  return {
    globalBanks: Object.fromEntries(
      ['easy', 'medium', 'hard', 'elite', 'legendary', 'legendaryBoss']
        .map(pool => [pool, ids(composition.banks[pool])])
    ),
    repairQuestions: ids(composition.repairQuestions),
    bridgeQuestions: ids(composition.bridgeQuestions),
    repairRoutes: routeIds(composition.microSkillRepairPools),
    repairSeedRoutes: routeIds(composition.skillRepairSeedPools),
    bridgeRoutes: routeIds(composition.microSkillBridgePools),
    assetPaths: composition.assets.map(asset => asset.runtimePath).sort(),
    counts: {
      calculation: composition.counts.calculation,
      integration: composition.counts.integration,
      repair: composition.counts.repair,
      repairSeed: composition.counts.repairSeed,
      bridge: composition.counts.bridge
    }
  };
}

function equalJson(left, right){
  return JSON.stringify(left) === JSON.stringify(right);
}

function test(name, passed, details = {}){
  return {name, passed: Boolean(passed), details};
}

const results = [];

const protectedHashResults = Object.fromEntries(
  Object.entries(EXPECTED_PROTECTED_HASHES).map(([file, expected]) => {
    const actual = sha256File(file);
    return [file, {expected, actual, passed: expected === actual}];
  })
);
results.push(test(
  'Protected library and template files unchanged',
  Object.values(protectedHashResults).every(result => result.passed),
  protectedHashResults
));

const recipeFiles = fs.readdirSync(path.join(root, 'tests/recipes'))
  .filter(name => name.endsWith('.json'))
  .sort();
const recipeResults = [];
for(const file of recipeFiles){
  const recipe = JSON.parse(fs.readFileSync(path.join(root, 'tests/recipes', file), 'utf8'));
  const composition = Core.compose(library, recipe);
  const bossDifficultyChecks = {
    easyBoss: composition.banks.easyBoss.every(question => Core.bossDifficulty(question) === 'easy'),
    mediumBoss: composition.banks.mediumBoss.every(question => Core.bossDifficulty(question) === 'medium'),
    finalBoss: composition.banks.finalBoss.every(question => Core.bossDifficulty(question) === 'hard')
  };
  recipeResults.push({
    file,
    passed: composition.errors.length === 0 && Object.values(bossDifficultyChecks).every(Boolean),
    errors: composition.errors,
    bossDifficultyChecks,
    counts: composition.counts
  });
}
results.push(test(
  'Eight legacy Phase 4.4 recipes migrate and pass',
  recipeResults.length === 8 && recipeResults.every(result => result.passed),
  {recipes: recipeResults}
));

const userRecipe = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/legacy-user-generated-recipe.json'), 'utf8'));
const legacyBaseline = JSON.parse(fs.readFileSync(path.join(root, 'tests/static/phase4_4a_legacy_global_baseline.json'), 'utf8'));
const userComposition = Core.compose(library, userRecipe);
const userGlobal = globalSnapshot(userComposition);
const baselineGlobal = {
  globalBanks: legacyBaseline.globalBanks,
  repairQuestions: legacyBaseline.repairQuestions,
  bridgeQuestions: legacyBaseline.bridgeQuestions,
  repairRoutes: legacyBaseline.repairRoutes,
  repairSeedRoutes: legacyBaseline.repairSeedRoutes,
  bridgeRoutes: legacyBaseline.bridgeRoutes,
  assetPaths: legacyBaseline.assetPaths,
  counts: legacyBaseline.counts
};
results.push(test(
  'Global ordinary and auxiliary canonical-ID sets preserved',
  equalJson(userGlobal, baselineGlobal),
  {
    beforeCounts: Object.fromEntries(Object.entries(legacyBaseline.globalBanks).map(([pool, values]) => [pool, values.length])),
    afterCounts: Object.fromEntries(Object.entries(userGlobal.globalBanks).map(([pool, values]) => [pool, values.length])),
    auxiliaryCounts: userGlobal.counts
  }
));

const canonicalUserRecipe = Core.canonicalRecipe(userRecipe, library);
const narrowedRecipe = JSON.parse(JSON.stringify(canonicalUserRecipe));
narrowedRecipe.checkpointFocus = {
  checkpointOne: [],
  checkpointTwo: ['demand'],
  finalCheckpoint: []
};
const narrowedComposition = Core.compose(library, narrowedRecipe);
results.push(test(
  'Checkpoint focus changes only checkpoint boss pools',
  equalJson(globalSnapshot(userComposition), globalSnapshot(narrowedComposition)),
  {
    automaticBossCounts: {
      easyBoss: userComposition.counts.easyBoss,
      mediumBoss: userComposition.counts.mediumBoss,
      finalBoss: userComposition.counts.finalBoss
    },
    narrowedBossCounts: {
      easyBoss: narrowedComposition.counts.easyBoss,
      mediumBoss: narrowedComposition.counts.mediumBoss,
      finalBoss: narrowedComposition.counts.finalBoss
    }
  }
));

const userModeStatus = Object.fromEntries(userComposition.validation.modes.map(mode => [mode.mode, mode.ok]));
const migrationNotes = userComposition.warnings.filter(warning =>
  warning.type === 'recipe-migration' || warning.type === 'legacy-boss-mismatch'
);
results.push(test(
  'Uploaded game is blocked only for missing real final-boss coverage',
  userComposition.counts.easyBoss === 21
    && userComposition.counts.mediumBoss === 12
    && userComposition.counts.finalBoss === 0
    && userModeStatus.standard === false
    && userModeStatus.timed === true
    && userModeStatus.exam === true
    && userModeStatus.legendary === true
    && userModeStatus.score === false
    && migrationNotes.length >= 2,
  {
    bossCounts: {
      easyBoss: userComposition.counts.easyBoss,
      mediumBoss: userComposition.counts.mediumBoss,
      finalBoss: userComposition.counts.finalBoss
    },
    modeStatus: userModeStatus,
    errors: userComposition.errors,
    migrationNotes
  }
));

const multiConceptId = Object.keys(library.concepts).find(id =>
  Core.CHECKPOINT_ORDER.filter(checkpointKey =>
    Core.bossQuestionsForCheckpoint(library.concepts[id], checkpointKey).length > 0
  ).length > 1
);
const multiRecipe = {
  schemaVersion: Core.RECIPE_SCHEMA_VERSION,
  title: 'Multi-Checkpoint Focus Test',
  slug: 'multi-checkpoint-focus-test',
  supportedModes: ['timed'],
  selectedConceptIds: [...userRecipe.selectedConceptIds, multiConceptId],
  checkpointFocus: {
    checkpointOne: [multiConceptId],
    checkpointTwo: [multiConceptId],
    finalCheckpoint: [multiConceptId]
  }
};
const multiComposition = Core.compose(library, multiRecipe);
results.push(test(
  'One concept can support multiple checkpoint pools without relabeling questions',
  Boolean(multiConceptId)
    && multiComposition.errors.length === 0
    && multiComposition.banks.easyBoss.every(question => Core.bossDifficulty(question) === 'easy')
    && multiComposition.banks.mediumBoss.every(question => Core.bossDifficulty(question) === 'medium')
    && multiComposition.banks.finalBoss.every(question => Core.bossDifficulty(question) === 'hard')
    && multiComposition.counts.easyBoss > 0
    && multiComposition.counts.mediumBoss > 0
    && multiComposition.counts.finalBoss > 0,
  {
    conceptId: multiConceptId,
    counts: {
      easyBoss: multiComposition.counts.easyBoss,
      mediumBoss: multiComposition.counts.mediumBoss,
      finalBoss: multiComposition.counts.finalBoss
    }
  }
));

const canonicalLegacy = Core.canonicalRecipe(userRecipe, library);
results.push(test(
  'Legacy recipe exports as schema 1.2 with automatic checkpoint focus',
  canonicalLegacy.schemaVersion === Core.RECIPE_SCHEMA_VERSION
    && !('stages' in canonicalLegacy)
    && Core.CHECKPOINT_ORDER.every(checkpointKey => canonicalLegacy.checkpointFocus[checkpointKey] === null),
  {canonicalRecipe: canonicalLegacy}
));

const summary = {
  composerVersion: Core.COMPOSER_VERSION,
  recipeSchemaVersion: Core.RECIPE_SCHEMA_VERSION,
  generatedAt: new Date().toISOString(),
  tests: results,
  allPassed: results.every(result => result.passed)
};

fs.writeFileSync(
  path.join(root, 'phase4_4a_targeted_validation_results.json'),
  JSON.stringify(summary, null, 2) + '\n'
);
console.log(JSON.stringify(summary, null, 2));
if(!summary.allPassed) process.exit(1);
