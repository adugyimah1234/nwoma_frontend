/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateUserPayload } from '@/services/users';
import { 
  User,
  Mail,
  Phone,
  LogOut,
  Building2,
  ShieldCheck,
  Save,
  Loader2,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserPayload>({
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    full_name: user?.full_name || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      full_name: user?.full_name || '',
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedFields: UpdateUserPayload = {};
      if (formData.email !== user?.email) updatedFields.email = formData.email;
      if (formData.phone_number !== user?.phone_number) updatedFields.phone_number = formData.phone_number;

      if (Object.keys(updatedFields).length === 0) {
        setIsEditing(false);
        setIsSubmitting(false);
        return;
      }

      await updateUserProfile(updatedFields);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your account information and preferences."
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Profile' }]}
      />

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="border shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 border-2">
                <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg leading-none">{user.full_name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary" className="px-2 font-medium">
                {user.role?.replace('_', ' ') || 'User'}
              </Badge>
            </CardContent>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </Card>

          <Card className="border shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security
              </div>
              <p className="text-xs text-muted-foreground leading-normal">
                Your account is secured with role-based access control.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="border shadow-sm">
            <form onSubmit={handleSubmit}>
              <CardHeader className="border-b bg-slate-50/30 dark:bg-slate-900/30">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your email and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                      <Input id="full_name" value={user.full_name} disabled className="pl-9 bg-muted/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={cn("pl-9", !isEditing && "bg-muted/50")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        placeholder="Not provided"
                        className={cn("pl-9", !isEditing && "bg-muted/50")}
                      />
                    </div>
                  </div>

                  {user.school_id && (
                    <div className="space-y-2">
                      <Label>Assigned School</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                        <Input value={user.school_name || user.school_id} disabled className="pl-9 bg-muted/50" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t py-4">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button type="button" size="sm" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Account Privacy</CardTitle>
              <CardDescription>Your information is only visible to system administrators.</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-4 rounded-md border p-4 bg-muted/20">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Confidential Registry</p>
                  <p className="text-xs text-muted-foreground">Your record is part of the verified garrison network.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

