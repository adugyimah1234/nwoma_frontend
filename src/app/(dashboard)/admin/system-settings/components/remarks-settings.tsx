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
      toast.error("Failed to load remarks");
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
      toast.success("Remark added to the bank");
      fetchRemarks();
    } catch (err) {
      toast.error("Failed to create remark");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this remark?")) return;
    try {
      await remarksService.delete(id);
      toast.success("Remark deleted");
      fetchRemarks();
    } catch (err) {
      toast.error("Failed to delete remark");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-lg font-semibold">Remarks Repository</CardTitle>
          <CardDescription>Standardized comments for student reports and assessments.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="space-y-4 mb-8 bg-muted/20 p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1 space-y-2">
                    <Label className="text-sm">Category</Label>
                    <Select value={newRemark.category} onValueChange={v => setNewRemark({...newRemark, category: v as RemarkItem['category']})}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="academic">Academic Performance</SelectItem>
                            <SelectItem value="conduct">Conduct & Discipline</SelectItem>
                            <SelectItem value="interest">Special Interests</SelectItem>
                            <SelectItem value="general">General Remarks</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm">Remark Text</Label>
                    <Input
                        placeholder="e.g. A disciplined student with high moral standards..."
                        value={newRemark.remark_text}
                        className="h-9"
                        onChange={(e) => setNewRemark({...newRemark, remark_text: e.target.value})}
                    />
                </div>
                <Button type="submit" disabled={loading} className="gap-2 h-9">
                    <Plus className="size-4" /> Add Remark
                </Button>
            </div>
          </form>

          <div className="rounded-md border bg-background overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="w-[150px] pl-6 py-3">Category</TableHead>
                    <TableHead className="py-3">Remark</TableHead>
                    <TableHead className="text-right pr-6 py-3">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {remarks.map((r) => (
                    <TableRow key={r.id} className="group transition-colors border-b last:border-none">
                    <TableCell className="pl-6 py-3">
                        <Badge variant="secondary" className="capitalize text-[10px] font-semibold">
                            {r.category}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium py-3">{r.remark_text}</TableCell>
                    <TableCell className="text-right pr-6 py-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="size-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                {remarks.length === 0 && (
                    <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic text-sm">
                        No remarks found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
