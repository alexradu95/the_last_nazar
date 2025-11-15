/**
 * Task Statistics API
 *
 * GET /api/tasks/stats - Get task statistics for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createTaskService } from '../../services/task-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = getDatabase();
    const taskService = createTaskService(db, eventBus);

    const stats = await taskService.getStats(userId);
    const overdueTasks = await taskService.getOverdueTasks(userId);

    return NextResponse.json({
      stats,
      overdue: {
        count: overdueTasks.length,
        tasks: overdueTasks,
      },
    });
  } catch (error) {
    console.error('[Tasks API] Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
