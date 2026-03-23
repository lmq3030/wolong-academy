/**
 * WebSocket proxy server for Doubao Realtime Dialog API.
 * Deployed on Fly.io — bridges browser WebSocket ↔ Doubao binary protocol.
 */

const { WebSocketServer, WebSocket } = require('ws');
const { createServer } = require('http');
const { gzipSync, gunzipSync } = require('zlib');
const { randomUUID } = require('crypto');

// ── Config ─────────────────────────────────────────────────────────────

const DOUBAO_APP_ID = process.env.DOUBAO_APP_ID || '';
const DOUBAO_ACCESS_KEY = process.env.DOUBAO_ACCESS_TOKEN || '';
const DOUBAO_WS_URL = 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue';
const RESOURCE_ID = 'volc.speech.dialog';
const APP_KEY = 'PlgvMymc7f3tQnJ6';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const SESSION_CONFIG = {
  asr: { extra: { end_smooth_window_ms: 1500 } },
  tts: {
    speaker: 'zh_male_xiaotian_jupiter_bigtts',
    audio_config: { channel: 1, format: 'pcm', sample_rate: 24000 },
  },
  dialog: {
    bot_name: '诸葛亮',
    system_role: '你是诸葛亮，卧龙学堂的军师。你正在教一个8-9岁的小朋友学习Python编程。你用三国故事来解释编程概念，语气温和有耐心，像一个智慧的老师。',
    speaking_style: '说话像古代军师，偶尔用三国典故，但用词简单，让小朋友能听懂。',
    location: { city: '成都' },
    extra: { strict_audit: false, recv_timeout: 30, input_mod: 'audio' },
  },
};

// ── Binary Protocol ────────────────────────────────────────────────────

const PROTOCOL_VERSION = 0b0001;
const CLIENT_FULL_REQUEST = 0b0001;
const CLIENT_AUDIO_ONLY_REQUEST = 0b0010;
const SERVER_FULL_RESPONSE = 0b1001;
const SERVER_ACK = 0b1011;
const SERVER_ERROR_RESPONSE = 0b1111;
const MSG_WITH_EVENT = 0b0100;
const NEG_SEQUENCE = 0b0010;
const NO_SERIALIZATION = 0b0000;
const JSON_SERIAL = 0b0001;
const GZIP = 0b0001;

function generateHeader(messageType = CLIENT_FULL_REQUEST, serialMethod = JSON_SERIAL, compressionType = GZIP, flags = MSG_WITH_EVENT) {
  const header = Buffer.alloc(4);
  header[0] = (PROTOCOL_VERSION << 4) | 1;
  header[1] = (messageType << 4) | flags;
  header[2] = (serialMethod << 4) | compressionType;
  header[3] = 0x00;
  return header;
}

function buildRequest(eventId, sessionId, payload) {
  const header = generateHeader();
  const parts = [header];
  const eventBuf = Buffer.alloc(4);
  eventBuf.writeUInt32BE(eventId);
  parts.push(eventBuf);
  if (sessionId) {
    const sidBuf = Buffer.from(sessionId, 'utf-8');
    const sidLen = Buffer.alloc(4);
    sidLen.writeUInt32BE(sidBuf.length);
    parts.push(sidLen, sidBuf);
  }
  const payloadStr = payload ? JSON.stringify(payload) : '{}';
  const compressed = gzipSync(Buffer.from(payloadStr, 'utf-8'));
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(compressed.length);
  parts.push(payloadLen, compressed);
  return Buffer.concat(parts);
}

function buildAudioRequest(sessionId, audioData) {
  const header = generateHeader(CLIENT_AUDIO_ONLY_REQUEST, NO_SERIALIZATION, GZIP, MSG_WITH_EVENT);
  const parts = [header];
  const eventBuf = Buffer.alloc(4);
  eventBuf.writeUInt32BE(200);
  parts.push(eventBuf);
  const sidBuf = Buffer.from(sessionId, 'utf-8');
  const sidLen = Buffer.alloc(4);
  sidLen.writeUInt32BE(sidBuf.length);
  parts.push(sidLen, sidBuf);
  const compressed = gzipSync(audioData);
  const payloadLen = Buffer.alloc(4);
  payloadLen.writeUInt32BE(compressed.length);
  parts.push(payloadLen, compressed);
  return Buffer.concat(parts);
}

function parseResponse(res) {
  if (res.length < 4) return { message_type: 'UNKNOWN' };
  const messageType = res[1] >> 4;
  const flags = res[1] & 0x0f;
  const serialMethod = res[2] >> 4;
  const compression = res[2] & 0x0f;
  const headerSize = res[0] & 0x0f;
  let payload = res.subarray(headerSize * 4);
  const result = { message_type: 'UNKNOWN' };
  let start = 0;

  if (messageType === SERVER_FULL_RESPONSE || messageType === SERVER_ACK) {
    result.message_type = messageType === SERVER_ACK ? 'SERVER_ACK' : 'SERVER_FULL_RESPONSE';
    if (flags & NEG_SEQUENCE) start += 4;
    if (flags & MSG_WITH_EVENT) { result.event = payload.readUInt32BE(0); start += 4; }
    payload = payload.subarray(start);
    const sidSize = payload.readInt32BE(0);
    result.session_id = payload.subarray(4, 4 + sidSize).toString('utf-8');
    payload = payload.subarray(4 + sidSize);
    result.payload_size = payload.readUInt32BE(0);
    let payloadMsg = payload.subarray(4);
    if (payloadMsg.length > 0) {
      if (compression === GZIP) { try { payloadMsg = Buffer.from(gunzipSync(payloadMsg)); } catch {} }
      if (serialMethod === JSON_SERIAL) { try { result.payload_msg = JSON.parse(payloadMsg.toString('utf-8')); } catch { result.payload_msg = payloadMsg; } }
      else { result.payload_msg = payloadMsg; }
    }
  } else if (messageType === SERVER_ERROR_RESPONSE) {
    result.message_type = 'SERVER_ERROR';
    result.code = payload.readUInt32BE(0);
    let payloadMsg = payload.subarray(8);
    if (compression === GZIP) { try { payloadMsg = Buffer.from(gunzipSync(payloadMsg)); } catch {} }
    try { result.payload_msg = JSON.parse(payloadMsg.toString('utf-8')); } catch { result.payload_msg = payloadMsg.toString('utf-8'); }
  }
  return result;
}

