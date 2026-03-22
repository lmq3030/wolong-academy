'use client';

import { useRef, useState, useCallback } from 'react';

interface TTSButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
}

/**
 * Reusable TTS play button that calls /api/tts to generate speech.
 * Displays as a small speaker icon button with loading/playing states.
 */
export function TTSButton({ text, label = '听讲解', size = 'md' }: TTSButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');

  const handleClick = useCallback(async () => {
    if (state === 'playing' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setState('idle');
      return;
    }

    setState('loading');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setState('idle');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setState('playing');
      await audio.play();
      audio.onended = () => {
        setState('idle');
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
    } catch {
      setState('idle');
    }
  }, [text, state]);

  const isSmall = size === 'sm';

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-bold cursor-pointer
        transition-all active:scale-95
        ${isSmall ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'}
        ${state === 'playing'
          ? 'bg-green-600 text-white'
          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
        }
      `}
      style={{ fontFamily: 'serif' }}
      title={state === 'playing' ? '点击暂停' : label}
    >
      {state === 'loading' ? (
        <>
          <span className={`inline-block border-2 border-current border-t-transparent rounded-full animate-spin ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          {!isSmall && '加载中...'}
        </>
      ) : state === 'playing' ? (
        <>
          <svg width={isSmall ? 14 : 16} height={isSmall ? 14 : 16} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          {!isSmall && '暂停'}
        </>
      ) : (
        <>
          <svg width={isSmall ? 14 : 16} height={isSmall ? 14 : 16} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.5 4.5 0 002.5-3.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
          {!isSmall && label}
        </>
      )}
    </button>
  );
}
