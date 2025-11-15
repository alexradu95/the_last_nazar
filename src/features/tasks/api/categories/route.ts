/**
 * Task Categories API
 *
 * Endpoints for managing task categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createTaskService } from '../../services/task-service';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const CreateCategorySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(50).optional(),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(50).optional(),
});

// ==========================================
// ENDPOINTS
// ==========================================

/**
 * GET /api/tasks/categories - List categories for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const categories = await taskService.getCategoriesByUserId(userId);

    return NextResponse.json({ categories, count: categories.length });
  } catch (error) {
    console.error('[Tasks API] GET categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

/**
 * POST /api/tasks/categories - Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateCategorySchema.parse(body);

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const category = await taskService.createCategory(validated);

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Tasks API] POST category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks/categories - Update a category
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const validated = UpdateCategorySchema.parse(data);

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const category = await taskService.updateCategory(id, validated);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Tasks API] PATCH category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/categories - Delete a category
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const success = await taskService.deleteCategory(id);

    if (!success) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Tasks API] DELETE category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
