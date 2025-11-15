/**
 * UserProfilePage Component
 *
 * Main user profile page
 */

'use client';

import { useUser } from '../hooks/useUser';
import { UserAvatar } from './UserAvatar';

interface UserProfilePageProps {
  userId: string;
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const { user, stats, loading, error } = useUser(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-6">
          <UserAvatar user={user} size="xl" />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-600 mb-1">{user.email}</p>
            {user.bio && <p className="text-gray-700 mt-4">{user.bio}</p>}

            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {user.timezone || 'UTC'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total XP</div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalXP}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Level</div>
            <div className="text-3xl font-bold text-blue-600">{stats.currentLevel}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Tasks Completed</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.completedTasks} / {stats.totalTasks}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Journal Entries</div>
            <div className="text-3xl font-bold text-orange-600">{stats.journalEntries}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Account Age</div>
            <div className="text-3xl font-bold text-gray-600">
              {stats.accountAge} {stats.accountAge === 1 ? 'day' : 'days'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Last Active</div>
            <div className="text-lg font-semibold text-gray-600">
              {stats.lastActive
                ? new Date(stats.lastActive).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
