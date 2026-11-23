'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Icon from '@/components/ui/Icon';
import useAssistant from './useAssistant';
import HoloVideo from './HoloVideo';
import Portal from '@/components/scenes/Portal';
import Home from '@/components/scenes/Home';
import About from '@/components/scenes/About';
import Skills from '@/components/scenes/Skills';
import Projects from '@/components/scenes/Projects';
import Lab from '@/components/scenes/Lab';
import Trainer from '@/components/scenes/Trainer';
import Services from '@/components/scenes/Services';
import Contact from '@/components/scenes/Contact';

const Hologram = dynamic(() => import('@/components/hologram/Hologram'), { ssr: false });

export const SCENES = [
  { id: 'home', icon: 'home', layout: 'center' },
  { id: 'about', icon: 'user', layout: 'left' },
  { id: 'skills', icon: 'star', layout: 'hidden' },
  { id: 'projects', icon: 'grid', layout: 'small' },
  { id: 'lab', icon: 'flask', layout: 'hidden' },
  { id: 'trainer', icon: 'cap', layout: 'hidden' },
  { id: 'services', icon: 'brief', layout: 'hidden' },
  { id: 'contact', icon: 'mail', layout: 'right' },
];
const IDS = SCENES.map((s) => s.id);

export default function Experience({ dict, locale, projects, availability }) {
  const [scene, setScene] = useState('portal');
  const [soundOn, setSoundOn] = useState(false);
  const [assembleKey, setAssembleKey] = useState(0);
  const [glitchAt, setGlitchAt] = useState(0);
  const [focusProject, setFocusProject] = useState(null);
  const [quoteSignal, setQuoteSignal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [question, setQuestion] = useState('');

  const go = useCallback((id) => {
    if (!IDS.includes(id)) return;
    setScene(id);
    setGlitchAt(Date.now());
    try { history.replaceState(null, '', `#${id}`); } catch {}
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onAction = useCallback((action, data) => {
    if (action === 'project') { setFocusProject(data.project || null); go('projects'); return; }
    if (action === 'quote') { setQuoteSignal(Date.now()); go('services'); return; }
    go(action);
  }, [go]);

  const assistant = useAssistant({ locale, soundOn, onAction });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    // Lien direct vers une scène (#projects) ou visiteur déjà passé par le portail
    const hash = window.location.hash.replace('#', '');
    let seen = false;
    try { seen = sessionStorage.getItem('mj_entered') === '1'; } catch {}
    if (IDS.includes(hash)) setScene(hash);
    else if (seen) setScene('home');
    return () => mq.removeEventListener('change', update);
  }, []);

  const enter = useCallback((withSound) => {
    setSoundOn(withSound);
    try { sessionStorage.setItem('mj_entered', '1'); } catch {}
    setScene('home');
    setAssembleKey((k) => k + 1);
    setTimeout(() => assistant.say(dict.home.welcome.replace(/[«»“”"]/g, '').trim()), 900);
  }, [assistant, dict.home.welcome]);

  const current = SCENES.find((s) => s.id === scene);
  let layout = scene === 'portal' ? 'center' : current?.layout || 'center';
  if (isMobile && !['portal', 'home'].includes(scene)) layout = 'hidden';
  if (assistant.video) layout = scene === 'home' || scene === 'portal' ? 'center' : layout;

  const submit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    assistant.ask(question);
    setQuestion('');
  };

  const sceneProps = { dict, locale, go, assistant, projects, isMobile, availability };
  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <a href="#scene" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn-secondary">{dict.common.skipToContent}</a>
      <Hologram layout={layout} speaking={assistant.speaking && !assistant.video} glitchAt={glitchAt} assembleKey={assembleKey} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,.6) 100%)' }} />
      <div aria-hidden="true" className="grain z-[1]" />

      {assistant.video && (
        <HoloVideo video={assistant.video} muted={!soundOn} onEnd={assistant.onVideoEnd} layout={layout} />
      )}

      {scene !== 'portal' && (
        <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:px-10 md:py-6">
          <button type="button" onClick={() => go('home')} className="font-display text-[15px] font-bold tracking-[0.22em] text-lav">
            MA JEMIMA<span className="text-salmon">.</span>
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden min-h-7 items-center rounded-full border border-salmon/40 px-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-salmon sm:inline-flex">
              {dict.common.avatarBadge}
            </span>
            <a href={`/${otherLocale}#${scene}`} className="inline-flex min-h-9 items-center rounded-full border border-lav/30 px-3 text-xs font-semibold text-ink hover:text-salmon">
              {otherLocale.toUpperCase()}
            </a>
            <button
              type="button"
              aria-label={dict.common.sound}
              aria-pressed={soundOn}
              onClick={() => { if (soundOn) assistant.stop(); setSoundOn(!soundOn); }}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-lav/30 bg-white/5 text-[#d4c9ff]"
            >
              <Icon name={soundOn ? 'volume' : 'mute'} size={18} />
            </button>
          </div>
        </header>
      )}

      <main id="scene" className="relative z-10">
        {scene === 'portal' && <Portal dict={dict} locale={locale} onEnter={enter} />}
        {scene === 'home' && <Home key="home" {...sceneProps} />}
        {scene === 'about' && <About key="about" {...sceneProps} />}
        {scene === 'skills' && <Skills key="skills" {...sceneProps} />}
        {scene === 'projects' && <Projects key="projects" {...sceneProps} focusSlug={focusProject} />}
        {scene === 'lab' && <Lab key="lab" {...sceneProps} />}
        {scene === 'trainer' && <Trainer key="trainer" {...sceneProps} />}
        {scene === 'services' && <Services key="services" {...sceneProps} quoteSignal={quoteSignal} />}
        {scene === 'contact' && <Contact key="contact" {...sceneProps} />}
      </main>

      {scene !== 'portal' && (
        <>
          {/* Sous-titres de l'hologramme */}
          {assistant.caption && (
            <p
              aria-live="polite"
              className="pointer-events-none fixed inset-x-4 bottom-[148px] z-20 mx-auto w-fit max-w-[640px] rounded-2xl bg-night/55 px-4 py-2 text-center font-display text-[15px] font-medium leading-snug text-[#f4f0ff] backdrop-blur-sm md:bottom-[168px] md:text-[18px]"
              style={{ textShadow: '0 0 18px rgba(124,92,255,.85)' }}
            >
              {assistant.thinking ? <span className="wave inline-flex h-6 items-end gap-[3px]"><span /><span /><span /><span /><span /></span> : assistant.caption}
            </p>
          )}

          {/* Barre de question */}
          <form onSubmit={submit} className="glass-dark fixed inset-x-3 bottom-[80px] z-30 mx-auto flex max-w-[640px] items-center gap-2 rounded-2xl py-1.5 pl-4 pr-1.5 md:bottom-[100px]">
            <label htmlFor="ask" className="sr-only">{dict.common.askLabel}</label>
            <input
              id="ask"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={assistant.listening ? dict.common.micListening : dict.common.askPlaceholder}
              maxLength={500}
              autoComplete="off"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
            />
            {assistant.speechSupported && (
              <button
                type="button"
                onClick={assistant.listen}
                aria-label={dict.common.mic}
                aria-pressed={assistant.listening}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-lav/30 ${assistant.listening ? 'bg-salmon text-[#2a1220]' : 'bg-violet/20 text-[#e7e0ff]'}`}
              >
                <Icon name="mic" size={19} />
              </button>
            )}
            <button type="submit" aria-label={dict.common.send} className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-salmon text-[#2a1220]">
              <Icon name="send" size={18} />
            </button>
          </form>

          {/* Navigation entre les scènes */}
          <nav aria-label="Scènes" className="glass-dark fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-max justify-between gap-1 rounded-[18px] p-1.5 md:bottom-6">
            {SCENES.map((s) => {
              const on = s.id === scene;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.id)}
                  aria-label={dict.nav[s.id]}
                  aria-current={on ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium transition md:px-3.5 ${on ? 'bg-violet/40 text-white shadow-[0_0_20px_rgba(124,92,255,.35)]' : 'text-muted hover:text-ink'}`}
                >
                  <Icon name={s.icon} size={19} />
                  {on && <span className="hidden md:inline">{dict.nav[s.id]}</span>}
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
