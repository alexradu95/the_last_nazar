# Task 03: AI Agents Feature

**Priority**: P1 - Core Feature
**Dependencies**: None (can use mock AI initially)
**Can Start**: Immediately
**Estimated Timeline**: 4-5 days
**Parallelizable**: Yes - Fully independent

---

## Overview

Implement the AI Agents feature with three distinct personalities: Dawn (morning coach), Atlas (productivity analyst), and Luna (journal companion). Each agent provides contextual assistance and responds to user activities through events.

## Objectives

- Three AI agents with unique personalities
- Context-aware messaging based on user activity
- Event-driven agent responses
- Chat interface for each agent
- Agent suggestions and insights
- Integration with mock AI providers (upgrade to real AI later)
- Conversation history storage

## Agent Personalities

### Dawn - The Morning Coach
**Personality**: Energetic, motivational, enthusiastic
**Role**: Morning briefings, daily planning, motivation
**Triggers**: User login, morning time, task completion
**Example Messages**:
- "Good morning! Ready to crush today's goals? ☀️"
- "You completed 3 tasks yesterday - let's make today even better!"
- "I've noticed you're most productive in the morning. Let's tackle your high-priority tasks first!"

### Atlas - The Productivity Analyst
**Personality**: Analytical, data-driven, strategic
**Role**: Productivity insights, pattern analysis, optimization
**Triggers**: Task patterns, productivity metrics, weekly reviews
**Example Messages**:
- "Your completion rate is 85% this week - up 10% from last week."
- "I've identified a pattern: you complete more tasks on Tuesdays and Wednesdays."
- "Consider breaking down large tasks - your completion rate is higher on smaller tasks."

### Luna - The Journal Companion
**Personality**: Reflective, empathetic, thoughtful
**Role**: Journal insights, mood tracking, self-reflection prompts
**Triggers**: Journal entries, mood logs, evening time
**Example Messages**:
- "I noticed you've been feeling stressed lately. What's been on your mind?"
- "Your journals show growth in self-awareness over the past month."
- "Here's a prompt for tonight: What made you smile today?"

## Dependencies

### Depends On
- None (uses existing mock AI providers)

### Optional Integration
- Gamification (for level-up celebrations)
- Tasks (for productivity insights)
- Journal (for reflection insights)

## Event Integration

### Emits
- `agent.message` - When agent sends a message
- `agent.suggestion` - When agent makes a suggestion
- `agent.insight` - When agent provides analysis

### Listens To
- `user.login` - Dawn sends morning briefing
- `task.completed` - Dawn/Atlas respond with encouragement
- `level.up` - Dawn celebrates achievements
- `journal.created` - Luna provides insights
- `mood.logged` - Luna responds empathetically

## Database Schema

### Tables to Create

#### `feature_agents_conversations`
```typescript
export const conversations = sqliteTable('feature_agents_conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id', { enum: ['dawn', 'atlas', 'luna'] }).notNull(),
  title: text('title'), // Auto-generated or user-set
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userAgentIdx: index('conversations_user_agent_idx').on(table.userId, table.agentId),
}));
```

#### `feature_agents_messages`
```typescript
export const messages = sqliteTable('feature_agents_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  role: text('role', { enum: ['user', 'agent'] }).notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON: context, triggers, etc.
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
  timestampIdx: index('messages_timestamp_idx').on(table.timestamp),
}));
```

#### `feature_agents_suggestions`
```typescript
export const suggestions = sqliteTable('feature_agents_suggestions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id', { enum: ['dawn', 'atlas', 'luna'] }).notNull(),
  type: text('type').notNull(), // 'task', 'insight', 'prompt', 'tip'
  content: text('content').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
  status: text('status', { enum: ['active', 'dismissed', 'completed'] }).default('active'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userStatusIdx: index('suggestions_user_status_idx').on(table.userId, table.status),
}));
```

