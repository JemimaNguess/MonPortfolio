'use client';

import { useState } from 'react';
import SceneShell from './SceneShell';
import FaceDetect from './FaceDetect';

function SecurityChallenge({ t }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [result, setResult] = useState(null);
  const [showFix, setShowFix] = useState(false);

  const test = (e) => {
    e.preventDefault();
    // Simulation pédagogique : la requête vulnérable serait
    // SELECT * FROM users WHERE login = '<user>' AND password = '<pass>'
    const injected = /'\s*(--|#)|'\s*or\s+'?1'?\s*=\s*'?1/i.test(user) || /'\s*or\s+'?1'?\s*=\s*'?1/i.test(pass);
    setResult(injected ? 'win' : 'fail');
  };

  return (
    <div className="glass flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3"><h3 className="h3">{t.secTitle}</h3><span className="tag">{t.secTag}</span></div>
      <p className="muted">{t.secIntro}</p>
      <form onSubmit={test} className="flex flex-col gap-2 rounded-2xl border border-lav/20 bg-night/60 p-3.5">
        <label htmlFor="lab-user" className="text-xs font-medium text-[#c9c1e8]">{t.secUser}</label>
        <input id="lab-user" value={user} onChange={(e) => setUser(e.target.value)} className="field min-h-10 font-mono text-sm" autoComplete="off" />
        <label htmlFor="lab-pass" className="text-xs font-medium text-[#c9c1e8]">{t.secPass}</label>
        <input id="lab-pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="field min-h-10 font-mono text-sm" autoComplete="off" />
        <button type="submit" className="btn-secondary min-h-10 text-sm">{t.secTest}</button>
      </form>
      {result && (
        <p aria-live="polite" className={`rounded-xl px-3 py-2 text-sm ${result === 'win' ? 'bg-salmon/15 text-salmon' : 'bg-white/5 text-muted'}`}>
          {result === 'win' ? t.secWin : t.secOk}
        </p>
      )}
      <button type="button" onClick={() => setShowFix(!showFix)} aria-expanded={showFix} className="self-start text-[13px] font-semibold text-lav">{t.secSolution}</button>
      {showFix && <p className="muted rounded-xl bg-white/5 px-3 py-2 font-mono text-[13px]">{t.secFix}</p>}
    </div>
  );
}

export default function Lab({ dict, go }) {
  const t = dict.lab;
  return (
    <SceneShell className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span></h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="glass flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="h3">{t.faceTitle}</h3><span className="tag">{t.faceTag}</span></div>
          <FaceDetect t={t} />
        </section>
        <div className="flex flex-col gap-5">
          <SecurityChallenge t={t} />
          <div className="glass flex flex-col gap-2.5 p-5">
            <h3 className="h3 text-[17px]">{t.realTitle}</h3>
            <p className="muted">{t.realText}</p>
            <button type="button" onClick={() => go('projects')} className="self-start text-[13px] font-semibold text-salmon">{t.realLink}</button>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
