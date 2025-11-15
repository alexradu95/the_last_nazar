/**
 * API Route: /api/agents/chat
 *
 * Handle chat interactions with AI agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAgentService } from '@/features/agents/services';

const ChatRequestSchema = z.object({
  userId: z.string(),
  agentId: z.enum(['dawn', 'atlas', 'luna']),
  message: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ChatRequestSchema.parse(body);

    const db = getDatabase();
    const agentService = createAgentService(db, eventBus);

    // Get or create conversation
    const conversation = await agentService.getOrCreateConversation(
      validated.userId,
      validated.agentId
    );

    // Save user message
    await agentService.sendMessage(
      conversation.id,
      'user',
      validated.message
    );

    // Build context for agent response
    const context = await agentService.buildContext(validated.userId);

    // Generate agent response
    const response = await agentService.generateResponse(
      validated.agentId,
      validated.message,
      context
    );

    // Save agent response
    await agentService.sendMessage(
      conversation.id,
      'agent',
      response
    );

    return NextResponse.json({
      response,
      conversationId: conversation.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Agents API] Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
