'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-8xl font-bold tracking-tight">403</h1>
      <h2 className="text-2xl font-semibold">Forbidden</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        You don&apos;t have permission to access this page.
      </p>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    </div>
  );
}
