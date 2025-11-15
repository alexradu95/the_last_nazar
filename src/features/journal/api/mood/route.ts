/**
 * Mood Tracking API
 *
 * Log and track mood data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const moodSchema = z.object({
  userId: z.string(),
  mood: z.enum(['happy', 'sad', 'stressed', 'excited', 'calm', 'tired', 'angry', 'grateful']),
  note: z.string().optional(),
});

/**
 * POST /api/journal/mood
 * Log a mood entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = moodSchema.parse(body);

    // Get service
    const { createJournalService } = await import('../../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Log mood
    await service.logMood(validated.userId, validated.mood, validated.note);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    console.error('[Mood API] Error:', error);
    return NextResponse.json({ error: 'Failed to log mood' }, { status: 500 });
  }
}

/**
 * GET /api/journal/mood
 * Get mood history and insights
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = searchParams.get('days');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get service
    const { createJournalService } = await import('../../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Get mood data
    const [history, insights] = await Promise.all([
      service.getMoodHistory(userId, days ? parseInt(days) : 30),
      service.getMoodInsights(userId),
    ]);

    return NextResponse.json({
      history,
      insights,
    });
  } catch (error) {
    console.error('[Mood API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch mood data' }, { status: 500 });
  }
}
