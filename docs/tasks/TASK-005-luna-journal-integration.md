# TASK-005: Integrate Luna Agent with Journal

**Sprint**: Next Sprint
**Priority**: 🟢 Medium
**Status**: 📋 Ready
**Estimate**: 10 hours
**Assignee**: TBD

---

## 📝 Description

Integrate Luna, the reflective AI companion, with the journaling feature to provide personalized insights, mood analysis, writing prompts, and gentle reflections based on user's journal entries. Luna's role is to help users deepen their self-reflection and gain insights from their journaling practice.

This creates an AI-powered journaling experience that goes beyond simple note-taking.

---

## 🎯 Acceptance Criteria

- [ ] Luna can analyze journal entries and provide insights
- [ ] Mood trend analysis with AI interpretation
- [ ] Personalized writing prompts based on past entries
- [ ] Pattern recognition (recurring themes, emotions, topics)
- [ ] Weekly/monthly reflection summaries
- [ ] Luna chat interface within journal section
- [ ] Contextual suggestions while writing
- [ ] Privacy-first: entries not used for model training
- [ ] Event-driven: Luna responds to journal events
- [ ] API endpoints for Luna journal insights
- [ ] Tests cover insight generation

---

## 🔗 Dependencies

**Depends on:**
- Journal feature core (TASK-004) - Required
- Luna AI agent (✅ Implemented)
- Event bus system (✅ Implemented)
- Vercel AI SDK (✅ Implemented)

**Enables:**
- Deep journaling insights
- Mental health tracking
- Personal growth analytics
- Enhanced user engagement

---

## 🛠️ Implementation Approach

### 1. Database Schema Extensions

```typescript
// features/journal/schema/luna-insights.ts
export const journalInsights = pgTable('feature_journal_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  entryId: uuid('entry_id').references(() => journalEntries.id),

  // Insight data
  insightType: text('insight_type', {
    enum: ['mood_trend', 'pattern', 'reflection', 'prompt', 'summary']
  }).notNull(),
  content: text('content').notNull(), // Luna's insight text
  metadata: jsonb('metadata'), // Additional data (themes, emotions, etc.)

  // Analytics
  isRead: boolean('is_read').default(false),
  isHelpful: boolean('is_helpful'), // User feedback

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('journal_insights_user_idx').on(table.userId),
  entryIdx: index('journal_insights_entry_idx').on(table.entryId),
  typeIdx: index('journal_insights_type_idx').on(table.insightType),
}));

export const lunaConversations = pgTable('feature_luna_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  entryId: uuid('entry_id').references(() => journalEntries.id),

  messages: jsonb('messages').notNull(), // Array of messages
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('luna_conversations_user_idx').on(table.userId),
}));
```

### 2. Luna Service Extension

