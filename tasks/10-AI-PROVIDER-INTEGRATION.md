# Task 10: Real AI Provider Integration

**Status**: Not Started
**Priority**: Medium
**Estimated Effort**: 2-3 hours
**Dependencies**: Task 09 (Production deployment for secrets management)

## Objective

Replace mock AI agent responses with real AI provider integration (Anthropic Claude, OpenAI GPT, or Google Gemini) to enable genuine conversational AI capabilities for Dawn, Atlas, and Luna agents.

## Context

Currently, the AI agents feature uses mock responses for development:
```typescript
// Current mock implementation
const mockResponse = {
  dawn: "I'd be happy to help with that! [mock response]",
  atlas: "[mock analysis] [mock response]",
  luna: "[encouraging mock response]"
};
```

We need to integrate a real AI provider to:
- Enable natural conversations with agents
- Implement personality-specific prompts
- Add context-aware responses
- Support streaming responses for better UX
- Include conversation memory

## Success Criteria

1. ✅ AI provider SDK installed and configured
2. ✅ Environment variables for API keys
3. ✅ Agent personality prompts implemented
4. ✅ Streaming responses working
5. ✅ Conversation memory/context
6. ✅ Error handling and fallbacks
7. ✅ Rate limiting and cost control
8. ✅ Token usage tracking
9. ✅ Tests updated to use real provider
10. ✅ Documentation for provider setup

## Implementation Steps

### Phase 1: Provider Selection & Setup (30 mins)

1. **Choose AI provider**
   - **Anthropic Claude** (recommended for personality)
     - Pros: Best at personality, long context, thinking
     - Cons: Slightly more expensive
   - **OpenAI GPT-4** (widely used)
     - Pros: Well-documented, good performance
     - Cons: More generic responses
   - **Google Gemini** (cost-effective)
     - Pros: Free tier, good performance
     - Cons: Newer, fewer examples

2. **Install Vercel AI SDK** (recommended abstraction)
   ```bash
   npm install ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
   npm install zod
   ```

3. **Configure environment variables**
   ```bash
   # .env.local
   ANTHROPIC_API_KEY=sk-ant-xxx
   OPENAI_API_KEY=sk-xxx
   GOOGLE_API_KEY=xxx

   # Choose default provider
   AI_PROVIDER=anthropic
   AI_MODEL=claude-3-5-sonnet-20241022
   ```

4. **Create provider configuration**
   ```typescript
   // src/core/ai/config.ts
   import { anthropic } from '@ai-sdk/anthropic';
   import { openai } from '@ai-sdk/openai';
   import { google } from '@ai-sdk/google';

   const providers = {
     anthropic: {
       model: anthropic(process.env.AI_MODEL || 'claude-3-5-sonnet-20241022'),
       maxTokens: 4096,
     },
     openai: {
       model: openai(process.env.AI_MODEL || 'gpt-4-turbo'),
       maxTokens: 4096,
     },
     google: {
       model: google(process.env.AI_MODEL || 'gemini-pro'),
       maxTokens: 4096,
     },
   };

   export const getAIProvider = () => {
     const provider = process.env.AI_PROVIDER || 'anthropic';
     return providers[provider as keyof typeof providers];
   };
   ```

### Phase 2: Agent Personality Prompts (45 mins)

