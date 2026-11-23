import { notFound } from 'next/navigation';
import { getDictionary } from '@/dictionaries';
import { getProject, getProjects } from '@/lib/data';
import { pick } from '@/lib/i18n';

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getProjects();
  return ['fr', 'en'].flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return { title: `${pick(p, 'title', locale)} — Jemima N'Guessan`, description: pick(p, 'summary', locale) };
}

export default async function ProjectPage({ params }) {
  const { locale, slug } = await params;
  const d = getDictionary(locale);
  const p = await getProject(slug);
  if (!p) notFound();
  const body = pick(p, 'body', locale);
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-12">
      <a href={`/${locale}#projects`} className="text-sm font-semibold">← {d.common.back}</a>
      <header className="flex flex-col gap-3">
        <p className="eyebrow">{pick(p, 'kicker', locale)}</p>
        <h1 className="h2">{pick(p, 'title', locale)}</h1>
        <p className="body-text">{pick(p, 'summary', locale)}</p>
        <div className="flex flex-wrap gap-2">{(p.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}</div>
      </header>
      <div className="scanlines flex aspect-video items-center justify-center overflow-hidden rounded-3xl border border-lav/25 bg-gradient-to-br from-[#1d1638] to-[#0e0b1c] text-sm text-dim">
        {p.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.image_url} alt={pick(p, 'title', locale)} className="h-full w-full object-cover" />
          : d.projects.screenshot}
      </div>
      <article className="body-text flex flex-col gap-4 whitespace-pre-line">{body}</article>
      <div className="flex flex-wrap gap-3">
        {p.github_url && <a href={p.github_url} className="btn-secondary" target="_blank" rel="noopener noreferrer">GitHub</a>}
        {p.demo_url && <a href={p.demo_url} className="btn-primary" target="_blank" rel="noopener noreferrer">Démo</a>}
      </div>
    </main>
  );
}
