'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/layout/page-header';
import ProfessionalDashboard from '@/components/chart-blocks/charts/average-tickets-created';
import CommandDashboard from '@/components/chart-blocks/charts/average-tickets-created/components/CommandDashboard';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const userRole = (user.role || '').toLowerCase().replace(/_/g, '');
      if (userRole === 'superadmin') {
        router.push('/super-admin');
      } else if (userRole === 'garrisondirector') {
        router.push('/garrison-director');
      }
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Prevent superadmin from rendering the Garrison School dashboard if redirect is pending
  const normalizedRole = (user.role || '').toLowerCase().replace(/_/g, '');
  if (normalizedRole === 'superadmin') {
    return null;
  }

  const isCommand = ['admin', 'garrisondirector', 'schooladmin'].includes(normalizedRole);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      {isCommand ? <CommandDashboard /> : (
        <>
          <PageHeader
            title="Dashboard"
            description="Registration analytics and insights"
            breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Dashboard' }]}
          />
          <ProfessionalDashboard />
        </>
      )}
    </div>
  );
}
