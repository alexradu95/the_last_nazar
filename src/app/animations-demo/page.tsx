/**
 * Animations Demo Page
 *
 * Showcases all available animations and components
 */

'use client';

import { useState } from 'react';
import {
  AnimatedComponent,
  ProgressBar,
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  XPAnimation,
  LevelUpCelebration,
  AchievementUnlock,
  useToast,
} from '@/components/animations';

export default function AnimationsDemoPage() {
  const [progress, setProgress] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const toast = useToast();

  const triggerXP = () => {
    setShowXP(true);
  };

  const triggerLevelUp = () => {
    setShowLevelUp(true);
  };

  const triggerAchievement = () => {
    setShowAchievement(true);
  };

  const increaseProgress = () => {
    setProgress((prev) => Math.min(prev + 10, 100));
  };

  const resetProgress = () => {
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Animation System Demo</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Interactive showcase of all animation components and utilities
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Entrance Animations */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Entrance Animations</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <AnimatedComponent animation="fadeIn" className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Fade In</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smooth opacity transition</p>
            </AnimatedComponent>

            <AnimatedComponent animation="slideUp" delay={200} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Slide Up</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Slides in from bottom</p>
            </AnimatedComponent>

            <AnimatedComponent animation="scaleIn" delay={400} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Scale In</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spring-based scale effect</p>
            </AnimatedComponent>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Progress Bar</h2>
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <ProgressBar progress={progress} showLabel color="bg-blue-600" />
            <div className="mt-4 flex gap-4">
              <button
                onClick={increaseProgress}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Increase Progress
              </button>
              <button onClick={resetProgress} className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Loading States</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Loading Spinner</h3>
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size={48} />
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Skeleton Loaders</h3>
              <div className="space-y-4">
                <Skeleton height="24px" width="60%" />
                <Skeleton height="16px" width="80%" />
                <Skeleton height="16px" width="70%" />
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton Patterns */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Skeleton Patterns</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Card Skeleton</h3>
              <SkeletonCard />
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">List Skeleton</h3>
              <SkeletonList count={3} />
            </div>
          </div>
        </section>

        {/* Gamification Animations */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Gamification Animations</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">XP Animation</h3>
              <button
                onClick={triggerXP}
                className="w-full rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                +100 XP
              </button>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Level Up</h3>
              <button
                onClick={triggerLevelUp}
                className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Level Up! 🎉
              </button>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Achievement</h3>
              <button
                onClick={triggerAchievement}
                className="w-full rounded-md bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
              >
                Unlock Achievement
              </button>
            </div>
          </div>
        </section>

        {/* Toast Notifications */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Toast Notifications</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <button
              onClick={() => toast.showSuccess('Operation successful!')}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Success Toast
            </button>
            <button
              onClick={() => toast.showError('Something went wrong!')}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Error Toast
            </button>
            <button
              onClick={() => toast.showInfo('Here is some information')}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Info Toast
            </button>
            <button
              onClick={() => toast.showWarning('Please be careful!')}
              className="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            >
              Warning Toast
            </button>
          </div>
        </section>

        {/* Documentation Link */}
        <section>
          <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
            <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">📚 Documentation</h3>
            <p className="mb-4 text-blue-800 dark:text-blue-200">
              For complete documentation, usage examples, and API reference, see{' '}
              <code className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-800">ANIMATION_SYSTEM.md</code>
            </p>
            <div className="flex gap-4">
              <a
                href="/ANIMATION_SYSTEM.md"
                target="_blank"
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                View Documentation
              </a>
              <a
                href="https://animejs.com/documentation/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Anime.js Docs
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Triggered Animations */}
      {showXP && <XPAnimation amount={100} onComplete={() => setShowXP(false)} />}
      {showLevelUp && <LevelUpCelebration level={5} onComplete={() => setShowLevelUp(false)} />}
      {showAchievement && (
        <AchievementUnlock
          title="First Animation!"
          description="You triggered your first achievement"
          onComplete={() => setShowAchievement(false)}
        />
      )}
    </div>
  );
}
