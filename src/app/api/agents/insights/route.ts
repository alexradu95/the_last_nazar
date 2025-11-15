/**
 * API Route: /api/agents/insights
 *
 * Get user's insights from agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAgentService } from '@/features/agents/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const agentService = createAgentService(db, eventBus);

    const insights = await agentService.getInsights(
      userId,
      category || undefined,
      unreadOnly
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('[Agents API] Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
