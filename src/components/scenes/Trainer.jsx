import SceneShell from './SceneShell';

export default function Trainer({ dict }) {
  const t = dict.trainer;
  return (
    <SceneShell className="grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span></h2>
        <p className="body-text">{t.intro}</p>
        <div className="grid grid-cols-2 gap-3">
          {t.stats.map((s) => (
            <div key={s.label} className="glass flex flex-col gap-1 p-4">
              <span className="font-display text-[30px] font-bold text-[#f4f0ff]">{s.value}</span>
              <span className="muted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <section className="scanlines flex flex-col gap-5 rounded-3xl border border-lav/35 bg-[rgba(20,16,38,.6)] p-6 shadow-[0_0_60px_rgba(124,92,255,.25),inset_0_0_40px_rgba(124,92,255,.12)] md:p-8 lg:[transform:perspective(1400px)_rotateY(-6deg)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="h3 glow">{t.boardTitle}</h3>
          <span className="tag">{t.boardTag}</span>
        </div>
        <ol className="grid gap-3.5 sm:grid-cols-2">
          {t.topics.map((topic, i) => (
            <li key={topic.title} className="flex gap-3.5 rounded-2xl border border-lav/20 bg-white/[.04] p-4">
              <span className="font-display text-[22px] font-bold text-violet">{String(i + 1).padStart(2, '0')}</span>
              <div><p className="h3 text-base">{topic.title}</p><p className="muted">{topic.text}</p></div>
            </li>
          ))}
        </ol>
        <figure className="flex flex-col gap-2 rounded-2xl border border-lav/25 bg-violet/10 p-5">
          <blockquote className="font-display text-base font-medium leading-normal text-ink">{t.quote}</blockquote>
          <figcaption className="muted">{t.quoteBy}</figcaption>
        </figure>
      </section>
    </SceneShell>
  );
}
