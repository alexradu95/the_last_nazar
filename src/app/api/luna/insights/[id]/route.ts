/**
 * Luna Insight Detail API
 *
 * Manages individual insight operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { getDatabase } from '@/core/database';
import { getEventBus } from '@/core/events/event-bus';
import { createLunaService } from '@/features/journal/services/luna-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const lunaService = createLunaService(db, eventBus);

  try {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid insight ID' },
        { status: 400 }
      );
    }

    // Mark insight as read
    await lunaService.markInsightAsRead(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Luna Insights] Failed to mark as read:', error);
    return NextResponse.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    );
  }
}
