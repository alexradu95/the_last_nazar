# Architecture Decisions and Rationale

This document records the key architectural decisions made for Life OS and the reasoning behind them.

---

## Core Architecture Decisions

### Decision 1: Event-Driven Architecture

**Decision**: Use event bus pattern for inter-feature communication instead of direct imports/calls.

**Rationale**:
- **Zero Coupling**: Features can be developed independently without knowledge of other features
- **Parallel Development**: Multiple developers/agents can work simultaneously without merge conflicts
- **Extensibility**: New features can listen to existing events without modifying original code
- **Testing**: Features can be tested in isolation
- **Flexibility**: Features can be added/removed without breaking dependencies

**Trade-offs**:
- ✅ Pros: True modularity, easy to add/remove features, parallel development
- ❌ Cons: Harder to trace data flow, potential event overhead, requires good documentation

**Example**:
```typescript
// ❌ Direct coupling
import { TaskService } from '@/features/tasks/services';
const taskService = new TaskService();

// ✅ Event-driven
await eventBus.emit('task.completed', payload);
```

**Status**: ✅ Implemented and proven successful

---

### Decision 2: Next.js 15 App Router

**Decision**: Use Next.js 15 with App Router instead of Pages Router.

**Rationale**:
- **Server Components**: Better performance with reduced client-side JavaScript
- **Streaming**: Progressive rendering for better UX
- **Layout System**: Shared layouts with nested routing
- **API Routes**: Collocated API endpoints with improved DX
- **Future-Proof**: App Router is the future of Next.js

**Trade-offs**:
- ✅ Pros: Better performance, modern patterns, server components, streaming
- ❌ Cons: Learning curve, some libraries not yet compatible, requires async params

**Migration Notes**:
- All `params` and `searchParams` are now async
- `cookies()` and `headers()` require await
- React 19 required

**Status**: ✅ Implemented

---

### Decision 3: Plugin/Feature-Based Architecture

**Decision**: Structure code as self-contained feature plugins rather than traditional layers.

**Rationale**:
- **Isolation**: Each feature owns its entire stack (UI, API, DB, logic)
- **Scalability**: Easy to add new features without touching existing code
- **Team Collaboration**: Different teams can own different features
- **Maintenance**: Changes are localized to single feature directory
- **Deployment**: Features can potentially be deployed independently

**Structure**:
```
features/
  ├── tasks/          # Complete feature stack
  │   ├── components/
  │   ├── api/
  │   ├── services/
  │   ├── schema/
  │   └── tests/
  ├── journal/
  └── gamification/
```

**Trade-offs**:
- ✅ Pros: Clear boundaries, easy to understand, scalable, testable
- ❌ Cons: Some code duplication, requires discipline, shared utilities need care

**Status**: ✅ Implemented with 6 feature templates

---

### Decision 4: Drizzle ORM over Prisma

**Decision**: Use Drizzle ORM instead of Prisma for database operations.

**Rationale**:
- **TypeScript-First**: Better type inference and IntelliSense
- **SQL-Like Syntax**: More familiar to developers who know SQL
- **Performance**: Lighter runtime, no query engine needed
- **Edge Runtime**: Works with serverless/edge environments
- **Schema as Code**: No separate schema file format to learn

**Trade-offs**:
- ✅ Pros: Excellent TypeScript support, SQL-like queries, edge compatible, lightweight
- ❌ Cons: Smaller ecosystem than Prisma, less tooling, newer project

**Example**:
```typescript
// Drizzle - SQL-like and type-safe
const tasks = await db
  .select()
  .from(tasks)
  .where(eq(tasks.userId, userId))
  .orderBy(desc(tasks.createdAt));
```

**Status**: ✅ Implemented and working well

---

### Decision 5: SQLite for Development, PostgreSQL for Production

**Decision**: Use SQLite for local development and PostgreSQL for production.

**Rationale**:
- **Developer Experience**: Zero setup for new developers
- **Speed**: SQLite is fast for local development
- **Testing**: Easy to create in-memory databases for tests
- **Production**: PostgreSQL offers better scalability and features
- **Drizzle Support**: Works seamlessly with both via adapter pattern

**Migration Path**:
```bash
# Development
DATABASE_URL=file:./dev.db

# Production
DATABASE_URL=postgresql://user:pass@host/db
```

**Trade-offs**:
- ✅ Pros: Fast local dev, easy testing, production-grade database for deployment
- ❌ Cons: SQL differences between SQLite/PostgreSQL, need to test both

**Status**: ✅ Implemented (SQLite in use, PostgreSQL-ready)

