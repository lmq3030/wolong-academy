import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Tests for the TTS API route (/api/tts).
 *
 * The route reads DOUBAO_APP_ID and DOUBAO_ACCESS_TOKEN from process.env
 * at module scope, so we need to manipulate env vars BEFORE importing
 * the module. We use vi.resetModules() + dynamic import to re-evaluate
 * the module with different env states.
 */

// Helper to dynamically import the route handler with fresh module evaluation
async function importRouteHandler() {
  const mod = await import('../route');
  return mod.POST;
}

// Helper to build a NextRequest with JSON body
function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('TTS API route — POST /api/tts', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('missing env vars', () => {
    it('returns 503 when DOUBAO_APP_ID is missing', async () => {
      delete process.env.DOUBAO_APP_ID;
      delete process.env.DOUBAO_ACCESS_TOKEN;

      const POST = await importRouteHandler();
      const req = makeRequest({ text: 'hello' });
      const res = await POST(req);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).toMatch(/not configured/i);
    });

    it('returns 503 when DOUBAO_ACCESS_TOKEN is missing', async () => {
      process.env.DOUBAO_APP_ID = 'test-app-id';
      delete process.env.DOUBAO_ACCESS_TOKEN;

      const POST = await importRouteHandler();
      const req = makeRequest({ text: 'hello' });
      const res = await POST(req);

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).toMatch(/not configured/i);
    });

    it('returns 503 when both env vars are missing', async () => {
      delete process.env.DOUBAO_APP_ID;
      delete process.env.DOUBAO_ACCESS_TOKEN;

      const POST = await importRouteHandler();
      const req = makeRequest({ text: 'hello' });
      const res = await POST(req);

      expect(res.status).toBe(503);
    });
  });

  describe('input validation (with env vars set)', () => {
    beforeEach(() => {
      process.env.DOUBAO_APP_ID = 'test-app-id';
      process.env.DOUBAO_ACCESS_TOKEN = 'test-access-token';
    });

    it('returns 400 when text is missing from body', async () => {
      // Mock fetch to prevent actual network calls
      vi.stubGlobal('fetch', vi.fn());

      const POST = await importRouteHandler();
      const req = makeRequest({});
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid text/i);
    });

    it('returns 400 when text is empty string', async () => {
      vi.stubGlobal('fetch', vi.fn());

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '' });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid text/i);
    });

    it('returns 400 when text is a number (not a string)', async () => {
      vi.stubGlobal('fetch', vi.fn());

      const POST = await importRouteHandler();
      const req = makeRequest({ text: 42 });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('returns 400 when text is null', async () => {
      vi.stubGlobal('fetch', vi.fn());

      const POST = await importRouteHandler();
      const req = makeRequest({ text: null });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('returns 400 when text exceeds 1000 characters', async () => {
      vi.stubGlobal('fetch', vi.fn());

      const POST = await importRouteHandler();
      const longText = 'a'.repeat(1001);
      const req = makeRequest({ text: longText });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid text/i);
    });

    it('accepts text at exactly 1000 characters (boundary)', async () => {
      // This should pass validation and attempt the fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"code":0,"data":"AAAA"}\n{"code":20000000}'),
      });
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const exactText = 'a'.repeat(1000);
      const req = makeRequest({ text: exactText });
      const res = await POST(req);

      // Should not be 400 — validation passed, fetch was attempted
      expect(res.status).not.toBe(400);
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('upstream API handling (with env vars set)', () => {
    beforeEach(() => {
      process.env.DOUBAO_APP_ID = 'test-app-id';
      process.env.DOUBAO_ACCESS_TOKEN = 'test-access-token';
    });

    it('returns 502 when upstream API returns non-ok status', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '测试' });
      const res = await POST(req);

      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/failed/i);
    });

    it('returns audio/mpeg on success with valid NDJSON response', async () => {
      const audioBase64 = Buffer.from('fake-audio-data').toString('base64');
      const ndjsonBody = `{"code":0,"data":"${audioBase64}"}\n{"code":20000000}`;

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(ndjsonBody),
      });
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '三国演义' });
      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
      expect(res.headers.get('Cache-Control')).toContain('max-age=3600');
    });

    it('returns 502 when NDJSON contains an error chunk', async () => {
      const ndjsonBody = `{"code":50001,"message":"Rate limited"}`;

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(ndjsonBody),
      });
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '测试' });
      const res = await POST(req);

      expect(res.status).toBe(502);
    });

    it('returns 502 when response has no audio data chunks', async () => {
      // Only the final signal, no data chunks
      const ndjsonBody = `{"code":20000000}`;

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(ndjsonBody),
      });
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '测试' });
      const res = await POST(req);

      expect(res.status).toBe(502);
      const body = await res.json();
      expect(body.error).toMatch(/no audio/i);
    });

    it('returns 500 when an unexpected error occurs during request processing', async () => {
      // Simulate fetch throwing an error
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network failure'));
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '测试' });
      const res = await POST(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/internal/i);
    });

    it('sends correct headers to the Doubao API', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('{"code":0,"data":"AAAA"}\n{"code":20000000}'),
      });
      vi.stubGlobal('fetch', mockFetch);

      const POST = await importRouteHandler();
      const req = makeRequest({ text: '你好' });
      await POST(req);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('bytedance.com');
      expect(options.method).toBe('POST');
      expect(options.headers['X-Api-App-Id']).toBe('test-app-id');
      expect(options.headers['X-Api-Access-Key']).toBe('test-access-token');
      expect(options.headers['Content-Type']).toBe('application/json');

      // Verify body includes the text
      const body = JSON.parse(options.body);
      expect(body.req_params.text).toBe('你好');
    });
  });
});
