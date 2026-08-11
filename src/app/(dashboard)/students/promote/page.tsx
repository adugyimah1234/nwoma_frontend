
'use client';
import { PageHeader } from '@/components/layout/page-header';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getAllAcademicYear } from '@/services/academic_year';
import classService from '@/services/class';
import studentService from '@/services/students';
import { AcademicYear } from '@/types/academic-year';
import { Class } from '@/types/class';
import { Student } from '@/types/student';
import { Loader2 } from 'lucide-react';

interface ClassMapping {
  currentClassId: string | number;
  nextClassId: string | number | null; // null for graduation
}

export default function PromoteStudentsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  const [selectedCurrentAcademicYearId, setSelectedCurrentAcademicYearId] = useState<string>('');
  const [selectedNextAcademicYearId, setSelectedNextAcademicYearId] = useState<string>('');
  const [classMappings, setClassMappings] = useState<ClassMapping[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [years, cls, stds] = await Promise.all([
          getAllAcademicYear(),
          classService.getAll(),
          studentService.getAll(),
        ]);
        setAcademicYears(years);
        setClasses(cls);
        setStudents(stds);

        // Attempt to pre-select current and next academic years
        if (years.length > 0) {
          const sortedYears = [...years].sort((a, b) => (a.year || '').localeCompare(b.year || ''));
          const lastYear = sortedYears[sortedYears.length - 1];
          const secondLastYear = sortedYears[sortedYears.length - 2];

          if (lastYear) setSelectedNextAcademicYearId(String(lastYear.id));
          if (secondLastYear) setSelectedCurrentAcademicYearId(String(secondLastYear.id));
        }

      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast.error('Failed to load data for promotion.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter students based on selected current academic year
  const studentsInCurrentYear = useMemo(() => {
    if (!selectedCurrentAcademicYearId) return [];
    return students.filter(
      (student) => String(student.academic_year_id) === selectedCurrentAcademicYearId
    );
  }, [students, selectedCurrentAcademicYearId]);

  // Classes available in the current academic year
  const currentAcademicYearClasses = useMemo(() => {
    const studentClassIds = new Set(studentsInCurrentYear.map(s => s.class_id));
    return classes.filter(cls => studentClassIds.has(cls.id));
  }, [classes, studentsInCurrentYear]);

  // Initialize class mappings when current academic year classes change
  useEffect(() => {
    const initialMappings: ClassMapping[] = currentAcademicYearClasses.map(cls => ({
      currentClassId: cls.id,
      nextClassId: null, // Default to no promotion (graduation or not set)
    }));
    setClassMappings(initialMappings);
  }, [currentAcademicYearClasses]);

  const handleClassMappingChange = (currentClassId: string | number, nextClassId: string) => {
    setClassMappings(prev =>
      prev.map(mapping =>
        mapping.currentClassId === currentClassId
          ? { ...mapping, nextClassId: nextClassId === 'null' ? null : nextClassId }
          : mapping
      )
    );
  };

  const handlePromoteStudents = async () => {
    if (!selectedCurrentAcademicYearId || !selectedNextAcademicYearId) {
      toast.error('Please select both current and next academic years.');
      return;
    }

    if (selectedCurrentAcademicYearId === selectedNextAcademicYearId) {
      toast.error('Current and next academic years cannot be the same.');
      return;
    }

    setPromoting(true);
    let promotedCount = 0;
    let failedCount = 0;

    for (const student of studentsInCurrentYear) {
      const mapping = classMappings.find(m => m.currentClassId === student.class_id);

      if (mapping && mapping.nextClassId !== null) {
        try {
          await studentService.updatePartial(student.id!, {
            class_id: mapping.nextClassId as string | number,
          } as any);
          promotedCount++;
        } catch (error) {
          console.error(`Failed to promote student ${student.id}:`, error);
          failedCount++;
        }
      } else if (mapping && mapping.nextClassId === null) {
        // Student is graduating or not moving to next class
        // Optionally update their status to 'graduated' or similar
        try {
          await studentService.updatePartial(student.id!, {
            status: 'graduated', // Example status
          } as any);
          promotedCount++; // Count as handled
        } catch (error) {
          console.error(`Failed to update graduating student ${student.id}:`, error);
          failedCount++;
        }
      } else {
        // No mapping found for student's current class
        console.warn(`No class mapping found for student ${student.id} in class ${student.class_id}. Skipping.`);
        failedCount++;
      }
    }

    if (promotedCount > 0) {
      toast.success(`${promotedCount} student(s) promoted successfully.`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} student(s) failed to promote.`);
    }
    setPromoting(false);
    // Refresh student data after promotion
    const updatedStudents = await studentService.getAll();
    setStudents(updatedStudents);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
        <PageHeader
          title="Promote Students"
          description="Map class progressions and promote students to the next academic year"
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Students', href: '/students' },
            { title: 'Promote Students' }
          ]}
          tabs={[
            { title: 'All Students', href: '/students' },
            { title: 'Promote Students', href: '/students/promote' },
          ]}
        />

      <Card>
        <CardHeader>
          <CardTitle>Academic Year Selection</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Academic Year</label>
            <Select
              value={selectedCurrentAcademicYearId}
              onValueChange={setSelectedCurrentAcademicYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select current academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={String(year.id)}>
                    {year.name || year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Next Academic Year</label>
            <Select
              value={selectedNextAcademicYearId}
              onValueChange={setSelectedNextAcademicYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select next academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={String(year.id)}>
                    {year.name || year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCurrentAcademicYearId && selectedNextAcademicYearId && (
        <Card>
          <CardHeader>
            <CardTitle>Class Progression Mapping</CardTitle>
            <p className="text-muted-foreground">
              Map classes from the current academic year to their corresponding classes in the next academic year.
              Select "Graduation" if students from a class will not move to another class.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Current Class</TableHead>
                  <TableHead>Students in Current Class</TableHead>
                  <TableHead>Promote To Class</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAcademicYearClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No classes found for students in the selected current academic year.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentAcademicYearClasses.map(currentClass => {
                    const studentCount = studentsInCurrentYear.filter(s => s.class_id === currentClass.id).length;
                    const currentMapping = classMappings.find(m => m.currentClassId === currentClass.id);

                    return (
                      <TableRow key={currentClass.id}>
                        <TableCell className="font-medium">{currentClass.name}</TableCell>
                        <TableCell>{studentCount}</TableCell>
                        <TableCell>
                          <Select
                            value={String(currentMapping?.nextClassId ?? 'null')}
                            onValueChange={(value: string) => handleClassMappingChange(currentClass.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select next class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="null">Graduation / No Promotion</SelectItem>
                              {classes.map(nextClass => (
                                <SelectItem key={nextClass.id} value={String(nextClass.id)}>
                                  {nextClass.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedCurrentAcademicYearId && selectedNextAcademicYearId && studentsInCurrentYear.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Promotion Summary</CardTitle>
            <p className="text-muted-foreground">
              Review the students to be promoted and their new class assignments.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Current Class</TableHead>
                  <TableHead>New Class</TableHead>
                  <TableHead>New Academic Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInCurrentYear.map(student => {
                  const currentClass = classes.find(cls => cls.id === student.class_id);
                  const mapping = classMappings.find(m => m.currentClassId === student.class_id);
                  const nextClass = classes.find(cls => cls.id === mapping?.nextClassId);
                  const nextAcademicYear = academicYears.find(year => String(year.id) === selectedNextAcademicYearId);

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>{currentClass?.name || 'N/A'}</TableCell>
                      <TableCell>{nextClass?.name || 'Graduating'}</TableCell>
                      <TableCell>{nextAcademicYear?.name || nextAcademicYear?.year || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-6 flex justify-end">
              <Button onClick={handlePromoteStudents} disabled={promoting}>
                {promoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {promoting ? 'Promoting...' : 'Confirm & Promote Students'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
  );
}
