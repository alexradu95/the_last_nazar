# Authentication Feature

Complete authentication system with email/password login, registration, session management, and password reset functionality.

## Features

✅ **User Registration**
- Email and password validation
- Password strength requirements
- Real-time password strength indicator
- Email verification tokens
- Secure password hashing with bcrypt

✅ **User Login**
- Email/password authentication
- Remember me functionality
- Rate limiting (5 attempts per 15 minutes)
- Account lockout protection
- Session management with JWT-like tokens

✅ **Session Management**
- Secure session tokens (64 characters)
- Configurable session expiration
- Multiple active sessions support
- Session cleanup on logout
- Automatic expired session cleanup

✅ **Password Reset**
- Forgot password flow
- Reset token generation
- Secure password reset
- Token expiration (1 hour)
- Email-based verification

✅ **Password Management**
- Change password (authenticated)
- Password strength validation
- Common password blacklist
- Password history tracking

✅ **Email Verification**
- Email verification tokens
- Verification token expiration (24 hours)
- Resend verification option

✅ **Security Features**
- Rate limiting on login attempts
- Bcrypt password hashing (10 rounds)
- SQL injection prevention
- XSS protection
- CSRF token support ready
- Secure session tokens

## Database Schema

### Tables

1. **feature_auth_sessions** - Active user sessions
2. **feature_auth_credentials** - Password hashes and salts
3. **feature_auth_verification_tokens** - Email verification and password reset tokens
4. **feature_auth_login_attempts** - Login attempt tracking for rate limiting

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current authenticated user

### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Email Verification
- `POST /api/auth/verify-email` - Verify email with token

## Services

### AuthService

Main authentication service providing:

```typescript
class AuthService {
  // Registration
  async register(request: RegisterRequest): Promise<RegisterResponse>
  async verifyEmail(token: string): Promise<boolean>

  // Authentication
  async login(request: LoginRequest): Promise<LoginResponse>
  async logout(token: string): Promise<void>
  async validateSession(token: string): Promise<User | null>

  // Password Management
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
  async requestPasswordReset(email: string): Promise<void>
  async resetPassword(token: string, newPassword: string): Promise<void>

  // Session Management
  async createSession(userId: string, userAgent?: string, ipAddress?: string, rememberMe?: boolean): Promise<string>
  async deleteSession(token: string): Promise<void>
  async getUserSessions(userId: string, currentToken?: string): Promise<SessionInfo[]>
  async deleteAllSessions(userId: string, exceptToken?: string): Promise<void>

  // Maintenance
  async cleanupExpiredSessions(): Promise<number>
  async cleanupOldLoginAttempts(): Promise<void>
}
```

## React Components

### Forms
- **LoginForm** - Email/password login with remember me
- **RegisterForm** - User registration with password strength indicator
- **ForgotPasswordForm** - Request password reset
- **ResetPasswordForm** - Reset password with token

### UI Components
- **PasswordStrengthIndicator** - Real-time password strength display

### Context & Hooks
- **AuthProvider** - Authentication context provider
- **useAuth** - Hook to access authentication state and methods

## Usage

### 1. Wrap App with AuthProvider

```tsx
// app/layout.tsx
import { AuthProvider } from '@/features/auth/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Use Authentication in Components

```tsx
'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Use Form Components

```tsx
import { LoginForm } from '@/features/auth/components';

export function LoginPage() {
  return (
    <LoginForm
      onSuccess={() => router.push('/dashboard')}
      onRegister={() => router.push('/register')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
```

### 4. Protect API Routes

```tsx
import { withAuth } from '@/features/auth/middleware/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

async function handler(request: NextRequest) {
  // User is authenticated, access user data from headers
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');

  // Your protected logic here
  return NextResponse.json({ success: true });
}

export const GET = withAuth(handler);
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&* etc.)
- Not a common password

## Rate Limiting

- **Login attempts**: 5 attempts per 15 minutes
- **Lockout duration**: 30 minutes
- **Cleanup**: Login attempts older than 7 days are removed

## Session Configuration

- **Default expiration**: 24 hours
- **Remember me expiration**: 30 days
- **Token length**: 64 characters (hex)
- **Auto cleanup**: Expired sessions removed on startup

## Events

The authentication feature emits the following events:

- `user.login` - When user logs in successfully
- `user.logout` - When user logs out
- `user.registered` - When new user registers
- `auth.failed` - When authentication fails
- `auth.password_changed` - When password is changed
- `auth.password_reset_requested` - When password reset is requested
- `auth.email_verified` - When email is verified

## Security Best Practices

1. **Always use HTTPS in production**
2. **Implement CSRF tokens for forms**
3. **Add 2FA support** (future enhancement)
4. **Consider OAuth providers** (future enhancement)
5. **Implement session refresh** (future enhancement)
6. **Add audit logging**
7. **Monitor failed login attempts**
8. **Implement account lockout**

## Testing

The authentication feature should have comprehensive tests covering:

- Password hashing and verification
- Token generation and validation
- Session creation and validation
- Rate limiting logic
- Password strength validation
- Registration flow
- Login/logout flow
- Password reset flow
- Email verification flow

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth provider integration (Google, GitHub, etc.)
- [ ] Session refresh tokens
- [ ] Remember device functionality
- [ ] Account recovery questions
- [ ] Login notification emails
- [ ] Suspicious activity detection
- [ ] IP-based restrictions
- [ ] Device fingerprinting

## Dependencies

- `bcryptjs` - Password hashing
- `zod` - Input validation
- `drizzle-orm` - Database ORM
- Next.js 15+ - Framework
- React 19+ - UI library

## File Structure

```
src/features/auth/
├── api/                    # API route handlers
│   ├── register/
│   ├── login/
│   ├── logout/
│   ├── me/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── change-password/
│   └── verify-email/
├── components/             # React components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── PasswordStrengthIndicator.tsx
│   └── index.ts
├── context/                # React context
│   └── AuthContext.tsx
├── events/                 # Event definitions
│   └── index.ts
├── hooks/                  # React hooks
│   └── useAuth.ts
├── middleware/             # Authentication middleware
│   └── authMiddleware.ts
├── schema/                 # Database schema
│   └── index.ts
├── services/               # Business logic
│   └── auth-service.ts
├── types/                  # TypeScript types
│   └── index.ts
├── utils/                  # Utility functions
│   ├── password.ts
│   ├── token.ts
│   └── validation.ts
├── validation/             # Zod schemas
│   └── schemas.ts
├── feature.config.ts       # Feature configuration
└── README.md               # This file
```

## Contributing

When contributing to this feature:

1. Maintain security best practices
2. Add tests for new functionality
3. Update this README with changes
4. Follow existing code patterns
5. Validate all inputs with Zod
6. Use TypeScript strictly

## Support

For issues or questions about the authentication feature, please refer to:
- Task documentation: `/tasks/05-AUTH-FEATURE.md`
- Project CLAUDE.md for overall guidelines
