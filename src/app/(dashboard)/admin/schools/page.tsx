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
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import schoolService from '@/services/schools';

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
  const { toast } = useToast();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const data = await schoolService.getAll();
      setSchools(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to fetch schools", variant: "destructive" });
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
        toast({ title: "Success", description: "School updated successfully" });
      } else {
        await schoolService.create(values);
        toast({ title: "Success", description: "School created successfully" });
      }
      setIsAddingSchool(false);
      setEditingSchool(null);
      form.reset();
      await fetchSchools();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save school", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await schoolService.delete(String(id));
      toast({ title: "Success", description: "School deleted successfully" });
      fetchSchools();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
          <Dialog open={isAddingSchool} onOpenChange={setIsAddingSchool}>
            <DialogTrigger asChild>
              <Button className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-primary p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Building2 className="size-32" /></div>
                  <DialogHeader className="relative z-10 space-y-2">
                      <Badge className="w-fit bg-white/20 text-white border-none font-black text-[10px] tracking-[0.2em] px-4 py-1.5 uppercase">Network Node</Badge>
                      <DialogTitle className="text-3xl font-black tracking-tighter uppercase">{editingSchool ? 'Edit Unit' : 'New Unit'}</DialogTitle>
                  </DialogHeader>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Unit Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Garrison Basic School" className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 focus:bg-background transition-all" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Email</FormLabel>
                            <FormControl><Input {...field} type="email" placeholder="admin@node.com" className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 focus:bg-background transition-all" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Phone</FormLabel>
                            <FormControl><Input {...field} placeholder="+233..." className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 focus:bg-background transition-all" /></FormControl>
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Geographic Address</FormLabel>
                        <FormControl><Input placeholder="Building No. / Location" className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 focus:bg-background transition-all" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-6 gap-3">
                    <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => {
                      setIsAddingSchool(false);
                      setEditingSchool(null);
                      form.reset();
                    }}>Abort</Button>
                    <Button type="submit" className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                      {editingSchool ? 'Update Node' : 'Initialize Node'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <Card className="border-none shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-10 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Unit Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Communications</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em]">Station Node</TableHead>
                    <TableHead className="text-right pr-10 text-[10px] font-black uppercase tracking-[0.2em]">Operations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground">Syncing Unit Registry...</TableCell></TableRow>
                  ) : schools.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground">No units established in the registry.</TableCell></TableRow>
                  ) : (
                    schools.map((school) => (
                      <TableRow key={school.id} className="group hover:bg-muted/30 border-b border-muted-foreground/5 last:border-none transition-colors">
                        <TableCell className="font-black text-sm tracking-tighter uppercase pl-10 py-6">
                            {school.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{school.email}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{school.phone_number || (school as any).phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-none bg-muted/50 px-3 py-1">
                            {school.address}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                          <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 transition-all"
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
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase">Unit Decommissioning</AlertDialogTitle>
                                  <AlertDialogDescription className="font-medium">
                                    Are you certain you wish to decommission <strong className="text-foreground">{school.name}</strong>? All associated data streams will be archived. This action is audited and irreversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="pt-6">
                                  <AlertDialogCancel className="rounded-xl font-bold">Abort</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(school.id)} className="bg-destructive hover:bg-destructive/90 text-white rounded-xl px-8 font-black uppercase tracking-widest text-[10px]">Confirm Decommission</AlertDialogAction>
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
