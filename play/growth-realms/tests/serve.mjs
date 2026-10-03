// Development-only, loopback server. Run from the repository root.
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(4178, '127.0.0.1', () => console.log('Growth Realms: http://127.0.0.1:4178/play/growth-realms/'));