1. **Create system prompts for each agent**
   ```typescript
   // src/features/agents/prompts.ts
   export const agentPrompts = {
     dawn: {
       systemPrompt: `You are Dawn, a warm and supportive AI companion designed to help users with their daily tasks and well-being.

   PERSONALITY:
   - Warm, encouraging, and empathetic
   - Uses gentle, friendly language
   - Focuses on emotional well-being
   - Celebrates small wins
   - Offers practical, actionable advice
   - Uses emojis occasionally but not excessively

   CAPABILITIES:
   - Help with task planning and prioritization
   - Provide motivational support
   - Suggest breaks and self-care
   - Track mood and well-being
   - Celebrate achievements

   COMMUNICATION STYLE:
   - Address user warmly
   - Use "we" instead of "you" when appropriate
   - Offer specific, helpful suggestions
   - Ask follow-up questions to understand context
   - Keep responses concise but caring

   LIMITATIONS:
   - You are not a therapist or medical professional
   - Encourage professional help when appropriate
   - Focus on productivity and well-being within your scope`,

       greeting: "Hi! I'm Dawn. I'm here to help you stay on track and feel your best. What would you like to focus on today?",
     },

     atlas: {
       systemPrompt: `You are Atlas, an analytical AI companion specialized in productivity optimization and data-driven insights.

   PERSONALITY:
   - Analytical, precise, and detail-oriented
   - Data-driven and evidence-based
   - Professional but approachable
   - Focuses on patterns and trends
   - Provides actionable metrics

   CAPABILITIES:
   - Analyze task completion patterns
   - Identify productivity trends
   - Suggest optimal work schedules
   - Track progress toward goals
   - Generate insightful reports

   COMMUNICATION STYLE:
   - Use specific numbers and data
   - Provide clear, structured insights
   - Back recommendations with evidence
   - Use bullet points for clarity
   - Include relevant statistics

   APPROACH:
   - Start with key metrics
   - Identify patterns and trends
   - Suggest data-backed improvements
   - Quantify progress where possible`,

       greeting: "Hello. I'm Atlas. I analyze your productivity patterns to help you optimize performance. What insights can I provide?",
     },

     luna: {
       systemPrompt: `You are Luna, a creative and mindful AI companion focused on balance, reflection, and personal growth.

   PERSONALITY:
   - Reflective, creative, and mindful
   - Emphasizes work-life balance
   - Encourages self-reflection
   - Focuses on long-term well-being
   - Gentle and patient

   CAPABILITIES:
   - Guide mindfulness practices
   - Facilitate journaling and reflection
   - Suggest creative breaks
   - Help with stress management
   - Encourage healthy habits

   COMMUNICATION STYLE:
   - Thoughtful and contemplative
   - Ask open-ended questions
   - Encourage self-discovery
   - Use calming, poetic language
   - Focus on feelings and experiences

   APPROACH:
   - Start with how the user is feeling
   - Encourage reflection before action
   - Suggest mindful alternatives
   - Value rest and restoration`,

       greeting: "Welcome. I'm Luna. Let's take a moment to reflect on your journey. How are you feeling about your progress lately?",
     },
   };

   export type AgentType = keyof typeof agentPrompts;
   ```

2. **Create conversation context builder**
   ```typescript
   // src/features/agents/context-builder.ts
   import type { Message } from './types';

   export const buildConversationContext = (
     agentType: AgentType,
     messages: Message[],
     userContext?: {
       tasksCompleted?: number;
       currentStreak?: number;
       currentLevel?: number;
       recentMood?: string;
     }
   ) => {
     const prompt = agentPrompts[agentType];

     let contextualInfo = '';

     if (userContext) {
       contextualInfo = `
   USER CONTEXT:
   - Tasks completed today: ${userContext.tasksCompleted || 0}
   - Current streak: ${userContext.currentStreak || 0} days
   - Current level: ${userContext.currentLevel || 1}
   - Recent mood: ${userContext.recentMood || 'not tracked'}
       `;
     }

     return {
       systemPrompt: prompt.systemPrompt + contextualInfo,
       messages: messages.map(msg => ({
         role: msg.role,
         content: msg.content,
       })),
     };
   };
   ```

### Phase 3: Streaming Chat Implementation (45 mins)

1. **Create streaming chat API route**
   ```typescript
   // app/api/agents/chat/route.ts
   import { streamText } from 'ai';
   import { getAIProvider } from '@/core/ai/config';
   import { buildConversationContext } from '@/features/agents/context-builder';
   import { z } from 'zod';

   const requestSchema = z.object({
     agentType: z.enum(['dawn', 'atlas', 'luna']),
     messages: z.array(
       z.object({
         role: z.enum(['user', 'assistant']),
         content: z.string(),
       })
     ),
     userContext: z
       .object({
         tasksCompleted: z.number().optional(),
         currentStreak: z.number().optional(),
         currentLevel: z.number().optional(),
         recentMood: z.string().optional(),
       })
       .optional(),
   });

   export async function POST(req: Request) {
     try {
       const body = await req.json();
       const { agentType, messages, userContext } = requestSchema.parse(body);

       const { systemPrompt, messages: conversationMessages } =
         buildConversationContext(agentType, messages, userContext);

       const provider = getAIProvider();

       const result = await streamText({
         model: provider.model,
         system: systemPrompt,
         messages: conversationMessages,
         maxTokens: provider.maxTokens,
         temperature: 0.7,
       });

       return result.toDataStreamResponse();
     } catch (error) {
       console.error('Chat API error:', error);
       return new Response('Internal Server Error', { status: 500 });
     }
   }
   ```

