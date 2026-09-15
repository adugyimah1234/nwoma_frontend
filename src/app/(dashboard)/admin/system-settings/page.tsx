'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useState } from 'react';
import {
  Settings,
  Calendar,
  Lock,
  Wrench,
  MessageSquare,
  Building2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AcademicYearSettings from './components/academic-year-settings';
import TermSettings from './components/term-settings';
import GeneralSettings from './components/general-settings';
import SecuritySettings from './components/security-settings';
import SubjectSettings from './components/subject-settings';
import RemarksSettings from './components/remarks-settings';
import SchoolSettings from './components/school-settings';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
        <PageHeader
          title="System Settings"
          description="Manage institutional profile, academic cycles, and global application configurations."
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Admin', href: '/admin' },
            { title: 'Settings' }
          ]}
        />

        <div className="space-y-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-8">
            <TabsList className="flex flex-col h-auto bg-transparent border-r rounded-none w-full md:w-64 space-y-1 p-0 items-start">
              <TabsTrigger value="general" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <Wrench className="size-4" /> General Settings
              </TabsTrigger>
              <TabsTrigger value="institution" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <Building2 className="size-4" /> Institutional Setup
              </TabsTrigger>
              <TabsTrigger value="academic-years" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <Calendar className="size-4" /> Academic Years
              </TabsTrigger>
              <TabsTrigger value="academic-terms" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <Calendar className="size-4" /> Academic Terms
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <Settings className="size-4" /> Curriculum Standard
              </TabsTrigger>
              <TabsTrigger value="remarks" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <MessageSquare className="size-4" /> Remarks Repository
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-medium">
                <Lock className="size-4" /> Security Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="general" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <GeneralSettings />
              </TabsContent>

              <TabsContent value="institution" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <SchoolSettings />
              </TabsContent>

              <TabsContent value="academic-years" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <AcademicYearSettings />
              </TabsContent>

              <TabsContent value="academic-terms" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <TermSettings />
              </TabsContent>

              <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <SubjectSettings />
              </TabsContent>

              <TabsContent value="remarks" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <RemarksSettings />
              </TabsContent>

              <TabsContent value="security" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2">
                <SecuritySettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
  );
}

