'use client';

import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettingsFormValues } from '../schemas';

interface GradeGovernanceFormProps {
  control: Control<SettingsFormValues>;
}

export function GradeGovernanceForm({ control }: GradeGovernanceFormProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Grade Governance & Weighting</CardTitle>
            <CardDescription>Define how scores are calculated across the network.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold">LEVEL: GLOBAL</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <FormLabel className="text-xs font-black tracking-widest text-muted-foreground uppercase">Assessment Weighting (%)</FormLabel>
            <div className="space-y-4">
              <FormField
                control={control}
                name="gradeGov.ca_weight"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-sm font-medium">Continuous Assessment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-20 text-right font-black h-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="gradeGov.exam_weight"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="text-sm font-medium">End of Term Assessment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="w-20 text-right font-black h-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="space-y-4">
            <FormLabel className="text-xs font-black tracking-widest text-muted-foreground uppercase">Grading Template Preview</FormLabel>
            <div className="space-y-2 opacity-60">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border text-xs font-bold"><Badge className="w-8 justify-center">A</Badge><span className="flex-1">80 - 100</span><span className="text-emerald-600 uppercase">Excellent</span></div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border text-xs font-bold"><Badge className="w-8 justify-center" variant="secondary">B</Badge><span className="flex-1">70 - 79</span><span className="text-blue-600 uppercase">Very Good</span></div>
            </div>
          </div>
        </div>
        <FormField
          control={control}
          name="gradeGov.local_autonomy"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between border-t pt-6 space-y-0">
              <div className="space-y-1">
                <FormLabel className="text-sm font-bold">Local Autonomy Override</FormLabel>
                <CardDescription className="text-xs">Allow Garrison Directors to define their own specific weights.</CardDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
