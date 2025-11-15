/**
 * Journal Prompts API
 *
 * Handles fetching journal prompts and daily prompts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(request: NextRequest) {
  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const url = new URL(request.url);
    const daily = url.searchParams.get('daily') === 'true';

    if (daily) {
      const prompt = await journalService.getDailyPrompt();
      return NextResponse.json({ prompt });
    }

    const prompts = await journalService.getPrompts();
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
