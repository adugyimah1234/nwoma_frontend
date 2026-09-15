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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAcademicYear, deleteAcademicYear, getAllAcademicYear, type academicYear as AcademicYearType, } from '@/services/academic_year';
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

export default function AcademicYearSettings() {
  const [academicYears, setAcademicYears] = useState<AcademicYearType[]>([]);
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const data = await getAllAcademicYear();
      setAcademicYears(data);
    } catch (error: any) {
      toast.error('Failed to fetch academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAcademicYear(id);
      toast.success('Academic year deleted');
      fetchAcademicYears();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: DataTableColumn<AcademicYearType>[] = [
    {
      key: 'year',
      header: 'Academic Year',
      cell: (row) => <span className="font-semibold">{row.year}</span>
    },
    {
      key: 'start_date',
      header: 'Start Date',
      cell: (row) => new Date(row.start_date).toLocaleDateString()
    },
    {
      key: 'end_date',
      header: 'End Date',
      cell: (row) => new Date(row.end_date).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => {
        const isActive = (row as any).is_active;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Edit feature coming soon')}>
            <Edit className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Academic Year</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {row.year}? This action cannot be undone and may affect associated records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  const handleCreate = async () => {
    if (!year || !startDate || !endDate) {
      toast.error('All fields are required');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        year: year,
        start_date: new Date(startDate).toISOString().split('T')[0],
        end_date: new Date(endDate).toISOString().split('T')[0],
        is_active: true
      };

      await createAcademicYear(payload);
      toast.success('Academic year created');
      setYear('');
      setStartDate('');
      setEndDate('');
      fetchAcademicYears();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Academic Years</CardTitle>
          <CardDescription>Manage academic cycles and terms</CardDescription>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
              <DialogDescription>
                Set the label and duration for the new academic cycle.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Year Label</Label>
                <Input
                  placeholder="e.g. 2025/2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Year'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        <DataTable
          data={academicYears as any}
          columns={columns as any}
          loading={loading}
          emptyMessage="No academic years defined yet."
          rowKey="id"
        />
      </CardContent>
    </Card>
  );
}