#### `feature_agents_insights`
```typescript
export const insights = sqliteTable('feature_agents_insights', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id').notNull(),
  category: text('category').notNull(), // 'productivity', 'mood', 'patterns'
  title: text('title').notNull(),
  content: text('content').notNull(),
  data: text('data'), // JSON: supporting data/metrics
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userCategoryIdx: index('insights_user_category_idx').on(table.userId, table.category),
}));
```

## Service Layer

### AgentService Methods

```typescript
class AgentService {
  // Conversation Management
  async getOrCreateConversation(userId: string, agentId: AgentId): Promise<Conversation>
  async getConversationHistory(conversationId: string, limit?: number): Promise<Message[]>
  async sendMessage(conversationId: string, role: 'user' | 'agent', content: string): Promise<Message>

  // Agent Responses
  async generateResponse(agentId: AgentId, userMessage: string, context: AgentContext): Promise<string>
  async sendAutomatedMessage(userId: string, agentId: AgentId, trigger: string, context: any): Promise<void>

  // Suggestions
  async createSuggestion(userId: string, agentId: AgentId, suggestion: Suggestion): Promise<Suggestion>
  async getSuggestions(userId: string, status?: 'active' | 'dismissed'): Promise<Suggestion[]>
  async dismissSuggestion(suggestionId: string): Promise<void>

  // Insights
  async generateInsight(userId: string, agentId: AgentId, category: string): Promise<Insight>
  async getInsights(userId: string, category?: string, unreadOnly?: boolean): Promise<Insight[]>
  async markInsightRead(insightId: string): Promise<void>

  // Agent Triggers
  async handleUserLogin(userId: string): Promise<void>
  async handleTaskCompleted(userId: string, taskData: any): Promise<void>
  async handleJournalCreated(userId: string, journalData: any): Promise<void>
  async handleLevelUp(userId: string, levelData: any): Promise<void>
}
```

### Agent Context Builder
```typescript
interface AgentContext {
  userId: string;
  recentTasks?: Task[];
  recentJournals?: Journal[];
  gamificationStats?: UserStats;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userPreferences?: any;
  conversationHistory?: Message[];
}

async function buildContext(userId: string): Promise<AgentContext> {
  // Gather relevant data from all features
  const context: AgentContext = {
    userId,
    timeOfDay: getTimeOfDay(),
  };

  // Fetch recent tasks
  const taskService = await registry.getService('task-service');
  context.recentTasks = await taskService.findByUserId(userId, { status: 'completed' }, 'createdAt', 5);

  // Fetch gamification stats
  const gamificationService = await registry.getService('gamification-service');
  context.gamificationStats = await gamificationService.getUserStats(userId);

  return context;
}
```

## API Routes

### Endpoints to Implement

#### `POST /api/agents/chat`
Send message to agent
```typescript
Request: {
  userId: string;
  agentId: 'dawn' | 'atlas' | 'luna';
  message: string;
}
Response: {
  response: string;
  conversationId: string;
}
```

#### `GET /api/agents/conversations`
Get user's conversations
```typescript
Request Query: { userId: string; agentId?: string }
Response: {
  conversations: Conversation[];
}
```

#### `GET /api/agents/messages`
Get conversation history
```typescript
Request Query: { conversationId: string; limit?: number }
Response: {
  messages: Message[];
}
```

#### `GET /api/agents/suggestions`
Get active suggestions
```typescript
Request Query: { userId: string; status?: string }
Response: {
  suggestions: Suggestion[];
}
```

#### `POST /api/agents/suggestions/:id/dismiss`
Dismiss a suggestion
```typescript
Response: {
  success: boolean;
}
```

#### `GET /api/agents/insights`
Get insights
```typescript
Request Query: { userId: string; category?: string; unreadOnly?: boolean }
Response: {
  insights: Insight[];
}
```

## UI Components

### Components to Build

#### `AgentChat.tsx`
Chat interface for each agent:
- Agent avatar and name
- Message history
- Input field
- Typing indicator
- Context awareness display

#### `AgentSelector.tsx`
Agent selection interface:
- Three agent cards (Dawn, Atlas, Luna)
- Agent descriptions
- Active conversation indicators
- Quick access buttons

