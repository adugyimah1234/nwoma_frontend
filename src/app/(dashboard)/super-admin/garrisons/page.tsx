'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  UserCheck,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getAllGarrisons,
  createGarrison,
  updateGarrison,
  deleteGarrison,
  getGarrisonDirectors,
  createGarrisonDirector,
  Garrison,
  GarrisonDirectorUser,
} from '@/services/superAdmin';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { toast } from 'sonner';

export default function GarrisonsManagementPage() {
  const [garrisons, setGarrisons] = useState<Garrison[]>([]);
  const [directors, setDirectors] = useState<GarrisonDirectorUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isGarrisonDialogOpen, setIsGarrisonDialogOpen] = useState(false);
  const [isDirectorDialogOpen, setIsDirectorDialogOpen] = useState(false);
  const [editingGarrison, setEditingGarrison] = useState<Garrison | null>(null);
  const [deletingGarrisonId, setDeletingGarrisonId] = useState<string | null>(null);

  // Form States
  const [garrisonForm, setGarrisonForm] = useState({ name: '', code: '', location: '' });
  const [newDirector, setNewDirector] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    garrison_id: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchGarrisonData = async () => {
    setLoading(true);
    try {
      const [garrisonRes, directorRes] = await Promise.all([
        getAllGarrisons(),
        getGarrisonDirectors(),
      ]);
      setGarrisons(garrisonRes);
      setDirectors(directorRes);
    } catch (err: any) {
      toast.error('Failed to load management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarrisonData();
  }, []);

  const handleOpenGarrisonDialog = (garrison?: Garrison) => {
    if (garrison) {
      setEditingGarrison(garrison);
      setGarrisonForm({
          name: garrison.name,
          code: garrison.code || '',
          location: garrison.location || ''
      });
    } else {
      setEditingGarrison(null);
      setGarrisonForm({ name: '', code: '', location: '' });
    }
    setIsGarrisonDialogOpen(true);
  };

  const handleGarrisonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!garrisonForm.name) return;
    setSubmitting(true);
    try {
      if (editingGarrison) {
        await updateGarrison(String(editingGarrison.id), garrisonForm);
        toast.success('Garrison profile updated.');
      } else {
        await createGarrison(garrisonForm);
        toast.success('Garrison unit commissioned.');
      }
      setIsGarrisonDialogOpen(false);
      fetchGarrisonData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGarrison = async () => {
    if (!deletingGarrisonId) return;
    try {
      await deleteGarrison(deletingGarrisonId);
      toast.success('Garrison decommissioned successfully.');
      fetchGarrisonData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete garrison.');
    } finally {
      setDeletingGarrisonId(null);
    }
  };

  const handleCreateDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirector.full_name || !newDirector.username || !newDirector.password || !newDirector.garrison_id) {
      toast.error('Complete all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await createGarrisonDirector({
        full_name: newDirector.full_name,
        username: newDirector.username,
        email: newDirector.email,
        password: newDirector.password,
        garrison_id: newDirector.garrison_id,
      });
      toast.success('Garrison Director registered.');
      setIsDirectorDialogOpen(false);
      setNewDirector({ full_name: '', username: '', email: '', password: '', garrison_id: '' });
      fetchGarrisonData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Account creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const garrisonColumns: DataTableColumn<Garrison>[] = [
    {
      key: 'name',
      header: 'Garrison Command',
      cell: (row) => (
        <div>
          <div className="font-bold text-foreground">{row.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">{row.code || 'NO_CODE'}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Headquarters',
      cell: (row) => <span className="text-xs">{row.location || 'Undisclosed'}</span>
    },
    {
      key: 'school_count',
      header: 'Units',
      className: 'text-center',
      cell: (row) => <Badge variant="secondary">{row.school_count || 0} Schools</Badge>
    },
    {
      key: 'director_name',
      header: 'Officer in Command',
      cell: (row) => (
        <div className="max-w-[200px] truncate">
          {row.director_name ? (
              <span className="text-xs font-semibold">{row.director_name}</span>
          ) : (
              <span className="text-[10px] italic text-muted-foreground">Vacant</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenGarrisonDialog(row)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setDeletingGarrisonId(String(row.id))}>
              <Trash2 className="mr-2 h-4 w-4" /> Decommission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const directorColumns: DataTableColumn<GarrisonDirectorUser>[] = [
    {
      key: 'full_name',
      header: 'Officer Name',
      cell: (row) => <div className="font-semibold">{row.full_name}</div>
    },
    { key: 'username', header: 'Access ID', cell: (row) => <span className="font-mono text-xs">{row.username}</span> },
    { key: 'garrison_name', header: 'Assigned Garrison', cell: (row) => <Badge variant="outline">{row.garrison_name || 'Unassigned'}</Badge> },
    { key: 'created_at', header: 'Registered', cell: (row) => new Date(row.created_at).toLocaleDateString() }
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        <PageHeader
          title="Command Units & Garrison Directors"
          description="Manage regional command structures and assign executive oversight."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Super Admin', href: '/super-admin' }, { title: 'Garrisons' }]}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchGarrisonData} className="rounded-full h-9">
              <RefreshCw className="mr-2 h-4 w-4" /> Sync
            </Button>
            <Button size="sm" onClick={() => handleOpenGarrisonDialog()} className="rounded-full h-9">
              <Plus className="mr-2 h-4 w-4" /> Commission Garrison
            </Button>
          </div>
        </PageHeader>

        {/* Garrisons Registry Table */}
        <Card className="shadow-sm mb-10">
            <CardContent className="p-6">
                <DataTable
                  data={garrisons as any[]}
                  columns={garrisonColumns as any}
                  searchPlaceholder="Search command units..."
                  searchKey="name"
                  rowKey="id"
                  loading={loading}
                />
            </CardContent>
        </Card>

        {/* Directors Directory */}
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
                <Card className="shadow-sm overflow-hidden h-full">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Officer Directory</CardTitle>
                                <CardDescription className="text-xs">Executive personnel with Garrison command access.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setIsDirectorDialogOpen(true)}>
                                <UserPlus className="h-4 w-4 mr-2" /> Register Officer
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <DataTable
                            data={directors as any[]}
                            columns={directorColumns as any}
                            rowKey="id"
                            loading={loading}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-4">
                 <Card className="h-full relative overflow-hidden border-none shadow-sm bg-muted/30">
                    <CardHeader className="border-b bg-muted/10">
                        <CardTitle className="text-base font-bold">System Intelligence</CardTitle>
                        <CardDescription>Registry Health Status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <span className="text-sm font-medium text-muted-foreground">Active Commands</span>
                            <span className="text-2xl font-bold text-foreground">{garrisons.length}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-4">
                            <span className="text-sm font-medium text-muted-foreground">Officers in Field</span>
                            <span className="text-2xl font-bold text-foreground">{directors.length}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-background border text-[11px] text-muted-foreground leading-relaxed shadow-inner">
                            <div className="flex gap-2 items-start text-primary">
                                <ShieldCheck className="size-3 mt-0.5 shrink-0" />
                                <span>Administrators assigned at the Garrison level have full oversight of all school units within that Battalion's jurisdiction.</span>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>

        {/* Garrison Form Dialog */}
        <Dialog open={isGarrisonDialogOpen} onOpenChange={setIsGarrisonDialogOpen}>
            <DialogContent>
                <form onSubmit={handleGarrisonSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingGarrison ? 'Update Command Profile' : 'Commission New Garrison'}</DialogTitle>
                        <DialogDescription>Define the regional command unit parameters.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label>Garrison Unit Name *</Label>
                            <Input
                                value={garrisonForm.name}
                                onChange={(e) => setGarrisonForm({...garrisonForm, name: e.target.value})}
                                placeholder="e.g. 3 Infantry Battalion (3BN)"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Command Code</Label>
                                <Input
                                    value={garrisonForm.code}
                                    onChange={(e) => setGarrisonForm({...garrisonForm, code: e.target.value})}
                                    placeholder="3GAR"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Base Location</Label>
                                <Input
                                    value={garrisonForm.location}
                                    onChange={(e) => setGarrisonForm({...garrisonForm, location: e.target.value})}
                                    placeholder="Sunyani"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsGarrisonDialogOpen(false)}>Discard</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Processing...' : (editingGarrison ? 'Update Unit' : 'Commission Unit')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Director Registration Dialog */}
        <Dialog open={isDirectorDialogOpen} onOpenChange={setIsDirectorDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreateDirector}>
                    <DialogHeader>
                        <DialogTitle>Register Garrison Director</DialogTitle>
                        <DialogDescription>Grant command-level access to a specific battalion unit.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label>Target Command *</Label>
                            <Select value={newDirector.garrison_id} onValueChange={(val) => setNewDirector({...newDirector, garrison_id: val})} required>
                                <SelectTrigger><SelectValue placeholder="Select Garrison" /></SelectTrigger>
                                <SelectContent>
                                    {garrisons.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><Label>Officer Full Name *</Label><Input value={newDirector.full_name} onChange={(e) => setNewDirector({...newDirector, full_name: e.target.value})} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Username *</Label><Input value={newDirector.username} onChange={(e) => setNewDirector({...newDirector, username: e.target.value})} required /></div>
                            <div className="grid gap-2"><Label>Official Email</Label><Input type="email" value={newDirector.email} onChange={(e) => setNewDirector({...newDirector, email: e.target.value})} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Access Password *</Label><Input type="password" value={newDirector.password} onChange={(e) => setNewDirector({...newDirector, password: e.target.value})} required /></div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Registering...' : 'Complete Registration'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingGarrisonId} onOpenChange={() => setDeletingGarrisonId(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Decommission Command Unit?</AlertDialogTitle>
                    <AlertDialogDescription>This action will purge the Garrison record from the network. It cannot be undone if the unit is decommissioned.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abort</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteGarrison} className="bg-destructive text-destructive-foreground">Decommission Unit</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

