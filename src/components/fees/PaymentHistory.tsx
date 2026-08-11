'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, subDays } from 'date-fns';

// Icons
import {
  FileDown,
  FileText,
  Filter,
  MoreHorizontal,
  Printer,
  Search,
  Calendar,
  Receipt,
  Eye,
  RotateCcw,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Services
import { 
  getPayments, 
  getStudentPaymentHistory, 
  generateReceipt, 
  type PaymentMethodType, 
  type PaymentStatus,
  type PaymentWithDetails,
  type PaymentFilterParams
} from '@/services/payment-processing';
import { getPrintableReceipt } from '@/services/receipt';
import { getStudents } from '@/services/students';

// Student type
interface Student {
  id: string | number;
  name: string;
  admission_number?: string;
}

// Component props
interface PaymentHistoryProps {
  studentId?: string | number; // UUID strings or numbers
  schoolId?: string | number;
  showFilters?: boolean;
  limit?: number;
}

export default function PaymentHistory({ 
  studentId, 
  schoolId, 
  showFilters = true,
  limit
}: PaymentHistoryProps) {
  // Payment data
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [receiptHtml, setReceiptHtml] = useState<string>('');

  // Students data
  const [students, setStudents] = useState<Student[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>(studentId ? String(studentId) : '');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd')); // Last 30 days
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd')); // Today
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = limit || 10;
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Load payments on component mount or when filters change
  useEffect(() => {
    loadPayments();
  }, [studentId, selectedStudent, paymentMethod, paymentStatus, dateFrom, dateTo, currentPage, pageSize]);

  // Load students for filter dropdown
  useEffect(() => {
    if (showFilters && !studentId) {
      loadStudents();
    }
  }, [showFilters, studentId]);

  // Load payment data
  const loadPayments = async () => {
    setLoading(true);
    try {
      // Prepare filter parameters
      const params: PaymentFilterParams = {
        date_from: dateFrom,
        date_to: dateTo
      };
      
      // Add optional filters
      if (studentId) {
        params.student_id = String(studentId);
      } else if (selectedStudent) {
        params.student_id = selectedStudent;
      }
      
      if (paymentMethod) {
        params.payment_method = paymentMethod as PaymentMethodType;
      }
      
      if (paymentStatus) {
        params.status = paymentStatus as PaymentStatus;
      }
      
      if (schoolId) {
        params.school_id = String(schoolId);
      }

      let results: PaymentWithDetails[];
      
      // Get payments - either for a specific student or all payments
      if (studentId || selectedStudent) {
        const studentIdToUse = (studentId || selectedStudent) as string;
        results = await getStudentPaymentHistory(studentIdToUse);
      } else {
        results = await getPayments(params);
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(payment => 
          payment.student_name?.toLowerCase().includes(term) ||
          payment.fee_type?.toLowerCase().includes(term) ||
          payment.reference_number?.toLowerCase().includes(term)
        );
      }
      
      // Calculate pagination
      const totalItems = results.length;
      setTotalPages(Math.ceil(totalItems / pageSize));
      
      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const paginatedResults = results.slice(startIndex, endIndex);

      setPayments(paginatedResults);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load students for filter dropdown
  const loadStudents = async () => {
    try {
      const studentsData = await getStudents({ school_id: String(schoolId) });
      const formattedStudents = (studentsData || []).map((student: any) => ({
        id: String(student.id),
        name: `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.trim(),
        admission_number: student.admission_number || student.admission_no || ''
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    if (!studentId) {
      setSelectedStudent('');
    }
    setPaymentMethod('');
    setPaymentStatus('');
    setDateFrom(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setCurrentPage(1);
  };

  // View receipt for a payment
  const viewReceipt = async (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    setLoadingReceipt(true);
    setShowReceiptDialog(true);
    
    try {
      if (payment.receipt_id) {
        // Get the HTML representation of the receipt for printing
        const html = await getPrintableReceipt(String(payment.receipt_id));
        setReceiptHtml(html);
      } else {
        // No receipt exists, show a message
        setReceiptHtml('<div class="text-center p-4"><p>No receipt available for this payment.</p></div>');
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      setReceiptHtml('<div class="text-center p-4 text-red-500"><p>Failed to load receipt. Please try again.</p></div>');
    } finally {
      setLoadingReceipt(false);
    }
  };

  // Generate receipt for a payment that doesn't have one
  const createReceiptForPayment = async (paymentId: string | number) => {
    try {
      await generateReceipt(String(paymentId));
      toast.success('Receipt generated successfully');
      // Reload payment data
      loadPayments();
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  // Print the currently viewed receipt
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            @media print {
              @page { margin: 0.5cm; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Export payment history to CSV
  const exportToCSV = async () => {
    setExportingData(true);
    try {
      // Prepare filter parameters for full export
      const params: PaymentFilterParams = {
        date_from: dateFrom,
        date_to: dateTo
      };
      
      if (studentId) {
        params.student_id = String(studentId);
      } else if (selectedStudent) {
        params.student_id = selectedStudent;
      }
      
      if (paymentMethod) {
        params.payment_method = paymentMethod as PaymentMethodType;
      }
      
      if (paymentStatus) {
        params.status = paymentStatus as PaymentStatus;
      }
      
      if (schoolId) {
        params.school_id = String(schoolId);
      }

      // Get all payments for export, not just current page
      let allPayments: PaymentWithDetails[];
      if (studentId || selectedStudent) {
        const studentIdToUse = String(studentId || selectedStudent);
        allPayments = await getStudentPaymentHistory(studentIdToUse);
      } else {
        allPayments = await getPayments(params);
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        allPayments = allPayments.filter(payment => 
          payment.student_name?.toLowerCase().includes(term) ||
          payment.fee_type?.toLowerCase().includes(term) ||
          payment.reference_number?.toLowerCase().includes(term)
        );
      }
      
      // Format data for CSV
      const headers = [
        'ID', 
        'Date', 
        'Student', 
        'Fee Type', 
        'Amount', 
        'Payment Method', 
        'Status', 
        'Reference', 
        'Receipt #'
      ];
      
      const csvData = [
        headers.join(','),
        ...allPayments.map(payment => [
          payment.id,
          payment.payment_date,
          payment.student_name?.replace(/,/g, ' ') || 'Unknown',
          payment.fee_type || 'Unknown',
          payment.amount,
          payment.payment_method,
          payment.status,
          payment.reference_number || '-',
          payment.receipt_number || '-'
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Payment history exported successfully');
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error('Failed to export payment history');
    } finally {
      setExportingData(false);
    }
  };

  // Get status badge color based on payment status
  const getStatusBadgeColor = (status: PaymentStatus | string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format payment method for display
  const formatPaymentMethod = (method: PaymentMethodType | string) => {
    return (method || '').split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Pagination navigation
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {studentId ? 'Student Payment History' : 'Payment History'}
          </CardTitle>
          <CardDescription>
            {studentId 
              ? 'View payment records for this student' 
              : 'View and manage all payment records'
            }
          </CardDescription>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          {showFilters && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFiltersMenu(!showFiltersMenu)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={exportingData}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" /> Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPayments()}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </CardHeader>

      {/* Filters */}
      {showFilters && showFiltersMenu && (
        <div className="px-6 pb-4">
          <div className="p-4 border rounded-md bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              {/* Student Filter - Only show if not filtered by studentId prop */}
              {!studentId && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Student</label>
                  <Select 
                    value={selectedStudent} 
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Students</SelectItem>
                      {students.map(student => (
                        <SelectItem key={String(student.id)} value={String(student.id)}>
                          {student.name} {student.admission_number ? `(${student.admission_number})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium mb-1 block">Payment Method</label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Payment Status */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select 
                  value={paymentStatus} 
                  onValueChange={setPaymentStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" /> Reset Filters
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  loadPayments();
                  setShowFiltersMenu(false);
                }}
                className="flex items-center gap-1"
              >
                <Search className="h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <CardContent>
        {/* Payments Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                {!studentId && <TableHead>Student</TableHead>}
                <TableHead>Fee Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={studentId ? 8 : 9} className="h-24 text-center">
                    Loading payment data...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={studentId ? 8 : 9} className="h-24 text-center">
                    No payment records found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-[10px] font-mono opacity-60 uppercase">{String(payment.id).substring(0, 8)}</TableCell>
                    <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                    {!studentId && <TableCell>{payment.student_name || 'Unknown'}</TableCell>}
                    <TableCell className="capitalize">
                      {payment.fee_type || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {formatPaymentMethod(payment.payment_method)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.receipt_id ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Receipt className="h-3 w-3 mr-1" /> {payment.receipt_number || 'Available'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Not Generated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => viewReceipt(payment)}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          
                          {payment.receipt_id ? (
                            <DropdownMenuItem 
                              onClick={() => viewReceipt(payment)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Printer className="h-4 w-4" /> Print Receipt
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => createReceiptForPayment(payment.id)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" /> Generate Receipt
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing {payments.length} of {totalPages * pageSize} payments
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              {selectedPayment && (
                <span>
                  Receipt for payment #{selectedPayment.id} made on {
                    format(new Date(selectedPayment.payment_date), 'dd MMMM yyyy')
                  }
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            {/* Payment Details Summary */}
            {selectedPayment && (
              <div className="border rounded-md p-4 bg-muted/20">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Payment Details</h4>
                    <p className="text-lg font-medium">{selectedPayment.fee_type} Fee</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedPayment.payment_date), 'dd MMMM yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-semibold text-muted-foreground">Amount</h4>
                    <p className="text-lg font-medium">{selectedPayment.amount.toLocaleString()}</p>
                    <Badge variant="outline" className={getStatusBadgeColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Student</h4>
                    <p className="text-sm">{selectedPayment.student_name}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-semibold text-muted-foreground">Payment Method</h4>
                    <p className="text-sm">{formatPaymentMethod(selectedPayment.payment_method)}</p>
                    {selectedPayment.reference_number && (
                      <p className="text-xs text-muted-foreground">
                        Ref: {selectedPayment.reference_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Receipt View */}
            <div className="border rounded-md h-[400px] overflow-auto">
              {loadingReceipt ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading receipt...</p>
                </div>
              ) : (
                <div 
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: receiptHtml }}
                />
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              {selectedPayment && !selectedPayment.receipt_id && (
                <Button 
                  variant="outline" 
                  onClick={() => createReceiptForPayment(selectedPayment.id)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Generate Receipt
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowReceiptDialog(false)}
              >
                Close
              </Button>
              {selectedPayment && selectedPayment.receipt_id && (
                <Button 
                  onClick={printReceipt}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

