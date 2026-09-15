// /* eslint-disable no-console */
// 'use client';

// import { useState } from 'react';
// import { 
//   MoreHorizontal, 
//   FileText, 
//   Download, 
//   Mail, 
//   Loader2, 
//   Check, 
//   X 
// } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import { InvoiceStatus } from '@/services/invoice';
// import invoiceService from '@/services/invoice';
// import { useToast } from '@/hooks/use-toast';

// interface InvoiceActionsProps {
//   invoiceId: number;
//   studentId: number;
//   amount: number;
//   dueDate: string;
//   status: InvoiceStatus;
//   onActionComplete: () => void;
// }

// export function InvoiceActions({ 
//   invoiceId, 
//   studentId, 
//   amount, 
//   dueDate, 
//   status, 
//   onActionComplete 
// }: InvoiceActionsProps) {
//   const [processing, setProcessing] = useState(false);
//   const { toast } = useToast();

//   const handleAction = async (actionType: string) => {
//     setProcessing(true);
    
//     try {
//       switch (actionType) {
//         case 'view':
//           // Navigate to details page
//           window.open(`/dashboard/fees/invoices/GHC{invoiceId}`, '_blank');
//           break;
        
//         case 'download':
//           await printerService.printInvoice(invoiceId);
//           toast({
//             title: "PDF Generated",
//             description: "Invoice PDF has been generated and downloaded."
//           });
//           break;
        
//         case 'remind':
//           await sendPaymentReminder();
//           toast({
//             title: "Reminder Sent",
//             description: "Payment reminder has been sent to the student."
//           });
//           break;
        
//         case 'mark-paid':
//           // Mark as paid functionality would be added here
//           toast({
//             title: "Payment Recording",
//             description: "Payment recording feature coming soon."
//           });
//           break;
        
//         case 'cancel':
//           await invoiceService.cancelInvoice(invoiceId, "Cancelled by administrator");
//           toast({
//             title: "Invoice Cancelled",
//             description: "The invoice has been cancelled."
//           });
//           onActionComplete();
//           break;
//       }
//     } catch (error) {
//       console.error(`Error performing action GHC{actionType}:`, error);
//       toast({
//         variant: "destructive",
//         title: "Action Failed",
//         description: error instanceof Error ? error.message : "An error occurred"
//       });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const sendPaymentReminder = async () => {
//     await notificationService.sendPaymentReminder({
//       student_id: studentId,
//       invoice_id: invoiceId,
//       amount: amount,
//       due_date: dueDate,
//       days_before_due: 0, // Immediate reminder
//       include_parents: true,
//       delivery_methods: ['email', 'in_app']
//     });
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="icon">
//           {processing ? (
//             <Loader2 className="h-4 w-4 animate-spin" />
//           ) : (
//             <MoreHorizontal className="h-4 w-4" />
//           )}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//         <DropdownMenuItem 
//           onClick={() => handleAction('view')}
//           disabled={processing}
//         >
//           <FileText className="h-4 w-4 mr-2" />
//           View Details
//         </DropdownMenuItem>
//         <DropdownMenuItem 
//           onClick={() => handleAction('download')}
//           disabled={processing}
//         >
//           <Download className="h-4 w-4 mr-2" />
//           Download PDF
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         {status !== 'paid' && (
//           <DropdownMenuItem 
//             onClick={() => handleAction('remind')}
//             disabled={processing}
//           >
//             <Mail className="h-4 w-4 mr-2" />
//             Send Reminder
//           </DropdownMenuItem>
//         )}
//         {['draft', 'sent', 'overdue', 'partially_paid'].includes(status) && (
//           <DropdownMenuItem 
//             onClick={() => handleAction('mark-paid')}
//             disabled={processing}
//           >
//             <Check className="h-4 w-4 mr-2" />
//             Mark as Paid
//           </DropdownMenuItem>
//         )}
//         {['draft', 'sent'].includes(status) && (
//           <DropdownMenuItem 
//             onClick={() => handleAction('cancel')}
//             disabled={processing}
//             className="text-destructive"
//           >
//             <X className="h-4 w-4 mr-2" />
//             Cancel Invoice
//           </DropdownMenuItem>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }


