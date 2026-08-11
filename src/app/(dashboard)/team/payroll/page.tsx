'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    Banknote,
    RefreshCw,
    ChevronRight,
    Search,
    Plus,
    CheckCircle2,
    Calendar,
    Settings,
    FileText,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import payrollService, { PayrollStaffSetting, PayrollRecord } from '@/services/payroll';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function StaffPayrollPage() {
    const [activeTab, setActiveTab] = useState('process');
    const [staffSettings, setStaffSettings] = useState<PayrollStaffSetting[]>([]);
    const [history, setHistory] = useState<PayrollRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection state
    const [period, setPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [editingStaff, setEditingStaff] = useState<PayrollStaffSetting | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [settings, historyData] = await Promise.all([
                payrollService.getStaffSettings(),
                payrollService.getHistory(period.month, period.year)
            ]);
            setStaffSettings(settings);
            setHistory(historyData);
        } catch (err) {
            toast.error("Failed to load payroll registry");
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        try {
            await payrollService.updateSettings(editingStaff);
            toast.success("Salary configuration updated");
            setIsConfigOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Process failed");
        }
    };

    const handleGenerateDraft = async () => {
        if (!confirm(`Generate payroll draft for ${period.month}/${period.year}?`)) return;
        setLoading(true);
        try {
            await payrollService.generateDraft(period.month, period.year);
            toast.success("Monthly draft generated successfully");
            fetchData();
        } catch (err) {
            toast.error("Draft generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePayStaff = async (id: string) => {
        try {
            toast.info("Processing bank/cash protocol...");
            await payrollService.payStaff(id);
            toast.success("Payment finalized and audited as expense");
            fetchData();
        } catch (err) {
            toast.error("Payment protocol failed");
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Personnel Payroll & Remuneration"
                description="Manage staff salary configurations and process monthly payments."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Team', href: '/team' }, { title: 'Payroll' }]}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/20 border p-1 h-12 inline-flex items-center gap-1 rounded-xl">
                    <TabsTrigger value="process" className="gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-background">
                        <Banknote className="size-4" /> Monthly Processing
                    </TabsTrigger>
                    <TabsTrigger value="config" className="gap-2 h-10 px-6 rounded-lg data-[state=active]:bg-background">
                        <Settings className="size-4" /> Salary Setup
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="process" className="mt-0 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-xl border">
                             <div className="flex items-center gap-2 px-3">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground">Period</Label>
                                <div className="flex gap-2">
                                    <Input type="number" className="w-16 h-8 text-xs font-bold" value={period.month} onChange={e => setPeriod({...period, month: parseInt(e.target.value)})} />
                                    <Input type="number" className="w-24 h-8 text-xs font-bold" value={period.year} onChange={e => setPeriod({...period, year: parseInt(e.target.value)})} />
                                </div>
                             </div>
                             <Button size="sm" variant="ghost" onClick={fetchData}><RefreshCw className="size-4" /></Button>
                        </div>

                        <Button className="h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-primary/20" onClick={handleGenerateDraft} disabled={loading}>
                            <Plus className="size-4" /> Generate {period.month}/{period.year} Draft
                        </Button>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/5 border-b">
                            <CardTitle className="text-base font-bold">Payroll Ledger</CardTitle>
                            <CardDescription>Monthly net salary calculations and payment tracking.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Personnel</TableHead>
                                        <TableHead className="font-bold">Base</TableHead>
                                        <TableHead className="font-bold">Allowances</TableHead>
                                        <TableHead className="font-bold">Deductions</TableHead>
                                        <TableHead className="font-bold">Net Payable</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <p className="font-bold text-xs uppercase">{p.staff_name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{p.role_name}</p>
                                            </TableCell>
                                            <TableCell className="text-xs">{formatCurrency(p.base_salary)}</TableCell>
                                            <TableCell className="text-xs text-emerald-600">+{formatCurrency(p.allowances)}</TableCell>
                                            <TableCell className="text-xs text-rose-600">-{formatCurrency(p.deductions)}</TableCell>
                                            <TableCell className="font-black text-sm">{formatCurrency(p.net_salary)}</TableCell>
                                            <TableCell>
                                                <Badge className={p.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-orange-500' + " text-[9px] font-black uppercase"}>
                                                    {p.payment_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {p.payment_status !== 'paid' && (
                                                    <Button size="sm" className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => handlePayStaff(p.id)}>
                                                        Finalize Payment
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {history.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">No payroll entries found for this period.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config" className="mt-0">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/5 border-b">
                            <CardTitle className="text-base font-bold">Salary Registry</CardTitle>
                            <CardDescription>Define base remuneration protocols for all unit staff.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Personnel</TableHead>
                                        <TableHead className="font-bold">Current Base</TableHead>
                                        <TableHead className="font-bold">Standard Allowances</TableHead>
                                        <TableHead className="font-bold">Fixed Deductions</TableHead>
                                        <TableHead className="text-right font-bold">Protocol</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffSettings.map(s => (
                                        <TableRow key={s.user_id}>
                                            <TableCell>
                                                <p className="font-bold text-xs uppercase">{s.full_name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{s.role_name}</p>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold">{formatCurrency(s.base_salary || 0)}</TableCell>
                                            <TableCell className="text-xs text-emerald-600">{formatCurrency(s.allowances || 0)}</TableCell>
                                            <TableCell className="text-xs text-rose-600">{formatCurrency(s.deductions || 0)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingStaff(s); setIsConfigOpen(true); }}>
                                                    <Settings className="size-4 text-indigo-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateConfig}>
                        <DialogHeader>
                            <DialogTitle>Salary Protocol Setup</DialogTitle>
                            <DialogDescription>Define the remuneration structure for {editingStaff?.full_name}.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase">Base Salary (GHS)</Label>
                                <Input type="number" required value={editingStaff?.base_salary || 0} onChange={e => setEditingStaff({...editingStaff!, base_salary: parseFloat(e.target.value)})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase">Allowances</Label>
                                    <Input type="number" value={editingStaff?.allowances || 0} onChange={e => setEditingStaff({...editingStaff!, allowances: parseFloat(e.target.value)})} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase">Deductions</Label>
                                    <Input type="number" value={editingStaff?.deductions || 0} onChange={e => setEditingStaff({...editingStaff!, deductions: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-black uppercase">Update Remuneration Registry</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 justify-center py-6 opacity-30 grayscale">
                <ShieldCheck className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Institutional Remuneration Integrity</p>
            </div>
        </div>
    );
}
