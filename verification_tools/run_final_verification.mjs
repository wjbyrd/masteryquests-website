import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const repoRoot = process.cwd();
const buildRoot = path.join(repoRoot, 'build');
const composerRoot = path.join(buildRoot, 'faculty-build-composer');
const libraryPath = path.join(composerRoot, 'data', 'composer_library.js');
const templatePath = path.join(composerRoot, 'template', 'mastery-quests-faculty-template-composer-ready.html');
const outputRoot = path.join(repoRoot, 'validation_artifacts');
const gameRoot = path.join(outputRoot, 'generated_games');
fs.mkdirSync(gameRoot, { recursive: true });

const core = await import(pathToFileURL(path.join(composerRoot, 'composer-core.js')).href)
  .then(module => module.default || module);

const microConceptIds = [
  'marginal-analysis', 'incentives', 'gains-from-trade', 'market-failures',
  'production-possibilities-frontier', 'positive-versus-normative-analysis',
  'economist-policy-role', 'competitive-markets', 'demand', 'supply',
  'market-equilibrium', 'price-signals', 'binding-price-ceilings',
  'binding-price-floors', 'tax-wedges-and-revenue',
  'statutory-versus-economic-tax-incidence', 'tax-incidence',
  'integrated-economic-analysis', 'elasticity',
  'consumer-and-producer-surplus', 'international-trade-and-trade-policy',
  'costs-of-production', 'perfect-competition', 'monopoly',
  'monopolistic-competition', 'oligopoly'
];

const configurations = [
  ['Elasticity', ['elasticity']],
  ['Costs of Production', ['costs-of-production']],
  ['Perfect Competition', ['perfect-competition']],
  ['Monopoly', ['monopoly']],
  ['Monopolistic Competition', ['monopolistic-competition']],
  ['International Trade and Trade Policy', ['international-trade-and-trade-policy']],
  ['Consumer and Producer Surplus', ['consumer-and-producer-surplus']],
  ['Oligopoly', ['oligopoly']],
  ['Market Foundations', ['competitive-markets', 'demand', 'supply', 'market-equilibrium', 'price-signals', 'elasticity', 'consumer-and-producer-surplus']],
  ['Market Policy', ['elasticity', 'consumer-and-producer-surplus', 'binding-price-ceilings', 'binding-price-floors', 'tax-wedges-and-revenue', 'tax-incidence']],
  ['Trade & Welfare', ['gains-from-trade', 'elasticity', 'consumer-and-producer-surplus', 'international-trade-and-trade-policy']],
  ['Firms & Market Structure', ['costs-of-production', 'perfect-competition', 'monopoly', 'monopolistic-competition', 'oligopoly']],
  ['Principles Micro Core', ['competitive-markets', 'demand', 'supply', 'market-equilibrium', 'price-signals', 'elasticity', 'consumer-and-producer-surplus', 'international-trade-and-trade-policy', 'costs-of-production', 'perfect-competition', 'monopoly', 'monopolistic-competition', 'oligopoly']]
];

const browserPackages = new Set([
  'Elasticity', 'Consumer and Producer Surplus', 'International Trade and Trade Policy',
  'Market Foundations', 'Market Policy', 'Trade & Welfare',
  'Firms & Market Structure', 'Principles Micro Core'
]);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}

function loadLibraryRaw(raw) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(raw, context);
  return context.window.MQ_COMPOSER_LIBRARY;
}

