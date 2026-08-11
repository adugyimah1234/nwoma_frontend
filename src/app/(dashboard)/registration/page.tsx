'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';

export default function RegistrationSection() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
        <PageHeader
          title="Registration"
          description="Manage new student registrations and applicants."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Registration' }]}
          tabs={[
            { title: 'New Registration', href: '/registration/new' },
            { title: 'Manage Applicants', href: '/registration/manage' },
          ]}
        />
      </div>
  );
}