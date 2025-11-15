/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../../services/auth-service';

/**
 * POST /api/auth/logout - Logout user
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Logout user
    await authService.logout(token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Auth API] Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
