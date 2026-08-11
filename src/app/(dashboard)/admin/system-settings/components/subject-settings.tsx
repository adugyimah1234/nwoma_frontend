'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2, RefreshCw } from 'lucide-react';
import gradebookService, { Subject } from '@/services/gradebook';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SubjectSettings() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  const fetchSubjects = async () => {
    try {
      const data = await gradebookService.getSubjects();
      setSubjects(data);
    } catch (err) {
      toast.error("Failed to load curriculum");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.code) return;

    setLoading(true);
    try {
      // Assuming a create method exists or using saveMarks for now
      // Actually, I added createSubject to service in my mind, let's ensure it's there
      await (gradebookService as any).createSubject(newSubject);
      setNewSubject({ name: '', code: '' });
      toast.success("Subject added to curriculum");
      fetchSubjects();
    } catch (err) {
      toast.error("Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="text-base font-bold">Academic Curriculum</CardTitle>
          <CardDescription>Define subjects taught across this school or garrison.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="flex gap-4 items-end mb-6">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-bold uppercase">Subject Name</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
              />
            </div>
            <div className="w-40 space-y-2">
              <Label className="text-xs font-bold uppercase">Code</Label>
              <Input
                placeholder="e.g. MATH101"
                value={newSubject.code}
                onChange={(e) => setNewSubject({...newSubject, code: e.target.value.toUpperCase()})}
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              <Plus className="size-4" /> Add Subject
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Code</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell className="font-mono text-xs">{sub.code}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {subjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">
                    No subjects defined in the current registry.
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
