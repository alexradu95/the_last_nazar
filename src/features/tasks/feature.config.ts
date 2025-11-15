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
    routes: [
      {
        path: '/tasks',
        component: () => import('./components/TasksPage'),
      },
      {
        path: '/api/tasks',
        handler: () => import('./api/route'),
      },
    ],

    events: {
      emits: ['task.created', 'task.completed', 'task.updated', 'task.deleted'],
      listens: ['user.login', 'xp.awarded'],
    },

    services: {
      'task-service': () => import('./services/task-service'),
    },

    components: {
      TaskCard: () => import('./components/TaskCard'),
      TaskList: () => import('./components/TaskList'),
    },

    tables: ['feature_tasks', 'feature_task_categories'],
  },

  // Initialize feature
  async initialize({ eventBus, registry, db }) {
    console.log('[Tasks] Initializing feature...');

    // TODO: Setup event listeners
    // eventBus.on('user.login', handleUserLogin);

    // TODO: Register services
    // const taskService = await registry.getService('tasks', 'task-service');

    // TODO: Run migrations
    // await db.migrate('./schema');

    console.log('[Tasks] Feature initialized');
  },

  // Cleanup when disabled
  async cleanup({ eventBus }) {
    console.log('[Tasks] Cleaning up feature...');
    // TODO: Remove event listeners
  },
};

export default TaskFeature;
