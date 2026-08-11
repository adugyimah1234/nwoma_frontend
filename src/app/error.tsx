'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-8xl font-bold tracking-tight">500</h1>
      <h2 className="text-2xl font-semibold">Internal Server Error</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong on our end. Please try again.
      </p>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={reset}>Try Again</Button>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    </div>
  );
}
