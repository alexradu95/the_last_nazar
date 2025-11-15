/**
 * Journal List Component
 *
 * Display list of journal entries
 */

'use client';

import type { JournalEntry } from '../schema';

type JournalListProps = {
  entries: JournalEntry[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const JournalList = ({ entries, onEdit, onDelete }: JournalListProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No journal entries yet</p>
        <p className="text-gray-400 mt-2">Start writing to see your entries here</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (mood: string | null) => {
    const moodMap: Record<string, string> = {
      happy: '😊',
      excited: '🎉',
      grateful: '🙏',
      calm: '😌',
      tired: '😴',
      stressed: '😰',
      sad: '😢',
      angry: '😠',
    };
    return mood ? moodMap[mood] : null;
  };

  const getTags = (tagsJson: string | null): string[] => {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">
                  {entry.title || 'Untitled Entry'}
                </h3>
                {entry.mood && (
                  <span className="text-2xl" title={entry.mood}>
                    {getMoodEmoji(entry.mood)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(entry.id)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>

          <p className="text-gray-700 mb-3 line-clamp-3">{entry.content}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex gap-4">
              <span>{entry.wordCount} words</span>
              {entry.isPrivate && <span>🔒 Private</span>}
            </div>
            {getTags(entry.tags).length > 0 && (
              <div className="flex gap-2">
                {getTags(entry.tags).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
