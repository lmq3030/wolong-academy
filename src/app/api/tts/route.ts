import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const DOUBAO_APP_ID = process.env.DOUBAO_APP_ID;
const DOUBAO_TOKEN = process.env.DOUBAO_ACCESS_TOKEN;
const VOICE_TYPE = 'zh_female_yingyujiaoxue_uranus_bigtts';

export async function POST(request: NextRequest) {
  if (!DOUBAO_APP_ID || !DOUBAO_TOKEN) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 });
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.length > 1000) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 });
    }

    const reqid = randomUUID();

    const response = await fetch(
      'https://openspeech.bytedance.com/api/v1/tts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer;${DOUBAO_TOKEN}`,
        },
        body: JSON.stringify({
          app: {
            appid: DOUBAO_APP_ID,
            token: 'access_token',
            cluster: 'volcano_tts',
          },
          user: { uid: 'wolong-academy' },
          audio: {
            voice_type: VOICE_TYPE,
            encoding: 'mp3',
            speed_ratio: 1.0,
          },
          request: {
            reqid,
            text,
            text_type: 'plain',
            operation: 'query',
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Doubao TTS error:', response.status, err);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 });
    }

    const result = await response.json();

    if (result.code !== 3000 || !result.data) {
      console.error('Doubao TTS error response:', result);
      return NextResponse.json({ error: result.message || 'TTS failed' }, { status: 502 });
    }

    // Decode base64 audio data
    const audioBuffer = Buffer.from(result.data, 'base64');

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
