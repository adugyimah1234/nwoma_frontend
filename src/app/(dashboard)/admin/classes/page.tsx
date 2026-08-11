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
import { Toaster, toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ClassWithSlots extends ClassData {
  slots: number;
}

export default function ClassManagementPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassWithSlots[]>([]);
  const [saving, setSaving] = useState(false);

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
        <Toaster position="top-right" richColors />
        <PageHeader
          title="Class & Unit Allocation"
          description="Manage educational levels, capacity, and student enrollment quotas across nodes."
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Admin', href: '/admin' },
            { title: 'Classes' }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Schools list */}
            <div className="lg:col-span-3 space-y-6">
                <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-background">
                    <CardHeader className="bg-muted/20 border-b py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <Building2 className="size-5" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Network Units</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-1">
                        {schools.map((school) => (
                            <button
                                key={school.id}
                                onClick={() => selectSchool(school)}
                                className={cn(
                                    "w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                    selectedSchool?.id === school.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
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
            <div className="lg:col-span-9">
                {!selectedSchool ? (
                    <div className="h-full flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-[3rem] bg-muted/5 text-center px-10">
                        <div className="size-20 bg-muted/20 rounded-[2rem] flex items-center justify-center mb-6">
                            <Building2 className="size-10 text-muted-foreground opacity-30" />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tighter">No Unit Selected</h4>
                        <p className="text-sm text-muted-foreground max-w-xs mt-2 font-medium">Select a tactical unit from the left panel to manage its educational classification.</p>
                    </div>
                ) : (
                    <Card className="border-none shadow-2xl shadow-black/5 rounded-[3rem] overflow-hidden bg-background">
                        <CardHeader className="bg-muted/20 border-b py-10 px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                    <LayoutGrid className="size-7" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">{selectedSchool.name}</CardTitle>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/60 opacity-60">Classification & Capacity Control</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button variant="outline" className="h-12 rounded-2xl border-none bg-background shadow-sm hover:bg-primary/5 font-black uppercase tracking-widest text-[9px] px-6 flex-1 sm:flex-none" onClick={addClass}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Class
                                </Button>
                                <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20 flex-1 sm:flex-none" onClick={onSave} disabled={saving}>
                                    {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Sync Registry
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Class Identity</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Authorized Slots</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Occupancy Node</TableHead>
                                            <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em]">Operations</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classes.map((cls) => (
                                            <TableRow key={cls.id} className="group hover:bg-muted/30 border-b border-muted-foreground/5 last:border-none transition-colors">
                                                <TableCell className="pl-10 py-6">
                                                    <Input
                                                        value={cls.name}
                                                        onChange={(e) => onClassChange(cls.id, 'name', e.target.value)}
                                                        placeholder="Class Identifier"
                                                        className="h-12 rounded-xl bg-muted/30 border-none font-black px-6 focus:bg-background transition-all uppercase text-xs"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center">
                                                        <Input
                                                            type="number"
                                                            value={cls.slots}
                                                            onChange={(e) => onClassChange(cls.id, 'slots', e.target.value)}
                                                            className="h-12 w-24 rounded-xl bg-muted/30 border-none font-black text-center focus:bg-background transition-all"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-black text-primary tracking-tighter">{cls.students_count} / {cls.slots}</span>
                                                        <Badge variant="outline" className={cn(
                                                            "text-[8px] font-black uppercase border-none px-2",
                                                            cls.students_count >= cls.slots ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                                                        )}>
                                                            {cls.students_count >= cls.slots ? 'Full Capacity' : 'Available'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-10">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100" onClick={() => deleteClass(cls.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {classes.length === 0 && (
                                            <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic font-medium uppercase text-[10px] tracking-widest opacity-30">No educational classifications established for this unit.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
}
