/**
 * POST /api/gamification/award-xp
 *
 * Manually award XP (admin/system only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createGamificationService } from '../../services/gamification-service';
import { AwardXPRequestSchema } from '../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validated = AwardXPRequestSchema.parse(body);

    const gamificationService = createGamificationService(db, eventBus);

    const statsBefore = await gamificationService.getUserStats(validated.userId);

    await gamificationService.awardXP(
      validated.userId,
      validated.amount,
      validated.source,
      validated.sourceId,
      validated.reason
    );

    const statsAfter = await gamificationService.getUserStats(validated.userId);

    return NextResponse.json({
      newTotal: statsAfter.totalXP,
      leveledUp: statsAfter.currentLevel > statsBefore.currentLevel,
      newLevel: statsAfter.currentLevel > statsBefore.currentLevel ? statsAfter.currentLevel : undefined,
    });
  } catch (error) {
    console.error('[Gamification API] Error awarding XP:', error);

    if (error instanceof Error && error.message === 'XP amount must be positive') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
