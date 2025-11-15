/**
 * Task Service
 *
 * Business logic for task management including CRUD operations,
 * XP calculation, and event emission.
 */

import type { Database } from '@/core/types/database.types';
import type { IEventBus } from '@/core/types/event.types';
import { tasks, taskCategories, type Task, type NewTask, type TaskCategory } from '../schema';
import { TASK_EVENTS, type TaskCreatedEvent, type TaskCompletedEvent, type TaskUpdatedEvent } from '../events';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface TaskFilters {
  status?: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  categoryId?: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  archived: number;
  totalXpEarned: number;
  completionRate: number;
}

/**
 * Task Service
 */
export class TaskService {
  constructor(
    private db: Database,
    private eventBus: IEventBus
  ) {}

  /**
   * Create a new task
   */
  async create(data: Omit<NewTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = crypto.randomUUID();

    // Calculate XP reward based on priority
    let xpReward = data.xpReward || 10;
    if (!data.xpReward) {
      switch (data.priority) {
        case 'low':
          xpReward = 10;
          break;
        case 'medium':
          xpReward = 25;
          break;
        case 'high':
          xpReward = 50;
          break;
      }
    }

    const [task] = await this.db
      .insert(tasks)
      .values({
        ...data,
        id,
        xpReward,
      })
      .returning();

    // Emit event
    await this.eventBus.emit<TaskCreatedEvent>(TASK_EVENTS.CREATED, {
      taskId: task.id,
      userId: task.userId,
      title: task.title,
      priority: task.priority as 'low' | 'medium' | 'high',
      timestamp: Date.now(),
    });

    console.log(`[TaskService] Task created: ${task.id} - "${task.title}"`);

    return task;
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Task | null> {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    return task || null;
  }

  /**
   * Find tasks by user ID with filters
   */
  async findByUserId(
    userId: string,
    filters?: TaskFilters,
    orderBy: 'createdAt' | 'priority' | 'dueDate' = 'createdAt'
  ): Promise<Task[]> {
    const conditions = [eq(tasks.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }

    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority));
    }

    if (filters?.categoryId) {
      conditions.push(eq(tasks.categoryId, filters.categoryId));
    }

    let query = this.db.select().from(tasks).where(and(...conditions));

    // Apply ordering
    switch (orderBy) {
      case 'priority':
        // High -> Medium -> Low
        query = query.orderBy(
          sql`CASE ${tasks.priority} WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`
        );
        break;
      case 'dueDate':
        query = query.orderBy(asc(tasks.dueDate));
        break;
      default:
        query = query.orderBy(desc(tasks.createdAt));
    }

    return await query;
  }

  /**
   * Update task
   */
  async update(id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>): Promise<Task | null> {
    const [task] = await this.db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (task) {
      await this.eventBus.emit<TaskUpdatedEvent>(TASK_EVENTS.UPDATED, {
        taskId: task.id,
        userId: task.userId,
        changes: data,
        timestamp: Date.now(),
      });

      console.log(`[TaskService] Task updated: ${task.id}`);
    }

    return task || null;
  }

  /**
   * Complete a task
   */
  async complete(id: string): Promise<Task | null> {
    const task = await this.findById(id);
    if (!task) return null;

    if (task.status === 'completed') {
      console.log(`[TaskService] Task already completed: ${id}`);
      return task;
    }

    const [completedTask] = await this.db
      .update(tasks)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (completedTask) {
      // Emit completion event - gamification will listen and award XP
      await this.eventBus.emit<TaskCompletedEvent>(TASK_EVENTS.COMPLETED, {
        taskId: completedTask.id,
        userId: completedTask.userId,
        xpReward: completedTask.xpReward,
        priority: completedTask.priority as 'low' | 'medium' | 'high',
        timestamp: Date.now(),
      });

      console.log(
        `[TaskService] Task completed: ${completedTask.id} - Rewarding ${completedTask.xpReward} XP`
      );
    }

    return completedTask || null;
  }

  /**
   * Archive a task
   */
  async archive(id: string): Promise<Task | null> {
    return await this.update(id, { status: 'archived' });
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<boolean> {
    const task = await this.findById(id);
    if (!task) return false;

    const result = await this.db.delete(tasks).where(eq(tasks.id, id));

    if (result.changes > 0) {
      await this.eventBus.emit(TASK_EVENTS.DELETED, {
        taskId: id,
        userId: task.userId,
        timestamp: Date.now(),
      });

      console.log(`[TaskService] Task deleted: ${id}`);
      return true;
    }

    return false;
  }

  /**
   * Get task statistics for a user
   */
  async getStats(userId: string): Promise<TaskStats> {
    const userTasks = await this.findByUserId(userId);

    const stats = {
      total: userTasks.length,
      active: userTasks.filter((t) => t.status === 'active').length,
      completed: userTasks.filter((t) => t.status === 'completed').length,
      archived: userTasks.filter((t) => t.status === 'archived').length,
      totalXpEarned: userTasks
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + t.xpReward, 0),
      completionRate: 0,
    };

    if (stats.total > 0) {
      stats.completionRate = (stats.completed / stats.total) * 100;
    }

    return stats;
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId: string): Promise<Task[]> {
    const now = new Date();

    return await this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, 'active'),
          sql`${tasks.dueDate} < ${now.getTime()}`
        )
      )
      .orderBy(asc(tasks.dueDate));
  }

  // ==========================================
  // CATEGORY METHODS
  // ==========================================

  /**
   * Create a category
   */
  async createCategory(data: Omit<TaskCategory, 'id' | 'createdAt'>): Promise<TaskCategory> {
    const id = crypto.randomUUID();

    const [category] = await this.db
      .insert(taskCategories)
      .values({
        ...data,
        id,
      })
      .returning();

    console.log(`[TaskService] Category created: ${category.id} - "${category.name}"`);

    return category;
  }

  /**
   * Get all categories for a user
   */
  async getCategoriesByUserId(userId: string): Promise<TaskCategory[]> {
    return await this.db.select().from(taskCategories).where(eq(taskCategories.userId, userId));
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: Partial<Omit<TaskCategory, 'id' | 'userId' | 'createdAt'>>
  ): Promise<TaskCategory | null> {
    const [category] = await this.db
      .update(taskCategories)
      .set(data)
      .where(eq(taskCategories.id, id))
      .returning();

    return category || null;
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<boolean> {
    // First, remove category from all tasks
    await this.db
      .update(tasks)
      .set({ categoryId: null })
      .where(eq(tasks.categoryId, id));

    const result = await this.db.delete(taskCategories).where(eq(taskCategories.id, id));

    return result.changes > 0;
  }
}

/**
 * Factory function for creating TaskService
 */
export function createTaskService(db: Database, eventBus: IEventBus): TaskService {
  return new TaskService(db, eventBus);
}
