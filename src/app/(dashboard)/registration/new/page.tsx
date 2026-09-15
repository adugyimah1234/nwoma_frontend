/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from "date-fns";
import {
    MapPin,
    CheckCircle2,
    RefreshCw,
    User,
    GraduationCap,
    Users,
    Mail,
    Phone,
    Calendar,
    ArrowRight
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import registrationService, { type RegistrationCreateInput } from '@/services/registrations';
import classService, { ClassData } from '@/services/class';
import { Category, getAllCategories } from '@/services/categories';
import { academicYear, getAllAcademicYear } from '@/services/academic_year';
import { saveOfflineRegistration } from '@/lib/offlineRegistrations';
import { registrationSchema, RegistrationFormValues } from './schemas';
import { PageHeader }from '@/components/layout/page-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
                setClasses(Array.from(uniqueClassMap.values()).slice(0, 20));
            } catch (err) {
                toast.error("Failed to sync registry data.");
            }
        }
        loadInitialData();
    }, []);

    const calculateAge = (dob: string) => {
        if (!dob) return null;
        try {
            const birthDate = new Date(dob);
            if (isNaN(birthDate.getTime())) return null;
            const age = new Date().getFullYear() - birthDate.getFullYear();
            return age >= 0 ? age : 0;
        } catch (e) { return null; }
    };

    const onFormSubmit = (values: RegistrationFormValues) => {
        setFormData(values);
        setShowPreviewDialog(true);
    };

    const handleFinalSubmit = async () => {
        if (!formData || loading) return;

        setLoading(true);
        try {
            const selectedCategory = categories.find(c => c.id.toString() === formData.category);
            const selectedYear = academicYears.find(y => y.year.toString() === formData.academic_year);

            const backendData: RegistrationCreateInput = {
                ...formData,
                category: selectedCategory?.name || formData.category,
                category_id: formData.category,
                previous_school: formData.previous_school || '',
                scores: 0,
                status: "pending",
                date_of_birth: format(new Date(formData.date_of_birth), "yyyy-MM-dd"),
                academic_year_id: selectedYear?.id.toString() || '',
            };

            if (!navigator.onLine) {
                await saveOfflineRegistration(backendData);
                toast.success("Saved to offline registry.");
            } else {
                await registrationService.create(backendData);
            }

            setShowPreviewDialog(false);
            form.reset();
            setFormData(null);
        } catch (error: any) {
            console.error("Registration Error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Registration failed.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
            <PageHeader
                title="Student Registration"
                description="Complete the form below to register a new applicant in the system."
                breadcrumbs={[
                    { title: 'Home', href: '/' },
                    { title: 'Registration', href: '/registration' },
                    { title: 'New' }
                ]}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                    {/* SECTION 1: PERSONAL INFO */}
                    <Card className="shadow-sm">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <User className="size-4" /> Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="first_name" render={({ field }) => (
                                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="middle_name" render={({ field }) => (
                                    <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input placeholder="Quincy" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="last_name" render={({ field }) => (
                                    <FormItem><FormLabel>Last Name (Surname)</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="date" {...field} className="pr-12" />
                                                    {field.value && calculateAge(field.value) !== null && (
                                                        <Badge className="absolute right-1 top-1.5 h-7" variant="secondary">{calculateAge(field.value)} yrs</Badge>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="gender" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex h-10 items-center space-x-4 border rounded-md px-3 bg-muted/5">
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="m" /><Label htmlFor="m" className="text-sm">Male</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="f" /><Label htmlFor="f" className="text-sm">Female</Label></div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="phone_number" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Applicant Phone (If Any)</FormLabel>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                            <FormControl><Input type="tel" placeholder="+233..." className="pl-10" {...field} /></FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 2: PLACEMENT */}
                    <Card className="shadow-sm">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <GraduationCap className="size-4" /> Academic Placement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="class_applying_for" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Class</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select class level" /></SelectTrigger></FormControl>
                                        <SelectContent>{classes.map((cls, i) => <SelectItem key={i} value={cls.name}>{cls.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
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
                                            <FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                                            <SelectContent>{academicYears.map(year => <SelectItem key={year.id} value={year.year.toString()}>{year.year}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="md:col-span-2">
                                <FormField control={form.control} name="previous_school" render={({ field }) => (
                                    <FormItem><FormLabel>Previous Institution Attended</FormLabel><FormControl><Input placeholder="School name and location" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 3: GUARDIAN */}
                    <Card className="shadow-sm">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Users className="size-4" /> Guardian Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="guardian_name" render={({ field }) => (
                                    <FormItem><FormLabel>Guardian Full Name</FormLabel><FormControl><Input placeholder="e.g. Samuel Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="relationship" render={({ field }) => (
                                    <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input placeholder="e.g. Father" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="guardian_phone_number" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Guardian Phone Number</FormLabel>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                            <FormControl><Input type="tel" placeholder="+233..." className="pl-10" {...field} /></FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address (Optional)</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                            <FormControl><Input type="email" placeholder="example@email.com" className="pl-10" {...field} /></FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Residential Address</FormLabel>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                        <FormControl><Input className="pl-10" placeholder="House No. / Physical Location / Landmark" {...field} /></FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" className="px-10 gap-2">
                            Review Registration <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </form>
            </Form>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verify Registration Data</DialogTitle>
                        <DialogDescription>Confirm applicant details before saving to records.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Student Name</span>
                            <span className="text-sm font-semibold uppercase">{formData?.first_name} {formData?.last_name}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Target Class</span>
                            <Badge variant="outline" className="font-semibold">{formData?.class_applying_for}</Badge>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setShowPreviewDialog(false)}>Modify Data</Button>
                        <Button onClick={handleFinalSubmit} disabled={loading} className="px-8">
                            {loading ? <RefreshCw className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />} Confirm Registration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

