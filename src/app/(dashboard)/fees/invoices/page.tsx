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
import { Card, CardContent } from "@/components/ui/card";
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
    error,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    applicants,
    realStudents,
    categories,
    classes,
    refresh
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
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter uppercase tracking-widest">Treasury Registry</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 opacity-60">Verified institutional payment logs</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                        placeholder="Search by ID or Name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-12 pl-12 rounded-2xl bg-muted/50 border-none shadow-sm font-bold"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 w-12 rounded-2xl border-none bg-muted/50 hover:bg-primary/5 p-0">
                                <Filter className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Filter by Type</DropdownMenuLabel>
                            <DropdownMenuSeparator className="mx-2" />
                            {['levy', 'registration', 'textBooks', 'exerciseBooks', 'jersey', 'crest'].map(t => (
                                <DropdownMenuItem key={t} onClick={() => setFilters({...filters, receipt_type: t})} className="rounded-xl h-10 font-bold capitalize">
                                    {t}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator className="mx-2" />
                            <DropdownMenuItem onClick={() => setFilters({})} className="rounded-xl h-10 font-bold text-destructive">
                                Clear Filters
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isAdmin && (
                        <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20 whitespace-nowrap" onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Issue Receipt
                        </Button>
                    )}
                </div>
            </div>
        </div>

      <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="pl-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Registry ID</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Payer Identity</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Allocation</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Amount</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Date Issued</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Dues Left</TableHead>
                            <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em]">Actions</TableHead>
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
                                        className="group hover:bg-muted/30 border-b border-muted-foreground/5 last:border-none transition-colors"
                                    >
                                        <TableCell className="pl-10 py-6 font-black text-[10px] tracking-widest text-primary/60">
                                            R-{String(receipt.id).padStart(6, '0')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col min-w-[150px]">
                                                <p className="font-black text-sm tracking-tighter uppercase">{getReceiptDisplayName(receipt)}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{receipt.class_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {receipt.receipt_items?.slice(0, 2).map(item => (
                                                    <Badge key={item.id} className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-2">
                                                        {item.receipt_type}
                                                    </Badge>
                                                ))}
                                                {receipt.receipt_items && receipt.receipt_items.length > 2 && (
                                                    <Badge variant="outline" className="text-[9px] font-black">+{receipt.receipt_items.length - 2}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-black text-primary text-sm whitespace-nowrap">{formatCurrency(receipt.amount)}</TableCell>
                                        <TableCell className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{formatDate(receipt.date_issued)}</TableCell>
                                        <TableCell className="text-[10px] font-black text-rose-500 whitespace-nowrap">{duesLeft}</TableCell>
                                        <TableCell className="text-right pr-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                                        {processingId === receipt.id ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2">
                                                    <DropdownMenuItem onClick={() => handlePrint(receipt.id)} className="rounded-xl h-11 font-bold">
                                                        <Printer className="mr-3 size-4 text-primary" /> Print Receipt
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl h-11 font-bold">
                                                        <Eye className="mr-3 size-4 text-primary" /> View Details
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-10 border-t border-muted-foreground/5">
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-muted/20 border rounded-xl px-3 py-1.5">
                    <Select value={`${pageSize}`} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                        <SelectTrigger className="h-8 w-16 text-[11px] font-black border-none bg-transparent shadow-none focus:ring-0 p-0 px-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                            {[10, 20, 50, 100].map((s) => <SelectItem key={s} value={String(s)} className="text-[11px] font-black">{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Entries</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-30 whitespace-nowrap hidden sm:inline">Showing {Math.min((page - 1) * pageSize + 1, filteredReceipts.length)} - {Math.min(page * pageSize, filteredReceipts.length)} of {filteredReceipts.length}</span>
              </div>

              <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setPage(1)} disabled={page === 1}><ChevronFirst className="size-4" /></Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}><ChevronLeft className="size-4" /></Button>
                  <div className="flex items-center mx-2 gap-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Page <span className="text-primary">{page}</span> / {totalPages}</div>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}><ChevronRight className="size-4" /></Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setPage(totalPages)} disabled={page >= totalPages}><ChevronLast className="size-4" /></Button>
              </div>
            </div>
          )}

          {!loading && filteredReceipts.length === 0 && (
            <div className="text-center py-24">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/20" />
              <p className="mt-4 text-muted-foreground font-black uppercase tracking-widest text-[10px]">No active treasury records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><FileText className="size-32" /></div>
                <DialogHeader className="relative z-10 space-y-2">
                    <Badge className="w-fit bg-white/20 text-white border-none font-black text-[10px] tracking-[0.2em] px-4 py-1.5 uppercase">Treasury Unit</Badge>
                    <DialogTitle className="text-3xl font-black tracking-tighter">New Receipt</DialogTitle>
                </DialogHeader>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
