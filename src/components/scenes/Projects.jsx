'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SceneShell from './SceneShell';
import Icon from '@/components/ui/Icon';
import { pick } from '@/lib/i18n';

const FILTERS = ['all', 'web', 'mobile', 'ia', 'hackathon'];

export default function Projects({ dict, locale, projects, focusSlug, isMobile }) {
  const t = dict.projects;
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)), [projects, filter]);
  const [index, setIndex] = useState(0);
  const drag = useRef(null);

  useEffect(() => {
    if (!focusSlug) return;
    const i = projects.findIndex((p) => p.slug === focusSlug);
    if (i >= 0) { setFilter('all'); setIndex(i); }
  }, [focusSlug, projects]);

  useEffect(() => { setIndex(0); }, [filter]);

  const n = list.length;
  const move = (d) => n && setIndex((i) => (i + d + n) % n);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const spread = isMobile ? 250 : 290;

  return (
    <SceneShell className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span></h2>
        </div>
        <div role="group" aria-label={t.eyebrow} className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f} type="button" className="chip flex-none" aria-pressed={filter === f} onClick={() => setFilter(f)}>{t.filters[f]}</button>
          ))}
        </div>
      </div>

      <div
        className="relative mx-auto h-[520px] w-full max-w-[1400px] touch-pan-y select-none md:h-[500px]"
        onPointerDown={(e) => { drag.current = e.clientX; }}
        onPointerUp={(e) => {
          if (drag.current == null) return;
          const dx = e.clientX - drag.current;
          drag.current = null;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
        }}
      >
        <div aria-hidden="true" className="absolute left-1/2 top-[240px] h-[260px] w-[min(1180px,96vw)] -translate-x-1/2 rounded-[50%] border border-lav/20 shadow-[inset_0_0_40px_rgba(124,92,255,.15)]" />
        {n === 0 && <p className="muted absolute inset-x-0 top-40 text-center">{t.empty}</p>}
        {list.map((p, i) => {
          let off = i - index;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          if (abs > 2) return null;
          const front = off === 0;
          const href = `/${locale}/projets/${p.slug}`;
          return (
            <article
              key={p.slug}
              aria-hidden={!front}
              className={`absolute left-1/2 top-0 flex w-[280px] flex-col overflow-hidden rounded-[20px] bg-[rgba(20,16,38,.86)] backdrop-blur-md transition-all duration-500 ${front ? 'border-2 border-lav shadow-[0_0_40px_rgba(124,92,255,.55),0_20px_50px_rgba(0,0,0,.5)]' : 'border border-lav/25 shadow-[0_20px_50px_rgba(0,0,0,.5)]'}`}
              style={{
                zIndex: 10 - abs,
                opacity: abs === 2 ? 0.55 : 1,
                transform: `translateX(calc(-50% + ${off * spread}px)) translateY(${abs * 45}px) perspective(900px) rotateY(${-off * 12}deg) scale(${1 - abs * 0.07})`,
              }}
              onClick={() => !front && setIndex(i)}
            >
              <div className="scanlines flex h-[140px] items-center justify-center bg-gradient-to-br from-[#1d1638] to-[#0e0b1c] text-xs text-dim">
                {p.image_url
                  ? <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  : t.screenshot}
              </div>
              <div className="flex flex-col gap-2.5 p-4">
                <p className="eyebrow text-[11px]">{pick(p, 'kicker', locale)}</p>
                <h3 className="h3 text-[17px]">{pick(p, 'title', locale)}</h3>
                <p className="muted">{pick(p, 'summary', locale)}</p>
                <div className="flex flex-wrap gap-1.5">{(p.tags || []).map((tag) => <span key={tag} className="tag">{tag}</span>)}</div>
                {front
                  ? <a href={href} className="btn-primary mt-1 min-h-11 self-start text-sm" tabIndex={0}>{dict.common.caseStudy} <Icon name="arrow" size={16} /></a>
                  : <span className="text-[13px] font-semibold text-lav">{dict.common.caseStudy}</span>}
              </div>
            </article>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4">
          <button type="button" aria-label={t.prev} onClick={() => move(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-lav/30 bg-white/5 text-ink"><Icon name="arrowLeft" /></button>
          <p className="muted hidden text-center text-[13px] sm:block">{t.hint}</p>
          <button type="button" aria-label={t.next} onClick={() => move(1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-lav/30 bg-white/5 text-ink"><Icon name="arrow" /></button>
        </div>
      </div>
    </SceneShell>
  );
}
