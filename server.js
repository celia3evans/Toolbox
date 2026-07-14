const http = require('http');
const fs   = require('fs');
const path = require('path');

const router = require('./routes');

const mime = { '.html': 'text/html', '.ttf': 'font/ttf', '.css': 'text/css', '.js': 'application/javascript', '.ico': 'image/x-icon', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

http.createServer(async (req, res) => {

  // Try registered API routes first
  const handled = await router.handle(req, res);
  if (handled) return;

  // Fall through to static file serving
  // Strip query string before resolving the file path
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file     = pathname === '/' ? '/index.html' : pathname;
  const ext      = path.extname(file);
  const filePath = path.join(__dirname, file);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

}).listen(7373, () => console.log('Listening on http://localhost:7373'));
