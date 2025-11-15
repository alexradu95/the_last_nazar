/**
 * API Route: /api/agents/messages
 *
 * Get conversation message history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAgentService } from '@/features/agents/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = searchParams.get('limit');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const agentService = createAgentService(db, eventBus);

    const messages = await agentService.getConversationHistory(
      conversationId,
      limit ? parseInt(limit, 10) : undefined
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[Agents API] Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