2. **Update agent chat component**
   ```typescript
   // src/features/agents/components/AgentChat.tsx
   'use client';

   import { useChat } from 'ai/react';
   import { useState } from 'react';
   import type { AgentType } from '../prompts';

   type AgentChatProps = {
     agentType: AgentType;
     userId: string;
   };

   export function AgentChat({ agentType, userId }: AgentChatProps) {
     const [userContext, setUserContext] = useState({
       tasksCompleted: 0,
       currentStreak: 0,
       currentLevel: 1,
     });

     const { messages, input, handleInputChange, handleSubmit, isLoading } =
       useChat({
         api: '/api/agents/chat',
         body: {
           agentType,
           userContext,
         },
         initialMessages: [
           {
             id: '1',
             role: 'assistant',
             content: agentPrompts[agentType].greeting,
           },
         ],
       });

     return (
       <div className="flex flex-col h-[600px]">
         <div className="flex-1 overflow-y-auto space-y-4 p-4">
           {messages.map((message) => (
             <div
               key={message.id}
               className={`flex ${
                 message.role === 'user' ? 'justify-end' : 'justify-start'
               }`}
             >
               <div
                 className={`max-w-[80%] rounded-lg p-3 ${
                   message.role === 'user'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-200 text-gray-900'
                 }`}
               >
                 {message.content}
               </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex justify-start">
               <div className="bg-gray-200 rounded-lg p-3">
                 <div className="animate-pulse">Thinking...</div>
               </div>
             </div>
           )}
         </div>

         <form onSubmit={handleSubmit} className="border-t p-4">
           <div className="flex gap-2">
             <input
               value={input}
               onChange={handleInputChange}
               placeholder={`Chat with ${agentType}...`}
               className="flex-1 rounded-lg border px-4 py-2"
               disabled={isLoading}
             />
             <button
               type="submit"
               disabled={isLoading}
               className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
             >
               Send
             </button>
           </div>
         </form>
       </div>
     );
   }
   ```

### Phase 4: Conversation Memory (30 mins)

1. **Create conversation schema**
   ```typescript
   // src/features/agents/schema.ts
   import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

   export const conversations = pgTable('conversations', {
     id: uuid('id').primaryKey().defaultRandom(),
     userId: text('user_id').notNull(),
     agentType: text('agent_type').notNull(), // dawn, atlas, luna
     messages: jsonb('messages').notNull().default([]),
     createdAt: timestamp('created_at').defaultNow(),
     updatedAt: timestamp('updated_at').defaultNow(),
   });
   ```

2. **Create conversation service**
   ```typescript
   // src/features/agents/conversation-service.ts
   import { db } from '@/core/database';
   import { conversations } from './schema';
   import { eq, and } from 'drizzle-orm';

   export const conversationService = {
     async getOrCreate(userId: string, agentType: string) {
       const existing = await db
         .select()
         .from(conversations)
         .where(
           and(
             eq(conversations.userId, userId),
             eq(conversations.agentType, agentType)
           )
         )
         .limit(1);

       if (existing.length > 0) {
         return existing[0];
       }

       const [conversation] = await db
         .insert(conversations)
         .values({
           userId,
           agentType,
           messages: [],
         })
         .returning();

       return conversation;
     },

     async addMessage(
       conversationId: string,
       role: 'user' | 'assistant',
       content: string
     ) {
       const conversation = await db
         .select()
         .from(conversations)
         .where(eq(conversations.id, conversationId))
         .limit(1);

       if (conversation.length === 0) {
         throw new Error('Conversation not found');
       }

       const messages = [
         ...(conversation[0].messages as any[]),
         {
           role,
           content,
           timestamp: new Date().toISOString(),
         },
       ];

       await db
         .update(conversations)
         .set({
           messages,
           updatedAt: new Date(),
         })
         .where(eq(conversations.id, conversationId));
     },

     async getHistory(conversationId: string, limit = 20) {
       const conversation = await db
         .select()
         .from(conversations)
         .where(eq(conversations.id, conversationId))
         .limit(1);

       if (conversation.length === 0) {
         return [];
       }

       const messages = conversation[0].messages as any[];
       return messages.slice(-limit);
     },
   };
   ```

### Phase 5: Rate Limiting & Cost Control (30 mins)

1. **Install rate limiting**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

2. **Create rate limiter**
   ```typescript
   // src/lib/rate-limit.ts
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   export const rateLimiter = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
     analytics: true,
   });

   export const checkRateLimit = async (userId: string) => {
     const { success, limit, remaining, reset } = await rateLimiter.limit(
       `agent_chat_${userId}`
     );

     return {
       success,
       limit,
       remaining,
       reset: new Date(reset),
     };
   };
   ```

