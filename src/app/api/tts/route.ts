import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const DOUBAO_APP_ID = process.env.DOUBAO_APP_ID;
const DOUBAO_TOKEN = process.env.DOUBAO_ACCESS_TOKEN;
const SPEAKER = 'zh_male_m191_uranus_bigtts';

export async function POST(request: NextRequest) {
  if (!DOUBAO_APP_ID || !DOUBAO_TOKEN) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 });
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.length > 1000) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 });
    }

    const response = await fetch(
      'https://openspeech.bytedance.com/api/v3/tts/unidirectional',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-App-Id': DOUBAO_APP_ID,
          'X-Api-Access-Key': DOUBAO_TOKEN,
          'X-Api-Resource-Id': 'seed-tts-2.0',
          'X-Api-Request-Id': randomUUID(),
        },
        body: JSON.stringify({
          user: { uid: 'wolong-academy' },
          req_params: {
            text,
            speaker: SPEAKER,
            audio_params: {
              format: 'mp3',
              sample_rate: 24000,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Doubao TTS error:', response.status, err);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 });
    }

    // V3 returns newline-delimited JSON: { code: 0, data: "<base64>" } per chunk,
    // { code: 20000000 } as the final signal.
    // Collect all chunks first to detect application-level errors inside HTTP 200.
    // Doubao may return application-level errors inside an HTTP 200 NDJSON stream.
    const body = await response.text();
    const audioChunks: Buffer[] = [];

    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk = JSON.parse(trimmed);
        if (chunk.code === 0 && chunk.data) {
          audioChunks.push(Buffer.from(chunk.data, 'base64'));
        } else if (chunk.code !== 0 && chunk.code !== 20000000) {
          console.error('Doubao TTS chunk error:', chunk);
          return NextResponse.json(
            { error: chunk.message || 'TTS failed' },
            { status: 502 }
          );
        }
      } catch {
        // Skip non-JSON lines
      }
    }

    if (audioChunks.length === 0) {
      console.error('Doubao TTS: no audio data received');
      return NextResponse.json({ error: 'No audio data' }, { status: 502 });
    }

    const audioBuffer = Buffer.concat(audioChunks);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
