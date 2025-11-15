# Life OS - Technical Architecture Document

---

## 🏗️ System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  ┌─────────────────────────────────────────────┐    │
│  │   Next.js 15 App (React + TypeScript)       │    │
│  │   - App Router & Server Components          │    │
│  │   - shadcn/ui Components                    │    │
│  │   - Anime.js Animations                     │    │
│  │   - Zustand State Management                │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│                   API Layer                          │
│  ┌─────────────────────────────────────────────┐    │
│  │   Next.js 15 API Routes                     │    │
│  │   - Vercel AI SDK Integration               │    │
│  │   - Authentication Middleware               │    │
│  │   - Rate Limiting                           │    │
│  │   - Streaming Responses                     │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│                 Service Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  AI Agents   │  │ Task Service │  │  Journal  │  │
│  │ (Vercel SDK) │  │   (CRUD)     │  │  Service  │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │    S3     │  │
│  │ (Drizzle ORM)│  │   (Cache)    │  │  (Files)  │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
life-os/
├── src/
│   ├── app/                    # Next.js 15 App Directory
│   │   ├── (auth)/             # Auth group routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   ├── page.tsx        # Home/Welcome
│   │   │   ├── tasks/
│   │   │   ├── journal/
│   │   │   └── settings/
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── tasks/
│   │   │   ├── journal/
│   │   │   └── agents/
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React Components
│   │   ├── agents/            # AI Agent components
│   │   │   ├── dawn.tsx
│   │   │   ├── atlas.tsx
│   │   │   └── luna.tsx
│   │   ├── animations/        # Animation components
│   │   │   ├── fire-effect.tsx
│   │   │   ├── pixel-transition.tsx
│   │   │   └── xp-counter.tsx
│   │   ├── rooms/             # Productivity house rooms
│   │   │   ├── productivity-house.tsx
│   │   │   ├── task-room.tsx
│   │   │   └── journal-room.tsx
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (other shadcn components)
│   │   └── layouts/           # Layout components
│   │
│   ├── lib/                   # Libraries and utilities
│   │   ├── animations/        # Anime.js configurations
│   │   │   ├── presets.ts
│   │   │   └── effects.ts
│   │   ├── agents/            # Agent logic with Vercel AI SDK
│   │   │   ├── agent-manager.ts
│   │   │   ├── personalities.ts
│   │   │   └── ai-client.ts
│   │   ├── api/               # API client
│   │   ├── auth/              # Auth utilities
│   │   ├── db/                # Drizzle ORM
│   │   │   ├── schema.ts      # Database schema
│   │   │   ├── index.ts       # DB connection
│   │   │   └── migrations/
│   │   └── utils/             # Helper functions
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-agent.ts
│   │   ├── use-animation.ts
│   │   ├── use-game-state.ts
│   │   └── use-chat.ts        # Vercel AI SDK chat hook
│   │
│   ├── stores/                # Zustand stores
│   │   ├── user-store.ts
│   │   ├── task-store.ts
│   │   ├── game-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/                 # TypeScript types
│   │   ├── agent.types.ts
│   │   ├── game.types.ts
│   │   └── api.types.ts
│   │
│   └── styles/                # Global styles
│       ├── globals.css
│       ├── animations.css
│       └── pixels.css
│
├── drizzle/                   # Drizzle ORM
│   ├── migrations/
│   └── drizzle.config.ts
│
├── public/                    # Static assets
│   ├── sprites/              # Pixel art sprites
│   ├── sounds/               # Sound effects
│   └── fonts/                # Pixel fonts
│
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── config/                    # Configuration files
    ├── anime.config.ts
    └── agents.config.ts
```

---

## 🎯 Component Architecture

### Component Hierarchy
```typescript
// Root Component Structure
<App>
  <AuthProvider>
    <GameStateProvider>
      <AnimationProvider>
        <Layout>
          <AgentManager>
            <ProductivityHouse>
              <Room>
                <Agent />
                <AnimatedContent />
              </Room>
            </ProductivityHouse>
          </AgentManager>
        </Layout>
      </AnimationProvider>
    </GameStateProvider>
  </AuthProvider>
