# Gamification Feature

## Overview

Complete XP system, levels, achievements, and daily streak tracking to gamify productivity and increase user engagement.

## Status

✅ **Implemented** - Fully functional with comprehensive test coverage

## Features

### XP System
- Award XP for completing tasks and journaling
- Automatic XP calculation based on task priority and word count
- Complete XP history tracking
- Manual XP awarding via API (admin/system use)

### Level Progression
- Exponential level progression (base: 100 XP, multiplier: 1.5x)
- Automatic level-up detection
- Level-based achievements
- Level 1-10+ support

### Streak Tracking
- Daily activity streak monitoring
- Automatic streak increment for consecutive days
- Streak bonus XP (7+ days)
- Streak break detection and reset
- Longest streak tracking

### Achievement System
- 7 predefined achievements (Bronze, Silver, Gold, Platinum tiers)
- Task completion achievements (1, 10, 50 tasks)
- Streak achievements (7, 30 days)
- Level achievements (5, 10)
- Automatic unlock detection
- Achievement XP rewards

## Architecture

### Database Schema

#### `feature_gamification_user_stats`
Tracks user XP, level, and streak data.

#### `feature_gamification_xp_history`
Complete history of all XP awards.

#### `feature_gamification_achievements`
Achievement definitions.

#### `feature_gamification_user_achievements`
User-achievement unlocks.

### Services

#### `GamificationService`
Core service providing:
- `awardXP()` - Award XP to users
- `getUserStats()` - Get user stats
- `getXPHistory()` - Get XP history
- `calculateLevel()` - Calculate level from XP
- `checkLevelUp()` - Check for level up
- `updateStreak()` - Update daily streak
- `checkStreak()` - Get current streak
- `checkAchievements()` - Check and unlock achievements
- `unlockAchievement()` - Manually unlock achievement
- `getUserAchievements()` - Get unlocked achievements
- `getAvailableAchievements()` - Get locked achievements
- `seedAchievements()` - Initialize achievement data
- `getLeaderboard()` - Get top users by XP
- `getUserRank()` - Get user's rank

## Events

### Emits

- `xp.awarded` - XP awarded to user
- `level.up` - User leveled up
- `achievement.unlocked` - Achievement unlocked
- `streak.updated` - Streak updated

### Listens To

- `task.completed` - Awards XP based on task priority
- `journal.created` - Awards XP based on word count (1 XP per 10 words, max 100)
- `user.login` - Updates daily streak

## API Endpoints

### `GET /api/gamification/stats?userId={userId}`
Get user gamification stats.

**Response:**
```json
{
  "stats": {
    "totalXP": 250,
    "currentLevel": 3,
    "xpToNextLevel": 150,
    "currentStreak": 5,
    "longestStreak": 10,
    "lastActivityDate": "2024-01-15"
  }
}
```

### `GET /api/gamification/xp-history?userId={userId}&limit={limit}`
Get XP history for user.

