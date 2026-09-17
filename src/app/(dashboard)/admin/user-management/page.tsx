'use client';

import { useState, useEffect } from 'react';
import { User, getAllUsers, updateUser, createUser, deleteUser } from '@/services/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role, getAllRoles } from '@/services/roles';
import schoolService from '@/services/schools';
import { type School } from '@/types/school';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const userFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().optional(),
  role_id: z.string().min(1, "Role is required"),
  school_id: z.string().optional().nullable(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserManagement() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: "",
      username: "",
      password: "",
      role_id: "",
      school_id: null,
    }
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      let data = await schoolService.getAll();

      // Filter schools based on Garrison Director's scope
      const normalizedRole = user?.role?.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
      if (normalizedRole === 'garrisondirector' && user?.garrison_id) {
        data = data.filter(s => s.garrison_id === user.garrison_id);
      }

      setSchools(data);
    } catch (error) {
      console.error("Failed to fetch schools", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" });
    }
  };

  const handleStatusChange = async (user: User, status: 'active' | 'inactive') => {
    try {
      await updateUser(user.id, {
        username: user.username,
        full_name: user.full_name,
        password: '',
        role_id: user.role_id,
        status: status,
      });
      await fetchUsers();
      toast({ title: "Success", description: "User status updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setIsLoading(true);
      await deleteUser(userId);
      await fetchUsers();
      toast({ title: "User deleted", description: "User has been removed from the system" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsLoading(true);
      if (editingUser) {
        await updateUser(editingUser.id, {
          full_name: values.full_name,
          username: values.username,
          password: values.password || undefined,
          role_id: values.role_id,
          school_id: values.school_id || null,
        } as any);
        toast({ title: "Success", description: "User credentials updated successfully" });
      } else {
        await createUser(values as any);
        toast({ title: "Success", description: "User created successfully" });
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      form.reset();
      await fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit user data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'full_name',
      header: 'Full Name',
    },
    {
      key: 'username',
      header: 'Username',
    },
    {
      key: 'role_id',
      header: 'Role',
      cell: (u) => {
        const roleName = roles.find((role) => role.id === u.role_id)?.name || (u as any).role || 'User';
        const schoolName = u.school_id ? schools.find(s => s.id === u.school_id)?.name : null;
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant="secondary">{roleName}</Badge>
            {schoolName && <span className="text-xs text-muted-foreground font-medium">🏫 {schoolName}</span>}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => (
        <Badge
          variant={u.status === 'active' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => handleStatusChange(u, u.status === 'active' ? 'inactive' : 'active')}
        >
          {u.status || 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setEditingUser(u);
              form.reset({
                full_name: u.full_name,
                username: u.username,
                password: '',
                role_id: u.role_id,
                school_id: u.school_id || null,
              });
              setIsDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDeleteUserId(u.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
        <PageHeader 
          title="User Management"
          description="Manage administrative accounts and credentials."
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Admin', href: '/admin' },
            { title: 'Users' }
          ]}
        />
        
        <Card>
          <CardContent className="p-6">
            <DataTable
              data={users as any[]}
              columns={columns as any}
              searchPlaceholder="Search users..."
              searchKey="full_name"
              toolbar={(isAdmin || user?.role?.toLowerCase().replace(/_/g, '').replace(/\s/g, '') === 'schooladmin') && (
                <Button size="sm" onClick={() => {
                  setEditingUser(null);
                  form.reset({
                    full_name: "",
                    username: "",
                    password: "",
                    role_id: "",
                    school_id: user?.school_id || null,
                  });
                  setIsDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              )}
              rowKey="id"
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User Credentials' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modify administrative credentials for this user account.' : 'Add a new administrative user to the system.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles
                            .filter((role) => {
                              const normalizedRoleName = role.name?.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
                              const isSuperAdminRole = normalizedRoleName === 'superadmin';
                              const isSchoolAdminRole = normalizedRoleName === 'schooladmin';

                              const normalizedCurrentUserRole = user?.role?.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
                              const isCurrentUserSuperAdmin = normalizedCurrentUserRole === 'superadmin';
                              const isCurrentUserSchoolAdmin = normalizedCurrentUserRole === 'schooladmin';

                              // Super admins can create anything
                              if (isCurrentUserSuperAdmin) return true;

                              // School admins can NOT create super admins OR school admins
                              if (isCurrentUserSchoolAdmin) {
                                return !isSuperAdminRole && !isSchoolAdminRole;
                              }

                              // Default safeguard for any other potential role
                              return !isSuperAdminRole;
                            })
                            .map((role) => (
                              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="school_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned School (Optional)</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select school assignment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No School Assignment</SelectItem>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingUser ? 'Save Changes' : 'Create User'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!confirmDeleteUserId} onOpenChange={(open) => !open && setConfirmDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account
                for <strong>{users.find(u => u.id === confirmDeleteUserId)?.full_name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDeleteUserId && handleDelete(confirmDeleteUserId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

