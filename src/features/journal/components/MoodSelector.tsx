/**
 * Mood Selector Component
 *
 * Allows users to select their mood on a 5-level scale.
 */

'use client';

import { motion } from 'framer-motion';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

interface MoodSelectorProps {
  value?: MoodLevel;
  onChange: (mood: MoodLevel) => void;
  className?: string;
}

const MOODS = [
  { level: 1 as MoodLevel, emoji: '😢', label: 'Very Bad', color: 'bg-red-500' },
  { level: 2 as MoodLevel, emoji: '😕', label: 'Bad', color: 'bg-orange-500' },
  { level: 3 as MoodLevel, emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
  { level: 4 as MoodLevel, emoji: '😊', label: 'Good', color: 'bg-lime-500' },
  { level: 5 as MoodLevel, emoji: '😄', label: 'Very Good', color: 'bg-green-500' },
];

export function MoodSelector({ value, onChange, className = '' }: MoodSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        How are you feeling?
      </label>

      <div className="flex items-center justify-between gap-2">
        {MOODS.map((mood) => {
          const isSelected = value === mood.level;

          return (
            <motion.button
              key={mood.level}
              type="button"
              onClick={() => onChange(mood.level)}
              className={`
                relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? `${mood.color} border-transparent text-white shadow-lg`
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select ${mood.label} mood`}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {mood.label.split(' ')[mood.label.split(' ').length - 1]}
              </span>

              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span className="text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Get mood emoji by level
 */
export function getMoodEmoji(level: MoodLevel): string {
  return MOODS.find((m) => m.level === level)?.emoji ?? '😐';
}

/**
 * Get mood label by level
 */
export function getMoodLabel(level: MoodLevel): string {
  return MOODS.find((m) => m.level === level)?.label ?? 'Neutral';
}

/**
 * Get mood color by level
 */
export function getMoodColor(level: MoodLevel): string {
  return MOODS.find((m) => m.level === level)?.color ?? 'bg-yellow-500';
}
