# TASK-009: Luna AI Integration (OpenAI/Anthropic)

**Status**: Not Started
**Priority**: Medium
**Dependencies**: TASK-007
**Estimated Effort**: 3-4 hours

---

## Objective

Replace Luna's placeholder AI responses with real AI integration using either OpenAI GPT-4 or Anthropic Claude for journal insights, chat conversations, and personalized prompts.

---

## Current State

- ✅ Luna service structure implemented
- ✅ Luna chat UI component working
- ✅ Insight generation logic scaffolded
- ❌ Using placeholder/mock AI responses
- ❌ No real AI provider integration

---

## Requirements

### 1. Choose AI Provider

**Option A: OpenAI**
- Model: GPT-4 Turbo or GPT-4
- Good for: General conversation, insights
- Cost: ~$0.01-0.03 per 1K tokens

**Option B: Anthropic Claude**
- Model: Claude 3.5 Sonnet or Claude 3 Opus
- Good for: Thoughtful analysis, journaling companion
- Cost: ~$0.003-0.015 per 1K tokens

**Option C: Both (with fallback)**
- Primary: Anthropic Claude (better for journaling)
- Fallback: OpenAI GPT-4

**Recommendation**: Start with Anthropic Claude (better for empathetic journaling companion)

### 2. Implement AI Service

Create reusable AI service that can:
- Generate insights from journal entries
- Chat with users about their journal
- Create personalized writing prompts
- Analyze mood trends
- Provide weekly summaries

### 3. Add Rate Limiting

Protect against excessive API usage:
- Limit insights generation per day
- Limit chat messages per session
- Cache insights when possible

---

## Implementation Plan

### Step 1: Install AI SDK

**Option A: OpenAI**
```bash
npm install openai
```

**Option B: Anthropic**
```bash
npm install @anthropic-ai/sdk
```

**Option C: Use Vercel AI SDK (recommended - supports both)**
```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic
```

### Step 2: Add Environment Variables

**Update**: `.env.local`

```env
# Choose one or both:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Default model
AI_MODEL=claude-3-5-sonnet-20241022
```

**Update**: `.env.example`
```env
# AI Provider Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-3-5-sonnet-20241022
```

### Step 3: Create AI Service Wrapper

**Create**: `src/lib/ai/client.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateCompletion(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const textContent = response.content.find(block => block.type === 'text');
    return textContent ? textContent.text : '';
  } catch (error) {
    console.error('AI generation failed:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function streamCompletion(
  messages: AIMessage[],
  systemPrompt?: string,
  onChunk?: (text: string) => void
): Promise<string> {
  try {
    const stream = await anthropic.messages.stream({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    let fullText = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullText += text;
        if (onChunk) {
          onChunk(text);
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error('AI streaming failed:', error);
    throw new Error('Failed to stream AI response');
  }
}
```

### Step 4: Update Luna Service

**Update**: `src/features/journal/services/luna-service.ts`

```typescript
import { generateCompletion } from '@/lib/ai/client';

export class LunaService {
  // ... existing code

  async generateInsight(
    userId: string,
    entries: JournalEntry[],
    type: InsightType
  ): Promise<LunaInsight> {
    // Prepare context from journal entries
    const context = entries
      .slice(0, 10)
      .map(e => `Date: ${e.createdAt}\nMood: ${e.mood || 'N/A'}\nContent: ${e.content}`)
      .join('\n\n---\n\n');

    const prompts = {
      mood_trend: `Analyze the mood patterns in these journal entries and provide a brief, compassionate insight about the user's emotional trajectory:

${context}

Provide a 2-3 sentence insight focusing on mood trends.`,

      pattern: `Analyze these journal entries for writing patterns, habits, and themes:

${context}

Provide a 2-3 sentence insight about patterns you notice.`,

      suggestion: `Based on these journal entries, provide a helpful, actionable suggestion for the user:

${context}

Provide a 2-3 sentence suggestion that could benefit the user.`,

      reflection: `Provide a deep, thoughtful reflection on these journal entries:

${context}

Provide a 2-3 sentence reflection that might help the user see their experiences in a new light.`,

      milestone: `Identify if there's anything worth celebrating in these journal entries:

${context}

