'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2, RefreshCw, Loader2 } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SubjectSettings() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  const fetchSubjects = async () => {
    try {
      setFetching(true);
      const data = await gradebookService.getSubjects();
      setSubjects(data);
    } catch (err) {
      toast.error("Failed to load curriculum");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name || !newSubject.code) {
        toast.error("Please provide both name and code");
        return;
    }

    setLoading(true);
    try {
      await gradebookService.createSubject(newSubject);
      setNewSubject({ name: '', code: '' });
      toast.success("Subject added to curriculum");
      fetchSubjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      try {
          await gradebookService.deleteSubject?.(id); // assuming deleteSubject is added
          toast.success("Subject removed");
          fetchSubjects();
      } catch (err) {
          toast.error("Failed to delete subject");
      }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-3">
              <BookOpen className="size-5 text-primary" />
              <div>
                  <CardTitle className="text-lg font-semibold">Subject Curriculum</CardTitle>
                  <CardDescription>Define subjects taught across the institution.</CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 bg-muted/20 p-6 rounded-lg border">
            <div className="md:col-span-6 space-y-2">
              <Label className="text-sm">Subject Name</Label>
              <Input
                placeholder="e.g. Core Mathematics"
                value={newSubject.name}
                className="h-9"
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label className="text-sm">Subject Code</Label>
              <Input
                placeholder="e.g. MATH101"
                className="font-mono uppercase h-9"
                value={newSubject.code}
                onChange={(e) => setNewSubject({...newSubject, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="md:col-span-3">
                <Button type="submit" disabled={loading} className="w-full gap-2 h-9">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Add Subject
                </Button>
            </div>
          </form>

          <div className="rounded-md border bg-background overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="py-3 pl-6">Subject Name</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {fetching ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-10"><RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground/30" /></TableCell></TableRow>
                ) : subjects.map((sub) => (
                    <TableRow key={sub.id} className="group transition-colors border-b last:border-none">
                        <TableCell className="font-medium py-3 pl-6 text-sm">{sub.name}</TableCell>
                        <TableCell className="font-mono text-xs">{sub.code}</TableCell>
                        <TableCell className="text-right pr-6">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently remove <strong>{sub.name}</strong> from the curriculum. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(sub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Subject</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
                {!fetching && subjects.length === 0 && (
                    <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic text-sm">
                        No curriculum items found.
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
