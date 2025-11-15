# Life OS Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

## Development Scripts

### Feature Development

```bash
# Create a new feature with full scaffolding
npm run create-feature <feature-name>

# Example
npm run create-feature habits

# Validate all features (structure, dependencies, events)
npm run validate-features

# List all events in the system
npm run list-events [mode]

# Modes: category, feature, flow, stats, all
npm run list-events category  # Group by event category
npm run list-events feature   # Group by feature
npm run list-events flow      # Show event flows
npm run list-events stats     # Show statistics
```

### Database

```bash
# Generate migrations from schema changes
npm run db:migrate

# Push schema directly to database (development only)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests for specific feature
npm test src/features/tasks
```

### Quality Checks

```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Pre-commit validation (runs automatically)
npm run precommit
```

## Architecture Overview

### Feature-Based Structure

Life OS uses a **feature-based architecture** designed for parallel development:

```
src/features/
├── tasks/
│   ├── feature.config.ts    # Feature definition and initialization
│   ├── schema/               # Database schema
│   ├── services/             # Business logic
│   ├── components/           # UI components
│   ├── api/                  # API routes
│   ├── events/               # Event definitions
│   └── __tests__/            # Tests
├── journal/
├── gamification/
└── ...
```

### Core Systems

#### Event Bus
- **Location**: `src/core/event-bus/`
- **Purpose**: Decoupled communication between features
- **Usage**: Features emit and listen to events instead of direct imports

```typescript
// Emit an event
await eventBus.emit('task.completed', {
  taskId: '123',
  userId: 'user-1',
  xpReward: 50,
  timestamp: Date.now(),
});

// Listen to an event
eventBus.on('task.completed', async (payload) => {
  console.log('Task completed!', payload);
});
```

#### Feature Registry
- **Location**: `src/core/feature-registry/`
- **Purpose**: Manages feature lifecycle, services, and dependencies
- **Features**: Auto-registration, service injection, component slots

```typescript
// Get a service from another feature
const taskService = await registry.getService('task-service');

// Register a component slot
registry.registerComponentSlot('dashboard.widgets', MyWidget);
```

#### Plugin Loader
- **Location**: `src/core/plugin-loader/`
- **Purpose**: Auto-discovers and loads features
- **Features**: Topological sorting, dependency validation

#### Database
- **Location**: `src/core/database/`
- **ORM**: Drizzle ORM
- **Development**: SQLite (dev.db)
- **Production**: PostgreSQL (via DATABASE_URL)

#### AI Service
- **Location**: `src/core/ai/`
- **Development**: Mock providers (no API costs)
- **Production**: OpenAI, Anthropic, or other providers

## Creating a New Feature

### 1. Generate Feature Scaffold

```bash
npm run create-feature my-feature
```

This creates:
- Complete directory structure
- Template files with TODOs
- README with implementation checklist
- Basic test setup

### 2. Define Feature Configuration

Edit `src/features/my-feature/feature.config.ts`:

```typescript
export const MyFeature: FeatureDefinition = {
  id: 'my-feature',
  name: 'My Feature',
  version: '1.0.0',

  // Declare dependencies
  dependencies: ['gamification'],

  provides: {
    // Define routes
    routes: [
      { path: '/my-feature', component: () => import('./components/MyFeaturePage') },
      { path: '/api/my-feature', handler: () => import('./api/route') },
    ],

    // Define events
    events: {
      emits: ['my-feature.created', 'my-feature.updated'],
      listens: ['user.login'],
    },

    // Define services
    services: {
      'my-feature-service': () => import('./services/my-feature-service'),
    },

    // Define database tables
    tables: ['feature_my_feature'],
  },

  async initialize({ eventBus, registry, db }) {
    // Setup event listeners
    eventBus.on('user.login', async (payload) => {
      // Handle user login
    });

    // Register services, etc.
  },
};
```

### 3. Define Database Schema

Edit `src/features/my-feature/schema/index.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const myFeature = sqliteTable('feature_my_feature', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  status: text('status', { enum: ['active', 'completed'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type MyFeature = typeof myFeature.$inferSelect;
export type NewMyFeature = typeof myFeature.$inferInsert;
```

Generate migration:
```bash
npm run db:migrate
```

### 4. Implement Services

Edit `src/features/my-feature/services/index.ts`:

```typescript
export class MyFeatureService {
  constructor(
    private db: Database,
    private eventBus: IEventBus
  ) {}

  async create(data: Omit<NewMyFeature, 'id' | 'createdAt' | 'updatedAt'>): Promise<MyFeature> {
    const id = crypto.randomUUID();
    const [item] = await this.db
      .insert(myFeature)
      .values({ ...data, id })
      .returning();

    await this.eventBus.emit('my-feature.created', {
      myFeatureId: item.id,
      userId: item.userId,
      timestamp: Date.now(),
    });

    return item;
  }
}
```

### 5. Define Events

Edit `src/features/my-feature/events/index.ts`:

```typescript
export interface MyFeatureCreatedEvent extends BaseEventPayload {
  myFeatureId: string;
  userId: string;
}

export const MY_FEATURE_EVENTS = {
  CREATED: 'my-feature.created',
  UPDATED: 'my-feature.updated',
} as const;
```

### 6. Create API Routes