```typescript
// features/journal/services/luna-journal-service.ts
export class LunaJournalService {
  async analyzeEntry(entryId: string): Promise<JournalInsight[]> {
    const entry = await journalService.getEntry(entryId);
    const insights: JournalInsight[] = [];

    // Mood trend analysis
    const moodInsight = await this.analyzeMoodTrend(entry.userId);
    if (moodInsight) insights.push(moodInsight);

    // Pattern recognition
    const patterns = await this.identifyPatterns(entry);
    insights.push(...patterns);

    // Generate reflection
    const reflection = await this.generateReflection(entry);
    insights.push(reflection);

    // Save insights
    await this.saveInsights(insights);

    return insights;
  }

  async analyzeMoodTrend(userId: string): Promise<JournalInsight | null> {
    // Get recent entries (last 7 days)
    const recentEntries = await journalService.getRecentEntries(userId, 7);

    if (recentEntries.length < 3) return null;

    // Analyze mood pattern
    const moods = recentEntries.map(e => e.mood);
    const moodTrend = this.calculateMoodTrend(moods);

    // Get Luna's interpretation
    const interpretation = await this.getLunaInterpretation({
      type: 'mood_trend',
      data: { moods, trend: moodTrend },
    });

    return {
      userId,
      insightType: 'mood_trend',
      content: interpretation,
      metadata: { moods, trend: moodTrend },
    };
  }

  async identifyPatterns(entry: JournalEntry): Promise<JournalInsight[]> {
    const userEntries = await journalService.getEntriesForUser(entry.userId);

    // Extract themes using Luna
    const themes = await this.extractThemes(entry.content, userEntries);

    // Identify recurring patterns
    const patterns = await this.findRecurringPatterns(themes, userEntries);

    return patterns.map(pattern => ({
      userId: entry.userId,
      entryId: entry.id,
      insightType: 'pattern',
      content: pattern.description,
      metadata: { theme: pattern.theme, frequency: pattern.frequency },
    }));
  }

  async generateReflection(entry: JournalEntry): Promise<JournalInsight> {
    const systemPrompt = `
      You are Luna, a gentle and reflective AI companion.
      The user has just written a journal entry. Provide a thoughtful,
      empathetic reflection that helps them gain deeper insights.

      Guidelines:
      - Be warm and supportive
      - Ask open-ended questions
      - Highlight positive aspects
      - Encourage self-compassion
      - Keep it under 100 words
      - Use moon/night metaphors occasionally 🌙
    `;

    const userPrompt = `
      Journal entry (${entry.mood} mood):
      ${entry.content}

      Please provide a gentle reflection.
    `;

    const reflection = await this.callLunaAI(systemPrompt, userPrompt);

    return {
      userId: entry.userId,
      entryId: entry.id,
      insightType: 'reflection',
      content: reflection,
      metadata: { mood: entry.mood },
    };
  }

  async generatePersonalizedPrompt(userId: string): Promise<string> {
    const recentEntries = await journalService.getRecentEntries(userId, 14);
    const stats = await journalService.getStats(userId);

    const systemPrompt = `
      You are Luna, creating personalized journal prompts.
      Based on the user's recent journal themes and mood patterns,
      suggest a thought-provoking prompt that encourages reflection.

      The prompt should:
      - Be relevant to their recent experiences
      - Encourage positive reflection
      - Be open-ended
      - Feel personal and caring
    `;

    const userContext = `
      Recent themes: ${this.extractMainThemes(recentEntries)}
      Recent moods: ${recentEntries.map(e => e.mood).join(', ')}
      Current streak: ${stats.currentStreak} days

      Generate a personalized journal prompt.
    `;

    return await this.callLunaAI(systemPrompt, userContext);
  }

  async generateWeeklySummary(userId: string): Promise<JournalInsight> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const weekEntries = await journalService.getEntriesForUser(userId, {
      startDate,
      endDate: new Date(),
    });

    const systemPrompt = `
      You are Luna, creating a gentle weekly reflection summary.
      Highlight key themes, emotional patterns, and growth moments.
      Be encouraging and supportive. Keep under 200 words.
    `;

    const weekData = `
      This week's entries: ${weekEntries.length}
      Total words: ${weekEntries.reduce((sum, e) => sum + e.wordCount, 0)}
      Moods: ${weekEntries.map(e => e.mood).join(', ')}

      Entry themes:
      ${weekEntries.map(e => `- ${e.content.substring(0, 100)}...`).join('\n')}

      Create a weekly summary reflection.
    `;

    const summary = await this.callLunaAI(systemPrompt, weekData);

    return {
      userId,
      insightType: 'summary',
      content: summary,
      metadata: {
        period: 'weekly',
        entryCount: weekEntries.length,
        startDate,
        endDate: new Date(),
      },
    };
  }

  private async callLunaAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      maxTokens: 300,
    });

    let fullResponse = '';
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }

    return fullResponse;
  }
}
```

### 3. Event Listeners

```typescript
// features/journal/events/luna-listeners.ts
export const setupLunaJournalListeners = (eventBus: EventBus) => {
  // Analyze entry after creation
  eventBus.on('journal.created', async (payload) => {
    // Wait a bit to avoid interrupting user
    setTimeout(async () => {
      const insights = await lunaJournalService.analyzeEntry(payload.entryId);

      await eventBus.emit('journal.insights.generated', {
        userId: payload.userId,
        entryId: payload.entryId,
        insights,
      });
    }, 5000); // 5 second delay
  });

  // Track mood changes
  eventBus.on('mood.logged', async (payload) => {
    // Check for significant mood changes
    const trend = await lunaJournalService.analyzeMoodTrend(payload.userId);

    if (trend && trend.metadata.trend === 'declining') {
      // Send supportive message
      await eventBus.emit('luna.support.needed', {
        userId: payload.userId,
        reason: 'mood_decline',
      });
    }
  });

  // Weekly summary generation
  eventBus.on('week.ended', async (payload) => {
    const users = await getActiveJournalers();

    for (const userId of users) {
      const summary = await lunaJournalService.generateWeeklySummary(userId);
      await eventBus.emit('journal.summary.created', {
        userId,
        summary,
      });
    }
  });
};
```

### 4. UI Components

