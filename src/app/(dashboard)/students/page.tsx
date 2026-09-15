'use client';

import React from 'react';
import {
    Users,
    UserPlus,
    RefreshCw,
    ShieldAlert,
    GraduationCap,
    Download,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatsCard } from '@/components/ui/stats-card';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useStudents } from './hooks/useStudents';
import { useStudentColumns } from './components/StudentColumns';

export default function StudentsDirectory() {
    const router = useRouter();
    const { students, loading, stats, refresh } = useStudents();
    const columns = useStudentColumns();

    const metrics = [
        { title: "Total Enrolled", value: stats.total, icon: Users, trend: { value: 12, label: "vs last term" } },
        { title: "Active Personnel", value: stats.active, icon: UserPlus },
        { title: "Service (SVC)", value: stats.service, icon: ShieldAlert },
        { title: "Civ / MOD", value: stats.civilian, icon: GraduationCap },
    ];

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Student Directory"
                description="Comprehensive directory of all students currently enrolled in the network."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students' }]}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-4 hidden sm:flex font-semibold text-xs" onClick={refresh}>
                        <RefreshCw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} /> Refresh
                    </Button>
                    <Button size="sm" className="h-9 px-6 font-semibold text-xs shadow-sm" onClick={() => router.push('/registration/new')}>
                        <UserPlus className="mr-2 h-4 w-4" /> New Student
                    </Button>
                </div>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
                {metrics.map((m, idx) => (
                    <StatsCard key={idx} {...m} className="shadow-sm border" />
                ))}
            </motion.div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white dark:bg-slate-900 border-b py-6 px-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">Student Registry</CardTitle>
                        <CardDescription className="text-xs">Manage and view all registered students</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Download className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Filter className="size-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        data={students as any[]}
                        columns={columns as any}
                        searchPlaceholder="Search by name, ID or rank..."
                        searchKey="first_name"
                        loading={loading}
                        rowKey="id"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

