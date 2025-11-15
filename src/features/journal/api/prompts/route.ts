/**
 * Journal Prompts API
 *
 * Get writing prompts for journal entries
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/journal/prompts
 * Get journal prompts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Get service
    const { createJournalService } = await import('../../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Get prompts
    const dailyPrompt = await service.getDailyPrompt();
    const prompts = category
      ? await service.getPromptsByCategory(category)
      : [];

    return NextResponse.json({
      dailyPrompt,
      prompts,
    });
  } catch (error) {
    console.error('[Journal Prompts API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal prompts' }, { status: 500 });
  }
}

/**
 * POST /api/journal/prompts/use
 * Mark a prompt as used
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId } = body;

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Get service
    const { createJournalService } = await import('../../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    await service.markPromptUsed(promptId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Journal Prompts API] Error:', error);
    return NextResponse.json({ error: 'Failed to mark prompt as used' }, { status: 500 });
  }
}
