# TASK-006: Wire Gamification Frontend to API

**Status**: Not Started
**Priority**: High
**Dependencies**: None (API routes already exist)
**Estimated Effort**: 2-3 hours

---

## Objective

Replace mock data in `/gamification` page with real API calls to make the gamification dashboard fully functional.

---

## Current State

- ✅ API routes implemented and authenticated
- ✅ Page component created with mock data
- ✅ UI components working with mock data
- ❌ No API integration
- ❌ No loading states
- ❌ No error handling

---

## Requirements

### 1. Replace Mock Data Functions

**File**: `src/app/(app)/gamification/page.tsx`

Current mock functions to replace:
```typescript
async function getUserStats() {
  // Placeholder - replace with actual API call
  return { ... };
}

async function getXPHistory() {
  // Placeholder - replace with actual API call
  return [ ... ];
}

async function getUserAchievements() {
  // Placeholder - replace with actual API call
  return [ ... ];
}
```

Replace with real fetch calls to:
- `GET /api/gamification/stats`
- `GET /api/gamification/xp-history?limit=10`
- `GET /api/gamification/achievements`

### 2. Add Loading States

Create loading UI components:
- Skeleton for XP counter
- Skeleton for XP history timeline
- Skeleton for achievement cards

### 3. Add Error Handling

Handle common errors:
- Network failures
- 401 Unauthorized (redirect to login)
- 500 Server errors (show error message)
- Empty state (no achievements unlocked yet)

### 4. Add Refresh Capability

Add manual refresh button to:
- Refresh stats after completing a task elsewhere
- Refresh achievements when new ones unlock
- Use Next.js `revalidatePath()` or client-side refresh

---

## Implementation Plan

### Step 1: Create API Client Helpers

**Create**: `src/lib/api/gamification-client.ts`

```typescript
export async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch('/api/gamification/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchXPHistory(limit = 10): Promise<XPHistoryItem[]> {
  const response = await fetch(`/api/gamification/xp-history?limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch XP history: ${response.statusText}`);
  }

  const data = await response.json();
  return data.history;
}

export async function fetchUserAchievements(): Promise<UserAchievement[]> {
  const response = await fetch('/api/gamification/achievements', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch achievements: ${response.statusText}`);
  }

  const data = await response.json();
  return data.achievements;
}
```

### Step 2: Update Page Component

**Update**: `src/app/(app)/gamification/page.tsx`

```typescript
import { Suspense } from 'react';
import { fetchUserStats, fetchXPHistory, fetchUserAchievements } from '@/lib/api/gamification-client';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default async function GamificationPage() {
  try {
    const [stats, xpHistory, achievements] = await Promise.all([
      fetchUserStats(),
      fetchXPHistory(10),
      fetchUserAchievements(),
    ]);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        {/* Render with real data */}
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }
}
```

### Step 3: Create Loading Components

**Create**: `src/components/ui/loading-skeleton.tsx`

```typescript
export function StatsLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

export function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function AchievementLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}
```

### Step 4: Create Error Display Component

**Create**: `src/components/ui/error-display.tsx`

```typescript
interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
        Error Loading Data
      </h2>
      <p className="text-red-700 dark:text-red-400 mb-4">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
```

### Step 5: Add Empty States

**Create**: `src/components/gamification/empty-state.tsx`

```typescript
export function NoAchievementsYet() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🏆</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Achievements Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Complete tasks and journal to unlock your first achievements!
      </p>
    </div>
  );
}

export function NoXPHistoryYet() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 dark:text-gray-400">
        No XP history yet. Start completing tasks to earn XP!
      </p>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Page loads successfully with real data
- [ ] Loading skeletons display while fetching data
- [ ] Error message displays when API fails
- [ ] Retry button reloads data successfully
- [ ] Empty states show when user has no data
- [ ] Stats update after completing a task
- [ ] Achievements display correctly
- [ ] XP history shows recent gains
- [ ] Page works with authentication
- [ ] Unauthorized users are redirected

---

## Success Criteria

1. ✅ All mock data replaced with real API calls
2. ✅ Smooth loading experience with skeletons
3. ✅ Graceful error handling with retry option
4. ✅ Empty states for new users
5. ✅ Data refreshes when actions occur elsewhere
6. ✅ No TypeScript errors
7. ✅ No console errors in browser

---

## Files to Create/Modify

**Create**:
- `src/lib/api/gamification-client.ts`
- `src/components/ui/loading-skeleton.tsx`
- `src/components/ui/error-display.tsx`
- `src/components/gamification/empty-state.tsx`

**Modify**:
- `src/app/(app)/gamification/page.tsx` - Replace mock functions with real API calls

---

## Notes

- Use React Server Components for initial data fetch (already async)
- Consider adding `revalidate` option for caching strategy
- May want to add optimistic UI updates later for instant feedback
- Consider WebSocket/SSE for real-time achievement notifications (future enhancement)
