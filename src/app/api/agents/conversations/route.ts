/**
 * API Route: /api/agents/conversations
 *
 * Get user's conversations with agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAgentService } from '@/features/agents/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId') as 'dawn' | 'atlas' | 'luna' | null;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const agentService = createAgentService(db, eventBus);

    const conversations = await agentService.getUserConversations(
      userId,
      agentId || undefined
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[Agents API] Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
