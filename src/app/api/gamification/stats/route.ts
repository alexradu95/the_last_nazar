/**
 * User Stats API Route
 *
 * GET /api/gamification/stats - Get user's gamification stats
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

    const stats = await gamificationService.getUserStats(user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
