/**
 * Journal List Component
 *
 * Displays a list of journal entries with search and filter.
 */

'use client';

import { motion } from 'framer-motion';
import { getMoodEmoji, type MoodLevel } from './MoodSelector';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  mood: number | null;
  wordCount: number;
  tags: string | null;
  promptId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
  className?: string;
}

export function JournalList({
  entries,
  onSelectEntry,
  onDeleteEntry,
  className = '',
}: JournalListProps) {
  if (entries.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">📝</div>
        <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No journal entries yet
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Start writing to see your entries here
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {entries.map((entry, index) => {
        const preview = entry.content.substring(0, 150);
        const hasMore = entry.content.length > 150;

        return (
          <motion.div
            key={entry.id}
            className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectEntry?.(entry)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  {entry.mood && (
                    <span className="text-2xl">{getMoodEmoji(entry.mood as MoodLevel)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    {entry.title ? (
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {entry.title}
                      </h3>
                    ) : (
                      <h3 className="font-semibold text-gray-500 dark:text-gray-400 truncate italic">
                        Untitled Entry
                      </h3>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{entry.wordCount} words</span>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {preview}
                  {hasMore && '...'}
                </p>

                {/* Tags */}
                {entry.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {JSON.parse(entry.tags).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onDeleteEntry && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this entry?')) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete entry"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
