'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ErrorFeedbackProps {
  message: string;
  lineNumber?: number;
  onDismiss: () => void;
}

export function ErrorFeedback({ message, lineNumber, onDismiss }: ErrorFeedbackProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing'>('idle');

  const playVoice = useCallback(async () => {
    // If already playing, stop it
    if (ttsState === 'playing' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setTtsState('idle');
      return;
    }

    setTtsState('loading');

    try {
      const speakText = `军师摇了摇羽扇说：${message}`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speakText }),
      });

      if (!res.ok) {
        setTtsState('idle');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setTtsState('playing');
      await audio.play();
      audio.onended = () => {
        setTtsState('idle');
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
    } catch {
      setTtsState('idle');
    }
  }, [message, ttsState]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-end pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Click backdrop to dismiss */}
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={onDismiss}
      />

      {/* Speech bubble container */}
      <motion.div
        className="relative mr-4 mb-4 flex items-end gap-3 pointer-events-auto"
        style={{ maxWidth: 480 }}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Speech bubble */}
        <div
          className="relative rounded-2xl px-5 py-4 shadow-lg border-2"
          style={{
            backgroundColor: 'var(--color-parchment)',
            borderColor: 'var(--color-bamboo)',
          }}
        >
          {/* Advisor line */}
          <p
            className="text-base leading-relaxed"
            style={{
              color: 'var(--color-ink)',
              fontFamily: 'serif',
            }}
          >
            军师摇了摇羽扇：&ldquo;{message}&rdquo;
          </p>

          {/* Line number hint */}
          {lineNumber !== undefined && (
            <p
              className="mt-2 text-sm"
              style={{
                color: 'var(--color-bamboo)',
                fontFamily: 'serif',
              }}
            >
              第{lineNumber}行的阵法还需调整
            </p>
          )}

          {/* Action buttons row */}
          <div className="mt-3 flex gap-2">
            {/* Play voice button */}
            <button
              onClick={playVoice}
              className="flex-1 py-2 rounded-lg font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{
                backgroundColor: ttsState === 'playing' ? 'var(--color-wu-green)' : 'var(--color-gold)',
                color: ttsState === 'playing' ? 'white' : 'var(--color-ink)',
                fontFamily: 'serif',
              }}
            >
              {ttsState === 'loading' ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  加载中...
                </>
              ) : ttsState === 'playing' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  暂停
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 22v-20l18 10-18 10z" /></svg>
                  听军师讲解
                </>
              )}
            </button>

            {/* Try again button */}
            <button
              onClick={onDismiss}
              className="flex-1 py-2 rounded-lg text-white font-bold text-base transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-shu-red)',
                fontFamily: 'serif',
              }}
            >
              再试一次
            </button>
          </div>

          {/* Speech bubble triangle pointing to advisor */}
          <div
            className="absolute -right-3 bottom-6 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: `12px solid var(--color-parchment)`,
            }}
          />
        </div>

        {/* Advisor portrait — Zhuge Liang */}
        <div
          className={`flex-shrink-0 rounded-full border-3 shadow-md overflow-hidden transition-shadow ${ttsState === 'playing' ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
          style={{
            width: 64,
            height: 64,
            borderColor: 'var(--color-gold)',
          }}
        >
          <img
            src="/assets/generals/zhuge-liang.png"
            alt="诸葛亮"
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              el.parentElement!.style.backgroundColor = 'var(--color-wu-green)';
              el.parentElement!.innerHTML = '<span class="text-white font-bold text-lg" style="font-family:serif;display:flex;align-items:center;justify-content:center;width:100%;height:100%">诸葛</span>';
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
