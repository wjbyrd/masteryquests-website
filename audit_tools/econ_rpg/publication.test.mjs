import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url));
const builder = path.join(root, 'audit_tools/public_site_publication/build-dist.mjs');
test('staging uses the existing explicit deny rule; current production build excludes all prototype files', () => {
  const source = readFileSync(builder, 'utf8');
  assert.match(source, /file\.startsWith\("audit_tools\/"\)/);
  assert.match(readFileSync(path.join(root, '.assetsignore'), 'utf8'), /\/audit_tools\/\*\*/);
  // The build deletes only this repository's generated dist; check its resolved boundary first.
  const dist = path.resolve(root, 'dist'); assert.equal(path.dirname(dist), path.resolve(root));
  execFileSync(process.execPath, [builder, root], { cwd: root, stdio: 'pipe' });
  assert.equal(existsSync(path.join(dist, 'audit_tools')), false);
  const files = [];
  function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name); if (entry.isDirectory()) walk(target); else files.push(target);
  } }
  walk(dist);
  assert.ok(files.length > 100);
  for (const file of files) {
    assert.doesNotMatch(file, /econ[_-]rpg|housing-crisis/i);
    if (/\.(html|js|json|css)$/i.test(file)) assert.doesNotMatch(readFileSync(file, 'utf8'), /mq\.econ-rpg|scenarios\/housing-crisis|Room to Stay/);
  }
});
test('public navigation, frozen games, Composer, telemetry and Cloudflare configuration are untouched', () => {
  execFileSync('git', ['diff', '--exit-code', 'HEAD', '--', 'index.html', 'games', 'play', 'build', 'server', 'assets', 'wrangler.jsonc', 'audit_tools/public_site_publication', '.assetsignore'], { cwd: root, stdio: 'pipe' });
});
