/**
 * Luna Prompts API
 *
 * Generates and retrieves personalized journaling prompts.
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
    const prompts = await lunaService.getUnusedPrompts(user.id);

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('[Luna Prompts] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
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
    checkRateLimit(`luna-prompts:${user.id}`, RATE_LIMITS.AI_PROMPTS);
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
    // Get user's recent journal entries for context
    const entries = await journalService.getUserEntries(user.id, { limit: 10 });

    // Generate personalized prompt using AI
    const prompt = await lunaService.generatePersonalizedPrompt(user.id, entries);

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error('[Luna Prompts] Failed to generate:', error);

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
      { error: 'Failed to generate prompt. Please try again.' },
      { status: 500 }
    );
  }
}
