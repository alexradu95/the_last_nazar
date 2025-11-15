# Life OS - Modular Implementation Plan
## Designed for Parallel AI Agent Development

---

## 📋 Overview

This plan breaks down the Life OS project into **independent, self-contained modules** that can be developed in parallel by multiple AI agents. Each module has clear interfaces, minimal dependencies, and well-defined contracts.

---

## 🎯 Development Principles

1. **Module Independence**: Each module should be developable without deep knowledge of others
2. **Clear Interfaces**: Well-defined TypeScript interfaces for all module boundaries
3. **Mock-First Development**: Use mocks for dependencies to enable parallel work
4. **Contract-Driven**: Define API contracts before implementation
5. **Test Coverage**: Each module must include unit tests
6. **Documentation**: Every module has its own README

---

## 📦 Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                     Foundation Layer                         │
│  [1] Types & Interfaces  [2] Database Schema  [3] Utils     │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                      Core Services Layer                     │
│  [4] Animation     [5] Database     [6] AI Agent Core       │
│  [7] Auth Service  [8] Game Engine                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  [9] Task Service  [10] Journal Service  [11] User Service  │
│  [12] Dawn Agent   [13] Atlas Agent      [14] Luna Agent    │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                       API Layer                              │
│  [15] Task API     [16] Journal API    [17] Agent API       │
│  [18] Auth API     [19] Game API                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                    UI Components Layer                       │
│  [20] UI Library   [21] Agent Components                    │
│  [22] Room Components  [23] Task Components                 │
│  [24] Game Components  [25] Layout Components               │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────────┐
│                      Pages Layer                             │
│  [26] Dashboard    [27] Tasks Page    [28] Journal Page     │
│  [29] Auth Pages   [30] Settings                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Module Specifications

### **MODULE 1: Types & Interfaces**
**Priority**: CRITICAL (Must be completed first)
**Dependencies**: None
**Complexity**: Low
**Estimated Time**: 2-3 hours

#### Deliverables:
- `src/types/index.ts` - Central type definitions
- `src/types/agent.types.ts` - Agent-related types
- `src/types/game.types.ts` - Gamification types
- `src/types/api.types.ts` - API request/response types
- `src/types/database.types.ts` - Database model types

#### Key Types to Define:
```typescript
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  currentStreak: number;
  preferences: UserPreferences;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  personality: PersonalityTraits;
  context: AgentContext;
}

// Task types
export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  xpReward: number;
  completed: boolean;
}

// Game types
export interface GameState {
  level: number;
  xp: number;
  streak: number;
  achievements: Achievement[];
}
```

#### Acceptance Criteria:
- [ ] All core types defined with JSDoc comments
- [ ] No circular dependencies
- [ ] Exported from single index file
- [ ] Type validation utilities included

---

### **MODULE 2: Database Schema (Drizzle ORM)**
**Priority**: CRITICAL
**Dependencies**: Module 1 (Types)
**Complexity**: Medium
**Estimated Time**: 4-5 hours

#### Deliverables:
- `src/lib/db/schema/users.ts` - User schema
- `src/lib/db/schema/tasks.ts` - Task schema
- `src/lib/db/schema/journal.ts` - Journal schema
- `src/lib/db/schema/achievements.ts` - Achievement schema
- `src/lib/db/schema/agent-interactions.ts` - Agent interaction schema
- `drizzle.config.ts` - Drizzle configuration
- `src/lib/db/index.ts` - Database connection

#### Schema Structure:
```typescript
// Example: tasks schema
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('medium'),
  completed: boolean('completed').default(false),
  xpReward: integer('xp_reward').default(10),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});
```

#### Acceptance Criteria:
- [ ] All tables defined with proper relations
- [ ] Indexes created for common queries
- [ ] Migration files generated
- [ ] Seed data script created
- [ ] Type inference working correctly

---

### **MODULE 3: Utility Functions**
**Priority**: HIGH
**Dependencies**: Module 1 (Types)
**Complexity**: Low
**Estimated Time**: 2-3 hours

#### Deliverables:
- `src/lib/utils/index.ts` - General utilities
- `src/lib/utils/date.ts` - Date formatting utilities
- `src/lib/utils/validation.ts` - Zod schemas for validation
- `src/lib/utils/calculations.ts` - XP/level calculations
- `src/lib/utils/formatting.ts` - Text formatting

