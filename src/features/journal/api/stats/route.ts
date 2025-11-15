/**
 * Journal Stats API
 *
 * Get journal statistics and streaks
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/journal/stats
 * Get journal statistics for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get service
    const { createJournalService } = await import('../../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Get stats and streak
    const [stats, streak] = await Promise.all([
      service.getJournalStats(userId),
      service.getWritingStreak(userId),
    ]);

    return NextResponse.json({
      stats,
      streak,
    });
  } catch (error) {
    console.error('[Journal Stats API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal statistics' }, { status: 500 });
  }
}
