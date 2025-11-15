/**
 * Password Strength Indicator Component
 *
 * Displays password strength and validation requirements.
 */

'use client';

import React from 'react';
import { validatePassword, PASSWORD_RULES } from '../utils/validation';

type PasswordStrengthIndicatorProps = {
  password: string;
  className?: string;
};

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const validation = validatePassword(password);

  if (!password) {
    return null;
  }

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthWidths = {
    weak: 'w-1/3',
    medium: 'w-2/3',
    strong: 'w-full',
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Password strength:</span>
          <span
            className={`font-medium ${
              validation.strength === 'weak'
                ? 'text-red-600'
                : validation.strength === 'medium'
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {strengthLabels[validation.strength]}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[validation.strength]} ${strengthWidths[validation.strength]}`}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1 text-xs">
        <Requirement met={password.length >= PASSWORD_RULES.minLength}>
          At least {PASSWORD_RULES.minLength} characters
        </Requirement>
        <Requirement met={/[A-Z]/.test(password)}>One uppercase letter</Requirement>
        <Requirement met={/[a-z]/.test(password)}>One lowercase letter</Requirement>
        <Requirement met={/\d/.test(password)}>One number</Requirement>
        <Requirement met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}>
          One special character
        </Requirement>
        <Requirement met={!PASSWORD_RULES.commonPasswordsBlacklist.includes(password.toLowerCase())}>
          Not a common password
        </Requirement>
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="text-xs text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index}>• {error}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Requirement item component
 */
function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {met ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : (
          <circle cx="12" cy="12" r="10" strokeWidth={2} opacity={0.3} />
        )}
      </svg>
      <span>{children}</span>
    </div>
  );
}
