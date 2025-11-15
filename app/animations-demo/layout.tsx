/**
 * Animations Demo Layout
 *
 * Wraps the demo page with ToastProvider
 */

import { ToastProvider } from '@/components/animations';

export default function AnimationsDemoLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
