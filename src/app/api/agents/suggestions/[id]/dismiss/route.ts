/**
 * API Route: /api/agents/suggestions/[id]/dismiss
 *
 * Dismiss a suggestion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAgentService } from '@/features/agents/services';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const db = getDatabase();
    const agentService = createAgentService(db, eventBus);

    const success = await agentService.dismissSuggestion(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Agents API] Dismiss suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss suggestion' },
      { status: 500 }
    );
  }
}
