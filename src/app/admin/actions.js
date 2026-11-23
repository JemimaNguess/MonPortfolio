'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query, dbConfigured } from '@/lib/db';
import { embed, geminiConfigured } from '@/lib/gemini';
import { SEED_PROJECTS, SEED_KNOWLEDGE, SEED_CLIPS } from '@/lib/seed';
import {
  checkCredentials, createSession, destroySession, requireAdmin,
  tooManyAttempts, recordFailure, adminConfigured,
} from '@/lib/auth';

const s = (fd, k, max = 10000) => String(fd.get(k) ?? '').trim().slice(0, max);
const n = (fd, k, d = 0) => { const v = Number(fd.get(k)); return Number.isFinite(v) ? v : d; };
const b = (fd, k) => (fd.get(k) === 'on' || fd.get(k) === '1' || fd.get(k) === 'true' ? 1 : 0);

function refreshPublic() {
  revalidatePath('/fr');
  revalidatePath('/en');
  revalidatePath('/fr/rapide');
  revalidatePath('/en/rapide');
}

async function vector(text, task = 'RETRIEVAL_DOCUMENT') {
  if (!geminiConfigured()) return null;
  try { return JSON.stringify(await embed(text, task)); } catch (e) { console.error('[embed]', e.message); return null; }
}

/* ───────── Connexion ───────── */

export async function login(prev, formData) {
  if (!adminConfigured()) return { error: "L'admin n'est pas configuré : ajoute ADMIN_EMAIL, ADMIN_PASSWORD_HASH et ADMIN_SESSION_SECRET." };
  const h = await headers();
  const ip = (h.get('x-nf-client-connection-ip') || h.get('x-forwarded-for') || 'local').split(',')[0].trim();
  if (tooManyAttempts(ip)) return { error: 'Trop de tentatives. Réessaie dans 15 minutes.' };
  const ok = await checkCredentials(s(formData, 'email', 200), String(formData.get('password') || ''), s(formData, 'token', 10));
  if (!ok) {
    recordFailure(ip);
    return { error: 'Identifiants incorrects.' };
  }
  await createSession();
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}

/* ───────── Base de connaissances ───────── */

export async function saveKnowledge(formData) {
  await requireAdmin();
  const id = n(formData, 'id');
  const title = s(formData, 'title', 200);
  const content = s(formData, 'content', 6000);
  const lang = s(formData, 'lang', 5) === 'en' ? 'en' : 'fr';
  if (!title || !content) return;
  const emb = await vector(`${title}\n${content}`);
  if (id) await query('UPDATE knowledge SET title = ?, content = ?, lang = ?, embedding = ? WHERE id = ?', [title, content, lang, emb, id]);
  else await query('INSERT INTO knowledge (title, content, lang, embedding) VALUES (?, ?, ?, ?)', [title, content, lang, emb]);
  revalidatePath('/admin/knowledge');
}

export async function deleteKnowledge(formData) {
  await requireAdmin();
  await query('DELETE FROM knowledge WHERE id = ?', [n(formData, 'id')]);
  revalidatePath('/admin/knowledge');
}

/* ───────── Projets ───────── */

