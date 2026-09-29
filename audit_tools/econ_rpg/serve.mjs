import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const gameRoot = fileURLToPath(new URL('./game/', import.meta.url));
export function previewServer() {
  return createServer(async (req, res) => {
    try {
      let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      // Canonical public name, with the historical source/test folder retained.
      if(name==='/games/signal-house'||name.startsWith('/games/signal-house/'))name=name.replace('/games/signal-house','/games/the-shock-house');
      let file = path.resolve(gameRoot, `.${name}`);
      if (file !== path.resolve(gameRoot) && !file.startsWith(gameRoot)) { res.writeHead(403).end(); return; }
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' });
      res.end(body);
    } catch { res.writeHead(404).end('Not found'); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = previewServer();
  server.listen(Number(process.env.PORT || 4179), '127.0.0.1', () => console.log(`Local development only: http://127.0.0.1:${server.address().port}`));
}
