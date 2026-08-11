'use client';

import React, { useState } from 'react';
import {
    RefreshCw,
    Upload,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Smartphone,
    Search,
    History,
    FileSpreadsheet,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

                // Map to our standard format
                // Assuming columns: TransactionID, Date, Amount, Reference/Info
                const mapped = data.map(row => ({
                    external_ref: String(row.TransactionID || row['Transaction ID'] || row.Reference || ''),
                    amount: parseFloat(row.Amount || 0),
                    sender_info: String(row.Description || row.Info || row.From || ''),
                    date: row.Date
                })).filter(tx => tx.external_ref && tx.amount > 0);

                setFileData(mapped);
                toast.success(`Parsed ${mapped.length} transactions from file.`);
            } catch (err) {
                toast.error("Invalid file format. Please use standard MoMo statement export.");
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
            toast.success("Protocol Synchronization Complete");
        } catch (err) {
            toast.error("Reconciliation bridge failed");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <PageHeader
                title="MoMo Protocol Reconciliation"
                description="Automate matching of Mobile Money statements to student debt ledgers."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance', href: '/fees' }, { title: 'MoMo Sync' }]}
            />

            {!results ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Card */}
                    <Card className="lg:col-span-1 border-none shadow-sm bg-indigo-900 text-white h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="size-5" /> Import Statement
                            </CardTitle>
                            <CardDescription className="text-indigo-200/60">Upload your MTN/Vodafone MoMo Excel export.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden">
                                <Upload className="size-10 text-indigo-200" />
                                <div className="text-center">
                                    <p className="font-bold text-sm">Click to select file</p>
                                    <p className="text-[10px] text-indigo-300">Accepts .xlsx or .csv</p>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Required Columns</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-2 rounded-lg">
                                        <CheckCircle2 className="size-3 text-emerald-400" /> TransactionID
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-2 rounded-lg">
                                        <CheckCircle2 className="size-3 text-emerald-400" /> Amount
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-2 rounded-lg">
                                        <CheckCircle2 className="size-3 text-emerald-400" /> Description
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold bg-white/10 p-2 rounded-lg">
                                        <CheckCircle2 className="size-3 text-emerald-400" /> Date
                                    </div>
                                </div>
                            </div>

                            <Button
                                disabled={fileData.length === 0 || loading}
                                className="w-full h-14 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-lg gap-2"
                                onClick={runReconciliation}
                            >
                                {loading ? <RefreshCw className="size-5 animate-spin" /> : <RefreshCw className="size-5" />}
                                START SYNC ({fileData.length})
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Preview Table */}
                    <Card className="lg:col-span-2 border-none shadow-sm h-fit overflow-hidden">
                        <CardHeader className="border-b bg-muted/5">
                            <CardTitle className="text-base font-bold">Statement Preview</CardTitle>
                            <CardDescription>Raw transaction data waiting for institutional matching.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[500px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="font-bold">Ref Code</TableHead>
                                            <TableHead className="font-bold">Description / Payer</TableHead>
                                            <TableHead className="text-right font-bold">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fileData.map((tx, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-mono text-[10px] text-slate-500 uppercase">{tx.external_ref}</TableCell>
                                                <TableCell className="text-xs font-medium max-w-[200px] truncate">{tx.sender_info}</TableCell>
                                                <TableCell className="text-right font-bold text-indigo-600">{formatCurrency(tx.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {fileData.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-24 text-muted-foreground italic">
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-none shadow-sm bg-indigo-600 text-white">
                            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-indigo-200">System Matched</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-black">{results.matched}</p></CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-slate-100">
                            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Already Recorded</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-black">{results.already_recorded}</p></CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-rose-500 text-white">
                            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-rose-100">Unidentified</CardTitle></CardHeader>
                            <CardContent><p className="text-3xl font-black">{results.failed}</p></CardContent>
                        </Card>
                        <Button variant="outline" className="h-full border-dashed gap-2" onClick={() => { setResults(null); setFileData([]); }}>
                            <RefreshCw className="size-4" /> Start New Batch
                        </Button>
                    </div>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b bg-muted/5">
                            <CardTitle className="text-base font-bold">Sync Ledger</CardTitle>
                            <CardDescription>Detailed results of the reconciliation operation.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow>
                                        <TableHead className="font-bold">Ref</TableHead>
                                        <TableHead className="font-bold">Target Student</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Result</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.details.map((d, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-mono text-[10px] uppercase text-slate-400">{d.ref}</TableCell>
                                            <TableCell className="text-xs font-bold uppercase">{d.student || '---'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    d.status === 'matched' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    d.status === 'already_recorded' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                    'bg-rose-50 text-rose-700 border-rose-100'
                                                + " text-[9px] font-black uppercase"}>
                                                    {d.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-xs font-medium text-muted-foreground">{d.msg || (d.amount ? `+ ${formatCurrency(d.amount)}` : '')}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex items-center gap-2 justify-center py-6 opacity-20 grayscale">
                <FileSpreadsheet className="size-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Financial Bridge Reconciliation</p>
            </div>
        </div>
    );
}
