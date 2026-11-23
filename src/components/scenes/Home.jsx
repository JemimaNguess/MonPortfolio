'use client';

import SceneShell from './SceneShell';

export default function Home({ dict, locale, go, assistant }) {
  const t = dict.home;
  return (
    <SceneShell className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,520px)_minmax(0,1fr)]">
      <div className="order-2 flex flex-col gap-4 text-center md:order-1 md:text-left">
        <p className="eyebrow hidden sm:block">{t.eyebrow}</p>
        <h1 className="font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-[#f4f0ff] md:text-[60px]">
          Jemima<br className="hidden sm:block" /> <span className="glow">N&apos;Guessan</span>
        </h1>
        <p className="body-text hidden sm:block">{t.pitch}</p>
        <div className="hidden flex-wrap justify-center gap-2 sm:flex md:justify-start">
          {['React', 'Laravel', 'React Native', 'Python · IA'].map((x) => <span key={x} className="tag">{x}</span>)}
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-3 md:justify-start">
          <button type="button" className="btn-secondary" onClick={() => go('projects')}>{t.seeProjects}</button>
          <button type="button" className="btn-primary" onClick={() => go('contact')}>{t.contactMe}</button>
        </div>
      </div>
      {/* L'hologramme occupe la colonne centrale (il est dessiné derrière, en 3D) */}
      <div className="order-1 h-[46vh] md:order-2 md:h-[620px]" aria-hidden="true" />
      <div className="order-3 hidden flex-col items-end gap-3.5 md:flex">
        <div className="glass flex w-[280px] flex-col gap-2 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${assistant.speaking ? 'bg-salmon shadow-[0_0_10px_#ffb4a2]' : 'bg-lav/40'}`} />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-salmon">{dict.common.speaking}</span>
          </div>
          <div className={`wave flex h-6 items-end gap-[3px] ${assistant.speaking ? '' : 'opacity-30 [&_span]:[animation-play-state:paused]'}`} aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
          </div>
          <p className="muted">{dict.common.subtitles} · {locale.toUpperCase()}</p>
        </div>
        <div className="glass flex w-[280px] flex-col items-start gap-2.5 px-5 py-4">
          <p className="eyebrow">{t.tryTitle}</p>
          {t.suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => assistant.ask(s)}>{s}</button>
          ))}
        </div>
      </div>
      <div className="order-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
        {t.suggestions.map((s) => (
          <button key={s} type="button" className="chip flex-none" onClick={() => assistant.ask(s)}>{s}</button>
        ))}
      </div>
    </SceneShell>
  );
}
