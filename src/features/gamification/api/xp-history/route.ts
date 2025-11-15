/**
 * GET /api/gamification/xp-history
 *
 * Get XP history for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createGamificationService } from '../../services/gamification-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const gamificationService = createGamificationService(db, eventBus);
    const history = await gamificationService.getXPHistory(userId, limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('[Gamification API] Error fetching XP history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP history' },
      { status: 500 }
    );
  }
}
