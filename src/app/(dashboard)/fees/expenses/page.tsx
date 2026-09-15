'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingDown,
    Plus,
    Trash2,
    RefreshCw,
    Receipt,
    Wallet,
    Calendar,
    ArrowUpRight,
    User,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { StatsCard } from '@/components/ui/stats-card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
            <PageHeader
                title="Institutional Expenditure"
                description="Monitor and audit all financial outflows for school operations."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'Expenses' }]}
            >
                {isAdmin && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 font-semibold">
                                <Plus className="size-4" /> New Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] shadow-none border">
                            <form onSubmit={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>Expenditure Audit Record</DialogTitle>
                                    <DialogDescription>Input new institutional expenditure details for the ledger.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-5 py-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="cat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                                            <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v as ExpenseRecord['category']})}>
                                                <SelectTrigger id="cat" className="h-10"><SelectValue placeholder="Type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="utilities">Utilities</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="supplies">General Supplies</SelectItem>
                                                    <SelectItem value="salaries">Remuneration</SelectItem>
                                                    <SelectItem value="rent">Rent & Infra</SelectItem>
                                                    <SelectItem value="other">Other Operations</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="amt" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount (GHS)</Label>
                                            <Input id="amt" type="number" step="0.01" required placeholder="0.00" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} className="h-10 font-semibold" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense Date</Label>
                                        <Input id="date" type="date" value={newExpense.expense_date} onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})} className="h-10" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose / Description</Label>
                                        <Input id="desc" placeholder="Purpose of expenditure..." value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="h-10" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="w-full h-11 font-bold">Record Expenditure</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Outflow"
                    value={formatCurrency(totalSpent)}
                    icon={TrendingDown}
                    description="Current academic cycle"
                    className="bg-primary text-primary-foreground border-none shadow-none"
                />
                {summary.slice(0, 3).map(s => (
                    <StatsCard
                        key={s.category}
                        title={s.category}
                        value={formatCurrency(s.total_expenses)}
                        icon={Receipt}
                        description={`${s.count} transactions`}
                        className="bg-muted/20 border-none shadow-none"
                    />
                ))}
            </div>

            <Card className="shadow-none border border-border/60">
                <CardHeader className="border-b bg-muted/10 py-5 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold uppercase tracking-tight">Expenditure Ledger</CardTitle>
                        <CardDescription>Detailed audit trail of all institutional outflows.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchData}>
                        <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Category</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Description</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Officer</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Amount</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map(e => (
                                <TableRow key={e.id} className="group transition-colors hover:bg-muted/30">
                                    <TableCell className="text-[11px] font-medium text-muted-foreground">{new Date(e.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-[9px] font-bold uppercase px-2 py-0">
                                            {e.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate text-xs font-medium">{e.description || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {e.recorded_by_name?.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-[10px] font-semibold text-foreground uppercase tracking-tight truncate max-w-[120px]">{e.recorded_by_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-xs text-destructive">{formatCurrency(e.amount)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        {isAdmin && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={() => handleDelete(e.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {expenses.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic text-sm">No expenditure records found in ledger.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 justify-center py-6 opacity-20">
                <TrendingDown className="size-6" />
                <p className="text-[10px] font-bold uppercase tracking-tight">Institutional Fiscal Integrity</p>
            </div>
        </div>
    );
}

