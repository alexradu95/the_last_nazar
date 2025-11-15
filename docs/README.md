# Life OS - Your Personal Productivity & Well-Being Companion

A modular, event-driven productivity platform with AI agents, gamification, and beautiful pixel art aesthetics.

---

## 🎯 Project Overview

**Life OS** is a comprehensive productivity platform designed for parallel feature development. Built with Next.js 15, it features:

- 🤖 **Three AI Agents** - Dawn (morning coach), Atlas (analytics), Luna (journal companion)
- 🎮 **Gamification System** - XP, levels, achievements, and streaks
- ✅ **Task Management** - Priority-based tasks with XP rewards
- 📔 **Smart Journaling** - Mood tracking with AI insights
- 🎨 **Pixel Art Aesthetic** - Beautiful animations with Anime.js
- 🔌 **Event-Driven Architecture** - Zero-coupling feature development

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## 📁 Project Structure

```
my-app/
├── docs/                       # Documentation
│   ├── CLAUDE-activeContext.md      # Current session state
│   ├── CLAUDE-patterns.md           # Code patterns & conventions
│   ├── CLAUDE-decisions.md          # Architecture decisions
│   ├── CLAUDE-troubleshooting.md    # Known issues & solutions
│   ├── CLAUDE-config-variables.md   # Configuration reference
│   ├── current/                     # Current implementation docs
│   ├── architecture/                # Architecture documentation
│   ├── future/                      # Future implementation plans
│   └── reference/                   # Reference guides
├── src/
│   ├── core/                  # Core systems
│   │   ├── event-bus/        # Event-driven communication
│   │   ├── feature-registry/ # Feature management
│   │   ├── plugin-loader/    # Auto-discovery
│   │   └── database/         # Database layer (Drizzle ORM)
│   └── features/             # All features
│       ├── tasks/            # Task management ✅
│       ├── agents/           # AI agents ✅
│       ├── auth/             # Authentication ✅
│       ├── animations/       # Animation system ✅
│       ├── gamification/     # XP & achievements (planned)
│       └── journal/          # Journaling (planned)
└── config/
    ├── features.config.ts    # Feature flags
    └── events.config.ts      # Event catalog
```

---

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run type-check       # TypeScript validation
npm run lint             # ESLint

# Features
npm run create-feature <name>  # Generate new feature
npm run validate-features      # Validate all features
npm run list-events [mode]     # View event catalog

# Database
npm run db:migrate       # Run migrations
npm run db:push          # Push schema (dev only)
npm run db:studio        # Open Drizzle Studio

# Testing
npm test                 # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests with Playwright
npm run test:e2e:ui      # Playwright UI mode
```

### Create New Feature

```bash
# Generate feature scaffold
npm run create-feature habit-tracker

# This creates:
# - src/features/habit-tracker/
#   - feature.config.ts
#   - schema/index.ts
#   - services/index.ts
#   - components/index.tsx
#   - api/route.ts
#   - __tests__/
#   - README.md (with implementation checklist)
```

---

## 🏗️ Architecture Highlights

### Event-Driven Communication

Features communicate through events, enabling zero-coupling parallel development:

```typescript
// Feature A emits event
await eventBus.emit('task.completed', {
  taskId: '123',
  xpReward: 50
});

// Feature B listens (no direct dependency)
eventBus.on('task.completed', async (payload) => {
  await gamificationService.awardXP(payload.xpReward);
});
```

### Feature Isolation

Each feature is self-contained with:
- Own database schema (`feature_<name>` tables)
- Own API routes
- Own UI components
- Own business logic
- Own tests

### Auto-Discovery

Features are automatically discovered and initialized in dependency order:

```typescript
// Just create the feature - no manual registration!
export const MyFeatureConfig: FeatureDefinition = {
  id: 'my-feature',
  dependencies: ['gamification'],
  initialize: async (context) => {
    // Setup
  }
};
```

---

## 🎨 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui + Tailwind CSS
- **Animations**: Anime.js
- **Database**: Drizzle ORM (SQLite dev, PostgreSQL prod)
- **AI**: Vercel AI SDK (Mock providers for dev)
- **Testing**: Vitest + Playwright
- **State**: Zustand

---

## ✅ Implemented Features

### 1. AI Agents (Complete)
- Dawn, Atlas, and Luna with unique personalities
- Conversation management
- Event-triggered suggestions
- Streaming responses

### 2. Authentication (Complete)
- Registration & login
- Password reset
- Rate limiting
- Account lockout protection

### 3. Animation System (Complete)
- 25+ reusable animations
- Gamification effects (XP, level-up, achievements)
- Accessibility (respects reduced-motion)
- Event-triggered animations

### 4. Task Management (Reference Implementation)
- CRUD operations
- Priority-based XP rewards
- Statistics dashboard
- Event emission on actions

### 5. E2E Testing Infrastructure (Complete)
- 31 comprehensive tests
- Cross-browser support
- Page object pattern
- CI/CD integration

---

## 📋 Planned Features

- **Gamification System** - XP calculation, achievements, leaderboards
- **Journal Feature** - Mood tracking, AI insights, rich text editor
- **User Profiles** - Settings, preferences, avatars
- **Habit Tracking** - Daily habits, streaks, reminders
- **Analytics Dashboard** - Productivity insights, trends

---

## 🧪 Testing

### Unit Tests

```bash
npm test

