/**
 * GET /api/gamification/achievements
 *
 * Get user achievements (unlocked and available)
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
    const unlocked = await gamificationService.getUserAchievements(userId);
    const available = await gamificationService.getAvailableAchievements(userId);

    return NextResponse.json({
      unlocked,
      available,
    });
  } catch (error) {
    console.error('[Gamification API] Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
