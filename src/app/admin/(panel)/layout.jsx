import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { requireAdmin } from '@/lib/auth';
import { dbConfigured } from '@/lib/db';
import { geminiConfigured } from '@/lib/gemini';
import { logout } from '../actions';

export const dynamic = 'force-dynamic';

const LINKS = [
  ['/admin', 'chart', 'Tableau de bord'],
  ['/admin/knowledge', 'book', 'Connaissances'],
  ['/admin/projects', 'grid', 'Projets'],
  ['/admin/clips', 'video', 'Clips parlants'],
  ['/admin/conversations', 'chat', 'Questions posées'],
  ['/admin/messages', 'mail', 'Messages'],
  ['/admin/settings', 'settings', 'Réglages'],
];

export default async function PanelLayout({ children }) {
  await requireAdmin();
  return (
    <div className="flex min-h-dvh flex-wrap">
      <aside className="flex w-full flex-col gap-1 border-b border-lav/15 bg-surface/60 p-4 md:sticky md:top-0 md:h-dvh md:w-64 md:border-b-0 md:border-r">
        <p className="mb-4 font-display text-[15px] font-bold tracking-[0.22em] text-lav">MA JEMIMA<span className="text-salmon">.</span> <span className="text-xs tracking-normal text-muted">admin</span></p>
        <nav className="flex flex-wrap gap-1 md:flex-col">
          {LINKS.map(([href, icon, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm text-[#c9c1e8] hover:bg-white/5 hover:text-ink">
              <Icon name={icon} size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <a href="/fr" target="_blank" className="inline-flex items-center gap-2 text-sm"><Icon name="external" size={16} /> Voir le site</a>
          <form action={logout}><button type="submit" className="inline-flex items-center gap-2 text-sm text-muted hover:text-salmon"><Icon name="logout" size={16} /> Déconnexion</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-[999_1_560px] p-5 md:p-8">
        {!dbConfigured() && (
          <p className="mb-5 rounded-xl bg-salmon/15 px-4 py-3 text-sm text-salmon">
            MySQL n&apos;est pas configuré : le site affiche le contenu par défaut et rien ne peut être enregistré. Ajoute les variables DATABASE_* (voir le README).
          </p>
        )}
        {!geminiConfigured() && (
          <p className="mb-5 rounded-xl bg-white/5 px-4 py-3 text-sm text-muted">
            Clé Gemini absente : l&apos;assistante répond seulement avec les clips et oriente vers les scènes. Ajoute GEMINI_API_KEY.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