#### Key Functions:
```typescript
// XP calculations
export function calculateLevel(xp: number): number;
export function calculateXPForLevel(level: number): number;
export function calculateXPReward(task: Task): number;

// Date utilities
export function formatTimeAgo(date: Date): string;
export function isToday(date: Date): boolean;
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening';

// Validation
export const createTaskSchema = z.object({...});
export const createJournalSchema = z.object({...});
```

#### Acceptance Criteria:
- [ ] All utilities have unit tests
- [ ] Validation schemas cover all inputs
- [ ] Functions are pure (no side effects)
- [ ] Performance optimized for frequent use

---

### **MODULE 4: Animation System**
**Priority**: HIGH
**Dependencies**: None (can use mocks)
**Complexity**: Medium
**Estimated Time**: 5-6 hours

#### Deliverables:
- `src/lib/animations/core.ts` - Animation controller
- `src/lib/animations/presets.ts` - Preset animations
- `src/lib/animations/effects.ts` - Special effects
- `src/lib/animations/particles.ts` - Particle system
- `src/hooks/use-animation.ts` - React hook

#### Core Implementation:
```typescript
export class AnimationController {
  agentEntrance(element: HTMLElement, agentType: string): anime.AnimeInstance;
  taskComplete(element: HTMLElement): anime.AnimeInstance;
  xpGain(from: number, to: number, element: HTMLElement): void;
  roomTransition(fromRoom: string, toRoom: string): Promise<void>;
}

export const useAnimation = () => {
  const playAnimation = (type: string, options: AnimationOptions) => {...};
  return { playAnimation, isAnimating };
};
```

#### Acceptance Criteria:
- [ ] All animations from guide implemented
- [ ] Performance optimized (60fps)
- [ ] Mobile-responsive animations
- [ ] Animation queue system implemented
- [ ] Cleanup on component unmount

---

### **MODULE 5: Database Service Layer**
**Priority**: CRITICAL
**Dependencies**: Module 2 (Schema)
**Complexity**: Medium
**Estimated Time**: 4-5 hours

#### Deliverables:
- `src/lib/db/queries/user-queries.ts`
- `src/lib/db/queries/task-queries.ts`
- `src/lib/db/queries/journal-queries.ts`
- `src/lib/db/queries/game-queries.ts`

#### Query Functions:
```typescript
// User queries
export async function getUserById(id: string): Promise<User | null>;
export async function updateUser(id: string, data: Partial<User>): Promise<User>;

// Task queries
export async function getUserTasks(userId: string): Promise<Task[]>;
export async function createTask(data: NewTask): Promise<Task>;
export async function completeTask(taskId: string): Promise<Task>;

// Game queries
export async function addXP(userId: string, amount: number): Promise<GameState>;
export async function getUserAchievements(userId: string): Promise<Achievement[]>;
```

#### Acceptance Criteria:
- [ ] All CRUD operations implemented
- [ ] Transactions used where needed
- [ ] Error handling consistent
- [ ] Performance optimized with indexes
- [ ] Integration tests written

---

### **MODULE 6: AI Agent Core System**
**Priority**: CRITICAL
**Dependencies**: Module 1 (Types)
**Complexity**: High
**Estimated Time**: 6-8 hours

#### Deliverables:
- `src/lib/agents/agent-core.ts` - Base agent class
- `src/lib/agents/personality-engine.ts` - Personality system
- `src/lib/agents/memory-manager.ts` - Agent memory
- `src/lib/agents/context-analyzer.ts` - Context analysis
- `src/lib/agents/response-generator.ts` - Response formatting

#### Core Implementation:
```typescript
export abstract class AgentCore {
  protected id: string;
  protected name: string;
  protected personality: PersonalityTraits;
  protected memory: AgentMemory;

  abstract async processInput(input: UserInput): Promise<AgentResponse>;
  abstract async generateSuggestion(context: UserContext): Promise<Suggestion>;

  protected async streamResponse(prompt: string): Promise<StreamResult>;
  protected getSystemPrompt(): string;
}

export class PersonalityEngine {
  adjustForMood(personality: PersonalityTraits, mood: Mood): PersonalityTraits;
  adjustForTime(personality: PersonalityTraits, hour: number): PersonalityTraits;
}
```

