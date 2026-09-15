'use client';

import React, { useState } from 'react';
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
  Loader2
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

import { useReceipts } from './hooks/useReceipts';
import { CreateReceiptForm } from './components/CreateReceiptForm';
import { getPrintableReceipt } from "@/services/receipt";
import { useAuth } from "@/contexts/AuthContext";
import { calculateStudentTotalDue } from './calculateStudentTotalDue';
import { Receipt } from '@/types/receipt';

export default function ReceiptManagement() {
  const { isAdmin } = useAuth();
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.body.innerHTML = html;
        newWindow.document.close();
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

  const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
  const paginatedReceipts = filteredReceipts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        <PageHeader
            title="Treasury Registry"
            description="Verified institutional payment logs and financial records."
            breadcrumbs={[
                { title: 'Home', href: '/' },
                { title: 'Fees', href: '/fees' },
                { title: 'Invoices' }
            ]}
        >
            <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Registry..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-10 pl-9 rounded-xl border-slate-200"
                    />
                </div>
                {isAdmin && (
                    <Button className="h-10 rounded-xl font-bold text-xs uppercase tracking-wider px-6 shadow-lg shadow-primary/10" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 size-4" /> Issue Receipt
                    </Button>
                )}
            </div>
        </PageHeader>

        <div className="grid grid-cols-1 gap-6">
            <Card className="overflow-hidden border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileText className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Payment History</CardTitle>
                            <CardDescription className="text-xs font-medium uppercase tracking-tight">Recent financial activities</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 gap-2 text-[10px] font-bold uppercase tracking-wider">
                                    <Filter className="size-3" /> Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 shadow-xl">
                                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">Classification</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                {['levy', 'registration', 'textBooks', 'exerciseBooks', 'jersey', 'crest'].map(t => (
                                    <DropdownMenuItem key={t} onClick={() => setFilters({...filters, receipt_type: t})} className="rounded-xl h-10 font-semibold capitalize cursor-pointer">
                                        {t}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => setFilters({})} className="rounded-xl h-10 font-bold text-destructive cursor-pointer">
                                    Reset Filters
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="icon" onClick={refresh} className="size-8 rounded-lg"><RefreshCw className="size-3.5" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-10 space-y-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="pl-8 py-5 text-[11px] font-bold uppercase tracking-tight text-slate-500">Registry ID</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Payer Identity</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Allocation</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Amount</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase tracking-tight text-slate-500">Date Issued</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase tracking-tight text-rose-500">Dues Left</TableHead>
                                        <TableHead className="text-right pr-8 text-[11px] font-bold uppercase tracking-tight text-slate-500"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence initial={false}>
                                        {paginatedReceipts.map((receipt, index) => {
                                            const person = realStudents.find(s => String(s.id) === String(receipt.student_id)) || applicants.find(a => String(a.id) === String(receipt.registration_id));

                                            const studentReceipts = receipts.filter(r =>
                                                (receipt.student_id && String(r.student_id) === String(receipt.student_id)) ||
                                                (receipt.registration_id && String(r.registration_id) === String(receipt.registration_id))
                                            );

                                            const paidSet = new Set<string>();
                                            studentReceipts.forEach(r => r.receipt_items?.forEach(i => paidSet.add(i.receipt_type)));

                                            let duesLeft = 'N/A';
                                            if (person && categories.length && classes.length) {
                                                const totalDue = calculateStudentTotalDue(person as any, categories as any, classes as any, Array.from(paidSet));
                                                duesLeft = formatCurrency(totalDue);
                                            }

                                            return (
                                                <motion.tr
                                                    key={receipt.id || index}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="group hover:bg-muted/30 border-b border-muted/50 last:border-none transition-colors"
                                                >
                                                    <TableCell className="pl-8 py-5">
                                                        <span className="font-mono text-[11px] font-bold text-slate-400">R-{String(receipt.id).padStart(6, '0')}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <p className="font-bold text-sm text-slate-900 tracking-tight uppercase leading-none mb-1">{getReceiptDisplayName(receipt)}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{receipt.class_name}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {receipt.receipt_items?.slice(0, 2).map(item => (
                                                                <Badge key={item.id} variant="secondary" className="bg-indigo-50 text-indigo-700 border-none text-[10px] font-bold uppercase tracking-tight px-2 py-0">
                                                                    {item.receipt_type}
                                                                </Badge>
                                                            ))}
                                                            {receipt.receipt_items && receipt.receipt_items.length > 2 && (
                                                                <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 border-slate-100 text-slate-400">+{receipt.receipt_items.length - 2}</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-indigo-600 text-sm">{formatCurrency(receipt.amount)}</TableCell>
                                                    <TableCell className="text-[11px] font-semibold text-slate-500">{formatDate(receipt.date_issued)}</TableCell>
                                                    <TableCell className="text-[11px] font-bold text-rose-500">{duesLeft}</TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-900">
                                                                    {processingId === receipt.id ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 shadow-2xl">
                                                                <DropdownMenuItem onClick={() => handlePrint(receipt.id)} className="rounded-xl h-11 font-bold cursor-pointer">
                                                                    <Printer className="mr-3 size-4 text-indigo-600" /> Print Receipt
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-xl h-11 font-bold cursor-pointer">
                                                                    <Eye className="mr-3 size-4 text-indigo-600" /> View Details
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && filteredReceipts.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 border-t border-muted/50 bg-muted/5">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
                                    <Select value={`${pageSize}`} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                                        <SelectTrigger className="h-6 w-14 text-[11px] font-bold border-none bg-transparent shadow-none focus:ring-0 p-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                            {[10, 20, 50, 100].map((s) => <SelectItem key={s} value={String(s)} className="text-[11px] font-bold">{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Entries</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight hidden sm:inline">Records {Math.min((page - 1) * pageSize + 1, filteredReceipts.length)} - {Math.min(page * pageSize, filteredReceipts.length)} of {filteredReceipts.length}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => setPage(1)} disabled={page === 1}><ChevronFirst className="size-3.5" /></Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}><ChevronLeft className="size-3.5" /></Button>
                                <div className="flex items-center mx-4 gap-2 text-[11px] font-bold uppercase tracking-tight text-slate-400">Page <span className="text-indigo-600">{page}</span> / {totalPages}</div>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}><ChevronRight className="size-3.5" /></Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => setPage(totalPages)} disabled={page >= totalPages}><ChevronLast className="size-3.5" /></Button>
                            </div>
                        </div>
                    )}

                    {!loading && filteredReceipts.length === 0 && (
                        <div className="text-center py-24 bg-muted/5">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/10" />
                            <p className="mt-4 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No treasury records discovered</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><FileText className="size-40" /></div>
                    <DialogHeader className="relative z-10 space-y-2">
                        <Badge variant="outline" className="w-fit border-primary-foreground/30 text-primary-foreground font-bold text-[10px] tracking-widest px-4 py-1.5 uppercase">Treasury Node</Badge>
                        <DialogTitle className="text-3xl font-bold tracking-tight">Issue Official Receipt</DialogTitle>
                        <DialogDescription className="text-primary-foreground/70 text-xs font-medium">Record a financial transaction into the command registry.</DialogDescription>
                    </DialogHeader>
                </div>
                <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
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
