/**
 * Tasks Custom Hook
 *
 * React hook for managing tasks with API integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskCategory } from '../schema';
import type { TaskFilters, TaskStats } from '../services/task-service';

export interface UseTasksOptions {
  userId: string;
  filters?: TaskFilters;
  autoFetch?: boolean;
}

export interface UseTasksReturn {
  tasks: Task[];
  categories: TaskCategory[];
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
  createTask: (task: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  completeTask: (id: string) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  createCategory: (category: Partial<TaskCategory>) => Promise<TaskCategory | null>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for tasks management
 */
export function useTasks({ userId, filters, autoFetch = true }: UseTasksOptions): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch tasks from API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);

      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[useTasks] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  /**
   * Fetch categories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/categories?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('[useTasks] Fetch categories error:', err);
    }
  }, [userId]);

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/stats?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.stats || null);
    } catch (err) {
      console.error('[useTasks] Fetch stats error:', err);
    }
  }, [userId]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchTasks(), fetchCategories(), fetchStats()]);
  }, [fetchTasks, fetchCategories, fetchStats]);

  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (task: Partial<Task>): Promise<Task | null> => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...task, userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }

        const data = await response.json();
        await refresh();
        return data.task;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task');
        console.error('[useTasks] Create error:', err);
        return null;
      }
    },
    [userId, refresh]
  );

  /**
   * Update a task
   */
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<Task | null> => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }

        const data = await response.json();
        await refresh();
        return data.task;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task');
        console.error('[useTasks] Update error:', err);
        return null;
      }
    },
    [refresh]
  );

  /**
   * Complete a task
   */
  const completeTask = useCallback(
    async (id: string): Promise<Task | null> => {
      try {
        const response = await fetch('/api/tasks/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: id }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete task');
        }

        const data = await response.json();
        await refresh();
        return data.task;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete task');
        console.error('[useTasks] Complete error:', err);
        return null;
      }
    },
    [refresh]
  );

  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/tasks?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        await refresh();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task');
        console.error('[useTasks] Delete error:', err);
        return false;
      }
    },
    [refresh]
  );

  /**
   * Create a category
   */
  const createCategory = useCallback(
    async (category: Partial<TaskCategory>): Promise<TaskCategory | null> => {
      try {
        const response = await fetch('/api/tasks/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...category, userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create category');
        }

        const data = await response.json();
        await fetchCategories();
        return data.category;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create category');
        console.error('[useTasks] Create category error:', err);
        return null;
      }
    },
    [userId, fetchCategories]
  );

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  return {
    tasks,
    categories,
    stats,
    loading,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    createCategory,
    refresh,
  };
}
