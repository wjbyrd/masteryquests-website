import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const composer = path.join(root, 'build', 'faculty-build-composer');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function files(dir, target) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    const relative = path.relative(dir, file).replaceAll('\\', '/');
    if (relative === '.git' || relative.startsWith('.git/') || path.resolve(file) === path.resolve(target)) continue;
    if (entry.isDirectory()) output.push(...files(file, target));
    else output.push(file);
  }
  return output;
}

function sums(dir, destination) {
  const lines = files(dir, destination)
    .sort()
    .map(file => `${sha(fs.readFileSync(file))}  ${path.relative(dir, file).replaceAll('\\', '/')}`);
  fs.writeFileSync(destination, `${lines.join('\n')}\n`, 'utf8');
  return lines.length;
}

const composerChecks = sums(composer, path.join(composer, 'SHA256SUMS.txt'));
const rootChecks = sums(root, path.join(root, 'SHA256SUMS.txt'));
console.log(JSON.stringify({ composerChecks, rootChecks }, null, 2));
