'use client';

import { useEffect, useState } from 'react';
import { type Assessment, type CreateAssessmentInput } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createAssessment, deleteAssessment, getAssessments } from '@/services/assessment';
import { PageHeader } from '@/components/layout/page-header';
import { getAllCategories, Category } from '@/services/categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import classService from '@/services/class';
import { ClassData } from '@/services/class';
import schoolService from '@/services/schools';
import { School } from '@/types/school';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    MapPin,
    Trash2,
    BookOpen,
    Layers,
    Info,
    LayoutGrid,
    Users
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AssessmentManagement() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    school_id: 'all', // Default to all schools
    class_id: 'all',   // Default to all classes
    category_id: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentData, catData, classData, schoolData] = await Promise.all([
        getAssessments(),
        getAllCategories(),
        classService.getAll(),
        schoolService.getAll()
      ]);
      setAssessments(assessmentData);
      setCategories(catData);
      setClasses(classData);
      setSchools(schoolData);
    } catch (err) {
      toast.error('Registry sync failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.date || !formData.category_id) {
      toast.error('Primary parameters missing.');
      return;
    }

    try {
      const payload: CreateAssessmentInput = {
        name: formData.name,
        date: formData.date,
        venue: formData.venue,
        school_id: formData.school_id === 'all' ? undefined : formData.school_id,
        class_id: formData.class_id === 'all' ? undefined : formData.class_id,
        category_id: formData.category_id,
      };

      await createAssessment(payload);
      toast.success('Entrance assessment scheduled.');
      setFormData({
          name: '',
          date: '',
          venue: '',
          school_id: 'all',
          class_id: 'all',
          category_id: formData.category_id
      });
      loadData();
    } catch (err) {
      toast.error('Protocol rejected.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this assessment session?")) return;
    try {
      await deleteAssessment(id);
      toast.success('Assessment session purged.');
      loadData();
    } catch (err) {
      toast.error('Purge failed.');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Entrance Assessment Registry"
        description="Schedule and regulate placement evaluations across the garrison network."
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin', href: '/admin' },
          { title: 'Assessments' }
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Creation Form - Refactored to remove card and shadow */}
        <div className="lg:col-span-5 h-fit bg-muted/20 rounded-[2.5rem] p-8 sm:p-10 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter">Schedule Assessment</h2>
            <p className="text-sm text-muted-foreground font-medium">Configure the scope and details of the evaluation.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Assessment Identifier</Label>
              <Input
                placeholder="e.g. 2025/2026 General Entrance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="font-bold h-14 rounded-2xl bg-background border-none shadow-sm px-6"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Evaluation Date</Label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-12 h-14 rounded-2xl bg-background border-none shadow-sm font-bold"
                    />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Evaluation Venue</Label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                        placeholder="e.g. Garrison Hall"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="pl-12 h-14 rounded-2xl bg-background border-none shadow-sm font-bold"
                    />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-muted-foreground/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutGrid className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em]">Operational Scope</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">School Jurisdiction</Label>
                  <Select
                    value={formData.school_id}
                    onValueChange={(val) => setFormData({...formData, school_id: val})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-background border-none shadow-sm font-bold px-6">
                      <SelectValue placeholder="Select Scope" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="font-bold text-primary">All Garrison Schools</SelectItem>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Target Level</Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(val) => setFormData({...formData, class_id: val})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-background border-none shadow-sm font-bold px-6">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="font-bold text-primary">All Classes / Levels</SelectItem>
                      {classes
                        .filter(c => formData.school_id === 'all' || String(c.school_id) === String(formData.school_id))
                        .map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Financial Category Link</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) => setFormData({...formData, category_id: val})}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-background border-none shadow-sm font-bold px-6">
                    <SelectValue placeholder="Link to Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-primary/80 leading-relaxed uppercase tracking-widest">
                    Assessments set to "All Schools" or "All Levels" will automatically appear on the registration receipts for any applicant within that scope.
                </p>
            </div>

            <Button className="w-full h-16 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={handleCreate}>
                Finalize Assessment Schedule
            </Button>
          </div>
        </div>

        {/* List of Assessments */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Active Sessions</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Scheduled: {assessments.length}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData} className="text-muted-foreground">
                Refresh Registry
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-28 bg-muted/10 animate-pulse rounded-[2rem]" />)}
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-[3rem] bg-muted/5 text-center px-10">
              <div className="size-20 bg-muted/20 rounded-[2rem] flex items-center justify-center mb-6">
                  <Calendar className="size-10 text-muted-foreground opacity-30" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter">No Active Sessions</h4>
              <p className="text-sm text-muted-foreground max-w-xs mt-2 font-medium">Establish a new entrance assessment session using the tactical control panel on the left.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="group relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-[2rem] translate-y-2 translate-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="relative z-10 p-6 flex items-center justify-between bg-background border border-muted-foreground/10 rounded-[2rem] transition-all group-hover:-translate-y-1">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center justify-center size-20 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                    {assessment.date ? new Date(assessment.date).toLocaleDateString('en-US', { month: 'short' }) : '??'}
                                </span>
                                <span className="text-3xl font-black tracking-tighter leading-none">
                                    {assessment.date ? new Date(assessment.date).toLocaleDateString('en-US', { day: 'numeric' }) : '--'}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <h4 className="text-lg font-black tracking-tight uppercase">{assessment.name}</h4>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        <MapPin className="size-3.5 text-primary" /> {assessment.venue || 'TBD'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        <Users className="size-3.5 text-primary" /> {categories.find(c => c.id === assessment.category_id)?.code || 'GEN'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-3">
                                    <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] tracking-widest px-3 py-1">
                                        {!assessment.school_id ? 'GLOBAL COMMAND' : schools.find(s => s.id === assessment.school_id)?.name}
                                    </Badge>

                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-muted-foreground/20 px-3 py-1">
                                        {!assessment.class_id ? 'ALL UNITS' : classes.find(c => c.id === assessment.class_id)?.name}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-12 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all rounded-2xl"
                            onClick={() => handleDelete(assessment.id)}
                        >
                            <Trash2 className="size-5" />
                        </Button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