**Response:**
```json
{
  "history": [
    {
      "id": "xp-1",
      "userId": "user-123",
      "amount": 50,
      "source": "task",
      "sourceId": "task-1",
      "reason": "Completed task",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### `GET /api/gamification/achievements?userId={userId}`
Get user achievements (unlocked and available).

**Response:**
```json
{
  "unlocked": [
    {
      "id": "ach-1",
      "key": "first_task",
      "name": "Getting Started",
      "description": "Complete your first task",
      "icon": "🎯",
      "xpReward": 50,
      "tier": "bronze"
    }
  ],
  "available": [...]
}
```

### `GET /api/gamification/leaderboard?limit={limit}&userId={userId}`
Get leaderboard.

**Response:**
```json
{
  "leaderboard": [
    {
      "userId": "user-1",
      "totalXP": 5000,
      "currentLevel": 15,
      "rank": 1,
      "currentStreak": 30
    }
  ],
  "userRank": 5
}
```

### `POST /api/gamification/award-xp`
Manually award XP (admin/system use).

**Request:**
```json
{
  "userId": "user-123",
  "amount": 100,
  "source": "manual",
  "reason": "Special event"
}
```

**Response:**
```json
{
  "newTotal": 350,
  "leveledUp": true,
  "newLevel": 4
}
```

## XP Awards

### Task Completion
- Low priority: 10 XP
- Medium priority: 25 XP
- High priority: 50 XP

### Journal Entry
- 1 XP per 10 words
- Maximum: 100 XP per entry

### Streak Bonus
- 7+ days: streak * 2 XP on login

### Achievements
- Varies by achievement (50-500 XP)

## Level Progression Formula

```typescript
xpForLevel(n) = baseXP * (multiplier ^ (n - 2))
// Example: 100, 150, 225, 338, 506, 759, 1139, 1708...
```

## Achievements

### Bronze Tier
- **Getting Started** (🎯): Complete 1 task - 50 XP

### Silver Tier
- **Task Master** (⭐): Complete 10 tasks - 100 XP
- **Level 5 Hero** (👑): Reach level 5 - 150 XP

### Gold Tier
- **Productivity Pro** (💎): Complete 50 tasks - 300 XP
- **Week Warrior** (🔥): 7-day streak - 200 XP

### Platinum Tier
- **Month Champion** (⚡): 30-day streak - 500 XP
- **Level 10 Legend** (👑): Reach level 10 - 500 XP

## Testing

Run tests:
```bash
npm test src/features/gamification
```

Test coverage:
- XP award logic ✓
- Level calculation ✓
- Streak tracking ✓
- Achievement unlock ✓
- Event emission ✓

## Usage Example

```typescript
import { createGamificationService } from './services/gamification-service';
import { db } from '@/core/database';
import { eventBus } from '@/core/event-bus';

const gamificationService = createGamificationService(db, eventBus);

// Award XP
await gamificationService.awardXP('user-123', 50, 'task', 'task-1', 'Completed high priority task');

// Get user stats
const stats = await gamificationService.getUserStats('user-123');
console.log(`Level ${stats.currentLevel}, ${stats.totalXP} XP`);

// Update streak
const streakInfo = await gamificationService.updateStreak('user-123');
if (streakInfo.streakIncreased) {
  console.log(`Streak: ${streakInfo.currentStreak} days!`);
}

// Check achievements
const newAchievements = await gamificationService.checkAchievements('user-123');
console.log(`Unlocked ${newAchievements.length} achievements!`);
```

## Integration

The gamification feature automatically integrates with:

1. **Tasks Feature**: Listens to `task.completed` events
2. **Journal Feature**: Listens to `journal.created` events
3. **Auth Feature**: Listens to `user.login` events
4. **Agents Feature**: Agents can react to level-ups and achievements

## Configuration

No configuration required. The feature works out of the box with sensible defaults.

To customize XP awards, modify the event listeners in `feature.config.ts`.

## Dependencies

- None (fully independent, event-driven architecture)

## Files Structure

```
gamification/
├── __tests__/
│   ├── gamification-service.test.ts
│   ├── streak-service.test.ts
│   └── achievement-service.test.ts
├── api/
│   ├── stats/route.ts
│   ├── xp-history/route.ts
│   ├── achievements/route.ts
│   ├── leaderboard/route.ts
│   └── award-xp/route.ts
├── events/
│   └── index.ts
├── schema/
│   └── index.ts
├── services/
│   └── gamification-service.ts
├── types/
│   └── index.ts
├── feature.config.ts
└── README.md
```

## Future Enhancements

- [ ] UI components (Dashboard, ProgressBar, Achievements display)
- [ ] React hooks (useGamification, useXPAnimation)
- [ ] XP animations and celebrations
- [ ] Seasonal events and challenges
- [ ] Customizable achievement creation
- [ ] Badge system
- [ ] Social features (share achievements)
- [ ] Daily/weekly challenges

## Contributing

When adding new achievements:
1. Add to `ACHIEVEMENTS` array in `gamification-service.ts`
2. Define criteria in `AchievementCriteria` type
3. Implement criteria check in `checkAchievementCriteria()`
4. Run migrations to seed new achievements

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
**Status**: Production Ready ✓
