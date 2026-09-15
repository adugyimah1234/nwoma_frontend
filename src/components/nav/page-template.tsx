// page-template.tsx
'use client';

import { Loader } from '@/components/ui/loader';
import { useEffect, useState } from 'react';

interface PageProps {
  title: string;
  children?: React.ReactNode;
}

export function PageTemplate({ title, children }: PageProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {children}
        </div>
      )}
    </div>
  );
}
