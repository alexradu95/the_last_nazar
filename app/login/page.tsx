/**
 * Login Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/src/features/auth/components';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <LoginForm
          onSuccess={() => router.push('/dashboard')}
          onRegister={() => router.push('/register')}
          onForgotPassword={() => router.push('/forgot-password')}
        />
      </div>
    </div>
  );
}
