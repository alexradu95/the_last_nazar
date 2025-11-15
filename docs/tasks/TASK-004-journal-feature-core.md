# TASK-004: Implement Journal Feature Core

**Sprint**: Next Sprint
**Priority**: 🟡 High
**Status**: 📋 Ready
**Estimate**: 14 hours
**Assignee**: TBD

---

## 📝 Description

Implement the core journaling feature that allows users to create daily journal entries, track their mood, and reflect on their day. This feature will serve as the foundation for AI-powered insights (Luna agent integration in TASK-005).

The journal is a key pillar of Life OS, promoting self-reflection and mental well-being alongside productivity.

---

## 🎯 Acceptance Criteria

- [ ] Users can create new journal entries
- [ ] Rich text editor for journal content
- [ ] Mood tracking with 5 mood levels (😢 😟 😐 🙂 😄)
- [ ] Daily prompts to inspire writing
- [ ] View/edit/delete journal entries
- [ ] Calendar view showing days with entries
- [ ] Entry list with search and filtering
- [ ] Markdown support for formatting
- [ ] Auto-save functionality
- [ ] Privacy indicators (entries are private)
- [ ] Event emission on entry creation
- [ ] API endpoints for CRUD operations
- [ ] Tests cover all journal operations

---

## 🔗 Dependencies

**Depends on:**
- Event bus system (✅ Implemented)
- Database layer (✅ Implemented)
- Authentication (✅ Implemented)

**Enables:**
- Luna agent integration (TASK-005)
- Mood analytics
- Reflection insights
- Personal growth tracking

---

## 🛠️ Implementation Approach

### 1. Database Schema

```typescript
// features/journal/schema/index.ts
export const journalEntries = pgTable('feature_journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),

  // Content
  title: text('title'),
  content: text('content').notNull(), // Markdown format
  mood: text('mood', {
    enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy']
  }),

  // Metadata
  entryDate: timestamp('entry_date').notNull(), // Date the entry is for
  tags: text('tags').array(), // User-defined tags
  isPrivate: boolean('is_private').default(true),
  promptUsed: text('prompt_used'), // Daily prompt if used

  // Word count for analytics
  wordCount: integer('word_count').default(0),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastEditedAt: timestamp('last_edited_at'),
}, (table) => ({
  userIdx: index('journal_entries_user_idx').on(table.userId),
  dateIdx: index('journal_entries_date_idx').on(table.entryDate),
  moodIdx: index('journal_entries_mood_idx').on(table.mood),
}));

export const dailyPrompts = pgTable('feature_daily_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  prompt: text('prompt').notNull(),
  category: text('category', {
    enum: ['reflection', 'gratitude', 'goals', 'challenges', 'celebration']
  }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journalStats = pgTable('feature_journal_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  totalEntries: integer('total_entries').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  totalWords: integer('total_words').default(0),
  moodDistribution: jsonb('mood_distribution'), // { very_happy: 10, happy: 20, ... }
  lastEntryDate: timestamp('last_entry_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex('journal_stats_user_idx').on(table.userId),
}));
```

### 2. Service Layer

```typescript
// features/journal/services/journal-service.ts
export class JournalService {
  async createEntry(data: CreateJournalEntryDTO): Promise<JournalEntry> {
    const wordCount = this.countWords(data.content);

    const [entry] = await db.insert(journalEntries).values({
      ...data,
      wordCount,
      lastEditedAt: new Date(),
    }).returning();

    // Update stats
    await this.updateStats(data.userId);

    // Emit event
    await eventBus.emit('journal.created', {
      userId: data.userId,
      entryId: entry.id,
      mood: entry.mood,
      wordCount,
      timestamp: Date.now(),
    });

    return entry;
  }

  async updateEntry(id: string, data: Partial<JournalEntry>): Promise<JournalEntry> {
    if (data.content) {
      data.wordCount = this.countWords(data.content);
    }

    const [entry] = await db.update(journalEntries)
      .set({
        ...data,
        lastEditedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, id))
      .returning();

    await eventBus.emit('journal.updated', {
      userId: entry.userId,
      entryId: entry.id,
      timestamp: Date.now(),
    });

    return entry;
  }

  async getEntriesForUser(
    userId: string,
    filters?: JournalFilters
  ): Promise<JournalEntry[]> {
    let query = db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.entryDate));

    if (filters?.mood) {
      query = query.where(eq(journalEntries.mood, filters.mood));
    }

    if (filters?.startDate && filters?.endDate) {
      query = query.where(
        and(
          gte(journalEntries.entryDate, filters.startDate),
          lte(journalEntries.entryDate, filters.endDate)
        )
      );
    }

    return query;
  }

  async getEntryForDate(userId: string, date: Date): Promise<JournalEntry | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [entry] = await db.select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.entryDate, startOfDay),
          lte(journalEntries.entryDate, endOfDay)
        )
      );

    return entry || null;
  }

  async updateStats(userId: string): Promise<void> {
    const entries = await this.getEntriesForUser(userId);

    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
    const currentStreak = this.calculateStreak(entries);
    const moodDistribution = this.calculateMoodDistribution(entries);

    await db.insert(journalStats)
      .values({
        userId,
        totalEntries,
        totalWords,
        currentStreak,
        longestStreak: Math.max(currentStreak, /* previous longest */),
        moodDistribution,
        lastEntryDate: entries[0]?.entryDate,
      })
      .onConflictDoUpdate({
        target: journalStats.userId,
        set: {
          totalEntries,
          totalWords,
          currentStreak,
          moodDistribution,
          lastEntryDate: entries[0]?.entryDate,
          updatedAt: new Date(),
        },
      });
  }

  async getDailyPrompt(category?: string): Promise<DailyPrompt> {
    const prompts = await db.select()
      .from(dailyPrompts)
      .where(
        and(
          eq(dailyPrompts.isActive, true),
          category ? eq(dailyPrompts.category, category) : undefined
        )
      );

    // Return random prompt
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private calculateStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    let streak = 1;
    const sortedEntries = entries.sort((a, b) =>
      b.entryDate.getTime() - a.entryDate.getTime()
    );

    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const current = new Date(sortedEntries[i].entryDate);
      const next = new Date(sortedEntries[i + 1].entryDate);

      const daysDiff = Math.floor(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
```

