/**
 * Luna Insights Component
 *
 * Displays AI-generated insights about user's journaling patterns and moods.
 */

'use client';

import { motion } from 'framer-motion';

export interface LunaInsight {
  id: string;
  type: 'mood_trend' | 'pattern' | 'suggestion' | 'reflection' | 'milestone';
  title: string;
  content: string;
  relatedEntryIds: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface LunaInsightsProps {
  insights: LunaInsight[];
  onMarkAsRead?: (insightId: string) => void;
  className?: string;
}

const INSIGHT_CONFIG = {
  mood_trend: {
    icon: '📊',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  pattern: {
    icon: '🔍',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  suggestion: {
    icon: '💡',
    color: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  reflection: {
    icon: '🌟',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-300 dark:border-green-700',
  },
  milestone: {
    icon: '🏆',
    color: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
} as const;

export function LunaInsights({ insights, onMarkAsRead, className = '' }: LunaInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-6xl mb-3">🌙</div>
        <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No insights yet
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Luna will analyze your journal entries and provide personalized insights
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🌙</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Luna's Insights
        </h2>
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const config = INSIGHT_CONFIG[insight.type];

          return (
            <motion.div
              key={insight.id}
              className={`relative p-4 rounded-lg border-2 ${config.borderColor} ${config.color} ${
                insight.isRead ? 'opacity-75' : ''
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Unread indicator */}
              {!insight.isRead && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
              )}

              {/* Content */}
              <div className="flex items-start gap-3">
                <div className="text-3xl">{config.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-1 ${config.textColor}`}>
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {insight.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                    {!insight.isRead && onMarkAsRead && (
                      <button
                        type="button"
                        onClick={() => onMarkAsRead(insight.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
