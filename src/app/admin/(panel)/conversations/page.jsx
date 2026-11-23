import Link from 'next/link';
import { safeQuery } from '@/lib/db';
import { purgeConversations } from '../../actions';

const LABEL = { clip: 'clip', ai: 'Gemini', fallback: 'repli', blocked: 'limite' };

export default async function ConversationsAdmin() {
  const rows = (await safeQuery('SELECT id, lang, question, answer, source, created_at FROM conversations ORDER BY created_at DESC LIMIT 300')) || [];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2 text-3xl">Questions posées à l&apos;hologramme</h1>
          <p className="muted mt-1">Anonymisées. Conservées 30 jours (voir les mentions légales).</p>
        </div>
        <form action={purgeConversations}><button type="submit" className="btn-secondary min-h-10 text-sm">Supprimer celles de plus de 30 jours</button></form>
      </div>
      <div className="glass overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr><th className="p-3">Date</th><th className="p-3">Question</th><th className="p-3">Réponse</th><th className="p-3">Source</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-lav/10 align-top">
                <td className="whitespace-nowrap p-3 text-xs text-dim">{new Date(c.created_at).toLocaleString('fr-FR')}</td>
                <td className="p-3">{c.question} <span className="tag ml-1">{c.lang}</span></td>
                <td className="max-w-md p-3 text-muted">{c.answer}</td>
                <td className="p-3"><span className={c.source === 'ai' ? 'text-lav' : c.source === 'clip' ? 'text-salmon' : 'text-dim'}>{LABEL[c.source] || c.source}</span></td>
                <td className="p-3">{c.source !== 'clip' && <Link href={`/admin/clips?question=${encodeURIComponent(c.question)}`} className="whitespace-nowrap text-xs">→ clip</Link>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-4 text-muted">Aucune question pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
