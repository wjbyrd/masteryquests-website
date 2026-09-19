import { validateSession } from '../../games/econnections/classroom-contract.js';
import { pathToFileURL } from 'node:url';
import { zonedInstant } from './timing.mjs';
export { zonedInstant } from './timing.mjs';

// Retained for local fixtures; session creation now uses the instructor console.
export function prepareSession(input, createdAt = new Date().toISOString()) {
  const result = { ...input, createdAt };
  for (const key of ['scheduledClassTime', 'studentWindowStart', 'walkthroughStart', 'sessionClose']) result[key] = zonedInstant(input[key], input.timeZone);
  validateSession(result);
  delete result.createdAt;
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  throw new Error('Per-session provisioning is retired. Use classroom-tools.mjs once, then /games/econnections-class/ to activate sessions.');
}