### 3. Rich Text Editor Component

```tsx
// features/journal/components/JournalEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MoodSelector } from './MoodSelector';
import { useDebounce } from '@/hooks/useDebounce';

export function JournalEditor({ entry, onSave }: Props) {
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || 'neutral');
  const [isSaving, setIsSaving] = useState(false);

  const debouncedContent = useDebounce(content, 1000);

  // Auto-save
  useEffect(() => {
    if (debouncedContent && debouncedContent !== entry?.content) {
      handleAutoSave();
    }
  }, [debouncedContent]);

  const handleAutoSave = async () => {
    setIsSaving(true);
    await onSave({ content, mood });
    setIsSaving(false);
  };

  const wordCount = content.trim().split(/\s+/).length;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was your day? What are you grateful for?"
          className="min-h-[400px] text-lg"
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{wordCount} words</span>
          {isSaving && <span className="text-yellow-600">Saving...</span>}
          {!isSaving && debouncedContent && <span className="text-green-600">Saved ✓</span>}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAutoSave}>
            Save Entry
          </Button>
          <Button variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### 4. Calendar View Component

```tsx
// features/journal/components/JournalCalendar.tsx
export function JournalCalendar({ userId, onDateSelect }: Props) {
  const { entries, loading } = useJournalEntries(userId);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.entryDate.toISOString().split('T')[0];
    acc[dateKey] = entry;
    return acc;
  }, {} as Record<string, JournalEntry>);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateClick}
      className="rounded-md border"
      components={{
        Day: ({ date }) => {
          const dateKey = date.toISOString().split('T')[0];
          const entry = entriesByDate[dateKey];

          return (
            <div className="relative">
              <button className="w-full h-full">
                {date.getDate()}
              </button>
              {entry && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  {getMoodEmoji(entry.mood)}
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}
```

---

## 📋 Tasks Breakdown

1. **Database Schema** (2 hours)
   - Create journal tables
   - Seed daily prompts (50+ prompts)
   - Generate and run migration

2. **Service Layer** (4 hours)
   - Create `JournalService` class
   - Implement CRUD operations
   - Implement stats calculation
   - Implement streak calculation
   - Add auto-save logic

3. **API Routes** (2 hours)
   - `POST /api/journal` - Create entry
   - `GET /api/journal` - List entries
   - `GET /api/journal/:id` - Get entry
   - `PATCH /api/journal/:id` - Update entry
   - `DELETE /api/journal/:id` - Delete entry
   - `GET /api/journal/prompt` - Get daily prompt
   - `GET /api/journal/stats/:userId` - Get stats

4. **UI Components** (4 hours)
   - Create `JournalEditor` component
   - Create `MoodSelector` component
   - Create `JournalCalendar` component
   - Create `JournalList` component
   - Create `JournalStats` component
   - Add markdown preview

5. **Event Integration** (1 hour)
   - Emit `journal.created` event
   - Emit `journal.updated` event
   - Emit `mood.logged` event

6. **Testing** (1 hour)
   - Unit tests for service methods
   - Test streak calculation
   - Test word count
   - Integration tests for CRUD

---

## 🧪 Testing Requirements

### Unit Tests

```typescript
describe('JournalService', () => {
  describe('calculateStreak', () => {
    it('should calculate consecutive day streak', () => {
      const entries = [
        { entryDate: new Date('2024-01-05') },
        { entryDate: new Date('2024-01-04') },
        { entryDate: new Date('2024-01-03') },
        { entryDate: new Date('2024-01-01') }, // Breaks streak
      ];

      const streak = journalService.calculateStreak(entries);
      expect(streak).toBe(3);
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(journalService.countWords('Hello world')).toBe(2);
      expect(journalService.countWords('   Spaced   out   ')).toBe(2);
    });
  });
});
```

---

## 📚 Related Documentation

- [CLAUDE-patterns.md](../CLAUDE-patterns.md) - Component patterns
- [agent-behavior-spec.md](../reference/agent-behavior-spec.md) - Luna agent specs

---

## ✅ Definition of Done

- [ ] Database schema created and migrated
- [ ] Service layer implemented
- [ ] API endpoints working
- [ ] Rich text editor functional
- [ ] Mood selector works
- [ ] Calendar view shows entries
- [ ] Auto-save works
- [ ] Stats calculation accurate
- [ ] Streak calculation correct
- [ ] All tests pass (>85% coverage)
- [ ] Code reviewed and approved
- [ ] Merged to main branch

---

## 📊 Success Metrics

- **Entry Creation Success Rate**: 100%
- **Auto-save Reliability**: 100%
- **Streak Calculation Accuracy**: 100%
- **Word Count Accuracy**: 100%
- **Test Coverage**: >85%

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
