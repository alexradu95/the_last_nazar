/**
 * Task API Routes
 *
 * RESTful API endpoints for task management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createTaskService } from '../services/task-service';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const CreateTaskSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  categoryId: z.string().optional(),
  xpReward: z.number().int().min(0).max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  categoryId: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  xpReward: z.number().int().min(0).max(1000).optional(),
});

const TaskFiltersSchema = z.object({
  status: z.enum(['active', 'completed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  categoryId: z.string().optional(),
  orderBy: z.enum(['createdAt', 'priority', 'dueDate']).default('createdAt'),
});

// ==========================================
// TASK ENDPOINTS
// ==========================================

/**
 * GET /api/tasks - List tasks for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Parse filters
    const filters = TaskFiltersSchema.parse({
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      categoryId: searchParams.get('categoryId'),
      orderBy: searchParams.get('orderBy') || 'createdAt',
    });

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const tasks = await taskService.findByUserId(
      userId,
      {
        status: filters.status,
        priority: filters.priority,
        categoryId: filters.categoryId,
      },
      filters.orderBy
    );

    return NextResponse.json({ tasks, count: tasks.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Tasks API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateTaskSchema.parse(body);

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    // Convert dueDate string to Date if provided
    const taskData = {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    };

    const task = await taskService.create(taskData);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Tasks API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

/**
 * PATCH /api/tasks - Update a task
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const validated = UpdateTaskSchema.parse(data);

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    // Convert dueDate string to Date if provided
    const updateData = {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : validated.dueDate,
    };

    const task = await taskService.update(id, updateData);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Tasks API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks - Delete a task
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const success = await taskService.delete(id);

    if (!success) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Tasks API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
