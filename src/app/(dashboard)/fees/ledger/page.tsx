'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    MessageSquare,
    Search,
    RefreshCw,
    ArrowUpRight,
    ChevronRight,
    Filter,
    AlertCircle,
    User,
    Download,
    QrCode,
    Copy,
    Smartphone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getDebtLedger, sendBulkDebtReminders } from '@/services/fee';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
                <div>
                    <div className="font-bold text-sm uppercase">{row.first_name} {row.last_name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-mono">{row.class_name} | {row.school_name}</div>
                </div>
            )
        },
        {
            key: 'guardian',
            header: 'Guardian Contact',
            cell: (row) => (row.guardian_phone_number)
        },
        {
            key: 'financials',
            header: 'Financial Status',
            cell: (row) => {
                const percent = (row.total_paid / row.total_fees) * 100;
                return (
                    <div className="w-48 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span>{formatCurrency(row.total_paid)} paid</span>
                            <span>{percent.toFixed(0)}%</span>
                        </div>
                        <Progress value={percent} className="h-1" />
                    </div>
                );
            }
        },
        {
            key: 'balance',
            header: 'Outstanding',
            className: 'text-right',
            cell: (row) => (
                <div className="text-right">
                    <div className="font-black text-rose-600">{formatCurrency(row.balance)}</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-bold">Total: {formatCurrency(row.total_fees)}</div>
                </div>
            )
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (row) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100"
                        onClick={() => {
                            setSelectedStudent(row);
                            setIsProtocolOpen(true);
                        }}
                    >
                        <QrCode className="size-3" /> Pay-Link
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ArrowUpRight className="size-4" />
                    </Button>
                </div>
            )
        }
    ];

    const totalDebt = data.reduce((sum, d) => sum + d.balance, 0);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Debt Ledger & Arrears"
                description="Monitor outstanding fees and manage 'Pay-Small-Small' installment tracking."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Debt Ledger' }]}
            >
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData} className="h-10">
                        <RefreshCw className="mr-2 size-4" /> Sync
                    </Button>
                    <Button
                        onClick={() => {}} // Handle broadcast
                        disabled={sending || data.length === 0}
                        className="h-10 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 gap-2"
                    >
                        {sending ? <RefreshCw className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                        Broadcast Reminders
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ... stat cards ... */}
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">Arrears Ledger</CardTitle>
                        <CardDescription>Real-time calculation of student debt across all assigned units.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                        <Download className="size-3" /> Export CSV
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        data={data as any[]}
                        columns={columns as any}
                        searchPlaceholder="Filter by student or unit..."
                        searchKey="first_name"
                        loading={loading}
                        rowKey="id"
                    />
                </CardContent>
            </Card>

            {/* PAY-LINK DIALOG */}
            <Dialog open={isProtocolOpen} onOpenChange={setIsProtocolOpen}>
                <DialogContent className="sm:max-w-[400px] border-none shadow-2xl p-0 overflow-hidden rounded-2xl">
                    <div className="bg-indigo-900 p-8 text-white text-center space-y-4">
                        <div className="size-16 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20">
                            <Smartphone className="size-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Mobile Money Protocol</h3>
                            <p className="text-xs text-indigo-300">Official Payment Link for {selectedStudent?.first_name}</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Reference</span>
                                    <Badge className="bg-indigo-600 font-mono">{selectedStudent?.id.substring(0,8).toUpperCase()}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Due</span>
                                    <span className="text-sm font-black text-rose-600">{formatCurrency(selectedStudent?.balance || 0)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase text-slate-800">USSD Command Instructions</h4>
                                <div className="space-y-2">
                                    {[
                                        "Dial *170# (MTN) or *110# (Telecel)",
                                        "Navigate to 'Pay Merchant'",
                                        `Use Reference: ${selectedStudent?.id.substring(0,8).toUpperCase()}`,
                                        "Confirm payment and save SMS receipt"
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-3 items-start text-xs text-slate-600">
                                            <span className="size-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-[10px]">{i+1}</span>
                                            <p className="leading-tight">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex flex-col gap-3">
                            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold" onClick={() => selectedStudent && handleCopyProtocol(selectedStudent)}>
                                <Copy className="size-4" /> COPY PROTOCOL TO SHARE
                            </Button>
                            <p className="text-[9px] text-center text-muted-foreground uppercase font-medium tracking-tighter">Copy this protocol and send it to the parent via WhatsApp or SMS.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 justify-center py-6 opacity-20 grayscale">
                <Wallet className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Financial Command Security</p>
            </div>
        </div>
    );
}
