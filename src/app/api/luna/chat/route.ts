/**
 * Luna Chat API
 *
 * Handles chat interactions with Luna AI companion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { getDatabase } from '@/core/database';
import { getEventBus } from '@/core/events/event-bus';
import { createLunaService } from '@/features/journal/services/luna-service';
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check rate limit
  try {
    checkRateLimit(`luna-chat:${user.id}`, RATE_LIMITS.AI_CHAT);
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

  try {
    const body = await request.json();
    const { message, entryId } = body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Generate Luna's response
    const response = await lunaService.sendMessage(
      user.id,
      message.trim(),
      entryId || undefined
    );

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Luna Chat] Failed to process message:', error);

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
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}
