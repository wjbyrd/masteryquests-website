import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../../', import.meta.url));
const builder = path.join(root, 'audit_tools/public_site_publication/build-dist.mjs');
test('staging confines the authorized 12-game library to its unlisted namespace', () => {
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
  const supplied = ['approved-assets.json','main-attraction-assets.json','ppf-assets.json','megastar-mania-assets.json','gameday-rivals-assets.json','labor-force-files-assets.json'].flatMap(name => JSON.parse(readFileSync(new URL(`./art/${name}`, import.meta.url), 'utf8')));
  const artHashes = new Set(supplied.map(a => a.sha256));
  const preview = JSON.parse(readFileSync(new URL('./games-preview.json', import.meta.url), 'utf8'));
  const previewRoot = path.resolve(dist, preview.previewRoot.slice(1)) + path.sep;
  for (const file of files) {
    if (file.startsWith(previewRoot)) {
      assert.match(file, /\.(html|js|css|svg|webp|png|mp3|wav|ogg)$/i, 'Only runtime files are published');
      if (file.endsWith('.html')) assert.match(readFileSync(file, 'utf8'), /name="robots" content="noindex,nofollow"/);
      continue;
    }
    if (/\.(html|js|json|xml|txt)$/i.test(file)) assert.ok(!readFileSync(file, 'utf8').includes(preview.previewRoot), 'Preview remains unlinked outside its namespace');
    assert.doesNotMatch(file, /econ[_-]rpg|housing-crisis/i);
    if (/\.(html|js|json|css)$/i.test(file)) assert.doesNotMatch(readFileSync(file, 'utf8'), /mq\.econ-rpg|scenarios\/housing-crisis|Room to Stay|The Main Attraction|main-attraction\.js|The Economy[’']s Edge|scenarios\/ppf|Megastar Mania|megastar-mania|Jules Arlen|Gameday Rivals|gameday-rivals|gamedayRivalsSave_v1|Copper Cart|Clover Run|CPI LIVE|cpi-live|LABOR FORCE FILES|labor-force-files/);
    if (/\.(png|webp)$/i.test(file)) assert.equal(artHashes.has(createHash('sha256').update(readFileSync(file)).digest('hex')), false, 'Approved art must not publish under any name');
  }
});
test('deployment rebuilds the complete site and preserves unrelated runtime configuration', () => {
  const config=JSON.parse(readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
  assert.equal(config.build.command,'node audit_tools/public_site_publication/build-dist.mjs');
  assert.equal(config.assets.directory,'./dist');
  const baseline=JSON.parse(execFileSync('git',['show','HEAD:wrangler.jsonc'],{cwd:root,encoding:'utf8'}));
  delete config.build; delete baseline.build;
  assert.deepEqual(config,baseline,'Only the mandatory build step changes');
  execFileSync('git', ['diff', '--exit-code', 'HEAD', '--', 'index.html', 'games', 'play', 'build', 'server', 'assets', '.assetsignore', ':(exclude)games/index.html', ':(exclude)assets/css/site.css', ':(exclude)assets/images/games/**'], { cwd: root, stdio: 'pipe' });
});
