import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const composerRoot = path.join(root, 'build', 'faculty-build-composer');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function parseManifest(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(line => line.slice(66));
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function writeManifest(base, manifestFile, relativePaths) {
  const uniquePaths = [...new Set(relativePaths.map(value => value.replaceAll('\\', '/')))]
    .filter(relative => relative !== path.relative(base, manifestFile).replaceAll('\\', '/'))
    .filter(relative => fs.existsSync(path.join(base, relative)))
    .sort();
  const body = uniquePaths.map(relative => `${sha256(path.join(base, relative))}  ${relative}`).join('\n') + '\n';
  fs.writeFileSync(manifestFile, body, 'utf8');
  return uniquePaths.length;
}

const composerManifest = path.join(composerRoot, 'SHA256SUMS.txt');
const composerPaths = parseManifest(composerManifest);
composerPaths.push(
  'data/composer_library.js',
  'data/composer_library_manifest.json',
  'data/composer_registry.json',
  'index.html',
  'phaseM2b1-gdp-national-output-family-maturation-v1.json',
  'phaseM2b1-gdp-national-output-family-maturation-v1_questions.json'
);
const composerEntries = writeManifest(composerRoot, composerManifest, composerPaths);

const rootManifest = path.join(root, 'SHA256SUMS.txt');
const rootPaths = parseManifest(rootManifest);
rootPaths.push(
  'audit_tools/apply_macro_m2b1_gdp.mjs',
  'audit_tools/apply_macro_m2b1_quality_fix.mjs',
  'audit_tools/refresh_macro_m2b1_checksums.mjs',
  'audit_tools/run_macro_m2b1_gdp_validation.mjs',
  'build/index.html',
  'build/faculty-build-composer/SHA256SUMS.txt',
  'build/faculty-build-composer/data/composer_library.js',
  'build/faculty-build-composer/data/composer_library_manifest.json',
  'build/faculty-build-composer/data/composer_registry.json',
  'build/faculty-build-composer/index.html',
  'build/faculty-build-composer/phaseM2b1-gdp-national-output-family-maturation-v1.json',
  'build/faculty-build-composer/phaseM2b1-gdp-national-output-family-maturation-v1_questions.json'
);
for (const file of walkFiles(path.join(root, 'validation_artifacts', 'macro_m2b1_gdp'))) {
  rootPaths.push(path.relative(root, file));
}
const rootEntries = writeManifest(root, rootManifest, rootPaths);

console.log(JSON.stringify({ rootEntries, composerEntries }, null, 2));
