/**
 * Gamification Page
 *
 * Displays user's XP, level, achievements, and leaderboard.
 */

import { Suspense } from 'react';
import { XPCounter, XPHistory, AchievementCard } from '@/features/gamification/components';
import { getDatabase } from '@/core/database';
import { createGamificationService } from '@/features/gamification/services/gamification-service';
import { getEventBus } from '@/core/events/event-bus';
import { GamificationPageSkeleton } from '@/components/ui/loading-skeleton';
import {
  NoAchievementsYet,
  NoXPHistoryYet,
  NewUserWelcome
} from '@/components/gamification/empty-states';
import { GamificationErrorBoundary } from './error-boundary';

export default async function GamificationPage() {
  try {
    const db = getDatabase();
    const eventBus = getEventBus();
    const gamificationService = createGamificationService(db, eventBus);

    // TODO: Get authenticated user ID from session
    const userId = 'demo-user';

    const [stats, xpHistory, achievements] = await Promise.all([
      gamificationService.getUserStats(userId),
      gamificationService.getXPHistory(userId, 10),
      gamificationService.getUserAchievements(userId),
    ]);

    // Check if user is new (no XP earned yet)
    const isNewUser = stats.totalXP === 0;
    const hasHistory = xpHistory.length > 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Gamification
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress, earn XP, and unlock achievements
            </p>
          </div>

          {/* Welcome message for new users */}
          {isNewUser && <NewUserWelcome />}

          {/* Stats and Progress */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Your Progress
              </h2>
              <XPCounter stats={stats} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent XP Gains
              </h2>
              {hasHistory ? (
                <XPHistory history={xpHistory} />
              ) : (
                <NoXPHistoryYet />
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Achievements
            </h2>
            {achievements.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <NoAchievementsYet />
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 How to Earn XP
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <li>• Complete tasks: 10 XP (low), 25 XP (medium), 50 XP (high)</li>
              <li>• Create journal entries: 15-30 XP (bonuses for mood + word count)</li>
              <li>• Maintain login streaks: Bonus XP every 7 days</li>
              <li>• Unlock achievements: Various XP rewards</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load gamification data:', error);
    // Re-throw to let error boundary handle it
    throw error;
  }
}

// Loading state
export function Loading() {
  return <GamificationPageSkeleton />;
}
