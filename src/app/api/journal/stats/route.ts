/**
 * Journal Stats API
 *
 * Handles fetching journal statistics (total entries, streak, avg mood, etc.).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const stats = await journalService.getStats(user.id);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
