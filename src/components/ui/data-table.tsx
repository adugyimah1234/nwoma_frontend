'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: DataTableFilterOption[];
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: DataTableFilter[];
  onSearch?: (query: string) => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  /** key to use for row identity */
  rowKey?: keyof T;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder = 'Filter by title or ID...',
  searchKey,
  filters = [],
  onSearch,
  toolbar,
  emptyMessage = 'No results found.',
  loading = false,
  rowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => String(c.key)))
  );

  // Client-side filtering by search
  const filteredData = React.useMemo(() => {
    let result = data;
    if (search && searchKey) {
      const q = search.toLowerCase();
      result = result.filter((row) => {
        const val = row[searchKey];
        return typeof val === 'string' && val.toLowerCase().includes(q);
      });
    }
    // Apply active filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter((row) => {
          const val = String(row[key] ?? '').toLowerCase();
          return values.some((v) => val === v.toLowerCase());
        });
      }
    });
    return result;
  }, [data, search, searchKey, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    onSearch?.(e.target.value);
  };

  const toggleFilter = (filterKey: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[filterKey] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [filterKey]: next };
    });
    setPage(1);
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) {
            next.delete(key);
        } else {
            toast.error("At least one column must be visible");
        }
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const displayedColumns = columns.filter((c) => visibleColumns.has(String(c.key)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchKey && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
                className="pl-9 h-9"
              />
            </div>
          )}
          {filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filters.map((filter) => (
                  <React.Fragment key={filter.key}>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                      {filter.label}
                    </DropdownMenuLabel>
                    {filter.options.map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={(activeFilters[filter.key] || []).includes(opt.value)}
                        onCheckedChange={() => toggleFilter(filter.key, opt.value)}
                      >
                        {opt.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                  </React.Fragment>
                ))}
                {Object.keys(activeFilters).length > 0 && (
                  <DropdownMenuItem
                    onClick={() => setActiveFilters({})}
                    className="justify-center text-center font-medium"
                  >
                    Clear Filters
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {displayedColumns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    'h-11 font-semibold text-foreground text-xs uppercase tracking-tight',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {displayedColumns.map((col) => (
                    <TableCell key={String(col.key)} className="py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayedColumns.length}
                  className="h-24 text-center text-muted-foreground text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => {
                const key = rowKey ? String(row[rowKey] ?? `row-${i}`) : `row-${i}`;
                return (
                  <TableRow
                    key={key}
                    className="hover:bg-muted/50 transition-colors border-b last:border-0"
                  >
                    {displayedColumns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        className={cn(
                          'py-3 text-sm font-normal text-foreground/80',
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell(row)
                          : String(row[col.key as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: rows per page + pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 px-1">
        <div className="flex items-center space-x-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm font-medium text-muted-foreground">Rows per page</p>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page} of {totalPages}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
            >
                <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

