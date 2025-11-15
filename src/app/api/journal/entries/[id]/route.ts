/**
 * Single Journal Entry API
 *
 * Handles get, update, and delete for individual journal entries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const entry = await journalService.getEntryById(params.id, user.id);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to fetch entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entry = await journalService.updateEntry(params.id, user.id, {
      title,
      content,
      mood,
      tags,
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to update entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    await journalService.deleteEntry(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