</App>
```

### Key Component Specifications

#### 1. Agent Manager Component
```typescript
// components/agents/AgentManager.tsx
interface AgentManagerProps {
  children: React.ReactNode;
}

export const AgentManager: React.FC<AgentManagerProps> = ({ children }) => {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [agentQueue, setAgentQueue] = useState<AgentAction[]>([]);
  
  useEffect(() => {
    // Initialize WebSocket for real-time agent updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    ws.onmessage = (event) => {
      const action: AgentAction = JSON.parse(event.data);
      handleAgentAction(action);
    };
    
    return () => ws.close();
  }, []);
  
  const handleAgentAction = (action: AgentAction) => {
    // Process agent actions and trigger animations
    switch(action.type) {
      case 'GREETING':
        triggerGreetingAnimation(action.payload);
        break;
      case 'SUGGESTION':
        displaySuggestion(action.payload);
        break;
      case 'CELEBRATION':
        triggerCelebration(action.payload);
        break;
    }
  };
  
  return (
    <AgentContext.Provider value={{ activeAgent, setActiveAgent }}>
      {children}
      {activeAgent && <AgentOverlay agent={activeAgent} />}
    </AgentContext.Provider>
  );
};
```

#### 2. Animation Controller
```typescript
// lib/animations/AnimationController.ts
import anime from 'animejs';

class AnimationController {
  private activeAnimations: Map<string, anime.AnimeInstance> = new Map();
  
  // Entrance animations
  agentEntrance(element: HTMLElement): anime.AnimeInstance {
    return anime({
      targets: element,
      scale: [0, 1],
      rotate: '1turn',
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutElastic(1, 0.5)'
    });
  }
  
  // Task completion celebration
  taskComplete(element: HTMLElement): anime.AnimeInstance {
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 1000
    });
    
    timeline
      .add({
        targets: element,
        scale: [1, 1.2],
        duration: 200
      })
      .add({
        targets: element,
        translateY: -50,
        opacity: [1, 0],
        duration: 800,
        complete: () => this.spawnParticles(element)
      });
    
    return timeline;
  }
  
  // XP gain animation
  xpGain(from: number, to: number, element: HTMLElement): void {
    anime({
      targets: { value: from },
      value: to,
      duration: 1500,
      easing: 'easeInOutQuad',
      round: 1,
      update: function(anim) {
        element.innerHTML = Math.floor(anim.animations[0].currentValue);
      }
    });
  }
  
  // Room transition
  roomTransition(fromRoom: string, toRoom: string): Promise<void> {
    return new Promise((resolve) => {
      const timeline = anime.timeline({
        easing: 'easeInOutQuad',
        complete: resolve
      });
      
      timeline
        .add({
          targets: `.room-${fromRoom}`,
          scale: 0.9,
          opacity: 0,
          duration: 400
        })
        .add({
          targets: `.room-${toRoom}`,
          scale: [1.1, 1],
          opacity: [0, 1],
          duration: 600,
          offset: '-=200'
        });
    });
  }
  
  private spawnParticles(origin: HTMLElement): void {
    // Create and animate particle effects
    const particles = Array.from({ length: 20 }, () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      origin.appendChild(particle);
      return particle;
    });
    
    anime({
      targets: particles,
      translateX: () => anime.random(-100, 100),
      translateY: () => anime.random(-100, 100),
      scale: [1, 0],
      opacity: [1, 0],
      duration: 1000,
      easing: 'easeOutCirc',
      complete: () => particles.forEach(p => p.remove())
    });
  }
}

