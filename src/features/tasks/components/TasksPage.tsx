/**
 * Tasks Page Component
 *
 * Main page for task management with list, filters, and creation
 */

'use client';

import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskStats as TaskStatsComponent } from './TaskStats';
import type { TaskFilters as TaskFiltersType } from '../services/task-service';

export interface TasksPageProps {
  userId: string;
}

/**
 * Tasks Page Component
 */
export function TasksPage({ userId }: TasksPageProps) {
  const [filters, setFilters] = useState<TaskFiltersType>({
    status: 'active',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    tasks,
    categories,
    stats,
    loading,
    error,
    createTask,
    completeTask,
    deleteTask,
    refresh,
  } = useTasks({ userId, filters });

  const handleCreateTask = async (taskData: any) => {
    const task = await createTask(taskData);
    if (task) {
      setShowCreateModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Tasks
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your tasks and boost your productivity
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              <svg
                className="-ml-0.5 mr-1.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading tasks
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && <TaskStatsComponent stats={stats} />}

        {/* Filters and List */}
        <div className="mt-8 grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <TaskFilters
              filters={filters}
              categories={categories}
              onFiltersChange={setFilters}
            />
          </aside>

          {/* Main - Task List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                categories={categories}
                onComplete={completeTask}
                onDelete={deleteTask}
                onRefresh={refresh}
              />
            )}
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          categories={categories}
          onSubmit={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default TasksPage;
