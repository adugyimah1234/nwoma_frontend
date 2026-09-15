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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import settingService, { Setting } from '@/services/settings';
import { Label } from '@/components/ui/label';

const SETTING_GROUPS = [
  { id: 'fee_types', name: 'Fee Types' },
  { id: 'jersey_sizes', name: 'Jersey Sizes' },
  { id: 'genders', name: 'Genders' },
  { id: 'roles', name: 'User Roles' },
];

export default function GeneralSettings() {
  const [selectedGroup, setSelectedGroup] = useState<string>(SETTING_GROUPS[0].id);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const { toast } = useToast();

  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [selectedGroup]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingService.getByGroup(selectedGroup);
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch settings',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (setting?: Setting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormKey(setting.setting_key);
      const val = setting.setting_value as any;
      if (val && typeof val === 'object' && val.label !== undefined) {
        setFormValue(val.label);
      } else {
        setFormValue(typeof val === 'string' ? val : JSON.stringify(val));
      }
    } else {
      setEditingSetting(null);
      setFormKey('');
      setFormValue('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formKey.trim() || !formValue.trim()) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }

    try {
      let parsedValue;
      if (formValue.trim().startsWith('{')) {
        try {
          parsedValue = JSON.parse(formValue);
        } catch (e) {
          toast({ title: 'Error', description: 'Invalid JSON format', variant: 'destructive' });
          return;
        }
      } else {
        parsedValue = { label: formValue.trim() };
      }

      if (editingSetting && editingSetting.id) {
        await settingService.update(editingSetting.id, {
          setting_group: selectedGroup,
          setting_key: formKey,
          setting_value: parsedValue
        });
        toast({ title: 'Success', description: 'Setting updated successfully' });
      } else {
        await settingService.create({
          setting_group: selectedGroup,
          setting_key: formKey,
          setting_value: parsedValue
        });
        toast({ title: 'Success', description: 'Setting created successfully' });
      }
      setIsDialogOpen(false);
      fetchSettings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save setting', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this setting?")) {
      try {
        await settingService.delete(id);
        toast({ title: 'Success', description: 'Setting deleted successfully' });
        fetchSettings();
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to delete setting', variant: 'destructive' });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage dynamic application lists and configurations.</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Setting
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Configuration Group:</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {SETTING_GROUPS.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Identifier</TableHead>
                <TableHead>Display Label</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground italic text-sm">Loading...</TableCell>
                </TableRow>
              ) : settings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground italic text-sm">No settings found in this group.</TableCell>
                </TableRow>
              ) : (
                settings.map((setting) => {
                  const val = setting.setting_value as any;
                  const displayValue = (val && typeof val === 'object' && val.label) ? val.label : JSON.stringify(val);

                  return (
                    <TableRow key={setting.id}>
                      <TableCell className="font-mono text-xs">{setting.setting_key}</TableCell>
                      <TableCell className="text-sm font-medium">{displayValue}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(setting)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setting.id && handleDelete(setting.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSetting ? 'Edit Setting' : 'Add New Setting'}</DialogTitle>
            <DialogDescription>Enter the reference key and display name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="setting-key">Reference Key (Unique ID)</Label>
              <Input 
                id="setting-key"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)} 
                placeholder="e.g. MALE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-label">Display Label (User Visible)</Label>
              <Input
                id="display-label"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="e.g. Male"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

