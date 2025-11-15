/**
 * Journal Page Component
 *
 * Main journal interface
 */

'use client';

import { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { JournalEditor } from './JournalEditor';
import { JournalList } from './JournalList';
import { JournalStats } from './JournalStats';
import { MoodTracker } from './MoodTracker';

type JournalPageProps = {
  userId: string;
};

export const JournalPage = ({ userId }: JournalPageProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const { entries, stats, loading, createEntry, updateEntry, deleteEntry, refresh } = useJournal(userId);

  const handleCreateEntry = async (data: any) => {
    await createEntry(data);
    setShowEditor(false);
  };

  const handleUpdateEntry = async (id: string, data: any) => {
    await updateEntry(id, data);
    setEditingEntryId(null);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id);
    }
  };

  const handleEdit = (id: string) => {
    setEditingEntryId(id);
    setShowEditor(true);
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your journal...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Journal</h1>
          <p className="text-gray-600">Reflect, grow, and track your journey</p>
        </div>

        {/* Stats and Mood Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <JournalStats stats={stats} />
          </div>
          <div>
            <MoodTracker userId={userId} />
          </div>
        </div>

        {/* Write Button */}
        {!showEditor && (
          <div className="mb-8">
            <button
              onClick={() => setShowEditor(true)}
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              ✍️ Write Today's Entry
            </button>
          </div>
        )}

        {/* Editor */}
        {showEditor && (
          <div className="mb-8">
            <JournalEditor
              userId={userId}
              entryId={editingEntryId}
              onSave={editingEntryId ? handleUpdateEntry : handleCreateEntry}
              onCancel={() => {
                setShowEditor(false);
                setEditingEntryId(null);
              }}
            />
          </div>
        )}

        {/* Journal Entries List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Entries</h2>
          <JournalList
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDeleteEntry}
          />
        </div>
      </div>
    </div>
  );
};
