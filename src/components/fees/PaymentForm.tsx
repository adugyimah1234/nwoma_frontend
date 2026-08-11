'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

// Icons
import {
  CalendarIcon,
  Receipt,
  CreditCard,
  DollarSign,
  AlertCircle,
  Check,
  ChevronsUpDown,
  Search,
  Loader2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

// Services
import { getOutstandingFees } from '@/services/fee';
import { createPayment, getPaymentMethods, type PaymentMethodType } from '@/services/payment-processing';
import { createReceipt } from '@/services/receipt';

// Student service
import { getStudents } from '@/services/students';

// Types
import { type FeeWithDetails } from '@/types/fee';

// Form validation schema
const paymentFormSchema = z.object({
  student_id: z.string({
    required_error: "Student is required",
  }),
  fee_id: z.string({
    required_error: "Fee is required",
  }),
  amount_paid: z.coerce.number({
    required_error: "Payment amount is required",
  }).positive("Amount must be greater than zero"),
  payment_date: z.string().optional(),
  payment_method: z.string({
    required_error: "Payment method is required",
  }),
  installment_number: z.number().optional(),
  reference_number: z.string().optional(),
  remarks: z.string().optional(),
  generate_receipt: z.boolean().default(true),
});

// Component props
interface PaymentFormProps {
  schoolId?: string;
  onPaymentSuccess?: (paymentId: string) => void;
}

export default function PaymentForm({ schoolId, onPaymentSuccess }: PaymentFormProps) {
  // Student state
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // Fee state
  const [outstandingFees, setOutstandingFees] = useState<FeeWithDetails[]>([]);
  const [selectedFee, setSelectedFee] = useState<FeeWithDetails | null>(null);
  
  // Payment method state
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string | number;
    name: string;
    type: PaymentMethodType;
    requires_reference: boolean;
  }>>([]);
  
  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Form setup
  const form = useForm<any>({
    resolver: zodResolver(paymentFormSchema) as any,
    defaultValues: {
      student_id: '',
      fee_id: '',
      amount_paid: 0,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      installment_number: 1,
      payment_method: 'cash',
      generate_receipt: true,
    },
  });
  
  // Load students on component mount
  useEffect(() => {
    loadStudents();
    loadPaymentMethods();
  }, []);
  
  // Load outstanding fees when student is selected
  useEffect(() => {
    if (selectedStudent) {
      loadOutstandingFees(selectedStudent);
    } else {
      setOutstandingFees([]);
    }
  }, [selectedStudent]);
  
  // Update form values when fee is selected
  useEffect(() => {
    if (selectedFee) {
      form.setValue('fee_id', selectedFee.id);
      form.setValue('amount_paid', selectedFee.amount);
    } else {
      form.setValue('fee_id', '');
      form.setValue('amount_paid', 0);
    }
  }, [selectedFee, form]);
  
  // Load students data
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await getStudents({ school_id: schoolId });
      const formattedStudents = response.map((student: any) => ({
        id: student.id.toString(),
        name: `${student.first_name} ${student.middle_name || ''} ${student.last_name} (${student.admission_number || 'No Adm'})`,
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };
  
  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      const activeMethods = methods
        .filter(m => m.is_active)
        .map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          requires_reference: m.requires_reference,
        }));
      setPaymentMethods(activeMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
      // Set default payment methods
      setPaymentMethods([
        { id: '1', name: 'Cash', type: 'cash', requires_reference: false },
        { id: '2', name: 'Bank Transfer', type: 'bank_transfer', requires_reference: true },
        { id: '3', name: 'Mobile Payment', type: 'mobile_payment', requires_reference: true },
      ]);
    }
  };
  
  // Load outstanding fees for a student
  const loadOutstandingFees = async (studentId: string) => {
    setLoadingFees(true);
    try {
      const fees = await getOutstandingFees(studentId as any);
      setOutstandingFees(fees);
    } catch (error) {
      console.error('Error loading outstanding fees:', error);
      toast.error('Failed to load outstanding fees for the selected student');
      setOutstandingFees([]);
    } finally {
      setLoadingFees(false);
    }
  };
  
  // Handle student selection
  const handleStudentChange = (value: string) => {
    setSelectedStudent(value);
    form.setValue('student_id', value);
    setSelectedFee(null);
  };
  
  // Handle fee selection
  const handleFeeSelection = (fee: FeeWithDetails) => {
    setSelectedFee(fee);
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    form.setValue('payment_method', value);
    // Check if reference number is required
    const method = paymentMethods.find(m => m.type === value);
    if (method?.requires_reference) {
      form.setError('reference_number', {
        type: 'manual',
        message: `Reference number is required for ${method.name} payments`,
      });
    } else {
      form.clearErrors('reference_number');
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof paymentFormSchema>) => {
    if (!selectedFee) {
      toast.error('Please select a fee to pay');
      return;
    }
    
    // Validate payment amount
    if (data.amount_paid <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    
    if (data.amount_paid > selectedFee.amount) {
      toast.error(`Payment amount cannot exceed the fee amount: ${selectedFee.amount}`);
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Create payment
      const payment = await createPayment({
        student_id: data.student_id,
        fee_id: data.fee_id ? data.fee_id : undefined,
        amount: data.amount_paid,
        payment_date: data.payment_date || format(new Date(), 'yyyy-MM-dd'),
        payment_method: data.payment_method as PaymentMethodType,
        reference_number: data.reference_number,
        notes: data.remarks,
        generate_receipt: data.generate_receipt,
        school_id: schoolId ? schoolId : undefined,
      });
      
      toast.success('Payment processed successfully!');
      
      // Generate receipt if needed
      if (data.generate_receipt) {
        toast.info('Receipt generated automatically');
      }
      
      // Reset form and selections
      form.reset();
      setSelectedStudent(null);
      setSelectedFee(null);
      
      // Call success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(payment.id.toString());
      }
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Determine if a payment method requires a reference
  const doesPaymentMethodRequireReference = () => {
    const methodType = form.watch('payment_method');
    const method = paymentMethods.find(m => m.type === methodType);
    return method?.requires_reference || false;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Process Fee Payment</CardTitle>
        <CardDescription>
          Record a new payment for a student's fee
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className={cn("grid gap-6", selectedStudent ? "lg:grid-cols-3" : "grid-cols-1")}>
              {/* Left Column: Student Selection & Fees List */}
              <div className={cn("space-y-6", selectedStudent ? "lg:col-span-2" : "")}>
                {/* Student Selection (Searchable Combobox) */}
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Student</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={loadingStudents}
                            >
                              {field.value
                                ? students.find(
                                    (student) => student.id === field.value
                                  )?.name
                                : "Search student..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search student by name or admission number..." />
                            <CommandList>
                              <CommandEmpty>No student found.</CommandEmpty>
                              <CommandGroup>
                                {students.map((student) => (
                                  <CommandItem
                                    value={student.name}
                                    key={student.id}
                                    onSelect={() => {
                                      form.setValue("student_id", student.id);
                                      handleStudentChange(student.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        student.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {student.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Search and select the student making the payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Outstanding Fees Display */}
                {selectedStudent && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Outstanding Fees</h3>
                      {loadingFees && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    {loadingFees ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : outstandingFees.length === 0 ? (
                      <div className="bg-yellow-50 p-4 rounded-md flex items-center gap-2 text-yellow-800 border border-yellow-200">
                        <AlertCircle className="h-5 w-5" />
                        <p>No outstanding fees found for this student.</p>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Fee Type</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {outstandingFees.map((fee) => (
                              <TableRow
                                key={fee.id}
                                className={cn(
                                  "cursor-pointer transition-colors hover:bg-muted/30",
                                  selectedFee?.id === fee.id ? 'bg-primary/5' : ''
                                )}
                                onClick={() => handleFeeSelection(fee)}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={selectedFee?.id === fee.id}
                                    onCheckedChange={() => handleFeeSelection(fee)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium capitalize">{fee.fee_type}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{fee.description || '-'}</TableCell>
                                <TableCell className="text-right font-semibold">{fee.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Payment Details Form */}
              {selectedStudent && (
                <div className="lg:col-span-1 space-y-6 bg-muted/20 p-4 rounded-lg border border-border">
                  <h3 className="text-lg font-medium border-bottom pb-2">Payment Details</h3>
                  
                  {selectedFee ? (
                    <div className="space-y-4">
                      {/* Payment Amount */}
                      <FormField
                        control={form.control}
                        name="amount_paid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount to Pay (GHC)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-9"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Full or partial payment (Max: {selectedFee.amount})
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Date */}
                      <FormField
                        control={form.control}
                        name="payment_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="date"
                                  {...field}
                                  value={field.value || format(new Date(), 'yyyy-MM-dd')}
                                />
                                <CalendarIcon className="h-4 w-4 absolute right-3 top-2.5 text-muted-foreground pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Payment Method */}
                      <FormField
                        control={form.control}
                        name="payment_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Method</FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handlePaymentMethodChange(value);
                                }}
                                className="grid grid-cols-2 gap-2"
                              >
                                {paymentMethods.map(method => (
                                  <div key={method.id} className={cn(
                                    "flex items-center space-x-2 border rounded-md p-2 transition-colors cursor-pointer hover:bg-background",
                                    field.value === method.type ? "border-primary bg-primary/5" : "border-input"
                                  )}
                                  onClick={() => {
                                    field.onChange(method.type);
                                    handlePaymentMethodChange(method.type);
                                  }}
                                  >
                                    <RadioGroupItem value={method.type} id={`method-${method.id}`} />
                                    <Label htmlFor={`method-${method.id}`} className="cursor-pointer text-xs">{method.name}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reference Number */}
                      {doesPaymentMethodRequireReference() && (
                        <FormField
                          control={form.control}
                          name="reference_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reference #</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Transaction ID"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Remarks */}
                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Notes..."
                                className="resize-none min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Receipt Toggle */}
                      <FormField
                        control={form.control}
                        name="generate_receipt"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md bg-background">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">Auto-generate Receipt</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={processingPayment || !selectedFee}
                        className="w-full mt-4 h-12 text-lg"
                      >
                        {processingPayment ?
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing</> :
                          <><DollarSign className="mr-2 h-5 w-5" /> Complete Payment</>
                        }
                      </Button>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground animate-pulse">
                      <Receipt className="h-12 w-12 mb-2 opacity-20" />
                      <p>Select a fee from the left to start payment</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="bg-muted/50 flex justify-between">
        <div className="text-sm text-muted-foreground">
          <p>Payments are recorded immediately.</p>
          <p>Receipts can be printed after successful payment.</p>
        </div>
        
        {/* Payment Summary */}
        {selectedFee && (
          <div className="text-right">
            <p className="text-sm font-medium">Selected Fee: {selectedFee.fee_type}</p>
            <p className="text-sm text-muted-foreground">Total Amount: {selectedFee.amount.toLocaleString()}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

