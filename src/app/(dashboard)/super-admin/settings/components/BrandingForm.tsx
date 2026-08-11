'use client';

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { SettingsFormValues } from '../schemas';

interface BrandingFormProps {
  control: Control<SettingsFormValues>;
  logoPreview: string | null;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BrandingForm({ control, logoPreview, onUploadClick, fileInputRef, onLogoChange }: BrandingFormProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-base font-bold">Institutional Standards (Visual)</CardTitle>
        <CardDescription>Establish the official branding for receipts, report cards, and portals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Network Master Crest</FormLabel>
            <div
              onClick={onUploadClick}
              className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="max-h-24 object-contain mb-2" />
              ) : (
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all"><Upload className="size-5" /></div>
              )}
              <p className="text-xs font-bold text-center">Click to update institutional logo</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onLogoChange} />
            </div>
          </div>
          <div className="space-y-4">
            <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Header Logic</FormLabel>
            <div className="space-y-4">
              <FormField
                control={control}
                name="branding.primary_header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Primary Header</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="branding.sub_header"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Sub-Header</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="border-t pt-6">
          <FormField
            control={control}
            name="branding.footer_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Footer Text (Standard)</FormLabel>
                <FormControl>
                  <Input className="mt-2" {...field} />
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
