'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NavigationProgress
 *
 * A slim progress bar that animates across the top of the page
 * on every client-side navigation. Works with Next.js App Router.
 * No external packages needed — uses framer-motion (already installed).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef<string>('');

  const currentPath = pathname + searchParams.toString();

  // Detect route changes
  useEffect(() => {
    if (prevPathRef.current && prevPathRef.current !== currentPath) {
      // Route finished — complete the bar
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timeout);
    }
    prevPathRef.current = currentPath;
  }, [currentPath]);

  // Intercept Link clicks to start the bar immediately on click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only trigger for internal, non-hash links
      const isInternal =
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#');

      if (!isInternal) return;

      // Don't trigger if same page
      const targetPath = href.split('?')[0];
      const currentPathname = window.location.pathname;
      if (targetPath === currentPathname) return;

      startProgress();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setIsLoading(true);
    setProgress(5);

    // Simulate realistic progress that stalls near the end
    let current = 5;
    timerRef.current = setInterval(() => {
      // Ease towards 90% — never reaches 100% until route completes
      const step = current < 30 ? 8 : current < 60 ? 4 : current < 80 ? 2 : 0.5;
      current = Math.min(current + step, 90);
      setProgress(current);

      if (current >= 90) {
        clearInterval(timerRef.current!);
      }
    }, 150);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
        >
          <motion.div
            className="h-full bg-primary rounded-r-full shadow-[0_0_8px_0px_hsl(var(--primary)/0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

