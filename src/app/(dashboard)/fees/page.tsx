'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Receipt, 
  Wallet, 
  History, 
  BarChart, 
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { GuidedTour } from '@/components/tour/GuidedTour';
import { Step } from 'react-joyride';

import FeesOverview from './components/overview';
import InvoicesPage from './invoices/page';
import PaymentHistoryPage from './payment-history/page';
import FinancialRecordsPage from './records/page';
import { CreateInvoiceForm } from '@/components/invoice/create-invoice-form';
import financialReports, { ExportFormat, ReportType } from '@/services/financial-reports';

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const tourSteps: Step[] = [
    {
      target: '#tour-financial-tabs',
      title: 'Financial Navigation',
      content: 'Switch between Overview, Invoices, Payments, and Records to manage different aspects of school finance.',
      placement: 'bottom',
    },
    {
      target: '#tour-export-data',
      title: 'Reporting',
      content: 'Export your financial data to PDF or Excel for offline reporting and audits.',
      placement: 'bottom',
    },
    {
      target: '#tour-new-receipt',
      title: 'Quick Transaction',
      content: 'Need to process a payment? Start right here by issuing a new receipt.',
      placement: 'bottom',
    },
  ];

  const handleExport = async (format: ExportFormat = 'pdf') => {
    setIsExporting(true);
    try {
      let reportType: ReportType = 'income';
      if (activeTab === 'invoices') reportType = 'outstanding_payments';
      if (activeTab === 'payments') reportType = 'fee_collection';
      if (activeTab === 'records') reportType = 'student_statement';

      await financialReports.downloadReport(reportType, { include_details: true }, format);
      toast.success("Intelligence report exported successfully.");
    } catch (error) {
      toast.error("Export operation failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'records', label: 'Records', icon: History },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
        <PageHeader
          title="Financial Intelligence"
          description="Manage invoices, payments, and institutional financial records."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Finance' }]}
        >
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" id="tour-export-data" className="h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] px-6" disabled={isExporting}>
                            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            Export Data
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-56">
                        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Select Format</DropdownMenuLabel>
                        <DropdownMenuSeparator className="mx-2" />
                        <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl h-11 font-bold"><FileText className="mr-3 size-4 text-primary" /> PDF Document</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('excel')} className="rounded-xl h-11 font-bold"><BarChart className="mr-3 size-4 text-primary" /> Excel Sheet</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20" id="tour-new-receipt" onClick={() => setShowNewInvoiceDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Receipt
                </Button>
            </div>
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList id="tour-financial-tabs" className="flex w-full h-auto p-1 bg-muted/50 rounded-2xl sm:w-fit gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-1 sm:flex-none flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all whitespace-nowrap">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <TabsContent value="overview" className="mt-0 outline-none">
                        <FeesOverview />
                    </TabsContent>
                    <TabsContent value="invoices" className="mt-0 outline-none">
                        <InvoicesPage />
                    </TabsContent>
                    <TabsContent value="payments" className="mt-0 outline-none">
                        <PaymentHistoryPage />
                    </TabsContent>
                    <TabsContent value="records" className="mt-0 outline-none">
                        <FinancialRecordsPage />
                    </TabsContent>
                </motion.div>
            </AnimatePresence>
        </Tabs>

        <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
            <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-primary p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Receipt className="size-32" /></div>
                    <DialogHeader className="relative z-10 space-y-2">
                        <Badge className="w-fit bg-white/20 text-white border-none font-black text-[10px] tracking-[0.2em] px-4 py-1.5 uppercase">Treasury Entry</Badge>
                        <DialogTitle className="text-3xl font-black tracking-tighter">Issue New Receipt</DialogTitle>
                        <DialogDescription className="text-white/60 text-sm font-medium italic">Execute a financial transaction for the institutional registry.</DialogDescription>
                    </DialogHeader>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <CreateInvoiceForm onSuccess={() => setShowNewInvoiceDialog(false)} onCancel={() => setShowNewInvoiceDialog(false)} />
                </div>
            </DialogContent>
        </Dialog>

        <GuidedTour steps={tourSteps} run={true} />
    </div>
  );
}
