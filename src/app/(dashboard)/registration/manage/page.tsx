/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Download,
    Printer,
    RefreshCw,
    ChevronRight,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useAuth } from "@/contexts/AuthContext";
import registrationService, { type RegistrationData } from '@/services/registrations';
import { bulkAdmit } from '@/services/admissions';
import classService, { type ClassData } from '@/services/class';
import schoolService from '@/services/schools';
import { Category, getAllCategories } from '@/services/categories';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getReceipts } from '@/services/receipt';
import { PageHeader }from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { printRegistrationsTable } from './printUtils';

export default function ApplicantManagement() {
    const router = useRouter();
    const { isAdmin, user } = useAuth();
    // Use the same normalization logic as the sidebar for consistency
    const roleStr = (user?.role || '').toLowerCase().replace(/_/g, '').replace(/\s/g, '');
    const isGarrisonDirector = roleStr === 'garrisondirector';
    const isSuperAdmin = roleStr === 'superadmin';
    const isSchoolAdmin = roleStr === 'schooladmin';

    // Allow any administrative role to edit scores and slots
    const canEditInline = isAdmin || isGarrisonDirector || isSuperAdmin || isSchoolAdmin;

    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isMigrating, setIsMigrating] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAdmissionDialogOpen, setIsAdmissionDialogOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);

    // Admission specific state
    const [targetSchoolId, setTargetSchoolId] = useState<string>('');
    const [targetClassId, setTargetClassId] = useState<string>('');

    // Inline edit state
    const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
    const [tempScore, setTempScore] = useState<number>(0);
    const [editingSlotsClassId, setEditingSlotsClassId] = useState<string | null>(null);
    const [tempSlots, setTempSlots] = useState<number>(0);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [schoolFilter, setSchoolFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [minScoreFilter, setMinScoreFilter] = useState<string>('');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [regData, classData, catData, schoolData] = await Promise.all([
                registrationService.getAll(),
                classService.getAll(),
                getAllCategories(),
                schoolService.getAll()
            ]);
            // Only show applicants whose status is 'pending' (not admitted yet)
            setRegistrations(regData.filter(r => (r.status || '').toLowerCase() === 'pending'));
            setClasses(classData);
            setCategories(catData);
            setSchools(schoolData);
        } catch (error) {
            toast.error("Failed to load applicants");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const confirmDelete = async () => {
        if (!selectedRegistration?.id) return;
        try {
            const receipts = await getReceipts({ registration_id: selectedRegistration.id });
            if (receipts && receipts.length > 0) {
                toast.error("Linked receipts detected. Cannot delete.");
                return;
            }
            await registrationService.remove(selectedRegistration.id);
            toast.success('Applicant removed');
            await fetchInitialData();
        } catch (error: any) {
            toast.error("Operation failed");
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedRegistration(null);
        }
    };

    const handleBulkAdmit = async () => {
        if (selectedIds.size === 0) return;

        const selectedRegs = registrations.filter(r => selectedIds.has(r.id!));

        // 1. Check if anyone is unpaid
        const unpaidRegs = selectedRegs.filter(r => {
            const pStatus = (r.payment_status || '').toLowerCase();
            return pStatus !== 'paid' && pStatus !== 'partial';
        });

        if (unpaidRegs.length > 0) {
            const names = unpaidRegs.map(r => `${r.first_name} ${r.last_name}`).join(", ");
            toast.error(`Cannot admit: Unpaid applicants (${names}) are not ready for admission.`);
            return;
        }

        // 2. Validation check for missing DOB
        const missingDob = selectedRegs.filter(r => !r.date_of_birth);
        if (missingDob.length > 0) {
            const names = missingDob.map(r => `${r.first_name} ${r.last_name}`).join(", ");
            toast.error(`Cannot admit: Date of Birth is missing for ${names}. Please edit their profile first.`);
            return;
        }

        // Default the selects to the first available values if any
        if (schools.length > 0) {
            const firstSchoolId = String(schools[0].id);
            setTargetSchoolId(firstSchoolId);
            const filtered = classes.filter(c => String(c.school_id) === firstSchoolId);
            if (filtered.length > 0) setTargetClassId(String(filtered[0].id));
            else setTargetClassId('');
        } else {
            setTargetSchoolId('');
            setTargetClassId('');
        }

        setIsAdmissionDialogOpen(true);
    };

    const executeBulkAdmission = async () => {
        if (!targetSchoolId || !targetClassId) {
            toast.error("Please select both a target school and class for admission.");
            return;
        }

        // Capacity Check
        const targetClass = classes.find(c => String(c.id) === String(targetClassId));
        if (targetClass) {
            const availableSlots = targetClass.slots ?? (targetClass.capacity - targetClass.students_count);
            if (selectedIds.size > availableSlots) {
                toast.error(`Class capacity exceeded! Only ${availableSlots} slots available, but you selected ${selectedIds.size} applicants.`);
                return;
            }
        }

        setIsMigrating(true);
        try {
            const res = await bulkAdmit({
                registration_ids: Array.from(selectedIds),
                verify_payment: true,
                generate_initial_fees: true,
                school_id: targetSchoolId,
                class_id: targetClassId
            } as any);
            toast.success(`${res.admitted} students admitted successfully.`);
            setSelectedIds(new Set());
            setIsAdmissionDialogOpen(false);
            await fetchInitialData();
        } catch (err: any) {
            toast.error("Migration failed");
        } finally {
            setIsMigrating(false);
        }
    };

    const handleUpdateScore = async (id: string, score: number) => {
        try {
            await registrationService.updatePartial(id, { scores: score } as any);
            setRegistrations(prev => prev.map(r => r.id === id ? { ...r, scores: score } : r));
            toast.success('Score updated');
        } catch (err) {
            toast.error('Failed to update score');
        }
        setEditingScoreId(null);
    };

    const handleUpdateSlots = async (cls: ClassData, newSlots: number) => {
        try {
            const updatedClass = { ...cls, slots: newSlots, capacity: newSlots };
            await classService.update(updatedClass);
            setClasses(prev => prev.map(c => c.id === cls.id ? updatedClass : c));
            toast.success('Class capacity updated');
        } catch (err) {
            toast.error('Failed to update capacity');
        }
        setEditingSlotsClassId(null);
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration?.id) return;
        try {
            // Ensure both date_of_birth and dob are synced for migration compatibility
            const updateData = {
                ...selectedRegistration,
                dob: selectedRegistration.date_of_birth
            };
            await registrationService.updatePartial(selectedRegistration.id, updateData as any);
            toast.success('Details updated');
            await fetchInitialData();
            setIsEditDialogOpen(false);
            setSelectedRegistration(null);
        } catch (err: any) {
            toast.error('Failed to update');
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = `${reg.first_name} ${reg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'paid' && (reg.payment_status?.toLowerCase() === 'paid' || reg.payment_status?.toLowerCase() === 'partial')) ||
            (statusFilter === 'unpaid' && (!reg.payment_status || reg.payment_status?.toLowerCase() === 'unpaid'));
        const matchesClass = classFilter === 'all' || reg.class_applying_for === classFilter;
        const matchesSchool = schoolFilter === 'all' || String(reg.school_id) === schoolFilter;
        const matchesCategory = categoryFilter === 'all' || reg.category === categoryFilter;
        const scoreVal = parseInt(minScoreFilter);
        const matchesScore = isNaN(scoreVal) || (reg.scores !== undefined && reg.scores !== null && Number(reg.scores) >= scoreVal);

        return matchesSearch && matchesStatus && matchesClass && matchesScore && matchesSchool && matchesCategory;
    }).sort((a, b) => (Number(b.scores) || 0) - (Number(a.scores) || 0));

    const handleExportExcel = () => {
        if (filteredRegistrations.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ["ID", "Name", "Class", "School", "Registered", "Exam Score", "Payment Status", "Reg Status", "Gender", "Phone", "Guardian", "Category", "Address"];
        const data = filteredRegistrations.map(reg => {
            const schoolName = schools.find(s => String(s.id) === String(reg.school_id))?.name || 'Unassigned';
            return [
                reg.id,
                `${reg.first_name} ${reg.last_name}`,
                reg.class_applying_for || 'N/A',
                schoolName,
                reg.registration_date ? new Date(reg.registration_date).toLocaleDateString() : 'N/A',
                reg.scores || 0,
                reg.payment_status || 'unpaid',
                reg.status || 'pending',
                reg.gender,
                reg.phone_number,
                reg.guardian_name,
                reg.category,
                `"${(reg.address || '').replace(/"/g, '""')}"` // Escape quotes for CSV
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + data.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "applicants_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Applicants data exported.");
    };

    const columns: DataTableColumn<RegistrationData>[] = [
        {
            key: 'selection',
            header: '',
            cell: (row) => (
                <Checkbox
                    checked={selectedIds.has(row.id!)}
                    onCheckedChange={(checked) => {
                        const newSet = new Set(selectedIds);
                        if (checked) newSet.add(row.id!);
                        else newSet.delete(row.id!);
                        setSelectedIds(newSet);
                    }}
                />
            )
        },
        {
            key: 'identity',
            header: 'Name',
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.first_name} {row.last_name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">
                        REF-{String(row.id).substring(0, 8).toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            key: 'scores',
            header: 'Exam Score',
            cell: (row) => {
                if (canEditInline && editingScoreId === row.id) {
                    return (
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="h-8 w-20 text-xs"
                                value={tempScore}
                                autoFocus
                                onChange={(e) => setTempScore(parseInt(e.target.value) || 0)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateScore(row.id!, tempScore);
                                    if (e.key === 'Escape') setEditingScoreId(null);
                                }}
                                onBlur={() => handleUpdateScore(row.id!, tempScore)}
                            />
                        </div>
                    );
                }
                return (
                    <div
                        className={cn("cursor-pointer group relative flex items-center gap-2", canEditInline && "hover:bg-muted/50 rounded px-1 -mx-1")}
                        onClick={() => {
                            if (canEditInline) {
                                setEditingScoreId(row.id!);
                                setTempScore(Number(row.scores) || 0);
                            }
                        }}
                    >
                        <Badge variant={Number(row.scores) >= 50 ? "default" : "outline"} className={cn("font-medium", Number(row.scores) >= 50 ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" : "")}>
                            {row.scores !== undefined && row.scores !== null ? `${row.scores} pts` : '0 pts'}
                        </Badge>
                        {canEditInline && <Edit className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />}
                    </div>
                );
            }
        },
        {
            key: 'class_applying_for',
            header: 'Target Class',
            cell: (row) => {
                const clsName = row.class_applying_for;
                const clsObj = classes.find(c => c.name === clsName);
                const availableSlots = clsObj ? (clsObj.slots ?? (clsObj.capacity - clsObj.students_count)) : null;
                const schoolName = schools.find(s => String(s.id) === String(row.school_id))?.name;

                if (canEditInline && clsObj && editingSlotsClassId === clsObj.id) {
                    return (
                        <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="font-normal w-fit">{row.class_applying_for}</Badge>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    className="h-7 w-16 text-[10px] font-bold"
                                    value={tempSlots}
                                    autoFocus
                                    onChange={(e) => setTempSlots(parseInt(e.target.value) || 0)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateSlots(clsObj, tempSlots);
                                        if (e.key === 'Escape') setEditingSlotsClassId(null);
                                    }}
                                    onBlur={() => handleUpdateSlots(clsObj, tempSlots)}
                                />
                                <span className="text-[10px] text-muted-foreground font-medium">total slots</span>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <Badge variant={row.class_applying_for ? "secondary" : "destructive"} className="font-normal w-fit">
                                {row.class_applying_for || 'Unassigned'}
                            </Badge>
                            {schoolName && <span className="text-[10px] text-muted-foreground italic truncate max-w-[80px]">({schoolName})</span>}
                        </div>
                        {availableSlots !== null && (
                            <div
                                className={cn(
                                    "flex items-center gap-1 cursor-pointer group w-fit rounded px-1 -ml-1",
                                    canEditInline && "hover:bg-muted/50"
                                )}
                                onClick={() => {
                                    if (canEditInline && clsObj) {
                                        setEditingSlotsClassId(clsObj.id);
                                        setTempSlots(clsObj.slots || clsObj.capacity || 0);
                                    }
                                }}
                            >
                                <span className={cn(
                                    "text-[10px] font-bold uppercase",
                                    availableSlots <= 0 ? "text-red-500" : "text-emerald-500"
                                )}>
                                    {availableSlots} slots left
                                </span>
                                {canEditInline && <Edit className="size-2 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'registration_date',
            header: 'Registered',
            cell: (row) => (
                <span className="text-sm text-muted-foreground">
                    {row.registration_date ? new Date(row.registration_date).toLocaleDateString() : 'N/A'}
                </span>
            )
        },
        {
            key: 'payment_status',
            header: 'Payment',
            cell: (row) => {
                const pStatus = (row.payment_status || '').toLowerCase();
                const isPaid = pStatus === 'paid' || pStatus === 'partial';
                return (
                    <Badge variant={isPaid ? 'default' : 'destructive'} className="capitalize">
                        {row.payment_status || 'unpaid'}
                    </Badge>
                );
            }
        },
        {
            key: 'status',
            header: 'Reg. Status',
            cell: (row) => (
                <Badge variant="outline" className="capitalize font-normal">
                    {row.status || 'Pending'}
                </Badge>
            )
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (row) => (
                <div className="flex justify-end gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportExcel}>Export Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isAdmin && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => {
                                    setSelectedRegistration(row);
                                    setIsEditDialogOpen(true);
                                }}
                            >
                                <Edit className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                    setSelectedRegistration(row);
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Review Applications"
                description="Process and approve student applications for the upcoming term."
                breadcrumbs={[
                    { title: 'Home', href: '/' },
                    { title: 'Registration', href: '/registration' },
                    { title: 'Review' }
                ]}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchInitialData} className="h-10 rounded-xl">
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Sync
                    </Button>
                    {isAdmin && (
                        <Button size="sm" onClick={() => router.push('/registration/new')}>
                            <Plus className="h-4 w-4 mr-2" /> New Registration
                        </Button>
                    )}
                </div>
            </PageHeader>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 items-center space-x-2 w-full">
                    <Input
                        placeholder="Search by name..."
                        className="h-9 w-full md:w-[300px] lg:w-[400px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed">
                                <Filter className="mr-2 h-3.5 w-3.5" />
                                {statusFilter === 'all' ? 'Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[150px]">
                            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid/Partial</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('unpaid')}>Unpaid</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed">
                                <ChevronRight className="mr-2 h-3.5 w-3.5" />
                                {classFilter === 'all' ? 'Class' : classFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem onClick={() => setClassFilter('all')}>All Classes</DropdownMenuItem>
                            {Array.from(new Set(classes.map(c => c.name))).map(clsName => (
                                <DropdownMenuItem key={clsName} onClick={() => setClassFilter(clsName)}>
                                    {clsName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Input
                        type="number"
                        placeholder="Min Exam Score"
                        className="h-9 w-[130px]"
                        value={minScoreFilter}
                        onChange={(e) => setMinScoreFilter(e.target.value)}
                    />

                    {(searchQuery || statusFilter !== 'all' || classFilter !== 'all' || minScoreFilter) && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setClassFilter('all');
                                setMinScoreFilter('');
                            }}
                            className="h-9 px-2"
                        >
                            Reset
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => printRegistrationsTable(filteredRegistrations, 0)}>
                        <Printer className="size-4 mr-2" /> Print
                    </Button>
                    {isAdmin && selectedIds.size > 0 && (
                        <Button
                            size="sm"
                            onClick={handleBulkAdmit}
                            disabled={isMigrating}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isMigrating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                            Admit ({selectedIds.size})
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-background overflow-hidden">
                <DataTable
                    data={filteredRegistrations as any[]}
                    columns={columns as any}
                    loading={loading}
                    rowKey="id"
                />
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong className="text-foreground">{selectedRegistration?.first_name} {selectedRegistration?.last_name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90 transition-colors">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Registration Details</DialogTitle>
                        <DialogDescription>Update applicant profile information.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">First Name</label>
                            <Input
                                className="col-span-3 h-9"
                                value={selectedRegistration?.first_name || ''}
                                onChange={(e) => setSelectedRegistration(prev => ({ ...prev!, first_name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">Last Name</label>
                            <Input
                                className="col-span-3 h-9"
                                value={selectedRegistration?.last_name || ''}
                                onChange={(e) => setSelectedRegistration(prev => ({ ...prev!, last_name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">Date of Birth</label>
                            <Input
                                type="date"
                                className="col-span-3 h-9"
                                value={selectedRegistration?.date_of_birth ? selectedRegistration.date_of_birth.substring(0, 10) : ''}
                                onChange={(e) => setSelectedRegistration(prev => ({ ...prev!, date_of_birth: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">Target Class</label>
                            <div className="col-span-3">
                                <Select
                                    value={selectedRegistration?.class_applying_for || ''}
                                    onValueChange={(val) => setSelectedRegistration(prev => ({ ...prev!, class_applying_for: val }))}
                                >
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from(new Set(classes.map(c => c.name))).map(clsName => (
                                            <SelectItem key={clsName} value={clsName}>{clsName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">Category</label>
                            <div className="col-span-3">
                                <Select
                                    value={selectedRegistration?.category || ''}
                                    onValueChange={(val) => setSelectedRegistration(prev => ({ ...prev!, category: val }))}
                                >
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {(isGarrisonDirector || isSuperAdmin) && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">Exam Score</label>
                                <Input
                                    type="number"
                                    className="col-span-3 h-9"
                                    value={selectedRegistration?.scores ?? 0}
                                    onChange={(e) => setSelectedRegistration(prev => ({ ...prev!, scores: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="sm">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isAdmissionDialogOpen} onOpenChange={setIsAdmissionDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign School and Class for Admission</DialogTitle>
                        <DialogDescription>
                            Select the target school and class for the {selectedIds.size} selected applicant(s). Only paid or partially paid applicants will be processed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">School</label>
                            <div className="col-span-3">
                                <Select
                                    value={targetSchoolId}
                                    onValueChange={(val) => {
                                        setTargetSchoolId(val);
                                        const filtered = classes.filter(c => String(c.school_id) === String(val));
                                        if (filtered.length > 0) setTargetClassId(String(filtered[0].id));
                                        else setTargetClassId('');
                                    }}
                                >
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Target School" /></SelectTrigger>
                                    <SelectContent>
                                        {schools.map(sch => (
                                            <SelectItem key={sch.id} value={String(sch.id)}>{sch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">Class</label>
                            <div className="col-span-3">
                                <Select
                                    value={targetClassId}
                                    onValueChange={(val) => setTargetClassId(val)}
                                >
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select Target Class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes
                                            .filter(c => !targetSchoolId || String(c.school_id) === String(targetSchoolId))
                                            .map(clsObj => {
                                                const availableSlots = clsObj.slots ?? (clsObj.capacity - clsObj.students_count);
                                                const isFull = availableSlots <= 0;
                                                return (
                                                    <SelectItem
                                                        key={String(clsObj.id)}
                                                        value={String(clsObj.id)}
                                                        disabled={isFull}
                                                    >
                                                        <div className="flex items-center justify-between w-full gap-8">
                                                            <span>{clsObj.name}</span>
                                                            <span className={cn(
                                                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                                                                isFull ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                                                            )}>
                                                                {availableSlots} slots left
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })
                                        }
                                        {classes.filter(c => !targetSchoolId || String(c.school_id) === String(targetSchoolId)).length === 0 && (
                                            <div className="p-2 text-xs text-muted-foreground text-center">No classes available for this school</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm" onClick={() => setIsAdmissionDialogOpen(false)}>Cancel</Button>
                        <Button type="button" size="sm" onClick={executeBulkAdmission} disabled={isMigrating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isMigrating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Admission
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

