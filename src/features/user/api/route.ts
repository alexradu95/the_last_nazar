/**
 * User API Routes
 *
 * RESTful API endpoints for user management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createUserService } from '../services/user-service';
import { CreateUserSchema, UpdateUserSchema } from '../validation/schemas';

// ==========================================
// USER ENDPOINTS
// ==========================================

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = CreateUserSchema.parse(body);

    const db = getDatabase();
    const userService = createUserService(db, eventBus);

    // Check if email already exists
    const existingUser = await userService.findByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Create user
    const user = await userService.create(validatedData);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[User API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

/**
 * GET /api/users?email=xxx or /api/users?id=xxx - Get user by email or ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Either id or email parameter is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const userService = createUserService(db, eventBus);

    let user;
    if (userId) {
      user = await userService.findById(userId);
    } else if (email) {
      user = await userService.findByEmail(email);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user stats
    const stats = await userService.getUserStats(user.id);

    return NextResponse.json({ user, stats });
  } catch (error) {
    console.error('[User API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
