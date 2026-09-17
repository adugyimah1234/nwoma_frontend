/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { createReceiptSchema, CreateReceiptFormValues } from '../schemas';
import { Student } from '@/types/student';
import { RegistrationData } from '@/services/registrations';
import { Category } from '@/services/categories';
import { Receipt } from '@/types/receipt';
import { createReceipt } from '@/services/receipt';
import registrationService from '@/services/registrations';

interface CreateReceiptFormProps {
  applicants: RegistrationData[];
  realStudents: Student[];
  categories: Category[];
  classes: { id: string | number; name: string }[];
  existingReceipts: Receipt[];
  onSuccess: () => void;
  onCancel: () => void;
}

const JERSEY_PRICE_MAP: Record<string, number> = {
  S: 115, M: 115, L: 115, XL: 115,
};

const TEXTBOOKS_MAP: Record<string, number> = {
  'kg 1 a': 345, 'kg 1 b': 345, 'kg 1 c': 345, 'kg 1 d': 345,
  'kg 2 a': 345, 'kg 2 b': 345, 'kg 2 c': 345, 'kg 2 d': 345,
  'basic 1': 615, 'basic 2': 590, 'basic 3': 590, 'basic 4': 660,
  'basic 5': 650, 'basic 6': 650, 'basic 7': 990, 'basic 8': 615, 'basic 9': 350,
};

const EXERCISE_BOOKS_MAP: Record<string, number> = {
  'kg 1 a': 104, 'kg 1 b': 104, 'kg 1 c': 104, 'kg 1 d': 104,
  'kg 2 a': 104, 'kg 2 b': 104, 'kg 2 c': 104, 'kg 2 d': 104,
  'basic 1': 194, 'basic 2': 194, 'basic 3': 194, 'basic 4': 186,
  'basic 5': 272, 'basic 6': 272, 'basic 7': 333, 'basic 8': 333, 'basic 9': 333,
};