---

### Decision 6: Anime.js for Animations

**Decision**: Use Anime.js instead of Framer Motion or React Spring.

**Rationale**:
- **Pixel Art Aesthetic**: Better control for pixel-perfect animations
- **Timeline System**: Complex animation sequences are easier
- **Performance**: Lightweight and GPU-accelerated
- **Vanilla JS**: Works with any framework, not React-specific
- **Stagger Effects**: Built-in stagger for list animations

**Trade-offs**:
- ✅ Pros: Powerful timelines, lightweight, pixel-perfect control, great for game-like UI
- ❌ Cons: Less React-specific, requires manual cleanup, steeper learning curve

**Accessibility**:
```typescript
// Always respect user preferences
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

**Status**: ✅ Implemented with comprehensive animation library

---

### Decision 7: Mock AI Providers for Development

**Decision**: Create mock AI providers instead of requiring API keys for development.

**Rationale**:
- **Zero Cost**: No API costs during development
- **Faster Development**: No API latency
- **Offline Development**: Works without internet
- **Consistent Testing**: Predictable responses for tests
- **Easy Onboarding**: New developers don't need API keys

**Implementation**:
```typescript
const provider = new MockAIProvider({
  personality: 'dawn',
  responseDelay: 50, // ms per word for realistic streaming
});
```

**Trade-offs**:
- ✅ Pros: Free, fast, offline-capable, consistent, no API keys needed
- ❌ Cons: Not testing real AI, need to implement mock responses

**Status**: ✅ Implemented with Dawn, Atlas, Luna personalities

---

### Decision 8: shadcn/ui over Component Libraries

**Decision**: Use shadcn/ui copy-paste components instead of traditional component libraries.

**Rationale**:
- **Full Ownership**: Components are in your codebase, fully customizable
- **No Black Box**: See exactly what's happening
- **Type Safe**: Full TypeScript support
- **Accessibility**: Built on Radix UI primitives
- **Tailwind Native**: Perfect integration with Tailwind CSS
- **No Bundle Bloat**: Only include what you use

**Trade-offs**:
- ✅ Pros: Full control, no version lock-in, highly customizable, accessible
- ❌ Cons: More code in repo, manual updates, need to maintain components

**Status**: ✅ Implemented extensively

---

### Decision 9: Vercel AI SDK for AI Integration

**Decision**: Use Vercel AI SDK instead of direct OpenAI/Anthropic SDKs.

**Rationale**:
- **Provider Agnostic**: Easy to switch between OpenAI, Anthropic, etc.
- **Streaming Built-in**: First-class streaming support
- **React Hooks**: `useChat`, `useCompletion` for easy integration
- **Type Safe**: Full TypeScript support
- **Edge Ready**: Works in edge runtimes
- **Middleware Support**: Easy to add logging, rate limiting, etc.

**Trade-offs**:
- ✅ Pros: Provider flexibility, great DX, streaming, React integration
- ❌ Cons: Extra abstraction layer, vendor lock-in to Vercel ecosystem

**Status**: ✅ Implemented in agent API routes

---

### Decision 10: Vitest over Jest for Testing

**Decision**: Use Vitest instead of Jest for unit testing.

**Rationale**:
- **Vite Integration**: Native Vite support (Next.js uses Vite internally)
- **Speed**: Faster test execution
- **ESM First**: Better ES module support
- **Jest Compatible**: Drop-in replacement with same API
- **Modern**: Built for modern JavaScript

**Trade-offs**:
- ✅ Pros: Fast, modern, Vite-native, Jest-compatible API
- ❌ Cons: Smaller ecosystem than Jest, newer project

**Status**: ✅ Implemented

---

### Decision 11: Playwright for E2E Testing

**Decision**: Use Playwright instead of Cypress for E2E testing.

**Rationale**:
- **Multi-Browser**: Chrome, Firefox, Safari support out of the box
- **Auto-Wait**: Intelligent waiting, fewer flaky tests
- **Parallel Execution**: Faster test runs
- **Mobile Testing**: Built-in device emulation
- **Network Control**: Easy to mock APIs
- **Modern API**: Better developer experience

**Trade-offs**:
- ✅ Pros: Multi-browser, reliable, fast, great debugging tools
- ❌ Cons: Less ecosystem than Cypress, steeper learning curve

**Status**: ✅ Implemented with 31 tests

---

### Decision 12: Conventional Commits

**Decision**: Use conventional commit format for all commits.

**Rationale**:
- **Clear History**: Understand what changed at a glance
- **Automated Changelog**: Can generate changelogs automatically
- **Versioning**: Semantic versioning based on commit types
- **Consistency**: Standard format across team

**Format**:
```
feat: add task completion animation
fix: correct date formatting in task list
refactor: extract validation to separate function
test: add edge cases for task service
docs: update README with setup instructions
```

**Status**: ✅ Adopted standard

---

### Decision 13: Monorepo Structure (Future)

**Decision**: Keep as single repo for now, plan for monorepo later.

**Rationale**:
- **Simplicity**: Easier to start with single repo
- **Iteration Speed**: Faster development without workspace complexity
- **Future Migration**: Can move to monorepo when needed (Turborepo, nx)

**Migration Trigger Points**:
- Multiple deployable applications
- Shared libraries used by many features
- Different deployment schedules for different features

**Status**: ⏳ Single repo, monorepo-ready structure

---

## Naming Conventions

### Database Tables
- **Format**: `feature_<name>` (snake_case)
- **Example**: `feature_tasks`, `feature_journal_entries`
- **Rationale**: Clear ownership, prevents naming conflicts

### TypeScript Types
- **Format**: `PascalCase`
- **Example**: `Task`, `TaskService`, `CreateTaskDTO`
- **Rationale**: TypeScript standard

### Files
- **Format**: `kebab-case.ts`
- **Example**: `task-service.ts`, `use-tasks.ts`
- **Rationale**: URL-safe, easy to read

### Components
- **Format**: `PascalCase.tsx`
- **Example**: `TaskCard.tsx`, `DawnAgent.tsx`
- **Rationale**: React standard

---

## Security Decisions

### Decision: Server Actions over API Routes (where appropriate)

**Decision**: Use Server Actions for mutations when possible, API routes for complex logic.

**Rationale**:
- **Type Safety**: End-to-end type safety
- **Less Boilerplate**: No need to define API routes
- **Progressive Enhancement**: Forms work without JavaScript
- **Security**: Built-in CSRF protection

**When to use API Routes**:
- Public APIs
- Webhooks
- Complex middleware chains
- Third-party integrations

**Status**: 🔄 Planned for future features

---

### Decision: Environment Variables Pattern

**Decision**: Use `NEXT_PUBLIC_` prefix only for client-side variables.

**Rationale**:
- **Security**: Prevents accidental exposure of secrets
- **Clear Intent**: Prefix makes it obvious what's exposed
- **Type Safety**: Can validate server-only variables

**Pattern**:
```env
# Server-only (never exposed)
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# Client-side (exposed in browser)
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Status**: ✅ Implemented

