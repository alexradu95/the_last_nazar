# Task Management Feature

## Overview
Handles task creation, completion tracking, and task management with XP rewards.

## Status
🚧 **Template** - Ready for implementation

## Dependencies
- `gamification` - For XP rewards and achievement tracking

## Events

### Emits
- `task.created` - When a new task is created
- `task.completed` - When a task is marked complete
- `task.updated` - When task details are modified
- `task.deleted` - When a task is removed

### Listens
- `user.login` - Initialize user's tasks
- `xp.awarded` - Track XP from task completions

## API Endpoints

### Tasks API (`/api/tasks`)
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task complete

## Components

### TaskCard
Display and interact with a single task.

**Props:**
- `task: Task` - Task data
- `onComplete: (taskId: string) => void` - Completion handler

### TaskList
Display list of tasks with filtering.

**Props:**
- `tasks: Task[]` - Array of tasks
- `filters?: TaskFilters` - Filter options

### TaskForm
Create or edit task.

**Props:**
- `task?: Task` - Task to edit (optional)
- `onSubmit: (data: CreateTaskDTO) => void` - Submit handler

## Database Schema

```sql
CREATE TABLE feature_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  completed INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE TABLE feature_task_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  color TEXT
);
```

## Services

### TaskService
Main business logic for tasks.

**Methods:**
- `createTask(data: CreateTaskDTO): Promise<Task>`
- `completeTask(taskId: string): Promise<TaskCompletionResult>`
- `getUserTasks(userId: string, filters?: TaskFilters): Promise<Task[]>`
- `updateTask(taskId: string, data: UpdateTaskDTO): Promise<Task>`
- `deleteTask(taskId: string): Promise<void>`

## Implementation Checklist

- [ ] Implement `services/task-service.ts`
- [ ] Create `components/TaskCard.tsx`
- [ ] Create `components/TaskList.tsx`
- [ ] Create `components/TaskForm.tsx`
- [ ] Implement `api/route.ts`
- [ ] Add schema migrations
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add event listeners in feature.config.ts
- [ ] Test with gamification feature

## Testing

```bash
# Run tests
npm test features/tasks

# Test specific file
npm test features/tasks/services/task-service.test.ts
```

## Configuration

```typescript
// config/features.config.ts
enabledFeatures: ['tasks']

// Feature flags
featureFlags: {
  'tasks.categories': true,
  'tasks.ai-suggestions': false,
}
```

## Usage Example

```typescript
import { TaskService } from '@/features/tasks/services/task-service';
import { eventBus } from '@/core/event-bus';

// Create task
const task = await taskService.createTask({
  title: 'Complete project',
  priority: 'high',
});

// Listen to completion
eventBus.on('task.completed', (data) => {
  console.log(`Task completed! Earned ${data.xpReward} XP`);
});

// Complete task
await taskService.completeTask(task.id);
```

## Notes

- Tasks emit events that trigger XP rewards in the gamification feature
- All task operations are atomic and handle errors gracefully
- Task priorities affect XP rewards (high = more XP)
- Completed tasks are kept for statistics but can be archived
