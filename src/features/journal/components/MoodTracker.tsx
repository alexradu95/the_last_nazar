/**
 * Mood Tracker Component
 *
 * Track and visualize mood
 */

'use client';

import { useState } from 'react';
import { useMoodTracking } from '../hooks/useMoodTracking';
import type { Mood } from '../schema';

type MoodTrackerProps = {
  userId: string;
};

const MOODS: Array<{ value: Mood; emoji: string }> = [
  { value: 'happy', emoji: '😊' },
  { value: 'excited', emoji: '🎉' },
  { value: 'grateful', emoji: '🙏' },
  { value: 'calm', emoji: '😌' },
  { value: 'tired', emoji: '😴' },
  { value: 'stressed', emoji: '😰' },
  { value: 'sad', emoji: '😢' },
  { value: 'angry', emoji: '😠' },
];

export const MoodTracker = ({ userId }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const { insights, logMood, loading } = useMoodTracking(userId);

  const handleMoodClick = async (mood: Mood) => {
    setSelectedMood(mood);
    try {
      await logMood(mood);
      setSelectedMood(null);
    } catch (error) {
      console.error('Failed to log mood:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">How are you feeling?</h2>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodClick(mood.value)}
            disabled={loading}
            className={`p-3 text-3xl rounded-lg hover:bg-gray-100 transition-colors ${
              selectedMood === mood.value ? 'bg-blue-100' : ''
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={mood.value}
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      {insights && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Dominant mood: <span className="font-semibold">{insights.dominantMood}</span>
          </p>
        </div>
      )}
    </div>
  );
};
