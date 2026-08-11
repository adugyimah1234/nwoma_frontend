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
                title="Institutional Census"
                description="Comprehensive directory of all students currently enrolled in the Garrison network."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Students' }]}
            >
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] px-6 hidden sm:flex" onClick={refresh}>
                        <RefreshCw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} /> Refresh Registry
                    </Button>
                    <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20" onClick={() => router.push('/registration/new')}>
                        <UserPlus className="mr-2 h-4 w-4" /> Induction
                    </Button>
                </div>
            </PageHeader>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
                {metrics.map((m, idx) => (
                    <StatsCard key={idx} {...m} className="shadow-xl shadow-black/5 border-none rounded-3xl p-8" />
                ))}
            </motion.div>

            <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-muted/20 border-b py-8 px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black tracking-tight uppercase tracking-wider">Student Registry</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60 opacity-60">Database of all registered garrison students</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-none bg-muted/50 hover:bg-primary/5">
                            <Download className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-none bg-muted/50 hover:bg-primary/5">
                            <Filter className="size-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        data={students as any[]}
                        columns={columns as any}
                        searchPlaceholder="Identify by name, rank or serial number..."
                        searchKey="first_name"
                        loading={loading}
                        rowKey="id"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
