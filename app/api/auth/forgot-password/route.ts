/**
 * Forgot Password API Route
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '@/features/auth/services/auth-service';
import { PasswordResetRequestSchema } from '@/features/auth/validation/schemas';

/**
 * POST /api/auth/forgot-password - Request password reset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = PasswordResetRequestSchema.parse(body);

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Request password reset (doesn't reveal if email exists)
    await authService.requestPasswordReset(validatedData.email);

    return NextResponse.json(
      {
        message: 'If the email exists, a password reset link has been sent.',
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

    console.error('[Auth API] Forgot password error:', error);
    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message: 'If the email exists, a password reset link has been sent.',
      },
      { status: 200 }
    );
  }
}
