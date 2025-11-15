# TASK-008: Connect Gamification to Existing Features

**Status**: Not Started
**Priority**: High
**Dependencies**: TASK-006, TASK-007
**Estimated Effort**: 2-3 hours

---

## Objective

Wire up the gamification event system to award XP when users complete tasks and create journal entries. Ensure the event-driven architecture is fully operational.

---

## Current State

- ✅ Event bus system implemented
- ✅ Gamification event listeners created
- ✅ XP award logic implemented
- ❌ Events not being emitted from task completion
- ❌ Events not being emitted from journal creation
- ❌ Login streak tracking not connected

---

## Requirements

### 1. Emit Events from Task Completion

When a task is marked as complete, emit `task.completed` event to trigger XP award.

### 2. Emit Events from Journal Creation

When a journal entry is created, emit `journal.created` event to trigger XP award.

### 3. Implement Login Streak Tracking

Track user login events and award streak milestone bonuses.

### 4. Test Event Flow End-to-End

Verify XP is awarded correctly for:
- Low priority task: 10 XP
- Medium priority task: 25 XP
- High priority task: 50 XP
- Journal entry: 15 XP base + bonuses
- Streak milestones: 5 XP per 7 days

---

## Implementation Plan

### Step 1: Find Task Completion Logic

**Search for**: Task completion API route or service
- Likely in `src/features/tasks/` or `src/app/api/tasks/`
- Need to find where task status is updated to "completed"

### Step 2: Emit Task Completion Events

**Update**: Task completion handler (location TBD)

```typescript
import { getEventBus } from '@/core/events/event-bus';

// In task completion function:
async function completeTask(taskId: string, userId: string, priority: 'low' | 'medium' | 'high') {
  // Update task status in database
  await db.update(tasks).set({ completed: true }).where(eq(tasks.id, taskId));

  // Emit event for gamification
  const eventBus = getEventBus();
  await eventBus.emit('task.completed', {
    timestamp: Date.now(),
    userId,
    taskId,
    priority,
    title: task.title,
  });

  return updatedTask;
}
```

### Step 3: Emit Journal Creation Events

**Update**: `src/app/api/journal/entries/route.ts` (POST handler)

```typescript
import { getEventBus } from '@/core/events/event-bus';

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const body = await request.json();
    const { title, content, mood, tags } = body;

    // Create entry
    const entry = await journalService.createEntry(user.id, {
      title,
      content,
      mood,
      tags,
    });

    // Emit event for gamification (this might already be in the service)
    // Verify the journalService.createEntry already emits the event
    // If not, emit it here:
    await eventBus.emit('journal.created', {
      timestamp: Date.now(),
      userId: user.id,
      entryId: entry.id,
      wordCount: entry.wordCount,
      hasMood: !!mood,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Failed to create entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
```

**Note**: Check if `journalService.createEntry()` already emits the event. If yes, no additional emission needed.

### Step 4: Implement Login Streak Tracking

**Create**: `src/app/api/auth/login-track/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { getEventBus } from '@/core/events/event-bus';

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eventBus = getEventBus();

  try {
    // Emit user login event
    await eventBus.emit('user.login', {
      timestamp: Date.now(),
      userId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track login:', error);
    return NextResponse.json(
      { error: 'Failed to track login' },
      { status: 500 }
    );
  }
}
```

**Update**: Login page or authentication middleware to call this endpoint

```typescript
// After successful login:
fetch('/api/auth/login-track', {
  method: 'POST',
});
```

### Step 5: Verify Event Listeners

**Check**: `src/features/gamification/listeners/gamification-event-listener.ts`

Ensure all event handlers are properly registered:

