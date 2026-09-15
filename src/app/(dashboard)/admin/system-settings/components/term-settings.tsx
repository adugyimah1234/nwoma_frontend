'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CalendarDays, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import gradebookService, { AcademicTerm } from '@/services/gradebook';
import { getAllAcademicYear, academicYear } from '@/services/academic_year';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function TermSettings() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [academicYears, setAcademicYears] = useState<academicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    academic_year_id: '',
    start_date: '',
    end_date: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [termRes, yearRes] = await Promise.all([
        gradebookService.getTerms(),
        getAllAcademicYear()
      ]);
      setTerms(termRes);
      setAcademicYears(yearRes);
    } catch (error: any) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.academic_year_id || !formData.start_date || !formData.end_date) {
      toast.error('All fields are required');
      return;
    }

    setIsCreating(true);
    try {
      await gradebookService.createTerm(formData);
      toast.success('Academic term created');
      setFormData({ name: '', academic_year_id: '', start_date: '', end_date: '' });
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create term');
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickInit = async (type: 'term' | 'semester') => {
      if (!formData.academic_year_id) {
          toast.error("Select Academic Year first");
          return;
      }

      const year = academicYears.find(y => y.id === formData.academic_year_id);
      if (!year) return;

      const startDate = new Date(year.start_date);
      const endDate = new Date(year.end_date);

      // Rough calculation for terms
      setIsCreating(true);
      try {
          if (type === 'term') {
              const names = ["Term 1", "Term 2", "Term 3"];
              for (let i = 0; i < 3; i++) {
                  await gradebookService.createTerm({
                      name: names[i],
                      academic_year_id: year.id,
                      start_date: year.start_date, // Just placeholders
                      end_date: year.end_date
                  });
              }
              toast.success("Initialized 3-Term system");
          } else {
              const names = ["Semester 1", "Semester 2"];
              for (let i = 0; i < 2; i++) {
                await gradebookService.createTerm({
                    name: names[i],
                    academic_year_id: year.id,
                    start_date: year.start_date,
                    end_date: year.end_date
                });
            }
            toast.success("Initialized Semester system");
          }
          fetchData();
      } catch (err) {
          toast.error("Failed to initialize terms");
      } finally {
          setIsCreating(false);
      }
  };

  const handleDelete = async (id: string) => {
    try {
      await gradebookService.deleteTerm(id);
      toast.success('Term removed');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete term');
    }
  };

  const getYearLabel = (id: string) => {
    return academicYears.find(y => y.id === id)?.year || 'Unknown';
  };

  const columns: DataTableColumn<AcademicTerm>[] = [
    {
      key: 'name',
      header: 'Term/Semester Name',
      cell: (row) => <span className="font-semibold">{row.name}</span>
    },
    {
      key: 'academic_year_id',
      header: 'Academic Year',
      cell: (row) => <Badge variant="outline">{(row as any).academic_year_id ? getYearLabel((row as any).academic_year_id) : 'N/A'}</Badge>
    },
    {
      key: 'start_date',
      header: 'Duration',
      cell: (row) => {
          const start = (row as any).start_date ? new Date((row as any).start_date).toLocaleDateString() : '?';
          const end = (row as any).end_date ? new Date((row as any).end_date).toLocaleDateString() : '?';
          return <span className="text-xs text-muted-foreground">{start} - {end}</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Current' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Academic Term</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{row.name}</strong>? This may affect student marks and reports linked to this term.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Term
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-primary" />
          <div>
            <CardTitle>Academic Terms</CardTitle>
            <CardDescription>Configure terms and semesters for academic years.</CardDescription>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Academic Term</DialogTitle>
              <DialogDescription>
                Define a new period (Term or Semester) within an academic year.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select
                  value={formData.academic_year_id}
                  onValueChange={(val) => setFormData(prev => ({...prev, academic_year_id: val}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map(year => (
                      <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg border border-dashed flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground text-center">Quick Setup</p>
                  <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleQuickInit('term')}>3-Term System</Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleQuickInit('semester')}>Semester System</Button>
                  </div>
              </div>

              <div className="space-y-2">
                <Label>Term/Semester Name</Label>
                <Input
                  placeholder="e.g. Term 1 or First Semester"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? <RefreshCw className="size-4 animate-spin mr-2" /> : null}
                Create Term
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        <DataTable
          data={terms}
          columns={columns}
          loading={loading}
          emptyMessage="No academic terms defined. Click 'Add Term' to begin."
          rowKey="id"
        />
      </CardContent>
    </Card>
  );
}

