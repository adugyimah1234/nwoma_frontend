'use client';

import { useState } from 'react';
import { ArrowUpDown, Download, FileText, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';

export default function FinancialRecordsPage() {
  const records = [
    {
      id: 'REC001',
      type: 'Income',
      description: 'Tuition Fees',
      amount: 25000,
      date: '2024-05-15'
    },
    // Add more financial records
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search records..."
            className="w-[300px]"
          />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Record Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Records</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {record.description}
                </CardTitle>
                <Badge variant={record.type === 'Income' ? 'default' : 'secondary'}>
                  {record.type}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    GHC{record.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
