'use client';

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Role, getAllRoles, createRole, deleteRole } from '@/services/roles';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { PageHeader } from "@/components/layout/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { GuidedTour } from "@/components/tour/GuidedTour";
import { Step } from "react-joyride";

const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function RolesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Block all access as per request
    router.replace('/');
  }, [router]);

  const tourSteps: Step[] = [
    {
      target: '#tour-roles-table',
      title: 'Access Control',
      content: 'This table shows all the defined roles in the system. Roles determine what actions users can perform.',
      placement: 'top',
    },
    {
      target: '#tour-add-role',
      title: 'New Permissions',
      content: 'Click here to create a new role if you need a specific set of permissions for a new staff member.',
      placement: 'left',
    },
  ];

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRoles();
      setRoles(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: RoleFormValues) => {
    try {
      setIsLoading(true);
      await createRole(values);
      toast({ title: "Success", description: "Role created successfully" });
      fetchRoles();
      form.reset();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      await fetchRoles();
      toast({ title: "Success", description: "Role deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete role", variant: "destructive" });
    }
  };

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      header: 'Role Name',
      cell: (row) => <Badge variant="secondary" className="font-mono">{row.name}</Badge>,
    },
    {
      key: 'description',
      header: 'Description',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.description || '—'}</span>,
    },
    {
      key: 'id',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the <strong>{row.name}</strong> role? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteRole(row.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  const toolbar = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" id="tour-add-role">
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. accountant" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} placeholder="Describe what this role can do" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage system access levels"
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin', href: '/admin' },
          { title: 'Roles' }
        ]}
      />

      <Card id="tour-roles-table">
        <CardContent className="p-6">
          <DataTable
            data={roles as any}
            columns={columns as any}
            searchKey="name"
            searchPlaceholder="Search roles..."
            toolbar={toolbar}
            loading={isLoading}
            emptyMessage="No roles found."
            rowKey="id"
          />
        </CardContent>
      </Card>

      <GuidedTour steps={tourSteps} run={true} />
    </div>
  );
}

