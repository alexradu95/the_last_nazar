/**
 * Achievements API Route
 *
 * GET /api/gamification/achievements - Get user's achievements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { createGamificationService } from '@/features/gamification/services/gamification-service';
import { getEventBus } from '@/core/events/event-bus';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    const eventBus = getEventBus();
    const gamificationService = createGamificationService(db, eventBus);

    const achievements = await gamificationService.getUserAchievements(user.id);

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('[API] Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
