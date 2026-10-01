'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';
import Image from "next/image";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ProfessionalLogin() {
  const { signIn, error: authError } = useAuth();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [portalRole, setPortalRole] = useState<'staff' | 'parent'>('staff');
  const [localError, setLocalError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('expired')) {
      setLocalError("Your session has expired. Please log in again.");
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setLocalError(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown) return;
    setLocalError(null);
    setSocialLoading(true);

    try {
      await signIn(username, password);
      router.push('/');
    } catch (err: any) {
      if (err.status === 429) {
        setCountdown(err.retryAfter || 60);
        setLocalError(`Too many attempts. ${err.retryAfter || 60}s lock.`);
      } else {
        setLocalError(err?.response?.data?.message || err?.message || 'Invalid credentials.');
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 font-sans p-4 py-8">
      {/* Main Container Card */}
      <div className="w-full max-w-[1150px] min-h-[600px] flex bg-card rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-border relative">
        {/* Top Accent Bar (Brand Colors) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary z-20" />

        {/* Left Side: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between bg-card z-10">
          {/* Logo and Academic Year Banner */}
          <div className="flex flex-col items-center justify-center mb-1">
            <div className="size-28 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Ghana Garrison Schools Crest"
                width={90}
                height={90}
                priority
              />
            </div>
            {/* Academic Year Indicator Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-foreground text-[11px] font-semibold mt-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              2024/2025 Academic Year • Term 1
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full my-4">
            <div className="text-center mb-5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 text-foreground">
                PORTAL LOGIN
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {portalRole === 'staff'
                  ? 'Enter credentials to access administrative workspace.'
                  : 'Enter Student ID or Parent Phone number.'}
              </p>
            </div>

            {/* Role / Portal Switcher */}
            <div className="flex bg-muted p-1 rounded-xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPortalRole('staff');
                  if (localError) setLocalError(null);
                }}
                className={cn(
                  "flex-1 py-2 rounded-lg transition-all text-center font-bold",
                  portalRole === 'staff' ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Staff & Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalRole('parent');
                  if (localError) setLocalError(null);
                }}
                className={cn(
                  "flex-1 py-2 rounded-lg transition-all text-center font-bold",
                  portalRole === 'parent' ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Parents & Students
              </button>
            </div>

            {(localError || authError) && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive"
              >
                <ShieldCheck className="size-4 shrink-0" />
                <p className="text-xs font-semibold">{localError || authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-1">
                  {portalRole === 'staff' ? 'Username or Email' : 'Student ID / Parent Phone'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={!!countdown || socialLoading}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="h-11 px-4 rounded-xl border-input focus-visible:ring-primary"
                  placeholder={portalRole === 'staff' ? 'Enter username or email' : 'e.g. STU-2024-001'}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground ml-1">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={!!countdown || socialLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (localError) setLocalError(null);
                    }}
                    className="h-11 px-4 pr-12 rounded-xl border-input focus-visible:ring-primary"
                    placeholder="Type your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                    Keep me logged in
                  </Label>
                </div>
                <Link
                  href="/change-password"
                  className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={socialLoading || !!countdown}
                className="w-full h-11 rounded-xl text-base font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all mt-1"
              >
                {socialLoading ? (
                  <Loader className="animate-spin" />
                ) : countdown ? (
                  `Locked (${countdown}s)`
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>

          {/* Footer Navigation & Help */}
          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-muted-foreground tracking-tight">
              System Help: <Link href="/guide" className="text-foreground hover:underline underline-offset-4 font-bold">User Manual</Link>
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
                Ghana Garrison Schools
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight drop-shadow">
                Integrated School Management System
              </h2>
              <p className="text-xs lg:text-sm text-slate-200 font-normal leading-relaxed max-w-md drop-shadow-sm">
                Streamlining academic governance, treasury management, and student records across all garrison units.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
