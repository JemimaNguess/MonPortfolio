'use client';

import { useState } from 'react';
import SceneShell from './SceneShell';
import Icon from '@/components/ui/Icon';

export default function Contact({ dict, locale, availability }) {
  const t = dict.contact;
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
      e.target.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <SceneShell className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
      <div className="flex flex-col gap-5">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h2">{t.title} <span className="glow">{t.titleGlow}</span></h2>
        {availability && <p className="inline-flex items-center gap-2 text-sm text-[#c9c1e8]"><span className="h-2 w-2 rounded-full bg-salmon shadow-[0_0_10px_#ffb4a2]" />{availability}</p>}
        <form onSubmit={submit} className="glass grid gap-3.5 p-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-name" className="text-[13px] font-medium text-[#c9c1e8]">{t.name}</label>
            <input id="c-name" name="name" required maxLength={150} placeholder={t.namePh} className="field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-mail" className="text-[13px] font-medium text-[#c9c1e8]">{t.email}</label>
            <input id="c-mail" name="email" type="email" required maxLength={200} placeholder={t.emailPh} className="field" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="c-subject" className="text-[13px] font-medium text-[#c9c1e8]">{t.subject}</label>
            <select id="c-subject" name="subject" className="field">{t.subjects.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="c-msg" className="text-[13px] font-medium text-[#c9c1e8]">{t.message}</label>
            <textarea id="c-msg" name="message" required rows={4} maxLength={4000} placeholder={t.messagePh} className="field resize-y" />
          </div>
          {/* Piège à robots : champ invisible pour les humains */}
          <div aria-hidden="true" className="absolute -left-[9999px]"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
            <p className="muted" aria-live="polite">
              {status === 'sent' ? <span className="text-salmon">{t.sent}</span> : status === 'error' ? <span className="text-salmon">{t.error}</span> : t.reply}
            </p>
            <button type="submit" className="btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? t.sending : t.send} <Icon name="send" size={17} />
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="relative hidden h-[300px] lg:block" aria-hidden="true">
          <p className="absolute inset-x-0 bottom-10 text-center font-display text-[17px] font-medium text-[#f4f0ff]" style={{ textShadow: '0 0 16px rgba(124,92,255,.8)' }}>{t.bye}</p>
        </div>
        <a href="mailto:jemimaoceanenguessan@gmail.com" className="glass flex items-center gap-3.5 px-4 py-3.5 text-ink hover:text-ink">
          <span className="text-lav"><Icon name="mail" size={22} /></span>
          <span className="flex flex-col"><strong className="text-sm font-semibold">{t.mail}</strong><span className="text-[13px] text-muted">jemimaoceanenguessan@gmail.com</span></span>
        </a>
        <div className="glass flex items-center gap-3.5 px-4 py-3.5">
          <span className="text-lav"><Icon name="phone" size={22} /></span>
          <span className="flex flex-col"><strong className="text-sm font-semibold">{t.whatsapp}</strong><span className="text-[13px] text-muted">{t.whatsappValue}</span></span>
        </div>
        <div className="glass flex items-center gap-3.5 px-4 py-3.5">
          <span className="text-lav"><Icon name="calendar" size={22} /></span>
          <span className="flex flex-col"><strong className="text-sm font-semibold">{t.meeting}</strong><span className="text-[13px] text-muted">{t.meetingValue}</span></span>
        </div>
        <p className="flex flex-wrap gap-4 pt-2 text-xs text-dim">
          <span>© {new Date().getFullYear()} Jemima N&apos;Guessan · Abidjan</span>
          <a href={`/${locale}/mentions-legales`}>{t.legal}</a>
          <a href={`/${locale}/rapide`}>{dict.common.fastVersion}</a>
        </p>
      </div>
    </SceneShell>
  );
}
