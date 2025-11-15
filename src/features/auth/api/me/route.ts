/**
 * Current User API Route
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../../services/auth-service';

/**
 * GET /api/auth/me - Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Validate session and get user
    const user = await authService.validateSession(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('[Auth API] Get current user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