If there's a milestone or achievement, provide a 2-3 sentence celebratory message. Otherwise, provide encouragement.`,
    };

    const systemPrompt = `You are Luna, a compassionate and thoughtful journaling companion. You provide warm, empathetic insights while respecting the user's privacy and emotional state. Be supportive, non-judgmental, and helpful.`;

    try {
      const content = await generateCompletion(
        [{ role: 'user', content: prompts[type] }],
        systemPrompt
      );

      // Create insight in database
      const [insight] = await this.db
        .insert(lunaInsights)
        .values({
          id: crypto.randomUUID(),
          userId,
          type,
          title: this.generateInsightTitle(type, content),
          content,
          relatedEntryIds: entries.map(e => e.id).join(','),
          isRead: false,
          createdAt: new Date(),
        })
        .returning();

      return insight;
    } catch (error) {
      console.error('Failed to generate insight:', error);
      throw error;
    }
  }

  async chat(
    userId: string,
    message: string,
    conversationHistory: LunaMessage[]
  ): Promise<string> {
    // Get recent journal entries for context
    const recentEntries = await this.getRecentEntries(userId, 5);

    const journalContext = recentEntries.length > 0
      ? `Here are some recent journal entries for context:\n\n${recentEntries
          .map(e => `${e.createdAt.toLocaleDateString()}: ${e.content.slice(0, 200)}...`)
          .join('\n\n')}`
      : 'The user has not written any journal entries yet.';

    const systemPrompt = `You are Luna, a warm and empathetic journaling companion. You help users reflect on their thoughts and feelings through compassionate conversation.

${journalContext}

Guidelines:
- Be supportive and non-judgmental
- Ask thoughtful follow-up questions
- Help users explore their feelings
- Respect privacy and boundaries
- Keep responses concise (2-4 sentences)
- Reference journal entries when relevant`;

    const messages = [
      ...conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    try {
      const response = await generateCompletion(messages, systemPrompt);

      // Save conversation to database
      await this.db.insert(lunaConversations).values([
        {
          id: crypto.randomUUID(),
          userId,
          role: 'user',
          content: message,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          userId,
          role: 'assistant',
          content: response,
          createdAt: new Date(),
        },
      ]);

      return response;
    } catch (error) {
      console.error('Failed to generate chat response:', error);
      throw error;
    }
  }

  async generatePersonalizedPrompt(userId: string): Promise<string> {
    const recentEntries = await this.getRecentEntries(userId, 10);

    if (recentEntries.length === 0) {
      return "What's on your mind today?";
    }

    const context = recentEntries
      .map(e => e.content.slice(0, 100))
      .join('\n');

    const systemPrompt = `You are Luna, a thoughtful journaling companion. Generate a personalized writing prompt based on the user's recent journal entries.`;

    const userPrompt = `Based on these recent journal entries:

${context}

Generate a single, thoughtful writing prompt that:
- Builds on themes from their recent writing
- Encourages deeper reflection
- Is open-ended and engaging
- Is 1-2 sentences max

Just provide the prompt, no preamble.`;

    try {
      const prompt = await generateCompletion(
        [{ role: 'user', content: userPrompt }],
        systemPrompt
      );

      return prompt.trim();
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      return "What's on your mind today?";
    }
  }

  private generateInsightTitle(type: InsightType, content: string): string {
    const titles = {
      mood_trend: 'Your Mood Journey',
      pattern: 'Writing Patterns Discovered',
      suggestion: 'A Thought for You',
      reflection: 'Reflection',
      milestone: 'Celebrate Your Progress',
    };
    return titles[type] || 'Insight';
  }

  private async getRecentEntries(userId: string, limit: number): Promise<JournalEntry[]> {
    return await this.db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }
}
```

### Step 5: Create Chat API Endpoint

**Create**: `src/app/api/journal/luna/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { createLunaService } from '@/features/journal/services/luna-service';

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();
  const lunaService = createLunaService(db);

  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await lunaService.chat(user.id, message, conversationHistory);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Luna chat failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
```

### Step 6: Update Luna Chat Page

**Update**: `src/app/(app)/journal/luna/page.tsx`

Replace mock response with real API call:

```typescript
const handleSendMessage = async (message: string) => {
  const userMessage = {
    id: `user-${Date.now()}`,
    role: 'user' as const,
    content: message,
    createdAt: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);

  try {
    const response = await fetch('/api/journal/luna/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationHistory: messages,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant' as const,
      content: data.response,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error('Chat error:', error);
    // Show error message to user
  } finally {
    setIsLoading(false);
  }
};
```

### Step 7: Add Rate Limiting

**Create**: `src/lib/rate-limit.ts`

```typescript
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Create limiters
export const lunaRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
```

**Update chat endpoint with rate limiting**:

```typescript
import { lunaRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 10 messages per minute per user
  try {
    await lunaRateLimit.check(10, user.id);
  } catch {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

---

## Testing Checklist

- [ ] AI service initializes correctly with API key
- [ ] Chat sends message and receives AI response
- [ ] Insights generate with real AI analysis
- [ ] Personalized prompts are contextual and relevant
- [ ] Rate limiting prevents abuse
- [ ] Error handling works when API fails
- [ ] Conversation history is maintained
- [ ] Luna references journal entries in responses
- [ ] Responses are empathetic and appropriate
- [ ] Cost tracking shows reasonable token usage

---

## Success Criteria

1. ✅ Luna chat provides meaningful, contextual responses
2. ✅ Insights are generated from real AI analysis
3. ✅ Personalized prompts reflect user's journal themes
4. ✅ Rate limiting prevents excessive API usage
5. ✅ Error handling gracefully manages API failures
6. ✅ Conversation feels natural and supportive
7. ✅ API costs are reasonable (<$0.50/day for active user)

---

## Files to Create/Modify

**Create**:
- `src/lib/ai/client.ts` - AI service wrapper
- `src/app/api/journal/luna/chat/route.ts` - Chat endpoint
- `src/lib/rate-limit.ts` - Rate limiting utility
- `.env.example` - Add AI keys example

**Modify**:
- `src/features/journal/services/luna-service.ts` - Replace placeholders with AI
- `src/app/(app)/journal/luna/page.tsx` - Wire to real API
- `.env.local` - Add real API keys (not committed)

---

## Cost Estimates

### Anthropic Claude Pricing (as of 2024)
- Claude 3.5 Sonnet: $3 per MTok (input), $15 per MTok (output)
- Average chat: ~500 input + 200 output tokens = $0.0045
- Average insight: ~1000 input + 300 output tokens = $0.0075

### Expected Daily Costs (per active user)
- 10 chat messages: $0.045
- 2 insights: $0.015
- 1 personalized prompt: $0.005
- **Total: ~$0.065/day per active user**

### Budget Recommendations
- Set monthly budget in AI provider dashboard
- Monitor usage in production
- Consider caching insights for 24 hours
- Add usage analytics

---

## Notes

- Start with lower rate limits, increase as needed
- Cache insights to reduce API calls
- Consider streaming responses for better UX
- Add telemetry to track AI performance
- May want to add prompt versioning for A/B testing
