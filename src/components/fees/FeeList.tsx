/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  FilterX, 
  FileDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { 
  getAllFees, 
  deleteFee 
} from '@/services/fee';
import { getAllCategories } from '@/services/categories';
import classService from '@/services/class';
import { getAllAcademicYear } from '@/services/academic_year';

import { 
  type FeeWithDetails, 
  type FeeQueryParams
} from '@/types/fee';
import { type Category } from '@/types/assessment';
import { type ClassData } from '@/services/class';
import { type academicYear } from '@/services/academic_year';

// Import dialog components
import AddFeeDialog from './AddFeeDialog';
import EditFeeDialog from './EditFeeDialog';

interface FeeListProps {
  schoolId?: string | number;
}

export default function FeeList({ schoolId }: FeeListProps) {
  // State for fees data
  const [fees, setFees] = useState<FeeWithDetails[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeWithDetails | null>(null);
  
  // Delete operation state
  const [deletingFeeId, setDeletingFeeId] = useState<string | number | null>(null);

  // State for filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [academicYears, setAcademicYears] = useState<academicYear[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<keyof FeeWithDetails>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [schoolId]);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [fees, searchTerm, selectedFeeType, selectedCategory, selectedClass, selectedAcademicYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load fees
      const params: FeeQueryParams = {};
      if (schoolId) {
        params.school_id = String(schoolId);
      }
      
      const feesData = await getAllFees(params);
      setFees(feesData);
      
      // Load filter options
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
      
      const classesData = await classService.getAll();
      setClasses(classesData);
      
      const academicYearsData = await getAllAcademicYear();
      setAcademicYears(academicYearsData);
    } catch (error) {
      console.error('Error loading fee data:', error);
      toast.error('Failed to load fees data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...fees];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(fee => 
        fee.fee_type.toLowerCase().includes(term) ||
        fee.description?.toLowerCase().includes(term) ||
        fee.category_name?.toLowerCase().includes(term) ||
        fee.class_name?.toLowerCase().includes(term)
      );
    }
    
    // Apply fee type filter
    if (selectedFeeType) {
      result = result.filter(fee => fee.fee_type === selectedFeeType);
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(fee => String(fee.category_id) === selectedCategory);
    }
    
    // Apply class filter
    if (selectedClass) {
      result = result.filter(fee => String(fee.class_id) === selectedClass);
    }
    
    // Apply academic year filter
    if (selectedAcademicYear) {
      result = result.filter(fee => String(fee.academic_year_id) === selectedAcademicYear);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredFees(result);
  };

  const handleSort = (field: keyof FeeWithDetails) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteFee = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this fee?')) return;
    
    setDeletingFeeId(id);
    try {
      await deleteFee(id as any);
      toast.success('Fee deleted successfully');
      // Refresh data
      loadData();
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Failed to delete fee. Please try again.');
    } finally {
      setDeletingFeeId(null);
    }
  };

  const handleEditFee = (fee: FeeWithDetails) => {
    setSelectedFee(fee);
    setEditDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedFeeType('');
    setSelectedCategory('');
    setSelectedClass('');
    setSelectedAcademicYear('');
  };

  const exportToCSV = () => {
    // Generate CSV data
    const headers = ['ID', 'Fee Type', 'Category', 'Class', 'Amount', 'Description', 'Status'];
    const csvData = [
      headers.join(','),
      ...filteredFees.map(fee => [
        fee.id,
        fee.fee_type,
        fee.category_name || '-',
        fee.class_name || '-',
        fee.amount,
        fee.description || '-',
        fee.status
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fees_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fee Management</CardTitle>
          <CardDescription>
            Manage and view all school fees
          </CardDescription>
        </div>
        <AddFeeDialog onSuccess={loadData} />
      </CardHeader>
      
      <CardContent>
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search fees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="flex flex-wrap gap-4">
              <Select
                value={selectedFeeType}
                onValueChange={setSelectedFeeType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Fee Types</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="tuition">Tuition</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedAcademicYear}
                onValueChange={setSelectedAcademicYear}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Academic Years</SelectItem>
                  {academicYears.map(year => (
                    <SelectItem key={year.id} value={String(year.id)}>
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <FilterX className="h-4 w-4" /> Reset Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
        
        {/* Fees Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('fee_type')}
                >
                  Fee Type {sortField === 'fee_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Class</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading fees data...
                  </TableCell>
                </TableRow>
              ) : filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No fees found matching the criteria
                  </TableCell>
                </TableRow>
              ) : (
                (() => {
                  const startIdx = (page - 1) * pageSize;
                  const paginatedFees = filteredFees.slice(startIdx, startIdx + pageSize);
                  return paginatedFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="text-[10px] font-mono opacity-60 uppercase">{String(fee.id).substring(0, 8)}</TableCell>
                      <TableCell className="capitalize">{fee.fee_type}</TableCell>
                      <TableCell>{fee.category_name || '-'}</TableCell>
                      <TableCell>{fee.class_name || '-'}</TableCell>
                      <TableCell>{fee.amount.toLocaleString()}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {fee.description || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fee.status || 'active'}
                        </span>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFee(fee);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFee(fee.id);
                              }}
                              className="flex items-center gap-2 text-red-600 cursor-pointer"
                              disabled={deletingFeeId === fee.id}
                            >
                              {deletingFeeId === fee.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              {deletingFeeId === fee.id ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ));
                })()
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredFees.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
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
      </CardContent>
      
      {/* Edit Dialog */}
      {selectedFee && (
        <EditFeeDialog
          fee={selectedFee}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setTimeout(() => setSelectedFee(null), 300); // Slight delay to avoid UI flicker
          }}
          onSuccess={() => {
            toast.success("Fee updated successfully");
            setEditDialogOpen(false);
            setSelectedFee(null);
            loadData();
          }}
        />
      )}
    </Card>
  );
}

