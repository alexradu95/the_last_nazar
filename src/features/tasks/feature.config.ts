/**
 * Task Management Feature
 *
 * Handles task creation, completion, and management.
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const TaskFeature: FeatureDefinition = {
  id: 'tasks',
  name: 'Task Management',
  version: '1.0.0',

  // Dependencies
  dependencies: ['gamification'],

  // What this feature provides
  provides: {
    // Routes would be defined in src/app/ directory (Next.js App Router)
    // Listed here for documentation/feature discovery only
    // Note: These routes are NOT yet implemented in src/app/
    routes: [
      // UI Routes (to be created in src/app/tasks/)
      '/tasks',

      // API Routes (to be created in src/app/api/tasks/)
      '/api/tasks',
      '/api/tasks/complete',
      '/api/tasks/stats',
      '/api/tasks/categories',
    ],

    events: {
      emits: ['task.created', 'task.completed', 'task.updated', 'task.deleted'],
      listens: ['user.login'],
    },

    services: {
      'task-service': () => import('./services/task-service'),
    },

    components: {
      TasksPage: () => import('./components/TasksPage'),
      TaskList: () => import('./components/TaskList'),
      TaskItem: () => import('./components/TaskItem'),
      TaskFilters: () => import('./components/TaskFilters'),
      TaskStats: () => import('./components/TaskStats'),
      CreateTaskModal: () => import('./components/CreateTaskModal'),
    },

    tables: ['feature_tasks', 'feature_task_categories'],
  },

  // Initialize feature
  async initialize({ eventBus, registry, db }) {
    console.log('[Tasks] Initializing feature...');

    // Import task service for event handlers
    const { createTaskService } = await import('./services/task-service');
    const taskService = createTaskService(db, eventBus);

    // Setup event listeners
    eventBus.on('user.login', async (payload: any) => {
      console.log(`[Tasks] User logged in: ${payload.userId}`);
      // Load user's active tasks
      const activeTasks = await taskService.findByUserId(payload.userId, {
        status: 'active',
      });
      console.log(`[Tasks] User has ${activeTasks.length} active tasks`);

      // Check for overdue tasks
      const overdueTasks = await taskService.getOverdueTasks(payload.userId);
      if (overdueTasks.length > 0) {
        console.log(`[Tasks] User has ${overdueTasks.length} overdue tasks`);
      }
    });

    // Log task completion events for debugging
    eventBus.on('task.completed', async (payload: any) => {
      console.log(
        `[Tasks] Task ${payload.taskId} completed! Awarded ${payload.xpReward} XP`
      );
    });

    console.log('[Tasks] Feature initialized successfully');
    console.log('[Tasks] Listening to: user.login');
    console.log('[Tasks] Emitting: task.created, task.completed, task.updated, task.deleted');
  },

  // Cleanup when disabled
  async cleanup({ eventBus }) {
    console.log('[Tasks] Cleaning up feature...');
    // Event listeners are automatically cleaned up by the event bus
    console.log('[Tasks] Feature cleanup complete');
  },
};

export default TaskFeature;
