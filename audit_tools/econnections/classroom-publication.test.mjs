import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root = process.cwd(), dist = path.join(root, 'dist');
const assets = ['games/econnections-class/index.html', 'games/econnections-class/classroom.css', 'games/econnections-class/classroom.js',
  'games/econnections-class/vendor/qrcodegen.js', 'games/econnections-class/vendor/LICENSE.txt', 'games/econnections/classroom.js', 'games/econnections/classroom-contract.js'];
for (const asset of assets) {
  assert.ok(existsSync(path.join(dist, asset)), asset);
  const bytes = readFileSync(path.join(dist, asset));
  assert.ok(bytes.equals(readFileSync(path.join(root, asset))), 'Publication differs from source: ' + asset);
  assert.doesNotMatch(bytes.toString(), /local-test-only-credential-not-a-production-secret|instructorHash|CLASSROOM_ADMIN_TOKEN|ADMIN_TOKEN\s*[:=]/);
}
for (const excluded of ['server', 'audit_tools', 'tmp', 'node_modules', '.dev.vars', 'games/econnections-class/vendor/README.md']) assert.equal(existsSync(path.join(dist, excluded)), false, excluded);
const protectedPaths = ['server/anonymous-telemetry-poc', 'games/econnections/engine.js', 'games/econnections/storage.js', 'games/econnections/econnections.js',
  'games/econnections/index.html', 'games/econnections/econnections.css', 'games/econnections/calendar-date.js', 'games/econnections/pools', 'games/econnections/econnections_groups.js',
  'games/econnections/classroom-contract.js', 'server/econnections-classroom/migrations/0001_classroom.sql', 'server/econnections-classroom/wrangler.jsonc'];
execFileSync('git', ['diff', '--exit-code', 'HEAD', '--', ...protectedPaths], { cwd: root, stdio: 'pipe' });
console.log('PASS published instructor/QR assets match source; Worker/tooling/secrets excluded; protected engine, public game and Managerial/Composer telemetry unchanged');
