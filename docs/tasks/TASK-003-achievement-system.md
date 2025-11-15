# TASK-003: Implement Achievement System

**Sprint**: Next Sprint
**Priority**: 🟢 Medium
**Status**: 📋 Ready
**Estimate**: 10 hours
**Assignee**: TBD

---

## 📝 Description

Implement an achievement/badge system that rewards users for reaching milestones and completing specific goals. Achievements add gamification depth and give users additional motivation to engage with the platform.

Examples: "First Task", "Task Master" (10 tasks), "Week Warrior" (7-day streak), "Early Bird" (task completed before 9am), "Night Owl" (task completed after 10pm).

---

## 🎯 Acceptance Criteria

- [ ] Achievement definitions stored in database
- [ ] Achievement unlock logic triggered by events
- [ ] Visual achievement unlock notification/animation
- [ ] Achievement list page showing all achievements
- [ ] Progress bars for progressive achievements
- [ ] Locked/unlocked states clearly visible
- [ ] Achievement icons/badges displayed
- [ ] Event emitted when achievement unlocked
- [ ] API endpoints for achievements
- [ ] Achievement rarity levels (common, rare, epic, legendary)
- [ ] Tests cover achievement unlock logic

---

## 🔗 Dependencies

**Depends on:**
- XP System (TASK-002) - For XP-based achievements
- Event bus system (✅ Implemented)
- Animation system (✅ Implemented)
- Task completion events (✅ Implemented)

**Enables:**
- User engagement metrics
- Social features (sharing achievements)
- Additional XP rewards

---

## 🛠️ Implementation Approach

### 1. Database Schema

```typescript
// features/gamification/schema/achievements.ts
export const achievementDefinitions = pgTable('feature_achievement_definitions', {
  id: text('id').primaryKey(), // e.g., 'first-task', 'task-master-10'
  name: text('name').notNull(), // "First Task"
  description: text('description').notNull(),
  icon: text('icon').notNull(), // Emoji or icon name
  rarity: text('rarity', {
    enum: ['common', 'rare', 'epic', 'legendary']
  }).default('common'),
  xpReward: integer('xp_reward').default(0),
  category: text('category').notNull(), // 'tasks', 'streaks', 'time', 'social'

  // Unlock conditions
  conditionType: text('condition_type').notNull(), // 'count', 'streak', 'time', 'custom'
  conditionTarget: integer('condition_target'), // e.g., 10 for "complete 10 tasks"
  conditionMetadata: jsonb('condition_metadata'), // Additional condition data

  isSecret: boolean('is_secret').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userAchievements = pgTable('feature_user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull().references(() => achievementDefinitions.id),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
  progress: integer('progress').default(0), // For progressive achievements
}, (table) => ({
  userAchievementIdx: index('user_achievements_user_idx').on(table.userId),
  uniqueUserAchievement: uniqueIndex('unique_user_achievement')
    .on(table.userId, table.achievementId),
}));

export const achievementProgress = pgTable('feature_achievement_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull(),
  currentProgress: integer('current_progress').default(0),
  targetProgress: integer('target_progress').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow(),
}, (table) => ({
  userProgressIdx: index('achievement_progress_user_idx').on(table.userId, table.achievementId),
}));
```

### 2. Achievement Definitions

```typescript
// features/gamification/config/achievement-definitions.ts
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-task',
    name: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    rarity: 'common',
    xpReward: 50,
    category: 'tasks',
    conditionType: 'count',
    conditionTarget: 1,
  },
  {
    id: 'task-master-10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⭐',
    rarity: 'rare',
    xpReward: 200,
    category: 'tasks',
    conditionType: 'count',
    conditionTarget: 10,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    rarity: 'epic',
    xpReward: 500,
    category: 'streaks',
    conditionType: 'streak',
    conditionTarget: 7,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: '🌅',
    rarity: 'rare',
    xpReward: 150,
    category: 'time',
    conditionType: 'custom',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    rarity: 'rare',
    xpReward: 150,
    category: 'time',
    conditionType: 'custom',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete all tasks in a week',
    icon: '💎',
    rarity: 'legendary',
    xpReward: 1000,
    category: 'tasks',
    conditionType: 'custom',
  },
];
```

### 3. Service Layer

```typescript
// features/gamification/services/achievement-service.ts
export class AchievementService {
  async checkAchievements(userId: string, event: string, payload: any): Promise<void> {
    // Get all potential achievements for this event
    const potentialAchievements = await this.getAchievementsForEvent(event);

    for (const achievement of potentialAchievements) {
      // Check if already unlocked
      const isUnlocked = await this.isAchievementUnlocked(userId, achievement.id);
      if (isUnlocked) continue;

      // Check if conditions met
      const conditionMet = await this.checkCondition(userId, achievement, payload);

      if (conditionMet) {
        await this.unlockAchievement(userId, achievement.id);
      }
    }
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    // Record achievement unlock
    await db.insert(userAchievements).values({
      userId,
      achievementId,
      unlockedAt: new Date(),
    });

    // Get achievement details
    const achievement = await this.getAchievementDefinition(achievementId);

    // Award XP
    if (achievement.xpReward > 0) {
      await xpService.awardXP(
        userId,
        achievement.xpReward,
        'achievement',
        achievementId
      );
    }

    // Emit event
    await eventBus.emit('achievement.unlocked', {
      userId,
      achievementId,
      achievement,
      timestamp: Date.now(),
    });
  }

  async checkCondition(
    userId: string,
    achievement: AchievementDefinition,
    payload: any
  ): Promise<boolean> {
    switch (achievement.conditionType) {
      case 'count':
        return await this.checkCountCondition(userId, achievement);

      case 'streak':
        return await this.checkStreakCondition(userId, achievement);

      case 'time':
        return this.checkTimeCondition(payload, achievement);

      case 'custom':
        return await this.checkCustomCondition(userId, achievement, payload);

      default:
        return false;
    }
  }

  async updateProgress(userId: string, achievementId: string, increment: number = 1): Promise<void> {
    // Update or create progress record
    const progress = await this.getProgress(userId, achievementId);
    const newProgress = (progress?.currentProgress || 0) + increment;

    await db.insert(achievementProgress)
      .values({
        userId,
        achievementId,
        currentProgress: newProgress,
        targetProgress: achievement.conditionTarget,
      })
      .onConflictDoUpdate({
        target: [achievementProgress.userId, achievementProgress.achievementId],
        set: { currentProgress: newProgress, lastUpdated: new Date() },
      });
  }
}
```