#### Acceptance Criteria:
- [ ] Base agent class fully functional
- [ ] Personality system configurable
- [ ] Memory system stores/retrieves context
- [ ] Streaming responses work correctly
- [ ] Mock LLM provider for testing

---

### **MODULE 7: Authentication Service**
**Priority**: HIGH
**Dependencies**: Module 2 (Schema), Module 5 (Database)
**Complexity**: Medium
**Estimated Time**: 4-5 hours

#### Deliverables:
- `src/lib/auth/auth-config.ts` - NextAuth configuration
- `src/lib/auth/auth-utils.ts` - Auth helper functions
- `src/middleware.ts` - Auth middleware

#### Implementation:
```typescript
// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({...}),
    CredentialsProvider({...}),
  ],
  callbacks: {
    async jwt({ token, user }) {...},
    async session({ session, token }) {...},
  },
};

// Middleware
export async function requireAuth(req: NextRequest): Promise<User | null>;
export function withAuth(handler: RouteHandler): RouteHandler;
```

#### Acceptance Criteria:
- [ ] Google OAuth working
- [ ] Email/password auth working
- [ ] Session management implemented
- [ ] Protected routes functional
- [ ] CSRF protection enabled

---

### **MODULE 8: Game Engine**
**Priority**: HIGH
**Dependencies**: Module 1 (Types), Module 3 (Utils)
**Complexity**: Medium
**Estimated Time**: 5-6 hours

#### Deliverables:
- `src/lib/game/level-system.ts` - Level calculations
- `src/lib/game/achievement-engine.ts` - Achievement tracking
- `src/lib/game/streak-manager.ts` - Streak tracking
- `src/lib/game/reward-calculator.ts` - XP rewards
- `src/stores/game-store.ts` - Zustand store

#### Implementation:
```typescript
export class LevelSystem {
  calculateLevel(xp: number): number;
  calculateNextLevelXP(level: number): number;
  checkLevelUp(currentXP: number, currentLevel: number): boolean;
}

export class AchievementEngine {
  checkAchievements(userId: string, action: UserAction): Achievement[];
  unlockAchievement(userId: string, achievementId: string): Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  level: 1,
  xp: 0,
  addXP: (amount) => {...},
  checkLevelUp: () => {...},
}));
```

#### Acceptance Criteria:
- [ ] XP calculations accurate
- [ ] Achievement detection working
- [ ] Streak tracking reliable
- [ ] Store persists to localStorage
- [ ] Animations trigger on events

---

### **MODULE 9: Task Service**
**Priority**: HIGH
**Dependencies**: Module 5 (Database), Module 8 (Game Engine)
**Complexity**: Medium
**Estimated Time**: 4-5 hours

#### Deliverables:
- `src/lib/services/task-service.ts` - Task business logic
- `src/lib/services/task-analytics.ts` - Task analytics
- `src/stores/task-store.ts` - Zustand store

#### Implementation:
```typescript
export class TaskService {
  async createTask(data: NewTaskInput): Promise<Task>;
  async completeTask(taskId: string): Promise<TaskCompletionResult>;
  async getUserTasks(userId: string, filters?: TaskFilters): Promise<Task[]>;
  async suggestTaskBreakdown(taskId: string): Promise<Task[]>;
  calculateTaskXP(task: Task): number;
}

export interface TaskCompletionResult {
  task: Task;
  xpEarned: number;
  levelUp: boolean;
  achievementsUnlocked: Achievement[];
}
```

#### Acceptance Criteria:
- [ ] CRUD operations working
- [ ] XP rewards calculated correctly
- [ ] Task breakdown suggestions implemented
- [ ] Analytics tracking events
- [ ] Optimistic updates in store

---

### **MODULE 10: Journal Service**
**Priority**: MEDIUM
**Dependencies**: Module 5 (Database), Module 6 (AI Core)
**Complexity**: Medium
**Estimated Time**: 4-5 hours

#### Deliverables:
- `src/lib/services/journal-service.ts` - Journal business logic
- `src/lib/services/sentiment-analyzer.ts` - Sentiment analysis
- `src/stores/journal-store.ts` - Zustand store

