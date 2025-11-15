/**
 * Home Page - Landing Page with Auth Demo
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/src/features/auth/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My App</h1>
            {!loading && (
              <div className="flex gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Authentication Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A complete authentication system built with Next.js 15, featuring secure login, registration,
            password management, and session handling.
          </p>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Logged In!</h2>
              <p className="text-gray-600 mb-6">Welcome back, {user?.name}</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-lg font-medium"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔐"
            title="Secure Authentication"
            description="Industry-standard bcrypt password hashing with salt and secure session management."
          />
          <FeatureCard
            icon="🛡️"
            title="Rate Limiting"
            description="Protection against brute force attacks with configurable rate limits and account lockout."
          />
          <FeatureCard
            icon="✉️"
            title="Email Verification"
            description="Email verification system with secure tokens and expiration handling."
          />
          <FeatureCard
            icon="🔑"
            title="Password Reset"
            description="Secure password reset flow with time-limited tokens sent via email."
          />
          <FeatureCard
            icon="📊"
            title="Session Management"
            description="JWT-like session tokens with configurable expiration and remember me functionality."
          />
          <FeatureCard
            icon="⚡"
            title="Real-time Validation"
            description="Live password strength indicator and instant input validation feedback."
          />
        </div>

        {/* Tech Stack */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechBadge name="Next.js 15" />
            <TechBadge name="React 19" />
            <TechBadge name="TypeScript" />
            <TechBadge name="Tailwind CSS" />
            <TechBadge name="Drizzle ORM" />
            <TechBadge name="SQLite" />
            <TechBadge name="Bcrypt" />
            <TechBadge name="Zod" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password</Link>
            <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>Authentication Feature Demo - Built with Next.js 15</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-center font-medium">
      {name}
    </div>
  );
}