export const animationController = new AnimationController();
```

---

## 🔄 State Management

### Zustand Store Implementation

#### User Store
```typescript
// stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  preferences: UserPreferences;
  setUser: (user: User) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: {
        theme: 'dark',
        animations: true,
        soundEffects: true,
        agentPersonality: 'friendly'
      },
      setUser: (user) => set({ user }),
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs }
        })),
      logout: () => set({ user: null })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, preferences: state.preferences })
    }
  )
);
```

#### Game State Store
```typescript
// stores/gameStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameState {
  level: number;
  xp: number;
  streak: number;
  achievements: Achievement[];
  unlockedFeatures: string[];
  
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  unlockAchievement: (id: string) => void;
  checkLevelUp: () => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    level: 1,
    xp: 0,
    streak: 0,
    achievements: [],
    unlockedFeatures: [],
    
    addXP: (amount) => {
      set((state) => ({ xp: state.xp + amount }));
      get().checkLevelUp();
    },
    
    incrementStreak: () => {
      set((state) => ({ streak: state.streak + 1 }));
      // Check streak achievements
      const streakMilestones = [7, 30, 100];
      const currentStreak = get().streak;
      if (streakMilestones.includes(currentStreak)) {
        get().unlockAchievement(`streak-${currentStreak}`);
      }
    },
    
    unlockAchievement: (id) => {
      const achievement = achievementDatabase.find(a => a.id === id);
      if (achievement && !get().achievements.find(a => a.id === id)) {
        set((state) => ({
          achievements: [...state.achievements, achievement]
        }));
        // Trigger celebration animation
        animationController.celebrate(achievement.rarity);
      }
    },
    
    checkLevelUp: () => {
      const { xp, level } = get();
      const nextLevelXP = calculateXPForLevel(level + 1);
      if (xp >= nextLevelXP) {
        set({ level: level + 1 });
        // Unlock new features
        const newFeatures = featuresPerLevel[level + 1] || [];
        set((state) => ({
          unlockedFeatures: [...state.unlockedFeatures, ...newFeatures]
        }));
      }
    }
  }))
);

// Subscribe to XP changes for animations
useGameStore.subscribe(
  (state) => state.xp,
  (xp) => {
    animationController.xpGain(previousXP, xp, xpElement);
  }
);
```

---

## 🤖 AI Agent System Implementation

### Agent Core Architecture with Vercel AI SDK
```typescript
// lib/agents/agent-core.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { CoreMessage, streamText, generateText, tool } from 'ai';
import { z } from 'zod';

export abstract class AgentCore {
  protected id: string;
  protected name: string;
  protected personality: PersonalityTraits;
  protected context: UserContext;
  protected memory: AgentMemory;
  protected model: any;
  
  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.personality = config.personality;
    this.memory = new AgentMemory(config.id);
    
