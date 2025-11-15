/**
 * Task Service Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { EventBus } from '@/core/event-bus';
import { TaskService } from '../services/task-service';
import { tasks, taskCategories } from '../schema';
import { TASK_EVENTS } from '../events';

describe('TaskService', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let eventBus: EventBus;
  let service: TaskService;
  let emittedEvents: Array<{ event: string; payload: any }> = [];

  beforeEach(() => {
    // Create in-memory database
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);

    // Create tables
    sqlite.exec(`
      CREATE TABLE feature_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'active',
        category_id TEXT,
        xp_reward INTEGER DEFAULT 10,
        due_date INTEGER,
        created_at INTEGER,
        completed_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE feature_task_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        created_at INTEGER
      );
    `);

    // Create event bus and capture events
    eventBus = new EventBus();
    emittedEvents = [];

    // Listen to all events
    eventBus.on('*', (event, payload) => {
      emittedEvents.push({ event, payload });
    });

    service = new TaskService(db, eventBus);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('create', () => {
    it('should create a task with default XP reward based on priority', async () => {
      const taskData = {
        userId: 'user-1',
        title: 'Test Task',
        priority: 'high' as const,
      };

      const task = await service.create(taskData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.priority).toBe('high');
      expect(task.xpReward).toBe(50); // High priority = 50 XP
      expect(task.status).toBe('active');
    });

    it('should emit task.created event', async () => {
      const taskData = {
        userId: 'user-1',
        title: 'Test Task',
        priority: 'medium' as const,
      };

      await service.create(taskData);

      const createdEvent = emittedEvents.find((e) => e.event === TASK_EVENTS.CREATED);
      expect(createdEvent).toBeDefined();
      expect(createdEvent?.payload.title).toBe('Test Task');
      expect(createdEvent?.payload.userId).toBe('user-1');
    });

    it('should respect custom XP reward', async () => {
      const taskData = {
        userId: 'user-1',
        title: 'Test Task',
        priority: 'low' as const,
        xpReward: 100,
      };

      const task = await service.create(taskData);

      expect(task.xpReward).toBe(100);
    });

    it('should create task with category', async () => {
      const category = await service.createCategory({
        userId: 'user-1',
        name: 'Work',
        color: '#ff0000',
      });

      const task = await service.create({
        userId: 'user-1',
        title: 'Work Task',
        categoryId: category.id,
      });

      expect(task.categoryId).toBe(category.id);
    });
  });

  describe('findById', () => {
    it('should find a task by id', async () => {
      const created = await service.create({
        userId: 'user-1',
        title: 'Test Task',
      });

      const found = await service.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Test Task');
    });

    it('should return null for non-existent task', async () => {
      const found = await service.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    beforeEach(async () => {
      // Create multiple tasks
      await service.create({ userId: 'user-1', title: 'Task 1', priority: 'high' });
      await service.create({ userId: 'user-1', title: 'Task 2', priority: 'low' });
      await service.create({ userId: 'user-2', title: 'Task 3', priority: 'medium' });
    });

    it('should find all tasks for a user', async () => {
      const tasks = await service.findByUserId('user-1');

      expect(tasks).toHaveLength(2);
      expect(tasks.every((t) => t.userId === 'user-1')).toBe(true);
    });

    it('should filter by status', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Task to Complete',
      });
      await service.complete(task.id);

      const activeTasks = await service.findByUserId('user-1', { status: 'active' });
      const completedTasks = await service.findByUserId('user-1', { status: 'completed' });

      expect(activeTasks).toHaveLength(2);
      expect(completedTasks).toHaveLength(1);
    });

    it('should filter by priority', async () => {
      const highPriorityTasks = await service.findByUserId('user-1', { priority: 'high' });

      expect(highPriorityTasks).toHaveLength(1);
      expect(highPriorityTasks[0].priority).toBe('high');
    });

    it('should order by priority', async () => {
      const tasks = await service.findByUserId('user-1', {}, 'priority');

      expect(tasks[0].priority).toBe('high');
      expect(tasks[1].priority).toBe('low');
    });
  });

  describe('update', () => {
    it('should update task properties', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Original Title',
      });

      const updated = await service.update(task.id, {
        title: 'Updated Title',
        description: 'New description',
      });

      expect(updated?.title).toBe('Updated Title');
      expect(updated?.description).toBe('New description');
    });

    it('should emit task.updated event', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Test Task',
      });

      emittedEvents = []; // Clear events

      await service.update(task.id, { title: 'Updated' });

      const updateEvent = emittedEvents.find((e) => e.event === TASK_EVENTS.UPDATED);
      expect(updateEvent).toBeDefined();
      expect(updateEvent?.payload.taskId).toBe(task.id);
    });

    it('should return null for non-existent task', async () => {
      const updated = await service.update('non-existent', { title: 'Updated' });
      expect(updated).toBeNull();
    });
  });

  describe('complete', () => {
    it('should complete a task', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Task to Complete',
        priority: 'high',
      });

      const completed = await service.complete(task.id);

      expect(completed?.status).toBe('completed');
      expect(completed?.completedAt).toBeDefined();
    });

    it('should emit task.completed event with XP reward', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Task to Complete',
        priority: 'high',
      });

      emittedEvents = [];

      await service.complete(task.id);

      const completeEvent = emittedEvents.find((e) => e.event === TASK_EVENTS.COMPLETED);
      expect(completeEvent).toBeDefined();
      expect(completeEvent?.payload.xpReward).toBe(50); // High priority
      expect(completeEvent?.payload.taskId).toBe(task.id);
    });

    it('should not re-complete already completed task', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Task',
      });

      await service.complete(task.id);
      emittedEvents = [];

      const result = await service.complete(task.id);

      expect(result?.status).toBe('completed');
      // Should not emit another completion event
      const completeEvents = emittedEvents.filter((e) => e.event === TASK_EVENTS.COMPLETED);
      expect(completeEvents).toHaveLength(0);
    });

    it('should return null for non-existent task', async () => {
      const completed = await service.complete('non-existent');
      expect(completed).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Task to Delete',
      });

      const success = await service.delete(task.id);

      expect(success).toBe(true);

      const found = await service.findById(task.id);
      expect(found).toBeNull();
    });

    it('should emit task.deleted event', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Task',
      });

      emittedEvents = [];

      await service.delete(task.id);

      const deleteEvent = emittedEvents.find((e) => e.event === TASK_EVENTS.DELETED);
      expect(deleteEvent).toBeDefined();
      expect(deleteEvent?.payload.taskId).toBe(task.id);
    });

    it('should return false for non-existent task', async () => {
      const success = await service.delete('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      // Create various tasks
      await service.create({ userId: 'user-1', title: 'Task 1', priority: 'high' });
      await service.create({ userId: 'user-1', title: 'Task 2', priority: 'medium' });
      const task3 = await service.create({ userId: 'user-1', title: 'Task 3', priority: 'low' });
      await service.complete(task3.id);
    });

    it('should return accurate statistics', async () => {
      const stats = await service.getStats('user-1');

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.totalXpEarned).toBe(10); // Low priority completed task
      expect(stats.completionRate).toBeCloseTo(33.33, 1);
    });

    it('should handle user with no tasks', async () => {
      const stats = await service.getStats('user-no-tasks');

      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.totalXpEarned).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe('categories', () => {
    it('should create a category', async () => {
      const category = await service.createCategory({
        userId: 'user-1',
        name: 'Work',
        color: '#ff0000',
        icon: '💼',
      });

      expect(category).toBeDefined();
      expect(category.name).toBe('Work');
      expect(category.color).toBe('#ff0000');
      expect(category.icon).toBe('💼');
    });

    it('should get categories by user', async () => {
      await service.createCategory({ userId: 'user-1', name: 'Work' });
      await service.createCategory({ userId: 'user-1', name: 'Personal' });
      await service.createCategory({ userId: 'user-2', name: 'Other' });

      const categories = await service.getCategoriesByUserId('user-1');

      expect(categories).toHaveLength(2);
      expect(categories.every((c) => c.userId === 'user-1')).toBe(true);
    });

    it('should update a category', async () => {
      const category = await service.createCategory({
        userId: 'user-1',
        name: 'Work',
      });

      const updated = await service.updateCategory(category.id, {
        name: 'Work Tasks',
        color: '#00ff00',
      });

      expect(updated?.name).toBe('Work Tasks');
      expect(updated?.color).toBe('#00ff00');
    });

    it('should delete a category and remove from tasks', async () => {
      const category = await service.createCategory({
        userId: 'user-1',
        name: 'Work',
      });

      const task = await service.create({
        userId: 'user-1',
        title: 'Work Task',
        categoryId: category.id,
      });

      const success = await service.deleteCategory(category.id);

      expect(success).toBe(true);

      const updatedTask = await service.findById(task.id);
      expect(updatedTask?.categoryId).toBeNull();
    });
  });

  describe('getOverdueTasks', () => {
    it('should return overdue tasks', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await service.create({
        userId: 'user-1',
        title: 'Overdue Task',
        dueDate: yesterday,
      });

      await service.create({
        userId: 'user-1',
        title: 'Future Task',
        dueDate: tomorrow,
      });

      const overdueTasks = await service.getOverdueTasks('user-1');

      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].title).toBe('Overdue Task');
    });

    it('should not return completed tasks as overdue', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = await service.create({
        userId: 'user-1',
        title: 'Completed Overdue Task',
        dueDate: yesterday,
      });

      await service.complete(task.id);

      const overdueTasks = await service.getOverdueTasks('user-1');

      expect(overdueTasks).toHaveLength(0);
    });
  });
});
