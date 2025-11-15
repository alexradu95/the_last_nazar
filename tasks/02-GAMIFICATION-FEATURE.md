# Task 02: Gamification System Feature

**Priority**: P1 - Core Feature
**Dependencies**: None (listens to existing task events)
**Can Start**: Immediately
**Estimated Timeline**: 3-4 days
**Parallelizable**: Yes - Fully independent

---

## Overview

Implement the Gamification System to reward users for completing tasks and journaling. This feature listens to events from other features and awards XP, levels, achievements, and tracks streaks.

## Objectives

- XP (Experience Points) system
- Level progression with configurable thresholds
- Achievement system
- Daily streak tracking
- Leaderboards (optional)
- Real-time XP animations and celebrations
- Event-driven reward system

## Dependencies

### Depends On
- None (listens to events that already exist)

### Listens To
- `task.completed` (already emitted by tasks feature)
- `journal.created` (will be emitted by journal feature)
- `user.login` (will be emitted by auth feature)

### Provides To
- All features (motivation and engagement)

## Event Integration

### Emits
- `xp.awarded` - When XP is given to user
- `level.up` - When user reaches new level
- `achievement.unlocked` - When achievement is earned
- `streak.updated` - When daily streak changes
- `streak.lost` - When streak is broken

### Listens To
- `task.completed` - Award XP based on task priority
- `journal.created` - Award XP for journaling
- `user.login` - Check and update daily streak

## Database Schema

### Tables to Create

#### `feature_gamification_user_stats`
```typescript
export const userStats = sqliteTable('feature_gamification_user_stats', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  totalXP: integer('total_xp').default(0),
  currentLevel: integer('current_level').default(1),
  xpToNextLevel: integer('xp_to_next_level').default(100),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: text('last_activity_date'), // YYYY-MM-DD
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: uniqueIndex('gamification_user_idx').on(table.userId),
  levelIdx: index('gamification_level_idx').on(table.currentLevel),
}));
```

#### `feature_gamification_xp_history`
```typescript
export const xpHistory = sqliteTable('feature_gamification_xp_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(),
  source: text('source').notNull(), // 'task', 'journal', 'achievement'
  sourceId: text('source_id'), // ID of task/journal that triggered XP
  reason: text('reason'), // Human-readable description
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('xp_history_user_idx').on(table.userId),
  timestampIdx: index('xp_history_timestamp_idx').on(table.timestamp),
}));
```

#### `feature_gamification_achievements`
```typescript
export const achievements = sqliteTable('feature_gamification_achievements', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(), // 'first_task', 'streak_7', etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'), // Emoji or icon name
  xpReward: integer('xp_reward').default(0),
  tier: text('tier', { enum: ['bronze', 'silver', 'gold', 'platinum'] }).default('bronze'),
  criteria: text('criteria').notNull(), // JSON string of unlock criteria
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

#### `feature_gamification_user_achievements`
```typescript
export const userAchievements = sqliteTable('feature_gamification_user_achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull().references(() => achievements.id),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userAchievementIdx: uniqueIndex('user_achievement_idx').on(table.userId, table.achievementId),
}));
```

## Service Layer

### GamificationService Methods

```typescript
class GamificationService {
  // XP Management
  async awardXP(userId: string, amount: number, source: string, reason?: string): Promise<void>
  async getUserStats(userId: string): Promise<UserStats>
  async getXPHistory(userId: string, limit?: number): Promise<XPHistoryEntry[]>

  // Level System
  async calculateLevel(totalXP: number): Promise<{ level: number; xpToNext: number }>
  async checkLevelUp(userId: string): Promise<boolean>

  // Streak System
  async updateStreak(userId: string): Promise<StreakInfo>
  async checkStreak(userId: string): Promise<StreakInfo>
  async getStreakHistory(userId: string): Promise<StreakHistory>

  // Achievement System
  async checkAchievements(userId: string): Promise<Achievement[]>
  async unlockAchievement(userId: string, achievementKey: string): Promise<Achievement>
  async getUserAchievements(userId: string): Promise<Achievement[]>
  async getAvailableAchievements(userId: string): Promise<Achievement[]>

