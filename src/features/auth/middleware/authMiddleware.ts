/**
 * Authentication Middleware
 *
 * Middleware to protect routes and verify authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { createAuthService } from '../services/auth-service';

/**
 * Authentication middleware for API routes
 */
export async function authMiddleware(req: NextRequest) {
  // Get token from Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const authService = createAuthService(db, eventBus);

    // Validate session and get user
    const user = await authService.validateSession(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid or expired session' }, { status: 401 });
    }

    // Attach user to request for downstream handlers
    // Note: In Next.js, we need to use a different approach for passing user data
    // This is typically done by creating a custom header or using middleware context
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

/**
 * Helper to get authenticated user from request headers
 */
export function getAuthenticatedUser(req: NextRequest): { id: string; email: string } | null {
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');

  if (!userId || !userEmail) {
    return null;
  }

  return { id: userId, email: userEmail };
}

/**
 * Higher-order function to wrap API handlers with authentication
 */
export function withAuth<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): (...args: Parameters<T>) => Promise<NextResponse> {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    const [req] = args as [NextRequest, ...any[]];

    // Check authentication
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    try {
      const db = getDatabase();
      const authService = createAuthService(db, eventBus);

      const user = await authService.validateSession(token);

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized - Invalid or expired session' }, { status: 401 });
      }

      // Add user to request headers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);

      // Create new request with user data
      const authenticatedReq = new NextRequest(req.url, {
        method: req.method,
        headers: requestHeaders,
        body: req.body,
      });

      // Call the original handler with authenticated request
      return await handler(authenticatedReq, ...args.slice(1));
    } catch (error) {
      console.error('[withAuth] Error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
  };
}
