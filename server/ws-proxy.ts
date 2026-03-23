/**
 * WebSocket proxy server for Doubao Realtime Dialog API.
 *
 * Bridges browser WebSocket (raw PCM audio) ↔ Doubao binary protocol.
 * Browser sends: { type: 'audio', data: base64PCM } or { type: 'start' | 'stop' }
 * Browser receives: { type: 'audio', data: base64PCM } or { type: 'state', state: string } or { type: 'text', text: string }
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { gzipSync, gunzipSync } from 'zlib';
import { randomUUID } from 'crypto';

// ── Doubao Config ──────────────────────────────────────────────────────

const DOUBAO_APP_ID = process.env.DOUBAO_APP_ID || '';
const DOUBAO_ACCESS_KEY = process.env.DOUBAO_ACCESS_TOKEN || '';
const DOUBAO_WS_URL = 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue';
const RESOURCE_ID = 'volc.speech.dialog';
const APP_KEY = 'PlgvMymc7f3tQnJ6'; // fixed value from Doubao docs

const SESSION_CONFIG = {
  asr: {
    extra: {
      end_smooth_window_ms: 1500,
    },
  },
  tts: {
    speaker: 'zh_male_xiaotian_jupiter_bigtts',
    audio_config: {
      channel: 1,
      format: 'pcm',
      sample_rate: 24000,
    },
  },
  dialog: {
    bot_name: '诸葛亮',
    system_role:
      '你是诸葛亮，卧龙学堂的军师。你正在教一个8-9岁的小朋友学习Python编程。你用三国故事来解释编程概念，语气温和有耐心，像一个智慧的老师。',
    speaking_style:
      '说话像古代军师，偶尔用三国典故，但用词简单，让小朋友能听懂。',
    location: { city: '成都' },
    extra: {
      strict_audit: false,
      recv_timeout: 30,
      input_mod: 'audio',
    },
  },
};

// ── Binary Protocol ────────────────────────────────────────────────────

const PROTOCOL_VERSION = 0b0001;

// Message types
const CLIENT_FULL_REQUEST = 0b0001;
const CLIENT_AUDIO_ONLY_REQUEST = 0b0010;
const SERVER_FULL_RESPONSE = 0b1001;
const SERVER_ACK = 0b1011;
const SERVER_ERROR_RESPONSE = 0b1111;

// Flags
const MSG_WITH_EVENT = 0b0100;
const NEG_SEQUENCE = 0b0010;

// Serialization
const NO_SERIALIZATION = 0b0000;
const JSON_SERIAL = 0b0001;

// Compression
const GZIP = 0b0001;

function generateHeader(
  messageType: number = CLIENT_FULL_REQUEST,
  serialMethod: number = JSON_SERIAL,
  compressionType: number = GZIP,
  flags: number = MSG_WITH_EVENT
): Buffer {
  const headerSize = 1; // no extension headers
  const header = Buffer.alloc(4);
  header[0] = (PROTOCOL_VERSION << 4) | headerSize;
  header[1] = (messageType << 4) | flags;
  header[2] = (serialMethod << 4) | compressionType;
  header[3] = 0x00; // reserved
  return header;
}

function buildRequest(
  eventId: number,
  sessionId: string,
  payload: object | null,
  messageType: number = CLIENT_FULL_REQUEST,
  serialMethod: number = JSON_SERIAL
): Buffer {
  const header = generateHeader(messageType, serialMethod, GZIP, MSG_WITH_EVENT);
  const parts: Buffer[] = [header];

  // Event ID (4 bytes)
  const eventBuf = Buffer.alloc(4);
  eventBuf.writeUInt32BE(eventId);
  parts.push(eventBuf);

  // Session ID (4 bytes length + data) — only for session-scoped events
  if (sessionId) {
    const sidBuf = Buffer.from(sessionId, 'utf-8');
    const sidLen = Buffer.alloc(4);
    sidLen.writeUInt32BE(sidBuf.length);
    parts.push(sidLen, sidBuf);
  }

  // Payload
  const payloadStr = payload ? JSON.stringify(payload) : '{}';
  const compressed = gzipSync(Buffer.from(payloadStr, 'utf-8'));
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(compressed.length);
  parts.push(payloadLen, compressed);

  return Buffer.concat(parts);
}

function buildAudioRequest(
  sessionId: string,
  audioData: Buffer
): Buffer {
  const header = generateHeader(
    CLIENT_AUDIO_ONLY_REQUEST,
    NO_SERIALIZATION,
    GZIP,
    MSG_WITH_EVENT
  );
  const parts: Buffer[] = [header];

  // Event ID = 200 (audio data)
  const eventBuf = Buffer.alloc(4);
  eventBuf.writeUInt32BE(200);
  parts.push(eventBuf);

  // Session ID
  const sidBuf = Buffer.from(sessionId, 'utf-8');
  const sidLen = Buffer.alloc(4);
  sidLen.writeUInt32BE(sidBuf.length);
  parts.push(sidLen, sidBuf);

  // Audio payload (gzip compressed)
  const compressed = gzipSync(audioData);
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(compressed.length);
  parts.push(payloadLen, compressed);

  return Buffer.concat(parts);
}

interface ParsedResponse {
  message_type: string;
  event?: number;
  session_id?: string;
  payload_msg?: any;
  payload_size?: number;
  code?: number;
}

function parseResponse(res: Buffer): ParsedResponse {
  if (res.length < 4) return { message_type: 'UNKNOWN' };

  const messageType = res[1] >> 4;
  const flags = res[1] & 0x0f;
  const serialMethod = res[2] >> 4;
  const compression = res[2] & 0x0f;
  const headerSize = res[0] & 0x0f;

  let payload = res.subarray(headerSize * 4);
  const result: ParsedResponse = { message_type: 'UNKNOWN' };
  let start = 0;

  if (messageType === SERVER_FULL_RESPONSE || messageType === SERVER_ACK) {
    result.message_type = messageType === SERVER_ACK ? 'SERVER_ACK' : 'SERVER_FULL_RESPONSE';

    if (flags & NEG_SEQUENCE) {
      start += 4;
    }
    if (flags & MSG_WITH_EVENT) {
      result.event = payload.readUInt32BE(0);
      start += 4;
    }
    payload = payload.subarray(start);

    // Session ID
    const sidSize = payload.readInt32BE(0);
    const sid = payload.subarray(4, 4 + sidSize).toString('utf-8');
    result.session_id = sid;
    payload = payload.subarray(4 + sidSize);

    // Payload data
    const payloadSize = payload.readUInt32BE(0);
    result.payload_size = payloadSize;
    let payloadMsg = payload.subarray(4);

    if (payloadMsg.length > 0) {
      if (compression === GZIP) {
        try {
          payloadMsg = Buffer.from(gunzipSync(payloadMsg));
        } catch {
          // Not gzipped or raw audio — return as-is
        }
      }
      if (serialMethod === JSON_SERIAL) {
        try {
          result.payload_msg = JSON.parse(payloadMsg.toString('utf-8'));
        } catch {
          result.payload_msg = payloadMsg;
        }
      } else {
        // Raw binary (audio data)
        result.payload_msg = payloadMsg;
      }
    }
  } else if (messageType === SERVER_ERROR_RESPONSE) {
    result.message_type = 'SERVER_ERROR';
    result.code = payload.readUInt32BE(0);
    const payloadSize = payload.readUInt32BE(4);
    let payloadMsg = payload.subarray(8);
    if (compression === GZIP) {
      try {
        payloadMsg = Buffer.from(gunzipSync(payloadMsg));
      } catch {
        // ignore
      }
    }
    try {
      result.payload_msg = JSON.parse(payloadMsg.toString('utf-8'));
    } catch {
      result.payload_msg = payloadMsg.toString('utf-8');
    }
  }

  return result;
}

// ── Dialog Session ─────────────────────────────────────────────────────

class DoubaoDialogSession {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private browserWs: WebSocket;
  private isActive = false;

  constructor(browserWs: WebSocket) {
    this.browserWs = browserWs;
    this.sessionId = randomUUID();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(DOUBAO_WS_URL, {
        headers: {
          'X-Api-App-ID': DOUBAO_APP_ID,
          'X-Api-Access-Key': DOUBAO_ACCESS_KEY,
          'X-Api-Resource-Id': RESOURCE_ID,
          'X-Api-App-Key': APP_KEY,
          'X-Api-Connect-Id': randomUUID(),
        },
      });

      this.ws.on('open', async () => {
        try {
          console.log('[doubao] connected');
          await this.startConnection();
          await this.startSession();
          await this.sayHello();
          this.isActive = true;
          this.sendState('listening');
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      this.ws.on('message', (data: Buffer) => {
        this.handleDoubaoMessage(data);
      });

      this.ws.on('error', (err) => {
        console.error('[doubao] ws error:', err.message);
        this.sendState('error');
      });

      this.ws.on('close', () => {
        console.log('[doubao] ws closed');
        this.isActive = false;
        this.sendState('disconnected');
      });
    });
  }

  private async startConnection(): Promise<void> {
    // Event 1 = StartConnection, no session ID
    const header = generateHeader();
    const eventBuf = Buffer.alloc(4);
    eventBuf.writeUInt32BE(1);
    const payloadBytes = gzipSync(Buffer.from('{}', 'utf-8'));
    const payloadLen = Buffer.alloc(4);
    payloadLen.writeUInt32BE(payloadBytes.length);
    const msg = Buffer.concat([header, eventBuf, payloadLen, payloadBytes]);

    this.ws!.send(msg);
    await this.waitForResponse();
    console.log('[doubao] StartConnection OK');
  }

  private async startSession(): Promise<void> {
    const msg = buildRequest(100, this.sessionId, SESSION_CONFIG);
    this.ws!.send(msg);
    await this.waitForResponse();
    console.log('[doubao] StartSession OK');
  }

  private async sayHello(): Promise<void> {
    const payload = { content: '你好，小勇士！我是诸葛亮，你的军师。有什么编程问题尽管问我吧！' };
    const msg = buildRequest(300, this.sessionId, payload);
    this.ws!.send(msg);
    console.log('[doubao] SayHello sent');
  }

  private waitForResponse(): Promise<ParsedResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for Doubao response')), 10000);
      const handler = (data: Buffer) => {
        clearTimeout(timeout);
        this.ws!.off('message', handler);
        resolve(parseResponse(data));
      };
      this.ws!.on('message', handler);
    });
  }

  private handleDoubaoMessage(data: Buffer): void {
    const response = parseResponse(data);
    if (response.message_type === 'UNKNOWN') return;

    if (response.message_type === 'SERVER_ACK' && Buffer.isBuffer(response.payload_msg)) {
      // Audio data — forward to browser as base64
      const audioBase64 = response.payload_msg.toString('base64');
      this.sendToBrowser({ type: 'audio', data: audioBase64 });
    } else if (response.message_type === 'SERVER_FULL_RESPONSE') {
      const event = response.event;

      // Event 450 = user started speaking (clear audio buffer)
      if (event === 450) {
        this.sendToBrowser({ type: 'state', state: 'user_speaking' });
        this.sendState('listening');
      }

      // Event 459 = bot finished processing user input
      if (event === 459) {
        this.sendState('speaking');
      }

      // Event 350 = TTS started
      if (event === 350) {
        this.sendState('speaking');
      }

      // Event 359 = TTS ended
      if (event === 359) {
        this.sendState('listening');
      }

      // Event 152/153 = session finished
      if (event === 152 || event === 153) {
        console.log('[doubao] session finished');
        this.isActive = false;
      }

      // If payload has text content, forward it
      if (response.payload_msg?.text) {
        this.sendToBrowser({ type: 'text', text: response.payload_msg.text });
      }
    } else if (response.message_type === 'SERVER_ERROR') {
      console.error('[doubao] server error:', response.payload_msg);
      this.sendState('error');
    }
  }

  sendAudio(pcmData: Buffer): void {
    if (!this.isActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const msg = buildAudioRequest(this.sessionId, pcmData);
    this.ws.send(msg);
  }

  async close(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      // FinishSession
      const finishSession = buildRequest(102, this.sessionId, {});
      this.ws.send(finishSession);

      // Wait briefly for session finish
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      // FinishConnection (no session ID)
      const header = generateHeader();
      const eventBuf = Buffer.alloc(4);
      eventBuf.writeUInt32BE(2);
      const payloadBytes = gzipSync(Buffer.from('{}', 'utf-8'));
      const payloadLen = Buffer.alloc(4);
      payloadLen.writeUInt32BE(payloadBytes.length);
      const msg = Buffer.concat([header, eventBuf, payloadLen, payloadBytes]);
      this.ws.send(msg);

      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      this.ws.close();
    } catch (err) {
      console.error('[doubao] close error:', err);
      this.ws?.close();
    }
  }

  private sendState(state: string): void {
    this.sendToBrowser({ type: 'state', state });
  }

  private sendToBrowser(msg: object): void {
    if (this.browserWs.readyState === WebSocket.OPEN) {
      this.browserWs.send(JSON.stringify(msg));
    }
  }
}

// ── HTTP + WebSocket Server ────────────────────────────────────────────

const PORT = parseInt(process.env.WS_PROXY_PORT || '3001', 10);

const server = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (browserWs) => {
  console.log('[proxy] browser connected');
  let session: DoubaoDialogSession | null = null;

  browserWs.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'start') {
        if (session) {
          await session.close();
        }
        session = new DoubaoDialogSession(browserWs);
        await session.connect();
        console.log('[proxy] dialog session started');
      } else if (msg.type === 'audio' && session) {
        const pcmData = Buffer.from(msg.data, 'base64');
        session.sendAudio(pcmData);
      } else if (msg.type === 'stop') {
        if (session) {
          await session.close();
          session = null;
        }
        console.log('[proxy] dialog session stopped');
      }
    } catch (err) {
      console.error('[proxy] message error:', err);
    }
  });

  browserWs.on('close', async () => {
    console.log('[proxy] browser disconnected');
    if (session) {
      await session.close();
      session = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`[proxy] Doubao dialog proxy listening on ws://localhost:${PORT}`);
});
