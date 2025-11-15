/**
 * Journal Editor Component
 *
 * Rich text editor for creating and editing journal entries.
 * Includes auto-save functionality and word count.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MoodSelector, type MoodLevel } from './MoodSelector';

interface JournalEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialMood?: MoodLevel;
  onSave: (data: { title: string; content: string; mood?: MoodLevel }) => Promise<void>;
  autoSaveDelay?: number;
  className?: string;
}

export function JournalEditor({
  initialTitle = '',
  initialContent = '',
  initialMood,
  onSave,
  autoSaveDelay = 2000,
  className = '',
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<MoodLevel | undefined>(initialMood);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Calculate word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Auto-save functionality
  const saveEntry = useCallback(async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      await onSave({ title, content, mood });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, mood, onSave]);

  // Trigger auto-save when content changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveEntry();
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveEntry, autoSaveDelay]);

  // Mark as having unsaved changes when editing
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleMoodChange = (newMood: MoodLevel) => {
    setMood(newMood);
    setHasUnsavedChanges(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with save status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Journal Entry
          </span>
          {isSaving && (
            <span className="text-xs text-blue-600 dark:text-blue-400">Saving...</span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Saved {formatRelativeTime(lastSaved)}
            </span>
          )}
          {!isSaving && hasUnsavedChanges && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Word count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
        </div>
      </div>

      {/* Title input */}
      <input
        type="text"
        placeholder="Entry title (optional)"
        value={title}
        onChange={handleTitleChange}
        className="w-full px-4 py-2 text-lg font-semibold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
      />

      {/* Mood selector */}
      <MoodSelector value={mood} onChange={handleMoodChange} />

      {/* Content textarea */}
      <div className="relative">
        <textarea
          placeholder="Start writing your thoughts..."
          value={content}
          onChange={handleContentChange}
          className="w-full min-h-[400px] p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none resize-y transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
          autoFocus
        />

        {/* Character count indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-600">
          {content.length.toLocaleString()} characters
        </div>
      </div>

      {/* Manual save button */}
      <div className="flex items-center justify-end gap-3">
        <motion.button
          type="button"
          onClick={saveEntry}
          disabled={isSaving || !content.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSaving ? 'Saving...' : 'Save Entry'}
        </motion.button>
      </div>

      {/* Tips */}
      {content.length === 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            💡 Writing Tips
          </div>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Write freely without worrying about grammar or structure</li>
            <li>Focus on your feelings and experiences</li>
            <li>Be honest and authentic with yourself</li>
            <li>There's no right or wrong way to journal</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);

  if (diffSecs < 10) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
