import { readFile, open } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { validateCourse } from './courses.mjs';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) throw new Error('Usage: node classroom-tools.mjs classroom.json private-classroom.json');
  const api = new URL(process.env.CLASSROOM_API || 'http://127.0.0.1:8787');
  if (api.protocol !== 'https:' && !(api.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(api.hostname))) throw new Error('Use HTTPS or local loopback');
  if (!process.env.CLASSROOM_ADMIN_TOKEN) throw new Error('Set CLASSROOM_ADMIN_TOKEN privately');
  const input = validateCourse(JSON.parse(await readFile(inputPath, 'utf8')));
  // Check the private output destination before creating a classroom remotely.
  const output = await open(outputPath, 'wx', 0o600);
  try {
    const response = await fetch(new URL('/api/econnections-classroom/admin/classrooms', api), { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Bearer ' + process.env.CLASSROOM_ADMIN_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!response.ok) throw new Error('Classroom creation rejected: HTTP ' + response.status);
    const result = await response.json();
    result.studentURL = new URL(result.studentPath, api).href;
    await output.writeFile(JSON.stringify(result, null, 2) + '\n');
  } finally { await output.close(); }
  console.log('Classroom provisioned. Instructor token and permanent student link saved privately to the specified file.');
}