#### Implementation:
```typescript
export class JournalService {
  async createEntry(data: NewJournalInput): Promise<JournalEntry>;
  async analyzeSentiment(content: string): Promise<SentimentAnalysis>;
  async generateInsights(userId: string): Promise<Insight[]>;
  async getUserEntries(userId: string): Promise<JournalEntry[]>;
}

export interface SentimentAnalysis {
  mood: MoodType;
  emotions: Emotion[];
  themes: string[];
  confidence: number;
}
```

#### Acceptance Criteria:
- [ ] Entry CRUD operations working
- [ ] Sentiment analysis functional
- [ ] Insights generated accurately
- [ ] Word count tracked
- [ ] Writing streak calculated

---

### **MODULE 11: User Service**
**Priority**: HIGH
**Dependencies**: Module 5 (Database)
**Complexity**: Low-Medium
**Estimated Time**: 3-4 hours

#### Deliverables:
- `src/lib/services/user-service.ts` - User business logic
- `src/stores/user-store.ts` - Zustand store

#### Implementation:
```typescript
export class UserService {
  async getUserProfile(userId: string): Promise<UserProfile>;
  async updateProfile(userId: string, data: ProfileUpdate): Promise<User>;
  async updatePreferences(userId: string, prefs: Preferences): Promise<User>;
  async getUserStats(userId: string): Promise<UserStats>;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  journalEntries: number;
}
```

#### Acceptance Criteria:
- [ ] Profile management working
- [ ] Preferences persisted
- [ ] Stats calculated correctly
- [ ] Data validation on updates

---

### **MODULE 12-14: Agent Implementations**

Each agent (Dawn, Atlas, Luna) is a separate module:

#### **MODULE 12: Dawn Agent**
**Priority**: HIGH
**Dependencies**: Module 6 (AI Core)
**Complexity**: Medium-High
**Estimated Time**: 5-6 hours

#### **MODULE 13: Atlas Agent**
**Priority**: HIGH
**Dependencies**: Module 6 (AI Core), Module 9 (Task Service)
**Complexity**: Medium-High
**Estimated Time**: 5-6 hours

#### **MODULE 14: Luna Agent**
**Priority**: MEDIUM
**Dependencies**: Module 6 (AI Core), Module 10 (Journal Service)
**Complexity**: Medium-High
**Estimated Time**: 5-6 hours

#### Shared Deliverables Per Agent:
```
src/lib/agents/
  ├── dawn-agent.ts
  ├── atlas-agent.ts
  └── luna-agent.ts
```

#### Implementation Template:
```typescript
export class DawnAgent extends AgentCore {
  constructor() {
    super({
      id: 'dawn',
      name: 'Dawn',
      personality: { traits: ['energetic', 'encouraging'], ... }
    });
  }

  async generateMorningBriefing(userId: string): Promise<Briefing>;
  async processMoodCheck(mood: Mood): Promise<AgentResponse>;
  async suggestDailyPriorities(tasks: Task[]): Promise<Suggestion[]>;
}
```

#### Acceptance Criteria (per agent):
- [ ] Extends AgentCore correctly
- [ ] Personality configuration matches spec
- [ ] All specific methods implemented
- [ ] Streaming responses working
- [ ] Memory persistence functional

---

### **MODULE 15-19: API Routes**

Each API area is a separate module:

#### Shared Structure:
```
src/app/api/
  ├── tasks/
  │   ├── route.ts (GET, POST)
  │   └── [id]/route.ts (GET, PATCH, DELETE)
  ├── journal/
  ├── agents/
  ├── auth/
  └── game/
```

#### Implementation Template:
```typescript
// app/api/tasks/route.ts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const tasks = await taskService.getUserTasks(session.user.id);
  return Response.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const validated = createTaskSchema.parse(body);
  const task = await taskService.createTask({
    ...validated,
    userId: session.user.id
  });

  return Response.json(task, { status: 201 });
}
```

#### Acceptance Criteria (per API):
- [ ] All routes implemented
- [ ] Authentication enforced
- [ ] Input validation working
- [ ] Error handling consistent
- [ ] API documented with examples

---

