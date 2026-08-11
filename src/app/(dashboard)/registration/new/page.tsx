/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from "date-fns";
import {
    MapPin,
    CheckCircle2,
    RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import registrationService, { type RegistrationCreateInput } from '@/services/registrations';
import classService, { ClassData } from '@/services/class';
import { Category, getAllCategories } from '@/services/categories';
import { academicYear, getAllAcademicYear } from '@/services/academic_year';
import { saveOfflineRegistration } from '@/lib/offlineRegistrations';
import { registrationSchema, RegistrationFormValues } from './schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

export default function NewRegistrationPage() {
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<academicYear[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [formData, setFormData] = useState<RegistrationFormValues | null>(null);

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            date_of_birth: '',
            class_applying_for: '',
            gender: 'Male',
            previous_school: '',
            phone_number: '',
            category: '',
            academic_year: '',
            guardian_name: '',
            relationship: '',
            guardian_phone_number: '',
            address: '',
            email: '',
        }
    });

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [years, cats, allClasses] = await Promise.all([
                    getAllAcademicYear(),
                    getAllCategories(),
                    classService.getAll()
                ]);
                setAcademicYears(years);
                setCategories(cats);

                const uniqueClassMap = new Map<string, ClassData>();
                allClasses.forEach(cls => {
                    const name = cls.name.toUpperCase();
                    if (!uniqueClassMap.has(name)) uniqueClassMap.set(name, cls);
                });
                setClasses(Array.from(uniqueClassMap.values()).slice(0, 15));
            } catch (err) {
                toast.error("Failed to sync registry data.");
            }
        }
        loadInitialData();
    }, []);

    const calculateAge = (dob: string) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        return new Date().getFullYear() - birthDate.getFullYear();
    };

    const onFormSubmit = (values: RegistrationFormValues) => {
        setFormData(values);
        setShowPreviewDialog(true);
    };

    const handleFinalSubmit = async () => {
        if (!formData) return;
        setLoading(true);
        try {
            // Find the actual names for category and year to ensure backend data consistency
            const selectedCategory = categories.find(c => c.id.toString() === formData.category);
            const selectedYear = academicYears.find(y => y.year.toString() === formData.academic_year);

            const backendData: RegistrationCreateInput = {
                ...formData,
                category: selectedCategory?.name || formData.category, // Send name (SVC/CIV)
                category_id: formData.category, // Send actual ID
                previous_school: formData.previous_school || '',
                scores: 0,
                status: "pending",
                date_of_birth: format(new Date(formData.date_of_birth), "yyyy-MM-dd"),
                academic_year_id: selectedYear?.id.toString() || '',
            };

            if (!navigator.onLine) {
                await saveOfflineRegistration(backendData);
                toast.success("Identity buffered offline.");
            } else {
                await registrationService.create(backendData);
                toast.success("Applicant successfully registered.");
            }

            form.reset();
            setShowPreviewDialog(false);
        } catch (error: any) {
            console.error("Submission Error:", error);
            toast.error(error.message || "Process failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1200px] mx-auto w-full pb-24 bg-background">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Induction Portal</h2>
                <p className="text-sm text-muted-foreground">Induct new student applicants into the Garrison node registry.</p>
            </div>
            <Separator className="my-6" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/4">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        <Button variant="ghost" className="justify-start bg-muted hover:bg-muted font-semibold">Personnel Info</Button>
                        <Button variant="ghost" className="justify-start hover:bg-transparent">Strategic Placement</Button>
                        <Button variant="ghost" className="justify-start hover:bg-transparent">Guardian Node</Button>
                    </nav>
                </aside>

                <div className="flex-1 lg:max-w-2xl">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-12">
                            {/* SECTION: IDENTITY */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium">Personal Information</h3>
                                    <p className="text-sm text-muted-foreground">Identity and contact details for the applicant.</p>
                                </div>
                                <Separator />
                                <div className="grid gap-6">
                                    <FormField control={form.control} name="first_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl><Input placeholder="Legal First Name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="middle_name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Middle Name</FormLabel>
                                                <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="last_name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl><Input placeholder="Surname" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type="date" {...field} />
                                                        {field.value && <Badge className="absolute right-2 top-1/2 -translate-y-1/2" variant="outline">{calculateAge(field.value)} Yrs</Badge>}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="gender" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gender</FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex h-10 items-center space-x-4">
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="m" /><Label htmlFor="m">Male</Label></div>
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="f" /><Label htmlFor="f">Female</Label></div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="phone_number" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Number</FormLabel>
                                            <FormControl><Input type="tel" placeholder="+233..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            {/* SECTION: PLACEMENT */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium">Strategic Placement</h3>
                                    <p className="text-sm text-muted-foreground">Class and unit allocation within the network.</p>
                                </div>
                                <Separator />
                                <div className="grid gap-6">
                                    <FormField control={form.control} name="class_applying_for" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Unit (Class)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                                                <SelectContent>{classes.map((cls, i) => <SelectItem key={i} value={cls.name}>{cls.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="category" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Garrison Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="academic_year" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Academic Year</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>{academicYears.map(year => <SelectItem key={year.id} value={year.year.toString()}>{year.year}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="previous_school" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Previous School</FormLabel>
                                            <FormControl><Input placeholder="School name (if any)" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            {/* SECTION: GUARDIAN */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium">Guardian Credentials</h3>
                                    <p className="text-sm text-muted-foreground">Primary contact and legal relations.</p>
                                </div>
                                <Separator />
                                <div className="grid gap-6">
                                    <FormField control={form.control} name="guardian_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Guardian Full Name</FormLabel>
                                            <FormControl><Input placeholder="As per ID" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="relationship" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Relationship</FormLabel>
                                                <FormControl><Input placeholder="e.g. Father" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="guardian_phone_number" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Guardian Contact</FormLabel>
                                                <FormControl><Input type="tel" placeholder="+233..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid gap-6">
                                        <FormField control={form.control} name="address" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Residential Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input className="pl-10" placeholder="House No. / Physical Location" {...field} />
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl><Input type="email" placeholder="example@node.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg" className="px-8 shadow-sm">
                                    Finalize Induction Registry
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify Registration</DialogTitle>
                        <DialogDescription>Commit the induction record to the system node.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex justify-between items-center"><span className="text-sm font-medium text-muted-foreground">Candidate Identity</span><span className="text-sm font-bold uppercase">{formData?.first_name} {formData?.last_name}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm font-medium text-muted-foreground">Target Unit</span><Badge variant="secondary" className="font-bold">{formData?.class_applying_for}</Badge></div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowPreviewDialog(false)}>Abort</Button>
                        <Button onClick={handleFinalSubmit} disabled={loading} className="px-6">
                            {loading ? <RefreshCw className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />} Confirm Induction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
