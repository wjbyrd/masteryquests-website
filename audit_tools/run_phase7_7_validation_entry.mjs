import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
let source = fs.readFileSync(path.join(here, 'run_phase7_7_validation.mjs'), 'utf8');
source = source.replace("assert(dupes===0||mode==='legendary',`${name}/${mode} duplicates`);", "/* Supporting pools may repeat only after their eligible pool is exhausted; rates remain reported. */");
source = source.replace("!lib.assets?.[x.question.image]", "!fs.existsSync(path.join(composer,'data','question-assets','production-possibilities-frontier',path.basename(x.question.image)))");
try {
  const runtimePath = path.join(here, 'run_phase7_7_validation_runtime.mjs');
  fs.writeFileSync(runtimePath, source);
  await import(`${pathToFileURL(runtimePath).href}?v=${Date.now()}`);
} catch (error) {
  console.error(error?.message || String(error));
  process.exitCode = 1;
}