```tsx
// features/journal/components/LunaInsights.tsx
export function LunaInsights({ entryId }: { entryId: string }) {
  const { insights, loading } = useJournalInsights(entryId);

  if (loading) return <Skeleton />;
  if (!insights.length) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          Luna's Reflections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map(insight => (
          <div key={insight.id} className="space-y-2">
            <Badge variant="secondary">
              {insight.insightType.replace('_', ' ')}
            </Badge>
            <p className="text-sm leading-relaxed">{insight.content}</p>

            {insight.insightType === 'pattern' && insight.metadata && (
              <p className="text-xs text-muted-foreground">
                This theme appeared {insight.metadata.frequency} times
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markHelpful(insight.id, true)}
              >
                👍 Helpful
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markHelpful(insight.id, false)}
              >
                Not helpful
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

```tsx
// features/journal/components/LunaChat.tsx
export function LunaChat({ userId, entryId }: Props) {
  const { messages, sendMessage, isLoading } = useChat({
    api: '/api/journal/luna/chat',
    body: { entryId },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          Chat with Luna
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask Luna for deeper insights about your journal entry
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "p-3 rounded-lg",
                message.role === 'assistant'
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <div className="flex gap-2">
            <Input
              placeholder="Ask Luna anything about your entry..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Tasks Breakdown

1. **Database Schema Extensions** (1 hour)
   - Create `journalInsights` table
   - Create `lunaConversations` table
   - Generate and run migration

2. **Luna Service Integration** (4 hours)
   - Create `LunaJournalService` class
   - Implement mood trend analysis
   - Implement pattern recognition
   - Implement reflection generation
   - Implement personalized prompts
   - Implement weekly summaries

3. **Event Integration** (1 hour)
   - Set up Luna event listeners
   - Connect to journal events
   - Emit insight events

4. **API Routes** (2 hours)
   - `GET /api/journal/:id/insights` - Get insights for entry
   - `POST /api/journal/luna/chat` - Luna chat endpoint
   - `GET /api/journal/luna/prompt` - Get personalized prompt
   - `POST /api/journal/insights/:id/feedback` - Mark helpful

5. **UI Components** (2 hours)
   - Create `LunaInsights` component
   - Create `LunaChat` component
   - Create `PersonalizedPrompt` component
   - Add insights to journal view

6. **Testing** (1 hour)
   - Unit tests for insight generation
   - Test pattern recognition
   - Test mood trend analysis
   - Integration tests

---

## 🧪 Testing Requirements

### Unit Tests

```typescript
describe('LunaJournalService', () => {
  describe('analyzeMoodTrend', () => {
    it('should detect improving mood trend', async () => {
      const entries = createEntriesWithMoods([
        'sad', 'neutral', 'happy', 'very_happy'
      ]);

      const insight = await lunaJournalService.analyzeMoodTrend('user-1');

      expect(insight.metadata.trend).toBe('improving');
      expect(insight.content).toContain('positive');
    });
  });

  describe('identifyPatterns', () => {
    it('should find recurring themes', async () => {
      const entry = createEntry({
        content: 'Feeling stressed about work deadlines again...'
      });

      const patterns = await lunaJournalService.identifyPatterns(entry);

      expect(patterns.some(p => p.metadata.theme === 'work_stress')).toBe(true);
    });
  });
});
```

---

## 📚 Related Documentation

- [agent-behavior-spec.md](../reference/agent-behavior-spec.md) - Luna personality
- [CLAUDE-patterns.md](../CLAUDE-patterns.md) - AI integration patterns
- [TASK-004](./TASK-004-journal-feature-core.md) - Journal core dependency

---

## 🔍 Implementation Notes

### Privacy Considerations

- All journal data stays in user's database
- Luna processes locally via API (no external storage)
- Clear privacy indicators in UI
- User can delete insights
- Option to disable Luna insights

### Luna's Personality

From agent-behavior-spec.md:
- Gentle and reflective
- Uses moon/night metaphors
- Focuses on introspection
- Non-judgmental
- Encourages self-compassion

### AI Prompting Strategy

```typescript
const LUNA_SYSTEM_PROMPTS = {
  reflection: `
    You are Luna 🌙, a gentle reflective companion.
    Help users gain insights through thoughtful questions.
    Be warm, supportive, and encourage self-compassion.
  `,

  moodAnalysis: `
    Analyze mood patterns with empathy and understanding.
    Highlight positive trends and offer gentle support for challenges.
  `,

  patternRecognition: `
    Identify recurring themes without judgment.
    Help users see connections and growth opportunities.
  `,
};
```

---

## ✅ Definition of Done

- [ ] Database schema extended
- [ ] Luna service implemented
- [ ] Event listeners working
- [ ] API endpoints created
- [ ] UI components functional
- [ ] Insights generated automatically
- [ ] Chat interface works
- [ ] Privacy controls in place
- [ ] All tests pass (>80% coverage)
- [ ] Code reviewed and approved
- [ ] Merged to main branch

---

## 📊 Success Metrics

- **Insight Generation Success Rate**: >95%
- **Insight Helpfulness Rating**: >70%
- **Chat Response Time**: <3 seconds
- **Pattern Recognition Accuracy**: >80%
- **Test Coverage**: >80%

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
