// Restablece la contraseña de un alumno (no hay recuperación por correo).
// Uso: node server/reset-password.js <usuario> <contraseña-nueva>
// En producción: docker exec -it $(docker ps -qf name=piano_piano) node server/reset-password.js <usuario> <contraseña-nueva>
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const [username, password] = process.argv.slice(2);
if (!username || !password || password.length < 8) {
  console.error('Uso: node server/reset-password.js <usuario> <contraseña-nueva (mínimo 8 caracteres)>');
  process.exit(1);
}
const dir = process.env.DATA_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const db = new DatabaseSync(path.join(dir, 'piano.db'));
const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username);
if (!user) { console.error(`No existe el usuario «${username}».`); process.exit(1); }
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password.normalize('NFKC'), salt, 64, { N: 1 << 15, r: 8, p: 1, maxmem: 128 << 20 }).toString('hex');
db.prepare('UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?').run(hash, salt, user.id);
db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
console.log(`Contraseña de «${user.username}» cambiada. Sus sesiones abiertas se han cerrado.`);