3. **Add rate limiting to API**
   ```typescript
   // app/api/agents/chat/route.ts (updated)
   export async function POST(req: Request) {
     const userId = await getUserIdFromRequest(req);

     // Check rate limit
     const rateLimit = await checkRateLimit(userId);
     if (!rateLimit.success) {
       return new Response('Rate limit exceeded', {
         status: 429,
         headers: {
           'X-RateLimit-Limit': rateLimit.limit.toString(),
           'X-RateLimit-Remaining': rateLimit.remaining.toString(),
           'X-RateLimit-Reset': rateLimit.reset.toISOString(),
         },
       });
     }

     // ... rest of chat logic
   }
   ```

4. **Create token usage tracking**
   ```typescript
   // src/features/agents/usage-tracker.ts
   import { db } from '@/core/database';
   import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

   export const aiUsage = pgTable('ai_usage', {
     id: uuid('id').primaryKey().defaultRandom(),
     userId: text('user_id').notNull(),
     agentType: text('agent_type').notNull(),
     tokensUsed: integer('tokens_used').notNull(),
     cost: integer('cost').notNull(), // in cents
     createdAt: timestamp('created_at').defaultNow(),
   });

   export const trackUsage = async (
     userId: string,
     agentType: string,
     tokensUsed: number
   ) => {
     const costPerToken = 0.00001; // Adjust based on provider
     const cost = Math.ceil(tokensUsed * costPerToken * 100); // in cents

     await db.insert(aiUsage).values({
       userId,
       agentType,
       tokensUsed,
       cost,
     });
   };
   ```

### Phase 6: Testing & Validation (30 mins)

1. **Update tests to use real provider**
   ```typescript
   // src/features/agents/__tests__/chat.test.ts
   import { describe, it, expect, vi } from 'vitest';
   import { POST } from '@/app/api/agents/chat/route';

   describe('Agent Chat API', () => {
     it('should return streaming response', async () => {
       const request = new Request('http://localhost/api/agents/chat', {
         method: 'POST',
         body: JSON.stringify({
           agentType: 'dawn',
           messages: [{ role: 'user', content: 'Hello' }],
         }),
       });

       const response = await POST(request);

       expect(response.status).toBe(200);
       expect(response.headers.get('content-type')).toContain('text/plain');
     });

     it('should enforce rate limiting', async () => {
       // Make 11 requests (limit is 10)
       const requests = Array.from({ length: 11 }, (_, i) =>
         POST(
           new Request('http://localhost/api/agents/chat', {
             method: 'POST',
             body: JSON.stringify({
               agentType: 'dawn',
               messages: [{ role: 'user', content: `Message ${i}` }],
             }),
           })
         )
       );

       const responses = await Promise.all(requests);
       const rateLimited = responses.filter((r) => r.status === 429);

       expect(rateLimited.length).toBeGreaterThan(0);
     });
   });
   ```

## Scripts to Add

```json
{
  "scripts": {
    "ai:test": "tsx scripts/test-ai-connection.ts",
    "ai:usage": "tsx scripts/check-ai-usage.ts",
    "ai:cost": "tsx scripts/calculate-ai-costs.ts"
  }
}
```

## Cost Estimation

**Anthropic Claude Pricing (approximate)**:
- Claude 3.5 Sonnet: $3 per million input tokens, $15 per million output tokens
- Average chat: 500 input tokens, 300 output tokens
- Cost per chat: ~$0.006
- 1,000 chats/month: ~$6

**OpenAI GPT-4 Pricing (approximate)**:
- GPT-4 Turbo: $10 per million input tokens, $30 per million output tokens
- Average chat: 500 input tokens, 300 output tokens
- Cost per chat: ~$0.014
- 1,000 chats/month: ~$14

## Deliverables

1. ✅ AI provider integration working
2. ✅ Agent personality prompts implemented
3. ✅ Streaming chat functional
4. ✅ Conversation memory persisted
5. ✅ Rate limiting active
6. ✅ Token usage tracked
7. ✅ Tests passing
8. ✅ Documentation complete

## Validation Steps

1. Start chat with each agent (Dawn, Atlas, Luna)
2. Verify personality matches prompt
3. Send multiple messages, check streaming works
4. Reload page, verify conversation persists
5. Test rate limiting (make 11 requests quickly)
6. Check database for token usage records
7. Review costs in provider dashboard

## Notes

- Start with development API keys
- Monitor costs closely in production
- Consider implementing budget alerts
- Cache common responses to reduce costs
- Implement fallback to mock for development
