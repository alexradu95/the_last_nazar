/**
 * API Route: /api/agents/suggestions
 *
 * Get user's suggestions from agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAgentService } from '@/features/agents/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as 'active' | 'dismissed' | 'completed' | null;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const agentService = createAgentService(db, eventBus);

    const suggestions = await agentService.getSuggestions(
      userId,
      status || undefined
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('[Agents API] Get suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
