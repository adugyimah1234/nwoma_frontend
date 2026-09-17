"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Printer,
  Mail,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { getReceipts, getPrintableReceipt } from "@/services/receipt";
import studentService from "@/services/students";
import { Receipt } from "@/types/receipt";
import { Student } from "@/types/student";
import type { RegistrationData } from "@/services/registrations";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/layout/page-header";

export default function ReceiptHistoryPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [realStudents, setRealStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [tab, setTab] = useState<string>("all");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (search) filters.search = search;
      if (date) filters.date_from = format(date, "yyyy-MM-dd");
      const data = await getReceipts(filters);
      setReceipts(data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  }, [search, date]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAll();
        setRealStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const getReceiptTypeBadge = (type: string) => {
    const variants = {
      levy: { variant: "default" as const, label: "Levy" },
      registration: { variant: "secondary" as const, label: "Registration" },
      textBooks: { variant: "outline" as const, label: "Text Books" },
      exerciseBooks: { variant: "destructive" as const, label: "Exercise Books" },
      furniture: { variant: "default" as const, label: "Furniture" },
      jersey_crest: { variant: "outline" as const, label: "Jersey/Crest" }
    };
    return variants[type as keyof typeof variants] || { variant: "default" as const, label: type };
  };

  const formatCurrency = (amt: number) => new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS"
  }).format(amt);

  const renderStudentName = (r: Receipt) => {
    const s = realStudents.find(s => Number(s.id) === Number(r.student_id));
    if (s) return [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");
    return r.student_name || "Unknown Student";
  };

  const handleAction = async (action: string, id: number) => {
    try {
      if (action === "print") {
        const html = await getPrintableReceipt(String(id));
        const w = window.open("", "_blank");
        if (w) {
          w.document.open();
          w.document.write(html);
          w.document.close();
        } else {
          toast.error("Popup blocked! Please allow popups.");
        }
      } else if (action === "download") {
          // Robust download using absolute URL
          const html = await getPrintableReceipt(String(id));
          const blob = new Blob([html], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-R-${id.toString().padStart(6, "0")}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } else {
        toast.info(`${action} feature coming soon`);
      }
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Action failed");
    }
  };

  const handleExportCSV = () => {
    if (filteredReceipts.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Receipt #", "Student", "Amount", "Date", "Items"];
    const rows = filteredReceipts.map(r => [
      `R-${r.id.toString().padStart(6, "0")}`,
      renderStudentName(r),
      r.amount,
      format(new Date(r.date_issued), "yyyy-MM-dd"),
      (r.receipt_items?.map(i => i.receipt_type) ?? []).join("; ")
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipts_history.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("CSV Exported successfully");
  };

  const [applicants, setApplicants] = useState<RegistrationData[]>([]);
  useEffect(() => {
    if (applicants.length === 0) {
      import('@/services/registrations').then(mod => {
        mod.default.getAll().then(setApplicants).catch(() => {});
      });
    }
  }, [applicants.length]);

  const filteredReceipts = receipts.filter((receipt) => {
    const searchTerm = search.toLowerCase().trim();

    const student = realStudents.find((s) => Number(s.id) === Number(receipt.student_id));
    const applicant = applicants.find((a) => Number(a.id) === Number(receipt.registration_id));

    const studentName = student
      ? `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.toLowerCase()
      : '';
    const applicantName = applicant
      ? `${applicant.first_name} ${applicant.middle_name || ''} ${applicant.last_name}`.toLowerCase()
      : '';

    const receiptId = `r-${receipt.id.toString().padStart(6, '0')}`;

    return (
      studentName.includes(searchTerm) ||
      applicantName.includes(searchTerm) ||
      receiptId.includes(searchTerm) ||
      receipt.id.toString().includes(searchTerm)
    );
  });

  const allTypes = Array.from(new Set(
    receipts.flatMap(r => r.receipt_items?.map(i => i.receipt_type) ?? [])
  )).filter(Boolean) as string[];

  const tabs = ["all", ...allTypes];

  const tabData = tab === "all"
    ? filteredReceipts
    : filteredReceipts.filter(r =>
        r.receipt_items?.some(i => i.receipt_type === tab)
      );

  const columns: DataTableColumn<Receipt>[] = [
    {
      key: "receiptNumber",
      header: "Receipt #",
      cell: (r) => `R-${r.id.toString().padStart(6, "0")}`
    },
    {
      key: "student",
      header: "Student",
      cell: (r) => renderStudentName(r)
    },
    {
      key: "types",
      header: "Types",
      cell: (r) => (
        <div className="space-x-1">
          {r.receipt_items?.length ? (
            r.receipt_items.map((i, idx) => {
              const badgeProps = getReceiptTypeBadge(i.receipt_type);
              return (
                <Badge
                  key={`${i.receipt_type}-${idx}`}
                  variant={badgeProps.variant as "default" | "secondary" | "outline" | "destructive"}
                >
                  {badgeProps.label}
                </Badge>
              );
            })
          ) : (
            r.receipt_items && r.receipt_items[0] && (
              <Badge variant={getReceiptTypeBadge(r.receipt_items[0].receipt_type as string).variant as "default" | "secondary" | "outline" | "destructive"}>
                {getReceiptTypeBadge(r.receipt_items[0].receipt_type as string).label}
              </Badge>
            )
          )}
        </div>
      )
    },
    {
      key: "amountPaid",
      header: "Total Paid",
      cell: (r) => formatCurrency(r.amount ?? 0)
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => format(new Date(r.date_issued), "MMM dd, yyyy")
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex space-x-2">
          <Button size="icon" variant="ghost" onClick={() => handleAction("print", Number(r.id))}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleAction("download", Number(r.id))}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleAction("email", Number(r.id))}>
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
        <PageHeader 
          title="Receipt History" 
          description="Browse and manage all generated receipts." 
        />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-[300px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder="Search by student name or receipt ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" onClick={fetchPayments}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab} defaultValue="all">
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t === "all" ? "All" : getReceiptTypeBadge(t).label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((t) => (
              <TabsContent key={t} value={t}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t === "all" ? "All Receipts" : getReceiptTypeBadge(t).label} ({tabData.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      data={tabData as any[]}
                      columns={columns as any}
                      searchKey="receiptNumber"
                      loading={loading}
                      rowKey="id"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
  );
}

