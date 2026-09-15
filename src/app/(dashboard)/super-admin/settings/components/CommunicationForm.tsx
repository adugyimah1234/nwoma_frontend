'use client';

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Mail } from 'lucide-react';
import { SettingsFormValues } from '../schemas';

interface CommunicationFormProps {
  control: Control<SettingsFormValues>;
}

export function CommunicationForm({ control }: CommunicationFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2"><Smartphone className="size-4 text-primary" /> SMS Gateway Configuration</CardTitle>
          <CardDescription>Primary provider for high-speed institutional alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <FormField
            control={control}
            name="communications.sms_api_key"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Arkesel API Key</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Paste your API key here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="communications.sms_sender_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Sender ID</FormLabel>
                <FormControl>
                  <Input placeholder="Max 11 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4 space-y-3">
            <FormField
              control={control}
              name="communications.enable_sms_receipts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="text-xs font-medium">SMS for Receipts</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="communications.enable_sms_admissions"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="text-xs font-medium">SMS for Admissions</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2"><Mail className="size-4 text-primary" /> SMTP Infrastructure</CardTitle>
          <CardDescription>Node for delivering official PDF documents and reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="communications.email_smtp_host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">SMTP Host</FormLabel>
                  <FormControl>
                    <Input placeholder="smtp.gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="communications.email_smtp_port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Port</FormLabel>
                  <FormControl>
                    <Input placeholder="587" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="communications.email_smtp_user"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Username</FormLabel>
                <FormControl>
                  <Input placeholder="hq.director@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="communications.email_smtp_pass"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4 border-t">
            <FormField
              control={control}
              name="communications.enable_email_receipts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="text-xs font-medium">Email for Receipts</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

