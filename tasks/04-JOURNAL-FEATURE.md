# Task 04: Journal Feature

**Priority**: P2 - Core Feature
**Dependencies**: Agents (optional - can mock initially)
**Can Start**: Immediately (with mock agent responses)
**Estimated Timeline**: 3-4 days
**Parallelizable**: Yes - Can develop with mocks

---

## Overview

Implement the Journal feature to allow users to write daily entries, track moods, and receive AI-powered insights from Luna. This feature supports rich text editing, mood logging, and provides a reflective space for users.

## Objectives

- Daily journal entry creation and editing
- Rich text editor with markdown support
- Mood tracking and visualization
- AI-powered insights (Luna integration)
- Journal search and filtering
- Entry statistics and streaks
- Privacy-focused design

## Dependencies

### Depends On
- Agents (optional - can mock Luna responses initially)

### Provides To
- Gamification (triggers XP awards)
- Agents (provides context for Luna)

## Event Integration

### Emits
- `journal.created` - When new entry is created
- `journal.updated` - When entry is edited
- `journal.deleted` - When entry is removed
- `mood.logged` - When mood is tracked

### Listens To
- `user.login` - Show writing prompt for the day

## Database Schema

### Tables to Create

#### `feature_journal_entries`
```typescript
export const journalEntries = sqliteTable('feature_journal_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title'),
  content: text('content').notNull(),
  mood: text('mood', {
    enum: ['happy', 'sad', 'stressed', 'excited', 'calm', 'tired', 'angry', 'grateful']
  }),
  wordCount: integer('word_count').default(0),
  isPrivate: integer('is_private', { mode: 'boolean' }).default(true),
  tags: text('tags'), // JSON array of strings
  date: text('date').notNull(), // YYYY-MM-DD for grouping by day
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('journal_user_id_idx').on(table.userId),
  dateIdx: index('journal_date_idx').on(table.date),
  moodIdx: index('journal_mood_idx').on(table.mood),
}));
```

#### `feature_journal_prompts`
```typescript
export const journalPrompts = sqliteTable('feature_journal_prompts', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // 'reflection', 'gratitude', 'growth', 'creativity'
  prompt: text('prompt').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  usageCount: integer('usage_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

#### `feature_journal_insights`
```typescript
export const journalInsights = sqliteTable('feature_journal_insights', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  entryId: text('entry_id').references(() => journalEntries.id),
  insight: text('insight').notNull(),
  generatedBy: text('generated_by').default('luna'), // Which agent generated it
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: index('insights_user_id_idx').on(table.userId),
}));
```

## Service Layer

### JournalService Methods

```typescript
class JournalService {
  // Entry Management
  async create(data: NewJournalEntry): Promise<JournalEntry>
  async findById(id: string): Promise<JournalEntry | null>
  async findByUserId(userId: string, filters?: JournalFilters): Promise<JournalEntry[]>
  async update(id: string, data: Partial<JournalEntry>): Promise<JournalEntry | null>
  async delete(id: string): Promise<boolean>

  // Date-based queries
  async getEntriesByDate(userId: string, date: string): Promise<JournalEntry[]>
  async getEntriesByDateRange(userId: string, startDate: string, endDate: string): Promise<JournalEntry[]>
  async getEntryForToday(userId: string): Promise<JournalEntry | null>

  // Mood tracking
  async logMood(userId: string, mood: Mood): Promise<void>
  async getMoodHistory(userId: string, days?: number): Promise<MoodEntry[]>
  async getMoodInsights(userId: string): Promise<MoodInsights>

  // Search and filter
  async searchEntries(userId: string, query: string): Promise<JournalEntry[]>
  async getEntriesByTag(userId: string, tag: string): Promise<JournalEntry[]>
  async getEntriesByMood(userId: string, mood: Mood): Promise<JournalEntry[]>

  // Prompts
  async getDailyPrompt(): Promise<JournalPrompt>
  async getPromptsByCategory(category: string): Promise<JournalPrompt[]>
  async markPromptUsed(promptId: string): Promise<void>

  // Statistics
  async getJournalStats(userId: string): Promise<JournalStats>
  async getWritingStreak(userId: string): Promise<StreakInfo>

  // Insights (AI-generated)
  async generateInsight(entryId: string): Promise<string>
  async getInsights(userId: string, unreadOnly?: boolean): Promise<JournalInsight[]>
}
```

### Types
```typescript
interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  averageWordsPerEntry: number;
  moodDistribution: Record<Mood, number>;
  entriesByMonth: Record<string, number>;
}

interface MoodInsights {
  dominantMood: Mood;
  moodTrends: Array<{ date: string; mood: Mood }>;
  moodCorrelations: {
    happyDays: string[];
    stressedDays: string[];
  };
}