export function CreateReceiptForm({
  applicants,
  realStudents,
  categories,
  classes,
  existingReceipts,
  onSuccess,
  onCancel
}: CreateReceiptFormProps) {
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [openStudentCombobox, setOpenStudentCombobox] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateReceiptFormValues>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      receipt_type: [{ type: '', amount: 0 }],
      date_issued: new Date().toISOString().split('T')[0],
      amount: 0,
      jersey_size: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "receipt_type"
  });

  const watchReceiptTypes = form.watch("receipt_type");
  const watchStudentId = form.watch("student_id");
  const watchRegId = form.watch("registration_id");
  const watchJerseySize = form.watch("jersey_size");

  const isRegistration = useMemo(() =>
    watchReceiptTypes.some(item => item.type === 'registration'),
  [watchReceiptTypes]);

  const selectedPerson = useMemo(() => {
    if (watchRegId) return applicants.find(a => a.id === watchRegId);
    if (watchStudentId) return realStudents.find(s => s.id === watchStudentId);
    return null;
  }, [watchRegId, watchStudentId, applicants, realStudents]);

  useEffect(() => {
    if (!selectedPerson) return;

    let catName = (selectedPerson as any).category;
    if (!catName && (selectedPerson as any).category_id) {
        catName = categories.find(c => String(c.id) === String((selectedPerson as any).category_id))?.name;
    }

    const isActuallyApplicant = !!applicants.find(a => a.id === selectedPerson.id);
    const classId = isActuallyApplicant
      ? (selectedPerson as RegistrationData).class_applying_for
      : (selectedPerson as Student).class_id;
    const className = classes.find(cls => cls.id === Number(classId))?.name?.toLowerCase().trim();

    const updatedTypes = watchReceiptTypes.map(item => {
      let amount = 0;
      switch (item.type) {
        case "levy":
          if (catName === "SVC" || catName === "MOD") amount = 200;
          else if (catName === "CIV") amount = 220;
          break;
        case "furniture": amount = 100; break;
        case "jersey": amount = JERSEY_PRICE_MAP[watchJerseySize || ''] || 0; break;
        case "crest": amount = 30; break;
        case "registration": amount = 40; break;
        case "textBooks": amount = TEXTBOOKS_MAP[className || ''] || 0; break;
        case "exerciseBooks": amount = EXERCISE_BOOKS_MAP[className || ''] || 0; break;
      }
      return { ...item, amount };
    });

    const total = updatedTypes.reduce((sum, item) => sum + item.amount, 0);

    if (JSON.stringify(updatedTypes) !== JSON.stringify(watchReceiptTypes)) {
        form.setValue("receipt_type", updatedTypes);
    }
    if (total !== form.getValues("amount")) {
        form.setValue("amount", total);
    }
  }, [watchReceiptTypes, watchJerseySize, selectedPerson, categories, classes, isRegistration, form]);

  const filteredSearchList = useMemo(() => {
    const query = studentSearchQuery.toLowerCase().trim();
    if (!query) return [];

    const applicantResults = applicants.filter(s =>
      `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase().includes(query)
    ).map(a => ({ ...a, _isApplicant: true }));

    const studentResults = realStudents.filter(s =>
      `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase().includes(query)
    ).map(s => ({ ...s, _isApplicant: false }));

    return [...applicantResults, ...studentResults].slice(0, 15);
  }, [applicants, realStudents, studentSearchQuery]);

  const onSubmit = async (values: CreateReceiptFormValues) => {
    setLoading(true);
    let printWindow = window.open('', '_blank');

    try {
      const mappedItems = values.receipt_type
        .filter(item => item.type && item.amount > 0)
        .map(item => ({
          type: item.type,
          amount: item.amount
        }));

      if (mappedItems.length === 0) {
        toast.error("Please add at least one valid payment item.");
        setLoading(false);
        printWindow?.close();
        return;
      }

      // Check for duplicate payments
      if (selectedPerson) {
          const studentReceipts = existingReceipts.filter(r =>
              (values.student_id && String(r.student_id) === String(values.student_id)) ||
              (values.registration_id && String(r.registration_id) === String(values.registration_id))
          );

          const alreadyPaidTypes = new Set<string>();
          studentReceipts.forEach((r: any) => {
              if (Array.isArray(r.receipt_items)) {
                  r.receipt_items.forEach((i: any) => alreadyPaidTypes.add(i.receipt_type));
              } else if (r.receipt_type && typeof r.receipt_type === 'string') {
                  alreadyPaidTypes.add(r.receipt_type);
              }
          });

          const duplicates = mappedItems.filter(item => alreadyPaidTypes.has(item.type));
          if (duplicates.length > 0) {
              const duplicateNames = duplicates.map(d => d.type).join(", ");
              toast.error(`Duplicate Payment: Already paid for: ${duplicateNames}`);
              setLoading(false);
              printWindow?.close();
              return;
          }
      }

      const isRegistrationOnly = mappedItems.length === 1 && mappedItems[0].type === 'registration';

      const payload: any = {
        amount: values.amount,
        date_issued: values.date_issued,
        receipt_type: mappedItems,
        jersey_size: values.jersey_size || undefined,
        student_id: values.student_id || undefined,
        registration_id: values.registration_id || undefined,
      };

      if (!isRegistrationOnly) {
        payload.category = categories.find(c =>
            c.name === (selectedPerson as any).category ||
            String(c.id) === String((selectedPerson as any).category_id)
        )?.id || (selectedPerson as any)?.category_id || (selectedPerson as any)?.category;
      }

      if (values.student_id) {
          payload.fee_id = `02500${values.student_id}`;
      } else if (values.registration_id) {
          await registrationService.updatePartial(values.registration_id, { payment_status: 'paid' });
      }

      const res = await createReceipt(payload);
      toast.success("Payment successfully recorded.");

      if (printWindow && res?.id) {
          printWindow.location.href = `/print/receipt/${res.id}`;
      }
      onSuccess();
    } catch (err) {
      toast.error("Failed to process payment.");
      printWindow?.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION: Source Identification */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <span className="size-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">1</span>
                <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Student Identification</Label>
            </div>
            <div className="relative">
                <Input
                    placeholder="Search by student name or applicant ID..."
                    className="h-10 rounded-lg bg-slate-50/50 border-slate-200 pl-10 text-sm font-medium transition-all focus:bg-white focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    onFocus={() => setOpenStudentCombobox(true)}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

                {openStudentCombobox && studentSearchQuery && (
                    <Card className="absolute z-50 w-full mt-1 border-slate-200 shadow-2xl rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-white ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                        {filteredSearchList.map(person => (
                            <div
                                key={person.id}
                                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-none group flex items-center justify-between"
                                onClick={() => {
                                    if ((person as any)._isApplicant) {
                                        form.setValue("registration_id", person.id);
                                        form.setValue("student_id", "");
                                        if (watchReceiptTypes.length === 1 && !watchReceiptTypes[0].type) {
                                            form.setValue("receipt_type.0.type", "registration");
                                        }
                                    } else {
                                        form.setValue("student_id", person.id);
                                        form.setValue("registration_id", "");
                                    }
                                    setStudentSearchQuery(`${person.first_name} ${person.last_name}`);
                                    setOpenStudentCombobox(false);
                                }}
                            >
                                <div className="space-y-0.5">
                                    <p className="font-semibold uppercase text-[10px] tracking-tight group-hover:text-primary transition-colors text-slate-900">{person.first_name} {person.last_name}</p>
                                    <p className="text-[9px] text-slate-400 font-mono">
                                        {(person as any).student_id || `REF-${String(person.id).substring(0, 8).toUpperCase()}`}
                                    </p>
                                </div>
                                <Badge variant="outline" className={cn(
                                    "text-[8px] font-bold uppercase px-1.5 py-0 rounded border-none",
                                    (person as any)._isApplicant ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {(person as any)._isApplicant ? 'Applicant' : 'Student'}
                                </Badge>
                            </div>
                        ))}
                        {filteredSearchList.length === 0 && (
                            <div className="p-6 text-center text-[10px] text-slate-400 italic">No matches found</div>
                        )}
                    </Card>
                )}
            </div>
        </div>

        {/* SECTION: Financial Parameters */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <span className="size-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">2</span>
                <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Transaction Details</Label>
            </div>

            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/50 border border-slate-100 group">
                        <div className="flex-1">
                            <Select
                                onValueChange={(val) => form.setValue(`receipt_type.${index}.type`, val)}
                                value={watchReceiptTypes[index]?.type}
                            >
                                <SelectTrigger className="h-9 rounded-md bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wide">
                                    <SelectValue placeholder="ITEM" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg shadow-xl">
                                    <SelectItem value="levy" className="font-bold text-[10px] uppercase">Levy Payment</SelectItem>
                                    <SelectItem value="registration" className="font-bold text-[10px] uppercase">Registration</SelectItem>
                                    <SelectItem value="textBooks" className="font-bold text-[10px] uppercase">Textbooks</SelectItem>
                                    <SelectItem value="exerciseBooks" className="font-bold text-[10px] uppercase">Exercise Books</SelectItem>
                                    <SelectItem value="jersey" className="font-bold text-[10px] uppercase">Sports Jersey</SelectItem>
                                    <SelectItem value="crest" className="font-bold text-[10px] uppercase">Unit Crest</SelectItem>
                                    <SelectItem value="furniture" className="font-bold text-[10px] uppercase">Furniture</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {watchReceiptTypes[index]?.type === 'jersey' && (
                            <div className="w-16">
                                <Select onValueChange={(val) => form.setValue("jersey_size", val)}>
                                    <SelectTrigger className="h-9 rounded-md bg-white border-slate-200 font-bold text-[10px]">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg min-w-[60px]">
                                        {Object.keys(JERSEY_PRICE_MAP).map(s => <SelectItem key={s} value={s} className="font-bold text-[10px]">{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="w-24 h-9 flex items-center justify-end px-3 rounded-md bg-white font-bold text-slate-900 border border-slate-200 text-xs">
                            <span className="text-[9px] text-slate-400 mr-1">GHS</span> {watchReceiptTypes[index]?.amount.toFixed(2)}
                        </div>

                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                onClick={() => remove(index)}
                            >
                                <X className="size-3.5" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="ghost"
                className="w-full h-9 rounded-lg gap-2 font-bold uppercase tracking-widest text-[9px] text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-dashed border-slate-200"
                onClick={() => append({ type: '', amount: 0 })}
            >
                <Plus className="size-3" /> Add Line Item
            </Button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Amount</p>
            <p className="text-xl font-bold text-slate-900">GHS {form.watch("amount").toFixed(2)}</p>
        </div>

        <div className="flex gap-3 pt-2">
            <Button
                type="button"
                variant="ghost"
                className="flex-1 h-10 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                onClick={onCancel}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                disabled={loading}
                className="flex-[2] h-10 font-bold uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
                {loading ? <RefreshCw className="size-3.5 animate-spin mr-2" /> : <Plus className="size-3.5 mr-2" />}
                Authorize Receipt
            </Button>
        </div>
    </form>
  );
}
