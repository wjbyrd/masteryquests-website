import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const composerRoot = path.join(repoRoot, 'build', 'faculty-build-composer');
const libraryPath = path.join(composerRoot, 'data', 'composer_library.js');
const tesseractPath = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';

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

function loadLibrary() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(libraryPath, 'utf8'), context);
  return context.window.MQ_COMPOSER_LIBRARY;
}

function allQuestions(module) {
  return [
    ...Object.values(module.questions || {}).flat(),
    ...(module.repairQuestions || []),
    ...(module.bridgeQuestions || []),
    ...(module.repairSeedQuestions || [])
  ];
}

function normalizedAssetPath(value) {
  return String(value || '').replace(/^data\//, '').replaceAll('\\', '/');
}

function resolveMetadata(module, questionPath) {
  const wanted = normalizedAssetPath(questionPath);
  const wantedName = path.posix.basename(wanted);
  return (module.assetMetadata || []).find(asset => {
    const candidates = [asset.runtimePath, asset.sourceUrl, asset.sourceAssetPath, asset.filename]
      .filter(Boolean)
      .map(normalizedAssetPath);
    return candidates.includes(wanted) || candidates.some(candidate => path.posix.basename(candidate) === wantedName);
  });
}

function cleanOcr(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

const library = loadLibrary();
const records = [];
const seen = new Set();

for (const conceptId of microConceptIds) {
  const module = library.concepts[conceptId];
  for (const question of allQuestions(module)) {
    if (!question.image) continue;
    const metadata = resolveMetadata(module, question.image);
    if (!metadata) throw new Error(`No metadata for ${conceptId}: ${question.image}`);
    const runtimePath = normalizedAssetPath(metadata.runtimePath || metadata.sourceUrl);
    const key = `${conceptId}|${runtimePath}`;
    let record = records.find(item => item.key === key);
    if (!record) {
      const diskPath = path.join(composerRoot, 'data', ...runtimePath.split('/'));
      if (!fs.existsSync(diskPath)) throw new Error(`Missing graph asset: ${diskPath}`);
      const ocr = cleanOcr(execFileSync(tesseractPath, [diskPath, 'stdout', '--psm', '6'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }));
      record = {
        key,
        conceptId,
        conceptTitle: module.title,
        filename: metadata.filename,
        runtimePath,
        diskPath,
        ocr,
        questionIds: [],
        stems: []
      };
      records.push(record);
    }
    const id = question.id || question.questionId;
    if (!seen.has(`${key}|${id}`)) {
      record.questionIds.push(id);
      record.stems.push(question.q);
      seen.add(`${key}|${id}`);
    }
  }
}

records.sort((a, b) => a.key.localeCompare(b.key));
const outputPath = path.join(import.meta.dirname, 'graph_ocr_work.json');
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, uniqueAssets: records.length, graphLinkedQuestions: seen.size }, null, 2));
