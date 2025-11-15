/**
 * GET /api/gamification/leaderboard
 *
 * Get leaderboard and optionally user rank
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createGamificationService } from '../../services/gamification-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const gamificationService = createGamificationService(db, eventBus);
    const leaderboard = await gamificationService.getLeaderboard(limit);

    let userRank: number | undefined;
    if (userId) {
      userRank = await gamificationService.getUserRank(userId);
    }

    return NextResponse.json({
      leaderboard,
      userRank,
    });
  } catch (error) {
    console.error('[Gamification API] Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
