# Established Code Patterns and Conventions

This document consolidates all established patterns, conventions, and best practices used throughout the Life OS codebase.

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

**CRITICAL**: Every feature must follow TDD. No production code without a failing test first.

1. **RED** - Write a failing test for desired behavior
2. **GREEN** - Write minimum code to make test pass
3. **REFACTOR** - Assess and improve code structure (only if it adds value)

### Example TDD Workflow

```typescript
// Step 1: RED - Write failing test
describe('Calculator', () => {
  it('should add two numbers', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
});

// Step 2: GREEN - Minimal implementation
export const add = (a: number, b: number): number => {
  return a + b;
};

// Step 3: REFACTOR - Improve if needed (this example is already clean)
```

### Test Structure Pattern

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Specific Behavior', () => {
    it('should do something when condition is met', () => {
      // Arrange - set up test data
      const input = createTestInput();

      // Act - execute the behavior
      const result = performAction(input);

      // Assert - verify the outcome
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Test Factory Pattern

Always use factory functions with optional overrides:

```typescript
const getMockTask = (overrides?: Partial<Task>): Task => {
  return {
    id: 'task-123',
    title: 'Default Task',
    priority: 'medium',
    xpReward: 50,
    completed: false,
    ...overrides,
  };
};

// Usage
const task = getMockTask({ title: 'Custom Title', priority: 'high' });
```

### Database Testing Pattern

```typescript
describe('User Repository', () => {
  let db: TestDb;
  let sqlite: Database.Database;

  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    sqlite = testDb.sqlite;

    createTestTables(sqlite, {
      users: `CREATE TABLE users (id TEXT, email TEXT)`,
    });
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should insert user', async () => {
    await db.insert(users).values({ id: '1', email: 'test@example.com' });
    const result = await db.select().from(users);
    expect(result).toHaveLength(1);
  });
});
```

---

## Event-Driven Architecture Patterns

### Event Emission Pattern

```typescript
// Service emits events after successful operations
export class TaskService {
  async completeTask(taskId: string): Promise<Task> {
    const task = await this.updateTask(taskId, { completed: true });

    // Emit event for other features to react
    await eventBus.emit('task.completed', {
      taskId: task.id,
      userId: task.userId,
      xpReward: task.xpReward,
      timestamp: Date.now(),
    });

    return task;
  }
}
```

### Event Listening Pattern

```typescript
// Features listen to events they care about
export const setupEventListeners = () => {
  // Listen to task completion
  eventBus.on('task.completed', async (payload) => {
    // Award XP to user
    await gamificationService.awardXP(payload.userId, payload.xpReward);
  });

  // Listen to level up
  eventBus.on('level.up', async (payload) => {
    // Trigger celebration animation
    await animationService.levelUpCelebration(payload.newLevel);
  });
};
```

### Event Catalog Pattern

All events must be documented:

```typescript
export const EventCatalog = {
  'task.completed': {
    description: 'Task marked as complete',
    emitter: 'tasks',
    payload: {
      taskId: 'string',
      userId: 'string',
      xpReward: 'number',
      timestamp: 'number',
    },
    listeners: ['gamification', 'agents'],
  },
};
```

---

## Feature Architecture Pattern

### Feature Directory Structure

```
feature-name/
├── feature.config.ts      # Feature definition
├── schema/
│   └── index.ts          # Database schema
├── services/
│   └── index.ts          # Business logic
├── components/
│   └── index.tsx         # UI components
├── api/
│   └── route.ts          # API endpoints
├── events/
│   └── index.ts          # Event definitions
├── hooks/
│   └── useFeature.ts     # React hooks
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   └── index.ts          # Utilities
├── __tests__/
│   └── service.test.ts   # Tests
└── README.md             # Implementation checklist
```

### Feature Configuration Pattern

```typescript
// feature.config.ts
export const TaskFeatureConfig: FeatureDefinition = {
  id: 'tasks',
  name: 'Task Management',
  version: '1.0.0',
  dependencies: ['gamification'],

  events: {
    emits: ['task.created', 'task.completed', 'task.updated', 'task.deleted'],
    listens: ['user.login'],
  },

  services: {
    'task-service': TaskService,
  },

  routes: [
    { path: '/tasks', component: TasksPage },
  ],

  initialize: async (context: FeatureContext) => {
    // Setup event listeners
    setupTaskEventListeners(context.eventBus);
  },
};
```

---

## Database Patterns

### Schema Naming Convention

- **Table names**: `feature_<name>` (e.g., `feature_tasks`)
- **Relations**: Use Drizzle's `relations()` helper
- **Indexes**: Add for common query patterns

```typescript
// schema/index.ts
export const tasks = pgTable('feature_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull(),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('tasks_user_idx').on(table.userId),
  completedIdx: index('tasks_completed_idx').on(table.completed),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

### Service Layer Pattern

```typescript
// services/task-service.ts
export class TaskService {
  constructor(private db: Database, private eventBus: EventBus) {}

  async createTask(data: NewTask): Promise<Task> {
    const [task] = await this.db.insert(tasks).values(data).returning();

    await this.eventBus.emit('task.created', {
      taskId: task.id,
      userId: task.userId,
    });

    return task;
  }

  async getTasks(userId: string, filters?: TaskFilters): Promise<Task[]> {
    let query = this.db.select().from(tasks).where(eq(tasks.userId, userId));

    if (filters?.priority) {
      query = query.where(eq(tasks.priority, filters.priority));
    }

    return query;
  }
}
```

---

## Component Patterns

### shadcn/ui Integration Pattern

```tsx
// components/task-card.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onComplete(task.id)}
          />

          <div className="flex-1">
            <h4 className="font-medium">{task.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{task.priority}</Badge>
              <Badge variant="secondary">{task.xpReward} XP</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Custom Hook Pattern

```typescript
// hooks/useTasks.ts
export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completeTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' });
    await fetchTasks(); // Refresh
  };

  return { tasks, loading, error, completeTask, refetch: fetchTasks };
}
```

---

## Animation Patterns

### Entrance Animation Pattern

```typescript
// Use timeline for complex sequences
const entranceAnimation = () => {
  const timeline = anime.timeline({
    easing: 'easeOutExpo',
  });

  timeline
    .add({
      targets: '.element',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
    })
    .add({
      targets: '.child-elements',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(50),
      offset: '-=300',
    });

  return timeline;
};
```

### Celebration Animation Pattern

```typescript
// XP gain with floating numbers
export const xpGainAnimation = (element: HTMLElement, xpAmount: number) => {
  const timeline = anime.timeline();

  // Counter animation
  timeline.add({
    targets: { value: 0 },
    value: xpAmount,
    duration: 1500,
    easing: 'easeInOutQuad',
    round: 1,
    update: (anim) => {
      element.innerHTML = `${Math.floor(anim.animations[0].currentValue)} XP`;
    },
  });

  // Floating number
  const floater = createFloatingNumber(element, `+${xpAmount}`);
  timeline.add({
    targets: floater,
    translateY: -100,
    opacity: [1, 0],
    scale: [1, 1.5],
    duration: 1500,
    easing: 'easeOutQuad',
    complete: () => floater.remove(),
  }, '-=1500');

  return timeline;
};
```

### Performance-Optimized Animation

```typescript
// Always use transforms over position properties
// ✅ Good - GPU accelerated
anime({
  targets: '.element',
  translateX: 100,
  translateY: 50,
  scale: 1.2,
  duration: 600,
});

// ❌ Bad - causes reflow
anime({
  targets: '.element',
  left: '100px',
  top: '50px',
  width: '120%',
  duration: 600,
});
```

### Accessibility-First Animation

```typescript
// Respect user's motion preferences
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (shouldAnimate) {
  anime({
    targets: '.element',
    scale: [0, 1],
    duration: 600,
  });
} else {
  // Just show the element
  element.style.opacity = '1';
}
```

---

## API Route Patterns

### Standard API Route Structure

```typescript
// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { taskService } from '@/features/tasks/services';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high']),
  userId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createTaskSchema.parse(body);

    const task = await taskService.createTask(validated);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const tasks = await taskService.getTasks(userId);
  return NextResponse.json(tasks);
}
```

### Vercel AI SDK Integration Pattern

```typescript
// app/api/agents/dawn/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  // Fetch user context
  const userTasks = await taskService.getTasks(userId);

  const systemPrompt = `
    You are Dawn, an energetic morning companion.
    User's tasks: ${userTasks.map(t => t.title).join(', ')}
  `;

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
  });

  return result.toDataStreamResponse();
}
```

---

## State Management Patterns

### Zustand Store Pattern

```typescript
// store/task-store.ts
import create from 'zustand';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task],
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
  })),

  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id),
  })),
}));
```

---

## Error Handling Patterns

### Service Error Pattern

```typescript
export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskService {
  async getTask(id: string): Promise<Task> {
    const task = await this.db.select().from(tasks).where(eq(tasks.id, id));

    if (!task) {
      throw new TaskNotFoundError(id);
    }

    return task;
  }
}
```

### Client Error Handling Pattern

```tsx
export function TaskList() {
  const { tasks, loading, error } = useTasks(userId);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading tasks</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <div>{tasks.map(task => <TaskCard key={task.id} task={task} />)}</div>;
}
```

---

## Key Principles Summary

1. **TDD First**: No production code without failing test
2. **Event-Driven**: Features communicate via events, not direct calls
3. **Feature Isolation**: Each feature is self-contained
4. **Type Safety**: Full TypeScript with strict mode
5. **Accessibility**: Respect user preferences (motion, color scheme)
6. **Performance**: Use transforms, debounce, lazy load
7. **Error Handling**: Explicit error types and user-friendly messages
8. **Documentation**: Code is self-documenting through clear naming

---

**Remember**: These patterns are proven and battle-tested in the codebase. Follow them for consistency and maintainability.
