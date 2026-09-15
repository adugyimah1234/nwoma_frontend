'use client';

import { Suspense } from 'react';
import { NavigationProgress } from '@/components/ui/navigation-progress';

/**
 * Wraps NavigationProgress in a Suspense boundary as required
 * by Next.js when using useSearchParams() in a client component.
 */
export function NavigationProgressProvider() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  );
}

