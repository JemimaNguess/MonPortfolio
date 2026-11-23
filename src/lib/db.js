import 'server-only';
import mysql from 'mysql2/promise';

// Pool MySQL partagé. Si les variables DATABASE_* ne sont pas définies,
// le site fonctionne quand même avec le contenu par défaut (seed.js).
let pool = null;

export function dbConfigured() {
  return Boolean(process.env.DATABASE_HOST && process.env.DATABASE_USER && process.env.DATABASE_NAME);
}

export function getPool() {
  if (!dbConfigured()) return null;
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 3306),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME,
      waitForConnections: true,
      connectionLimit: 4,
      charset: 'utf8mb4',
      ssl: process.env.DATABASE_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const p = getPool();
  if (!p) throw new Error('DB_NOT_CONFIGURED');
  const [rows] = await p.execute(sql, params);
  return rows;
}

// Variante qui renvoie null au lieu d'échouer (pour l'affichage public).
export async function safeQuery(sql, params = []) {
  try {
    return await query(sql, params);
  } catch (e) {
    if (e.message !== 'DB_NOT_CONFIGURED') console.error('[db]', e.message);
    return null;
  }
}

export function parseJSON(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}
