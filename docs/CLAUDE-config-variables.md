# Configuration Variables Reference

This document provides a comprehensive reference for all configuration variables and settings used in Life OS.

---

## Environment Variables

### Required Variables

#### Database Configuration
```env
# Development (SQLite)
DATABASE_URL=file:./dev.db

# Production (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Test Environment
DATABASE_URL_TEST=file:./test.db
```

#### AI Provider API Keys
```env
# OpenAI (for real AI integration)
OPENAI_API_KEY=sk-proj-...

# Anthropic Claude (alternative)
ANTHROPIC_API_KEY=sk-ant-...

# Mock mode (development - no API key needed)
USE_MOCK_AI=true
```

### Optional Variables

#### Feature Flags
```env
# Enable/disable features
ENABLE_GAMIFICATION=true
ENABLE_AI_AGENTS=true
ENABLE_ANALYTICS=false

# Feature-specific settings
ENABLE_AI_SUGGESTIONS=false
ENABLE_MOOD_TRACKING=true
ENABLE_ANIMATIONS=true
```

#### Server Configuration
```env
# Server port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=development  # or production, test

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Logging and Debugging
```env
# Debug mode
DEBUG=true
EVENT_BUS_DEBUG=true

# Log level
LOG_LEVEL=info  # debug, info, warn, error
```

#### Authentication (Future)
```env
# Session secret
SESSION_SECRET=your-secret-key-here

# JWT secret
JWT_SECRET=your-jwt-secret-here

# OAuth credentials
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

#### External Services (Future)
```env
# Redis (caching)
REDIS_URL=redis://localhost:6379

# S3 (file storage)
S3_BUCKET=life-os-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

---

## Configuration Files

### Feature Configuration

Location: `config/features.config.ts`

```typescript
export const enabledFeatures = [
  'user',
  'gamification',
  'auth',
  'agents',
  'tasks',
  'journal',
];

export const featureFlags = {
  'tasks.ai-suggestions': false,
  'journal.mood-tracking': true,
  'animations.enabled': true,
  'gamification.leaderboards': false,
};

