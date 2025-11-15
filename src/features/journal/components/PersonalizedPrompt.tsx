/**
 * Personalized Prompt Component
 *
 * Displays AI-generated personalized writing prompts from Luna.
 */

'use client';

import { motion } from 'framer-motion';

interface PersonalizedPromptProps {
  prompt: string;
  reasoning?: string;
  onUse?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PersonalizedPrompt({
  prompt,
  reasoning,
  onUse,
  onDismiss,
  className = '',
}: PersonalizedPromptProps) {
  return (
    <motion.div
      className={`p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🌙</span>
        <div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-300">
            Luna's Prompt for You
          </h3>
          {reasoning && (
            <p className="text-xs text-purple-700 dark:text-purple-400">{reasoning}</p>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
        <p className="text-sm text-gray-900 dark:text-gray-100 italic">{prompt}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onUse && (
          <motion.button
            type="button"
            onClick={onUse}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Use This Prompt
          </motion.button>
        )}
        {onDismiss && (
          <motion.button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Maybe Later
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
