'use client';

import { PageHeader } from "@/components/layout/page-header";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Save, Plus, Building2, LayoutGrid, RefreshCw } from "lucide-react";
import schoolService from "@/services/schools";
import classService, { ClassData } from "@/services/class";
import { School } from "@/types/school";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GuidedTour } from "@/components/tour/GuidedTour";
import { Step } from "react-joyride";

interface ClassWithSlots extends ClassData {
  slots: number;
}

export default function ClassManagementPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassWithSlots[]>([]);
  const [saving, setSaving] = useState(false);

  const tourSteps: Step[] = [
    {
      target: '#tour-units-sidebar',
      title: 'Switching Units',
      content: 'Select different schools or departments here to manage their specific classes and quotas.',
      placement: 'right',
    },
    {
      target: '#tour-main-content',
      title: 'Class Overview',
      content: 'This area shows all educational levels and their current enrollment status.',
      placement: 'left',
    },
    {
      target: '#tour-add-class',
      title: 'Expanding Capacity',
      content: 'Click here to add a new level or class to the selected unit.',
      placement: 'bottom',
    },
    {
      target: '#tour-save-classes',
      title: 'Finalize Changes',
      content: 'Don\'t forget to save your changes after editing class names or capacities.',
      placement: 'bottom',
    },
  ];

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    try {
      const allSchools = await schoolService.getAll();
      setSchools(allSchools);
      if (allSchools.length > 0) {
        selectSchool(allSchools[0]);
      }
    } catch {
      toast.error("Failed to load schools.");
    }
  }

  async function selectSchool(school: School) {
    setSelectedSchool(school);
    try {
      const schoolClasses = await classService.getBySchool(school.id);
      setClasses(schoolClasses.map((cls) => ({ ...cls, slots: cls.slots ?? 0 })));
    } catch {
      toast.error("Failed to load classes.");
      setClasses([]);
    }
  }

  function onClassChange(id: string | number, field: "name" | "slots", value: string | number) {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === id) {
          if (field === "slots") {
            const num = Number(value);
            return { ...cls, slots: Number.isNaN(num) ? 0 : num };
          }
          return { ...cls, [field]: String(value) };
        }
        return cls;
      })
    );
  }

  function addClass() {
    if (!selectedSchool) return;
    const tempId = `TEMP-${Date.now()}`;
    const newClass: ClassWithSlots = {
      id: tempId,
      name: '',
      school_id: selectedSchool.id,
      school_name: selectedSchool.name,
      slots: 0,
      capacity: 0,
      students_count: 0,
    };
    setClasses((prev) => [...prev, newClass]);
  }

  async function deleteClass(id: string | number) {
    try {
      if (!String(id).startsWith('TEMP-')) {
        await classService.delete(String(id));
      }
      setClasses((prev) => prev.filter((cls) => cls.id !== id));
      toast.success("Class removed");
    } catch {
      toast.error("Failed to delete class.");
    }
  }

  async function onSave() {
    if (!selectedSchool) return;
    setSaving(true);
    try {
      const classRequests = classes.map((cls) => {
        if (!cls.name) throw new Error("Class name is required.");
        const payload = {
          name: cls.name,
          school_id: selectedSchool.id,
          slots: cls.slots,
          capacity: cls.slots,
          students_count: cls.students_count,
        };

        if (String(cls.id).startsWith('TEMP-')) {
          return classService.create(payload as any);
        } else {
          return classService.update({ id: cls.id, ...payload } as any);
        }
      });

      await Promise.all(classRequests);
      toast.success("Changes saved successfully");
      if (selectedSchool) selectSchool(selectedSchool);
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
        <PageHeader
          title="Class & Unit Allocation"
          description="Manage educational levels, capacity, and student enrollment quotas across nodes."
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Admin', href: '/admin' },
            { title: 'Classes' }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar: Schools list */}
            <div className="lg:col-span-3" id="tour-units-sidebar">
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Building2 className="size-4" /> Units
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1">
                        {schools.map((school) => (
                            <button
                                key={school.id}
                                onClick={() => selectSchool(school)}
                                className={cn(
                                    "w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    selectedSchool?.id === school.id
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                {school.name}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Main Area */}
            <div className="lg:col-span-9" id="tour-main-content">
                {!selectedSchool ? (
                    <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/5 text-center">
                        <Building2 className="size-12 text-muted-foreground/20 mb-4" />
                        <h4 className="text-lg font-medium">No Unit Selected</h4>
                        <p className="text-sm text-muted-foreground mt-1">Select a unit from the left to manage classes.</p>
                    </div>
                ) : (
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                                    <LayoutGrid className="size-4" />
                                </div>
                                <CardTitle className="text-lg font-semibold">{selectedSchool.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={addClass} id="tour-add-class">
                                    <Plus className="mr-2 h-4 w-4" /> Add Class
                                </Button>
                                <Button size="sm" onClick={onSave} disabled={saving} id="tour-save-classes">
                                    {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="pl-6">Class Name</TableHead>
                                            <TableHead className="text-center w-[120px]">Slots</TableHead>
                                            <TableHead className="text-center w-[150px]">Occupancy</TableHead>
                                            <TableHead className="text-right pr-6 w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classes.map((cls) => (
                                            <TableRow key={cls.id}>
                                                <TableCell className="pl-6">
                                                    <Input
                                                        value={cls.name}
                                                        onChange={(e) => onClassChange(cls.id, 'name', e.target.value)}
                                                        placeholder="e.g. Basic 1"
                                                        className="h-9"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center">
                                                        <Input
                                                            type="number"
                                                            value={cls.slots}
                                                            onChange={(e) => onClassChange(cls.id, 'slots', e.target.value)}
                                                            className="h-9 w-20 text-center"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-medium">{cls.students_count} / {cls.slots}</span>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] uppercase border-none px-2",
                                                            cls.students_count >= cls.slots ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                                                        )}>
                                                            {cls.students_count >= cls.slots ? 'Full' : 'Available'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteClass(cls.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {classes.length === 0 && (
                                            <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No classes found.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        <GuidedTour steps={tourSteps} run={true} />
    </div>
  );
}
