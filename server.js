// Kleiner Webserver ohne Abhängigkeiten: liefert das Museum als statische Dateien aus.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 10000;
const WURZEL = __dirname;
const TYPEN = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json', '.txt':'text/plain; charset=utf-8', '.woff2':'font/woff2',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.gif':'image/gif', '.svg':'image/svg+xml'
};

http.createServer((req, res) => {
  let pfad;
  try { pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (_) { res.writeHead(400); return res.end(); }
  if (pfad === '/healthz'){ res.writeHead(200); return res.end('ok'); }
  if (pfad.endsWith('/')) pfad += 'index.html';
  const datei = path.join(WURZEL, path.normalize(pfad));
  const typ = TYPEN[path.extname(datei).toLowerCase()];
  if (!datei.startsWith(WURZEL + path.sep) || !typ || path.basename(datei) === 'server.js'){ res.writeHead(404); return res.end('Nicht gefunden'); }
  fs.readFile(datei, (err, daten) => {
    if (err){ res.writeHead(404); return res.end('Nicht gefunden'); }
    res.writeHead(200, { 'Content-Type':typ, 'Cache-Control': typ.startsWith('image/') || typ === 'font/woff2' ? 'public, max-age=86400' : 'no-cache' });
    res.end(daten);
  });
}).listen(PORT, () => console.log('Museum läuft auf Port ' + PORT));
