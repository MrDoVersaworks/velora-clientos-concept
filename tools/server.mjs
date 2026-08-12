import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};

createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = normalize(join(root, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)));
    if (!path.startsWith(root)) throw new Error('invalid path');
    const info = await stat(path).catch(() => null);
    if (!info?.isFile()) path = join(root,'index.html');
    const body = await readFile(path);
    res.writeHead(200, {'content-type': types[extname(path)] || 'application/octet-stream', 'cache-control':'no-store'});
    res.end(body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Velora running at http://127.0.0.1:${port}`));
