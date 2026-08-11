'use client';

import React, { useRef } from 'react';
import {
  Palette,
  Key,
  User,
  Save,
  RefreshCw,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { Form } from '@/components/ui/form';
import { ProfileForm } from './components/ProfileForm';
import { BrandingForm } from './components/BrandingForm';
import { GradeGovernanceForm } from './components/GradeGovernanceForm';
import { CommunicationForm } from './components/CommunicationForm';
import { ApiGateways } from './components/ApiGateways';
import { useSettings } from './hooks/useSettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function SuperAdminSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    form,
    fetching,
    loading,
    apiToken,
    logoPreview,
    setLogoPreview,
    setLogoFile,
    handleSyncAll,
    handleRegenerateToken
  } = useSettings();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center italic text-muted-foreground">
        Initializing Headquarters Registry...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSyncAll)} className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Executive Governance & Standards"
          description="Define the laws of the network: Branding, Authority, and Educational Standards."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Super Admin' }, { title: 'Governance' }]}
        />

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 space-y-0">
          <TabsList className="flex flex-col h-auto bg-transparent border-r rounded-none w-full md:w-64 space-y-1 p-0 items-start">
            <TabsTrigger value="profile" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-r-none rounded-l-lg transition-all text-sm font-semibold">
              <User className="size-4" /> My Profile
            </TabsTrigger>
            <TabsTrigger value="branding" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-semibold">
              <Palette className="size-4" /> Branding & Media
            </TabsTrigger>
            <TabsTrigger value="educational" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-semibold">
              <GraduationCap className="size-4" /> Grade Governance
            </TabsTrigger>
            <TabsTrigger value="communications" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-semibold">
              <MessageSquare className="size-4" /> Email & SMS Node
            </TabsTrigger>
            <TabsTrigger value="gateways" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-none rounded-r-none transition-all text-sm font-semibold">
              <Key className="size-4" /> API Gateways
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 space-y-6">
            <TabsContent value="profile" className="mt-0">
              <ProfileForm
                control={form.control}
                logoPreview={logoPreview}
                onUploadClick={() => fileInputRef.current?.click()}
              />
            </TabsContent>

            <TabsContent value="branding" className="mt-0">
              <BrandingForm
                control={form.control}
                logoPreview={logoPreview}
                onUploadClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                onLogoChange={handleLogoChange}
              />
            </TabsContent>

            <TabsContent value="educational" className="mt-0">
              <GradeGovernanceForm control={form.control} />
            </TabsContent>

            <TabsContent value="communications" className="mt-0">
              <CommunicationForm control={form.control} />
            </TabsContent>

            <TabsContent value="gateways" className="mt-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div>
                    <ApiGateways
                      apiToken={apiToken}
                      onRegenerate={() => {}} // Controlled by trigger
                    />
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will invalidate all current integrations. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRegenerateToken}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
          </div>
        </Tabs>

        <div className="fixed bottom-8 right-8">
          <Button type="submit" disabled={loading} className="rounded-full h-12 px-10 shadow-2xl shadow-primary/40 gap-2 font-bold tracking-tight">
            {loading ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            Synchronize Registry
          </Button>
        </div>
      </form>
    </Form>
  );
}
