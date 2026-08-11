/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';

// Services
import { createFee } from '@/services/fee';
import { getAllCategories } from '@/services/categories';
import classService, { type ClassData } from '@/services/class';
import { getAllAcademicYear, type academicYear } from '@/services/academic_year';

// Types
import { type CreateFeePayload } from '@/types/fee';
import { type Category } from '@/types/assessment';

// Form schema with validation
const feeFormSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be greater than zero"),
  category_id: z
    .number({ required_error: "Category is required" }),
  class_id: z
    .number({ required_error: "Class is required" }),
  fee_type: z
    .enum(["registration", "admission", "tuition", "assessment"] as const, {
      required_error: "Fee type is required",
    }),
  description: z
    .string()
    .optional(),
  academic_year_id: z
    .number({ required_error: "Academic year is required" }),
});

type FeeFormValues = z.infer<typeof feeFormSchema>;

// Default values for the form
const defaultValues: Partial<FeeFormValues> = {
  fee_type: "tuition",
  description: "",
};

interface AddFeeDialogProps {
  onSuccess: () => void;
}

export default function AddFeeDialog({ onSuccess }: AddFeeDialogProps) {
  // Dialog state
  const [open, setOpen] = useState(false);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Data for select inputs
  const [academicYears, setAcademicYears] = useState<academicYear[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  
  // Form setup
  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeFormSchema),
    defaultValues,
  });
  
  // Load reference data when dialog opens
  useEffect(() => {
    if (open) {
      loadReferenceData();
    }
  }, [open]);
  
  // Load all reference data needed for the form
  const loadReferenceData = async () => {
    setIsLoadingData(true);
    try {
      // Load in parallel for better performance
      const [yearsData, categoriesData, classesData] = await Promise.all([
        getAllAcademicYear(),
        getAllCategories(),
        classService.getAll()
      ]);
      
      setAcademicYears(yearsData);
      setCategories(categoriesData);
      setClasses(classesData);
      
      // Pre-select first items if available
      if (yearsData.length > 0) {
        form.setValue('academic_year_id', yearsData[0].id as any);
      }
      
      if (categoriesData.length > 0) {
        form.setValue('category_id', categoriesData[0].id as any);
      }
      
      if (classesData.length > 0) {
        form.setValue('class_id', classesData[0].id as any);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
      toast.error('Failed to load necessary data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: FeeFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateFeePayload = {
        amount: data.amount,
        category_id: String(data.category_id),
        class_id: String(data.class_id),
        fee_type: data.fee_type,
        academic_year_id: String(data.academic_year_id),
        description: data.description
      };
      
      await createFee(payload);
      
      toast.success('Fee created successfully');
      setOpen(false);
      onSuccess();
      form.reset(defaultValues);
    } catch (error: any) {
      console.error('Error creating fee:', error);
      toast.error(error.message || 'Failed to create fee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        form.reset(defaultValues);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Fee
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>Add New Fee</DialogTitle>
        <DialogDescription>
          Create a new fee by filling out the form below. All fields marked with * are required.
        </DialogDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isSubmitting || isLoadingData}
                    />
                  </FormControl>
                  <FormDescription>
                    The fee amount in your local currency
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee Type Field */}
            <FormField
              control={form.control}
              name="fee_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoadingData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Type of fee being charged
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value?.toString()}
                    disabled={isSubmitting || isLoadingData || categories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingData ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="p-2 text-center text-sm">No categories found</div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Field */}
            <FormField
              control={form.control}
              name="class_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value?.toString()}
                    disabled={isSubmitting || isLoadingData || classes.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingData ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : classes.length === 0 ? (
                        <div className="p-2 text-center text-sm">No classes found</div>
                      ) : (
                        classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Academic Year Field */}
            <FormField
              control={form.control}
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={field.value?.toString()}
                    disabled={isSubmitting || isLoadingData || academicYears.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingData ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : academicYears.length === 0 ? (
                        <div className="p-2 text-center text-sm">No academic years found</div>
                      ) : (
                        academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id.toString()}>
                            {year.year}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add additional details about this fee"
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting || isLoadingData}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description or notes about the fee
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingData}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Fee'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

