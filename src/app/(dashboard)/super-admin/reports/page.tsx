'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  Building2,
  Users,
  Wallet,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getSuperAdminDashboard,
  ExecutiveDashboardData,
  SchoolPerformance,
} from '@/services/superAdmin';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

export default function SuperAdminReportsPage() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch Super Admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(amount);
  };

  const columns: DataTableColumn<SchoolPerformance>[] = [
    {
      key: 'school_name',
      header: 'School Name',
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.school_name}</div>
          <div className="text-xs text-muted-foreground">{row.email || 'No email registered'}</div>
        </div>
      ),
    },
    {
      key: 'garrison_name',
      header: 'Garrison Unit',
      cell: (row) => (
        <Badge variant="secondary" className="font-medium">
          {row.garrison_name || 'Global'}
        </Badge>
      ),
    },
    {
      key: 'total_students',
      header: 'Total Students',
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'active_students',
      header: 'Active',
      className: 'text-right font-medium text-emerald-600',
      headerClassName: 'text-right',
    },
    {
      key: 'total_staff',
      header: 'Staff Count',
      className: 'text-right',
      headerClassName: 'text-right',
    },
    {
      key: 'fee_collected',
      header: 'Fees Collected',
      className: 'text-right font-semibold text-foreground',
      headerClassName: 'text-right',
      cell: (row) => formatCurrency(Number(row.fee_collected || 0)),
    },
    {
      key: 'pending_amount',
      header: 'Pending Balance',
      className: 'text-right font-medium text-destructive',
      headerClassName: 'text-right',
      cell: (row) => formatCurrency(Number(row.pending_amount || 0)),
    },
    {
      key: 'status',
      header: 'Collection Rate',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (row) => {
        const collected = Number(row.fee_collected || 0);
        const pending = Number(row.pending_amount || 0);
        const total = collected + pending;
        const pct = total > 0 ? Math.round((collected / total) * 100) : 100;
        return (
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-bold">{pct}%</span>
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Generating Performance Reports...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <PageHeader
          title="Network Performance Reports"
          description="In-depth analysis of enrollment, staffing, and financial compliance across all schools."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Super Admin', href: '/super-admin' }, { title: 'Reports' }]}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchReports} className="rounded-full">
              <RefreshCw className="mr-2 h-4 w-4" /> Sync
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-full">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button size="sm" className="rounded-full">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </PageHeader>

        {/* Global Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider">Aggregate Students</CardDescription>
                    <CardTitle className="text-2xl font-bold">{data?.summary.totalStudents || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Total census across all commands</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider">Active Staff</CardDescription>
                    <CardTitle className="text-2xl font-bold">{data?.schoolsPerformance.reduce((sum, s) => sum + s.total_staff, 0) || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Total personnel in the field</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider">Consolidated Revenue</CardDescription>
                    <CardTitle className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.summary.totalCollections || 0)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Successfully processed receipts</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider">Outstanding Arrears</CardDescription>
                    <CardTitle className="text-2xl font-bold text-destructive">{formatCurrency(data?.summary.outstandingBalance || 0)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Pending network collections</p>
                </CardContent>
            </Card>
        </div>

        {/* Performance Audit Table */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-0">
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Institutional Performance Audit</CardTitle>
              <CardDescription className="text-xs">
                Detailed quantitative breakdown of all strategic units.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Filter units..." className="pl-8 h-9 w-[200px] text-xs" />
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter className="h-3.5 w-3.5" /> Filter
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={(data?.schoolsPerformance || []) as any[]}
              columns={columns as any}
              rowKey="school_id"
              emptyMessage="No performance data found for the current selection."
            />
          </CardContent>
        </Card>
      </div>
  );
}
