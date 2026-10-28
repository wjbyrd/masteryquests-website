import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Read references from the entry HTML so adding a dependency without extending
// the publisher's allowlist fails the deployment build immediately.
export function verifyComposerRuntime(publicRoot) {
  const root = path.resolve(publicRoot);
  const entry = 'build/faculty-build-composer/index.html';
  const html = fs.readFileSync(path.join(root, entry), 'utf8');
  const base = new URL(entry, 'https://publication.invalid/');
  const files = [];
  for (const tag of html.match(/<(?:script|link)\b[^>]*>/gi) || []) {
    const script = /^<script\b/i.test(tag);
    if (!script && !/\brel\s*=\s*["']stylesheet["']/i.test(tag)) continue;
    const value = tag.match(script ? /\bsrc\s*=\s*(["'])(.*?)\1/i : /\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!value) continue;
    const url = new URL(value.replaceAll('&amp;', '&'), base);
    if (url.origin !== base.origin) continue;
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) throw new Error(`Composer runtime path escapes publication root: ${value}`);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new Error(`Missing published Composer dependency: ${relative}. Update the Composer publication allowlist.`);
    }
    if (script) new vm.Script(fs.readFileSync(file, 'utf8'), {filename:relative});
    files.push(relative);
  }
  if (!files.some(file => file.endsWith('/composer.js'))) throw new Error('Composer entry is missing its startup script.');
  return files;
}
