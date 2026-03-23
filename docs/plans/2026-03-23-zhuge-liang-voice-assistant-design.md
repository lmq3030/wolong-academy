# Design: 诸葛亮 Voice Assistant (Realtime Dialog)

## Overview
A Clippy-style floating Zhuge Liang voice advisor that kids can talk to for help with Python concepts. Uses Doubao's realtime dialog WebSocket API for bidirectional voice chat.

## UX Flow
- Bottom-right floating Zhuge Liang avatar (always visible during battle)
- Click avatar to open voice chat panel (slide-up from avatar position)
- Always-on voice within panel — Doubao handles VAD server-side
- Close panel to disconnect and stop
- Hybrid interaction: intentional activation (click), natural conversation once open

## Architecture
```
Browser (Web Audio API)         WS Proxy (port 3001)         Doubao
  ├─ mic capture 16kHz PCM ──→  ├─ binary protocol ──────→  realtime/dialogue
  ├─ receive PCM audio ←──────  ├─ parse responses ←──────  (VAD, LLM, TTS)
  └─ AudioContext playback       └─ session lifecycle
```

## Server: WebSocket Proxy (`server/ws-proxy.ts`)
- Node.js + `ws` library, runs on port 3001
- Handles full Doubao binary protocol (header gen, gzip, response parsing)
- Session lifecycle: StartConnection → StartSession → SayHello → bidirectional audio → FinishSession
- Browser sends raw PCM audio frames, proxy wraps in binary protocol
- Proxy forwards decoded PCM audio back to browser
- Auth headers: X-Api-App-Id, X-Api-Access-Key, X-Api-Resource-Id (volc.speech.dialog), X-Api-App-Key

## Client: `<ZhugeLiangAdvisor>` component
- Floating avatar button (alongside existing 问/锦/Py buttons)
- On click: opens slide-up panel, connects to ws://localhost:3001, requests mic permission
- Web Audio API: AudioContext + AudioWorklet for mic capture (16kHz mono PCM int16)
- Playback: AudioContext with PCM decoding (24kHz mono)
- Visual states:
  - Idle: subtle breathing animation
  - Listening: green pulsing ring (mic active)
  - Thinking: loading indicator
  - Speaking: waveform/pulse animation around portrait
- Close button disconnects WebSocket, stops mic, closes panel

## Doubao Session Config
- **endpoint**: wss://openspeech.bytedance.com/api/v3/realtime/dialogue
- **bot_name**: "诸葛亮"
- **system_role**: "你是诸葛亮，卧龙学堂的军师。你正在教一个8-9岁的小朋友学习Python编程。你用三国故事来解释编程概念，语气温和有耐心，像一个智慧的老师。"
- **speaking_style**: "说话像古代军师，偶尔用三国典故，但用词简单，让小朋友能听懂。"
- **speaker**: zh_male_xiaotian_jupiter_bigtts
- **resource_id**: volc.speech.dialog
- **app_key**: PlgvMymc7f3tQnJ6 (fixed value from demo)

## Audio Config
- Input: 16kHz, mono, PCM int16, 3200-byte chunks (100ms)
- Output: 24kHz, mono, PCM float32

## npm Scripts
- `"dev:ws"`: runs WS proxy server
- `"dev:all"`: runs both next dev and WS proxy concurrently
