import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || process.cwd());
const composer = path.join(root, 'build', 'faculty-build-composer');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(composer, 'data', 'composer_library.js'), 'utf8'), context);
const library = context.window.MQ_COMPOSER_LIBRARY;
const core = await import(pathToFileURL(path.join(composer, 'composer-core.js')).href).then(module => module.default || module);
const ids = [
  'scarcity-and-tradeoffs', 'opportunity-cost', 'marginal-analysis', 'incentives',
  'gains-from-trade', 'models-and-assumptions', 'micro-versus-macro',
  'positive-versus-normative-analysis', 'economist-policy-role', 'market-failures',
  'production-possibilities-frontier', 'elasticity', 'integrated-economic-analysis'
];
const recipe = {
  schemaVersion: '1.2.0',
  title: 'General Economics final verification',
  slug: 'general-economics-final-verification',
  supportedModes: ['standard', 'timed', 'exam', 'legendary', 'score'],
  selectedConceptIds: ids,
  checkpointFocus: { checkpointOne: null, checkpointTwo: null, finalCheckpoint: null }
};

const composition = core.compose(library, recipe);
if (composition.errors.length) throw new Error(composition.errors.join('\n'));
const answerCheck = await core.verifyAnswers(composition);
if (!answerCheck.ok) throw new Error(`Answer verification failed for ${answerCheck.issues.length} records`);

const schemaIssues = [];
let records = 0;
for (const conceptId of ids) {
  const concept = library.concepts[conceptId];
  const groups = [
    ...Object.entries(concept.questions || {}),
    ['repair', concept.repairQuestions || []],
    ['repair', concept.repairSeedQuestions || []],
    ['bridge', concept.bridgeQuestions || []]
  ];
  for (const [pool, questions] of groups) {
    for (const question of questions) {
      records++;
      const issues = core.validateFacultyQuestionRecord(question, pool, library.assets);
      if (issues.length) schemaIssues.push({ conceptId, pool, id: question.id, issues });
    }
  }
}
if (schemaIssues.length) {
  console.error(JSON.stringify(schemaIssues, null, 2));
  throw new Error(`Schema validation failed for ${schemaIssues.length} records`);
}
const result = { records, schemaIssues: 0, answerHashIssues: 0, modesValid: composition.validation.modes.every(mode => mode.ok) };
const artifactDir = path.join(root, 'validation_artifacts', 'general_economics_final_maturation');
fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(path.join(artifactDir, 'schema_answer_verification.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
