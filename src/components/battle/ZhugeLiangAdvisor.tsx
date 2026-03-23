'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type AdvisorState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

const WS_URL = process.env.NEXT_PUBLIC_WS_PROXY_URL || 'wss://wolong-ws-proxy.fly.dev';

interface ChallengeContext {
  chapterTitle: string;
  concept: string;
  prompt: string;
  codeTemplate?: string;
  hints: string[];
}

/**
 * Floating Zhuge Liang voice advisor — like Clippy but for Three Kingdoms Python learning.
 * Click avatar to open voice chat panel. Uses Doubao realtime dialog via WS proxy.
 */
export function ZhugeLiangAdvisor({ challengeContext }: { challengeContext?: ChallengeContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AdvisorState>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  // Queue PCM chunks and schedule playback for gapless audio
  const nextPlayTimeRef = useRef(0);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const cleanupResources = useCallback(() => {
    // Stop mic
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (playbackCtxRef.current) {
      playbackCtxRef.current.close().catch(() => {});
      playbackCtxRef.current = null;
    }
    // Close WS
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
      } catch {}
      wsRef.current.close();
      wsRef.current = null;
    }
    nextPlayTimeRef.current = 0;
    activeSourcesRef.current = [];
  }, []);

  const cleanup = useCallback(() => {
    cleanupResources();
    setState('idle');
  }, [cleanupResources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startSession = useCallback(async () => {
    setState('connecting');

    try {
      // 1. Get mic permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 },
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Set up AudioContext + Worklet for mic capture
      const audioCtx = new AudioContext({ sampleRate: 48000 });
      audioCtxRef.current = audioCtx;
      await audioCtx.audioWorklet.addModule('/mic-processor.js');
      const source = audioCtx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioCtx, 'mic-processor');
      workletNodeRef.current = workletNode;
      source.connect(workletNode);
      // Connect to a muted gain node so the AudioWorklet process() is invoked
      // (browsers skip processing for disconnected nodes)
      const mutedSink = audioCtx.createGain();
      mutedSink.gain.value = 0;
      workletNode.connect(mutedSink);
      mutedSink.connect(audioCtx.destination);

      // 3. Set up playback AudioContext (24kHz)
      const playbackCtx = new AudioContext({ sampleRate: 24000 });
      playbackCtxRef.current = playbackCtx;

      // 4. Connect to WS proxy
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'start',
          challengeContext: challengeContext || undefined,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'audio') {
            // Decode base64 PCM and play
            playPCMAudio(msg.data, playbackCtx);
          } else if (msg.type === 'state') {
            if (msg.state === 'listening') setState('listening');
            else if (msg.state === 'speaking') setState('speaking');
            else if (msg.state === 'user_speaking') {
              // User started speaking — cancel all queued/playing audio
              activeSourcesRef.current.forEach((s) => {
                try { s.stop(); } catch {}
              });
              activeSourcesRef.current = [];
              nextPlayTimeRef.current = 0;
              setState('listening');
            }
            else if (msg.state === 'error') setState('error');
            else if (msg.state === 'disconnected') setState('idle');
          }
        } catch {}
      };

      ws.onerror = () => {
        console.error('Voice advisor: WebSocket connection failed. Is the WS proxy running? (npm run dev:ws)');
        setState('error');
      };
      ws.onclose = () => {
        // Don't overwrite error state — let the retry button remain visible
        setState((prev) => (prev === 'error' ? 'error' : 'idle'));
      };

      // 5. Send mic audio chunks to WS
      workletNode.port.onmessage = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          const pcmBuffer = event.data as ArrayBuffer;
          const base64 = arrayBufferToBase64(pcmBuffer);
          ws.send(JSON.stringify({ type: 'audio', data: base64 }));
        }
      };

      // State transitions to 'listening' when proxy sends the state event
      // after Doubao handshake completes (StartConnection → StartSession → SayHello)
    } catch (err) {
      console.error('Failed to start voice session:', err);
      cleanupResources();
      setState('error');
    }
  }, [cleanupResources]);

  const playPCMAudio = useCallback(
    (base64Data: string, ctx: AudioContext) => {
      // Decode base64 to PCM bytes
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Convert to Float32 (Doubao sends PCM float32 at 24kHz)
      const float32 = new Float32Array(bytes.buffer);
      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Track for barge-in cancellation
      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      };

      // Schedule gapless playback
      const now = ctx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    },
    []
  );

  const handleToggle = useCallback(() => {
    if (isOpen) {
      cleanup();
      setIsOpen(false);
    } else {
      setIsOpen(true);
      startSession();
    }
  }, [isOpen, cleanup, startSession]);

  const handleClose = useCallback(() => {
    cleanup();
    setIsOpen(false);
  }, [cleanup]);

  // State-based visual properties
  const ringColor =
    state === 'listening'
      ? 'rgba(45, 106, 79, 0.8)' // green
      : state === 'speaking'
        ? 'rgba(196, 163, 60, 0.8)' // gold
        : state === 'connecting'
          ? 'rgba(100, 100, 100, 0.5)'
          : 'transparent';

  const isPulsing = state === 'listening' || state === 'speaking';

  return (
    <>
      {/* Floating avatar button */}
      <button
        onClick={handleToggle}
        className="flex items-center justify-center rounded-full shadow-lg border-2 transition-transform active:scale-90 cursor-pointer overflow-hidden"
        style={{
          width: 48,
          height: 48,
          borderColor: isOpen ? 'var(--color-wu-green)' : 'var(--color-gold)',
          backgroundColor: isOpen ? 'var(--color-wu-green)' : 'var(--color-parchment)',
        }}
        title="问诸葛亮 — 语音对话"
      >
        <img
          src="/assets/generals/zhuge-liang.png"
          alt="诸葛亮"
          className="w-full h-full object-cover"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            el.parentElement!.innerHTML =
              '<span class="text-white font-bold text-lg" style="font-family:serif">诸葛</span>';
          }}
        />
      </button>

      {/* Voice chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="advisor-panel"
            className="absolute bottom-16 right-0 z-30 flex flex-col items-center"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Panel card */}
            <div
              className="rounded-2xl shadow-2xl border-2 overflow-hidden flex flex-col items-center"
              style={{
                width: 200,
                backgroundColor: 'var(--color-parchment)',
                borderColor: 'var(--color-gold)',
              }}
            >
              {/* Header */}
              <div
                className="w-full px-3 py-1.5 flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-wei-blue)' }}
              >
                <span
                  className="text-white font-bold text-xs"
                  style={{ fontFamily: 'serif' }}
                >
                  军师诸葛亮
                </span>
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Avatar with animated ring */}
              <div className="relative py-4">
                {/* Pulsing ring */}
                {isPulsing && (
                  <motion.div
                    className="absolute inset-0 m-auto rounded-full"
                    style={{
                      width: 100,
                      height: 100,
                      border: `3px solid ${ringColor}`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 0.3, 0.8],
                    }}
                    transition={{
                      duration: state === 'speaking' ? 0.8 : 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Avatar circle */}
                <div
                  className="rounded-full border-3 overflow-hidden mx-auto relative z-10"
                  style={{
                    width: 80,
                    height: 80,
                    borderColor: ringColor !== 'transparent' ? ringColor : 'var(--color-gold)',
                    transition: 'border-color 0.3s',
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
                      el.parentElement!.innerHTML =
                        '<span class="text-white font-bold text-2xl" style="font-family:serif;display:flex;align-items:center;justify-content:center;width:100%;height:100%">诸葛</span>';
                    }}
                  />
                </div>
              </div>

              {/* Status text */}
              <div className="pb-3 px-3 text-center">
                <p
                  className="text-xs"
                  style={{
                    color: 'var(--color-ink)',
                    fontFamily: 'serif',
                  }}
                >
                  {state === 'connecting' && '正在连接...'}
                  {state === 'listening' && '正在听你说话...'}
                  {state === 'speaking' && '军师正在回答...'}
                  {state === 'error' && '连接出错'}
                  {state === 'idle' && '点击开始对话'}
                </p>
                {state === 'error' && (
                  <button
                    onClick={() => { cleanupResources(); startSession(); }}
                    className="mt-1 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-transform active:scale-95"
                    style={{
                      backgroundColor: 'var(--color-shu-red)',
                      color: 'white',
                      fontFamily: 'serif',
                    }}
                  >
                    重新连接
                  </button>
                )}
              </div>

              {/* Mic indicator */}
              {state === 'listening' && (
                <div className="pb-3 flex gap-1 items-end justify-center">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: 3,
                        backgroundColor: 'var(--color-wu-green)',
                      }}
                      animate={{
                        height: [8, 16, 8],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Speaking waveform */}
              {state === 'speaking' && (
                <div className="pb-3 flex gap-1 items-end justify-center">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: 3,
                        backgroundColor: 'var(--color-gold)',
                      }}
                      animate={{
                        height: [6, 20, 6],
                      }}
                      transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        delay: i * 0.07,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
