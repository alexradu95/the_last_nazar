/**
 * Registration API Route
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../../services/auth-service';
import { RegisterSchema } from '../../validation/schemas';
import { AuthError } from '../../types';

/**
 * POST /api/auth/register - Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = RegisterSchema.parse(body);

    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Register user
    const result = await authService.register(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AuthError) {
      const statusMap = {
        EMAIL_EXISTS: 409,
        WEAK_PASSWORD: 400,
        INVALID_EMAIL: 400,
      };
      const status = statusMap[error.type as keyof typeof statusMap] || 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('[Auth API] Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
