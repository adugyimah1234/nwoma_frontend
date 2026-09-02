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
import { Category, getAllCategories } from '@/services/categories';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getReceipts } from '@/services/receipt';
import { PageHeader }from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import { printRegistrationsTable } from './printUtils';

export default function ApplicantManagement() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isMigrating, setIsMigrating] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [classFilter, setClassFilter] = useState<string>('all');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [regData, classData, catData] = await Promise.all([
                registrationService.getAll(),
                classService.getAll(),
                getAllCategories()
            ]);
            setRegistrations(regData.filter(r => (r.status || '').toLowerCase() === 'pending'));
            setClasses(classData);
            setCategories(catData);
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
        if (!confirm(`Bulk admit ${selectedIds.size} candidates?`)) return;

        setIsMigrating(true);
        try {
            const res = await bulkAdmit({
                registration_ids: Array.from(selectedIds),
                verify_payment: true,
                generate_initial_fees: true
            });
            toast.success(`${res.admitted} students admitted successfully.`);
            setSelectedIds(new Set());
            await fetchInitialData();
        } catch (err: any) {
            toast.error("Migration failed");
        } finally {
            setIsMigrating(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration?.id) return;
        try {
            await registrationService.updatePartial(selectedRegistration.id, selectedRegistration as any);
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

        return matchesSearch && matchesStatus && matchesClass;
    });

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
                    <span className="text-xs text-muted-foreground">ID: {String(row.id).substring(0, 8)}</span>
                </div>
            )
        },
        {
            key: 'class_applying_for',
            header: 'Class',
            cell: (row) => (
                <Badge variant={row.class_applying_for ? "secondary" : "destructive"} className="font-normal">
                    {row.class_applying_for || 'Unassigned'}
                </Badge>
            )
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
            header: 'Status',
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
                            <DropdownMenuItem>Export Excel</DropdownMenuItem>
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
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Manage Registrations"
                description="Review and process student registration applications for the upcoming term."
                breadcrumbs={[
                    { title: 'Home', href: '/' },
                    { title: 'Registration', href: '/registration' },
                    { title: 'Manage' }
                ]}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchInitialData}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
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

                    {(searchQuery || statusFilter !== 'all' || classFilter !== 'all') && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setClassFilter('all');
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
                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="sm">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
