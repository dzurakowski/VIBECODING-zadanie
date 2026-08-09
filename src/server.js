import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { config } from './config.js';
import { createApp } from './app.js';

const app = createApp();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  const url = new URL(request.url, config.appUrl);
  if (url.pathname.startsWith('/api/')) return app(request, response, url.pathname);
  const requested = url.pathname === '/' ? 'index.html' : url.pathname === config.adminPath ? 'admin.html' : url.pathname === '/set-password' ? 'set-password.html' : url.pathname === '/favicon.ico' ? 'favicon.svg' : url.pathname.slice(1);
  const path = normalize(join(process.cwd(), 'public', requested));
  if (!path.startsWith(join(process.cwd(), 'public'))) { response.writeHead(403).end(); return; }
  try { const content = await readFile(path); response.writeHead(200, { 'content-type': mime[extname(path)] ?? 'application/octet-stream' }); response.end(content); }
  catch { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); response.end('Nie znaleziono strony.'); }
});
server.listen(config.port, () => console.log(`Aplikacja działa pod ${config.appUrl}`));
