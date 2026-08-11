/* eslint-disable no-console */
'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'; // use your dialog component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';

import { createFee } from '@/services/fee';

import { type FeeType } from '@/types/fee';
import { type academicYear, getAllAcademicYear } from '@/services/academic_year';
import { getAllCategories } from '@/services/categories';
import classService, { type ClassData } from '@/services/class';
import { type Category } from '@/types/assessment';

interface AddFeeDialogProps {
  onSuccess: () => void;
}

export default function AddFeeDialog({ onSuccess }: AddFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [feeType, setFeeType] = useState<FeeType>('tuition');
  const [academicYears, setAcademicYears] = useState<academicYear[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [academicYearId, setAcademicYearId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Load all data when dialog opens
      loadAcademicYears();
      loadCategories();
      loadClasses();
    }
  }, [open]);

  async function loadAcademicYears() {
    try {
      const years = await getAllAcademicYear();
      setAcademicYears(years);
    } catch {
      toast.error('Failed to load academic years');
    }
  }

  async function loadCategories() {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch {
      toast.error('Failed to load fee categories');
    }
  }

  async function loadClasses() {
    try {
      const cls = await classService.getAll();
      setClasses(cls);
    } catch {
      toast.error('Failed to load classes');
    }
  }

  async function handleSubmit() {
    if (
      !amount ||
      !categoryId ||
      !classId ||
      !academicYearId
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createFee({
        amount: Number(amount),
        category_id: categoryId,
        class_id: classId,
        fee_type: feeType,
        description,
        academic_year_id: academicYearId,
      });
      toast.success('Fee created successfully');
      setOpen(false);
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error('Failed to create fee');
      console.error(error);
    }
  }

  function resetForm() {
    setAmount('');
    setDescription('');
    setCategoryId(null);
    setClassId(null);
    setFeeType('tuition');
    setAcademicYearId(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add Fee
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogTitle>Add New Fee</DialogTitle>
        <DialogDescription>
          Please fill in the details below to create a new fee.
        </DialogDescription>

        <div className="mt-4 space-y-4">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Select
            onValueChange={setCategoryId}
            value={categoryId ?? ''}
            aria-label="Select Fee Category"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Fee Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={setClassId}
            value={classId ?? ''}
            aria-label="Select Target Unit"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Target Unit" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val) => setFeeType(val as FeeType)}
            value={feeType}
            aria-label="Select Fee Type"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Fee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="admission">Admission</SelectItem>
              <SelectItem value="tuition">Tuition</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={setAcademicYearId}
            value={academicYearId ?? ''}
            aria-label="Select Academic Year"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={String(year.id)}>
                  {year.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Create Fee</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
