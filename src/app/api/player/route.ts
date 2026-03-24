import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/db';

/**
 * POST /api/player — Login or register by username.
 * Body: { username: string }
 * Returns: { player: { id, username, progressData } }
 *
 * If username exists, returns existing player + progress.
 * If username is new, creates player with default progress.
 */
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const name = username.trim();

    if (name.length > 20) {
      return NextResponse.json({ error: 'Username too long' }, { status: 400 });
    }

    // Try to find existing player
    const { data: existing } = await supabase
      .from('game_player')
      .select('*')
      .eq('username', name)
      .single();

    if (existing) {
      return NextResponse.json({
        player: {
          id: existing.id,
          username: existing.username,
          progressData: existing.progress_data,
        },
      });
    }

    // Create new player
    const { data: created, error } = await supabase
      .from('game_player')
      .insert({ username: name })
      .select()
      .single();

    if (error) {
      // Race condition: another request created the same username
      if (error.code === '23505') {
        const { data: retry } = await supabase
          .from('game_player')
          .select('*')
          .eq('username', name)
          .single();
        if (retry) {
          return NextResponse.json({
            player: {
              id: retry.id,
              username: retry.username,
              progressData: retry.progress_data,
            },
          });
        }
      }
      console.error('Player create error:', error);
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }

    return NextResponse.json({
      player: {
        id: created.id,
        username: created.username,
        progressData: created.progress_data,
      },
    });
  } catch (error) {
    console.error('Player API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
