# Task 05: Authentication Feature

**Priority**: P2 - Core Feature
**Dependencies**: User (can mock initially)
**Can Start**: Immediately (with mock user data)
**Estimated Timeline**: 2-3 days
**Parallelizable**: Yes - Can develop with mocks

---

## Overview

Implement authentication system with email/password login, registration, session management, and password reset. This feature integrates with the User feature and emits events that other features listen to.

## Objectives

- Email/password authentication
- User registration with validation
- Session management (JWT or session-based)
- Password reset via email
- Protected routes and middleware
- Remember me functionality
- Account verification
- Event emission for user lifecycle

## Dependencies

### Depends On
- User feature (for user data storage)

### Provides To
- All features (authentication state)

## Event Integration

### Emits
- `user.login` - When user logs in successfully
- `user.logout` - When user logs out
- `user.registered` - When new user registers (via User feature)
- `auth.failed` - When authentication fails

### Listens To
- None initially

## Database Schema

### Tables to Create

#### `feature_auth_sessions`
```typescript
export const sessions = sqliteTable('feature_auth_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tokenIdx: uniqueIndex('sessions_token_idx').on(table.token),
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
}));
```

#### `feature_auth_credentials`
```typescript
export const credentials = sqliteTable('feature_auth_credentials', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  lastPasswordChange: integer('last_password_change', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userIdIdx: uniqueIndex('credentials_user_id_idx').on(table.userId),
}));
```

#### `feature_auth_verification_tokens`
```typescript
export const verificationTokens = sqliteTable('feature_auth_verification_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull().unique(),
  type: text('type', { enum: ['email_verification', 'password_reset'] }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  tokenIdx: uniqueIndex('verification_tokens_token_idx').on(table.token),
}));
```

#### `feature_auth_login_attempts`
```typescript
export const loginAttempts = sqliteTable('feature_auth_login_attempts', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  ipAddress: text('ip_address'),
  success: integer('success', { mode: 'boolean' }).notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  emailIdx: index('login_attempts_email_idx').on(table.email),
  timestampIdx: index('login_attempts_timestamp_idx').on(table.timestamp),
}));
```

## Service Layer

### AuthService Methods

```typescript
class AuthService {
  // Registration
  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }>
  async verifyEmail(token: string): Promise<boolean>
  async resendVerification(email: string): Promise<void>

  // Authentication
  async login(email: string, password: string, rememberMe?: boolean): Promise<{ user: User; token: string }>
  async logout(token: string): Promise<void>
  async validateSession(token: string): Promise<User | null>

  // Password Management
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
  async requestPasswordReset(email: string): Promise<void>
  async resetPassword(token: string, newPassword: string): Promise<void>
  async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }>

  // Session Management
  async createSession(userId: string, userAgent?: string, ipAddress?: string, rememberMe?: boolean): Promise<string>
  async deleteSession(token: string): Promise<void>
  async getUserSessions(userId: string): Promise<Session[]>
  async deleteAllSessions(userId: string, exceptToken?: string): Promise<void>

  // Security
  async checkRateLimit(email: string, ipAddress: string): Promise<boolean>
  async logLoginAttempt(email: string, ipAddress: string, success: boolean): Promise<void>
  async isAccountLocked(email: string): Promise<boolean>

  // Utilities
  async hashPassword(password: string): Promise<{ hash: string; salt: string }>
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean>
  async generateToken(): Promise<string>
}
```

