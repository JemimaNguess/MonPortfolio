'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function Portal({ dict, locale, onEnter }) {
  const [progress, setProgress] = useState(0);
  const t = dict.portal;

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = () => {
      const p = Math.min(100, Math.round(((performance.now() - start) / 3200) * 100));
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="scene-enter flex min-h-dvh flex-col items-center justify-end gap-5 px-6 pb-14 text-center md:justify-center md:gap-6 md:pb-0">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="font-display text-[60px] font-bold leading-[0.95] tracking-[-0.04em] text-[#f4f0ff] md:text-[112px]" style={{ textShadow: '0 0 60px rgba(124,92,255,.55)' }}>
        Ma <span className="text-lav">Jemima</span><span className="text-salmon">.</span>
      </h1>
      <p className="body-text max-w-[520px]">{t.intro}</p>
      <div className="flex w-full max-w-[360px] flex-col gap-2.5">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>{t.loading}</span>
          <span className="text-[#d9d0ff]">{progress} %</span>
        </div>
        <div className="h-1 overflow-hidden rounded bg-lav/20" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-gradient-to-r from-violet to-lav shadow-[0_0_14px_#7c5cff] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex w-full max-w-[360px] flex-col gap-3 md:w-auto md:max-w-none md:flex-row">
        <button type="button" className="btn-primary" onClick={() => onEnter(true)}>
          <Icon name="volume" size={18} /> {t.enterSound}
        </button>
        <button type="button" className="btn-secondary" onClick={() => onEnter(false)}>{t.enterSilent}</button>
      </div>
      <div className="flex items-center gap-4 text-[13px] font-medium">
        <div className="flex overflow-hidden rounded-full border border-lav/30">
          <a href="/fr" aria-current={locale === 'fr' ? 'true' : undefined} className={`inline-flex min-h-10 min-w-12 items-center justify-center px-3 text-xs font-semibold ${locale === 'fr' ? 'bg-violet/30 text-[#f4f0ff]' : 'text-muted'}`}>Français</a>
          <a href="/en" aria-current={locale === 'en' ? 'true' : undefined} className={`inline-flex min-h-10 min-w-12 items-center justify-center px-3 text-xs font-semibold ${locale === 'en' ? 'bg-violet/30 text-[#f4f0ff]' : 'text-muted'}`}>English</a>
        </div>
        <a href={`/${locale}/rapide`}>{dict.common.fastVersion}</a>
      </div>
      <p className="max-w-[460px] text-xs text-dim md:fixed md:inset-x-0 md:bottom-6 md:mx-auto">{dict.common.aiNotice}</p>
    </section>
  );
}
