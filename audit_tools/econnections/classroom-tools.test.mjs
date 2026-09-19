import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import { harness } from './classroom-harness.mjs';

test('one-time classroom CLI saves separate credentials privately and refuses an existing output before making another request', async () => {
  const h = harness(); let requests = 0;
  const server = createServer(async (req, res) => {
    requests++;
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const response = await h.worker.fetch(new Request(origin + req.url, { method: req.method, headers: req.headers, body: Buffer.concat(chunks) }), h.env);
    res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const directory = await mkdtemp(path.resolve('tmp/econnections/provision-test-'));
  const output = path.join(directory, 'private-classroom.json');
  const args = ['server/econnections-classroom/classroom-tools.mjs', 'server/econnections-classroom/classroom.example.json', output];
  const options = { env: { ...process.env, CLASSROOM_API: origin, CLASSROOM_ADMIN_TOKEN: h.env.ADMIN_TOKEN }, windowsHide: true };
  try {
    const { stdout, stderr } = await promisify(execFile)(process.execPath, args, options);
    const result = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(result.studentURL, origin + result.studentPath);
    assert.notEqual(result.instructorToken, new URL(result.studentURL).searchParams.get('classroom'));
    assert.ok(!stdout.includes(result.instructorToken) && !stderr.includes(result.instructorToken));
    assert.ok(!JSON.stringify(result).includes(h.env.ADMIN_TOKEN));
    assert.equal(requests, 1); assert.equal((await h.instructor(result, 'open')).status, 200);
    await assert.rejects(promisify(execFile)(process.execPath, args, options));
    assert.equal(requests, 1); assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM classroom_courses').get().n, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
