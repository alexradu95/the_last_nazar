/**
 * Instrumentation File
 *
 * This file is called once when the Next.js server starts up.
 * Perfect for initializing global services like event listeners.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    console.log('[Instrumentation] Initializing server-side services...');

    // Import dependencies
    const { getEventBus } = await import('@/core/events/event-bus');
    const { getDatabase } = await import('@/core/database');
    const { createGamificationService } = await import(
      '@/features/gamification/services/gamification-service'
    );
    const { registerGamificationListeners } = await import(
      '@/features/gamification/listeners'
    );

    // Get singletons
    const eventBus = getEventBus();
    const db = getDatabase();
    const gamificationService = createGamificationService(db, eventBus);

    // Register all gamification event listeners
    registerGamificationListeners(eventBus, gamificationService);

    console.log('[Instrumentation] Server-side services initialized successfully');
    console.log(`[Instrumentation] Registered events: ${eventBus.getEvents().join(', ')}`);
  }
}