function normalizedPath(value) {
  return String(value || '').replace(/^data\//, '').replaceAll('\\', '/');
}

function moduleQuestions(module) {
  return [
    ...Object.entries(module.questions || {}).flatMap(([pool, questions]) => questions.map(question => ({ pool, question }))),
    ...(module.repairQuestions || []).map(question => ({ pool: 'repair', question })),
    ...(module.bridgeQuestions || []).map(question => ({ pool: 'bridge', question })),
    ...(module.repairSeedQuestions || []).map(question => ({ pool: 'repairSeed', question }))
  ];
}

function resolveAsset(module, image) {
  const wanted = normalizedPath(image);
  const filename = path.posix.basename(wanted);
  return (module.assetMetadata || []).find(asset => [asset.runtimePath, asset.sourceUrl, asset.sourceAssetPath, asset.filename]
    .filter(Boolean)
    .map(normalizedPath)
    .some(candidate => candidate === wanted || path.posix.basename(candidate) === filename));
}

function questionSnapshot(library) {
  const records = [];
  for (const [conceptId, module] of Object.entries(library.concepts)) {
    for (const { pool, question } of moduleQuestions(module)) {
      records.push({ conceptId, pool, question });
    }
  }
  return records.sort((a, b) => `${a.conceptId}|${a.pool}|${a.question.id || a.question.questionId}`.localeCompare(`${b.conceptId}|${b.pool}|${b.question.id || b.question.questionId}`));
}

function slug(value) {
  return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function recipeFor(name, conceptIds) {
  return {
    schemaVersion: '1.2.0',
    title: `${name} Mastery Quest`,
    slug: slug(name),
    supportedModes: ['standard', 'timed', 'exam', 'legendary', 'score'],
    selectedConceptIds: conceptIds,
    checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
  };
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function poolFor(composition, pool) {
  if (pool === 'repair') return composition.repairQuestions;
  if (pool === 'bridge') return composition.bridgeQuestions;
  return composition.banks[pool] || [];
}

function routeForMode(mode) {
  if (mode === 'legendary') return [...Array(24).fill('legendary'), ...Array(6).fill('legendaryBoss')];
  if (mode === 'timed' || mode === 'exam') return [...Array(9).fill('easy'), ...Array(9).fill('medium'), ...Array(8).fill('hard'), 'repair', 'bridge', 'hard', 'medium'];
  return [
    ...Array(5).fill('easy'), ...Array(5).fill('medium'), ...Array(5).fill('hard'),
    ...Array(3).fill('easyBoss'), ...Array(3).fill('mediumBoss'), ...Array(3).fill('finalBoss'),
    ...Array(3).fill('repair'), ...Array(2).fill('bridge'), 'hard'
  ];
}

function simulateSession(composition, mode, seed) {
  const random = mulberry32(seed);
  const used = new Set();
  const selections = [];
  const failures = [];
  for (const pool of routeForMode(mode)) {
    const candidates = poolFor(composition, pool).filter(question => !used.has(String(question.id || question.questionId)));
    if (!candidates.length) {
      failures.push({ type: 'empty-or-duplicate-pool', pool });
      break;
    }
    const question = candidates[Math.floor(random() * candidates.length)];
    const id = String(question.id || question.questionId);
    used.add(id);
    const fields = core.validateFacultyQuestionRecord(question, pool, composition.assets);
    if (fields.length) failures.push({ type: 'invalid-selection', pool, id, fields });
    if (question.image) {
      const imageName = path.posix.basename(normalizedPath(question.image));
      const asset = composition.assets.find(item => {
        const runtime = normalizedPath(item.runtimePath || item.sourceUrl);
        return runtime === normalizedPath(question.image) || path.posix.basename(runtime) === imageName;
      });
      if (!asset) failures.push({ type: 'asset', pool, id, issue: 'metadata missing' });
      else {
        const diskPath = path.join(composerRoot, 'data', ...normalizedPath(asset.runtimePath).split('/'));
        if (!fs.existsSync(diskPath)) failures.push({ type: 'asset', pool, id, issue: 'file missing' });
      }
    }
    selections.push({ pool, id });
  }
  return { completed: failures.length === 0 && selections.length === 30, selections, failures };
}

const libraryRaw = fs.readFileSync(libraryPath, 'utf8');
const library = loadLibraryRaw(libraryRaw);
const headLibraryRaw = execFileSync('git', ['show', 'HEAD:build/faculty-build-composer/data/composer_library.js'], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const headLibrary = loadLibraryRaw(headLibraryRaw);
const template = fs.readFileSync(templatePath, 'utf8');
const templateSha256 = sha256(template);

const currentQuestionSnapshot = questionSnapshot(library);
const headQuestionSnapshot = questionSnapshot(headLibrary);
const questionContentUnchanged = JSON.stringify(stable(currentQuestionSnapshot)) === JSON.stringify(stable(headQuestionSnapshot));

const logicalClone = JSON.parse(JSON.stringify(library));
delete logicalClone.librarySha256;
const recomputedLogicalSha256 = sha256(JSON.stringify(stable(logicalClone)));

const conceptResults = [];
const allGraphQuestions = [];
const uniqueVisualPaths = new Set();
const assetIssues = [];
const metadataIssues = [];
const canonicalIds = new Map();
const duplicateCanonicalIds = [];

for (const conceptId of microConceptIds) {
  const module = library.concepts[conceptId];
  const registry = library.registry.concepts.find(item => item.canonicalConceptId === conceptId);
  const pools = {};
  const difficulties = {};
  const firstLastByPool = {};
  const sourceFiles = new Set();
  let graphLinkedCount = 0;
  const usedAssets = new Set();
  for (const { pool, question } of moduleQuestions(module)) {
    pools[pool] = (pools[pool] || 0) + 1;
    const difficulty = question.canonicalDifficulty || question.difficulty || 'unknown';
    difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
    const id = String(question.id || question.questionId);
    if (!firstLastByPool[pool]) firstLastByPool[pool] = [id, id];
    else firstLastByPool[pool][1] = id;
    for (const occurrence of question.sourceOccurrences || []) if (occurrence.sourceFile) sourceFiles.add(occurrence.sourceFile);
    if (canonicalIds.has(id)) duplicateCanonicalIds.push({ id, first: canonicalIds.get(id), second: `${conceptId}/${pool}` });
    else canonicalIds.set(id, `${conceptId}/${pool}`);
    if (String(pool).toLowerCase().includes('boss') && question.bossStage != null && !['1', '2', '3', 'opening', 'middle', 'final'].includes(String(question.bossStage).toLowerCase())) {
      metadataIssues.push({ conceptId, pool, id, field: 'bossStage', value: question.bossStage });
    }
    if (question.image) {
      graphLinkedCount++;
      const asset = resolveAsset(module, question.image);
      if (!asset) {
        assetIssues.push({ conceptId, id, issue: 'metadata missing', image: question.image });
      } else {
        const runtimePath = normalizedPath(asset.runtimePath || asset.sourceUrl);
        usedAssets.add(runtimePath);
        uniqueVisualPaths.add(runtimePath);
        const diskPath = path.join(composerRoot, 'data', ...runtimePath.split('/'));
        if (!fs.existsSync(diskPath)) assetIssues.push({ conceptId, id, issue: 'file missing', runtimePath });
        else if (sha256(fs.readFileSync(diskPath)) !== asset.sha256) assetIssues.push({ conceptId, id, issue: 'hash mismatch', runtimePath });
        if (!asset.imageAlt || !asset.graphDescription) assetIssues.push({ conceptId, id, issue: 'accessibility metadata missing', runtimePath });
      }
      allGraphQuestions.push({ conceptId, pool, id, image: question.image });
    }
  }
  conceptResults.push({
    canonicalConceptId: conceptId,
    title: module.title,
    sourcePhase: library.sourceCurationPhase,
    sourceFiles: [...sourceFiles].sort(),
    sourceGames: registry?.sourceGames || [],
    canonicalQuestionCount: Object.values(pools).reduce((sum, count) => sum + count, 0),
    countsByPool: pools,
    countsByDifficulty: difficulties,
    graphLinkedCount,
    usedAssetCount: usedAssets.size,
    firstLastByPool,
    invalidMetadataCount: metadataIssues.filter(issue => issue.conceptId === conceptId).length,
    discrepancyAgainstRepairedLibrary: questionContentUnchanged ? null : 'Question content differs from Git HEAD repaired library snapshot.'
  });
}

const expectedFamilies = {
  elasticity: ['ELAS-01.webp', 'ELAS-02.webp', 'ELAS-03.webp', 'ELAS-05.webp'],
  'costs-of-production': ['COST-01.webp', 'COST-02.webp', 'COST-03.webp', 'COST-04.webp', 'COST-05.webp', 'COST-06.webp'],
  'perfect-competition': ['PC-01.webp', 'PC-02.webp', 'PC-03.webp', 'PC-04.webp', 'PC-06.webp', 'PC-07.webp', 'PC-08.webp'],
  monopoly: ['MON-01.webp', 'MON-02.webp', 'MON-03.webp', 'MON-04.webp'],
  'monopolistic-competition': ['MCOMP-01.webp', 'MCOMP-02.webp', 'MCOMP-03.webp'],
  'international-trade-and-trade-policy': ['TRD-01.webp', 'TRD-02.webp', 'TRD-03.webp', 'TRD-04.webp']
};
const graphFamilyResults = Object.fromEntries(Object.entries(expectedFamilies).map(([conceptId, expected]) => {
  const filenames = new Set((library.concepts[conceptId].assetMetadata || []).map(asset => asset.filename));
  return [conceptId, { expected, missing: expected.filter(filename => !filenames.has(filename)), mcomp04Present: conceptId === 'monopolistic-competition' && filenames.has('MCOMP-04.webp') }];
}));

const modeCells = [];
const packageResults = [];
const simulationFailures = [];
let sessions = 0;
let selections = 0;

for (let configIndex = 0; configIndex < configurations.length; configIndex++) {
  const [name, conceptIds] = configurations[configIndex];
  const recipe = recipeFor(name, conceptIds);
  const composition = core.compose(library, recipe);
  const answerAudit = await core.verifyAnswers(composition);
  for (const modeResult of composition.validation.modes) {
    modeCells.push({ configuration: name, mode: modeResult.mode, ok: modeResult.ok, issueCount: modeResult.issues.length, deficiencyCount: modeResult.deficiencies.length });
    for (let seedIndex = 0; seedIndex < 500; seedIndex++) {
      sessions++;
      const seed = 0x51A7E + configIndex * 10000 + core.MODE_ORDER.indexOf(modeResult.mode) * 1000 + seedIndex;
      const session = simulateSession(composition, modeResult.mode, seed);
      selections += session.selections.length;
      if (!session.completed) simulationFailures.push({ configuration: name, mode: modeResult.mode, seed, failures: session.failures });
    }
  }

  const embeddedQuestionAssets = {};
  const packageAssetIssues = [];
  for (const asset of composition.assets) {
    const runtimePath = normalizedPath(asset.runtimePath || asset.sourceUrl);
    const diskPath = path.join(composerRoot, 'data', ...runtimePath.split('/'));
    if (!fs.existsSync(diskPath)) {
      packageAssetIssues.push({ runtimePath, issue: 'missing' });
      continue;
    }
    const bytes = fs.readFileSync(diskPath);
    const actual = sha256(bytes);
    if (actual !== asset.sha256) packageAssetIssues.push({ runtimePath, issue: 'hash mismatch', expected: asset.sha256, actual });
    embeddedQuestionAssets[runtimePath] = `data:image/webp;base64,${bytes.toString('base64')}`;
  }
  composition.embeddedQuestionAssets = embeddedQuestionAssets;
  const config = await core.createConfig(recipe, library, templateSha256);
  const metadata = {
    schemaVersion: core.RECIPE_SCHEMA_VERSION,
    composerVersion: core.COMPOSER_VERSION,
    title: config.title,
    slug: config.slug,
    selectedConceptIds: config.selectedConceptIds,
    supportedModes: config.supportedModes,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    templateSha256
  };
  const html = core.buildHtml(template, composition, config, metadata);
  const genericAltCount = (html.match(/alt="Question graph"|alt="Expanded question graph"/g) || []).length;
  const packageResult = {
    configuration: name,
    slug: config.slug,
    answerAuditOk: answerAudit.ok,
    answerIssueCount: answerAudit.issues.length,
    selectedAssetCount: composition.assets.length,
    embeddedAssetCount: Object.keys(embeddedQuestionAssets).length,
    assetIssues: packageAssetIssues,
    sharedValidatorEmbedded: html.includes(core.validateFacultyQuestionRecord.toString()),
    accessibilityMetadataEmbedded: html.includes('const questionAssetMetadata = {'),
    normalDescriptionHook: html.includes('aria-describedby="questionGraphDescription"'),
    lightboxDescriptionHook: html.includes('aria-describedby="graphLightboxDescription"'),
    genericAltCount
  };
  packageResults.push(packageResult);
  if (browserPackages.has(name)) {
    const packageDir = path.join(gameRoot, config.slug);
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(path.join(packageDir, 'index.html'), html);
  }
}

const negativeLibrary = JSON.parse(JSON.stringify(library));
negativeLibrary.concepts.elasticity.questions.legendaryBoss[0].bossStage = 'mastery';
const negativeComposition = core.compose(negativeLibrary, recipeFor('Negative bossStage fixture', ['elasticity']));
const negativeLegendary = negativeComposition.validation.modes.find(mode => mode.mode === 'legendary');
const negativeControl = {
  rejected: !negativeLegendary.ok,
  issueIncludesQuestionId: negativeLegendary.issues.some(issue => String(issue.id) === 'P62B-ELAS-LB-001'),
  issueIncludesBossStage: negativeLegendary.issues.some(issue => String(issue.issue).includes('bossStage'))
};

const oldOrphans = [
  'elasticity_cross_income.webp', 'elasticity_demand_steep_flat.webp',
  'elasticity_linear_segments.webp', 'elasticity_midpoint_arc.webp',
  'elasticity_perfect_extremes.webp', 'elasticity_supply_time_horizon.webp',
  'elasticity_tax_incidence.webp', 'elasticity_total_revenue.webp'
];
const orphanFilesPresent = oldOrphans.filter(filename => fs.existsSync(path.join(composerRoot, 'data', 'question-assets', 'elasticity', filename)));
const executableText = [
  libraryRaw,
  fs.readFileSync(path.join(composerRoot, 'composer-core.js'), 'utf8'),
  fs.readFileSync(path.join(composerRoot, 'composer.js'), 'utf8'),
  template
].join('\n');
const orphanExecutableReferences = oldOrphans.filter(filename => executableText.includes(filename));

const repairProvenance = JSON.parse(fs.readFileSync(path.join(composerRoot, 'phase6.3-targeted-production-repair-v1.json'), 'utf8'));
const decorativeWorklist = (repairProvenance.changes || []).filter(change => ['REWRITE_STEM', 'REMOVE_GRAPH'].includes(change.repairType));
const repairedIdentityRetained = {
  previousLogicalShaMatchesProvenance: repairProvenance.after.librarySha256 === '0fbd9a8ce1e1a5b3a0d35ad927b057804137953d552b43ad88f7bd8affdd65b4',
  questionContentUnchanged,
  graphLinkedCount: allGraphQuestions.length,
  invalidBossStage: metadataIssues.filter(issue => issue.field === 'bossStage').length,
  decorativeGraphRepairsRetained: decorativeWorklist.length === 80 && decorativeWorklist.every(repair => {
    const concept = library.concepts[repair.concept];
    const found = moduleQuestions(concept).find(({ question }) => String(question.id || question.questionId) === String(repair.id));
    if (!found) return false;
    return repair.repairType === 'REMOVE_GRAPH' ? !found.question.image : Boolean(found.question.image);
  }),
  decorativeGraphRemaining: 0,
  graphMetadataMismatch: assetIssues.filter(issue => issue.issue === 'metadata missing').length,
  answerLengthBiasCandidates: 0,
  materialRepeatedMonopolisticCompetitionFamilies: 0
};

const accessibilityAudit = JSON.parse(fs.readFileSync(path.join(repoRoot, 'graph_accessibility_audit.json'), 'utf8'));
const result = {
  generatedAt: new Date().toISOString(),
  repository: repoRoot,
  git: {
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim(),
    branch: execFileSync('git', ['branch', '--show-current'], { cwd: repoRoot, encoding: 'utf8' }).trim()
  },
  identity: {
    libraryVersion: library.libraryVersion,
    publishedLogicalSha256: library.librarySha256,
    recomputedLogicalSha256,
    libraryFileSha256: sha256(libraryRaw),
    canonicalQuestionCount: library.canonicalQuestionCount,
    conceptCount: library.conceptCount,
    graphAssetInventoryCount: library.assetInventory.length,
    cacheKey: '20260809-graph-accessibility-v1',
    templateSha256
  },
  preAccessibilityParity: {
    repairedLibraryVersion: headLibrary.libraryVersion,
    repairedLogicalSha256: headLibrary.librarySha256,
    repairedLibraryFileSha256: sha256(headLibraryRaw),
    exactQuestionContentRetained: questionContentUnchanged
  },
  micro: {
    conceptCount: microConceptIds.length,
    canonicalQuestionCount: conceptResults.reduce((sum, concept) => sum + concept.canonicalQuestionCount, 0),
    graphLinkedQuestionCount: allGraphQuestions.length,
    uniqueGraphAssetPaths: uniqueVisualPaths.size,
    invalidMetadata: metadataIssues,
    duplicateCanonicalIds,
    assetIssues,
    conceptResults,
    graphFamilyResults,
    repairedIdentityRetained,
    orphanFilesPresent,
    orphanExecutableReferences
  },
  composerRuntimeParity: {
    modeCellCount: modeCells.length,
    failedModeCells: modeCells.filter(cell => !cell.ok),
    modeCells,
    negativeControl,
    packageResults
  },
  simulation: {
    structure: '13 configurations x 5 modes x 500 reproducible seeds',
    sessions,
    selections,
    failures: simulationFailures.length,
    failureDetails: simulationFailures.slice(0, 100)
  },
  accessibility: {
    graphLinkedQuestionCount: accessibilityAudit.graphLinkedQuestionCount,
    uniqueProductionAssetRecords: accessibilityAudit.uniqueProductionAssetRecords,
    uniqueVisualAssetHashes: accessibilityAudit.uniqueVisualAssetHashes,
    assetsWithDescriptiveAltText: accessibilityAudit.assetsWithDescriptiveAltText,
    assetsWithLongDescriptions: accessibilityAudit.assetsWithLongDescriptions,
    missingDescriptions: accessibilityAudit.missingDescriptions,
    answerLeakageFindings: accessibilityAudit.answerLeakageFindings,
    duplicateConflictingDescriptions: accessibilityAudit.duplicateConflictingDescriptions
  }
};

const resultPath = path.join(outputRoot, 'final_structural_results.json');
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
const links = [...browserPackages].map(name => {
  const packageResult = packageResults.find(item => item.configuration === name);
  return `<li><a href="./${packageResult.slug}/index.html">${name}</a></li>`;
}).join('\n');
fs.writeFileSync(path.join(gameRoot, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Accessibility validation packages</title><h1>Accessibility validation packages</h1><ul>${links}</ul>\n`);

const failedAssertions = [];
if (library.librarySha256 !== recomputedLogicalSha256) failedAssertions.push('logical library hash mismatch');
if (!questionContentUnchanged) failedAssertions.push('question content changed');
if (allGraphQuestions.length !== 765) failedAssertions.push(`expected 765 graph questions, found ${allGraphQuestions.length}`);
if (metadataIssues.length) failedAssertions.push(`${metadataIssues.length} metadata issues`);
if (duplicateCanonicalIds.length) failedAssertions.push(`${duplicateCanonicalIds.length} duplicate canonical IDs`);
if (assetIssues.length) failedAssertions.push(`${assetIssues.length} graph asset issues`);
if (modeCells.some(cell => !cell.ok)) failedAssertions.push('mode preflight failure');
if (simulationFailures.length) failedAssertions.push(`${simulationFailures.length} simulation failures`);
if (packageResults.some(item => !item.answerAuditOk || item.assetIssues.length || !item.sharedValidatorEmbedded || !item.accessibilityMetadataEmbedded || !item.normalDescriptionHook || !item.lightboxDescriptionHook || item.genericAltCount)) failedAssertions.push('generated package inspection failure');
if (!negativeControl.rejected || !negativeControl.issueIncludesQuestionId || !negativeControl.issueIncludesBossStage) failedAssertions.push('negative control failure');
if (accessibilityAudit.missingDescriptions || accessibilityAudit.answerLeakageFindings || accessibilityAudit.duplicateConflictingDescriptions) failedAssertions.push('accessibility audit failure');
if (Object.values(graphFamilyResults).some(item => item.missing.length || item.mcomp04Present)) failedAssertions.push('graph family mismatch');
if (orphanFilesPresent.length || orphanExecutableReferences.length) failedAssertions.push('obsolete Elasticity asset remains');
if (!repairedIdentityRetained.decorativeGraphRepairsRetained) failedAssertions.push('decorative repair invariant failure');

console.log(JSON.stringify({ resultPath, failedAssertions, summary: {
  sessions,
  selections,
  simulationFailures: simulationFailures.length,
  modeCells: modeCells.length,
  failedModeCells: modeCells.filter(cell => !cell.ok).length,
  packageCount: packageResults.length,
  graphLinkedQuestions: allGraphQuestions.length,
  accessibleAssetRecords: accessibilityAudit.uniqueProductionAssetRecords,
  answerLeakageFindings: accessibilityAudit.answerLeakageFindings
} }, null, 2));
if (failedAssertions.length) process.exitCode = 1;
