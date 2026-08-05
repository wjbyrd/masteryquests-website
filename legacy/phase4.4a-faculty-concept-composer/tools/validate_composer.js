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
const template = fs.readFileSync(path.join(root, 'template/mastery-quests-faculty-template-composer-ready.html'), 'utf8');
const templateSha = crypto.createHash('sha256').update(template).digest('hex');

(async () => {
  const results = [];
  const recipeDir = path.join(root, 'tests/recipes');
  const files = fs.readdirSync(recipeDir).filter(name => name.endsWith('.json')).sort();

  for(const file of files){
    const sourceRecipe = JSON.parse(fs.readFileSync(path.join(recipeDir, file), 'utf8'));
    const canonicalRecipe = Core.canonicalRecipe(sourceRecipe, library);
    const composition = Core.compose(library, sourceRecipe);
    const config = await Core.createConfig(sourceRecipe, library, templateSha);
    const answer = await Core.verifyAnswers(composition);
    const metadata = {
      schemaVersion: Core.RECIPE_SCHEMA_VERSION,
      composerVersion: Core.COMPOSER_VERSION,
      title: config.title,
      slug: config.slug,
      supportedModes: config.supportedModes,
      selectedConceptIds: config.selectedConceptIds,
      checkpointFocus: config.checkpointFocus,
      bossCoverage: composition.bossCoverage,
      saveKeyNamespace: config.saveKeyNamespace,
      compositionFingerprint: config.compositionFingerprint
    };
    const html = Core.buildHtml(template, composition, config, metadata);
    const generatedDir = path.join(root, 'tests/generated-games', canonicalRecipe.slug);
    fs.mkdirSync(generatedDir, {recursive: true});
    fs.writeFileSync(path.join(generatedDir, `${canonicalRecipe.slug}.html`), html);

    for(const asset of composition.assets){
      const source = path.join(root, asset.sourceUrl);
      const destination = path.join(generatedDir, asset.runtimePath);
      fs.mkdirSync(path.dirname(destination), {recursive: true});
      fs.copyFileSync(source, destination);
    }

    fs.writeFileSync(
      path.join(generatedDir, 'composition_manifest.json'),
      JSON.stringify({
        sourceRecipe,
        canonicalRecipe,
        poolCounts: composition.counts,
        bossCoverage: composition.bossCoverage,
        errors: composition.errors,
        warnings: composition.warnings,
        answerVerification: answer,
        config
      }, null, 2) + '\n'
    );

    results.push({
      slug: canonicalRecipe.slug,
      passed: composition.errors.length === 0 && answer.ok,
      sourceSchemaVersion: sourceRecipe.schemaVersion || null,
      canonicalSchemaVersion: canonicalRecipe.schemaVersion,
      errors: composition.errors,
      poolCounts: composition.counts,
      bossCoverage: composition.bossCoverage,
      supportedModes: canonicalRecipe.supportedModes,
      answerQuestions: answer.questionCount,
      namespace: config.saveKeyNamespace,
      htmlSha256: crypto.createHash('sha256').update(html).digest('hex')
    });
  }

  const namespaces = results.map(result => result.namespace);
  const summary = {
    composerVersion: Core.COMPOSER_VERSION,
    recipeSchemaVersion: Core.RECIPE_SCHEMA_VERSION,
    conceptCount: library.conceptCount,
    questionCount: library.canonicalQuestionCount,
    recipes: results,
    allPassed: results.every(result => result.passed),
    namespaceIsolation: new Set(namespaces).size === namespaces.length
  };

  fs.writeFileSync(
    path.join(root, 'phase4_4a_static_validation_results.json'),
    JSON.stringify(summary, null, 2) + '\n'
  );
  console.log(JSON.stringify(summary, null, 2));
  if(!summary.allPassed || !summary.namespaceIsolation) process.exit(1);
})();
