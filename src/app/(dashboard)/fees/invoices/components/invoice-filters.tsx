'use client';

import { useState, FormEvent } from 'react';
import { Filter, Search, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { InvoiceStatus } from '@/services/invoice';

// Define filter interface
export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | InvoiceStatus[];
  date_from?: string;
  date_to?: string;
}

interface InvoiceFiltersProps {
  onFilterChange: (filters: InvoiceFilters) => void;
  currentFilters: InvoiceFilters;
}

export function InvoiceFilters({ onFilterChange, currentFilters }: InvoiceFiltersProps) {
  // Local state for search input
  const [searchInput, setSearchInput] = useState(currentFilters.search || '');
  // State for filter sheet visibility
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  // Local state for filter options in the sheet (before applying)
  const [localFilters, setLocalFilters] = useState<InvoiceFilters>(currentFilters);
  
  // Handle search form submission
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    onFilterChange({ 
      ...currentFilters, 
      search: searchInput 
    });
  };
  
  // Handle filter sheet open
  const handleOpenFilterSheet = () => {
    // Reset local filters to current filters when opening sheet
    setLocalFilters(currentFilters);
    setShowFilterSheet(true);
  };
  
  // Update local status filter
  const handleStatusFilter = (status: InvoiceStatus | InvoiceStatus[]) => {
    setLocalFilters({
      ...localFilters,
      status
    });
  };
  
  // Apply all filters
  const applyFilters = () => {
    onFilterChange(localFilters);
    setShowFilterSheet(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: InvoiceFilters = {};
    setLocalFilters(emptyFilters);
    setSearchInput('');
    onFilterChange(emptyFilters);
    setShowFilterSheet(false);
  };
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(currentFilters).some(
    value => value !== undefined && (
      Array.isArray(value) ? value.length > 0 : true
    )
  );
  
  return (
    <div className="flex items-center space-x-2">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative w-[300px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Search invoices..."
            className="pl-9 w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="default" size="sm">
          Search
        </Button>
      </form>
      
      {/* Filter button */}
      <Button 
        variant={hasActiveFilters ? "default" : "outline"} 
        size="icon" 
        onClick={handleOpenFilterSheet}
      >
        <Filter className="h-4 w-4" />
      </Button>
      
      {/* Active filter indicators */}
      {currentFilters.status && (
        <Badge variant="outline" className="ml-2">
          Status: {Array.isArray(currentFilters.status) 
            ? `GHC{currentFilters.status.length} selected` 
            : currentFilters.status.replace('_', ' ')}
        </Badge>
      )}
      
      {(currentFilters.date_from || currentFilters.date_to) && (
        <Badge variant="outline" className="ml-2">
          Date Range
        </Badge>
      )}
      
      {/* Clear filters button (only shown when filters are active) */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-8 px-2 text-xs"
        >
          Clear filters
        </Button>
      )}
      
      {/* Filter Sheet/Dialog */}
      <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Invoices</SheetTitle>
            <SheetDescription>
              Apply filters to narrow down your invoice list
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Status filters */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start GHC{localFilters.status === 'draft' ? 'border-primary' : ''}`}
                  onClick={() => handleStatusFilter('draft')}
                >
                  <Badge variant="secondary" className="mr-2">Draft</Badge>
                  Drafts
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start GHC{localFilters.status === 'sent' ? 'border-primary' : ''}`}
                  onClick={() => handleStatusFilter('sent')}
                >
                  <Badge variant="secondary" className="mr-2">Sent</Badge>
                  Sent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start GHC{localFilters.status === 'paid' ? 'border-primary' : ''}`}
                  onClick={() => handleStatusFilter('paid')}
                >
                  <Badge variant="default" className="mr-2">Paid</Badge>
                  Paid
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start GHC{localFilters.status === 'partially_paid' ? 'border-primary' : ''}`}
                  onClick={() => handleStatusFilter('partially_paid')}
                >
                  <Badge variant="outline" className="mr-2">Partial</Badge>
                  Partially Paid
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start GHC{localFilters.status === 'overdue' ? 'border-primary' : ''}`}
                  onClick={() => handleStatusFilter('overdue')}
                >
                  <Badge variant="destructive" className="mr-2">Overdue</Badge>
                  Overdue
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`justify-start GHC{Array.isArray(localFilters.status) ? 'border-primary' : ''}`}
                  onClick={() => handleStatusFilter(['paid', 'partially_paid'])}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Any Payment
                </Button>
              </div>
            </div>
            
            {/* Date Range filters */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs">From</label>
                  <Input 
                    type="date" 
                    value={localFilters.date_from || ''} 
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      date_from: e.target.value || undefined
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs">To</label>
                  <Input 
                    type="date" 
                    value={localFilters.date_to || ''} 
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      date_to: e.target.value || undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <SheetClose asChild>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}


