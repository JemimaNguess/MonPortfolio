import { getDictionary } from '@/dictionaries';
import { getProjects } from '@/lib/data';
import { pick } from '@/lib/i18n';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return { title: getDictionary(locale).fast.title };
}

// Version sans 3D, lisible en 30 secondes (recruteurs pressés, connexions lentes, référencement).
export default async function Fast({ params }) {
  const { locale } = await params;
  const d = getDictionary(locale);
  const projects = await getProjects();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-12">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Ma Jemima</p>
        <h1 className="font-display text-4xl font-bold text-[#f4f0ff]">Jemima N&apos;Guessan</h1>
        <p className="body-text">{d.fast.intro}</p>
        <div className="flex flex-wrap gap-3">
          <a href={`/${locale}`} className="btn-secondary">{d.fast.full}</a>
          <a href={`/${locale}#contact`} className="btn-primary">{d.home.contactMe}</a>
        </div>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="h3">{d.nav.about}</h2>
        <ul className="flex flex-col gap-2">
          {d.about.timeline.map((i) => <li key={i.title} className="muted"><strong className="text-ink">{i.date}</strong> — {i.title}. {i.text}</li>)}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="h3">{d.nav.skills}</h2>
        <p className="muted">React, Next.js, Laravel, PHP, Spring Boot, Angular · React Native (Expo) · Python, FastAPI, Pandas, NumPy, OpenCV · MySQL, SQL Server · Figma, Git.</p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="h3">{d.nav.projects}</h2>
        <ul className="flex flex-col gap-3">
          {projects.map((p) => (
            <li key={p.slug} className="glass p-4">
              <a href={`/${locale}/projets/${p.slug}`} className="h3 text-base">{pick(p, 'title', locale)}</a>
              <p className="muted">{pick(p, 'summary', locale)}</p>
              <p className="mt-1 text-xs text-dim">{(p.tags || []).join(' · ')}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="h3">{d.nav.services}</h2>
        <ul className="muted list-inside list-disc">{d.services.items.map((s) => <li key={s.title}>{s.title}</li>)}</ul>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="h3">{d.nav.contact}</h2>
        <a href="mailto:jemimaoceanenguessan@gmail.com">jemimaoceanenguessan@gmail.com</a>
      </section>
    </main>
  );
}
