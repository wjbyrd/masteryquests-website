import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const base = fs.readFileSync(path.join(here, 'apply_phase7_7_general.mjs'), 'utf8');
const tail = fs.readFileSync(path.join(here, 'phase7_7_general_tail.mjs'), 'utf8');
await import(`data:text/javascript;base64,${Buffer.from(`${base}\n${tail}`).toString('base64')}`);
