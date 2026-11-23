'use client';

import { useEffect, useRef, useState } from 'react';
import SceneShell from './SceneShell';
import Icon from '@/components/ui/Icon';

function QuoteChat({ t, locale, quoteSignal }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const ref = useRef(null);

  useEffect(() => {
    if (quoteSignal) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [quoteSignal]);

  const steps = t.quoteSteps;
  const choose = (opt) => { setAnswers((a) => [...a.slice(0, step), opt]); setStep((s) => s + 1); };
  const restart = () => { setStep(0); setAnswers([]); setStatus('idle'); };

  const send = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email,
          subject: locale === 'en' ? 'Quote request' : 'Demande de devis',
          message: steps.slice(0, 3).map((s, i) => `${s.q} → ${answers[i] || '-'}`).join('\n'),
          meta: { type: 'quote', answers },
          website: '',
        }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <aside ref={ref} aria-label={t.quoteTitle} className="glass flex flex-col gap-3 self-start p-5 lg:mt-16">
      <div className="flex items-center gap-2.5">
        <span className="h-10 w-10 flex-none overflow-hidden rounded-full bg-[#12101f]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/holo/holo-preview.png" alt="" className="h-full w-full object-cover object-[50%_8%]" />
        </span>
        <div><p className="h3 text-[15px]">{t.quoteTitle}</p><p className="muted text-xs">{t.quoteSub}</p></div>
      </div>
      {steps.slice(0, Math.min(step + 1, steps.length)).map((s, i) => (
        <div key={s.q} className="flex flex-col gap-2">
          <div className="max-w-[88%] self-start rounded-[14px_14px_14px_4px] bg-violet/20 px-3 py-2.5 text-sm leading-snug text-ink">{s.q}</div>
          {answers[i] && <div className="max-w-[88%] self-end rounded-[14px_14px_4px_14px] bg-white/[.07] px-3 py-2.5 text-sm text-ink">{answers[i]}</div>}
        </div>
      ))}
      {status === 'done' ? (
        <>
          <p className="rounded-xl bg-salmon/15 px-3 py-2 text-sm text-salmon">{t.quoteDone}</p>
          <button type="button" className="self-start text-[13px] font-semibold text-lav" onClick={restart}>{t.quoteRestart}</button>
        </>
      ) : steps[step]?.options ? (
        <div className="flex flex-wrap gap-1.5">
          {steps[step].options.map((o) => <button key={o} type="button" className="chip" onClick={() => choose(o)}>{o}</button>)}
        </div>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-2">
          <label htmlFor="q-name" className="sr-only">{t.quoteNamePh}</label>
          <input id="q-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.quoteNamePh} className="field" maxLength={150} />
          <label htmlFor="q-mail" className="sr-only">{t.quoteEmailPh}</label>
          <input id="q-mail" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.quoteEmailPh} className="field" maxLength={200} />
          <button type="submit" className="btn-primary" disabled={status === 'sending'}>{t.quoteSend}</button>
          {status === 'error' && <p className="text-sm text-salmon">{locale === 'en' ? 'Sending failed, try the contact form.' : "L'envoi a échoué, essaie le formulaire de contact."}</p>}
        </form>
      )}
      <div className="flex gap-1" aria-label={`${Math.min(step + 1, 4)} / 4`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-lav' : 'bg-lav/20'}`} />)}
      </div>
    </aside>
  );
}

export default function Services({ dict, locale, quoteSignal }) {
  const t = dict.services;
  return (
    <SceneShell className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span></h2>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {t.items.map((s) => (
            <article key={s.title} className="glass flex flex-col gap-2 p-4">
              <span className="text-lav"><Icon name={s.icon} size={24} /></span>
              <h3 className="h3 text-[17px]">{s.title}</h3>
              <p className="muted">{s.text}</p>
              <span className="text-[13px] font-semibold text-salmon">{s.price ? `${t.from} ${s.price}` : t.onQuote}</span>
            </article>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <p className="eyebrow">{t.processTitle}</p>
          <ol className="grid gap-3 sm:grid-cols-4">
            {t.process.map((p, i) => (
              <li key={p.title} className={`rounded-2xl border-t-2 bg-white/[.03] p-3.5 ${i === 3 ? 'border-salmon' : 'border-violet'}`}>
                <span className={`font-display text-sm font-bold ${i === 3 ? 'text-salmon' : 'text-lav'}`}>{p.title}</span>
                <p className="muted mt-1">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <QuoteChat t={t} locale={locale} quoteSignal={quoteSignal} />
    </SceneShell>
  );
}
