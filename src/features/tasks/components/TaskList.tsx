/**
 * Task List Component
 *
 * Displays a list of tasks with actions
 */

'use client';

import type { Task, TaskCategory } from '../schema';
import { TaskItem } from './TaskItem';

export interface TaskListProps {
  tasks: Task[];
  categories: TaskCategory[];
  onComplete: (id: string) => Promise<Task | null>;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

/**
 * Task List Component
 */
export function TaskList({ tasks, categories, onComplete, onDelete, onRefresh }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const category = categories.find((c) => c.id === task.categoryId);
        return (
          <TaskItem
            key={task.id}
            task={task}
            category={category}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}
