'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
} from '@/components/ui/data-table';
import { cn } from '@/lib/utils';

interface DirectoryTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: DataTableFilter[];
  onSearch?: (query: string) => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  rowKey?: keyof T;
  className?: string;
  cardClassName?: string;
}

/**
 * DirectoryTable - A professional, reusable table layout component.
 * Wraps the generic DataTable with a consistent Card-based design,
 * optimized for "Directory" and "Management" views.
 */
export function DirectoryTable<T extends Record<string, unknown>>({
  title,
  description,
  className,
  cardClassName,
  ...props
}: DirectoryTableProps<T>) {
  return (
    <Card className={cn("border-none shadow-sm dark:shadow-none overflow-hidden bg-card/50", cardClassName)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm font-medium text-muted-foreground mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={className}>
        <DataTable {...props} />
      </CardContent>
    </Card>
  );
}

