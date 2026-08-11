/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Search, CreditCard, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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
    if (isRegistration) return applicants.find(a => a.id === watchRegId);
    return realStudents.find(s => s.id === watchStudentId);
  }, [isRegistration, watchRegId, watchStudentId, applicants, realStudents]);

  // Pricing Logic
  useEffect(() => {
    if (!selectedPerson) return;

    const catName = categories.find(c => String(c.id) === String(selectedPerson.category_id))?.name;
    const classId = isRegistration
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
    const source = isRegistration ? applicants : realStudents;
    return source.filter(s =>
      `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );
  }, [isRegistration, applicants, realStudents, studentSearchQuery]);

  const onSubmit = async (values: CreateReceiptFormValues) => {
    setLoading(true);
    let printWindow = window.open('', '_blank');

    try {
      const payload = {
        ...values,
        fee_id: values.student_id ? `02500${values.student_id}` : undefined,
      };

      if (isRegistration && values.registration_id) {
          await registrationService.updatePartial(values.registration_id, { payment_status: 'paid' });
          delete (payload as any).student_id;
      } else {
          delete (payload as any).registration_id;
      }

      const res = await createReceipt(payload);
      toast.success("Receipt synchronized with treasury.");

      if (printWindow && res?.id) {
          printWindow.location.href = `/print/receipt/${res.id}`;
      }
      onSuccess();
    } catch (err) {
      toast.error("Failed to execute treasury induction.");
      printWindow?.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Allocation Breakdown</Label>
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-3 animate-in slide-in-from-top-2">
                        <div className="flex-1 space-y-2">
                            <Select
                                onValueChange={(val) => form.setValue(`receipt_type.${index}.type`, val)}
                                value={watchReceiptTypes[index]?.type}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                                    <SelectValue placeholder="Select Allocation" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                    <SelectItem value="levy" className="font-bold">Levy</SelectItem>
                                    <SelectItem value="registration" className="font-bold">Registration</SelectItem>
                                    <SelectItem value="textBooks" className="font-bold">Text Books</SelectItem>
                                    <SelectItem value="exerciseBooks" className="font-bold">Exercise Books</SelectItem>
                                    <SelectItem value="jersey" className="font-bold">Jersey</SelectItem>
                                    <SelectItem value="crest" className="font-bold">Crest</SelectItem>
                                    <SelectItem value="furniture" className="font-bold">Furniture</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {watchReceiptTypes[index]?.type === 'jersey' && (
                            <div className="w-32 space-y-2">
                                <Select onValueChange={(val) => form.setValue("jersey_size", val)}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        {Object.keys(JERSEY_PRICE_MAP).map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="w-28 h-12 flex items-center justify-end px-4 rounded-xl bg-primary/5 font-black text-primary border border-primary/10">
                            GHS {watchReceiptTypes[index]?.amount}
                        </div>

                        {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <Button type="button" variant="outline" className="w-full h-12 border-dashed border-2 rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]" onClick={() => append({ type: '', amount: 0 })}>
                <Plus className="size-3" /> Add Item
            </Button>
        </div>

        <div className="space-y-4 relative">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{isRegistration ? 'Applicant' : 'Student'} Designation</Label>
            <div className="relative">
                <Input
                    placeholder="Search by name..."
                    className="h-14 rounded-2xl bg-muted/30 border-none shadow-sm font-bold pl-12"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    onFocus={() => setOpenStudentCombobox(true)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary/40" />
            </div>

            {openStudentCombobox && studentSearchQuery && (
                <Card className="absolute z-50 w-full mt-2 border-none shadow-2xl rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {filteredSearchList.map(person => (
                        <div
                            key={person.id}
                            className="p-4 hover:bg-primary hover:text-white cursor-pointer transition-colors border-b last:border-none group"
                            onClick={() => {
                                if (isRegistration) form.setValue("registration_id", person.id);
                                else form.setValue("student_id", person.id);
                                setStudentSearchQuery(`${person.first_name} ${person.last_name}`);
                                setOpenStudentCombobox(false);
                            }}
                        >
                            <p className="font-bold uppercase text-sm">{person.first_name} {person.last_name}</p>
                            <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">{(person as any).student_id || person.id}</p>
                        </div>
                    ))}
                </Card>
            )}
        </div>

        <div className="p-6 rounded-[2rem] bg-primary text-white space-y-4 shadow-xl shadow-primary/20">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Treasury Intake</p>
                <CreditCard className="size-4 opacity-40" />
            </div>
            <p className="text-4xl font-black tracking-tighter">GHS {form.watch("amount")}</p>
        </div>

        <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-bold" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
                {loading ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Shield className="size-4 mr-2" />}
                Authorize & Synchronize
            </Button>
        </div>
    </form>
  );
}
