'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Search,
    RefreshCw,
    ChevronRight,
    Building2,
    Phone,
    MapPin,
    GraduationCap,
    Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import parentService, { ParentRecord } from '@/services/parents';
import studentService from '@/services/students';
import registrationService from '@/services/registrations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { useAuth } from '@/contexts/AuthContext';

export default function ParentsDirectoryPage() {
    const { user } = useAuth();
    const [parents, setParents] = useState<ParentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchParents = useCallback(async () => {
        setLoading(true);
        const guardianMap = new Map<string, ParentRecord>();
        const params: any = {};
        if (user?.school_id) params.school_id = user.school_id;
        if (user?.garrison_id) params.garrison_id = user.garrison_id;

        const addToMap = (phone: string, name: string, address: string) => {
            if (!phone || !name) return;
            const cleanPhone = phone.trim();
            if (guardianMap.has(cleanPhone)) {
                const existing = guardianMap.get(cleanPhone)!;
                existing.ward_count += 1;
            } else {
                guardianMap.set(cleanPhone, {
                    phone_number: cleanPhone,
                    full_name: name,
                    address: address || 'N/A',
                    ward_count: 1
                });
            }
        };

        try {
            // 1. Primary Source: Parent Service
            try {
                const apiParents = await parentService.getAll(params);
                if (Array.isArray(apiParents)) {
                    apiParents.forEach(p => {
                        if (p.phone_number) {
                            guardianMap.set(p.phone_number, p);
                        }
                    });
                }
            } catch (err) {
                console.warn("Parent Service fetch failed, continuing to fallbacks...");
            }

            // 2. Fallback: Aggregate from Students
            try {
                const students = await studentService.getAll(params);
                if (Array.isArray(students)) {
                    students.forEach((s: any) => {
                        const phone = s.guardian_phone_number || s.phone_number;
                        const name = s.guardian_name || s.full_name;
                        addToMap(phone, name, s.address);
                    });
                }
            } catch (err) {
                console.warn("Student Service fetch failed...");
            }

            // 3. Fallback: Aggregate from Registrations
            try {
                const regs = await registrationService.getAll();
                if (Array.isArray(regs)) {
                    regs.forEach((r: any) => {
                        // Filter by school/garrison if applicable
                        if (params.school_id && r.school_id !== params.school_id) return;

                        const phone = r.guardian_phone_number || r.phone_number;
                        const name = r.guardian_name || `${r.first_name} ${r.last_name}`;
                        addToMap(phone, name, r.address);
                    });
                }
            } catch (err) {
                console.warn("Registration Service fetch failed...");
            }

            const combinedData = Array.from(guardianMap.values());
            setParents(combinedData);

            if (combinedData.length === 0) {
                toast.info("No parent records found across registry sources.");
            }
        } catch (err) {
            console.error("Critical Registry Fetch Error:", err);
            toast.error("Failed to sync parent directory");
        } finally {
            setLoading(false);
        }
    }, [user?.school_id, user?.garrison_id]);

    useEffect(() => {
        fetchParents();
    }, [fetchParents]);

    const columns: DataTableColumn<ParentRecord>[] = [
        {
            key: 'full_name',
            header: 'Guardian Name',
            cell: (row) => {
                const initials = (row.full_name || 'U').split(' ').filter(Boolean).map(n => n[0]).join('');
                return (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                            {initials}
                        </div>
                        <span className="font-bold text-xs uppercase tracking-tight">{row.full_name || 'Unknown Guardian'}</span>
                    </div>
                );
            }
        },
        {
            key: 'phone_number',
            header: 'Phone Number',
            cell: (row) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600">
                    <Phone className="size-3" /> {row.phone_number}
                </div>
            )
        },
        {
            key: 'ward_count',
            header: 'Total Wards',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold">{row.ward_count} {row.ward_count === 1 ? 'WARD' : 'WARDS'}</Badge>
                </div>
            )
        },
        {
            key: 'address',
            header: 'Residence',
            cell: (row) => <span className="text-[10px] text-muted-foreground line-clamp-1">{row.address || 'N/A'}</span>
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    onClick={() => router.push(`/team/parents/${row.phone_number}`)}
                >
                    <Eye className="size-3" />
                    View Records
                </Button>
            )
        }
    ];

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Guardian & Parent Directory"
                description="Manage parent accounts and track student progress for all families."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students', href: '/students' }, { title: 'Parents' }]}
            >
                <Button variant="outline" size="sm" onClick={() => fetchParents()} disabled={loading}>
                    <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
                    Refresh Records
                </Button>
            </PageHeader>

            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <DataTable
                        data={parents as any[]}
                        columns={columns as any}
                        searchPlaceholder="Filter by name or phone..."
                        searchKey="full_name"
                        loading={loading}
                        rowKey="phone_number"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

