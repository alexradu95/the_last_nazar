/**
 * Login Tracking API
 *
 * Emits user.login event for streak tracking and gamification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { getEventBus } from '@/core/events/event-bus';

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eventBus = getEventBus();

  try {
    // Emit user login event
    await eventBus.emit('user.login', {
      timestamp: Date.now(),
      userId: user.id,
    });

    console.log(`[Auth] User login tracked: ${user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Auth] Failed to track login:', error);
    return NextResponse.json(
      { error: 'Failed to track login' },
      { status: 500 }
    );
  }
}