interface JournalFilters {
  mood?: Mood;
  tag?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
```

## API Routes

### Endpoints to Implement

#### `POST /api/journal`
Create new entry
```typescript
Request: {
  userId: string;
  title?: string;
  content: string;
  mood?: Mood;
  tags?: string[];
  isPrivate?: boolean;
}
Response: {
  entry: JournalEntry;
  wordCount: number;
}
```

#### `GET /api/journal`
Get user's entries
```typescript
Request Query: {
  userId: string;
  startDate?: string;
  endDate?: string;
  mood?: string;
  tag?: string;
  search?: string;
}
Response: {
  entries: JournalEntry[];
  count: number;
}
```

#### `GET /api/journal/:id`
Get specific entry
```typescript
Response: {
  entry: JournalEntry;
  insights?: JournalInsight[];
}
```

#### `PATCH /api/journal/:id`
Update entry
```typescript
Request: {
  title?: string;
  content?: string;
  mood?: Mood;
  tags?: string[];
}
Response: {
  entry: JournalEntry;
}
```

#### `DELETE /api/journal/:id`
Delete entry
```typescript
Response: {
  success: boolean;
}
```

#### `GET /api/journal/stats`
Get journal statistics
```typescript
Request Query: { userId: string }
Response: {
  stats: JournalStats;
  streak: StreakInfo;
}
```

#### `GET /api/journal/prompts`
Get writing prompts
```typescript
Request Query: { category?: string }
Response: {
  prompts: JournalPrompt[];
  dailyPrompt: JournalPrompt;
}
```

#### `POST /api/journal/mood`
Log mood
```typescript
Request: {
  userId: string;
  mood: Mood;
  note?: string;
}
Response: {
  success: boolean;
}
```

## UI Components

### Components to Build

#### `JournalPage.tsx`
Main journal page:
- Calendar view of entries
- Entry list
- Quick stats
- "Write Today" button
- Search bar

#### `JournalEditor.tsx`
Rich text editor:
- Markdown support
- Auto-save
- Word count display
- Mood selector
- Tag input
- Privacy toggle
- Title field

#### `JournalEntry.tsx`
Entry display:
- Formatted content
- Mood indicator
- Tags
- Timestamp
- Edit/delete buttons
- Luna's insights

#### `MoodTracker.tsx`
Mood tracking interface:
- Mood selector (emoji-based)
- Mood history chart
- Mood insights
- Correlation analysis

#### `JournalCalendar.tsx`
Calendar view:
- Entries marked on calendar
- Mood colors per day
- Writing streak indicator
- Click to view entry

#### `WritingPrompt.tsx`
Daily prompt display:
- Rotating prompts
- Category filter
- "Start writing" button
- Prompt history

#### `JournalStats.tsx`
Statistics dashboard:
- Total entries
- Writing streak
- Word count
- Mood distribution chart
- Monthly activity

#### `LunaInsights.tsx`
AI insights display:
- Luna avatar
- Insight cards
- "Get new insight" button
- Context display

## React Hooks

### `useJournal.ts`
```typescript
export function useJournal(userId: string, filters?: JournalFilters) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEntry = async (data: Partial<JournalEntry>) => {...}
  const updateEntry = async (id: string, data: Partial<JournalEntry>) => {...}
  const deleteEntry = async (id: string) => {...}
  const getTodayEntry = async () => {...}
  const refresh = async () => {...}

