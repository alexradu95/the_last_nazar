/**
 * Forgot Password Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from '@/features/auth/components';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <ForgotPasswordForm
          onSuccess={() => {
            // Success message is shown in the form component
          }}
          onBackToLogin={() => router.push('/login')}
        />
      </div>
    </div>
  );
}
