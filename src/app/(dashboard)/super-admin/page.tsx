'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  Users,
  School,
  Wallet,
  RefreshCw,
  BarChart3,
  Activity,
  TrendingUp,
  UserCheck,
  LayoutGrid,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
  getSuperAdminDashboard,
  ExecutiveDashboardData,
} from '@/services/superAdmin';
import { StatsCard } from '@/components/ui/stats-card';
import { PageHeader } from '@/components/layout/page-header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGarrisonId, setSelectedGarrisonId] = useState<string>('all');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashRes = await getSuperAdminDashboard();
      setData(dashRes);
    } catch (err) {
      console.error('Failed to fetch Super Admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredMetrics = useMemo(() => {
    if (!data) return null;
    if (selectedGarrisonId === 'all') {
      return {
        totalGarrisons: data.summary.totalGarrisons,
        totalSchools: data.summary.totalSchools,
        totalStudents: data.summary.totalStudents,
        totalCollections: data.summary.totalCollections,
        schools: data.schoolsPerformance,
        garrisons: data.garrisonsPerformance
      };
    }
    const garrison = data.garrisonsPerformance.find(g => g.garrison_id === selectedGarrisonId);
    const schools = data.schoolsPerformance.filter(s => s.garrison_id === selectedGarrisonId);
    return {
      totalGarrisons: 1,
      totalSchools: garrison?.total_schools || 0,
      totalStudents: garrison?.total_students || 0,
      totalCollections: garrison?.total_collected || 0,
      schools: schools,
      garrisons: garrison ? [garrison] : []
    };
  }, [data, selectedGarrisonId]);

  const chartData = useMemo(() => {
    return (filteredMetrics?.schools || []).map(s => ({
      name: s.school_name.replace(/SCHOOL|BASIC|KINDERGARTEN/g, '').trim(),
      students: s.total_students,
    }));
  }, [filteredMetrics]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground italic">Synchronizing Network Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <PageHeader
          title="Super Admin Dashboard"
          description="Global oversight and network performance analytics."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Super Admin' }, { title: 'Dashboard' }]}
        >
          <div className="flex items-center gap-3">
            <Select value={selectedGarrisonId} onValueChange={setSelectedGarrisonId}>
                <SelectTrigger className="w-[280px] h-10 shadow-sm">
                    <LayoutGrid className="size-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Garrisons" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" className="font-bold">General (All Garrisons)</SelectItem>
                    {data?.garrisonsPerformance.map(g => (
                        <SelectItem key={g.garrison_id} value={g.garrison_id}>{g.garrison_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="h-10">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </PageHeader>

        {/* Aggregate Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title={selectedGarrisonId === 'all' ? "Total Garrisons" : "Active Command"} value={filteredMetrics?.totalGarrisons || 0} icon={Building2} />
          <StatsCard title="Operational Schools" value={filteredMetrics?.totalSchools || 0} icon={School} />
          <StatsCard title="Total Enrollment" value={filteredMetrics?.totalStudents || 0} icon={Users} />
          <StatsCard title="Institutional Revenue" value={formatCurrency(Number(filteredMetrics?.totalCollections || 0))} icon={Wallet} />
        </div>

        {/* Strategic Revenue Breakdown (Shadcn UI Standard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data?.summary.categoryRevenue || []).map((cat) => (
                <Card key={cat.category} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {cat.category} Revenue
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">Audit</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(cat.total)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Verified {cat.category} fee collections</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Garrison Command Table */}
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Garrison Operational Breakdown</CardTitle>
                <CardDescription>Comparison of battalion strength and fee collections.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Battalion Unit</TableHead>
                            <TableHead className="text-center">Schools</TableHead>
                            <TableHead className="text-center">Strength</TableHead>
                            <TableHead className="text-right">Fee Collections</TableHead>
                            <TableHead className="pr-6">Commanding Officer(s)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(data?.garrisonsPerformance || []).map((g) => (
                            <TableRow key={g.garrison_id} className={selectedGarrisonId !== 'all' && selectedGarrisonId !== g.garrison_id ? 'opacity-30' : ''}>
                                <TableCell className="pl-6 font-semibold">{g.garrison_name}</TableCell>
                                <TableCell className="text-center">{g.total_schools}</TableCell>
                                <TableCell className="text-center font-medium">{g.total_students}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{formatCurrency(g.total_collected)}</TableCell>
                                <TableCell className="pr-6">
                                    <div className="flex flex-wrap gap-1">
                                        {g.director_name ? g.director_name.split(', ').map((name, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] uppercase">{name}</Badge>
                                        )) : (
                                            <span className="text-[10px] text-muted-foreground italic">Vacant</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Chart Section - Theme Aware */}
          <Card className="lg:col-span-8 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold">School Performance Matrix</CardTitle>
              <CardDescription>Enrollment distribution across strategic units.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }} interval={0} angle={-15} textAnchor="end" />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }} />
                        <Tooltip
                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar name="Students" dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Network Alerts */}
          <Card className="lg:col-span-4 shadow-sm">
              <CardHeader className="border-b">
                 <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="size-4 text-primary" /> Network Monitoring
                 </CardTitle>
                 <CardDescription className="text-xs">Critical system requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                 <div className="flex gap-4 p-4 rounded-xl border bg-muted/20">
                    <UserCheck className="h-5 w-5 text-amber-500 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold">Directorship Audit</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Verification required for multi-director commands or unassigned battalions.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 p-4 rounded-xl border bg-muted/20">
                    <TrendingUp className="h-5 w-5 text-blue-500 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold">Census Growth</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Enrollment trending upwards in 3BN region. Ensure classroom capacity synchronization.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
  );
}
