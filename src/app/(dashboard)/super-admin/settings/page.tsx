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
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { Form } from '@/components/ui/form';
import { ProfileForm } from './components/ProfileForm';
import { BrandingForm } from './components/BrandingForm';
import { GradeGovernanceForm } from './components/GradeGovernanceForm';
import { CommunicationForm } from './components/CommunicationForm';
import { DisplaySettings } from './components/DisplaySettings';
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

        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 space-y-0 relative">
          <div className="w-full md:w-72 shrink-0">
            <TabsList className="sticky top-24 flex flex-col h-auto bg-card/50 border rounded-2xl p-2 items-start shadow-sm w-full space-y-1">
              <TabsTrigger value="profile" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none rounded-xl transition-all text-sm font-semibold group">
                <User className="size-4 group-data-[state=active]:text-white" /> My Profile
              </TabsTrigger>
              <TabsTrigger value="branding" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none rounded-xl transition-all text-sm font-semibold group">
                <Palette className="size-4 group-data-[state=active]:text-white" /> Branding & Media
              </TabsTrigger>
              <TabsTrigger value="educational" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none rounded-xl transition-all text-sm font-semibold group">
                <GraduationCap className="size-4 group-data-[state=active]:text-white" /> Grade Governance
              </TabsTrigger>
              <TabsTrigger value="communications" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none rounded-xl transition-all text-sm font-semibold group">
                <MessageSquare className="size-4 group-data-[state=active]:text-white" /> Email & SMS Node
              </TabsTrigger>
              <TabsTrigger value="display" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none rounded-xl transition-all text-sm font-semibold group">
                <Monitor className="size-4 group-data-[state=active]:text-white" /> Display & Scaling
              </TabsTrigger>
              <TabsTrigger value="gateways" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-none rounded-xl transition-all text-sm font-semibold group">
                <Key className="size-4 group-data-[state=active]:text-white" /> API Gateways
              </TabsTrigger>
            </TabsList>
          </div>

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

            <TabsContent value="display" className="mt-0">
              <DisplaySettings />
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