### Password Validation Rules
```typescript
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  commonPasswordsBlacklist: ['password', '12345678', 'qwerty', ...],
};

function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (PASSWORD_RULES.commonPasswordsBlacklist.includes(password.toLowerCase())) {
    errors.push('This password is too common');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

## API Routes

### Endpoints to Implement

#### `POST /api/auth/register`
Register new user
```typescript
Request: {
  email: string;
  password: string;
  name: string;
}
Response: {
  user: User;
  token: string;
  message: 'Registration successful. Please verify your email.';
}
```

#### `POST /api/auth/login`
Login user
```typescript
Request: {
  email: string;
  password: string;
  rememberMe?: boolean;
}
Response: {
  user: User;
  token: string;
}
```

#### `POST /api/auth/logout`
Logout user
```typescript
Request Headers: {
  Authorization: 'Bearer <token>';
}
Response: {
  success: boolean;
}
```

#### `GET /api/auth/me`
Get current user
```typescript
Request Headers: {
  Authorization: 'Bearer <token>';
}
Response: {
  user: User;
}
```

#### `POST /api/auth/verify-email`
Verify email with token
```typescript
Request: {
  token: string;
}
Response: {
  success: boolean;
  message: string;
}
```

#### `POST /api/auth/forgot-password`
Request password reset
```typescript
Request: {
  email: string;
}
Response: {
  message: 'If the email exists, a reset link has been sent.';
}
```

#### `POST /api/auth/reset-password`
Reset password with token
```typescript
Request: {
  token: string;
  newPassword: string;
}
Response: {
  success: boolean;
}
```

#### `POST /api/auth/change-password`
Change password (authenticated)
```typescript
Request: {
  oldPassword: string;
  newPassword: string;
}
Response: {
  success: boolean;
}
```

#### `GET /api/auth/sessions`
Get user's active sessions
```typescript
Response: {
  sessions: Session[];
}
```

#### `DELETE /api/auth/sessions/:id`
Delete specific session
```typescript
Response: {
  success: boolean;
}
```

## UI Components

### Components to Build

#### `LoginForm.tsx`
Login interface:
- Email input
- Password input
- Remember me checkbox
- "Forgot password?" link
- Submit button
- Error display
- Loading state

#### `RegisterForm.tsx`
Registration interface:
- Name input
- Email input
- Password input
- Password confirmation
- Password strength indicator
- Terms acceptance
- Submit button
- Validation errors

#### `ForgotPasswordForm.tsx`
Password reset request:
- Email input
- Submit button
- Success message
- Back to login link

#### `ResetPasswordForm.tsx`
Password reset form:
- New password input
- Password confirmation
- Password strength indicator
- Submit button
- Token validation

#### `VerifyEmailPage.tsx`
Email verification:
- Token validation
- Success/error message
- Redirect to login
- Resend verification option

#### `PasswordStrengthIndicator.tsx`
Visual password strength:
- Progress bar
- Color-coded (weak/medium/strong)
- Requirements checklist
- Real-time feedback

#### `SessionManager.tsx`
Active sessions display:
- Session list (device, location, date)
- "Revoke" button per session
- "Revoke all other sessions" button

#### `AuthGuard.tsx`
Route protection HOC:
- Check authentication
- Redirect to login if needed
- Loading state
- Role-based access (future)

## Middleware

### `authMiddleware.ts`
```typescript
export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authService = createAuthService(db, eventBus);
  const user = await authService.validateSession(token);

  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Attach user to request (for downstream handlers)
  (req as any).user = user;
  return NextResponse.next();
}
```

## React Hooks & Context

### `AuthContext.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {...}
  const login = async (email: string, password: string) => {...}
  const logout = async () => {...}
  const register = async (...) => {...}

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### `useAuth.ts` Hook
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Feature Configuration

### `feature.config.ts`
```typescript
export const AuthFeature: FeatureDefinition = {
  id: 'auth',
  name: 'Authentication',
  version: '1.0.0',
  dependencies: ['user'],

  provides: {
    routes: [
      { path: '/login', component: () => import('./components/LoginForm') },
      { path: '/register', component: () => import('./components/RegisterForm') },
      { path: '/forgot-password', component: () => import('./components/ForgotPasswordForm') },
      { path: '/reset-password', component: () => import('./components/ResetPasswordForm') },
      { path: '/verify-email', component: () => import('./components/VerifyEmailPage') },
      { path: '/api/auth/login', handler: () => import('./api/login/route') },
      { path: '/api/auth/register', handler: () => import('./api/register/route') },
      { path: '/api/auth/logout', handler: () => import('./api/logout/route') },
    ],

    events: {
      emits: ['user.login', 'user.logout', 'auth.failed'],
      listens: [],
    },

    services: {
      'auth-service': () => import('./services/auth-service'),
    },

    tables: [
      'feature_auth_sessions',
      'feature_auth_credentials',
      'feature_auth_verification_tokens',
      'feature_auth_login_attempts',
    ],
  },

  async initialize({ eventBus, db }) {
    console.log('[Auth] Initializing...');

    // Clean up expired sessions on startup
    const { createAuthService } = await import('./services/auth-service');
    const authService = createAuthService(db, eventBus);

    await authService.cleanupExpiredSessions();

    console.log('[Auth] Initialized');
  },
};
```