    // Choose model based on agent needs
    this.model = config.useAnthropic 
      ? anthropic('claude-3-opus-20240229')
      : openai('gpt-4-turbo');
  }
  
  abstract async processInput(input: UserInput): Promise<AgentResponse>;
  abstract async generateSuggestion(context: UserContext): Promise<Suggestion>;
  
  // Streaming response for real-time chat
  protected async streamResponse(prompt: string, onChunk?: (text: string) => void) {
    const messages: CoreMessage[] = [
      { role: 'system', content: this.getSystemPrompt() },
      { role: 'user', content: prompt }
    ];
    
    const result = await streamText({
      model: this.model,
      messages,
      temperature: this.personality.creativity || 0.7,
      maxTokens: 1000,
      onChunk: async ({ chunk }) => {
        if (onChunk && chunk.type === 'text') {
          onChunk(chunk.text);
        }
      },
      onFinish: ({ text, usage }) => {
        this.memory.addInteraction({ prompt, response: text });
      }
    });
    
    return result;
  }
  
  // Tools for agent actions
  protected getAgentTools() {
    return {
      createTask: tool({
        description: 'Create a new task for the user',
        parameters: z.object({
          title: z.string(),
          priority: z.enum(['low', 'medium', 'high']),
          dueDate: z.string().optional()
        }),
        execute: async ({ title, priority, dueDate }) => {
          // Create task in database
          return { success: true, taskId: 'new-task-id' };
        }
      }),
      
      suggestJournalPrompt: tool({
        description: 'Suggest a journaling prompt',
        parameters: z.object({
          mood: z.string(),
          context: z.string()
        }),
        execute: async ({ mood, context }) => {
          return { prompt: this.generatePromptForMood(mood, context) };
        }
      })
    };
  }
  
  protected getSystemPrompt(): string {
    return `You are ${this.name}, a helpful AI agent with these traits: ${this.personality.traits.join(', ')}.
    Your style: ${this.personality.style}.
    Use emoticons and maintain a pixelated game aesthetic in responses.
    Current time: ${new Date().toLocaleTimeString()}`;
  }
}
```

### Dawn Agent Implementation
```typescript
// lib/agents/dawn-agent.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export class DawnAgent extends AgentCore {
  constructor() {
    super({
      id: 'dawn',
      name: 'Dawn',
      personality: {
        traits: ['energetic', 'encouraging', 'insightful'],
        style: 'warm and motivational',
        creativity: 0.8
      }
    });
  }
  
  async generateMorningBriefing(userId: string) {
    const tasks = await this.fetchTodaysTasks(userId);
    const context = await this.analyzeContext();
    
    const prompt = `
      As Dawn, the energetic morning companion, create a personalized morning briefing.
      User has ${tasks.length} tasks today.
      Time: ${context.timeOfDay}
      
      Include:
      1. Warm greeting with emoticons
      2. Top 3 priorities
      3. Motivational insight
      Keep it energetic and encouraging!
    `;
    
    return await this.streamResponse(prompt);
  }
  
  async processInput(input: UserInput): Promise<AgentResponse> {
    const emotionalState = this.detectEmotion(input.text);
    
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: input.text }
      ],
      tools: this.getAgentTools(),
    });
    
    return {
      text: result.text,
      animation: this.selectAnimation(emotionalState),
      suggestions: await this.generateQuickActions(input.context)
    };
  }
}
```

## 💾 Database Schema with Drizzle ORM

### Drizzle Configuration
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### Database Schema Definition
```typescript
// src/lib/db/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
export const moodEnum = pgEnum('mood', ['happy', 'sad', 'stressed', 'excited', 'calm', 'tired']);
export const achievementRarityEnum = pgEnum('achievement_rarity', ['common', 'rare', 'epic', 'legendary']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Game data
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  
  // Preferences
  preferences: jsonb('preferences').$type<UserPreferences>().default({
    theme: 'dark',
    animations: true,
    soundEffects: true,
    agentPersonality: 'friendly'
  }),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('medium').notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  dueDate: timestamp('due_date'),
  xpReward: integer('xp_reward').default(10).notNull(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // AI suggestions
  aiGenerated: boolean('ai_generated').default(false),
  agentId: text('agent_id'),
});

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  mood: moodEnum('mood'),
  wordCount: integer('word_count').notNull(),
  
  // AI analysis
  sentiment: jsonb('sentiment').$type<SentimentAnalysis>(),
  themes: jsonb('themes').$type<string[]>(),
  insights: text('insights'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Achievements table
export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  rarity: achievementRarityEnum('rarity').notNull(),
  xpReward: integer('xp_reward').notNull(),
  unlockedFeature: text('unlocked_feature'),
});

