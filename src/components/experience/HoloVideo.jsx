'use client';

import { useEffect, useRef } from 'react';

const POS = {
  center: 'left-1/2 -translate-x-1/2',
  small: 'left-1/2 -translate-x-1/2',
  left: 'left-1/2 -translate-x-1/2 md:left-[22%]',
  right: 'left-1/2 -translate-x-1/2 md:left-[74%]',
  hidden: 'left-1/2 -translate-x-1/2',
};

// Joue un clip parlant (vraie voix de Jemima) avec un traitement « hologramme ».
export default function HoloVideo({ video, muted, onEnd, layout = 'center' }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = muted;
    v.currentTime = 0;
    v.play().catch(() => {
      // Lecture auto bloquée par le navigateur : on relance sans le son
      v.muted = true;
      v.play().catch(() => onEnd?.());
    });
  }, [video, muted, onEnd]);

  return (
    <div className={`holo-video-wrap pointer-events-none fixed top-[10vh] z-[5] aspect-square w-[min(62vw,380px)] ${POS[layout] || POS.center}`}>
      <video
        ref={ref}
        src={video.url}
        playsInline
        onEnded={onEnd}
        onError={onEnd}
        className="holo-video h-full w-full object-cover"
        aria-label={video.text}
      />
    </div>
  );
}