  return { entries, stats, loading, error, createEntry, updateEntry, deleteEntry, getTodayEntry, refresh };
}
```

### `useJournalEditor.ts`
```typescript
export function useJournalEditor(initialContent?: string) {
  const [content, setContent] = useState(initialContent || '');
  const [wordCount, setWordCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  const updateContent = (newContent: string) => {...}
  const save = async () => {...}
  const autoSave = useCallback(debounce(save, 2000), []);

  return { content, wordCount, isDirty, autoSaving, updateContent, save };
}
```

### `useMoodTracking.ts`
```typescript
export function useMoodTracking(userId: string) {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [insights, setInsights] = useState<MoodInsights | null>(null);

  const logMood = async (mood: Mood, note?: string) => {...}
  const getMoodTrends = async () => {...}
  const refresh = async () => {...}

  return { moodHistory, insights, logMood, getMoodTrends, refresh };
}
```

## Feature Configuration

### `feature.config.ts`
```typescript
export const JournalFeature: FeatureDefinition = {
  id: 'journal',
  name: 'Journal',
  version: '1.0.0',
  dependencies: [], // agents is optional

  provides: {
    routes: [
      { path: '/journal', component: () => import('./components/JournalPage') },
      { path: '/journal/:id', component: () => import('./components/JournalEntry') },
      { path: '/api/journal', handler: () => import('./api/route') },
      { path: '/api/journal/stats', handler: () => import('./api/stats/route') },
      { path: '/api/journal/prompts', handler: () => import('./api/prompts/route') },
    ],

    events: {
      emits: ['journal.created', 'journal.updated', 'journal.deleted', 'mood.logged'],
      listens: ['user.login'],
    },

    services: {
      'journal-service': () => import('./services/journal-service'),
    },

    tables: [
      'feature_journal_entries',
      'feature_journal_prompts',
      'feature_journal_insights',
    ],
  },

  async initialize({ eventBus, db }) {
    console.log('[Journal] Initializing...');

    const { createJournalService } = await import('./services/journal-service');
    const journalService = createJournalService(db, eventBus);

    // Seed prompts
    await journalService.seedPrompts();

    // Show writing prompt on login
    eventBus.on('user.login', async (payload) => {
      const todayEntry = await journalService.getEntryForToday(payload.userId);
      if (!todayEntry) {
        const prompt = await journalService.getDailyPrompt();
        console.log(`[Journal] Daily prompt for user: "${prompt.prompt}"`);
      }
    });

    console.log('[Journal] Initialized');
  },
};
```

## Predefined Prompts

```typescript
const JOURNAL_PROMPTS = [
  // Reflection
  { category: 'reflection', prompt: 'What did you learn about yourself today?' },
  { category: 'reflection', prompt: 'What would you do differently if you could redo today?' },
  { category: 'reflection', prompt: 'What challenged you today, and how did you respond?' },

  // Gratitude
  { category: 'gratitude', prompt: 'What are three things you\'re grateful for today?' },
  { category: 'gratitude', prompt: 'Who made a positive impact on your day?' },
  { category: 'gratitude', prompt: 'What small moment brought you joy?' },

  // Growth
  { category: 'growth', prompt: 'What skill or habit are you working to improve?' },
  { category: 'growth', prompt: 'What\'s one step you took toward your goals today?' },
  { category: 'growth', prompt: 'What feedback did you receive, and how will you use it?' },

  // Creativity
  { category: 'creativity', prompt: 'If today was a movie, what genre would it be?' },
  { category: 'creativity', prompt: 'Describe your day using only metaphors.' },
  { category: 'creativity', prompt: 'What would your future self say about today?' },
];
```

## Testing Requirements

### Unit Tests
- [ ] Entry CRUD operations
- [ ] Word count calculation
- [ ] Mood tracking logic
- [ ] Search functionality
- [ ] Streak calculation
- [ ] Event emission

### Integration Tests
- [ ] API endpoints
- [ ] Event flow with gamification
- [ ] Luna insight generation
- [ ] Auto-save functionality

### Test Coverage Target
- Minimum 80% coverage

## Implementation Checklist

### Phase 1: Setup (Day 1 Morning)
- [ ] Run `npm run create-feature journal`
- [ ] Define database schema
- [ ] Create migrations
- [ ] Seed prompts

### Phase 2: Service Layer (Day 1 Afternoon - Day 2)
- [ ] Implement JournalService
- [ ] Implement mood tracking
- [ ] Implement search
- [ ] Implement statistics
- [ ] Write unit tests

### Phase 3: API Layer (Day 2)
- [ ] Implement entry CRUD endpoints
- [ ] Implement stats endpoint
- [ ] Implement prompts endpoint
- [ ] Implement mood endpoint
- [ ] Add validation

### Phase 4: UI Components (Day 2-3)
- [ ] Create JournalEditor with rich text
- [ ] Create JournalPage with calendar
- [ ] Create MoodTracker
- [ ] Create JournalStats
- [ ] Implement auto-save
- [ ] Add animations

### Phase 5: Integration (Day 3-4)
- [ ] Integrate with Luna (or mock)
- [ ] Event emission for gamification
- [ ] Testing and polish
- [ ] Update event catalog
- [ ] Enable feature

## Event Flow Example

```
User writes journal entry
  → journal service validates
  → calculates word count
  → saves to database
  → emits 'journal.created' { wordCount: 250 }
  → gamification listens, awards XP
  → agents (Luna) listens
  → Luna generates insight
  → emits 'agent.insight'
  → UI displays insight to user
```

## Success Criteria

- [ ] Entry creation and editing works
- [ ] Rich text editor functional
- [ ] Mood tracking accurate
- [ ] Search returns relevant results
- [ ] Statistics calculated correctly
- [ ] Events emitting properly
- [ ] Auto-save working
- [ ] Tests passing (>80% coverage)

## Notes

- Implement auto-save every 2 seconds
- Store drafts locally (localStorage)
- Encrypt sensitive entries
- Support export to PDF/Markdown
- Consider offline mode
- Add image upload support (future)
- Implement voice-to-text (future)

## Deliverables

1. Fully functional journal system
2. Rich text editor with auto-save
3. Mood tracking with visualization
4. Search and filtering
5. Daily prompts
6. Statistics dashboard
7. Event integration
8. Comprehensive tests

---

**Ready to start? Run**: `npm run create-feature journal`
