'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, ChevronLeft, Timer, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';
import Image from "next/image";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfessionalLogin() {
  const { signIn, error: authError } = useAuth();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="h-screen w-full flex items-center justify-center bg-muted/30 font-sans overflow-hidden p-4">
      {/* Main Container Card */}
      <div className="w-full max-w-[1150px] h-full max-h-[680px] flex bg-card rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-border">

        {/* Left Side: Form Section */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col bg-card">
          <div>
            <Button variant="ghost" size="sm" asChild className="rounded-xl border border-border gap-2 text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ChevronLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Sign In</h1>
              <p className="text-sm text-muted-foreground font-medium">Welcome back! Please sign in to access your account.</p>
            </div>

            {(localError || authError) && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive">
                <ShieldCheck className="size-4" />
                <p className="text-xs font-semibold">{localError || authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  disabled={!!countdown || socialLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 px-5"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={!!countdown || socialLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-5 pr-12"
                    placeholder="Type your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2.5">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                    Keep me logged in
                  </Label>
                </div>
                <Link
                  href="/change-password"
                  className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                >
                  Forget Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={socialLoading || !!countdown}
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg"
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

            <div className="mt-8 text-center space-y-4">
              
              <p className="text-xs font-semibold text-muted-foreground tracking-tight">
                System Help: <Link href="/guide" className="text-foreground hover:underline underline-offset-4 font-bold">Operational Guide</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Branding Section */}
        <div className="hidden md:flex md:w-1/2 bg-primary relative items-center justify-center p-16 overflow-hidden">
          {/* Subtle Branding Background Pattern (Diagonal Stripes) */}
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, hsl(var(--primary-foreground)) 15px, hsl(var(--primary-foreground)) 17px)`
            }}
          />

          <div className="relative z-10 text-center text-primary-foreground space-y-10">
            <div className="flex items-center justify-center gap-4">
               <div className="size-14 bg-primary-foreground/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-primary-foreground/20 shadow-2xl">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={38}
                    height={38}
                    className="brightness-0 invert opacity-90"
                  />
               </div>
               <h2 className="text-4xl font-bold tracking-tight">
                 Garrison Admin
               </h2>
            </div>

            <div className="max-w-sm mx-auto space-y-5">
              <p className="text-lg font-medium opacity-80 tracking-tight leading-snug">
                
              </p>
              <h3 className="text-3xl font-bold leading-tight tracking-tight">
                <br /> 
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
