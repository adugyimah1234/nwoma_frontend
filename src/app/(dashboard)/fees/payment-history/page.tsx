'use client';

import React from 'react';
import {
    Calendar as CalendarIcon,
    RefreshCw,
    Printer,
    Download,
    Mail,
    Search
} from 'lucide-react';
import { format } from "date-fns";
import { toast } from "sonner";
import {
    getPrintableReceipt
} from "@/services/receipt";
import {
    Input
} from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/layout/page-header";

import { usePaymentHistory } from './hooks/usePaymentHistory';
import { Receipt } from '@/types/receipt';
import { calculateStudentTotalDue } from '../invoices/calculateStudentTotalDue';

export default function PaymentHistoryPage() {
    const {
        schools,
        classes,
        students,
        receipts,
        applicants,
        categories,
        loading,
        search,
        setSearch,
        date,
        setDate,
        activeSchool,
        setActiveSchool,
        activeClassTab,
        setActiveClassTab,
        activeReceiptTab,
        setActiveReceiptTab,
        refresh
    } = usePaymentHistory();

    const formatCurrency = (amt: number) =>
        new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amt);

    const getReceiptTypeBadge = (type: string) => {
        const map = {
            levy: { variant: "default", label: "Levy" },
            registration: { variant: "secondary", label: "Registration" },
            textBooks: { variant: "outline", label: "Text Books" },
            exerciseBooks: { variant: "destructive", label: "Exercise Books" },
            furniture: { variant: "default", label: "Furniture" },
            jersey_crest: { variant: "outline", label: "Jersey/Crest" }
        };
        return map[type as keyof typeof map] || { variant: "default", label: type };
    };

    const handlePrint = async (id: number) => {
        try {
            const html = await getPrintableReceipt(String(id));
            const w = window.open("", "_blank");
            w?.document.write(html);
            w?.document.close();
        } catch (err) {
            toast.error("Print failed");
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
            <PageHeader
                title="Intelligence History"
                description="Comprehensive audit of all financial records across the garrison network."
                breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance' }, { title: 'History' }]}
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                        <Input
                            placeholder="Identify Student or Receipt..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 pl-12 rounded-2xl bg-muted/50 border-none shadow-sm font-bold"
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-12 rounded-2xl border-2 font-bold px-6">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Select Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl">
                            <Calendar mode="single" selected={date} onSelect={setDate} />
                        </PopoverContent>
                    </Popover>
                </div>

                <Button variant="outline" className="h-12 rounded-2xl border-2 font-bold uppercase tracking-tight text-[10px] px-8" onClick={refresh}>
                    <RefreshCw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} /> Sync Records
                </Button>
            </div>

            <Tabs value={activeSchool || "none"} onValueChange={setActiveSchool} className="space-y-8">
                <TabsList className="flex w-full h-auto p-1 bg-muted/50 rounded-2xl sm:w-fit gap-1 overflow-x-auto no-scrollbar">
                    {schools.map((s) => (
                        <TabsTrigger key={s.id} value={s.id.toString()} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-tight data-[state=active]:bg-background data-[state=active]:text-primary transition-all">
                            {s.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {schools.map((school) => {
                    const schoolId = school.id.toString();
                    const selectedClassTab = activeClassTab[schoolId] || "all";
                    const schoolClasses = classes.filter((c) => `${c.school_id}` === schoolId);
                    
                    // Filtering logic encapsulated in memoized derived state if this was more complex
                    const filtered = receipts.filter(r => {
                        const person = students.find(s => String(s.id) === String(r.student_id)) || applicants.find(a => String(a.id) === String(r.registration_id));
                        if (!person || String(person.school_id) !== schoolId) return false;
                        if (selectedClassTab !== "all" && String(person.class_id) !== selectedClassTab) return false;
                        return true;
                    });

                    const columns: DataTableColumn<Receipt>[] = [
                        {
                            key: "id",
                            header: "Receipt",
                            cell: (r) => <span className="font-bold text-[10px] tracking-tight opacity-60">R-{String(r.id).padStart(6, "0")}</span>
                        },
                        {
                            key: "identity",
                            header: "Identity",
                            cell: (r) => {
                                const s = students.find((st) => Number(st.id) === Number(r.student_id)) || applicants.find((a) => Number(a.id) === Number(r.registration_id));
                                return (
                                    <div className="flex flex-col">
                                        <p className="font-bold text-sm tracking-tight uppercase">{s ? `${s.first_name} ${s.last_name}` : 'Unknown'}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{r.class_name}</p>
                                    </div>
                                );
                            }
                        },
                        {
                            key: "intake",
                            header: "Intake",
                            cell: (r) => <span className="font-bold text-primary">{formatCurrency(r.amount ?? 0)}</span>
                        },
                        {
                            key: "status",
                            header: "Status",
                            cell: (receipt) => {
                                const person = students.find(s => Number(s.id) === Number(receipt.student_id)) || applicants.find(a => Number(a.id) === Number(receipt.registration_id));
                                const studentReceipts = receipts.filter(r => (r.student_id && r.student_id === receipt.student_id) || (r.registration_id && r.registration_id === receipt.registration_id)).filter(r => Number(r.id) <= Number(receipt.id));
                                const paidTypes = new Set<string>();
                                studentReceipts.forEach(r => r.receipt_items?.forEach(i => paidTypes.add(i.receipt_type)));

                                // In a real professional app, this logic would be pre-calculated in the service layer or hook
                                return <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight border-none bg-muted/50 px-3 py-1">PROCESSED</Badge>;
                            }
                        },
                        {
                            key: "date",
                            header: "Timestamp",
                            cell: (r) => <span className="text-[10px] font-bold text-muted-foreground">{format(new Date(r.date_issued), "MMM dd, yyyy")}</span>
                        },
                        {
                            key: "ops",
                            header: "",
                            className: "text-right pr-6",
                            cell: (r) => (
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handlePrint(Number(r.id))}>
                                    <Printer className="size-4" />
                                </Button>
                            )
                        }
                    ];

                    return (
                        <TabsContent key={schoolId} value={schoolId} className="mt-0 space-y-6">
                            <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
                                <CardHeader className="bg-muted/20 border-b py-6 px-10 flex flex-row items-center justify-between">
                                    <Tabs
                                        value={selectedClassTab}
                                        onValueChange={(val) => setActiveClassTab(prev => ({ ...prev, [schoolId]: val }))}
                                    >
                                        <TabsList className="bg-background/50 border h-10 p-1 rounded-xl">
                                            <TabsTrigger value="all" className="text-[10px] font-bold px-4 rounded-lg">ALL UNITS</TabsTrigger>
                                            {schoolClasses.map((c) => (
                                                <TabsTrigger key={c.id} value={c.id.toString()} className="text-[10px] font-bold px-4 rounded-lg uppercase">{c.name}</TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <DataTable
                                        data={filtered as any[]}
                                        columns={columns as any}
                                        loading={loading}
                                        rowKey="id"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}