### **MODULE 20: UI Component Library (shadcn/ui Setup)**
**Priority**: HIGH
**Dependencies**: None
**Complexity**: Low-Medium
**Estimated Time**: 3-4 hours

#### Deliverables:
- `components/ui/` - All shadcn components
- `lib/utils.ts` - cn() helper
- `tailwind.config.ts` - Theme configuration
- `app/globals.css` - Global styles

#### Components to Add:
```bash
npx shadcn@latest add button card badge dialog toast avatar
npx shadcn@latest add tabs checkbox progress input textarea
npx shadcn@latest add dropdown-menu select separator
```

#### Custom Theme:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        pixel: { purple: '#6B46C1', blue: '#3B82F6', ... },
        xp: { gold: '#FFD700', silver: '#C0C0C0', ... },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
};
```

#### Acceptance Criteria:
- [ ] All components installed
- [ ] Theme customized for pixel aesthetic
- [ ] Dark mode working
- [ ] Animations integrated
- [ ] Component demos created

---

### **MODULE 21: Agent UI Components**
**Priority**: HIGH
**Dependencies**: Module 4 (Animation), Module 20 (UI Library)
**Complexity**: Medium-High
**Estimated Time**: 6-7 hours

#### Deliverables:
```
src/components/agents/
  ├── agent-manager.tsx
  ├── dawn-card.tsx
  ├── atlas-card.tsx
  ├── luna-card.tsx
  ├── agent-chat-interface.tsx
  └── agent-avatar.tsx
```

#### Implementation:
```typescript
export function DawnCard() {
  const { messages, input, handleSubmit } = useChat({ api: '/api/agents/dawn' });
  const { playAnimation } = useAnimation();

  useEffect(() => {
    playAnimation('dawn-entrance');
  }, []);

  return (
    <Card className="dawn-agent">
      <AgentAvatar agent="dawn" />
      <ChatInterface messages={messages} onSubmit={handleSubmit} />
    </Card>
  );
}
```

#### Acceptance Criteria:
- [ ] All agent cards functional
- [ ] Entrance animations working
- [ ] Chat interface responsive
- [ ] Personality reflected in UI
- [ ] Real-time streaming display

---

### **MODULE 22: Room Components**
**Priority**: HIGH
**Dependencies**: Module 4 (Animation), Module 20 (UI Library)
**Complexity**: Medium
**Estimated Time**: 5-6 hours

#### Deliverables:
```
src/components/rooms/
  ├── productivity-house.tsx
  ├── room-card.tsx
  ├── room-transition.tsx
  └── room-layout.tsx
```

#### Implementation:
```typescript
export function ProductivityHouse() {
  const [selectedRoom, setSelectedRoom] = useState('work');
  const { playAnimation } = useAnimation();

  const handleRoomClick = async (roomId: string) => {
    await playAnimation('room-transition', { from: selectedRoom, to: roomId });
    setSelectedRoom(roomId);
  };

  return (
    <div className="productivity-house">
      <div className="rooms-grid">
        {rooms.map(room => (
          <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
        ))}
      </div>
    </div>
  );
}
```

#### Acceptance Criteria:
- [ ] All rooms render correctly
- [ ] Transitions smooth
- [ ] Hover effects working
- [ ] Task counts displayed
- [ ] Responsive layout

---

### **MODULE 23: Task Components**
**Priority**: HIGH
**Dependencies**: Module 4 (Animation), Module 20 (UI Library)
**Complexity**: Medium
**Estimated Time**: 5-6 hours

#### Deliverables:
```
src/components/tasks/
  ├── task-card.tsx
  ├── task-list.tsx
  ├── task-form.tsx
  ├── task-filters.tsx
  └── task-completion-animation.tsx
