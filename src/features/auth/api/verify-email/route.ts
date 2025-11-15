/**
 * Email Verification API Route
 * POST /api/auth/verify-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../../services/auth-service';
import { EmailVerificationSchema } from '../../validation/schemas';
import { AuthError } from '../../types';

/**
 * POST /api/auth/verify-email - Verify email with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = EmailVerificationSchema.parse(body);

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Verify email
    await authService.verifyEmail(validatedData.token);

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully.',
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
      };
      const status = statusMap[error.type as keyof typeof statusMap] || 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('[Auth API] Email verification error:', error);
    return NextResponse.json({ error: 'Email verification failed' }, { status: 500 });
  }
}
