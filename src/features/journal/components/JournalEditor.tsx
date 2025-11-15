/**
 * Journal Editor Component
 *
 * Rich text editor for journal entries
 */

'use client';

import { useState, useEffect } from 'react';
import type { Mood } from '../schema';

type JournalEditorProps = {
  userId: string;
  entryId?: string | null;
  initialContent?: string;
  initialTitle?: string;
  initialMood?: Mood;
  initialTags?: string[];
  onSave: (id: string, data: any) => Promise<void> | ((data: any) => Promise<void>);
  onCancel: () => void;
};

const MOODS: Array<{ value: Mood; emoji: string; label: string }> = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🎉', label: 'Excited' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'angry', emoji: '😠', label: 'Angry' },
];

export const JournalEditor = ({
  userId,
  entryId,
  initialContent = '',
  initialTitle = '',
  initialMood,
  initialTags = [],
  onSave,
  onCancel,
}: JournalEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<Mood | undefined>(initialMood);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Please write something before saving!');
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim() || undefined,
        content: content.trim(),
        mood,
        tags: tags.length > 0 ? tags : undefined,
        isPrivate,
      };

      if (entryId) {
        await onSave(entryId, data);
      } else {
        await onSave(data);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title (optional)"
          className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2"
        />
      </div>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today?"
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
        />
        <div className="text-sm text-gray-500 mt-2">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">How are you feeling?</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? undefined : m.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                mood === m.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mr-2">{m.emoji}</span>
              <span className="text-sm">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Add
          </button>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Keep this entry private</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