```

#### Implementation:
```typescript
export function TaskCard({ task, onComplete }: TaskCardProps) {
  const { playAnimation } = useAnimation();
  const { addXP } = useGameStore();

  const handleComplete = async () => {
    await playAnimation('task-complete', { element: cardRef.current });
    await onComplete(task.id);
    addXP(task.xpReward);
  };

  return (
    <Card ref={cardRef}>
      <Checkbox checked={task.completed} onCheckedChange={handleComplete} />
      <div className="task-content">
        <h4>{task.title}</h4>
        <Badge>+{task.xpReward} XP</Badge>
      </div>
    </Card>
  );
}
```

#### Acceptance Criteria:
- [ ] Task CRUD operations working
- [ ] Completion animations smooth
- [ ] Filtering functional
- [ ] XP rewards displayed
- [ ] Drag & drop working

---

### **MODULE 24: Game Components**
**Priority**: MEDIUM
**Dependencies**: Module 4 (Animation), Module 20 (UI Library)
**Complexity**: Medium
**Estimated Time**: 4-5 hours

#### Deliverables:
```
src/components/game/
  ├── xp-counter.tsx
  ├── level-display.tsx
  ├── streak-tracker.tsx
  ├── achievement-notification.tsx
  └── progress-bar.tsx
```

#### Implementation:
```typescript
export function XPCounter() {
  const { xp, level, nextLevelXP } = useGameStore();
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    animateCounter(counterRef.current, prevXP, xp);
  }, [xp]);

  return (
    <Card>
      <div className="xp-display">
        <Trophy /> Level {level}
        <span ref={counterRef}>{xp}</span> / {nextLevelXP} XP
      </div>
      <Progress value={(xp / nextLevelXP) * 100} />
    </Card>
  );
}
```

#### Acceptance Criteria:
- [ ] XP counter animates smoothly
- [ ] Level up celebrations work
- [ ] Streak fire effect functional
- [ ] Achievement popups appear
- [ ] Progress bars accurate

---

### **MODULE 25: Layout Components**
**Priority**: MEDIUM
**Dependencies**: Module 20 (UI Library)
**Complexity**: Low-Medium
**Estimated Time**: 3-4 hours

#### Deliverables:
```
src/components/layouts/
  ├── dashboard-layout.tsx
  ├── navbar.tsx
  ├── sidebar.tsx
  └── footer.tsx
