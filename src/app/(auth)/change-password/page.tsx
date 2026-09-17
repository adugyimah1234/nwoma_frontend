'use client';

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ChevronLeft, KeyRound } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/services/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from "next/image";

const passwordFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ChangePasswordPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof passwordFormSchema>) {
    try {
      setIsUpdating(true);
      await changePassword({
        username: data.username,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password changed successfully");
      form.reset();
      if (user) {
        router.push('/');
      } else {
        router.push('/login');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F1F5F9] dark:bg-[#F1F5F9] font-sans overflow-hidden p-4">
      {/* Main Container Card */}
      <div className="w-full max-w-[1200px] h-full max-h-[720px] flex bg-white dark:bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-200">
        
        {/* Left Side: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white dark:bg-white overflow-y-auto">
          {/* Logo and Name at the top */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-[#5C59E8] rounded-xl flex items-center justify-center shadow-md">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="brightness-0 invert"
                />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900">Garrison Admin</h2>
            </div>
            <Link
              href={user ? "/" : "/login"}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-900 transition-colors border border-slate-200 dark:border-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-50 group"
            >
              <ChevronLeft className="size-4" />
              Back
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[420px] mx-auto w-full py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-900 mb-2 tracking-tight">Change Password</h1>
              <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">Update your credentials to maintain institutional security.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-700">
                        Username <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          placeholder="Enter your username"
                          {...field}
                          disabled={!!user?.username}
                          className="w-full h-11 px-4 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400 disabled:bg-slate-50 dark:disabled:bg-slate-50"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-700">
                        Current Password <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="password"
                          placeholder="Enter your current password"
                          {...field}
                          className="w-full h-11 px-4 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-700">
                        New Password <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="password"
                          placeholder="Choose a strong password"
                          {...field}
                          className="w-full h-11 px-4 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-700">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="password"
                          placeholder="Re-type new password"
                          {...field}
                          className="w-full h-11 px-4 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 dark:text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-400"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full h-12 rounded-lg text-base font-bold bg-[#5C59E8] hover:bg-[#4E4BCB] text-white dark:text-white shadow-sm transition-all active:scale-[0.98] border-none mt-4"
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Side: Image Section */}
        <div className="hidden md:flex md:w-1/2 bg-black relative items-center justify-center overflow-hidden">
          {/* Placeholder for uploaded image - replace src with your image */}
          <Image
            src="/change-password-bg.jpg"
            alt="Security"
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>
    </div>
  );
}
