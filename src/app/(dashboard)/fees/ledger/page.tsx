'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    MessageSquare,
    Search,
    RefreshCw,
    ArrowUpRight,
    Filter,
    Download,
    QrCode,
    Copy,
    Smartphone,
    CreditCard,
    AlertCircle,
    UserCircle,
    FileSpreadsheet,
    Banknote
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getDebtLedger } from '@/services/fee';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { StatsCard } from '@/components/ui/stats-card';

interface DebtRecord {
    id: string;
    first_name: string;
    last_name: string;
    class_name: string;
    school_name: string;
    guardian_name: string;
    guardian_phone_number: string;
    total_fees: number;
    total_paid: number;
    balance: number;
}

export default function DebtLedgerPage() {
    const [data, setData] = useState<DebtRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<DebtRecord | null>(null);
    const [isProtocolOpen, setIsProtocolOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDebtLedger();
            setData(res);
        } catch (err) {
            toast.error("Failed to load debt registry");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    const handleCopyProtocol = (student: DebtRecord) => {
        const ref = student.id.substring(0, 8).toUpperCase();
        const protocol = `GARRISON PAYMENT PROTOCOL\nStudent: ${student.first_name} ${student.last_name}\nReference: ${ref}\nBalance: GHS ${student.balance.toFixed(2)}\n\nInstructions:\n1. Dial *170# (MTN) or *110# (Telecel)\n2. Select Pay Merchant\n3. Merchant ID: [YOUR_SCHOOL_ID]\n4. Reference: USE ${ref}\n5. Confirm and keep your SMS receipt.`;

        navigator.clipboard.writeText(protocol);
        toast.success("Payment protocol copied to clipboard");
    };

    const columns: DataTableColumn<DebtRecord>[] = [
        {
            key: 'student',
            header: 'Student & Unit',
            cell: (row) => (
                <div className="space-y-0.5">
                    <div className="font-semibold text-sm uppercase tracking-tight">{row.first_name} {row.last_name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">{row.class_name} • {row.school_name}</div>
                </div>
            )
        },
        {
            key: 'guardian',
            header: 'Guardian Contact',
            cell: (row) => (
                <div className="text-xs font-medium">{row.guardian_phone_number}</div>
            )
        },
        {
            key: 'financials',
            header: 'Financial Status',
            cell: (row) => {
                const percent = (row.total_paid / row.total_fees) * 100;
                return (
                    <div className="w-48 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                            <span className="text-muted-foreground">{formatCurrency(row.total_paid)} Paid</span>
                            <span className={cn(percent >= 100 ? "text-emerald-600" : "text-primary")}>{percent.toFixed(0)}%</span>
                        </div>
                        <Progress value={percent} className="h-1 bg-muted" />
                    </div>
                );
            }
        },
        {
            key: 'balance',
            header: 'Outstanding',
            className: 'text-right',
            cell: (row) => (
                <div className="text-right space-y-0.5">
                    <div className="font-bold text-sm text-destructive">{formatCurrency(row.balance)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Of {formatCurrency(row.total_fees)}</div>
                </div>
            )
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right pr-4',
            cell: (row) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] font-semibold uppercase tracking-wider border-border/60 hover:bg-muted"
                        onClick={() => {
                            setSelectedStudent(row);
                            setIsProtocolOpen(true);
                        }}
                    >
                        <QrCode className="size-3 mr-2 opacity-60" /> Pay-Link
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ArrowUpRight className="size-4" />
                    </Button>
                </div>
            )
        }
    ];

    const totalOutstanding = data.reduce((sum, d) => sum + d.balance, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.total_paid, 0);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
            <PageHeader
                title="Debt Ledger & Arrears"
                description="Monitor outstanding fees and manage installment tracking."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Debt Ledger' }]}
            >
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} className="h-9">
                        <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} /> Sync
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {}}
                        disabled={sending || data.length === 0}
                        className="h-9 gap-2 font-semibold"
                    >
                        <MessageSquare className="size-4" /> Broadcast Reminders
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Debt" value={formatCurrency(totalOutstanding)} icon={Banknote} />
                <StatsCard title="Collected" value={formatCurrency(totalRevenue)} icon={Wallet} />
                <StatsCard title="Total Billing" value={formatCurrency(totalOutstanding + totalRevenue)} icon={FileSpreadsheet} />
                <StatsCard title="Active Debts" value={data.filter(d => d.balance > 0).length} icon={AlertCircle} />
            </div>

            <Card className="shadow-none border border-border/60">
                <CardHeader className="border-b bg-muted/10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold uppercase tracking-tight">Arrears Ledger</CardTitle>
                        <CardDescription>Real-time calculation of student debt across all assigned units.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2 font-semibold text-xs uppercase tracking-wider">
                        <Download className="size-3" /> Export CSV
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        data={data as any[]}
                        columns={columns as any}
                        searchPlaceholder="Filter by name or unit..."
                        searchKey="first_name"
                        loading={loading}
                        rowKey="id"
                    />
                </CardContent>
            </Card>

            {/* PAY-LINK DIALOG */}
            <Dialog open={isProtocolOpen} onOpenChange={setIsProtocolOpen}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden shadow-none border border-border">
                    <div className="p-8 text-center space-y-6">
                        <div className="size-16 rounded-full bg-muted border flex items-center justify-center mx-auto">
                            <Smartphone className="size-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold uppercase tracking-tight">Payment Protocol</h3>
                            <p className="text-xs text-muted-foreground">Official Mobile Money Link for {selectedStudent?.first_name}</p>
                        </div>

                        <div className="grid gap-4">
                            <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Target Reference</span>
                                    <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-background">{selectedStudent?.id.substring(0,8).toUpperCase()}</Badge>
                                </div>
                                <Separator className="opacity-40" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Amount Outstanding</span>
                                    <span className="text-base font-bold text-destructive">{formatCurrency(selectedStudent?.balance || 0)}</span>
                                </div>
                            </div>

                            <div className="text-left space-y-3">
                                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Execution Steps</h4>
                                <div className="space-y-2.5">
                                    {[
                                        "Dial *170# (MTN) or *110# (Telecel)",
                                        "Select 'Pay Merchant' option",
                                        `Use Reference: ${selectedStudent?.id.substring(0,8).toUpperCase()}`,
                                        "Confirm payment and retain receipt"
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-3 items-center text-xs font-medium text-foreground">
                                            <span className="size-5 rounded-full bg-muted border flex items-center justify-center text-muted-foreground font-bold shrink-0 text-[10px]">{i+1}</span>
                                            <p className="leading-none">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-3">
                            <Button className="w-full h-12 font-bold uppercase text-xs tracking-widest gap-2" onClick={() => selectedStudent && handleCopyProtocol(selectedStudent)}>
                                <Copy className="size-4" /> Copy Instructions
                            </Button>
                            <p className="text-[10px] text-muted-foreground font-medium italic">Share this protocol with the parent via messaging terminal.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 justify-center py-6 opacity-20">
                <Wallet className="size-6" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Financial Command Security</p>
            </div>
        </div>
    );
}
