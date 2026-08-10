import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(process.argv[2] || process.cwd());
const composer = path.join(root, 'build', 'faculty-build-composer');
const libraryPath = path.join(composer, 'data', 'composer_library.js');
const registryPath = path.join(composer, 'data', 'composer_registry.json');
const manifestPath = path.join(composer, 'data', 'composer_library_manifest.json');
const provenancePath = path.join(composer, 'phase7.7-general-economics-final-maturation-v1.json');
const changesPath = path.join(root, 'GENERAL_ECONOMICS_QUESTION_CHANGES.json');
const phase = 'phase7.7-general-economics-final-maturation-v1';
const conceptIds = [
  'micro-versus-macro',
  'positive-versus-normative-analysis',
  'economist-policy-role',
  'market-failures',
  'production-possibilities-frontier',
  'integrated-economic-analysis'
];

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => Array.isArray(value)
  ? value.map(stable)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
const answerHash = value => sha(String(value).trim().replace(/\s+/g, ' ').toLowerCase());
const questionHash = question => sha(JSON.stringify({
  q: question.q,
  options: question.options,
  aHash: question.aHash,
  primaryConceptId: question.primaryConceptId,
  primarySkill: question.primarySkill,
  difficulty: question.difficulty
}));

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(libraryPath, 'utf8'), context);
const library = context.window.MQ_COMPOSER_LIBRARY;
const actions = [];

function rotatePool(conceptId, poolName, questions) {
  if (!Array.isArray(questions)) return;
  questions.forEach((question, index) => {
    const correctIndex = question.options.findIndex(option => answerHash(option) === String(question.aHash).replace(/^sha256:/i, ''));
    if (correctIndex < 0) throw new Error(`Answer hash mismatch: ${conceptId}/${question.id}`);
    const targetIndex = index % 4;
    if (correctIndex === targetIndex) return;
    const correct = question.options[correctIndex];
    const distractors = question.options.filter((_, optionIndex) => optionIndex !== correctIndex);
    question.options = [...distractors.slice(0, targetIndex), correct, ...distractors.slice(targetIndex)];
    question.sourceHash = questionHash(question);
    question.sourceCurationPhase = phase;
    actions.push({
      canonicalConceptId: conceptId,
      questionId: question.id,
      action: 'QUALITY_FIX',
      oldPool: poolName,
      newPool: poolName,
      reason: 'Rotate canonical option order to eliminate stored correct-position patterns while preserving the answer hash.'
    });
  });
}

for (const conceptId of conceptIds) {
  const concept = library.concepts[conceptId];
  if (!concept) throw new Error(`Missing concept ${conceptId}`);
  for (const [poolName, questions] of Object.entries(concept.questions || {})) {
    if (poolName === 'boss') {
      for (const difficulty of ['easyBoss', 'mediumBoss', 'finalBoss']) {
        rotatePool(conceptId, difficulty, questions.filter(question => question.difficulty === difficulty));
      }
    } else rotatePool(conceptId, poolName, questions);
  }
  rotatePool(conceptId, 'repair', concept.repairQuestions);
  rotatePool(conceptId, 'repairSeed', concept.repairSeedQuestions);
  rotatePool(conceptId, 'bridge', concept.bridgeQuestions);
}

delete library.librarySha256;
library.librarySha256 = sha(JSON.stringify(stable(library)));
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
registry.librarySha256 = library.librarySha256;
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.librarySha256 = library.librarySha256;
const provenance = JSON.parse(fs.readFileSync(provenancePath, 'utf8'));
provenance.after.librarySha256 = library.librarySha256;
const changes = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
changes.changes.push(...actions);

fs.writeFileSync(libraryPath, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
fs.writeFileSync(changesPath, `${JSON.stringify(changes, null, 2)}\n`);
console.log(JSON.stringify({ positionFixes: actions.length, librarySha256: library.librarySha256 }, null, 2));
