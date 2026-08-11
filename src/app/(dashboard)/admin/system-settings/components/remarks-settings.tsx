'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import remarksService, { RemarkItem } from '@/services/remarks';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RemarksSettings() {
  const [remarks, setRemarks] = useState<RemarkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRemark, setNewRemark] = useState<{
    remark_text: string;
    category: RemarkItem['category'];
  }>({ remark_text: '', category: 'general' });

  const fetchRemarks = async () => {
    try {
      const data = await remarksService.getAll();
      setRemarks(data);
    } catch (err) {
      toast.error("Failed to load remarks bank");
    }
  };

  useEffect(() => {
    fetchRemarks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.remark_text) return;

    setLoading(true);
    try {
      await remarksService.create(newRemark);
      setNewRemark({ remark_text: '', category: 'general' });
      toast.success("Remark added to institutional bank");
      fetchRemarks();
    } catch (err) {
      toast.error("Failed to create remark");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this remark from the bank?")) return;
    try {
      await remarksService.delete(id);
      toast.success("Remark purged");
      fetchRemarks();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="text-base font-bold">Professional Remarks Bank</CardTitle>
          <CardDescription>Standardized professional comments for terminal reports and assessments.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1 space-y-2">
                    <Label className="text-xs font-bold uppercase">Category</Label>
                    <Select value={newRemark.category} onValueChange={v => setNewRemark({...newRemark, category: v as RemarkItem['category']})}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="academic">Academic Performance</SelectItem>
                            <SelectItem value="conduct">Conduct & Discipline</SelectItem>
                            <SelectItem value="interest">Special Interests</SelectItem>
                            <SelectItem value="general">General Remarks</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase">Remark Text</Label>
                    <Input
                        placeholder="e.g. A disciplined student with high moral standards..."
                        value={newRemark.remark_text}
                        onChange={(e) => setNewRemark({...newRemark, remark_text: e.target.value})}
                        className="h-11"
                    />
                </div>
                <Button type="submit" disabled={loading} className="h-11 gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="size-4" /> Add to Bank
                </Button>
            </div>
          </form>

          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow>
                <TableHead className="w-[150px] font-bold">Category</TableHead>
                <TableHead className="font-bold">Commentary</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {remarks.map((r) => (
                <TableRow key={r.id} className="group">
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                        {r.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700">{r.remark_text}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {remarks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic">
                    No standardized remarks found in the registry.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