export async function saveProject(formData) {
  await requireAdmin();
  const id = n(formData, 'id');
  const slug = s(formData, 'slug', 120).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const tags = JSON.stringify(s(formData, 'tags', 500).split(',').map((t) => t.trim()).filter(Boolean));
  const vals = [
    slug, s(formData, 'title_fr', 200), s(formData, 'title_en', 200), s(formData, 'kicker_fr', 200), s(formData, 'kicker_en', 200),
    s(formData, 'summary_fr', 2000), s(formData, 'summary_en', 2000), s(formData, 'body_fr', 20000), s(formData, 'body_en', 20000),
    s(formData, 'category', 40) || 'web', tags, s(formData, 'image_url', 500), s(formData, 'github_url', 500), s(formData, 'demo_url', 500),
    b(formData, 'featured'), n(formData, 'sort_order'), b(formData, 'published'),
  ];
  if (!slug || !vals[1]) return;
  if (id) {
    await query(
      `UPDATE projects SET slug=?, title_fr=?, title_en=?, kicker_fr=?, kicker_en=?, summary_fr=?, summary_en=?, body_fr=?, body_en=?,
       category=?, tags=?, image_url=?, github_url=?, demo_url=?, featured=?, sort_order=?, published=? WHERE id=?`,
      [...vals, id]
    );
  } else {
    await query(
      `INSERT INTO projects (slug, title_fr, title_en, kicker_fr, kicker_en, summary_fr, summary_en, body_fr, body_en,
       category, tags, image_url, github_url, demo_url, featured, sort_order, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      vals
    );
  }
  refreshPublic();
  revalidatePath(`/fr/projets/${slug}`);
  revalidatePath(`/en/projets/${slug}`);
  redirect('/admin/projects');
}

export async function deleteProject(formData) {
  await requireAdmin();
  await query('DELETE FROM projects WHERE id = ?', [n(formData, 'id')]);
  refreshPublic();
  revalidatePath('/admin/projects');
}

/* ───────── Clips parlants ───────── */

export async function saveClip(formData) {
  await requireAdmin();
  const id = n(formData, 'id');
  const question = s(formData, 'question', 300);
  const answer = s(formData, 'answer_text', 3000);
  if (!question || !answer) return;
  const vals = [s(formData, 'code', 20), question, answer, s(formData, 'video_url', 500), s(formData, 'lang', 5) === 'en' ? 'en' : 'fr', b(formData, 'active')];
  const emb = await vector(question, 'RETRIEVAL_QUERY');
  if (id) await query('UPDATE clips SET code=?, question=?, answer_text=?, video_url=?, lang=?, active=?, embedding=? WHERE id=?', [...vals, emb, id]);
  else await query('INSERT INTO clips (code, question, answer_text, video_url, lang, active, embedding) VALUES (?,?,?,?,?,?,?)', [...vals, emb]);
  revalidatePath('/admin/clips');
}

export async function deleteClip(formData) {
  await requireAdmin();
  await query('DELETE FROM clips WHERE id = ?', [n(formData, 'id')]);
  revalidatePath('/admin/clips');
}

/* ───────── Messages ───────── */

export async function toggleMessage(formData) {
  await requireAdmin();
  await query('UPDATE contact_messages SET is_read = 1 - is_read WHERE id = ?', [n(formData, 'id')]);
  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}

export async function deleteMessage(formData) {
  await requireAdmin();
  await query('DELETE FROM contact_messages WHERE id = ?', [n(formData, 'id')]);
  revalidatePath('/admin/messages');
}

/* ───────── Conversations ───────── */

export async function purgeConversations() {
  await requireAdmin();
  await query('DELETE FROM conversations WHERE created_at < NOW() - INTERVAL 30 DAY');
  revalidatePath('/admin/conversations');
}

/* ───────── Réglages ───────── */

export async function saveSettings(formData) {
  await requireAdmin();
  const entries = {
    assistant_enabled: formData.get('assistant_enabled') === 'on' ? 'true' : 'false',
    ai_daily_limit: String(Math.max(0, n(formData, 'ai_daily_limit', 800))),
    visitor_hourly_limit: String(Math.max(1, n(formData, 'visitor_hourly_limit', 20))),
    availability_fr: s(formData, 'availability_fr', 300),
    availability_en: s(formData, 'availability_en', 300),
  };
  for (const [name, value] of Object.entries(entries)) {
    await query('INSERT INTO settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [name, value]);
  }
  revalidatePath('/admin/settings');
}

// Copie le contenu par défaut (seed.js) dans la base, sans écraser ce qui existe déjà.
export async function importSeed() {
  await requireAdmin();
  if (!dbConfigured()) return;
  for (const p of SEED_PROJECTS) {
    await query(
      `INSERT IGNORE INTO projects (slug, title_fr, title_en, kicker_fr, kicker_en, summary_fr, summary_en, body_fr, body_en, category, tags, image_url, github_url, demo_url, featured, sort_order, published)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
      [p.slug, p.title_fr, p.title_en, p.kicker_fr, p.kicker_en, p.summary_fr, p.summary_en, p.body_fr, p.body_en, p.category, JSON.stringify(p.tags), p.image_url, p.github_url, p.demo_url, p.featured, p.sort_order]
    );
  }
  const [{ k }] = await query('SELECT COUNT(*) AS k FROM knowledge');
  if (Number(k) === 0) {
    for (const item of SEED_KNOWLEDGE) {
      await query('INSERT INTO knowledge (title, content, lang, embedding) VALUES (?, ?, ?, ?)', [item.title, item.content, item.lang, await vector(`${item.title}\n${item.content}`)]);
    }
  }
  const [{ c }] = await query('SELECT COUNT(*) AS c FROM clips');
  if (Number(c) === 0) {
    for (const clip of SEED_CLIPS) {
      await query('INSERT INTO clips (code, question, answer_text, video_url, lang, active, embedding) VALUES (?,?,?,?,?,1,?)', [clip.code, clip.question, clip.answer_text, clip.video_url, clip.lang, await vector(clip.question, 'RETRIEVAL_QUERY')]);
    }
  }
  refreshPublic();
  revalidatePath('/admin', 'layout');
}

// Recalcule tous les vecteurs (après avoir ajouté la clé Gemini, par exemple).
export async function reembedAll() {
  await requireAdmin();
  if (!geminiConfigured()) return;
  const ks = await query('SELECT id, title, content FROM knowledge');
  for (const k of ks) await query('UPDATE knowledge SET embedding = ? WHERE id = ?', [await vector(`${k.title}\n${k.content}`), k.id]);
  const cs = await query('SELECT id, question FROM clips');
  for (const c of cs) await query('UPDATE clips SET embedding = ? WHERE id = ?', [await vector(c.question, 'RETRIEVAL_QUERY'), c.id]);
  revalidatePath('/admin', 'layout');
}
