import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/db';

/**
 * POST /api/player/sync — Sync progress to server.
 * Body: { username: string, progressData: LocalProgress }
 * Called after each chapter completion.
 */
export async function POST(request: NextRequest) {
  try {
    const { username, progressData } = await request.json();

    if (!username || !progressData) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('game_player')
      .update({
        progress_data: progressData,
        updated_at: new Date().toISOString(),
      })
      .eq('username', username.trim());

    if (error) {
      console.error('Sync error:', error);
      return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
