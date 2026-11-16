// Servidor de «Clases de piano»: estáticos + API de cuentas y progreso.
// Sin dependencias externas: node:http, node:sqlite y node:crypto.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');
const PORT = Number(process.env.PORT || 8080);
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '..', 'data');
const SECURE_COOKIE = process.env.INSECURE_COOKIE !== '1';
const SESSION_DAYS = 90;
const COOKIE = 'piano_sesion';

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'piano.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    pass_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    best INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, item)
  );
  CREATE TABLE IF NOT EXISTS activity (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    seconds INTEGER NOT NULL DEFAULT 0,
    notes INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
  );
`);

const q = {
  userByName: db.prepare('SELECT * FROM users WHERE username = ?'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  insertUser: db.prepare('INSERT INTO users (username, name, pass_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)'),
  updatePass: db.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?'),
  updateName: db.prepare('UPDATE users SET name = ? WHERE id = ?'),
  deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
  insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)'),
  session: db.prepare('SELECT * FROM sessions WHERE token_hash = ?'),
  touchSession: db.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  deleteUserSessions: db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?'),
  purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),
  progress: db.prepare('SELECT item, done, stars, best, attempts, updated_at FROM progress WHERE user_id = ?'),
  upsertProgress: db.prepare(`
    INSERT INTO progress (user_id, item, done, stars, best, attempts, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id, item) DO UPDATE SET
      done = MAX(done, excluded.done),
      stars = MAX(stars, excluded.stars),
      best = MAX(best, excluded.best),
      attempts = attempts + excluded.attempts,
      updated_at = excluded.updated_at`),
  activity: db.prepare('SELECT day, seconds, notes FROM activity WHERE user_id = ? ORDER BY day DESC LIMIT 400'),
  addActivity: db.prepare(`
    INSERT INTO activity (user_id, day, seconds, notes) VALUES (?, ?, ?, ?)
    ON CONFLICT (user_id, day) DO UPDATE SET
      seconds = MIN(86400, seconds + excluded.seconds), notes = notes + excluded.notes`),
};

// ---------- utilidades ----------
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hashPassword = (password, salt) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password.normalize('NFKC'), salt, 64, { N: 1 << 15, r: 8, p: 1, maxmem: 128 << 20 }, (e, k) =>
      e ? reject(e) : resolve(k.toString('hex'))));

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (msg, status = 400) => new HttpError(status, msg);

function clientIp(req) {
  return String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
    .split(',')[0].trim();
}

// Límite de intentos en memoria: clave -> marcas de tiempo.
const attempts = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) throw bad('Demasiados intentos. Espera unos minutos y vuelve a probar.', 429);
  list.push(now);
  attempts.set(key, list);
}
setInterval(() => {
  const now = Date.now();
  for (const [k, list] of attempts) if (!list.some((t) => now - t < 3600e3)) attempts.delete(k);
  q.purgeSessions.run(now);
}, 600e3).unref();

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
      return reject(bad('Se esperaba JSON.', 415));
    }
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 200_000) { reject(bad('Petición demasiado grande.', 413)); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const v = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!v || typeof v !== 'object') throw new Error();
        resolve(v);
      } catch { reject(bad('JSON no válido.')); }
    });
    req.on('error', reject);
  });
}

function cookieHeader(value, maxAgeSec) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${SECURE_COOKIE ? '; Secure' : ''}`;
}
function getToken(req) {
  const m = String(req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
  return m ? m[1] : null;
}
function currentUser(req) {
  const token = getToken(req);
  if (!token) return null;
  const th = sha(token);
  const s = q.session.get(th);
  const now = Date.now();
  if (!s || s.expires_at < now) return null;
  // Renueva la sesión como mucho una vez al día.
  const full = now + SESSION_DAYS * 864e5;
  if (full - s.expires_at > 864e5) q.touchSession.run(full, th);
  const u = q.userById.get(s.user_id);
  return u ? { ...u, tokenHash: th } : null;
}
function requireUser(req) {
  const u = currentUser(req);
  if (!u) throw bad('Inicia sesión para continuar.', 401);
  return u;
}
function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  q.insertSession.run(sha(token), userId, Date.now() + SESSION_DAYS * 864e5);
  res.setHeader('Set-Cookie', cookieHeader(token, SESSION_DAYS * 86400));
}