export const featureSettings = {
  tasks: {
    maxTasks: 100,
    defaultPriority: 'medium',
    xpRewards: {
      low: 10,
      medium: 25,
      high: 50,
    },
  },
  gamification: {
    xpPerLevel: 1000,
    maxLevel: 100,
  },
};
```

### Event Configuration

Location: `config/events.config.ts`

```typescript
export const EventCatalog = {
  'task.completed': {
    description: 'Task marked as complete',
    emitter: 'tasks',
    payload: {
      taskId: 'string',
      userId: 'string',
      xpReward: 'number',
    },
    listeners: ['gamification', 'agents'],
  },
  // ... more events
};
```

### Database Configuration

Location: `drizzle.config.ts`

```typescript
export default {
  schema: './src/features/**/schema/index.ts',
  out: './drizzle',
  driver: 'better-sqlite3', // or 'pg' for PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};
```

### Next.js Configuration

Location: `next.config.js`

```javascript
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### TypeScript Configuration

Location: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind Configuration

Location: `tailwind.config.ts`

```typescript
const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      animation: {
        // Custom animations
      },
    },
  },
};
```

---

## Database Schema Reference

### Naming Conventions

All feature tables use the `feature_` prefix:

- `feature_tasks`
- `feature_journal_entries`
- `feature_achievements`
- `feature_users`
- `feature_sessions`

### Common Column Patterns

```typescript
// Standard ID column
id: uuid('id').primaryKey().defaultRandom()

// User reference
userId: text('user_id').notNull()

// Timestamps
createdAt: timestamp('created_at').defaultNow()
updatedAt: timestamp('updated_at').defaultNow()

// Soft delete
deletedAt: timestamp('deleted_at')

// Enums
status: text('status', { enum: ['active', 'completed', 'archived'] })

// JSON fields
metadata: jsonb('metadata')
```

---

## Feature-Specific Configuration

### Tasks Feature

```typescript
// services/task-service.ts
const TASK_CONFIG = {
  MAX_TASKS_PER_USER: 100,
  XP_REWARDS: {
    low: 10,
    medium: 25,
    high: 50,
  },
  OVERDUE_THRESHOLD_HOURS: 24,
};
```

### Gamification Feature

```typescript
// services/gamification-service.ts
const GAMIFICATION_CONFIG = {
  XP_PER_LEVEL: 1000,
  MAX_LEVEL: 100,
  STREAK_BONUS_MULTIPLIER: 1.5,
  ACHIEVEMENT_POINTS: {
    bronze: 50,
    silver: 150,
    gold: 500,
  },
};
```

### Animation Feature

```typescript
// lib/animations/config.ts
const ANIMATION_CONFIG = {
  DEFAULT_DURATION: 600,
  DEFAULT_EASING: 'easeOutExpo',
  STAGGER_DELAY: 50,
  RESPECT_REDUCED_MOTION: true,
};
```

### AI Agents

```typescript
// Mock provider configuration
const MOCK_AI_CONFIG = {
  personalities: {
    dawn: {
      name: 'Dawn',
      tone: 'energetic',
      emoji: '🌅',
      responseDelay: 50, // ms per word
    },
    atlas: {
      name: 'Atlas',
      tone: 'analytical',
      emoji: '🔮',
      responseDelay: 40,
    },
    luna: {
      name: 'Luna',
      tone: 'reflective',
      emoji: '🌙',
      responseDelay: 60,
    },
  },
};
```

---

## API Endpoints Reference

### Base URL

Development: `http://localhost:3000/api`
Production: `https://your-domain.com/api`

### Tasks API

```
POST   /api/tasks              Create task
GET    /api/tasks              List tasks (query: userId, priority, completed)
GET    /api/tasks/:id          Get task by ID
PATCH  /api/tasks/:id          Update task
DELETE /api/tasks/:id          Delete task
POST   /api/tasks/:id/complete Complete task
GET    /api/tasks/stats        Get task statistics
```

### Agents API

```
POST   /api/agents/dawn        Chat with Dawn agent
POST   /api/agents/atlas       Chat with Atlas agent
POST   /api/agents/luna        Chat with Luna agent
GET    /api/agents/suggestions Get AI suggestions
```

### Authentication API (Future)

```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login user
POST   /api/auth/logout        Logout user
POST   /api/auth/refresh       Refresh session
GET    /api/auth/me            Get current user
```

---

## Development vs Production Settings

### Development

```env
NODE_ENV=development
DATABASE_URL=file:./dev.db
USE_MOCK_AI=true
DEBUG=true
EVENT_BUS_DEBUG=true
ENABLE_ANIMATIONS=true
```

### Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
USE_MOCK_AI=false
DEBUG=false
EVENT_BUS_DEBUG=false
ENABLE_ANIMATIONS=true
SESSION_SECRET=secure-random-string
```

### Test

```env
NODE_ENV=test
DATABASE_URL=file:./test.db
USE_MOCK_AI=true
DEBUG=false
```

---

## CLI Commands Reference

### Development

```bash
npm run dev              # Start dev server
npm run dev:turbo        # Start with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation
```

### Database

```bash
npm run db:migrate       # Run migrations
npm run db:push          # Push schema (dev only)
npm run db:studio        # Open Drizzle Studio
npm run db:generate      # Generate migration
npm run db:seed          # Seed database (custom script)
```

### Features

```bash
npm run create-feature <name>  # Generate new feature
npm run validate-features      # Validate all features
npm run list-events [mode]     # View event documentation
```

### Testing

```bash
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run with coverage
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Open Playwright UI
```

---

## Security Configuration

### CORS Settings

```typescript
// middleware.ts or next.config.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-domain.com',
];
```

### Rate Limiting

```typescript
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
};
```

### Content Security Policy

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.openai.com;
`;
```

---

## Monitoring and Analytics (Future)

```env
# Sentry
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production

# Analytics
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=...

# Performance monitoring
ENABLE_PERFORMANCE_MONITORING=true
```

---

## Path Aliases

Configured in `tsconfig.json`:

```
@/*           → src/*
@/components  → src/components/*
@/features    → src/features/*
@/lib         → src/lib/*
@/core        → src/core/*
```

---

## Quick Reference

### Get Configuration Value

```typescript
// Environment variable
const apiKey = process.env.OPENAI_API_KEY;

// Feature flag
import { featureFlags } from '@/config/features.config';
const isEnabled = featureFlags['tasks.ai-suggestions'];

// Feature setting
import { featureSettings } from '@/config/features.config';
const maxTasks = featureSettings.tasks.maxTasks;
```

### Update Configuration

1. **Environment Variables**: Update `.env.local`
2. **Feature Flags**: Edit `config/features.config.ts`
3. **Database Schema**: Edit feature's `schema/index.ts` → run `npm run db:generate`
4. **Event Catalog**: Edit `config/events.config.ts`

---

**Last Updated**: 2025-11-15

**Note**: Keep this document updated when adding new configuration options. Always document default values and valid ranges.
