import 'server-only';
import { safeQuery, parseJSON } from './db';
import { SEED_PROJECTS, SEED_CLIPS, SEED_KNOWLEDGE } from './seed';

function normalizeProject(p) {
  return { ...p, tags: parseJSON(p.tags, []), featured: Boolean(Number(p.featured)) };
}

export async function getProjects() {
  const rows = await safeQuery('SELECT * FROM projects WHERE published = 1 ORDER BY featured DESC, sort_order ASC, id DESC');
  if (rows && rows.length) return rows.map(normalizeProject);
  return SEED_PROJECTS.map(normalizeProject);
}

export async function getProject(slug) {
  const rows = await safeQuery('SELECT * FROM projects WHERE slug = ? AND published = 1 LIMIT 1', [slug]);
  if (rows && rows.length) return normalizeProject(rows[0]);
  const seed = SEED_PROJECTS.find((p) => p.slug === slug);
  return seed ? normalizeProject(seed) : null;
}

export async function getClips() {
  const rows = await safeQuery('SELECT id, code, question, answer_text, video_url, lang, embedding FROM clips WHERE active = 1');
  if (rows && rows.length) return rows.map((c) => ({ ...c, embedding: parseJSON(c.embedding, null) }));
  return SEED_CLIPS;
}

export async function getKnowledge() {
  const rows = await safeQuery('SELECT id, title, content, lang, embedding FROM knowledge');
  if (rows && rows.length) return rows.map((k) => ({ ...k, embedding: parseJSON(k.embedding, null) }));
  return SEED_KNOWLEDGE;
}

const DEFAULT_SETTINGS = {
  assistant_enabled: 'true',
  ai_daily_limit: '800',
  visitor_hourly_limit: '20',
  availability_fr: 'Disponible pour de nouveaux projets.',
  availability_en: 'Available for new projects.',
};

export async function getSettings() {
  const rows = await safeQuery('SELECT name, value FROM settings');
  const out = { ...DEFAULT_SETTINGS };
  if (rows) for (const r of rows) out[r.name] = r.value;
  return out;
}
