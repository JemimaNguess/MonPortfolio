import SceneShell from './SceneShell';

export default function About({ dict }) {
  const t = dict.about;
  return (
    <SceneShell className="grid items-center gap-10 md:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="relative hidden h-[620px] md:block" aria-hidden="true">
        <p className="absolute inset-x-6 bottom-28 font-display text-base font-medium leading-snug text-[#f4f0ff]" style={{ textShadow: '0 0 16px rgba(124,92,255,.8)' }}>{t.quote}</p>
      </div>
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span></h2>
        </div>
        <ol className="flex flex-col gap-4 border-l-2 border-violet/45 pl-7" style={{ boxShadow: '-8px 0 24px -12px rgba(124,92,255,.8)' }}>
          {t.timeline.map((item) => (
            <li key={item.title} className="relative grid gap-1 md:grid-cols-[150px_minmax(0,1fr)] md:gap-4">
              <span aria-hidden="true" className={`absolute -left-[37px] top-1 h-3.5 w-3.5 rounded-full ${item.now ? 'bg-salmon shadow-[0_0_16px_#ffb4a2]' : 'bg-lav shadow-[0_0_14px_#7c5cff]'}`} />
              <span className={`font-display text-sm font-semibold ${item.now ? 'text-salmon' : 'text-lav'}`}>{item.date}</span>
              <div>
                <p className="h3 text-[17px]">{item.title}</p>
                <p className="muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="grid gap-3.5 sm:grid-cols-3">
          {t.values.map((v) => (
            <div key={v.title} className="glass flex flex-col gap-1.5 p-4">
              <p className="h3 text-base">{v.title}</p>
              <p className="muted">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
}
