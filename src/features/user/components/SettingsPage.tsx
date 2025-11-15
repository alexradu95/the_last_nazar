/**
 * SettingsPage Component
 *
 * Main settings page wrapper (for feature routing)
 */

'use client';

import { UserSettings } from './UserSettings';

export default function SettingsPage() {
  // In a real app, get userId from auth context
  const userId = 'demo-user-id';

  return <UserSettings userId={userId} />;
}