Edit `src/features/my-feature/api/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateSchema = z.object({
  userId: z.string(),
  title: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSchema.parse(body);

    const db = getDatabase();
    const service = createMyFeatureService(db, eventBus);

    const item = await service.create(validated);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 7. Build UI Components

Edit `src/features/my-feature/components/MyFeaturePage.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function MyFeaturePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch data
    fetch('/api/my-feature?userId=current-user')
      .then(res => res.json())
      .then(data => setItems(data.items));
  }, []);

  return (
    <div>
      <h1>My Feature</h1>
      {items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### 8. Enable the Feature

Edit `config/features.config.ts`:

```typescript
export const enabledFeatures = [
  'user',
  'gamification',
  'my-feature',  // Add your feature
  // ...
];
```

### 9. Document Events

Edit `config/events.config.ts`:

```typescript
export const EventCatalog = {
  // ...existing events...

  'my-feature.created': {
    description: 'New my-feature item created',
    emitter: 'my-feature',
    payload: {
      myFeatureId: 'string',
      userId: 'string',
      timestamp: 'number',
    },
    listeners: ['gamification', 'agents'],
  },
};
```

### 10. Write Tests

Edit `src/features/my-feature/__tests__/service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyFeatureService', () => {
  it('should create an item', async () => {
    const service = createMyFeatureService(db, eventBus);
    const item = await service.create({
      userId: 'user-1',
      title: 'Test',
    });

    expect(item.id).toBeDefined();
    expect(item.title).toBe('Test');
  });
});
```

Run tests:
```bash
npm test src/features/my-feature
```

## Event-Driven Communication

### Best Practices

1. **Never import directly between features**
   - ❌ `import { TaskService } from '@/features/tasks/services'`
   - ✅ Use events or service registry

2. **Use events for cross-feature communication**
   ```typescript
   // Feature A emits
   await eventBus.emit('task.completed', payload);

   // Feature B listens
   eventBus.on('task.completed', handler);
   ```

3. **Document all events in EventCatalog**
   - Helps with discovery
   - Validates event contracts
   - Shows event flows

4. **Use typed event payloads**
   ```typescript
   interface TaskCompletedEvent extends BaseEventPayload {
     taskId: string;
     xpReward: number;
   }
   ```

### Event Flow Example

```
User completes task
  → tasks emits 'task.completed'
  → gamification listens, awards XP
  → gamification emits 'xp.awarded'
  → agents listens, generates celebration message
  → if level up, gamification emits 'level.up'
```

## Database Patterns

### Schema Naming

- **Table prefix**: `feature_<feature-name>`
- **Example**: `feature_tasks`, `feature_journal_entries`
- **Purpose**: Prevents naming conflicts between features

### Migrations

```bash
# After changing schema
npm run db:migrate

# This generates migration SQL in drizzle/migrations/
```

### Relationships

```typescript
export const posts = sqliteTable('feature_posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').references(() => users.id),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

## Testing Strategy

### Unit Tests
- Test services in isolation
- Use in-memory SQLite database
- Mock event bus

### Integration Tests
- Test API routes
- Test event flows between features
- Use test database

### Component Tests
- Test UI components
- Mock API calls
- Test user interactions

## Validation Checklist

Before committing:

```bash
# Run all validations
npm run precommit

# Or manually:
npm run type-check        # TypeScript validation
npm run validate-features # Feature structure validation
npm run lint             # Code linting
npm test                 # Run tests
```

## Debugging Tips

### Event Flow Debugging

```typescript
// Enable event debugging in development
if (process.env.NODE_ENV === 'development') {
  eventBus.on('*', (event, payload) => {
    console.log(`[Event] ${event}:`, payload);
  });
}
```

### View Event History

```typescript
// Get recent events
const history = eventBus.getHistory(10);
console.log(history);
```

### Database Debugging

```bash
# Open Drizzle Studio
npm run db:studio

# Or use SQLite CLI
sqlite3 dev.db
```

### Service Debugging

```typescript
// Get all registered services
const services = registry.getAllServices();
console.log('Available services:', services);
```

## Common Patterns

### Accessing Other Feature Services

```typescript
async initialize({ registry }) {
  // Get service from another feature
  const gamificationService = await registry.getService('gamification-service');

  // Use it
  await gamificationService.awardXP(userId, 50);
}
```

### Component Slots (Extensibility)

```typescript
// Feature defines a slot
registry.defineComponentSlot('dashboard.widgets');

// Other features can add components
registry.registerComponentSlot('dashboard.widgets', MyWidget);

// Render all components in slot
const widgets = registry.getComponentsForSlot('dashboard.widgets');
```

### Feature Flags

```typescript
import { isFlagEnabled } from '@/config/features.config';

if (isFlagEnabled('tasks.ai-suggestions')) {
  // AI suggestions enabled
}
```

## Troubleshooting

### Feature Not Loading

1. Check it's enabled in `config/features.config.ts`
2. Verify dependencies are satisfied
3. Check `feature.config.ts` exports correctly
4. Run `npm run validate-features`

### Circular Dependency Error

```bash
npm run validate-features
# Will show circular dependency path
```

Fix by restructuring dependencies or using events instead.

### Database Migration Failed

```bash
# Reset database (development only!)
rm dev.db
npm run db:migrate
```

### Type Errors

```bash
npm run type-check
# Shows all TypeScript errors
```

## Production Deployment

### Environment Variables

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### Build

```bash
npm run build
npm start
```

### Database

```bash
# Run migrations in production
DATABASE_URL=postgresql://... npm run db:migrate
```

## Resources

- **Project Spec**: `life-os-project-spec.md`
- **Technical Architecture**: `technical-architecture.md`
- **Parallel Development Architecture**: `parallel-development-architecture.md`
- **Component Guide**: `component-implementation-guide.md`
- **Agent Behaviors**: `agent-behavior-spec.md`
- **Animation Guide**: `anime-js-animation-guide.md`

## Getting Help

Run validation and list events to understand the system:

```bash
npm run validate-features
npm run list-events all
```

Check feature README files for implementation checklists:
```bash
cat src/features/tasks/README.md
```
