'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Printer,
  Eye,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Loader2,
  Banknote,
  Wallet,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { PageHeader } from '@/components/layout/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useReceipts } from './hooks/useReceipts';
import { CreateReceiptForm } from './components/CreateReceiptForm';
import { getPrintableReceipt } from "@/services/receipt";
import { useAuth } from "@/contexts/AuthContext";
import { calculateStudentTotalDue } from './calculateStudentTotalDue';
import { Receipt } from '@/types/receipt';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { StatsCard } from '@/components/ui/stats-card';

export default function ReceiptManagement() {
  const { isAdmin, isAccountant } = useAuth();
  const canManageReceipts = isAdmin || isAccountant;
  const {
    receipts,
    filteredReceipts,
    loading,
    refresh,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    applicants,
    realStudents,
    categories,
    classes
  } = useReceipts();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handlePrint = async (receiptId: string | number) => {
    setProcessingId(receiptId);
    try {
      const html = await getPrintableReceipt(String(receiptId));
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
      } else {
        toast.error("Unable to open print window. Please allow pop-ups.");
      }
    } catch (err) {
      toast.error("Failed to generate printable receipt.");
    } finally {
      setProcessingId(null);
    }
  };

  const getReceiptDisplayName = (receipt: Receipt) => {
    if (receipt.student_name?.trim()) return receipt.student_name.trim();
    if (receipt.registration_first_name || receipt.registration_last_name) {
      return `${receipt.registration_first_name || ''} ${receipt.registration_last_name || ''}`.trim();
    }
    return `ID: ${receipt.student_id || receipt.registration_id}`;
  };

  const columns: DataTableColumn<Receipt>[] = [
    {
        key: 'id',
        header: 'Receipt No.',
        cell: (row) => (
            <span className="font-mono text-[11px] font-bold text-muted-foreground/50">R-{String(row.id).padStart(6, '0')}</span>
        )
    },
    {
        key: 'student_name',
        header: 'Student & Unit',
        cell: (row) => (
            <div className="space-y-0.5">
                <p className="font-semibold text-sm uppercase tracking-tight leading-none mb-1">{getReceiptDisplayName(row)}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">{row.class_name}</p>
            </div>
        )
    },
    {
        key: 'items',
        header: 'Payment For',
        cell: (row) => (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
                {row.receipt_items?.slice(0, 2).map(item => (
                    <Badge key={item.id} variant="secondary" className="bg-indigo-50 text-indigo-700 border-none text-[10px] font-bold uppercase tracking-tight px-2 py-0">
                        {item.receipt_type}
                    </Badge>
                ))}
                {row.receipt_items && row.receipt_items.length > 2 && (
                    <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 border-slate-100 text-slate-400">+{row.receipt_items.length - 2}</Badge>
                )}
            </div>
        )
    },
    {
        key: 'amount',
        header: 'Amount',
        cell: (row) => (
            <span className="font-bold text-primary text-sm">{formatCurrency(row.amount)}</span>
        )
    },
    {
        key: 'date',
        header: 'Date Paid',
        cell: (row) => (
            <span className="text-[11px] font-semibold text-muted-foreground">{formatDate(row.date_issued)}</span>
        )
    },
    {
        key: 'balance',
        header: 'Balance Due',
        cell: (row) => {
            const person = realStudents.find(s => String(s.id) === String(row.student_id)) || applicants.find(a => String(a.id) === String(row.registration_id));
            const studentReceipts = receipts.filter(r =>
                (row.student_id && String(r.student_id) === String(row.student_id)) ||
                (row.registration_id && String(r.registration_id) === String(row.registration_id))
            );
            const paidSet = new Set<string>();
            studentReceipts.forEach(r => r.receipt_items?.forEach(i => paidSet.add(i.receipt_type)));

            let duesLeft = 'N/A';
            if (person && categories.length && classes.length) {
                const totalDue = calculateStudentTotalDue(person as any, categories as any, classes as any, Array.from(paidSet));
                duesLeft = formatCurrency(totalDue);
            }
            return <span className="text-[11px] font-bold text-rose-500">{duesLeft}</span>;
        }
    },
    {
        key: 'actions',
        header: '',
        className: 'text-right pr-4',
        cell: (row) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
                        {processingId === row.id ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-2xl dark:shadow-none">
                    <DropdownMenuItem onClick={() => handlePrint(row.id)} className="rounded-xl h-11 font-bold cursor-pointer">
                        <Printer className="mr-3 size-4 text-primary" /> Print Receipt
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl h-11 font-bold cursor-pointer">
                        <Eye className="mr-3 size-4 text-primary" /> View Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  ];

  const totalRevenue = useMemo(() => receipts.reduce((sum, r) => sum + Number(r.amount), 0), [receipts]);
  const todayRevenue = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return receipts.filter(r => r.date_issued === today).reduce((sum, r) => sum + Number(r.amount), 0);
  }, [receipts]);

  const tableData = useMemo(() => {
    return filteredReceipts.map(r => ({
        ...r,
        student_name: getReceiptDisplayName(r)
    }));
  }, [filteredReceipts]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto w-full">
        <PageHeader
            title="Financial Registry"
            description="Official record of school fees and payments received."
            breadcrumbs={[
                { title: 'Home', href: '/' },
                { title: 'Fees', href: '/fees' },
                { title: 'Receipts' }
            ]}
        >
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refresh} className="h-9">
                    <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} /> Sync
                </Button>
                {canManageReceipts && (
                    <Button className="h-9 gap-2 font-semibold" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="size-4" /> Create Receipt
                    </Button>
                )}
            </div>
        </PageHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={Banknote} />
            <StatsCard title="Today's Intake" value={formatCurrency(todayRevenue)} icon={Wallet} />
            <StatsCard title="Total Receipts" value={receipts.length} icon={FileSpreadsheet} />
            <StatsCard title="Active Records" value={receipts.filter(r => !!r.registration_id).length} icon={AlertCircle} />
        </div>

        <Card className="shadow-none border border-border/60 overflow-hidden">
            <CardHeader className="border-b bg-muted/10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold uppercase tracking-tight">Financial Registry</CardTitle>
                    <CardDescription>Comprehensive log of all finalized financial transactions.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 font-semibold text-xs uppercase tracking-wider">
                                <Filter className="size-3" /> Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border shadow-xl dark:shadow-none">
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">Classification</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted/10" />
                            {['levy', 'registration', 'textBooks', 'exerciseBooks', 'jersey', 'crest'].map(t => (
                                <DropdownMenuItem key={t} onClick={() => setFilters({...filters, receipt_type: t})} className="rounded-xl h-10 font-semibold capitalize cursor-pointer">
                                    {t}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="bg-muted/10" />
                            <DropdownMenuItem onClick={() => setFilters({})} className="rounded-xl h-10 font-bold text-destructive cursor-pointer">
                                Reset Filters
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <DataTable
                    data={tableData as any[]}
                    columns={columns as any}
                    searchPlaceholder="Search by student name or receipt ID..."
                    searchKey="student_name"
                    onSearch={(val) => setSearchInput(val)}
                    loading={loading}
                    rowKey="id"
                />
            </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="sm:max-w-[500px] p-6 rounded-xl border border-border shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg font-bold uppercase tracking-tight">Issue Receipt</DialogTitle>
                    <DialogDescription className="text-xs">Record payment for fees and items.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <CreateReceiptForm
                        applicants={applicants}
                        realStudents={realStudents}
                        categories={categories}
                        classes={classes}
                        existingReceipts={receipts}
                        onSuccess={() => { setShowCreateDialog(false); refresh(); }}
                        onCancel={() => setShowCreateDialog(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