```typescript
import { EventBus } from '@/core/events/event-bus';
import { GamificationService } from '../services/gamification-service';

export function registerGamificationListeners(
  eventBus: EventBus,
  gamificationService: GamificationService
) {
  // Task completion
  eventBus.on('task.completed', async (payload) => {
    const xpAmount = {
      low: 10,
      medium: 25,
      high: 50,
    }[payload.priority] || 10;

    await gamificationService.awardXP(
      payload.userId,
      xpAmount,
      'task',
      payload.taskId,
      `Completed task: ${payload.title}`
    );
  }, { featureId: 'gamification', priority: 10 });

  // Journal creation
  eventBus.on('journal.created', async (payload) => {
    let xpAmount = 15; // Base XP

    if (payload.hasMood) {
      xpAmount += 5; // Bonus for tracking mood
    }

    if (payload.wordCount >= 500) {
      xpAmount += 10; // Bonus for longer entries
    }

    await gamificationService.awardXP(
      payload.userId,
      xpAmount,
      'journal',
      payload.entryId,
      'Created journal entry'
    );
  }, { featureId: 'gamification', priority: 10 });

  // User login
  eventBus.on('user.login', async (payload) => {
    await gamificationService.trackStreak(payload.userId);
  }, { featureId: 'gamification', priority: 10 });
}
```

### Step 6: Initialize Event Listeners on Startup

**Check**: `src/core/events/event-bus.ts` or app initialization

Ensure listeners are registered when the app starts:

```typescript
// In a global initialization file (e.g., middleware or app startup)
import { getEventBus } from '@/core/events/event-bus';
import { getDatabase } from '@/core/database';
import { createGamificationService } from '@/features/gamification/services/gamification-service';
import { registerGamificationListeners } from '@/features/gamification/listeners/gamification-event-listener';

// Initialize once on app startup
const eventBus = getEventBus();
const db = getDatabase();
const gamificationService = createGamificationService(db, eventBus);

registerGamificationListeners(eventBus, gamificationService);
```

### Step 7: Add Debug Logging

Add console logs to verify events are flowing:

```typescript
eventBus.on('task.completed', async (payload) => {
  console.log('[Gamification] Task completed event received:', payload);
  // ... award XP
});

eventBus.on('journal.created', async (payload) => {
  console.log('[Gamification] Journal created event received:', payload);
  // ... award XP
});
```

---

## Testing Checklist

### Manual Testing:

- [ ] Complete a low priority task → Verify 10 XP awarded
- [ ] Complete a medium priority task → Verify 25 XP awarded
- [ ] Complete a high priority task → Verify 50 XP awarded
- [ ] Create journal entry without mood → Verify 15 XP awarded
- [ ] Create journal entry with mood → Verify 20 XP awarded
- [ ] Create journal entry with 500+ words → Verify 25-30 XP awarded
- [ ] Login daily for 7 days → Verify streak bonus awarded
- [ ] Check XP history shows all awards with correct reasons
- [ ] Verify achievement unlocking works (e.g., "Getting Started" after first task)

### Developer Testing:

- [ ] Event bus logs show events being emitted
- [ ] Event listeners log when they receive events
- [ ] Database shows XP history records created
- [ ] Database shows user stats updated correctly
- [ ] No errors in console
- [ ] No unhandled promise rejections

---

## Success Criteria

1. ✅ Task completion awards correct XP amount
2. ✅ Journal creation awards correct XP amount (with bonuses)
3. ✅ Login streak tracking works
4. ✅ XP history shows all awards
5. ✅ Achievements unlock automatically
6. ✅ No event system errors
7. ✅ Events flow correctly through the system

---

## Files to Create/Modify

**Create**:
- `src/app/api/auth/login-track/route.ts` - Login tracking endpoint

**Modify**:
- Task completion handler (location TBD) - Emit task.completed event
- `src/app/api/journal/entries/route.ts` - Verify journal.created event emission
- Login page/middleware - Call login-track endpoint
- App initialization - Register event listeners globally

**Verify**:
- `src/features/gamification/listeners/gamification-event-listener.ts` - Event handlers correct
- `src/core/events/event-bus.ts` - Event bus working properly

---

## Notes

- Events should be fire-and-forget (don't block API responses)
- Consider adding retry logic for failed event handlers
- Log all events for debugging during development
- May want to add event sourcing/audit log later
- Consider using a queue system (Redis, Bull) for production reliability
