'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-8xl font-bold tracking-tight">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    </div>
  );
}

