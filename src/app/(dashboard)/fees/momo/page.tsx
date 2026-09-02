'use client';

import React, { useState } from 'react';
import {
    RefreshCw,
    Upload,
    CheckCircle2,
    XCircle,
    Smartphone,
    FileSpreadsheet,
    ArrowRight,
    Search,
    FileText,
    History,
    CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import momoService, { MomoTransaction, ReconcileResult } from '@/services/momo';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { StatsCard } from '@/components/ui/stats-card';

export default function MomoReconciliationPage() {
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState<MomoTransaction[]>([]);
    const [results, setResults] = useState<ReconcileResult | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet) as any[];

                const mapped = data.map(row => ({
                    external_ref: String(row.TransactionID || row['Transaction ID'] || row.Reference || ''),
                    amount: parseFloat(row.Amount || 0),
                    sender_info: String(row.Description || row.Info || row.From || ''),
                    date: row.Date
                })).filter(tx => tx.external_ref && tx.amount > 0);

                setFileData(mapped);
                toast.success(`Successfully parsed ${mapped.length} transactions.`);
            } catch (err) {
                toast.error("Invalid file format. Please upload a standard MoMo export.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const runReconciliation = async () => {
        if (fileData.length === 0) return;
        setLoading(true);
        try {
            const res = await momoService.reconcile(fileData);
            setResults(res);
            toast.success("Synchronization successful.");
        } catch (err) {
            toast.error("Reconciliation bridge failed.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
            <PageHeader
                title="MoMo Reconciliation"
                description="Automate matching of Mobile Money statements to student debt records."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'MoMo Sync' }]}
            />

            {!results ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Card */}
                    <Card className="lg:col-span-1 shadow-none border border-border/60 h-fit">
                        <CardHeader className="bg-muted/10 border-b py-5">
                            <div className="flex items-center gap-2 text-primary">
                                <Smartphone className="size-4" />
                                <CardTitle className="text-base font-semibold uppercase tracking-tight">Import Statement</CardTitle>
                            </div>
                            <CardDescription className="text-xs">Upload Excel export from provider terminal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-muted/5 hover:bg-muted/10 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden group">
                                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                    <Upload className="size-8 text-primary" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-bold text-sm tracking-tight">Click to browse file</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Accepts .xlsx .csv</p>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Required Columns</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {["TransactionID", "Amount", "Description", "Date"].map(col => (
                                        <div key={col} className="flex items-center gap-2 text-[10px] font-semibold bg-muted/40 p-2 rounded-lg border border-border/30">
                                            <CheckCircle2 className="size-3 text-emerald-500" /> {col}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                disabled={fileData.length === 0 || loading}
                                className="w-full h-11 font-bold uppercase text-xs tracking-widest gap-2 shadow-none"
                                onClick={runReconciliation}
                            >
                                {loading ? <RefreshCw className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                                Start Batch Sync ({fileData.length})
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Preview Table */}
                    <Card className="lg:col-span-2 shadow-none border border-border/60 h-fit overflow-hidden">
                        <CardHeader className="border-b bg-muted/10 py-5 flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold uppercase tracking-tight">Statement Preview</CardTitle>
                                <CardDescription className="text-xs">Data awaiting institutional cross-referencing.</CardDescription>
                            </div>
                            {fileData.length > 0 && <Badge variant="secondary" className="px-3 py-1 font-bold">{fileData.length} Items</Badge>}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[550px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="font-semibold text-xs uppercase">Ref Code</TableHead>
                                            <TableHead className="font-semibold text-xs uppercase">Payer Info</TableHead>
                                            <TableHead className="text-right font-semibold text-xs uppercase pr-6">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fileData.map((tx, idx) => (
                                            <TableRow key={idx} className="group hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-mono text-[10px] text-muted-foreground uppercase font-medium">{tx.external_ref}</TableCell>
                                                <TableCell className="text-xs font-semibold uppercase text-foreground truncate max-w-[250px]">{tx.sender_info}</TableCell>
                                                <TableCell className="text-right font-bold text-xs pr-6">{formatCurrency(tx.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {fileData.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-32 text-muted-foreground/60 italic text-sm">
                                                    No statement data loaded.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Results Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard title="Matched" value={results.matched} icon={CheckCircle2} />
                        <StatsCard title="Recorded" value={results.already_recorded} icon={History} />
                        <StatsCard title="Failed" value={results.failed} icon={XCircle} className="text-destructive" />
                        <Button
                            variant="outline"
                            className="h-full border-dashed border-2 hover:bg-muted flex flex-col gap-2 py-4"
                            onClick={() => { setResults(null); setFileData([]); }}
                        >
                            <RefreshCw className="size-5 text-muted-foreground" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">New Batch</span>
                        </Button>
                    </div>

                    <Card className="shadow-sm border">
                        <CardHeader className="border-b bg-muted/20 py-5">
                            <CardTitle className="text-base font-semibold uppercase tracking-tight">Synchronization Ledger</CardTitle>
                            <CardDescription>Audit results of the automated reconciliation operation.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Reference</TableHead>
                                        <TableHead className="font-semibold text-xs uppercase tracking-wider">Target Student</TableHead>
                                        <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Status</TableHead>
                                        <TableHead className="text-right font-semibold text-xs uppercase tracking-wider pr-6">Result</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.details.map((d, idx) => (
                                        <TableRow key={idx} className="group hover:bg-muted/20">
                                            <TableCell className="font-mono text-[10px] uppercase text-muted-foreground font-medium">{d.ref}</TableCell>
                                            <TableCell className="text-xs font-bold uppercase text-foreground">{d.student || '---'}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-bold uppercase px-2 py-0",
                                                    d.status === 'matched' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                    d.status === 'already_recorded' ? "bg-slate-50 text-slate-600 border-slate-200" :
                                                    "bg-destructive/5 text-destructive border-destructive/20"
                                                )}>
                                                    {d.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <span className={cn(
                                                    "text-xs font-semibold",
                                                    d.status === 'matched' ? "text-emerald-600" : "text-muted-foreground"
                                                )}>
                                                    {d.msg || (d.amount ? `+ ${formatCurrency(d.amount)}` : 'Processed')}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex items-center gap-2 justify-center py-10 opacity-20">
                <FileSpreadsheet className="size-6" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Financial Bridge Reconciliation</p>
            </div>
        </div>
    );
}
