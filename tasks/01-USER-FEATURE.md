# Task 01: User Management Feature

**Priority**: P1 - Core Feature
**Dependencies**: None
**Can Start**: Immediately
**Estimated Timeline**: 2-3 days
**Parallelizable**: Yes - No conflicts with other features

---

## Overview

Implement the User Management feature to handle user profiles, preferences, and settings. This is a foundational feature that other features will depend on.

## Objectives

- User profile management (CRUD)
- User preferences and settings
- User avatar/profile picture support
- Event emission for user lifecycle
- Integration with auth system (via events)

## Dependencies

### Depends On
- None (foundational feature)

### Provides To
- Auth feature (user data)
- All features (user context)

## Event Integration

### Emits
- `user.registered` - When new user is created
- `user.updated` - When user profile is updated
- `preferences.changed` - When user preferences change
- `user.deleted` - When user account is deleted

### Listens To
- `user.login` - To update last login timestamp
- `user.logout` - To track activity

## Database Schema

### Tables to Create

#### `feature_users`
```typescript
export const users = sqliteTable('feature_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'), // URL or base64
  bio: text('bio'),
  timezone: text('timezone').default('UTC'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));
```

#### `feature_user_preferences`
```typescript
export const userPreferences = sqliteTable('feature_user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  key: text('key').notNull(), // e.g., 'theme', 'notifications'
  value: text('value').notNull(), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userKeyIdx: uniqueIndex('user_prefs_user_key_idx').on(table.userId, table.key),
}));
```

## Service Layer

### UserService Methods

```typescript
class UserService {
  // User CRUD
  async create(data: NewUser): Promise<User>
  async findById(id: string): Promise<User | null>
  async findByEmail(email: string): Promise<User | null>
  async update(id: string, data: Partial<User>): Promise<User | null>
  async delete(id: string): Promise<boolean>

  // Profile management
  async updateProfile(userId: string, profile: UserProfile): Promise<User>
  async uploadAvatar(userId: string, imageData: string): Promise<string>

  // Preferences
  async getPreferences(userId: string): Promise<Record<string, any>>
  async setPreference(userId: string, key: string, value: any): Promise<void>
  async updatePreferences(userId: string, prefs: Record<string, any>): Promise<void>

  // Activity tracking
  async updateLastLogin(userId: string): Promise<void>
  async getUserStats(userId: string): Promise<UserStats>
}
```

### UserStats Type
```typescript
interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalXP: number;
  currentLevel: number;
  journalEntries: number;
  accountAge: number; // days
  lastActive: Date;
}
```

## API Routes

### Endpoints to Implement

#### `POST /api/users`
Create new user (called by auth system)
```typescript
Request: {
  email: string;
  name: string;
  password?: string; // handled by auth
}
Response: {
  user: User;
}
```

#### `GET /api/users/:id`
Get user profile
```typescript
Response: {
  user: User;
  stats: UserStats;
}
```

#### `PATCH /api/users/:id`
Update user profile
```typescript
Request: {
  name?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
}
Response: {
  user: User;
}
```

#### `DELETE /api/users/:id`
Delete user account
```typescript
Response: {
  success: boolean;
}
```

#### `GET /api/users/:id/preferences`
Get user preferences
```typescript
Response: {
  preferences: Record<string, any>;
}
```

#### `PUT /api/users/:id/preferences`
Update user preferences
```typescript
Request: {
  preferences: Record<string, any>;
}
Response: {
  preferences: Record<string, any>;
}
```

## UI Components

### Components to Build

#### `UserProfilePage.tsx`
Main profile page showing:
- User info (name, email, avatar)
- Bio
- Account stats
- Edit profile button

#### `EditProfileModal.tsx`
Modal for editing profile:
- Name input
- Bio textarea
- Avatar upload
- Timezone selector

#### `UserSettings.tsx`
Settings page with tabs:
- Profile settings
- Preferences (theme, notifications)
- Account settings
- Privacy settings

#### `UserAvatar.tsx`
Reusable avatar component:
- Shows user avatar or initials
- Supports different sizes
- Loading state

#### `PreferencesPanel.tsx`
Preferences management:
- Theme switcher (light/dark)
- Notification settings
- Display preferences
- Language selection

## React Hooks

### `useUser.ts`
```typescript
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (updates: Partial<User>) => {...}
  const uploadAvatar = async (file: File) => {...}
  const deleteAccount = async () => {...}
  const refresh = async () => {...}

  return { user, stats, loading, error, updateProfile, uploadAvatar, deleteAccount, refresh };
}
```

### `usePreferences.ts`
```typescript
export function usePreferences(userId: string) {
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const updatePreference = async (key: string, value: any) => {...}
  const updateMultiple = async (prefs: Record<string, any>) => {...}
  const reset = async () => {...}

  return { preferences, loading, updatePreference, updateMultiple, reset };
}
```

