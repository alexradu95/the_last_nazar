# TASK-007: Wire Journal Frontend to API

**Status**: Not Started
**Priority**: High
**Dependencies**: TASK-006 (for reference patterns)
**Estimated Effort**: 3-4 hours

---

## Objective

Replace mock data in `/journal` page with real API calls to enable full journal functionality including creating, reading, updating, and deleting entries.

---

## Current State

- ✅ Journal components built and working with mock data
- ✅ UI for writing, viewing entries, calendar, and insights
- ❌ No API routes for journal operations
- ❌ No real data persistence
- ❌ No loading/error states

---

## Requirements

### 1. Create Missing API Routes

Need to create these API endpoints:

**`src/app/api/journal/entries/route.ts`** - List/Create entries
- `GET /api/journal/entries` - List user's entries with pagination/filtering
- `POST /api/journal/entries` - Create new entry

**`src/app/api/journal/entries/[id]/route.ts`** - Single entry operations
- `GET /api/journal/entries/[id]` - Get single entry
- `PUT /api/journal/entries/[id]` - Update entry
- `DELETE /api/journal/entries/[id]` - Delete entry

**`src/app/api/journal/prompts/route.ts`** - Daily prompts
- `GET /api/journal/prompts` - Get all prompts or daily prompt

**`src/app/api/journal/insights/route.ts`** - Luna insights
- `GET /api/journal/insights` - Get user's insights

**`src/app/api/journal/stats/route.ts`** - Journal statistics
- `GET /api/journal/stats` - Get total entries, streak, avg mood

### 2. Update Page Component

Replace mock data in `/journal/page.tsx` with real API calls.

### 3. Implement Auto-Save

The `JournalEditor` component has auto-save logic - wire it to API.

### 4. Add Loading/Error States

Similar to gamification page, add:
- Loading skeletons
- Error displays
- Empty states for new users

---

## Implementation Plan

### Step 1: Create Journal API Routes

**Create**: `src/app/api/journal/entries/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const mood = url.searchParams.get('mood');

    const entries = await journalService.getEntries(user.id, {
      limit,
      offset,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      mood: mood ? parseInt(mood) : undefined,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

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

    const entry = await journalService.createEntry(user.id, {
      title,
      content,
      mood,
      tags,
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

**Create**: `src/app/api/journal/entries/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const entry = await journalService.getEntryById(params.id, user.id);

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to fetch entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const entry = await journalService.updateEntry(params.id, user.id, {
      title,
      content,
      mood,
      tags,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to update entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    await journalService.deleteEntry(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
```

**Create**: `src/app/api/journal/prompts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(request: NextRequest) {
  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const url = new URL(request.url);
    const daily = url.searchParams.get('daily') === 'true';

    if (daily) {
      const prompt = await journalService.getDailyPrompt();
      return NextResponse.json({ prompt });
    }

    const prompts = await journalService.getPrompts();
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
```

**Create**: `src/app/api/journal/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { createJournalService } from '@/features/journal/services/journal-service';
import { getEventBus } from '@/core/events/event-bus';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const eventBus = getEventBus();
  const journalService = createJournalService(db, eventBus);

  try {
    const stats = await journalService.getStats(user.id);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create API Client Helpers

**Create**: `src/lib/api/journal-client.ts`

```typescript
export async function fetchJournalEntries(params?: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  mood?: number;
}): Promise<JournalEntry[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.startDate) queryParams.set('startDate', params.startDate.toISOString());
  if (params?.endDate) queryParams.set('endDate', params.endDate.toISOString());
  if (params?.mood) queryParams.set('mood', params.mood.toString());

  const response = await fetch(`/api/journal/entries?${queryParams}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch entries: ${response.statusText}`);
  }

  const data = await response.json();
  return data.entries;
}

export async function createJournalEntry(data: {
  title?: string;
  content: string;
  mood?: number;
  tags?: string[];
}): Promise<JournalEntry> {
  const response = await fetch('/api/journal/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create entry: ${response.statusText}`);
  }

  const result = await response.json();
  return result.entry;
}

export async function updateJournalEntry(
  id: string,
  data: {
    title?: string;
    content?: string;
    mood?: number;
    tags?: string[];
  }
): Promise<JournalEntry> {
  const response = await fetch(`/api/journal/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update entry: ${response.statusText}`);
  }

  const result = await response.json();
  return result.entry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const response = await fetch(`/api/journal/entries/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete entry: ${response.statusText}`);
  }
}

export async function fetchDailyPrompt(): Promise<JournalPrompt> {
  const response = await fetch('/api/journal/prompts?daily=true');

  if (!response.ok) {
    throw new Error(`Failed to fetch daily prompt: ${response.statusText}`);
  }

  const data = await response.json();
  return data.prompt;
}

