/**
 * Award XP API Route
 *
 * POST /api/gamification/award-xp - Award XP to a user (admin/system only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { createGamificationService } from '@/features/gamification/services/gamification-service';
import { getEventBus } from '@/core/events/event-bus';
import { z } from 'zod';

const AwardXPSchema = z.object({
  userId: z.string(),
  amount: z.number().int().positive(),
  source: z.enum(['task', 'journal', 'achievement', 'streak', 'manual']),
  sourceId: z.string().optional(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AwardXPSchema.parse(body);

    const db = getDatabase();
    const eventBus = getEventBus();
    const gamificationService = createGamificationService(db, eventBus);

    await gamificationService.awardXP(
      validated.userId,
      validated.amount,
      validated.source,
      validated.sourceId,
      validated.reason
    );

    const updatedStats = await gamificationService.getUserStats(validated.userId);

    return NextResponse.json({
      success: true,
      stats: updatedStats,
    });
  } catch (error) {
    console.error('[API] Error awarding XP:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
