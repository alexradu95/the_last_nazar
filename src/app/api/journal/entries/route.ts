/**
 * Journal Entries API
 *
 * Handles listing and creating journal entries.
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
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const mood = url.searchParams.get('mood');

    const entries = await journalService.getEntries(user.id, {
      limit,
      offset,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      mood: mood ? parseInt(mood) : undefined,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const body = await request.json();
    const { title, content, mood, tags } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const entry = await journalService.createEntry(user.id, {
      title,
      content,
      mood,
      tags,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Failed to create entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
