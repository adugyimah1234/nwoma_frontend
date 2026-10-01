'use client';

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 font-sans p-4 py-8">
      {/* Main Container Card */}
      <div className="w-full max-w-[1150px] min-h-[600px] flex bg-card rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-border relative">
        {/* Top Accent Bar (Brand Colors) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary z-20" />

        {/* Left Side: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between bg-card z-10 overflow-y-auto">
          {/* Logo (Centered, matching Login layout) */}
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-2">
              <div className="size-32 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Ghana Garrison Schools Crest"
                  width={100}
                  height={100}
                  priority
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full my-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-2">
                CHANGE PASSWORD
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Update your credentials to maintain institutional security.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">
                        Username <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={!!user?.username}
                          className="h-11 px-4 rounded-xl border-input focus-visible:ring-primary"
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">
                        Current Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your current password"
                          {...field}
                          className="h-11 px-4 rounded-xl border-input focus-visible:ring-primary"
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">
                        New Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Choose a strong password"
                          {...field}
                          className="h-11 px-4 rounded-xl border-input focus-visible:ring-primary"
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground ml-1">
                        Confirm New Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-type new password"
                          {...field}
                          className="h-11 px-4 rounded-xl border-input focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full h-12 rounded-xl text-base font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all mt-2"
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Footer Navigation & Help */}
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground tracking-tight">
              Remember your credentials? <Link href="/login" className="text-foreground hover:underline underline-offset-4 font-bold">Back to Login</Link>
            </p>
          </div>
        </div>

        {/* Right Side: Image & Branding Overlay Section */}
        <div className="hidden md:flex md:w-1/2 relative items-center justify-center overflow-hidden bg-slate-950">
          <Image
            src="/login-bg.jpg"
            alt="School Campus"
            fill
            className="object-cover opacity-90"
            priority
          />
          {/* Bottom Dark Gradient for high image clarity + legible text */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Content overlay at bottom */}
          <div className="relative z-10 p-8 md:p-12 text-white flex flex-col justify-end h-full w-full">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/30 border border-primary/40 text-primary-foreground text-xs font-bold uppercase tracking-wider backdrop-blur-md w-fit mb-1">
                Account Security
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight drop-shadow">
                Institutional Credential Governance
              </h2>
              <p className="text-xs lg:text-sm text-slate-200 font-normal leading-relaxed max-w-md drop-shadow-sm">
                Regularly update your security credentials to protect administrative data and maintain system integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