### 4. Event Listeners

```typescript
// features/gamification/events/achievement-listeners.ts
export const setupAchievementEventListeners = (eventBus: EventBus) => {
  // Task completion achievements
  eventBus.on('task.completed', async (payload) => {
    await achievementService.checkAchievements(payload.userId, 'task.completed', payload);
  });

  // Level up achievements
  eventBus.on('level.up', async (payload) => {
    await achievementService.checkAchievements(payload.userId, 'level.up', payload);
  });

  // Streak achievements
  eventBus.on('streak.updated', async (payload) => {
    await achievementService.checkAchievements(payload.userId, 'streak.updated', payload);
  });

  // Achievement unlock animations
  eventBus.on('achievement.unlocked', async (payload) => {
    await animationService.achievementUnlocked(payload.achievement);
  });
};
```

### 5. UI Components

```tsx
// features/gamification/components/AchievementCard.tsx
export function AchievementCard({ achievement, userAchievement }: Props) {
  const isUnlocked = !!userAchievement;
  const progress = userAchievement?.progress || 0;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      isUnlocked ? "border-yellow-400" : "opacity-60"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "text-4xl",
            !isUnlocked && "grayscale"
          )}>
            {achievement.icon}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{achievement.name}</h3>
              <Badge variant={getRarityVariant(achievement.rarity)}>
                {achievement.rarity}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {achievement.description}
            </p>

            {!isUnlocked && achievement.conditionType === 'count' && (
              <div className="mt-3">
                <Progress value={(progress / achievement.conditionTarget) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress} / {achievement.conditionTarget}
                </p>
              </div>
            )}

            {isUnlocked && (
              <div className="flex items-center gap-2 mt-3">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  +{achievement.xpReward} XP
                </span>
                <span className="text-xs text-muted-foreground">
                  Unlocked {formatDate(userAchievement.unlockedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Tasks Breakdown

1. **Database Schema** (2 hours)
   - Create achievement tables
   - Seed initial achievement definitions
   - Generate and run migration

2. **Service Layer** (3 hours)
   - Create `AchievementService` class
   - Implement condition checking logic
   - Implement unlock logic
   - Implement progress tracking

3. **Event Integration** (2 hours)
   - Set up event listeners
   - Connect to task, level, streak events
   - Emit achievement unlock events

4. **API Routes** (1 hour)
   - `GET /api/gamification/achievements` - List all achievements
   - `GET /api/gamification/achievements/user/:userId` - User's achievements
   - `GET /api/gamification/achievements/:id/progress/:userId` - Progress

5. **UI Components** (2 hours)
   - Create `AchievementCard` component
   - Create `AchievementsList` page
   - Create unlock notification/modal
   - Add unlock animation

6. **Testing** (1 hour)
   - Unit tests for condition checking
   - Integration tests for unlock flow
   - Test progress tracking

---

## 🧪 Testing Requirements

### Unit Tests

```typescript
describe('AchievementService', () => {
  describe('checkCountCondition', () => {
    it('should unlock achievement when count reached', async () => {
      await completeNTasks('user-1', 10);

      const unlocked = await achievementService.isAchievementUnlocked(
        'user-1',
        'task-master-10'
      );

      expect(unlocked).toBe(true);
    });
  });

  describe('checkTimeCondition', () => {
    it('should unlock early bird for task before 9am', async () => {
      const morningTask = { completedAt: new Date('2024-01-01T08:30:00') };

      const conditionMet = await achievementService.checkTimeCondition(
        morningTask,
        EARLY_BIRD_ACHIEVEMENT
      );

      expect(conditionMet).toBe(true);
    });
  });
});
```

---

## 📚 Related Documentation

- [CLAUDE-patterns.md](../CLAUDE-patterns.md) - Event patterns
- [TASK-002](./TASK-002-gamification-xp-system.md) - XP System dependency

---

## ✅ Definition of Done

- [ ] Database schema created and seeded
- [ ] Achievement service implemented
- [ ] Event listeners working
- [ ] API endpoints created
- [ ] UI components completed
- [ ] Achievement unlock notification works
- [ ] Progress tracking accurate
- [ ] All tests pass (>85% coverage)
- [ ] Code reviewed and approved
- [ ] Merged to main branch

---

## 📊 Success Metrics

- **Achievement Unlock Success Rate**: 100%
- **False Positive Rate**: 0% (no undeserved unlocks)
- **Progress Tracking Accuracy**: 100%
- **Notification Display Rate**: 100%
- **Test Coverage**: >85%

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
