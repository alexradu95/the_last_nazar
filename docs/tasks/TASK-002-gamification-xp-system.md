# TASK-002: Implement Gamification XP System

**Sprint**: Next Sprint
**Priority**: 🟡 High
**Status**: 📋 Ready
**Estimate**: 12 hours
**Assignee**: TBD

---

## 📝 Description

Implement the core XP (Experience Points) and leveling system for Life OS. This system will listen to task completion events, award XP based on task priority, calculate user levels, and trigger level-up animations and events.

This is the foundation of the gamification system that makes productivity feel rewarding and engaging.

---

## 🎯 Acceptance Criteria

- [ ] XP awarded automatically when tasks are completed
- [ ] XP amount based on task priority (low: 10, medium: 25, high: 50)
- [ ] User level calculated from total XP (1000 XP per level)
- [ ] Level-up event emitted when threshold reached
- [ ] XP counter shows current XP and progress to next level
- [ ] Level-up animation triggers automatically
- [ ] XP history tracked in database
- [ ] API endpoints for XP operations
- [ ] Event bus integration working
- [ ] Tests cover all XP calculation logic

---

## 🔗 Dependencies

**Depends on:**
- Event bus system (✅ Implemented)
- Task completion events (✅ Implemented)
- Animation system (✅ Implemented)
- Database layer (✅ Implemented)

**Enables:**
- Achievement system (TASK-003)
- Leaderboards
- Streak bonuses
- User motivation/engagement

---

## 🛠️ Implementation Approach

### 1. Database Schema

```typescript
// features/gamification/schema/index.ts
export const userXP = pgTable('feature_user_xp', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  totalXP: integer('total_xp').default(0).notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  xpToNextLevel: integer('xp_to_next_level').default(1000).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: index('user_xp_user_idx').on(table.userId),
}));

export const xpHistory = pgTable('feature_xp_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(),
  source: text('source').notNull(), // 'task', 'achievement', 'bonus'
  sourceId: text('source_id'), // task ID, achievement ID, etc.
  reason: text('reason'), // Description of why XP was awarded
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('xp_history_user_idx').on(table.userId),
  createdAtIdx: index('xp_history_created_at_idx').on(table.createdAt),
}));
```

### 2. Service Layer

```typescript
// features/gamification/services/xp-service.ts
export class XPService {
  private readonly XP_PER_LEVEL = 1000;
  private readonly MAX_LEVEL = 100;

  async awardXP(userId: string, amount: number, source: string, sourceId?: string): Promise<XPAwardResult> {
    // Get current XP
    const userXP = await this.getUserXP(userId);

    // Calculate new XP
    const newTotalXP = userXP.totalXP + amount;
    const newLevel = this.calculateLevel(newTotalXP);
    const leveledUp = newLevel > userXP.currentLevel;

    // Update database
    await this.updateUserXP(userId, newTotalXP, newLevel);

    // Log XP history
    await this.logXPHistory(userId, amount, source, sourceId);

    // Emit events
    await eventBus.emit('xp.awarded', {
      userId,
      amount,
      newTotal: newTotalXP,
      source,
    });

    if (leveledUp) {
      await eventBus.emit('level.up', {
        userId,
        oldLevel: userXP.currentLevel,
        newLevel,
        totalXP: newTotalXP,
      });
    }

    return { newTotalXP, newLevel, leveledUp };
  }

  calculateLevel(totalXP: number): number {
    return Math.min(
      Math.floor(totalXP / this.XP_PER_LEVEL) + 1,
      this.MAX_LEVEL
    );
  }

  calculateXPForLevel(level: number): number {
    return (level - 1) * this.XP_PER_LEVEL;
  }

  calculateProgressToNextLevel(totalXP: number, currentLevel: number): number {
    const currentLevelXP = this.calculateXPForLevel(currentLevel);
    const nextLevelXP = this.calculateXPForLevel(currentLevel + 1);
    const xpIntoLevel = totalXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    return (xpIntoLevel / xpNeeded) * 100;
  }
}
```

### 3. Event Listeners

```typescript
// features/gamification/events/index.ts
export const setupGamificationEventListeners = (eventBus: EventBus) => {
  // Listen to task completion
  eventBus.on('task.completed', async (payload) => {
    const xpAmount = getXPForTaskPriority(payload.priority);

    await xpService.awardXP(
      payload.userId,
      xpAmount,
      'task',
      payload.taskId
    );
  });

  // Listen to level up for animations
  eventBus.on('level.up', async (payload) => {
    // Trigger level-up animation
    await animationService.levelUpCelebration(payload.newLevel);
  });
};

const getXPForTaskPriority = (priority: string): number => {
  const xpMap = {
    low: 10,
    medium: 25,
    high: 50,
  };
  return xpMap[priority] || 10;
};
```

### 4. UI Components

