/**
 * UserAvatar Component
 *
 * Displays user avatar or initials fallback
 */

'use client';

import type { User } from '../schema';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const initials = getInitials(user.name);

  if (user.avatar) {
    return (
      <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
        <img
          src={user.avatar}
          alt={`${user.name}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