#### `MessageBubble.tsx`
Individual message display:
- User vs agent styling
- Timestamp
- Markdown support
- Code highlighting (for insights)

#### `AgentSuggestions.tsx`
Suggestion cards:
- Agent icon
- Suggestion content
- Action buttons (accept, dismiss)
- Priority indicator

#### `AgentInsights.tsx`
Insight display:
- Category badges
- Data visualizations
- Read/unread indicator
- Expandable details

#### `DawnBriefing.tsx`
Morning briefing component:
- Daily summary
- Task recommendations
- Motivational message
- Weather/calendar integration (future)

#### `AtlasAnalytics.tsx`
Productivity analytics:
- Charts and graphs
- Pattern analysis
- Recommendations
- Week-over-week comparison

#### `LunaPrompts.tsx`
Journal prompts:
- Daily prompts
- Mood-based prompts
- Reflection questions
- Writing inspiration

## React Hooks

### `useAgent.ts`
```typescript
export function useAgent(userId: string, agentId: AgentId) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (content: string) => {...}
  const loadHistory = async () => {...}
  const refresh = async () => {...}

  return { conversation, messages, loading, isTyping, sendMessage, loadHistory, refresh };
}
```

### `useSuggestions.ts`
```typescript
export function useSuggestions(userId: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const dismissSuggestion = async (id: string) => {...}
  const refresh = async () => {...}

  return { suggestions, loading, dismissSuggestion, refresh };
}
```

## Feature Configuration

### `feature.config.ts`
```typescript
export const AgentsFeature: FeatureDefinition = {
  id: 'agents',
  name: 'AI Agents',
  version: '1.0.0',
  dependencies: [],

  provides: {
    routes: [
      { path: '/agents', component: () => import('./components/AgentSelector') },
      { path: '/agents/:agentId', component: () => import('./components/AgentChat') },
      { path: '/api/agents/chat', handler: () => import('./api/chat/route') },
      { path: '/api/agents/suggestions', handler: () => import('./api/suggestions/route') },
    ],

    events: {
      emits: ['agent.message', 'agent.suggestion', 'agent.insight'],
      listens: ['user.login', 'task.completed', 'level.up', 'journal.created', 'mood.logged'],
    },

    services: {
      'agent-service': () => import('./services/agent-service'),
    },

    tables: [
      'feature_agents_conversations',
      'feature_agents_messages',
      'feature_agents_suggestions',
      'feature_agents_insights',
    ],
  },

  async initialize({ eventBus, db, aiService }) {
    console.log('[Agents] Initializing...');

    const { createAgentService } = await import('./services/agent-service');
    const agentService = createAgentService(db, eventBus, aiService);

    // Dawn: Morning briefings
    eventBus.on('user.login', async (payload) => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        await agentService.sendAutomatedMessage(
          payload.userId,
          'dawn',
          'morning_briefing',
          { hour }
        );
      }
    });

    // Dawn: Task completion celebration
    eventBus.on('task.completed', async (payload) => {
      await agentService.sendAutomatedMessage(
        payload.userId,
        'dawn',
        'task_completed',
        { xpReward: payload.xpReward, priority: payload.priority }
      );
    });

    // Dawn: Level up celebration
    eventBus.on('level.up', async (payload) => {
      await agentService.sendAutomatedMessage(
        payload.userId,
        'dawn',
        'level_up',
        { newLevel: payload.newLevel }
      );
    });

    // Luna: Journal entry insights
    eventBus.on('journal.created', async (payload) => {
      await agentService.sendAutomatedMessage(
        payload.userId,
        'luna',
        'journal_created',
        { wordCount: payload.wordCount }
      );
    });

    // Atlas: Weekly productivity insights (scheduled)
    // Note: Would need cron/scheduler in production

    console.log('[Agents] Initialized');
  },
};
```

## Agent Response Templates

