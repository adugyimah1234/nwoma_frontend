/* eslint-disable no-console */
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from 'lucide-react';
import classService from '@/services/class';

interface Class {
  id: string;
  name: string;
  section: string;
  capacity: number;
  school: string;
  academicYear: string;
}

export default function ClassSettings() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [capacity, setCapacity] = useState<number>(0);
  const [school, setSchool] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    if (editingClass) {
      setClassName(editingClass.name);
      setSection(editingClass.section);
      setCapacity(editingClass.capacity);
      setSchool(editingClass.school);
      setAcademicYear(editingClass.academicYear);
      setIsDialogOpen(true);
    }
  }, [editingClass]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>Configure available classes and sections</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Create a new class with section and capacity
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Class Name</Label>
<Input id="name" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g., Grade 1, Form 1" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="section">Section</Label>
                <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g., A, Red, Science" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value, 10))} placeholder="Maximum students" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="school">School</Label>
                <Select value={school} onValueChange={setSchool}>
  <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="primary">Primary School</SelectItem>
    <SelectItem value="secondary">Secondary School</SelectItem>
  </SelectContent>
</Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
<Button
  variant="outline"
  onClick={() => {
    setIsDialogOpen(false);
    setEditingClass(null);
    setClassName('');
    setSection('');
    setCapacity(0);
    setSchool('');
    setAcademicYear('');
  }}
>
  Cancel
</Button>

<Button
  onClick={async () => {
    const payload = {
      name: className,
      section,
      capacity,
      school,
      academicYear,
    };

    try {
      if (editingClass) {
        await classService.update({
          id: editingClass.id,
          name: payload.name,
          level: 1,
          school_id: school === 'primary' ? "1" : "2",
          slots: payload.capacity,
          capacity: payload.capacity,
          students_count: 0
        });

        setClasses(prev =>
          prev.map(c =>
            c.id === editingClass.id
              ? { ...payload, id: editingClass.id }
              : c
          )
        );
      } else {
        const created = await classService.create({
          name: payload.name,
          level: 1,
          school_id: school === 'primary' ? "1" : "2",
          slots: payload.capacity,
          capacity: payload.capacity,
          students_count: 0
        });

        setClasses(prev => [
          ...prev,
          { ...payload, id: created.id.toString() },
        ]);
      }
      setIsDialogOpen(false);
      setEditingClass(null);
      setClassName('');
      setSection('');
      setCapacity(0);
      setSchool('');
      setAcademicYear('');
    } catch (err) {
      console.error('Failed to save class', err);
    }
  }}
>
  {editingClass ? 'Update Class' : 'Save Class'}
</Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No classes configured yet. Add your first class.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.section}</TableCell>
                  <TableCell>{cls.capacity}</TableCell>
                  <TableCell>{cls.school}</TableCell>
                  <TableCell>{cls.academicYear}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingClass(cls)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
  variant="ghost"
  size="icon"
  className="text-destructive"
  onClick={async () => {
    try {
      await classService.delete(cls.id);
      setClasses(prev => prev.filter(c => c.id !== cls.id));
    } catch (err) {
      console.error("Failed to delete class", err);
    }
  }}
>
  <Trash2 className="h-4 w-4" />
</Button>

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
