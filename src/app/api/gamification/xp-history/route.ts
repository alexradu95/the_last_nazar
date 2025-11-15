/**
 * XP History API Route
 *
 * GET /api/gamification/xp-history - Get user's XP history
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

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const db = getDatabase();
    const eventBus = getEventBus();
    const gamificationService = createGamificationService(db, eventBus);

    const history = await gamificationService.getXPHistory(user.id, limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error('[API] Error fetching XP history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP history' },
      { status: 500 }
    );
  }
}