### Dawn Templates
```typescript
const DAWN_TEMPLATES = {
  morning_briefing: (context: AgentContext) => {
    const tasksToday = context.recentTasks?.filter(isToday).length || 0;
    return `Good morning! ☀️ You have ${tasksToday} tasks for today. Let's make it productive!`;
  },

  task_completed: (context: any) => {
    const encouragements = [
      "Amazing work! Keep that momentum going! 🚀",
      "You're crushing it today! 💪",
      "Another one done! You're on fire! 🔥",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  },

  level_up: (context: any) => {
    return `🎉 Level ${context.newLevel}! You're becoming unstoppable!`;
  },
};
```

### Atlas Templates
```typescript
const ATLAS_TEMPLATES = {
  weekly_insight: (context: AgentContext) => {
    const completionRate = context.gamificationStats?.completionRate || 0;
    return `Your completion rate this week: ${completionRate.toFixed(1)}%. ${
      completionRate > 80 ? 'Excellent consistency!' : 'Room for improvement.'
    }`;
  },

  productivity_pattern: (context: any) => {
    return `I've noticed you're most productive during ${context.peakHours}. Consider scheduling important tasks then.`;
  },
};
```

### Luna Templates
```typescript
const LUNA_TEMPLATES = {
  journal_created: (context: any) => {
    const prompts = [
      "Thank you for sharing. How are you feeling about what you wrote?",
      "I sense some growth in your writing. What insights did you gain?",
      "Your words have power. What would you like to explore more?",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  evening_prompt: () => {
    const prompts = [
      "What made you smile today?",
      "What challenged you, and what did you learn?",
      "If today was a chapter, what would its title be?",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },
};
```

## Testing Requirements

### Unit Tests
- [ ] Agent response generation
- [ ] Context building
- [ ] Message storage and retrieval
- [ ] Suggestion creation and dismissal
- [ ] Event handler logic

### Integration Tests
- [ ] Event-driven agent responses
- [ ] Chat flow with mock AI
- [ ] Suggestion lifecycle
- [ ] Multi-agent coordination

### Test Coverage Target
- Minimum 80% coverage

## Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Run `npm run create-feature agents`
- [ ] Define database schema
- [ ] Create migrations
- [ ] Set up agent templates

### Phase 2: Core Service (Day 2)
- [ ] Implement AgentService
- [ ] Implement context building
- [ ] Implement response generation with mock AI
- [ ] Implement conversation management
- [ ] Write unit tests

### Phase 3: Event Integration (Day 2-3)
- [ ] Listen to user.login
- [ ] Listen to task.completed
- [ ] Listen to level.up
- [ ] Listen to journal.created
- [ ] Test automated messaging

### Phase 4: API Layer (Day 3)
- [ ] Implement chat endpoint
- [ ] Implement suggestions endpoints
- [ ] Implement insights endpoints
- [ ] Add validation

### Phase 5: UI Components (Day 4-5)
- [ ] Create AgentChat interface
- [ ] Create AgentSelector
- [ ] Create suggestion displays
- [ ] Create insight panels
- [ ] Implement streaming responses
- [ ] Add animations

### Phase 6: Testing & Polish (Day 5)
- [ ] Integration testing
- [ ] Polish UI/UX
- [ ] Update event catalog
- [ ] Enable feature

## Success Criteria

- [ ] All three agents functional
- [ ] Event-driven responses working
- [ ] Chat interface smooth
- [ ] Suggestions relevant
- [ ] Context awareness demonstrated
- [ ] Tests passing (>80% coverage)
- [ ] Mock AI integration verified

## Notes

- Start with mock AI, upgrade to real AI later
- Keep agent personalities consistent
- Store conversation history for context
- Consider rate limiting on chat
- Plan for multi-language support
- Add personality customization (future)
- Consider voice mode (future)

## Deliverables

1. Three functional AI agents
2. Chat interface for each agent
3. Event-driven automated messaging
4. Suggestions and insights system
5. Comprehensive tests
6. Event catalog updates

---

**Ready to start? Run**: `npm run create-feature agents`