## Feature Configuration

### `feature.config.ts`
```typescript
export const UserFeature: FeatureDefinition = {
  id: 'user',
  name: 'User Management',
  version: '1.0.0',
  dependencies: [],

  provides: {
    routes: [
      { path: '/profile/:id', component: () => import('./components/UserProfilePage') },
      { path: '/settings', component: () => import('./components/UserSettings') },
      { path: '/api/users', handler: () => import('./api/route') },
      { path: '/api/users/:id/preferences', handler: () => import('./api/preferences/route') },
    ],

    events: {
      emits: ['user.registered', 'user.updated', 'preferences.changed', 'user.deleted'],
      listens: ['user.login', 'user.logout'],
    },

    services: {
      'user-service': () => import('./services/user-service'),
    },

    tables: ['feature_users', 'feature_user_preferences'],
  },

  async initialize({ eventBus, db }) {
    console.log('[User] Initializing...');

    const { createUserService } = await import('./services/user-service');
    const userService = createUserService(db, eventBus);

    // Update last login on user.login event
    eventBus.on('user.login', async (payload) => {
      await userService.updateLastLogin(payload.userId);
    });

    console.log('[User] Initialized');
  },
};
```

## Testing Requirements

### Unit Tests
- [ ] UserService CRUD operations
- [ ] Preference management
- [ ] Email uniqueness validation
- [ ] Avatar upload handling
- [ ] Event emission verification

### Integration Tests
- [ ] API endpoint testing
- [ ] Event flow testing
- [ ] Database constraints

### Test Coverage Target
- Minimum 80% coverage
- All CRUD operations tested
- Event emissions verified

## Validation Schema

### Zod Schemas
```typescript
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name required').max(100),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
});

const PreferencesSchema = z.record(z.unknown());
```

## Implementation Checklist

### Phase 1: Setup (Day 1 Morning)
- [ ] Run `npm run create-feature user`
- [ ] Review generated files
- [ ] Define database schema
- [ ] Create migrations
- [ ] Define TypeScript types

### Phase 2: Service Layer (Day 1 Afternoon)
- [ ] Implement UserService class
- [ ] Implement preference management
- [ ] Add event emission
- [ ] Write unit tests for service

### Phase 3: API Layer (Day 2 Morning)
- [ ] Implement user CRUD endpoints
- [ ] Implement preferences endpoints
- [ ] Add validation with Zod
- [ ] Add error handling
- [ ] Test API endpoints

### Phase 4: UI Components (Day 2 Afternoon - Day 3)
- [ ] Create UserProfilePage
- [ ] Create EditProfileModal
- [ ] Create UserSettings
- [ ] Create UserAvatar component
- [ ] Create PreferencesPanel
- [ ] Implement useUser hook
- [ ] Implement usePreferences hook

### Phase 5: Testing & Integration (Day 3)
- [ ] Write component tests
- [ ] Integration testing
- [ ] Event flow testing
- [ ] Update events.config.ts
- [ ] Enable in features.config.ts
- [ ] Run validation: `npm run validate-features`

## Integration Points

### With Auth Feature
```typescript
// Auth calls user service after authentication
eventBus.on('user.login', async (payload) => {
  const user = await userService.findById(payload.userId);
  // Update last login, load preferences, etc.
});
```

### With All Features
```typescript
// All features can access user data
const user = await registry.getService('user-service').findById(userId);
```

## Event Flow Example

```
User updates profile
  → user service validates changes
  → database updated
  → user.updated event emitted
  → other features listen and react
  → UI updates automatically
```

## Success Criteria

- [ ] All CRUD operations working
- [ ] Preferences system functional
- [ ] Events emitting correctly
- [ ] API validation working
- [ ] UI components rendering
- [ ] Tests passing (>80% coverage)
- [ ] Feature validation passing
- [ ] Type checking passing
- [ ] Integration with tasks feature works

## Reference Files

Study these files from Tasks feature:
- `src/features/tasks/services/task-service.ts` - Service pattern
- `src/features/tasks/api/route.ts` - API pattern
- `src/features/tasks/components/TasksPage.tsx` - Page pattern
- `src/features/tasks/__tests__/task-service.test.ts` - Testing pattern

## Notes

- Keep user data minimal and privacy-focused
- Support data export (GDPR compliance)
- Validate all user input
- Hash/encrypt sensitive data
- Consider rate limiting on profile updates
- Avatar should support both URL and base64
- Preferences should be versioned (for schema changes)

## Deliverables

1. Fully functional user management system
2. Comprehensive test suite
3. API documentation
4. Event catalog updates
5. UI components with proper styling
6. Integration demo

---

**Ready to start? Run**: `npm run create-feature user`
