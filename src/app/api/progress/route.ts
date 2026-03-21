import { NextRequest, NextResponse } from 'next/server';

// For MVP, this is a placeholder that just returns success.
// Real DB integration will come when Vercel Postgres is connected.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, stars, bestCode, unlockedGenerals, unlockedItems, xpGained } = body;

    // TODO: When DB is connected:
    // 1. Get user from session
    // 2. Upsert user_progress (chapterId, stars, bestCode)
    // 3. Insert user_generals for newly unlocked
    // 4. Insert user_items for newly unlocked
    // 5. Update user.xp += xpGained
    // 6. Check for level up

    console.log('Progress saved (placeholder):', { chapterId, stars, bestCode, unlockedGenerals, unlockedItems, xpGained });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save progress:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
