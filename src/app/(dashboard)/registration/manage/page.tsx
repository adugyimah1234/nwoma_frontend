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

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useAuth } from "@/contexts/AuthContext";
import registrationService, { type RegistrationData } from '@/services/registrations';
import { bulkAdmit } from '@/services/admissions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getReceipts } from '@/services/receipt';
import { cn } from '@/lib/utils';
import { printRegistrationsTable } from './printUtils';

export default function ApplicantManagement() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isMigrating, setIsMigrating] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const regData = await registrationService.getAll();
            setRegistrations(regData.filter(r => (r.status || '').toLowerCase() === 'pending'));
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
                <Badge variant="secondary" className="font-normal">
                    {row.class_applying_for}
                </Badge>
            )
        },
        {
            key: 'registration_date',
            header: 'Inducted',
            cell: (row) => (
                <span className="text-sm text-muted-foreground">
                    {row.registration_date ? new Date(row.registration_date).toLocaleDateString() : 'N/A'}
                </span>
            )
        },
        {
            key: 'payment_status',
            header: 'Status',
            cell: (row) => (
                <Badge variant={row.payment_status === 'paid' ? 'default' : 'destructive'} className="capitalize">
                    {row.payment_status}
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
        <div className="flex flex-1 flex-col gap-6 p-8 max-w-[1600px] mx-auto w-full pb-24">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">User List</h2>
                    <p className="text-sm text-muted-foreground">Manage your applicants and their roles here.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchInitialData}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
                    </Button>
                    {isAdmin && (
                        <Button onClick={() => router.push('/registration/new')}>
                            <Plus className="h-4 w-4 mr-2" /> Add User
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between py-4">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter users..."
                        className="h-10 w-[250px] lg:w-[450px]"
                        onChange={() => {}}
                    />
                    <Button variant="outline" size="sm" className="h-10 border-dashed">
                        <Filter className="mr-2 h-4 w-4" /> Status
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => printRegistrationsTable(registrations, 0)}>
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

            <div className="rounded-md border bg-background">
                <DataTable
                    data={registrations as any[]}
                    columns={columns as any}
                    searchKey="first_name"
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
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <div className="bg-background">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>Make changes to applicant details here.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitEdit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">First Name</label>
                                <Input
                                    className="col-span-3"
                                    value={selectedRegistration?.first_name || ''}
                                    onChange={(e) => setSelectedRegistration(prev => ({ ...prev!, first_name: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">Last Name</label>
                                <Input
                                    className="col-span-3"
                                    value={selectedRegistration?.last_name || ''}
                                    onChange={(e) => setSelectedRegistration(prev => ({ ...prev!, last_name: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Save changes</Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
