const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const publicDir = path.resolve(__dirname, '..', 'public');

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    ...headers
  });
  res.end(body);
}

function resolvePublicPath(urlPath) {
  const cleaned = String(urlPath || '/')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  const safePath = cleaned || 'index.html';
  const absolute = path.resolve(publicDir, safePath);
  const relative = path.relative(publicDir, absolute);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null;
  }
  return absolute;
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        send(res, 404, 'Not Found');
        return;
      }
      send(res, 500, 'Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeByExt[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    send(res, 400, 'Bad Request');
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);
  } catch {
    send(res, 400, 'Bad Request');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed');
    return;
  }

  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const filePath = resolvePublicPath(pathname);
  if (!filePath) {
    send(res, 403, 'Forbidden');
    return;
  }

  serveFile(filePath, res);
});

server.listen(port, host, () => {
  console.log(`LinkMan static server running at http://${host}:${port}`);
});
