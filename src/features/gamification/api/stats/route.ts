/**
 * GET /api/gamification/stats
 *
 * Get user gamification stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createGamificationService } from '../../services/gamification-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const gamificationService = createGamificationService(db, eventBus);
    const stats = await gamificationService.getUserStats(userId);

    return NextResponse.json({
      stats: {
        totalXP: stats.totalXP,
        currentLevel: stats.currentLevel,
        xpToNextLevel: stats.xpToNextLevel,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastActivityDate: stats.lastActivityDate,
      },
    });
  } catch (error) {
    console.error('[Gamification API] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
