/**
 * Register Page
 */

'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/src/features/auth/components';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <RegisterForm
          onSuccess={() => router.push('/dashboard')}
          onLogin={() => router.push('/login')}
        />
      </div>
    </div>
  );
}
