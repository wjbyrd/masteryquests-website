import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyComposerRuntime} from './verify-composer-runtime.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const route = 'build/faculty-build-composer/';
test('production dist contains every Composer entry dependency and the exact deployment module', () => {
  const files = verifyComposerRuntime(path.join(repo, 'dist'));
  assert(files.includes(route + 'deployment.js'));
  for (const file of files) {
    assert.deepEqual(fs.readFileSync(path.join(repo, 'dist', file)), fs.readFileSync(path.join(repo, file)), file);
  }
});

test('a missing or invalid bootstrap dependency blocks publication, including versioned references', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-publication-runtime-'));
  const dir = path.join(temp, route);fs.mkdirSync(dir,{recursive:true});
  try {
    fs.writeFileSync(path.join(dir,'index.html'), '<link rel="stylesheet" href="composer.css?v=1"><script src="deployment.js?v=1&amp;x=2"></script><script src="composer.js?v=1"></script>');
    fs.writeFileSync(path.join(dir,'composer.css'), 'body{}');
    fs.writeFileSync(path.join(dir,'composer.js'), 'void 0;');
    assert.throws(() => verifyComposerRuntime(temp), /Missing published Composer dependency:.*deployment\.js/);
    fs.writeFileSync(path.join(dir,'deployment.js'), '<html>404 fallback</html>');
    assert.throws(() => verifyComposerRuntime(temp), SyntaxError);
    fs.writeFileSync(path.join(dir,'deployment.js'), 'globalThis.MQDeployment = {};');
    assert.equal(verifyComposerRuntime(temp).length, 3);
  } finally {
    const resolved=path.resolve(temp);
    assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
    assert(path.basename(resolved).startsWith('mq-publication-runtime-'));
    fs.rmSync(resolved,{recursive:true,force:true});
  }
});