  // Leaderboard
  async getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>
  async getUserRank(userId: string): Promise<number>
}
```

### Level Calculation Logic
```typescript
// Example: Exponential growth
function calculateLevelFromXP(totalXP: number): { level: number; xpToNext: number } {
  const baseXP = 100;
  const multiplier = 1.5;

  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = baseXP;

  while (totalXP >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  return {
    level,
    xpToNext: xpForNextLevel - totalXP,
  };
}
```

### Predefined Achievements
```typescript
const ACHIEVEMENTS = [
  {
    key: 'first_task',
    name: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    xpReward: 50,
    tier: 'bronze',
    criteria: { taskCount: 1 },
  },
  {
    key: 'task_10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⭐',
    xpReward: 100,
    tier: 'silver',
    criteria: { taskCount: 10 },
  },
  {
    key: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 200,
    tier: 'gold',
    criteria: { streakDays: 7 },
  },
  {
    key: 'level_10',
    name: 'Level 10 Legend',
    description: 'Reach level 10',
    icon: '👑',
    xpReward: 500,
    tier: 'platinum',
    criteria: { level: 10 },
  },
  // Add more achievements...
];
```

## API Routes

### Endpoints to Implement

#### `GET /api/gamification/stats`
Get user gamification stats
```typescript
Request Query: { userId: string }
Response: {
  stats: {
    totalXP: number;
    currentLevel: number;
    xpToNextLevel: number;
    currentStreak: number;
    longestStreak: number;
  };
}
```

#### `GET /api/gamification/xp-history`
Get XP history for user
```typescript
Request Query: { userId: string; limit?: number }
Response: {
  history: XPHistoryEntry[];
}
```

#### `GET /api/gamification/achievements`
Get user achievements
```typescript
Request Query: { userId: string }
Response: {
  unlocked: Achievement[];
  available: Achievement[];
  progress: Record<string, number>; // Progress towards locked achievements
}
```

#### `GET /api/gamification/leaderboard`
Get leaderboard
```typescript
Request Query: { limit?: number }
Response: {
  leaderboard: LeaderboardEntry[];
  userRank?: number; // If userId provided
}
```

#### `POST /api/gamification/award-xp`
Manually award XP (admin/system only)
```typescript
Request: {
  userId: string;
  amount: number;
  source: string;
  reason?: string;
}
Response: {
  newTotal: number;
  leveledUp: boolean;
  newLevel?: number;
}
```

## UI Components

### Components to Build

#### `GamificationDashboard.tsx`
Main gamification overview:
- Current level with progress bar
- XP stats (total, to next level)
- Current streak with fire icon
- Recent achievements
- XP history graph

#### `LevelProgressBar.tsx`
Animated progress bar:
- Shows current level
- XP progress to next level
- Level up animations
- Percentage display

#### `StreakDisplay.tsx`
Streak visualization:
- Current streak count
- Fire emoji animation
- Streak calendar
- Longest streak badge

#### `AchievementList.tsx`
Achievement display:
- Grid of achievements
- Locked/unlocked states
- Progress bars for locked achievements
- Achievement details modal

#### `AchievementToast.tsx`
Toast notification for new achievements:
- Animated entrance
- Achievement icon and name
- XP reward display
- Celebration animation

#### `XPAnimation.tsx`
Floating XP gain animation:
- Shows "+50 XP" floating up
- Fade out animation
- Particle effects
- Sound effect (optional)

#### `Leaderboard.tsx`
Leaderboard display:
- Top users by XP
- User's rank
- Level badges
- Filter options (weekly, monthly, all-time)

## React Hooks

### `useGamification.ts`
```typescript
export function useGamification(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {...}
  const checkStreak = async () => {...}

  return { stats, achievements, loading, refresh, checkStreak };
}
```

### `useXPAnimation.ts`
```typescript
export function useXPAnimation() {
  const [animations, setAnimations] = useState<XPAnimation[]>([]);

  const showXPGain = (amount: number, position?: { x: number; y: number }) => {...}

  return { animations, showXPGain };
}
```

## Feature Configuration

### `feature.config.ts`
```typescript
export const GamificationFeature: FeatureDefinition = {
  id: 'gamification',
  name: 'Gamification System',
  version: '1.0.0',
  dependencies: [],

  provides: {
    routes: [
      { path: '/stats', component: () => import('./components/GamificationDashboard') },
      { path: '/achievements', component: () => import('./components/AchievementList') },
      { path: '/api/gamification/stats', handler: () => import('./api/stats/route') },
      { path: '/api/gamification/achievements', handler: () => import('./api/achievements/route') },
    ],

    events: {
      emits: ['xp.awarded', 'level.up', 'achievement.unlocked', 'streak.updated'],
      listens: ['task.completed', 'journal.created', 'user.login'],
    },

    services: {
      'gamification-service': () => import('./services/gamification-service'),
    },

    tables: [
      'feature_gamification_user_stats',
      'feature_gamification_xp_history',
      'feature_gamification_achievements',
      'feature_gamification_user_achievements',
    ],
  },

  async initialize({ eventBus, db }) {
    console.log('[Gamification] Initializing...');

    const { createGamificationService } = await import('./services/gamification-service');
    const gamificationService = createGamificationService(db, eventBus);

    // Seed achievements
    await gamificationService.seedAchievements();

    // Listen to task completion
    eventBus.on('task.completed', async (payload) => {
      console.log(`[Gamification] Task completed, awarding XP: ${payload.xpReward}`);

      await gamificationService.awardXP(
        payload.userId,
        payload.xpReward,
        'task',
        `Completed task: ${payload.taskId}`
      );

      // Check for achievements
      await gamificationService.checkAchievements(payload.userId);
    });

    // Listen to journal creation
    eventBus.on('journal.created', async (payload) => {
      console.log('[Gamification] Journal entry created, awarding XP');

      // Award XP based on word count
      const xpAmount = Math.min(Math.floor(payload.wordCount / 10), 100);
      await gamificationService.awardXP(
        payload.userId,
        xpAmount,
        'journal',
        'Wrote journal entry'
      );
    });

    // Listen to user login for streak tracking
    eventBus.on('user.login', async (payload) => {
      console.log('[Gamification] User logged in, checking streak');
      const streakInfo = await gamificationService.updateStreak(payload.userId);

      if (streakInfo.streakIncreased) {
        console.log(`[Gamification] Streak increased to ${streakInfo.currentStreak}`);
      }
    });

    console.log('[Gamification] Initialized');
  },
};
```

## Testing Requirements

### Unit Tests
- [ ] XP award calculation
- [ ] Level calculation algorithm
- [ ] Streak logic (same day, next day, broken)
- [ ] Achievement unlock conditions
- [ ] Event emission verification

### Integration Tests
- [ ] Task completion → XP award flow
- [ ] Level up → achievement unlock
- [ ] Streak update on login
- [ ] Leaderboard ranking

### Test Coverage Target
- Minimum 85% coverage (critical game logic)

## Implementation Checklist

### Phase 1: Setup (Day 1 Morning)
- [ ] Run `npm run create-feature gamification`
- [ ] Define database schema
- [ ] Create migrations
- [ ] Seed achievement data

### Phase 2: Core Service (Day 1 Afternoon - Day 2)
- [ ] Implement XP system
- [ ] Implement level calculation
- [ ] Implement streak tracking
- [ ] Implement achievement system
- [ ] Write unit tests

### Phase 3: Event Integration (Day 2)
- [ ] Listen to task.completed event
- [ ] Listen to journal.created event
- [ ] Listen to user.login event
- [ ] Emit gamification events
- [ ] Test event flows

### Phase 4: API Layer (Day 2 - Day 3)
- [ ] Implement stats endpoint
- [ ] Implement XP history endpoint
- [ ] Implement achievements endpoint
- [ ] Implement leaderboard endpoint
- [ ] Add validation and error handling

### Phase 5: UI Components (Day 3 - Day 4)
- [ ] Create GamificationDashboard
- [ ] Create LevelProgressBar with animations
- [ ] Create StreakDisplay
- [ ] Create AchievementList
- [ ] Create XPAnimation component
- [ ] Create Leaderboard
- [ ] Implement hooks

### Phase 6: Testing & Polish (Day 4)
- [ ] Integration testing
- [ ] Animation polish
- [ ] Update events.config.ts
- [ ] Enable in features.config.ts
- [ ] Run validation

## Event Flow Examples

### Task Completion Flow
```
User completes task
  → tasks emits 'task.completed' { xpReward: 50 }
  → gamification listens
  → gamification awards XP
  → gamification emits 'xp.awarded' { amount: 50 }
  → gamification checks level
  → if level up: emits 'level.up' { newLevel: 5 }
  → gamification checks achievements
  → if unlocked: emits 'achievement.unlocked'
  → agents listens to level.up, sends congratulations
```

### Streak Update Flow
```
User logs in
  → auth emits 'user.login'
  → gamification listens
  → gamification checks last activity date
  → if next day: increment streak
  → if same day: no change
  → if gap: reset streak to 1
  → emits 'streak.updated'
  → check for streak achievements
```

## Gamification Formulas

### XP Awards
```typescript
// Task completion
const taskXP = {
  low: 10,
  medium: 25,
  high: 50,
};

// Journal entry
const journalXP = Math.min(Math.floor(wordCount / 10), 100);

// Streak bonus (multiplier)
const streakBonus = 1 + (currentStreak * 0.05); // 5% per day, max 2x
```

### Level Progression
```typescript
// XP required for level N
xpForLevel(n) = baseXP * (multiplier ^ (n - 1))
// Example: 100, 150, 225, 338, 506...
```

## Success Criteria

- [ ] XP system awards correctly
- [ ] Level calculation accurate
- [ ] Streaks track properly
- [ ] Achievements unlock correctly
- [ ] Events emit properly
- [ ] Leaderboard ranks correctly
- [ ] UI animations smooth
- [ ] Tests passing (>85% coverage)
- [ ] Integration with tasks verified

## Reference Files

Study:
- `src/features/tasks/feature.config.ts` - Event listening pattern
- Event emission patterns from tasks

## Notes

- Keep formulas configurable in `config/features.config.ts`
- Consider daily XP cap to prevent abuse
- Cache leaderboard (expensive query)
- Add sound effects for XP gains (optional)
- Consider seasonal events/challenges
- Plan for achievement expansion
- Consider XP decay for inactive users (optional)

## Deliverables

1. Fully functional gamification system
2. Achievement system with initial set
3. Real-time XP animations
4. Leaderboard with ranking
5. Comprehensive tests
6. Event catalog updates

---

**Ready to start? Run**: `npm run create-feature gamification`
