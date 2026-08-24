'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const COMPOSER_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(COMPOSER_ROOT, '..', '..');
const CORE_PATH = path.join(COMPOSER_ROOT, 'composer-core.js');
const TEMPLATE_PATH = path.join(
  COMPOSER_ROOT,
  'template',
  'mastery-quests-faculty-template-composer-ready.html'
);
const LIBRARY_PATH = path.join(COMPOSER_ROOT, 'data', 'composer_library.js');
const CONCEPT_REVIEW_MANIFEST_PATH = path.join(
  COMPOSER_ROOT,
  'data',
  'concept-reviews',
  'manifest.json'
);
const CONCEPT_REVIEW_RUNTIME_PATH = path.join(COMPOSER_ROOT, 'concept-review-runtime.js');

function readText(filePath){
  return fs.readFileSync(filePath, 'utf8');
}

function loadComposerLibrary(){
  const source = readText(LIBRARY_PATH).trim();
  const prefix = 'window.MQ_COMPOSER_LIBRARY=';
  if(!source.startsWith(prefix) || !source.endsWith(';')){
    throw new Error('Unexpected Composer library wrapper.');
  }
  return JSON.parse(source.slice(prefix.length, -1));
}

function loadCanonicalTemplate(){
  return readText(TEMPLATE_PATH);
}

function loadConceptReviewManifest(){
  return JSON.parse(readText(CONCEPT_REVIEW_MANIFEST_PATH));
}

function getCanonicalComposerVersion(){
  const source = readText(CORE_PATH);
  const match = source.match(/\bconst\s+COMPOSER_VERSION\s*=\s*(['"])([^'"]+)\1\s*;/);
  if(!match){
    throw new Error('Could not determine the canonical Composer version from composer-core.js.');
  }
  return match[2];
}

function assertCanonicalCoreVersion(core){
  const expected = getCanonicalComposerVersion();
  assert.strictEqual(
    core.COMPOSER_VERSION,
    expected,
    'Exported Composer version must match the canonical composer-core.js declaration.'
  );
  return expected;
}

function generatedComposerVersions(html){
  return [...String(html).matchAll(/["']composerVersion["']\s*:\s*["']([^"']+)["']/g)]
    .map(match => match[1]);
}

function assertGeneratedComposerVersion(html, expectedVersion = getCanonicalComposerVersion()){
  const versions = generatedComposerVersions(html);
  assert(versions.length > 0, 'Generated HTML does not expose Composer version metadata.');
  assert(
    versions.every(version => version === expectedVersion),
    `Generated Composer version mismatch: expected ${expectedVersion}, found ${[...new Set(versions)].join(', ')}.`
  );
  return versions;
}

function attachConceptReviewRuntime(core, composition, library, selectedConceptIds, manifest = loadConceptReviewManifest()){
  const validation = core.validateConceptReviewManifest(library, manifest);
  if(!validation.ok){
    throw new Error(`Invalid canonical Concept Review manifest:\n${validation.errors.join('\n')}`);
  }
  const resolution = core.resolveConceptReviews(library, manifest, selectedConceptIds);
  if(resolution.errors.length){
    throw new Error(`Concept Review resolution failed:\n${resolution.errors.join('\n')}`);
  }
  composition.conceptReviewRuntimeIndex = resolution.runtimeIndex;
  composition.conceptReviewRuntimeSource = readText(CONCEPT_REVIEW_RUNTIME_PATH);
  return resolution;
}

function createMetadata(core, composition, config, library, extra = {}){
  return {
    schemaVersion:core.RECIPE_SCHEMA_VERSION,
    composerVersion:assertCanonicalCoreVersion(core),
    title:config.title,
    slug:config.slug,
    selectedConceptIds:config.selectedConceptIds,
    checkpointFocus:config.checkpointFocus,
    bossCoverage:composition.bossCoverage,
    supportedModes:config.supportedModes,
    saveKeyNamespace:config.saveKeyNamespace,
    compositionFingerprint:config.compositionFingerprint,
    libraryVersion:library.libraryVersion,
    librarySha256:library.librarySha256,
    templateSha256:config.templateSha256,
    ...extra
  };
}

async function buildFacultyGame(core, recipe, options = {}){
  const library = options.library || loadComposerLibrary();
  const template = options.template || loadCanonicalTemplate();
  const composition = options.composition || core.compose(library, recipe);
  if(composition.errors.length){
    throw new Error(`Composer generation failed:\n${composition.errors.join('\n')}`);
  }
  const conceptReviews = attachConceptReviewRuntime(
    core,
    composition,
    library,
    recipe.selectedConceptIds,
    options.conceptReviewManifest
  );
  const config = options.config || await core.createConfig(recipe, library, await core.sha256Hex(template));
  const metadata = createMetadata(core, composition, config, library, options.metadata);
  const html = core.buildHtml(template, composition, config, metadata);
  assertGeneratedComposerVersion(html, metadata.composerVersion);
  return {library, template, composition, conceptReviews, config, metadata, html};
}

function extractInlineScripts(html){
  return [...String(html).matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .filter(source => source.trim() && !/^\s*[\[{]/.test(source.trim()));
}

function assertInlineScriptsCompile(html, filename = 'generated-faculty-game.html'){
  const scripts = extractInlineScripts(html);
  assert(scripts.length > 0, 'Generated HTML contains no executable inline scripts.');
  scripts.forEach((source, index) => {
    new vm.Script(source, {filename:`${filename}:inline-${index + 1}.js`});
  });
  return scripts.length;
}

function testArtifactPath(relativePath){
  const outputRoot = process.env.MQ_COMPOSER_TEST_OUTPUT_DIR
    ? path.resolve(process.env.MQ_COMPOSER_TEST_OUTPUT_DIR)
    : COMPOSER_ROOT;
  const destination = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  return destination;
}

function writeTestArtifact(relativePath, content){
  const destination = testArtifactPath(relativePath);
  fs.writeFileSync(destination, content);
  return destination;
}

module.exports = {
  COMPOSER_ROOT,
  REPO_ROOT,
  CORE_PATH,
  TEMPLATE_PATH,
  LIBRARY_PATH,
  CONCEPT_REVIEW_MANIFEST_PATH,
  CONCEPT_REVIEW_RUNTIME_PATH,
  readText,
  loadComposerLibrary,
  loadCanonicalTemplate,
  loadConceptReviewManifest,
  getCanonicalComposerVersion,
  assertCanonicalCoreVersion,
  generatedComposerVersions,
  assertGeneratedComposerVersion,
  attachConceptReviewRuntime,
  createMetadata,
  buildFacultyGame,
  extractInlineScripts,
  assertInlineScriptsCompile,
  testArtifactPath,
  writeTestArtifact
};
