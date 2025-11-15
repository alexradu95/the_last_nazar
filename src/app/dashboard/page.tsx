/**
 * Dashboard Page - Protected Route Example
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">You are successfully authenticated.</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="text-gray-900 font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timezone</label>
              <p className="text-gray-900">{user?.timezone}</p>
            </div>
            {user?.lastLoginAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-gray-900">
                  {new Date(user.lastLoginAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Card */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Authentication Features
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Email/Password Authentication
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Session Management
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Password Strength Validation
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rate Limiting Protection
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Password Reset Flow
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Email Verification
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