const publicUser = (u) => ({ username: u.username, name: u.name, createdAt: u.created_at });
function snapshot(u) {
  return { user: publicUser(u), progress: q.progress.all(u.id), activity: q.activity.all(u.id) };
}

const ITEM_RE = /^[a-z]+:[a-z0-9_-]{1,60}$/;
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
function saveProgress(userId, p) {
  if (!p || typeof p.item !== 'string' || !ITEM_RE.test(p.item)) throw bad('Elemento de progreso no válido.');
  q.upsertProgress.run(userId, p.item, p.done ? 1 : 0, clampInt(p.stars, 0, 3), clampInt(p.best, 0, 1e6),
    clampInt(p.attempts ?? 1, 0, 1e4), Date.now());
}

function validateCredentials(username, password) {
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) {
    throw bad('El nombre de usuario debe tener entre 3 y 24 caracteres: letras, números, punto, guion o guion bajo.');
  }
  validatePassword(password);
}
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
    throw bad('La contraseña debe tener al menos 8 caracteres.');
  }
}
const cleanName = (name, fallback) =>
  (typeof name === 'string' ? name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 40) : '') || fallback;

// ---------- API ----------
const routes = {
  'GET /api/me': (req) => {
    const u = currentUser(req);
    return u ? snapshot(u) : { user: null };
  },

  'POST /api/register': async (req, res, body) => {
    rateLimit(`reg:${clientIp(req)}`, 8, 3600e3);
    const { username, password } = body;
    validateCredentials(username, password);
    if (q.userByName.get(username)) throw bad('Ese nombre de usuario ya está en uso. Elige otro.', 409);
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(password, salt);
    let id;
    try {
      id = q.insertUser.run(username, cleanName(body.name, username), hash, salt, Date.now()).lastInsertRowid;
    } catch { throw bad('Ese nombre de usuario ya está en uso. Elige otro.', 409); }
    if (Array.isArray(body.progress)) for (const p of body.progress.slice(0, 500)) { try { saveProgress(id, p); } catch { /* se ignora */ } }
    startSession(res, id);
    return snapshot(q.userById.get(id));
  },

  'POST /api/login': async (req, res, body) => {
    const ip = clientIp(req);
    rateLimit(`login:${ip}`, 12, 600e3);
    const { username, password } = body;
    if (typeof username !== 'string' || typeof password !== 'string') throw bad('Faltan el usuario o la contraseña.');
    rateLimit(`login-u:${username.toLowerCase()}`, 12, 600e3);
    const u = q.userByName.get(username);
    // Se calcula siempre el hash para no revelar si el usuario existe.
    const hash = await hashPassword(password.slice(0, 200), u ? u.salt : 'x'.repeat(32));
    const ok = u && crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(u.pass_hash, 'hex'));
    if (!ok) throw bad('Usuario o contraseña incorrectos.', 401);
    if (Array.isArray(body.progress)) for (const p of body.progress.slice(0, 500)) { try { saveProgress(u.id, p); } catch { /* se ignora */ } }
    startSession(res, u.id);
    return snapshot(u);
  },

  'POST /api/logout': (req, res) => {
    const token = getToken(req);
    if (token) q.deleteSession.run(sha(token));
    res.setHeader('Set-Cookie', cookieHeader('', 0));
    return { ok: true };
  },

  'POST /api/progress': (req, res, body) => {
    const u = requireUser(req);
    const items = Array.isArray(body.items) ? body.items.slice(0, 500) : [body];
    for (const p of items) saveProgress(u.id, p);
    return { progress: q.progress.all(u.id) };
  },

  'POST /api/activity': (req, res, body) => {
    const u = requireUser(req);
    if (typeof body.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.day)) throw bad('Día no válido.');
    // Solo se aceptan días a ±1 del día del servidor (diferencias de zona horaria).
    if (Math.abs(Date.parse(body.day) - Date.now()) > 2 * 864e5) throw bad('Día no válido.');
    q.addActivity.run(u.id, body.day, clampInt(body.seconds, 0, 3600), clampInt(body.notes, 0, 20000));
    return { ok: true };
  },

  'POST /api/account': async (req, res, body) => {
    const u = requireUser(req);
    if (body.name !== undefined) q.updateName.run(cleanName(body.name, u.username), u.id);
    if (body.newPassword !== undefined) {
      rateLimit(`pass:${u.id}`, 8, 600e3);
      validatePassword(body.newPassword);
      const cur = await hashPassword(String(body.password || ''), u.salt);
      if (!crypto.timingSafeEqual(Buffer.from(cur, 'hex'), Buffer.from(u.pass_hash, 'hex'))) {
        throw bad('La contraseña actual no es correcta.', 403);
      }
      const salt = crypto.randomBytes(16).toString('hex');
      q.updatePass.run(await hashPassword(body.newPassword, salt), salt, u.id);
      q.deleteUserSessions.run(u.id, u.tokenHash);
    }
    return { user: publicUser(q.userById.get(u.id)) };
  },

  'POST /api/account/delete': async (req, res, body) => {
    const u = requireUser(req);
    rateLimit(`pass:${u.id}`, 8, 600e3);
    const cur = await hashPassword(String(body.password || ''), u.salt);
    if (!crypto.timingSafeEqual(Buffer.from(cur, 'hex'), Buffer.from(u.pass_hash, 'hex'))) {
      throw bad('La contraseña no es correcta.', 403);
    }
    q.deleteUser.run(u.id);
    res.setHeader('Set-Cookie', cookieHeader('', 0));
    return { ok: true };
  },
};

