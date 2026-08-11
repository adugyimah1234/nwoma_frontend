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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ParentsDirectoryPage() {
    const [parents, setParents] = useState<ParentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchParents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await parentService.getAll();
            setParents(data);
        } catch (err) {
            toast.error("Failed to load parent registry");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchParents();
    }, [fetchParents]);

    const columns: DataTableColumn<ParentRecord>[] = [
        {
            key: 'full_name',
            header: 'Guardian Name',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                        {row.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-bold text-xs uppercase tracking-tight">{row.full_name}</span>
                </div>
            )
        },
        {
            key: 'phone_number',
            header: 'Contact Protocol',
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
                    <Badge variant="secondary" className="text-[10px] font-black">{row.ward_count} {row.ward_count === 1 ? 'WARD' : 'WARDS'}</Badge>
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
                    View Dossier
                </Button>
            )
        }
    ];

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Guardian & Parent Directory"
                description="Manage family links and monitor performance across all wards."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students', href: '/students' }, { title: 'Parents' }]}
            />

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