// ── Dialog Session ─────────────────────────────────────────────────────

class DoubaoDialogSession {
  constructor(browserWs) {
    this.ws = null;
    this.browserWs = browserWs;
    this.sessionId = randomUUID();
    this.isActive = false;
  }

  async connect() {
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
          await this._startConnection();
          await this._startSession();
          await this._sayHello();
          this.isActive = true;
          this._sendState('listening');
          resolve();
        } catch (err) { reject(err); }
      });
      this.ws.on('message', (data) => this._handleMessage(data));
      this.ws.on('error', (err) => { console.error('[doubao] error:', err.message); this._sendState('error'); });
      this.ws.on('close', () => { this.isActive = false; this._sendState('disconnected'); });
    });
  }

  async _startConnection() {
    const header = generateHeader();
    const eventBuf = Buffer.alloc(4); eventBuf.writeUInt32BE(1);
    const pb = gzipSync(Buffer.from('{}', 'utf-8'));
    const pl = Buffer.alloc(4); pl.writeUInt32BE(pb.length);
    this.ws.send(Buffer.concat([header, eventBuf, pl, pb]));
    await this._waitForResponse();
    console.log('[doubao] StartConnection OK');
  }

  async _startSession() {
    this.ws.send(buildRequest(100, this.sessionId, SESSION_CONFIG));
    await this._waitForResponse();
    console.log('[doubao] StartSession OK');
  }

  async _sayHello() {
    this.ws.send(buildRequest(300, this.sessionId, { content: '你好，小勇士！我是诸葛亮，你的军师。有什么编程问题尽管问我吧！' }));
    console.log('[doubao] SayHello sent');
  }

  _waitForResponse() {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Timeout')), 10000);
      const h = (data) => { clearTimeout(t); this.ws.off('message', h); resolve(parseResponse(data)); };
      this.ws.on('message', h);
    });
  }

  _handleMessage(data) {
    const r = parseResponse(data);
    if (r.message_type === 'UNKNOWN') return;
    if (r.message_type === 'SERVER_ACK' && Buffer.isBuffer(r.payload_msg)) {
      this._send({ type: 'audio', data: r.payload_msg.toString('base64') });
    } else if (r.message_type === 'SERVER_FULL_RESPONSE') {
      if (r.event === 450) { this._send({ type: 'state', state: 'user_speaking' }); this._sendState('listening'); }
      if (r.event === 459 || r.event === 350) this._sendState('speaking');
      if (r.event === 359) this._sendState('listening');
      if (r.event === 152 || r.event === 153) { this.isActive = false; }
      if (r.payload_msg?.text) this._send({ type: 'text', text: r.payload_msg.text });
    } else if (r.message_type === 'SERVER_ERROR') {
      console.error('[doubao] error:', r.payload_msg);
      this._sendState('error');
    }
  }

  sendAudio(pcmData) {
    if (!this.isActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(buildAudioRequest(this.sessionId, pcmData));
  }

  async close() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(buildRequest(102, this.sessionId, {}));
      await new Promise(r => setTimeout(r, 500));
      const header = generateHeader();
      const eb = Buffer.alloc(4); eb.writeUInt32BE(2);
      const pb = gzipSync(Buffer.from('{}', 'utf-8'));
      const pl = Buffer.alloc(4); pl.writeUInt32BE(pb.length);
      this.ws.send(Buffer.concat([header, eb, pl, pb]));
      await new Promise(r => setTimeout(r, 200));
      this.ws.close();
    } catch { this.ws?.close(); }
  }

  _sendState(state) { this._send({ type: 'state', state }); }
  _send(msg) { if (this.browserWs.readyState === WebSocket.OPEN) this.browserWs.send(JSON.stringify(msg)); }
}

// ── Server ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '8080', 10);

const server = createServer((req, res) => {
  // CORS for health check
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({
  server,
  verifyClient: (info) => {
    // Allow all origins in dev, check ALLOWED_ORIGINS in prod
    if (ALLOWED_ORIGINS.length === 0) return true;
    const origin = info.origin || info.req.headers.origin || '';
    return ALLOWED_ORIGINS.some(o => origin.includes(o));
  },
});

wss.on('connection', (browserWs) => {
  console.log('[proxy] browser connected');
  let session = null;

  browserWs.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'start') {
        if (session) await session.close();
        session = new DoubaoDialogSession(browserWs);
        await session.connect();
        console.log('[proxy] session started');
      } else if (msg.type === 'audio' && session) {
        session.sendAudio(Buffer.from(msg.data, 'base64'));
      } else if (msg.type === 'stop') {
        if (session) { await session.close(); session = null; }
      }
    } catch (err) { console.error('[proxy] error:', err); }
  });

  browserWs.on('close', async () => {
    console.log('[proxy] browser disconnected');
    if (session) { await session.close(); session = null; }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] listening on port ${PORT}`);
});