async function handleApi(req, res, url) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  try {
    const handler = routes[`${req.method} ${url.pathname}`];
    if (!handler) throw bad('No existe.', 404);
    let body = {};
    if (req.method !== 'GET') {
      // Defensa CSRF: mismo origen obligatorio en peticiones que modifican datos.
      const origin = req.headers.origin;
      if (origin) {
        let host = '';
        try { host = new URL(origin).host; } catch { /* origen ilegible */ }
        if (host !== req.headers.host) throw bad('Origen no permitido.', 403);
      }
      body = await readJson(req);
    }
    const out = await handler(req, res, body);
    res.writeHead(200).end(JSON.stringify(out));
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status === 500) console.error(e);
    res.writeHead(status).end(JSON.stringify({ error: status === 500 ? 'Error interno del servidor.' : e.message }));
  }
}

// ---------- estáticos ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png',
  '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
};
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { rel = '/'; }
  let file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC)) file = PUBLIC;
  let stat = fs.statSync(file, { throwIfNoEntry: false });
  const hasExt = path.extname(rel) !== '';
  if (!stat || stat.isDirectory()) {
    if (hasExt) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado'); return; }
    file = path.join(PUBLIC, 'index.html'); // rutas de la aplicación
    stat = fs.statSync(file);
  }
  const ext = path.extname(file);
  const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    ETag: etag,
    'Cache-Control': ext === '.woff2' ? 'public, max-age=31536000, immutable' : 'no-cache',
  };
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers).end(); return; }
  res.writeHead(200, { ...headers, 'Content-Length': stat.size });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) { handleApi(req, res, url); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  try { serveStatic(req, res, url); } catch (e) { console.error(e); res.writeHead(500).end(); }
}).listen(PORT, () => console.log(`Clases de piano escuchando en :${PORT} (datos en ${DATA_DIR})`));

for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { db.close(); process.exit(0); });
