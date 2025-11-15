/**
 * Reset Password API Route
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../../services/auth-service';
import { PasswordResetConfirmSchema } from '../../validation/schemas';
import { AuthError } from '../../types';

/**
 * POST /api/auth/reset-password - Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = PasswordResetConfirmSchema.parse(body);

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Reset password
    await authService.resetPassword(validatedData.token, validatedData.newPassword);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
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
        INVALID_TOKEN: 400,
        TOKEN_EXPIRED: 400,
        WEAK_PASSWORD: 400,
      };
      const status = statusMap[error.type as keyof typeof statusMap] || 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('[Auth API] Reset password error:', error);
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
