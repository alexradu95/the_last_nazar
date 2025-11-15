/**
 * Task Item Component
 *
 * Individual task card with actions
 */

'use client';

import { useState } from 'react';
import type { Task, TaskCategory } from '../schema';

export interface TaskItemProps {
  task: Task;
  category?: TaskCategory;
  onComplete: (id: string) => Promise<Task | null>;
  onDelete: (id: string) => Promise<boolean>;
}

/**
 * Task Item Component
 */
export function TaskItem({ task, category, onComplete, onDelete }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = async () => {
    if (task.status === 'completed') return;

    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusColors = {
    active: 'border-gray-200 dark:border-gray-700',
    completed: 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10',
    archived: 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'active';

  return (
    <div
      className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
        statusColors[task.status as keyof typeof statusColors]
      } ${isOverdue ? 'border-l-4 border-l-orange-500' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isCompleting || task.status !== 'active'}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
            task.status === 'completed'
              ? 'border-green-500 bg-green-500 dark:border-green-600 dark:bg-green-600'
              : 'border-gray-300 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400'
          } ${isCompleting ? 'opacity-50' : ''}`}
          aria-label={task.status === 'completed' ? 'Completed' : 'Mark as complete'}
        >
          {task.status === 'completed' && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`text-sm font-medium ${
                  task.status === 'completed'
                    ? 'text-gray-500 line-through dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* XP Reward Badge */}
            <span className="flex-shrink-0 inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              {task.xpReward} XP
            </span>
          </div>

          {/* Meta Information */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 font-medium ${
                priorityColors[task.priority as keyof typeof priorityColors]
              }`}
            >
              {task.priority}
            </span>

            {/* Category Badge */}
            {category && (
              <span
                className="inline-flex items-center rounded-full px-2 py-1 font-medium"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 ${
                  isOverdue ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {/* Completed Date */}
            {task.completedAt && (
              <span className="text-gray-500 dark:text-gray-400">
                Completed {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            aria-label="Delete task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