export async function fetchJournalStats(): Promise<JournalStats> {
  const response = await fetch('/api/journal/stats');

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  const data = await response.json();
  return data.stats;
}
```

### Step 3: Update Journal Page Component

**Update**: `src/app/(app)/journal/page.tsx`

Convert from client component to server component for initial load, then use client components for interactive parts:

```typescript
import { Suspense } from 'react';
import { fetchJournalEntries, fetchDailyPrompt, fetchJournalStats } from '@/lib/api/journal-client';
import { JournalClient } from './journal-client';

export default async function JournalPage() {
  try {
    const [entries, dailyPrompt, stats] = await Promise.all([
      fetchJournalEntries({ limit: 20 }),
      fetchDailyPrompt(),
      fetchJournalStats(),
    ]);

    return <JournalClient initialEntries={entries} dailyPrompt={dailyPrompt} stats={stats} />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}
```

**Create**: `src/app/(app)/journal/journal-client.tsx`

```typescript
'use client';

import { useState } from 'react';
import { JournalEditor, JournalList, JournalCalendar, LunaInsights, PersonalizedPrompt } from '@/features/journal/components';
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/lib/api/journal-client';
import type { MoodLevel } from '@/features/journal/components';

interface JournalClientProps {
  initialEntries: JournalEntry[];
  dailyPrompt: JournalPrompt;
  stats: JournalStats;
}

export function JournalClient({ initialEntries, dailyPrompt, stats }: JournalClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [activeTab, setActiveTab] = useState<'write' | 'entries' | 'calendar' | 'insights'>('write');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEntry = async (data: { title: string; content: string; mood?: MoodLevel }) => {
    setIsSaving(true);
    try {
      if (selectedEntry) {
        const updated = await updateJournalEntry(selectedEntry.id, data);
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const newEntry = await createJournalEntry(data);
        setEntries(prev => [newEntry, ...prev]);
      }
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteJournalEntry(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Personalized Prompt */}
        <PersonalizedPrompt
          prompt={dailyPrompt.prompt}
          reasoning={`Category: ${dailyPrompt.category}`}
          onUse={() => setActiveTab('write')}
          onDismiss={() => {}}
        />

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          {/* Tab content based on activeTab */}
          {activeTab === 'write' && (
            <JournalEditor
              initialTitle={selectedEntry?.title ?? ''}
              initialContent={selectedEntry?.content ?? ''}
              initialMood={selectedEntry?.mood}
              onSave={handleSaveEntry}
              autoSaveDelay={2000}
              isSaving={isSaving}
            />
          )}
          {/* Other tabs... */}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
            <div className="text-3xl font-bold">{stats.totalEntries}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
          </div>
          {/* More stats... */}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Update JournalEditor for Auto-Save

**Update**: `src/features/journal/components/JournalEditor.tsx`

Add `isSaving` prop to show save status:

```typescript
interface JournalEditorProps {
  // ... existing props
  isSaving?: boolean;
}

export function JournalEditor({ ..., isSaving = false }: JournalEditorProps) {
  return (
    <div>
      {/* Show save indicator */}
      {isSaving && (
        <div className="text-sm text-gray-500">Saving...</div>
      )}
      {/* Rest of component */}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Create new journal entry successfully
- [ ] Update existing entry
- [ ] Delete entry with confirmation
- [ ] View list of entries
- [ ] Calendar view shows entries
- [ ] Filter entries by date range
- [ ] Filter entries by mood
- [ ] Auto-save works (debounced)
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Empty state for no entries
- [ ] Stats update after creating/deleting entries

---

## Success Criteria

1. ✅ All journal operations work (CRUD)
2. ✅ Auto-save functionality working
3. ✅ Real-time stats updates
4. ✅ Proper loading/error states
5. ✅ Daily prompt loads from database
6. ✅ No TypeScript errors
7. ✅ All tabs functional with real data

---

## Files to Create/Modify

**Create**:
- `src/app/api/journal/entries/route.ts`
- `src/app/api/journal/entries/[id]/route.ts`
- `src/app/api/journal/prompts/route.ts`
- `src/app/api/journal/stats/route.ts`
- `src/lib/api/journal-client.ts`
- `src/app/(app)/journal/journal-client.tsx`

**Modify**:
- `src/app/(app)/journal/page.tsx` - Convert to server component
- `src/features/journal/components/JournalEditor.tsx` - Add isSaving prop

---

## Notes

- May need to add types for JournalEntry, JournalPrompt, JournalStats if not already defined
- Consider adding optimistic updates for better UX
- Auto-save should be debounced (already in component)
- Calendar component may need date selection handling
