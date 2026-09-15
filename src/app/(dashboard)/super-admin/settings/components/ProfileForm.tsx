'use client';

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { SettingsFormValues } from '../schemas';

interface ProfileFormProps {
  control: Control<SettingsFormValues>;
  logoPreview: string | null;
  onUploadClick: () => void;
}

export function ProfileForm({ control, logoPreview, onUploadClick }: ProfileFormProps) {
  return (
    <Card className="shadow-sm border-none bg-muted/20">
      <CardHeader>
        <CardTitle className="text-base font-bold">Executive Profile</CardTitle>
        <CardDescription>Manage your administrative identity and access credentials.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b">
          <div className="size-20 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden ring-4 ring-background">
            {logoPreview ? (
              <img src={logoPreview} alt="Avatar" className="size-full object-cover" />
            ) : (
              <User className="size-10 text-white/50" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold tracking-tight">System Administrator</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Network HQ Supervisor</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="profile.full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Full Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="profile.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Official Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="profile.password"
            render={({ field }) => (
              <FormItem className="border-t pt-4">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="profile.confirm_password"
            render={({ field }) => (
              <FormItem className="border-t pt-4">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

