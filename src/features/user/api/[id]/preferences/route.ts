/**
 * User Preferences API Routes
 *
 * Routes for user preferences management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createUserService } from '../../../services/user-service';
import { UpdatePreferencesSchema } from '../../../validation/schemas';

/**
 * GET /api/users/[id]/preferences - Get user preferences
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = getDatabase();
    const userService = createUserService(db, eventBus);

    // Check if user exists
    const user = await userService.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = await userService.getPreferences(id);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('[User API] GET preferences error:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

/**
 * PUT /api/users/[id]/preferences - Update user preferences
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request
    const validatedData = UpdatePreferencesSchema.parse(body);

    const db = getDatabase();
    const userService = createUserService(db, eventBus);

    // Check if user exists
    const user = await userService.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await userService.updatePreferences(id, validatedData.preferences);

    const preferences = await userService.getPreferences(id);

    return NextResponse.json({ preferences });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[User API] PUT preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
