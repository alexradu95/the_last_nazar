/**
 * Task Completion API
 *
 * POST /api/tasks/complete - Complete a task
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createTaskService } from '../../services/task-service';

const CompleteTaskSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = CompleteTaskSchema.parse(body);

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const task = await taskService.complete(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      task,
      message: 'Task completed successfully',
      xpAwarded: task.xpReward,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Tasks API] Complete error:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}
