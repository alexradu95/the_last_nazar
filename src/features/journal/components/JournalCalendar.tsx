/**
 * Journal Calendar Component
 *
 * Calendar view showing days with journal entries and mood indicators.
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getMoodColor, type MoodLevel } from './MoodSelector';

export interface JournalEntry {
  id: string;
  createdAt: Date;
  mood: number | null;
}

interface JournalCalendarProps {
  entries: JournalEntry[];
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export function JournalCalendar({
  entries,
  selectedDate,
  onSelectDate,
  className = '',
}: JournalCalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();

    entries.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
      const existing = map.get(dateKey) ?? [];
      map.set(dateKey, [...existing, entry]);
    });

    return map;
  }, [entries]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: Date | null; entries: JournalEntry[] }> = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, entries: [] });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayEntries = entriesByDate.get(dateKey) ?? [];

      days.push({ date, entries: dayEntries });
    }

    return days;
  }, [currentYear, currentMonth, entriesByDate]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthName}
        </h2>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (!day.date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isToday =
              day.date.toDateString() === today.toDateString();
            const isSelected =
              selectedDate && day.date.toDateString() === selectedDate.toDateString();
            const hasEntries = day.entries.length > 0;
            const averageMood = hasEntries
              ? day.entries.reduce((sum, e) => sum + (e.mood ?? 0), 0) / day.entries.length
              : null;

            return (
              <motion.button
                key={day.date.toISOString()}
                type="button"
                onClick={() => onSelectDate?.(day.date!)}
                className={`
                  relative aspect-square rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : hasEntries
                    ? 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Day number */}
                <div className="absolute top-1 left-1 right-1 text-center">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : hasEntries
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Entry indicator */}
                {hasEntries && (
                  <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1">
                    {day.entries.slice(0, 3).map((entry, i) => (
                      <div
                        key={entry.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          entry.mood
                            ? getMoodColor(entry.mood as MoodLevel)
                            : 'bg-gray-400'
                        }`}
                        title={`Entry ${i + 1}`}
                      />
                    ))}
                    {day.entries.length > 3 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        +{day.entries.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Today indicator */}
                {isToday && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Has entries</span>
        </div>
      </div>
    </div>
  );
}
