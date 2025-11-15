# User Management Feature

**Status**: ✅ Complete
**Version**: 1.0.0
**Dependencies**: None

---

## Overview

The User Management feature provides comprehensive user profile management, preferences storage, and user statistics tracking. It serves as a foundational feature that other features depend on for user context.

## Features Implemented

### ✅ Phase 1: Database Schema
- User table with email, name, avatar, bio, timezone
- User preferences table with key-value storage
- Proper indexes and foreign key constraints
- TypeScript types auto-generated from schema

### ✅ Phase 2: Service Layer (TDD)
- `UserService` with full CRUD operations
- Preference management (get, set, update multiple)
- Last login tracking
- User statistics generation
- Event emission for all user lifecycle events
- Comprehensive test suite with 100% coverage

### ✅ Phase 3: API Layer
- RESTful API endpoints with Zod validation
- POST `/api/users` - Create user
- GET `/api/users?id=xxx` or `/api/users?email=xxx` - Get user
- GET `/api/users/[id]` - Get user by ID
- PATCH `/api/users/[id]` - Update user profile
- DELETE `/api/users/[id]` - Delete user account
- GET `/api/users/[id]/preferences` - Get preferences
- PUT `/api/users/[id]/preferences` - Update preferences

### ✅ Phase 4: UI Components
- `UserAvatar` - Avatar display with initials fallback
- `UserProfilePage` - Complete profile view with stats
- `UserSettings` - Settings page with profile and preferences
- `useUser` hook - User data management
- `usePreferences` hook - Preferences management

### ✅ Phase 5: Integration
- Feature configuration with proper initialization
- Event listeners for user.login and user.logout
- Service registry integration
- Component exports

---

## Database Schema

### Users Table (`feature_users`)
```typescript
{
  id: string (PK)
  email: string (unique, indexed)
  name: string
  avatar: string | null
  bio: string | null
  timezone: string (default: 'UTC')
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### User Preferences Table (`feature_user_preferences`)
```typescript
{
  id: string (PK)
  userId: string (FK -> users.id)
  key: string
  value: string (JSON)
  createdAt: Date
  updatedAt: Date

  UNIQUE(userId, key)
}
```

---

## Events

### Emits
- `user.registered` - When new user is created
- `user.updated` - When user profile is updated
- `user.deleted` - When user account is deleted
- `preferences.changed` - When preferences are updated

### Listens
- `user.login` - Updates last login timestamp
- `user.logout` - Logs user activity

---

## API Endpoints

### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "bio": "Optional bio",
  "avatar": "https://example.com/avatar.jpg",
  "timezone": "America/New_York"
}
```

### Get User
```http
GET /api/users/[userId]
GET /api/users?email=user@example.com
GET /api/users?id=userId
```

### Update User
```http
PATCH /api/users/[userId]
Content-Type: application/json

{
  "name": "New Name",
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg",
  "timezone": "Europe/London"
}
```

### Delete User
```http
DELETE /api/users/[userId]
```

### Get Preferences
```http
GET /api/users/[userId]/preferences
```

### Update Preferences
```http
PUT /api/users/[userId]/preferences
Content-Type: application/json

{
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}
```

---

## Usage Examples

### Using the UserService

```typescript
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createUserService } from '@/features/user/services/user-service';

const db = getDatabase();
const userService = createUserService(db, eventBus);

// Create user
const user = await userService.create({
  email: 'test@example.com',
  name: 'Test User',
});

// Find user
const foundUser = await userService.findById(user.id);
const byEmail = await userService.findByEmail('test@example.com');

// Update user
await userService.update(user.id, {
  name: 'Updated Name',
  bio: 'New bio',
});

// Set preferences
await userService.setPreference(user.id, 'theme', 'dark');
await userService.updatePreferences(user.id, {
  theme: 'dark',
  notifications: true,
});

// Get preferences
const prefs = await userService.getPreferences(user.id);

// Get stats
const stats = await userService.getUserStats(user.id);
```

### Using React Hooks

```tsx
import { useUser } from '@/features/user/hooks/useUser';
import { usePreferences } from '@/features/user/hooks/usePreferences';

function MyComponent() {
  const { user, stats, loading, updateProfile } = useUser(userId);
  const { preferences, updatePreference } = usePreferences(userId);

  const handleSave = async () => {
    await updateProfile({ name: 'New Name' });
  };

  const handleThemeChange = async () => {
    await updatePreference('theme', 'dark');
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Level: {stats?.currentLevel}</p>
      <p>XP: {stats?.totalXP}</p>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Using Components

```tsx
import { UserAvatar, UserProfilePage, UserSettings } from '@/features/user/components';

// Avatar
<UserAvatar user={user} size="lg" />

// Profile Page
<UserProfilePage userId={userId} />

// Settings Page
<UserSettings userId={userId} />
```

---

## Integration with Other Features

### Auth Feature
The auth feature should emit `user.login` and `user.logout` events which will update the user's last login timestamp.

### Gamification Feature
Can read user stats to display XP and level information.

### All Features
Any feature can access user data through the service registry:

```typescript
const userService = registry.getService('user-service');
const user = await userService.findById(userId);
```

---

## Testing

### Running Tests

```bash
npm test src/features/user/__tests__/user-service.test.ts
```

### Test Coverage
- ✅ User creation with validation
- ✅ User retrieval by ID and email
- ✅ User updates with event emission
- ✅ User deletion with cascade
- ✅ Preferences management
- ✅ Last login tracking
- ✅ User statistics calculation
- ✅ Event emission verification
- ✅ Error handling

---

## File Structure

```
src/features/user/
├── __tests__/
│   └── user-service.test.ts      # Comprehensive test suite
├── api/
│   ├── [id]/
│   │   ├── preferences/
│   │   │   └── route.ts          # Preferences API
│   │   └── route.ts              # User CRUD by ID
│   └── route.ts                  # User creation & lookup
├── components/
│   ├── index.tsx                 # Component exports
│   ├── SettingsPage.tsx          # Settings page wrapper
│   ├── UserAvatar.tsx            # Avatar component
│   ├── UserProfilePage.tsx       # Profile view
│   └── UserSettings.tsx          # Settings interface
├── events/
│   └── index.ts                  # Event definitions
├── hooks/
│   ├── useUser.ts                # User management hook
│   └── usePreferences.ts         # Preferences hook
├── schema/
│   └── index.ts                  # Database schema
├── services/
│   └── user-service.ts           # Business logic
├── types/
│   └── index.ts                  # TypeScript types
├── validation/
│   └── schemas.ts                # Zod validation
├── feature.config.ts             # Feature definition
└── README.md                     # This file
```

---

## Development Principles

This feature was developed following **strict TDD principles**:
1. ✅ Tests written first before any implementation
2. ✅ Minimal code to make tests pass
3. ✅ Refactoring after green tests
4. ✅ 100% test coverage of business logic
5. ✅ All tests verify behavior, not implementation

---

## Next Steps

This feature is **production-ready** and can be integrated with:
- Auth feature for user authentication
- Gamification feature for XP/levels
- Journal feature for user context
- Any other feature requiring user data

---

## Checklist

- [x] Database schema defined
- [x] Service layer implemented with TDD
- [x] API routes with validation
- [x] React hooks created
- [x] UI components built
- [x] Feature config updated
- [x] Events documented
- [x] Integration tested
- [x] README complete

**Status**: ✅ Ready for integration and deployment