```tsx
// features/gamification/components/XPCounter.tsx
export function XPCounter({ userId }: { userId: string }) {
  const { xp, level, progress, loading } = useUserXP(userId);

  if (loading) return <Skeleton />;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className="text-lg px-3 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            Level {level}
          </Badge>
          <div className="text-2xl font-bold">
            <Zap className="w-6 h-6 inline text-yellow-500" />
            {xp.toLocaleString()} XP
          </div>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {Math.round(progress)}% to Level {level + 1}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Tasks Breakdown

1. **Database Schema** (2 hours)
   - Create `userXP` table
   - Create `xpHistory` table
   - Add indexes
   - Generate and run migration

2. **Service Layer** (3 hours)
   - Create `XPService` class
   - Implement `awardXP()` method
   - Implement level calculation
   - Implement progress calculation
   - Add database queries

3. **Event Integration** (2 hours)
   - Set up event listeners for `task.completed`
   - Emit `xp.awarded` event
   - Emit `level.up` event
   - Test event flow

4. **API Routes** (2 hours)
   - `GET /api/gamification/xp/:userId` - Get user XP
   - `GET /api/gamification/xp/:userId/history` - Get XP history
   - Add Zod validation

5. **UI Components** (2 hours)
   - Create `XPCounter` component
   - Create `useUserXP` hook
   - Add animations for XP gain
   - Add level-up animation

6. **Testing** (1 hour)
   - Unit tests for XP calculations
   - Unit tests for level calculations
   - Integration tests for event flow
   - Test XP history logging

---

## 🧪 Testing Requirements

### Unit Tests

```typescript
describe('XPService', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0-999 XP', () => {
      expect(xpService.calculateLevel(0)).toBe(1);
      expect(xpService.calculateLevel(999)).toBe(1);
    });

    it('should return level 2 for 1000-1999 XP', () => {
      expect(xpService.calculateLevel(1000)).toBe(2);
      expect(xpService.calculateLevel(1999)).toBe(2);
    });

    it('should cap at max level', () => {
      expect(xpService.calculateLevel(1000000)).toBe(100);
    });
  });

  describe('awardXP', () => {
    it('should award XP and emit event', async () => {
      const result = await xpService.awardXP('user-1', 50, 'task', 'task-123');

      expect(result.newTotalXP).toBe(50);
      expect(result.newLevel).toBe(1);
      expect(result.leveledUp).toBe(false);
    });

    it('should trigger level up when threshold reached', async () => {
      // Setup user with 980 XP
      await setupUser('user-2', 980);

      const result = await xpService.awardXP('user-2', 50, 'task', 'task-456');

      expect(result.newTotalXP).toBe(1030);
      expect(result.newLevel).toBe(2);
      expect(result.leveledUp).toBe(true);
    });
  });
});
```

### Integration Tests

```typescript
describe('Task completion XP flow', () => {
  it('should award XP when task is completed', async () => {
    // Complete a high-priority task
    await taskService.completeTask('task-789');

    // Wait for event processing
    await waitFor(() => {
      const xp = getUserXP('user-1');
      expect(xp.totalXP).toBeGreaterThanOrEqual(50);
    });
  });
});
```

---

## 📚 Related Documentation

- [CLAUDE-patterns.md](../CLAUDE-patterns.md#event-driven-architecture-patterns) - Event patterns
- [CLAUDE-decisions.md](../CLAUDE-decisions.md#decision-1-event-driven-architecture) - Event bus rationale
- [modular-implementation-plan.md](../future/modular-implementation-plan.md) - Gamification module spec

---

## 🔍 Implementation Notes

### XP Calculation Constants

```typescript
const XP_CONFIG = {
  PER_LEVEL: 1000,
  MAX_LEVEL: 100,
  TASK_REWARDS: {
    low: 10,
    medium: 25,
    high: 50,
  },
  BONUS_MULTIPLIERS: {
    streak: 1.5,      // Future: 50% bonus for daily streak
    perfectWeek: 2.0, // Future: Double XP for perfect week
  },
};
```

### Database Performance

- Index on `userId` for fast lookups
- Consider caching current XP in Redis for high-traffic scenarios
- XP history can be partitioned by date if it grows large

### Event Flow

```
Task Completed
  → eventBus.emit('task.completed', { userId, taskId, priority })
  → Gamification listens
  → Calculate XP based on priority
  → Update database
  → eventBus.emit('xp.awarded', { userId, amount, newTotal })
  → eventBus.emit('level.up', { userId, newLevel }) [if leveled up]
  → Animation service listens to 'level.up'
  → Trigger celebration animation
```

---

## ✅ Definition of Done

- [ ] Database schema created and migrated
- [ ] XP service implemented with all methods
- [ ] Event listeners registered
- [ ] API endpoints created and tested
- [ ] UI components render correctly
- [ ] XP awarded on task completion
- [ ] Level-up triggers correctly
- [ ] Animations work
- [ ] All unit tests pass (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Merged to main branch

---

## 📊 Success Metrics

- **XP Award Success Rate**: 100% (no failed awards)
- **Event Processing Time**: <100ms
- **Level Calculation Accuracy**: 100%
- **Animation Trigger Rate**: 100% on level-up
- **Test Coverage**: >90%

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
