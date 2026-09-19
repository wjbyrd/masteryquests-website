import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { validateSession } from '../../games/econnections/classroom-contract.js';

// Resolve wall time using IANA rules. Reject gaps and ambiguous repeated times
// rather than quietly choosing an offset during a DST transition.
export function zonedInstant(local, timeZone) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error('Use YYYY-MM-DDTHH:mm wall times');
  const format = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const nominal = Date.parse(local + ':00Z'), matches = [];
  for (let minutes = -14 * 60; minutes <= 14 * 60; minutes += 15) {
    const candidate = new Date(nominal + minutes * 60000);
    const p = Object.fromEntries(format.formatToParts(candidate).map(p => [p.type, p.value]));
    if (`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}` === local) matches.push(candidate.toISOString());
  }
  if (matches.length !== 1) throw new Error('Wall time is invalid or ambiguous in this timezone');
  return matches[0];
}
export function prepareSession(input, createdAt = new Date().toISOString()) {
  const result = { ...input, createdAt };
  for (const key of ['scheduledClassTime', 'studentWindowStart', 'walkthroughStart', 'sessionClose']) result[key] = zonedInstant(input[key], input.timeZone);
  validateSession(result);
  delete result.createdAt;
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) throw new Error('Usage: node session-tools.mjs wall-times.json private-result.json');
  const api = new URL(process.env.CLASSROOM_API || 'http://127.0.0.1:8787');
  if (api.protocol !== 'https:' && !(api.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(api.hostname))) throw new Error('Use HTTPS or local loopback');
  if (!process.env.CLASSROOM_ADMIN_TOKEN) throw new Error('Set CLASSROOM_ADMIN_TOKEN privately');
  const session = prepareSession(JSON.parse(await readFile(inputPath, 'utf8')));
  const response = await fetch(new URL('/api/econnections-classroom/admin/sessions', api), { method: 'POST', redirect: 'error', headers: { Authorization: 'Bearer ' + process.env.CLASSROOM_ADMIN_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(session) });
  if (!response.ok) throw new Error('Session creation rejected: HTTP ' + response.status);
  await writeFile(outputPath, JSON.stringify(await response.json(), null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Private session link saved to the specified file. Keep it out of source control.');
}
