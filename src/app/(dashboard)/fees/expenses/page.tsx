'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingDown,
    Plus,
    Trash2,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import expenseService, { ExpenseRecord, ExpenseSummary } from '@/services/expense';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpensesTrackerPage() {
    const { isAdmin } = useAuth();
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [summary, setSummary] = useState<ExpenseSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newExpense, setNewExpense] = useState<{
        category: ExpenseRecord['category'];
        amount: number;
        description: string;
        expense_date: string;
    }>({
        category: 'other',
        amount: 0,
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [expenseData, summaryData] = await Promise.all([
                expenseService.getAll(),
                expenseService.getSummary()
            ]);
            setExpenses(expenseData);
            setSummary(summaryData);
        } catch (err) {
            toast.error("Failed to load financial records");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.category) return;

        try {
            await expenseService.create(newExpense);
            toast.success("Expense recorded and audited");
            setIsDialogOpen(false);
            setNewExpense({
                category: 'other',
                amount: 0,
                description: '',
                expense_date: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (err) {
            toast.error("Process failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this expense record from the ledger?")) return;
        try {
            await expenseService.delete(id);
            toast.success("Record purged");
            fetchData();
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    const totalSpent = summary.reduce((sum, s) => sum + Number(s.total_expenses), 0);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="Operational Expenditure & Expenses"
                description="Monitor institutional outflow including maintenance, utilities, and logistics."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Expenses' }]}
            >
                {isAdmin && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 h-10 shadow-lg shadow-primary/20">
                                <Plus className="size-4" /> Log Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>New Expenditure Record</DialogTitle>
                                    <DialogDescription>Input and audit a new institutional expense.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v as ExpenseRecord['category']})}>
                                                <SelectTrigger className="h-11"><SelectValue placeholder="Type" /></SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    <SelectItem value="utilities">Utilities (Power/Water)</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                                                    <SelectItem value="supplies">General Supplies</SelectItem>
                                                    <SelectItem value="salaries">Staff Remuneration</SelectItem>
                                                    <SelectItem value="rent">Rent & Infrastructure</SelectItem>
                                                    <SelectItem value="other">Other Operations</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Amount (GHS)</Label>
                                            <Input type="number" required placeholder="0.00" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} className="h-11 font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Expense Date</Label>
                                        <Input type="date" value={newExpense.expense_date} onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})} className="h-11" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description / Particulars</Label>
                                        <Input placeholder="Purpose of expenditure..." value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="h-11" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700">Record to Ledger</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-indigo-900 text-white md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-300">Total Expenditure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black">{formatCurrency(totalSpent)}</span>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-indigo-200 mt-2">Current Academic Cycle</p>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {summary.map(s => (
                        <Card key={s.category} className="border-none shadow-sm bg-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{s.category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-bold">{formatCurrency(s.total_expenses)}</p>
                                <p className="text-[10px] text-muted-foreground">{s.count} transactions</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold">Expenditure Ledger</CardTitle>
                        <CardDescription>Detailed audit trail of all institutional outflows.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="size-4" /></Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">Category</TableHead>
                                <TableHead className="font-bold">Description</TableHead>
                                <TableHead className="font-bold">Recorded By</TableHead>
                                <TableHead className="text-right font-bold">Amount</TableHead>
                                <TableHead className="text-right font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map(e => (
                                <TableRow key={e.id}>
                                    <TableCell className="text-xs font-medium">{new Date(e.expense_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{e.category}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[250px] truncate text-xs">{e.description || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                {e.recorded_by_name?.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">{e.recorded_by_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-rose-600">{formatCurrency(e.amount)}</TableCell>
                                    <TableCell className="text-right">
                                        {isAdmin && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(e.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {expenses.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No expenditure recorded in the current ledger.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 justify-center py-6 opacity-30">
                <TrendingDown className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Institutional Fiscal Integrity</p>
            </div>
        </div>
    );
}
