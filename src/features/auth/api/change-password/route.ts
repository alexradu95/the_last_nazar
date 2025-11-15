/**
 * Change Password API Route
 * POST /api/auth/change-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../../services/auth-service';
import { ChangePasswordSchema } from '../../validation/schemas';
import { AuthError } from '../../types';

/**
 * POST /api/auth/change-password - Change password (authenticated)
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

    // Validate session
    const user = await authService.validateSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request
    const validatedData = ChangePasswordSchema.parse(body);

    // Change password
    await authService.changePassword(user.id, validatedData.oldPassword, validatedData.newPassword);

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AuthError) {
      const statusMap = {
        INVALID_CREDENTIALS: 401,
        WEAK_PASSWORD: 400,
      };
      const status = statusMap[error.type as keyof typeof statusMap] || 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('[Auth API] Change password error:', error);
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 });
  }
}
