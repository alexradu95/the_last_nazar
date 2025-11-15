/**
 * Next.js Instrumentation
 * Runs on server startup (both dev and production)
 *
 * Note: Database now auto-initializes on first use in API routes,
 * so this is optional warmup only.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initializeDatabase } = await import('@/core/database');

      // Just initialize the database connection
      // Skip migrations since they'll run on first API call if needed
      initializeDatabase({
        url: process.env.DATABASE_URL || './dev.db',
        verbose: process.env.NODE_ENV === 'development',
      });

      console.log('[Server] Database connection pre-initialized');
    } catch (error) {
      // Don't throw - let API routes initialize on first use
      console.warn('[Server] Pre-initialization failed (will auto-init on first use):', error);
    }
  }
}
