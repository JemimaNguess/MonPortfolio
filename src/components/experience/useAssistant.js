'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function getSessionId() {
  try {
    let id = sessionStorage.getItem('mj_session');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('mj_session', id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function pickVoice(lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const wanted = lang === 'en' ? 'en' : 'fr';
  const inLang = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(wanted));
  const female = inLang.find((v) => /female|femme|amelie|amélie|audrey|marie|julie|denise|aria|jenny|samantha|google français|google us english/i.test(v.name));
  return female || inLang[0] || null;
}

/**
 * Cerveau côté navigateur : envoie la question à /api/chat, joue le clip ou lit la réponse,
 * affiche les sous-titres, et transmet l'action (ouvrir une scène) à l'expérience.
 */
export default function useAssistant({ locale, soundOn, onAction }) {
  const [caption, setCaption] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [video, setVideo] = useState(null); // { url, text }
  const recognition = useRef(null);
  const hideTimer = useRef(null);
  // Les sous-titres disparaissent quelques secondes après la fin de la parole
  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCaption(''), 5000);
  }, []);
  const actionRef = useRef(onAction);
  actionRef.current = onAction;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => { try { window.speechSynthesis?.cancel(); } catch {} };
  }, []);

  const stop = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setSpeaking(false);
    setVideo(null);
  }, []);

  const say = useCallback((text) => {
    clearTimeout(hideTimer.current);
    setCaption(text);
    if (!soundOn || typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeaking(true);
      const ms = Math.min(9000, 1200 + text.length * 45);
      setTimeout(() => { setSpeaking(false); scheduleHide(); }, ms);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale === 'en' ? 'en-US' : 'fr-FR';
      const v = pickVoice(locale);
      if (v) u.voice = v;
      u.rate = 1.02;
      u.pitch = 1.05;
      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); scheduleHide(); };
      u.onerror = () => { setSpeaking(false); scheduleHide(); };
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  }, [soundOn, locale, scheduleHide]);

  const ask = useCallback(async (question) => {
    const q = String(question || '').trim();
    if (!q) return;
    stop();
    clearTimeout(hideTimer.current);
    setThinking(true);
    setCaption('…');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, lang: locale, sessionId: getSessionId() }),
      });
      const data = await res.json();
      setThinking(false);
      if (data.videoUrl) {
        setCaption(data.answer);
        setVideo({ url: data.videoUrl, text: data.answer });
        setSpeaking(true);
      } else {
        say(data.answer || '');
      }
      if (data.action && data.action !== 'none') actionRef.current?.(data.action, data);
    } catch {
      setThinking(false);
      say(locale === 'en' ? 'My connection dropped for a moment. Try again?' : 'Ma connexion a sauté une seconde. Tu peux reposer ta question ?');
    }
  }, [locale, say, stop]);

  const [speechSupported, setSpeechSupported] = useState(false);
  useEffect(() => { setSpeechSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)); }, []);

  const listen = useCallback(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return false;
    if (listening) { recognition.current?.stop(); return true; }
    stop();
    const r = new SR();
    r.lang = locale === 'en' ? 'en-US' : 'fr-FR';
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      const text = result[0].transcript;
      setCaption(text);
      if (result.isFinal) ask(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognition.current = r;
    setListening(true);
    r.start();
    return true;
  }, [listening, locale, ask, stop]);

  const onVideoEnd = useCallback(() => { setVideo(null); setSpeaking(false); scheduleHide(); }, [scheduleHide]);

  return { caption, setCaption, speaking, thinking, listening, video, ask, say, listen, stop, onVideoEnd, speechSupported };
}
