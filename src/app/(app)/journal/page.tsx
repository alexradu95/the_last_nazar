/**
 * Journal Page
 *
 * Main journaling interface with editor, entries list, and Luna insights.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  JournalEditor,
  JournalList,
  JournalCalendar,
  MoodSelector,
  LunaInsights,
  PersonalizedPrompt,
} from '@/features/journal/components';
import type { MoodLevel } from '@/features/journal/components';
import {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  fetchDailyPrompt,
  fetchJournalStats,
  type JournalEntry,
  type JournalPrompt,
  type JournalStats,
} from '@/lib/api/journal-client';

// Mock insights data - will be replaced with Luna AI integration in TASK-009
const mockInsights = [
  {
    id: '1',
    type: 'mood_trend' as const,
    title: 'Your Mood is Improving',
    content: 'Over the past week, your mood has been trending upward. Your average mood score increased by 15%. Keep up the positive momentum!',
    relatedEntryIds: null,
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    type: 'pattern' as const,
    title: 'Evening Writing Pattern',
    content: 'You tend to journal most often in the evening (6-9 PM). This consistency is great for building a habit!',
    relatedEntryIds: null,
    isRead: true,
    createdAt: new Date(Date.now() - 86400000),
  },
];

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState<'write' | 'entries' | 'calendar' | 'insights'>('write');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<JournalPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [entriesData, statsData, promptData] = await Promise.all([
          fetchJournalEntries({ limit: 50 }),
          fetchJournalStats(),
          fetchDailyPrompt(),
        ]);

        setEntries(entriesData);
        setStats(statsData);
        setDailyPrompt(promptData);
      } catch (err) {
        console.error('Failed to load journal data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load journal data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveEntry = async (data: { title: string; content: string; mood?: MoodLevel }) => {
    try {
      if (selectedEntry) {
        // Update existing entry
        const updated = await updateJournalEntry(selectedEntry.id, {
          title: data.title || undefined,
          content: data.content,
          mood: data.mood,
        });

        // Update entries list with optimistic update
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
        setSelectedEntry(null);
      } else {
        // Create new entry
        const newEntry = await createJournalEntry({
          title: data.title || undefined,
          content: data.content,
          mood: data.mood,
        });

        // Add to entries list
        setEntries(prev => [newEntry, ...prev]);
      }

      // Refresh stats after saving
      const updatedStats = await fetchJournalStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    }
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setActiveTab('write');
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteJournalEntry(entryId);

      // Remove from entries list
      setEntries(prev => prev.filter(e => e.id !== entryId));

      // Clear selected entry if it was deleted
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }

      // Refresh stats after deleting
      const updatedStats = await fetchJournalStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to delete entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Journal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your journal...
            </p>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Journal
            </h1>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Error Loading Journal
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reflect, track your mood, and gain insights with Luna
          </p>
        </div>

        {/* Personalized Prompt */}
        {dailyPrompt && (
          <PersonalizedPrompt
            prompt={dailyPrompt.prompt}
            reasoning={`${dailyPrompt.category} • ${dailyPrompt.difficulty} difficulty`}
            onUse={() => setActiveTab('write')}
            onDismiss={() => console.log('Dismissed prompt')}
          />
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('write')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'write'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                ✍️ Write
              </button>
              <button
                onClick={() => setActiveTab('entries')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'entries'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                📚 Entries
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                🌙 Luna Insights
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'write' && (
              <JournalEditor
                initialTitle={selectedEntry?.title ?? ''}
                initialContent={selectedEntry?.content ?? ''}
                initialMood={selectedEntry?.mood}
                onSave={handleSaveEntry}
                autoSaveDelay={2000}
              />
            )}

            {activeTab === 'entries' && (
              <JournalList
                entries={entries}
                onSelectEntry={handleSelectEntry}
                onDeleteEntry={handleDeleteEntry}
              />
            )}

            {activeTab === 'calendar' && (
              <JournalCalendar
                entries={entries}
                onSelectDate={(date) => console.log('Selected date:', date)}
              />
            )}

            {activeTab === 'insights' && (
              <LunaInsights
                insights={mockInsights}
                onMarkAsRead={(id) => console.log('Mark as read:', id)}
              />
            )}
          </div>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalEntries}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.averageMood?.toFixed(1) ?? 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Mood</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
