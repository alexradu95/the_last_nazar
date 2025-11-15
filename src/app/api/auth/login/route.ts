/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '@/features/auth/services/auth-service';
import { LoginSchema } from '@/features/auth/validation/schemas';
import { AuthError } from '@/features/auth/types';

/**
 * POST /api/auth/login - Login user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = LoginSchema.parse(body);

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Login user
    const result = await authService.login(validatedData);

    return NextResponse.json(result, { status: 200 });
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
        RATE_LIMIT_EXCEEDED: 429,
        ACCOUNT_LOCKED: 403,
      };
      const status = statusMap[error.type as keyof typeof statusMap] || 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('[Auth API] Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