---

## Performance Decisions

### Decision: Lazy Load Features

**Decision**: Use dynamic imports for features to reduce initial bundle size.

**Implementation**:
```typescript
const TasksPage = dynamic(() => import('@/features/tasks/components/TasksPage'));
```

**Status**: 🔄 Planned

---

### Decision: Optimize Images with next/image

**Decision**: Always use `next/image` component for images.

**Rationale**:
- **Automatic Optimization**: WebP/AVIF conversion
- **Lazy Loading**: Built-in
- **Responsive**: Multiple sizes generated
- **Performance**: Better Core Web Vitals

**Status**: ✅ Standard practice

---

## Development Workflow Decisions

### Decision: TDD Mandatory

**Decision**: All features must be developed using Test-Driven Development.

**Rationale**:
- **Quality**: Catches bugs early
- **Design**: Forces thinking about API design
- **Confidence**: Safe to refactor
- **Documentation**: Tests document expected behavior

**Status**: ✅ Enforced standard

---

### Decision: CLI for Feature Scaffolding

**Decision**: Provide CLI tool to generate feature boilerplate.

**Command**:
```bash
npm run create-feature <name>
```

**Rationale**:
- **Consistency**: All features follow same structure
- **Speed**: Faster to start new features
- **Best Practices**: Scaffolded code follows patterns
- **Onboarding**: New developers start with correct structure

**Status**: ✅ Implemented

---

## Future Decisions to Make

### Under Consideration:

1. **Caching Strategy**: Redis vs in-memory vs Next.js cache
2. **File Uploads**: S3 vs Vercel Blob vs local storage
3. **Real-time**: WebSockets vs Server-Sent Events vs polling
4. **Mobile**: React Native vs PWA vs separate mobile app
5. **Deployment**: Vercel vs self-hosted vs edge deployment
6. **Monitoring**: Sentry vs LogRocket vs custom solution

---

**Note**: This document should be updated whenever significant architectural decisions are made. Include the decision, rationale, trade-offs, and implementation status.