## Security Best Practices

### Password Hashing
```typescript
// Use bcrypt or argon2
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### Rate Limiting
```typescript
const RATE_LIMITS = {
  loginAttempts: 5,
  timeWindow: 15 * 60 * 1000, // 15 minutes
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
};

async function checkRateLimit(email: string, ipAddress: string): Promise<boolean> {
  const recentAttempts = await db
    .select()
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email),
        gte(loginAttempts.timestamp, new Date(Date.now() - RATE_LIMITS.timeWindow))
      )
    );

  const failedAttempts = recentAttempts.filter(a => !a.success).length;

  return failedAttempts < RATE_LIMITS.loginAttempts;
}
```

### CSRF Protection
```typescript
// Generate CSRF token for forms
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate CSRF token
function validateCSRFToken(token: string, sessionToken: string): boolean {
  // Implementation depends on your CSRF strategy
  return true;
}
```

## Testing Requirements

### Unit Tests
- [ ] Password hashing and verification
- [ ] Token generation and validation
- [ ] Session creation and validation
- [ ] Rate limiting logic
- [ ] Password strength validation

### Integration Tests
- [ ] Registration flow
- [ ] Login/logout flow
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Session management

### Security Tests
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting effectiveness
- [ ] Session hijacking prevention

### Test Coverage Target
- Minimum 90% coverage (critical security code)

## Implementation Checklist

### Phase 1: Setup (Day 1 Morning)
- [ ] Run `npm run create-feature auth`
- [ ] Define database schema
- [ ] Create migrations
- [ ] Set up password hashing

### Phase 2: Core Service (Day 1)
- [ ] Implement AuthService
- [ ] Implement password hashing
- [ ] Implement session management
- [ ] Implement rate limiting
- [ ] Write unit tests

### Phase 3: API Layer (Day 1-2)
- [ ] Implement register endpoint
- [ ] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Implement password reset endpoints
- [ ] Implement email verification
- [ ] Add validation and security

### Phase 4: UI Components (Day 2)
- [ ] Create LoginForm
- [ ] Create RegisterForm
- [ ] Create ForgotPasswordForm
- [ ] Create ResetPasswordForm
- [ ] Create PasswordStrengthIndicator
- [ ] Create AuthContext and hooks

### Phase 5: Integration & Testing (Day 3)
- [ ] Event emission testing
- [ ] Integration with User feature
- [ ] Security testing
- [ ] Update event catalog
- [ ] Enable feature

## Event Flow Examples

### Registration Flow
```
User submits registration
  → auth validates input
  → auth creates user (via User service)
  → auth creates credentials
  → auth sends verification email
  → auth creates session
  → emits 'user.registered'
  → returns token
```

### Login Flow
```
User submits login
  → auth checks rate limit
  → auth validates credentials
  → auth creates session
  → emits 'user.login'
  → gamification updates streak
  → agents send morning briefing
  → returns token
```

## Success Criteria

- [ ] Registration working with validation
- [ ] Login/logout functional
- [ ] Password reset flow complete
- [ ] Email verification working
- [ ] Sessions managed correctly
- [ ] Rate limiting effective
- [ ] Events emitting correctly
- [ ] Security tests passing
- [ ] Tests passing (>90% coverage)

## Notes

- Use HTTPS in production
- Implement CSRF tokens for forms
- Add 2FA support (future)
- Consider OAuth providers (future)
- Implement session refresh (future)
- Add audit logging
- Monitor failed login attempts
- Implement account lockout

## Deliverables

1. Complete authentication system
2. Secure password management
3. Session management
4. Email verification
5. Password reset flow
6. Rate limiting
7. Security tests
8. Event integration

---

**Ready to start? Run**: `npm run create-feature auth`
