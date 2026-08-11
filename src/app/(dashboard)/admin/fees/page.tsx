/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Pencil, Trash, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type FeeWithDetails, type CreateFeePayload } from '@/types/fee';
import { toast } from 'sonner';
import { createFee, deleteFee, getAllFees } from '@/services/fee';
import AddFeeDialog from '@/components/AddFeeDialog';

export default function FeeManagement() {
  const [fees, setFees] = useState<FeeWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchFees();
  }, []);

  async function fetchFees() {
    try {
      const data = await getAllFees();
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  }

  async function handleDelete(id: string | number) {
    try {
      await deleteFee(id);
      toast.success("Fee deleted successfully");
      fetchFees();
    } catch (error) {
      toast.error("Failed to delete fee");
      console.error(error);
    }
  }

  async function handleCreate() {
    const payload: CreateFeePayload = {
      category_id: 1,
      class_id: 1,
      fee_type: 'tuition',
      amount: 100,
      academic_year_id: 1, // Assuming you have a way to get the current academic year ID
      description: 'Initial tuition fee'
    };
    try {
      await createFee(payload);
      toast.success("Fee created successfully");
      fetchFees();
    } catch (error) {
      toast.error("Failed to create fee");
      console.error(error);
    }
  }

  const filteredFees = fees.filter(fee =>
    fee.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
<CardHeader>
  <div className="flex justify-between items-center">
    <div>
      <CardTitle className="text-2xl">Fee Management</CardTitle>
      <p className="text-muted-foreground mt-1">
        Manage fee categories and payment settings
      </p>
    </div>
  </div>
</CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Fee Categories</TabsTrigger>
            <TabsTrigger value="settings">Payment Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder="Search categories..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const startIdx = (page - 1) * pageSize;
                    const paginatedFees = filteredFees.slice(startIdx, startIdx + pageSize);
                    return paginatedFees.map(fee => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.category_name}</TableCell>
                        <TableCell>{fee.amount}</TableCell>
                        <TableCell>{fee.description}</TableCell>
                        <TableCell>{fee.status}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => toast.info("Edit modal to be implemented")}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(fee.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {filteredFees.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4 border-t">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing {Math.min((page - 1) * pageSize + 1, filteredFees.length)} to{' '}
                    {Math.min(page * pageSize, filteredFees.length)} of {filteredFees.length} entries
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 30, 50].map((size) => (
                            <SelectItem key={size} value={`${size}`}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {page} of {Math.ceil(filteredFees.length / pageSize) || 1}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                      >
                        <ChevronFirst className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(filteredFees.length / pageSize) || 1))}
                        disabled={page >= Math.ceil(filteredFees.length / pageSize) || Math.ceil(filteredFees.length / pageSize) === 0}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setPage(Math.ceil(filteredFees.length / pageSize) || 1)}
                        disabled={page >= Math.ceil(filteredFees.length / pageSize) || Math.ceil(filteredFees.length / pageSize) === 0}
                      >
                        <ChevronLast className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
