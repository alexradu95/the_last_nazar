/**
 * Journal Stats Component
 *
 * Display journal statistics
 */

'use client';

import type { JournalStats } from '../types';

type JournalStatsProps = {
  stats: JournalStats | null;
};

export const JournalStats = ({ stats }: JournalStatsProps) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Your Journey</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalEntries}</div>
          <div className="text-sm text-gray-600 mt-1">Total Entries</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {stats.currentStreak}
            <span className="text-xl">🔥</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">Day Streak</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalWords.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Total Words</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.averageWordsPerEntry}</div>
          <div className="text-sm text-gray-600 mt-1">Avg Words/Entry</div>
        </div>
      </div>

      {stats.longestStreak > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
          <span className="text-sm text-gray-700">
            🏆 Longest streak: <strong>{stats.longestStreak} days</strong>
          </span>
        </div>
      )}
    </div>
  );
};
