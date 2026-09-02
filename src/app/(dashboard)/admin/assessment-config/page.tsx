'use client';

import { useEffect, useState } from 'react';
import { type Assessment, type CreateAssessmentInput } from '@/types/assessment';
import { Button } from '@/components/ui/button';
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
    RefreshCw,
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
    <div className="flex flex-1 flex-col gap-8 p-6 bg-slate-50/50 dark:bg-slate-950/50 max-w-[1400px] mx-auto">
      <PageHeader
        title="Entrance Assessment Registry"
        description="Schedule and regulate placement evaluations across the school network."
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin', href: '/admin' },
          { title: 'Assessments' }
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Creation Form */}
        <div className="lg:col-span-5 h-fit bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Schedule Assessment</h2>
            <p className="text-sm text-muted-foreground">Configure the scope and details of the evaluation.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Assessment Name</Label>
              <Input
                placeholder="e.g. 2025/2026 General Entrance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Date</Label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-10 h-10 rounded-md"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Venue</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="e.g. School Hall"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="pl-10 h-10 rounded-md"
                    />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutGrid className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Operational Scope</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">School</Label>
                  <Select
                    value={formData.school_id}
                    onValueChange={(val) => setFormData({...formData, school_id: val})}
                  >
                    <SelectTrigger className="h-10 rounded-md">
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Class Level</Label>
                  <Select
                    value={formData.class_id}
                    onValueChange={(val) => setFormData({...formData, class_id: val})}
                  >
                    <SelectTrigger className="h-10 rounded-md">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
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

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) => setFormData({...formData, category_id: val})}
                >
                  <SelectTrigger className="h-10 rounded-md">
                    <SelectValue placeholder="Link to Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/10">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-[10px] font-medium text-primary/80 uppercase tracking-wider leading-relaxed">
                    Assessments set to "All Schools" or "All Levels" will appear on receipts for any applicant in that scope.
                </AlertDescription>
            </Alert>

            <Button className="w-full h-11 rounded-md font-semibold text-xs" onClick={handleCreate}>
                Schedule Assessment
            </Button>
          </div>
        </div>

        {/* List of Assessments */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center text-slate-600 shadow-sm">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Active Sessions</h3>
                    <p className="text-xs text-muted-foreground font-medium">Total Scheduled: {assessments.length}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData} className="text-muted-foreground h-9">
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl border" />)}
            </div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-xl bg-white/50 text-center px-10">
              <Calendar className="size-12 text-muted-foreground/20 mb-4" />
              <h4 className="text-lg font-bold">No Active Sessions</h4>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">Schedule a new entrance assessment session using the panel on the left.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="p-5 flex items-center justify-between bg-white dark:bg-slate-900 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center justify-center size-16 rounded-lg bg-primary text-white shadow-sm">
                            <span className="text-[10px] font-bold uppercase opacity-80">
                                {assessment.date ? new Date(assessment.date).toLocaleDateString('en-US', { month: 'short' }) : '??'}
                            </span>
                            <span className="text-2xl font-bold leading-none">
                                {assessment.date ? new Date(assessment.date).toLocaleDateString('en-US', { day: 'numeric' }) : '--'}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-base font-bold">{assessment.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <MapPin className="size-3 text-primary" /> {assessment.venue || 'TBD'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <Users className="size-3 text-primary" /> {categories.find(c => c.id === assessment.category_id)?.code || 'GEN'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="font-semibold text-[10px] px-2 py-0">
                                    {!assessment.school_id ? 'Global' : schools.find(s => s.id === assessment.school_id)?.name}
                                </Badge>

                                <Badge variant="outline" className="text-[10px] font-medium px-2 py-0">
                                    {!assessment.class_id ? 'All Classes' : classes.find(c => c.id === assessment.class_id)?.name}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md h-9 w-9"
                        onClick={() => handleDelete(assessment.id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