// User achievements junction table
export const userAchievements = pgTable('user_achievements', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// Agent interactions table
export const agentInteractions = pgTable('agent_interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  agentId: text('agent_id').notNull(),
  input: text('input').notNull(),
  response: text('response').notNull(),
  context: jsonb('context').$type<InteractionContext>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  journalEntries: many(journalEntries),
  achievements: many(userAchievements),
  agentInteractions: many(agentInteractions),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

### Database Connection
```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

// Utility functions
export async function getUserWithStats(userId: string) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
    with: {
      tasks: {
        where: (tasks, { eq }) => eq(tasks.completed, true),
        limit: 10,
      },
      achievements: true,
    },
  });
}
```
    
    return {
      text: response,
      animation: this.selectAnimation(emotionalState),
      suggestions: await this.generateQuickActions(context)
    };
  }
  
  async generateMorningBriefing(): Promise<MorningBriefing> {
    const tasks = await this.fetchTodaysTasks();
    const calendar = await this.fetchCalendarEvents();
    const weather = await this.fetchWeather();
    
    const prompt = `
      Generate a personalized morning briefing:
      Tasks: ${JSON.stringify(tasks)}
      Events: ${JSON.stringify(calendar)}
      Weather: ${weather}
      
      Create an energizing message that highlights:
      1. Top 3 priorities
      2. Potential challenges
      3. Motivational insight
    `;
    
    const briefing = await this.callLLM(prompt);
    
    return {
      message: briefing,
      priorities: this.extractPriorities(tasks),
      mood: 'energetic',
      animation: 'sunrise-entrance'
    };
  }
  
  private selectAnimation(emotion: string): string {
    const animationMap = {
      happy: 'bounce-joy',
      sad: 'gentle-wave',
      stressed: 'calming-pulse',
      excited: 'sparkle-burst',
      neutral: 'soft-glow'
    };
    
    return animationMap[emotion] || 'default-entrance';
  }
}
```

---

## 🔒 Security Implementation

### Authentication Flow
```typescript
// lib/auth/AuthManager.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.gameData = await fetchGameData(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.gameData = token.gameData;
      }
      return session;
    }
  }
};
```

### API Protection Middleware
```typescript
// middleware/apiProtection.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "./rateLimit";

export async function apiMiddleware(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimit(req);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  
  // Authentication check
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Add user context to request
  req.headers.set("x-user-id", token.id);
  req.headers.set("x-user-level", token.gameData.level);
  
  return NextResponse.next();
}
```

---

## 🚀 Deployment Architecture

### Infrastructure Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=lifeos
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📊 Performance Optimization

### Optimization Strategies
```typescript
// Next.js configuration for optimal performance
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1200, 1920],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable SWC minification
  swcMinify: true,
  // Optimize bundle splitting
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    };
    return config;
  }
};
```

### Animation Performance
```typescript
// Use CSS transforms for better performance
const optimizedAnimation = {
  // Good - uses transform
  transform: 'translateX(100px)',
  
  // Avoid - causes reflow
  left: '100px'
};

// Batch DOM updates
const batchUpdate = () => {
  requestAnimationFrame(() => {
    // All DOM updates here
    elements.forEach(el => {
      el.style.transform = 'translateY(10px)';
    });
  });
};

// Use will-change for critical animations
.critical-animation {
  will-change: transform, opacity;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// __tests__/agents/DawnAgent.test.ts
import { DawnAgent } from '@/lib/agents/DawnAgent';

describe('DawnAgent', () => {
  let agent: DawnAgent;
  
  beforeEach(() => {
    agent = new DawnAgent();
  });
  
  test('generates morning briefing', async () => {
    const briefing = await agent.generateMorningBriefing();
    expect(briefing).toHaveProperty('message');
    expect(briefing.priorities).toHaveLength(3);
    expect(briefing.animation).toBe('sunrise-entrance');
  });
  
  test('detects user emotion correctly', () => {
    const emotion = agent.detectEmotion('I am feeling stressed');
    expect(emotion).toBe('stressed');
  });
});
```

### Integration Tests
```typescript
// __tests__/api/tasks.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/tasks/route';

describe('/api/tasks', () => {
  test('creates new task with XP reward', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Complete project',
        priority: 'high'
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(201);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData).toHaveProperty('xpReward');
    expect(jsonData.xpReward).toBeGreaterThan(0);
  });
});
```

---

*Document Version: 1.0*
*Last Updated: November 2024*