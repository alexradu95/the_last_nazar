/**
 * Luna Insights API
 *
 * Generates and retrieves AI-powered journal insights.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { getDatabase } from '@/core/database';
import { getEventBus } from '@/core/events/event-bus';
import { createLunaService } from '@/features/journal/services/luna-service';
import { createJournalService } from '@/features/journal/services/journal-service';
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const lunaService = createLunaService(db, eventBus);

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    const insights = await lunaService.getUserInsights(user.id, limit);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('[Luna Insights] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check rate limit
  try {
    checkRateLimit(`luna-insights:${user.id}`, RATE_LIMITS.AI_INSIGHTS);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((error.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    throw error;
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const lunaService = createLunaService(db, eventBus);
  const journalService = createJournalService(db, eventBus);

  try {
    // Get user's recent journal entries
    const entries = await journalService.getUserEntries(user.id, { limit: 20 });

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No journal entries found. Write some entries first!' },
        { status: 400 }
      );
    }

    // Generate insight using AI
    const insight = await lunaService.generateInsight(user.id, entries);

    return NextResponse.json({ insight }, { status: 201 });
  } catch (error) {
    console.error('[Luna Insights] Failed to generate:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a moment.' },
          { status: 429 }
        );
      }

      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service is temporarily unavailable.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate insight. Please try again.' },
      { status: 500 }
    );
  }
}
