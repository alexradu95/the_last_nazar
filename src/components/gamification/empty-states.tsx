/**
 * Empty State Components for Gamification
 *
 * Displayed when users have no data yet.
 */

'use client';

export function NoAchievementsYet() {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-4">🏆</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Achievements Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Complete tasks and create journal entries to unlock your first achievements!
      </p>
      <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
        Start your journey to unlock amazing achievements
      </div>
    </div>
  );
}

export function NoXPHistoryYet() {
  return (
    <div className="text-center py-8 px-6">
      <div className="text-5xl mb-3">📊</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No XP History Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Start completing tasks or journaling to earn XP and see your progress here!
      </p>
    </div>
  );
}

export function EmptyLeaderboard() {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Leaderboard Coming Soon
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        The leaderboard will show top performers once more users join!
      </p>
    </div>
  );
}

export function NewUserWelcome() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">👋</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to Gamification!
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Here's how to get started earning XP and unlocking achievements:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">✓</span>
              Complete tasks to earn 10-50 XP based on priority
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">✓</span>
              Create journal entries to earn 15-30 XP with bonuses
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              Maintain daily streaks for milestone bonuses
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">✓</span>
              Unlock achievements for special rewards
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