```

#### Implementation:
```typescript
export function DashboardLayout({ children }: LayoutProps) {
  const { user } = useUserStore();

  return (
    <div className="dashboard-layout">
      <Navbar user={user} />
      <div className="content-area">
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

#### Acceptance Criteria:
- [ ] Responsive layout working
- [ ] Navigation functional
- [ ] User menu operational
- [ ] Mobile menu working

---

### **MODULE 26-30: Pages**

Each page is a separate module combining all components:

#### **MODULE 26: Dashboard Page**
```typescript
// app/(dashboard)/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession();
  const user = await getUserById(session.user.id);

  return (
    <>
      <DawnCard />
      <ProductivityHouse />
      <XPCounter />
    </>
  );
}
```

#### **MODULE 27: Tasks Page**
#### **MODULE 28: Journal Page**
#### **MODULE 29: Auth Pages**
#### **MODULE 30: Settings Page**

---

## 🔄 Development Workflow

### Phase 1: Foundation (Week 1)
**Parallel Development Groups:**

**Group A (Foundation):**
- Agent 1: Module 1 (Types)
- Agent 2: Module 3 (Utils)
- Agent 3: Module 20 (UI Library)

**Group B (Database):**
- Agent 4: Module 2 (Database Schema)
- Agent 5: Module 5 (Database Service)

**Completion Criteria:** All foundation modules passing tests

---

### Phase 2: Core Systems (Week 2)
**Parallel Development Groups:**

**Group A (Core Services):**
- Agent 1: Module 4 (Animation)
- Agent 2: Module 6 (AI Agent Core)
- Agent 3: Module 7 (Auth Service)

**Group B (Business Logic):**
- Agent 4: Module 8 (Game Engine)
- Agent 5: Module 9 (Task Service)
- Agent 6: Module 10 (Journal Service)

**Completion Criteria:** All core services functional with tests

---

### Phase 3: Agents & APIs (Week 3)
**Parallel Development Groups:**

**Group A (Agents):**
- Agent 1: Module 12 (Dawn Agent)
- Agent 2: Module 13 (Atlas Agent)
- Agent 3: Module 14 (Luna Agent)

**Group B (APIs):**
- Agent 4: Module 15 (Task API)
- Agent 5: Module 16 (Journal API)
- Agent 6: Module 17 (Agent API)
- Agent 7: Module 18 (Auth API)
- Agent 8: Module 19 (Game API)

**Completion Criteria:** All agents and APIs functional

---

### Phase 4: UI Components (Week 4)
**Parallel Development Groups:**

**Group A (Major Components):**
- Agent 1: Module 21 (Agent Components)
- Agent 2: Module 22 (Room Components)
- Agent 3: Module 23 (Task Components)

**Group B (Supporting Components):**
- Agent 4: Module 24 (Game Components)
- Agent 5: Module 25 (Layout Components)

**Completion Criteria:** All components rendering and animated

---

### Phase 5: Pages & Integration (Week 5)
**Parallel Development Groups:**

**Group A (Pages):**
- Agent 1: Module 26 (Dashboard)
- Agent 2: Module 27 (Tasks Page)
- Agent 3: Module 28 (Journal Page)
- Agent 4: Module 29 (Auth Pages)
- Agent 5: Module 30 (Settings)

**Group B (Integration):**
- Agent 6: End-to-end testing
- Agent 7: Performance optimization
- Agent 8: Bug fixes & polish

**Completion Criteria:** Full application functional

---

## 📋 Module Template

Each module should follow this structure:

```
module-name/
├── README.md              # Module documentation
├── index.ts              # Main exports
├── types.ts              # Module-specific types
├── __tests__/            # Unit tests
│   └── module.test.ts
├── __mocks__/            # Mock implementations
│   └── module.mock.ts
└── implementation files
```

### README Template:
```markdown
# Module Name

## Purpose
Brief description of what this module does

## Dependencies
- Module X: Why needed
- Module Y: Why needed

## Exports
- `FunctionA`: What it does
- `FunctionB`: What it does

## Usage Example
\`\`\`typescript
import { FunctionA } from './module-name';
const result = FunctionA(input);
\`\`\`

## Testing
\`npm test module-name\`

## Status
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Code review passed
```

---

## 🧪 Testing Strategy

### Unit Tests (Each Module)
```typescript
describe('TaskService', () => {
  it('should create task with correct XP reward', async () => {
    const task = await taskService.createTask({
      title: 'Test task',
      priority: 'high'
    });
    expect(task.xpReward).toBeGreaterThan(0);
  });
});
```

### Integration Tests (Cross-Module)
```typescript
describe('Task Completion Flow', () => {
  it('should award XP and check achievements', async () => {
    const result = await taskService.completeTask(taskId);
    expect(result.xpEarned).toBe(50);
    expect(result.achievementsUnlocked.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Full Flow)
```typescript
test('User completes task and sees celebration', async ({ page }) => {
  await page.goto('/tasks');
  await page.click('[data-testid="task-checkbox"]');
  await expect(page.locator('.celebration')).toBeVisible();
});
```

---

## 🚀 Deployment Checklist

- [ ] All modules have passing tests (>80% coverage)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Security audit completed

---

## 📊 Progress Tracking

Create a tracking board with columns:
- **Not Started**
- **In Progress**
- **Code Review**
- **Testing**
- **Complete**

Each module card should track:
- Assigned agent
- Start date
- Completion percentage
- Blockers
- Dependencies ready

---

## 🤝 Collaboration Guidelines

### 1. Interface Contracts
Before starting, agree on all interfaces:
```typescript
// Agreed interface between Module 9 and Module 13
export interface TaskServiceInterface {
  completeTask(taskId: string): Promise<TaskCompletionResult>;
  // Other methods...
}
```

### 2. Mock Implementations
Provide mocks for parallel development:
```typescript
// __mocks__/task-service.mock.ts
export const mockTaskService: TaskServiceInterface = {
  completeTask: async (taskId) => ({
    task: mockTask,
    xpEarned: 50,
    levelUp: false,
    achievementsUnlocked: []
  })
};
```

### 3. Communication
- Update module README with progress
- Document any interface changes immediately
- Share blockers in daily standup
- Code review within 24 hours

---

## 🎯 Success Metrics

- **Module Completion Rate**: >90% modules complete on time
- **Test Coverage**: >80% across all modules
- **Bug Rate**: <5 critical bugs in integration
- **Performance**: All animations at 60fps
- **Type Safety**: Zero `any` types in production code

---

*Last Updated: November 2024*
*Version: 1.0*
