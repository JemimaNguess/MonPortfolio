import Link from 'next/link';
import { safeQuery } from '@/lib/db';
import { getSettings } from '@/lib/data';

async function num(sql, params) {
  const r = await safeQuery(sql, params);
  return r ? Number(r[0]?.n || 0) : 0;
}

export default async function Dashboard() {
  const settings = await getSettings();
  const [today, week, aiToday, clipsWeek, unread, projects] = await Promise.all([
    num('SELECT COUNT(*) AS n FROM conversations WHERE created_at >= CURDATE()'),
    num('SELECT COUNT(*) AS n FROM conversations WHERE created_at >= NOW() - INTERVAL 7 DAY'),
    num("SELECT COUNT(*) AS n FROM conversations WHERE source = 'ai' AND created_at >= CURDATE()"),
    num("SELECT COUNT(*) AS n FROM conversations WHERE source = 'clip' AND created_at >= NOW() - INTERVAL 7 DAY"),
    num('SELECT COUNT(*) AS n FROM contact_messages WHERE is_read = 0'),
    num('SELECT COUNT(*) AS n FROM projects WHERE published = 1'),
  ]);
  const top = (await safeQuery(
    `SELECT question, COUNT(*) AS n, MAX(created_at) AS last FROM conversations
     WHERE source IN ('ai','fallback') AND created_at >= NOW() - INTERVAL 30 DAY
     GROUP BY question ORDER BY n DESC, last DESC LIMIT 10`
  )) || [];
  const limit = Number(settings.ai_daily_limit || 800);
  const pct = limit ? Math.min(100, Math.round((aiToday / limit) * 100)) : 0;

  const cards = [
    ["Questions aujourd'hui", today],
    ['Questions sur 7 jours', week],
    ['Réponses en clip (7 j)', clipsWeek],
    ['Messages non lus', unread, '/admin/messages'],
    ['Projets publiés', projects, '/admin/projects'],
  ];

  return (
    <div className="flex flex-col gap-7">
      <h1 className="h2 text-3xl">Tableau de bord</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, href]) => {
          const inner = (<><span className="font-display text-3xl font-bold text-[#f4f0ff]">{value}</span><span className="muted">{label}</span></>);
          return href
            ? <Link key={label} href={href} className="glass flex flex-col gap-1 p-4 hover:border-lav">{inner}</Link>
            : <div key={label} className="glass flex flex-col gap-1 p-4">{inner}</div>;
        })}
      </div>

      <section className="glass flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="h3">Consommation de l&apos;IA aujourd&apos;hui</h2>
          <span className="muted">{aiToday} / {limit} réponses Gemini · assistante {settings.assistant_enabled === 'false' ? 'coupée' : 'active'}</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-lav/15"><div className={`h-full ${pct >= 80 ? 'bg-salmon' : 'bg-lav'}`} style={{ width: `${pct}%` }} /></div>
        {pct >= 80 && <p className="text-sm text-salmon">Plus de 80 % du quota du jour est utilisé.</p>}
        <Link href="/admin/settings" className="self-start text-sm font-semibold">Modifier les limites</Link>
      </section>

      <section className="glass flex flex-col gap-3 p-5">
        <h2 className="h3">Questions sans clip les plus posées (30 jours)</h2>
        <p className="muted">Transforme les plus fréquentes en clip avec ta voix : elles seront répondues instantanément.</p>
        {top.length === 0 ? <p className="muted">Pas encore de données.</p> : (
          <ul className="flex flex-col divide-y divide-lav/10">
            {top.map((q) => (
              <li key={q.question} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="text-sm">{q.question} <span className="text-dim">× {q.n}</span></span>
                <Link href={`/admin/clips?question=${encodeURIComponent(q.question)}`} className="chip">Créer un clip</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
