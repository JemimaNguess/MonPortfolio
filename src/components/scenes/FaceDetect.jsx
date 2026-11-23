'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

// Démo Labo : détection de visage dans le navigateur (MediaPipe). Rien ne quitte l'appareil.
export default function FaceDetect({ t }) {
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const [mode, setMode] = useState('idle'); // idle | loading | camera | photo | error
  const [faces, setFaces] = useState(0);

  const getDetector = useCallback(async (runningMode) => {
    if (!detectorRef.current) {
      const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(WASM);
      detectorRef.current = await FaceDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
        runningMode,
        minDetectionConfidence: 0.5,
      });
    } else {
      await detectorRef.current.setOptions({ runningMode });
    }
    return detectorRef.current;
  }, []);

  const draw = useCallback((detections, srcW, srcH) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = srcW; canvas.height = srcH;
    ctx.clearRect(0, 0, srcW, srcH);
    ctx.lineWidth = Math.max(3, srcW / 160);
    ctx.strokeStyle = '#ffb4a2';
    ctx.fillStyle = '#ffb4a2';
    ctx.font = `600 ${Math.max(14, srcW / 40)}px Inter, sans-serif`;
    for (const d of detections) {
      const b = d.boundingBox;
      if (!b) continue;
      const c = Math.min(b.width, b.height) * 0.22;
      const corners = [
        [b.originX, b.originY, 1, 1], [b.originX + b.width, b.originY, -1, 1],
        [b.originX, b.originY + b.height, 1, -1], [b.originX + b.width, b.originY + b.height, -1, -1],
      ];
      ctx.beginPath();
      for (const [x, y, sx, sy] of corners) { ctx.moveTo(x + sx * c, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * c); }
      ctx.stroke();
      const score = d.categories?.[0]?.score;
      ctx.fillText(score ? `${Math.round(score * 100)} %` : '', b.originX, Math.max(18, b.originY - 8));
    }
    setFaces(detections.length);
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => { stopCamera(); detectorRef.current?.close?.(); }, [stopCamera]);

  const startCamera = async () => {
    if (mode === 'camera') { stopCamera(); setMode('idle'); setFaces(0); return; }
    setMode('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const detector = await getDetector('VIDEO');
      setMode('camera');
      let last = -1;
      const loop = () => {
        if (!streamRef.current) return;
        if (video.currentTime !== last) {
          last = video.currentTime;
          const res = detector.detectForVideo(video, performance.now());
          draw(res.detections || [], video.videoWidth, video.videoHeight);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      console.error(e);
      stopCamera();
      setMode('error');
    }
  };

  const tryPhoto = async () => {
    stopCamera();
    setMode('loading');
    try {
      const img = imgRef.current;
      if (!img.complete) await new Promise((r) => { img.onload = r; });
      const detector = await getDetector('IMAGE');
      const res = detector.detect(img);
      setMode('photo');
      draw(res.detections || [], img.naturalWidth, img.naturalHeight);
    } catch (e) {
      console.error(e);
      setMode('error');
    }
  };

  const status = mode === 'loading' ? t.faceLoading
    : mode === 'error' ? t.faceError
    : mode === 'camera' || mode === 'photo' ? (faces ? `${t.faceDetected}${faces > 1 ? ` × ${faces}` : ''}` : t.faceNone)
    : t.faceIdle;

  return (
    <div className="flex flex-col gap-4">
      <div className="scanlines relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_40%,#1d1638,#07060d_75%)] md:h-[380px]">
        <video ref={videoRef} playsInline muted className={`absolute inset-0 h-full w-full -scale-x-100 object-contain ${mode === 'camera' ? '' : 'hidden'}`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src="/holo/portrait.png" alt="" className={`absolute inset-0 h-full w-full object-contain ${mode === 'photo' ? '' : 'hidden'}`} />
        <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full object-contain ${mode === 'camera' ? '-scale-x-100' : ''} ${mode === 'camera' || mode === 'photo' ? '' : 'hidden'}`} />
        {mode === 'camera' && (
          <span className="absolute left-4 top-3.5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-salmon">
            <span className="h-2 w-2 rounded-full bg-salmon" />{t.live}
          </span>
        )}
        <span className={`absolute left-1/2 top-3 -translate-x-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold ${faces && (mode === 'camera' || mode === 'photo') ? 'bg-salmon text-[#2a1220]' : 'bg-white/10 text-ink'}`} aria-live="polite">
          {status}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={startCamera}>
          <Icon name="camera" size={18} /> {mode === 'camera' ? t.stopCamera : t.startCamera}
        </button>
        <button type="button" className="btn-secondary" onClick={tryPhoto}>{t.tryPhoto}</button>
      </div>
      <p className="muted flex items-center gap-2"><Icon name="shield" size={16} /> {t.privacy}</p>
    </div>
  );
}
