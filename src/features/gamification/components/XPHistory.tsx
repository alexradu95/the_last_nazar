/**
 * XP History Component
 *
 * Displays a list of recent XP gains with source and timestamp.
 */

'use client';

import { motion } from 'framer-motion';

export interface XPHistoryEntry {
  id: string;
  userId: string;
  amount: number;
  source: 'task' | 'journal' | 'achievement' | 'streak' | 'manual';
  sourceId: string | null;
  reason: string | null;
  timestamp: Date;
}

interface XPHistoryProps {
  history: XPHistoryEntry[];
  className?: string;
}

const SOURCE_CONFIG = {
  task: {
    icon: '✅',
    label: 'Task Completed',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  journal: {
    icon: '📝',
    label: 'Journal Entry',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  achievement: {
    icon: '🏆',
    label: 'Achievement',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  streak: {
    icon: '🔥',
    label: 'Streak Bonus',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  manual: {
    icon: '⚡',
    label: 'Manual Award',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
} as const;

export function XPHistory({ history, className = '' }: XPHistoryProps) {
  if (history.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">📊</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No XP history yet. Complete tasks to start earning!
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {history.map((entry, index) => {
        const config = SOURCE_CONFIG[entry.source];
        const relativeTime = formatRelativeTime(entry.timestamp);

        return (
          <motion.div
            key={entry.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Icon */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor}`}
              >
                <span className="text-xl">{config.icon}</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {entry.reason || config.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {relativeTime}
                </div>
              </div>
            </div>

            {/* XP Amount */}
            <div className="flex items-center gap-1">
              <span className={`text-lg font-bold ${config.color}`}>
                +{entry.amount}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">XP</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString();
}
