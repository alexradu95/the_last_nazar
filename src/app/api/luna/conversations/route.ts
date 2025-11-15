/**
 * Luna Conversations API
 *
 * Manages conversation history with Luna.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { getDatabase } from '@/core/database';
import { getEventBus } from '@/core/events/event-bus';
import { createLunaService } from '@/features/journal/services/luna-service';

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
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const conversations = await lunaService.getConversationHistory(user.id, limit);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[Luna Conversations] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const lunaService = createLunaService(db, eventBus);

  try {
    await lunaService.clearConversation(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Luna Conversations] Failed to clear:', error);
    return NextResponse.json(
      { error: 'Failed to clear conversation' },
      { status: 500 }
    );
  }
}
