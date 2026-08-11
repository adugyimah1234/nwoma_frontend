'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Building,
  School,
  Users,
  Wallet,
  Plus,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  Building2,
  BarChart3,
  LayoutGrid,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getGarrisonDirectorDashboard,
  createSchoolForGarrison,
  createSchoolAdmin,
  GarrisonDirectorDashboardData,
} from '@/services/garrisonDirector';

export interface GarrisonSchoolData {
  school_id: string;
  school_name: string;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  admin_name: string | null;
  total_students: number;
  active_students: number;
  total_staff: number;
  fee_collected: number;
  pending_amount: number;
}
import { StatsCard } from '@/components/ui/stats-card';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function GarrisonDirectorDashboardPage() {
  const [data, setData] = useState<GarrisonDirectorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');

  // Dialog States
  const [isSchoolDialogOpen, setIsSchoolDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);

  // Form States
  const [newSchool, setNewSchool] = useState({ name: '', address: '', phone_number: '', email: '' });
  const [newAdmin, setNewAdmin] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    school_id: '',
  });

  const [submittingSchool, setSubmittingSchool] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getGarrisonDirectorDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch Garrison Director data:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to load garrison dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.address) {
      setErrorMsg('School name and address are required.');
      return;
    }
    setSubmittingSchool(true);
    setErrorMsg(null);
    try {
      await createSchoolForGarrison(newSchool);
      setSuccessMsg(`School "${newSchool.name}" created under garrison successfully!`);
      setNewSchool({ name: '', address: '', phone_number: '', email: '' });
      setIsSchoolDialogOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to create school.');
    } finally {
      setSubmittingSchool(false);
    }
  };

  const handleCreateSchoolAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.full_name || !newAdmin.username || !newAdmin.password || !newAdmin.school_id) {
      setErrorMsg('Please fill in all required fields for School Administrator.');
      return;
    }
    setSubmittingAdmin(true);
    setErrorMsg(null);
    try {
      await createSchoolAdmin({
        full_name: newAdmin.full_name,
        username: newAdmin.username,
        email: newAdmin.email,
        password: newAdmin.password,
        school_id: newAdmin.school_id,
      });
      setSuccessMsg(`School Administrator "${newAdmin.full_name}" provisioned successfully!`);
      setNewAdmin({ full_name: '', username: '', email: '', password: '', school_id: '' });
      setIsAdminDialogOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to provision school admin.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(amount);
  };

  // Filtered metrics logic
  const filteredMetrics = useMemo(() => {
    if (!data) return null;
    if (selectedSchoolId === 'all') {
      return {
        totalSchools: data.summary.totalSchools,
        totalStudents: data.summary.totalStudents,
        totalCollections: (data.summary as any).totalCollections || (data.summary as any).totalFeeCollected || 0,
        staffCount: data.schools.reduce((sum, s) => sum + s.total_staff, 0),
        schools: data.schools
      };
    }

    const school = data.schools.find(s => String(s.school_id) === selectedSchoolId);
    return {
      totalSchools: 1,
      totalStudents: school?.total_students || 0,
      totalCollections: school?.fee_collected || 0,
      staffCount: school?.total_staff || 0,
      schools: school ? [school] : []
    };
  }, [data, selectedSchoolId]);

  const schoolColumns: DataTableColumn<GarrisonSchoolData>[] = [
    {
      key: 'school_name',
      header: 'School Unit',
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.school_name}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">{row.email || 'UNIT_SECURE'}</div>
        </div>
      ),
    },
    {
      key: 'admin_name',
      header: 'Assigned Admin',
      cell: (row) => (
        <span className="text-xs font-medium">
          {row.admin_name || <span className="text-muted-foreground italic">Unassigned</span>}
        </span>
      ),
    },
    { key: 'total_students', header: 'Census', className: 'text-center' },
    { key: 'total_staff', header: 'Staffing', className: 'text-center' },
    {
      key: 'fee_collected',
      header: 'Collected',
      className: 'text-right font-bold text-emerald-600',
      cell: (row) => formatCurrency(Number(row.fee_collected || 0)),
    },
    {
        key: 'pending_amount',
        header: 'Arrears',
        className: 'text-right font-bold text-rose-500',
        cell: (row) => formatCurrency(Number(row.pending_amount || 0)),
    },
  ];

  const chartData = useMemo(() => {
    const list = selectedSchoolId === 'all' ? (data?.schools || []) : [data?.schools.find(s => String(s.school_id) === selectedSchoolId)].filter(Boolean);
    return list.map((sch: any) => ({
        name: sch.school_name.replace(/SCHOOL|BASIC|KINDERGARTEN/g, '').trim(),
        students: Number(sch.total_students || 0),
    }));
  }, [data, selectedSchoolId]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground italic">Syncing Command Records...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <PageHeader
          title={data?.garrison.name || 'Garrison Directorate'}
          description={`Command HQ: ${data?.garrison.location || 'Secure Location'}`}
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Garrison Directorate' }]}
        >
          <div className="flex items-center gap-3">
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger className="w-[260px] h-10 bg-white dark:bg-slate-950 shadow-sm">
                    <LayoutGrid className="size-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" className="font-bold">General (All Schools)</SelectItem>
                    {data?.schools.map(s => (
                        <SelectItem key={s.school_id} value={String(s.school_id)}>{s.school_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="h-10">
              <RefreshCw className="mr-2 h-4 w-4" /> Sync
            </Button>

            <Dialog open={isSchoolDialogOpen} onOpenChange={setIsSchoolDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-10 px-4">
                  <Plus className="mr-2 h-4 w-4" /> Add School
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreateSchool}>
                  <DialogHeader>
                    <DialogTitle>Register New School Unit</DialogTitle>
                    <DialogDescription>Add a new educational facility to this Garrison Command.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2"><Label>School Name *</Label><Input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} required /></div>
                    <div className="grid gap-2"><Label>Location Address *</Label><Input value={newSchool.address} onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })} required /></div>
                  </div>
                  <DialogFooter><Button type="submit">Create Unit</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </PageHeader>

        {/* Metric Cards Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Managed Units" value={filteredMetrics?.totalSchools || 0} icon={School} />
          <StatsCard title="Total Strength" value={filteredMetrics?.totalStudents || 0} icon={Users} />
          <StatsCard title="Command Staff" value={filteredMetrics?.staffCount || 0} icon={ShieldCheck} />
          <StatsCard title="Total Revenue" value={formatCurrency(Number(filteredMetrics?.totalCollections || 0))} icon={Wallet} />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Performance Visualization */}
          <Card className="lg:col-span-8 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold">Unit Strength Analysis</CardTitle>
              <CardDescription>Enrollment distribution across command schools.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar name="Students" dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Command Info */}
          <Card className="lg:col-span-4 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-base font-semibold">Command Metadata</CardTitle>
              <CardDescription>Jurisdiction profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-lg bg-muted/40 p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary"><Building className="size-4" /></div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Assigned Command</p>
                        <p className="text-sm font-black">{data?.garrison.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600"><MapPin className="size-4" /></div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">HQ Location</p>
                        <p className="text-sm font-medium">{data?.garrison.location || 'Secure Base'}</p>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Directory Table */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4 mb-0">
              <CardTitle className="text-base font-bold">Garrison Units Directory</CardTitle>
              <CardDescription>Comprehensive metrics for all schools under your jurisdiction.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={(filteredMetrics?.schools || []) as any[]}
              columns={schoolColumns as any}
              rowKey="school_id"
              emptyMessage="No schools under this Garrison Command yet."
            />
          </CardContent>
        </Card>
      </div>
  );
}
