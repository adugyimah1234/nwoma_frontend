/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { register } from '@/services/auth';
import { RegisterPayload } from '@/services/auth';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const CreateUserPage = () => {
  const [formData, setFormData] = useState<RegisterPayload>({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: '',
    school_id: null,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const registerPayload: RegisterPayload = {
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        school_id: formData.school_id
      };

      const response = await register(registerPayload);
      setMessage(typeof response === 'string' ? response : 'User created successfully.');
      setFormData({ full_name: '', email: '', username: '', password: '', role: '', school_id: null });
    } catch (err: any) {
      setError(err.message || 'Could not create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
        <PageHeader
          title="Create New User"
          description="Provision a new system user account"
          breadcrumbs={[
            { title: 'Home', href: '/' },
            { title: 'Settings', href: '/settings' },
            { title: 'Create User' }
          ]}
        />

        <div className="max-w-lg">
          {message && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" />
                User Details
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new user account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="e.g. John Mensah"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="e.g. john.mensah"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                    required
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="frontdesk">Front Desk</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Creating User...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default CreateUserPage;