# Watch mode for TDD
npm test -- --watch
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- smoke.spec.ts
```

### Test Coverage

```bash
npm run test:coverage
```

---

## 📚 Documentation

### For Developers

- **[CLAUDE-activeContext.md](./CLAUDE-activeContext.md)** - Current status, blockers, next steps
- **[CLAUDE-patterns.md](./CLAUDE-patterns.md)** - Code patterns and conventions
- **[CLAUDE-decisions.md](./CLAUDE-decisions.md)** - Architecture decisions
- **[CLAUDE-troubleshooting.md](./CLAUDE-troubleshooting.md)** - Common issues & solutions
- **[CLAUDE-config-variables.md](./CLAUDE-config-variables.md)** - Configuration reference

### Architecture

- **[technical-architecture.md](./architecture/technical-architecture.md)** - System architecture
- **[parallel-development-architecture.md](./architecture/parallel-development-architecture.md)** - Event-driven design
- **[life-os-project-spec.md](./architecture/life-os-project-spec.md)** - Full project vision

### Reference

- **[IMPLEMENTATION_GUIDE.md](./reference/IMPLEMENTATION_GUIDE.md)** - Quick start guide
- **[agent-behavior-spec.md](./reference/agent-behavior-spec.md)** - AI agent specifications

### Current Status

- **[IMPLEMENTATION-SUMMARY.md](./current/IMPLEMENTATION-SUMMARY.md)** - Complete implementation status

---

## 🤝 Contributing

### Development Workflow

1. **Follow TDD** - Write tests first (Red-Green-Refactor)
2. **Use Event Bus** - No direct feature dependencies
3. **Feature Isolation** - Keep features self-contained
4. **Document Decisions** - Update CLAUDE-decisions.md
5. **Update Tests** - Maintain 100% coverage on behavior

### Code Style

- TypeScript strict mode (no `any`, no type assertions)
- Functional programming (immutable data, pure functions)
- Self-documenting code (clear naming, no comments)
- Accessibility first (ARIA, keyboard nav, reduced motion)

---

## 🔒 Security

- Environment variables properly scoped (`NEXT_PUBLIC_` for client)
- Input validation with Zod schemas
- Rate limiting on public endpoints
- CSRF protection with Server Actions
- Content Security Policy headers

---

## 📊 Performance

- Server Components by default
- Image optimization with next/image
- Code splitting with dynamic imports
- Database indexes on common queries
- Animation performance (GPU-accelerated transforms)

---

## 🚢 Deployment

### Production Checklist

1. Update environment variables
2. Switch to PostgreSQL database
3. Run migrations: `DATABASE_URL=<prod-url> npm run db:migrate`
4. Build: `npm run build`
5. Set up monitoring (errors, performance)
6. Configure CDN for static assets

### Recommended Platforms

- **Vercel** - Optimized for Next.js
- **Railway** - PostgreSQL + Next.js
- **Fly.io** - Global edge deployment
- **Self-hosted** - Docker + Nginx

---

## 📄 License

[Your License Here]

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Anime.js](https://animejs.com/)
- [Playwright](https://playwright.dev/)

---

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: Check CLAUDE-troubleshooting.md first
- **Questions**: Review architecture docs

---

**Status**: 🚀 Core architecture complete. Ready for parallel feature development.

**Last Updated**: 2025-11-15
