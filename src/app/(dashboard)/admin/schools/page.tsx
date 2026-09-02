'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { School as SchoolType } from '@/types/school';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import schoolService from '@/services/schools';
import { cn } from '@/lib/utils';

const schoolFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export default function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const data = await schoolService.getAll();
      setSchools(data);
    } catch (error: any) {
      toast.error("Failed to fetch schools");
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone_number: "",
      email: "",
    }
  });
  
  const onSubmit: SubmitHandler<SchoolFormValues> = async (values) => {
    try {
      setIsLoading(true);
      if (editingSchool) {
        await schoolService.update(editingSchool.id, values);
        toast.success("School updated successfully");
      } else {
        await schoolService.create(values);
        toast.success("School created successfully");
      }
      setIsAddingSchool(false);
      setEditingSchool(null);
      form.reset();
      await fetchSchools();
    } catch (error: any) {
      toast.error("Failed to save school");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await schoolService.delete(String(id));
      toast.success("School deleted successfully");
      fetchSchools();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete school");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24">
        <PageHeader
          title="Institutional Setup"
          description="Manage school branches and network campuses."
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Admin', href: '/admin' },
            { title: 'Schools' }
          ]}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchSchools} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} /> Refresh
            </Button>
            <Dialog open={isAddingSchool} onOpenChange={setIsAddingSchool}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
                  <DialogDescription>
                    Enter the details of the institutional unit below.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Garrison Basic School" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl><Input {...field} type="email" placeholder="admin@school.com" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl><Input {...field} placeholder="+233..." /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physical Address</FormLabel>
                          <FormControl><Input placeholder="Location / Station" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddingSchool(false);
                        setEditingSchool(null);
                        form.reset();
                      }}>Cancel</Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        {editingSchool ? 'Update School' : 'Add School'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </PageHeader>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-lg font-semibold">Institutional Units</CardTitle>
            <CardDescription>Directory of all registered school branches.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Unit Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && schools.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">Loading units...</TableCell></TableRow>
                  ) : schools.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No units found.</TableCell></TableRow>
                  ) : (
                    schools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium pl-6">
                            {school.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-primary">{school.email}</span>
                            <span className="text-muted-foreground">{school.phone_number || (school as any).phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal text-[10px] uppercase">
                            {school.address}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => {
                                  setEditingSchool(school);
                                  form.reset({
                                    name: school.name,
                                    address: school.address,
                                    phone_number: school.phone_number || (school as any).phone,
                                    email: school.email,
                                  });
                                  setIsAddingSchool(true);
                                }}
                            >
                                <Edit className="size-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete School?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong className="text-foreground">{school.name}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(school.id)} className="bg-destructive hover:bg-destructive/90 text-white">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
