'use client';

import { useMemo, useState } from 'react';
import SceneShell from './SceneShell';

const COLORS = { web: '#b9a7ff', mobile: '#d9b8ff', ia: '#ffb4a2', db: '#9fd0ff', tools: '#e7e0ff' };

// Positions en % d'une zone 860 × 600
const STARS = [
  { name: 'React', g: 'web', x: 180, y: 140 },
  { name: 'Next.js', g: 'web', x: 80, y: 120 },
  { name: 'Laravel', g: 'web', x: 90, y: 260 },
  { name: 'PHP', g: 'web', x: 240, y: 300 },
  { name: 'Angular', g: 'web', x: 340, y: 170 },
  { name: 'Spring Boot', g: 'web', x: 380, y: 300 },
  { name: 'React Native', g: 'mobile', x: 530, y: 100 },
  { name: 'Python', g: 'ia', x: 610, y: 330 },
  { name: 'OpenCV', g: 'ia', x: 740, y: 250 },
  { name: 'Pandas', g: 'ia', x: 720, y: 440 },
  { name: 'NumPy', g: 'ia', x: 560, y: 480 },
  { name: 'FastAPI', g: 'ia', x: 470, y: 390 },
  { name: 'MySQL', g: 'db', x: 300, y: 470 },
  { name: 'SQL Server', g: 'db', x: 150, y: 530 },
  { name: 'Figma', g: 'tools', x: 770, y: 110 },
  { name: 'Git & GitHub', g: 'tools', x: 450, y: 560 },
];
const LINKS = [
  ['React', 'Next.js'], ['React', 'Laravel'], ['Laravel', 'PHP'], ['React', 'Angular'], ['Angular', 'Spring Boot'],
  ['React', 'React Native'], ['Python', 'OpenCV'], ['Python', 'Pandas'], ['Pandas', 'NumPy'], ['Python', 'FastAPI'],
  ['FastAPI', 'MySQL'], ['Spring Boot', 'MySQL'], ['PHP', 'MySQL'], ['MySQL', 'SQL Server'], ['React Native', 'Figma'], ['FastAPI', 'Git & GitHub'],
];

export default function Skills({ dict, go, projects }) {
  const t = dict.skills;
  const [selected, setSelected] = useState('React');
  const P = useMemo(() => Object.fromEntries(STARS.map((s) => [s.name, s])), []);
  const star = P[selected];
  const usedIn = projects.filter((p) => (p.tags || []).some((tag) => tag.toLowerCase() === selected.toLowerCase()));
  const linked = new Set(LINKS.filter(([a, b]) => a === selected || b === selected).flat());

  return (
    <SceneShell className="grid items-center gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span> {t.titleEnd}</h2>
        <p className="body-text">{t.intro}</p>
        <ul className="flex flex-col gap-2.5 text-sm font-medium text-[#c9c1e8]">
          {Object.entries(t.groups).map(([k, label]) => (
            <li key={k} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[k] }} />{label}</li>
          ))}
        </ul>
      </div>

      {/* Constellation (ordinateur et tablette) */}
      <div className="relative mx-auto hidden aspect-[860/600] w-full max-w-[860px] md:block">
        <svg aria-hidden="true" viewBox="0 0 860 600" className="absolute inset-0 h-full w-full" fill="none" strokeWidth="1">
          {LINKS.map(([a, b]) => {
            const on = a === selected || b === selected;
            return <line key={a + b} x1={P[a].x} y1={P[a].y} x2={P[b].x} y2={P[b].y} stroke={on ? 'rgba(255,180,162,0.7)' : 'rgba(185,167,255,0.3)'} />;
          })}
        </svg>
        {STARS.map((s) => {
          const on = s.name === selected;
          const near = linked.has(s.name);
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setSelected(s.name)}
              aria-pressed={on}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 p-1"
              style={{ left: `${(s.x / 860) * 100}%`, top: `${(s.y / 600) * 100}%` }}
            >
              <span
                className="rounded-full transition-all"
                style={on
                  ? { width: 22, height: 22, background: '#fff', boxShadow: '0 0 0 6px rgba(124,92,255,.35), 0 0 34px #7c5cff' }
                  : { width: 11, height: 11, background: COLORS[s.g], boxShadow: `0 0 ${near ? 22 : 14}px ${COLORS[s.g]}` }}
              />
              <span className={on ? 'font-display text-base font-bold text-white' : 'text-[13px] font-medium text-[#ddd4ff]'}>{s.name}</span>
            </button>
          );
        })}
        <div
          className="glass absolute flex w-[250px] flex-col gap-2 p-4 shadow-[0_10px_40px_rgba(0,0,0,.4)]"
          style={{ left: `${Math.min(70, (star.x / 860) * 100 + 4)}%`, top: `${Math.min(62, (star.y / 600) * 100 + 4)}%` }}
          aria-live="polite"
        >
          <p className="eyebrow">{selected}</p>
          <p className="muted">{t.usedIn}</p>
          <div className="flex flex-wrap gap-1.5">
            {usedIn.length ? usedIn.map((p) => <span key={p.slug} className="tag">{p.title_fr}</span>) : <span className="tag">{t.noProject}</span>}
          </div>
          <button type="button" onClick={() => go('projects')} className="self-start text-[13px] font-semibold text-salmon">{t.seeProjects}</button>
        </div>
      </div>

      {/* Version mobile : liste par groupe */}
      <div className="flex flex-col gap-5 md:hidden">
        {Object.entries(t.groups).map(([k, label]) => (
          <div key={k} className="flex flex-col gap-2">
            <p className="text-sm font-semibold" style={{ color: COLORS[k] }}>{label}</p>
            <div className="flex flex-wrap gap-2">
              {STARS.filter((s) => s.g === k).map((s) => <span key={s.name} className="tag">{s.name}</span>)}
            </div>
          </div>
        ))}
      </div>
    </SceneShell>
  );
}
