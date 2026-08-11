'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon, ArrowRightIcon, Timer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';
import Image from "next/image";

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
        setLocalError(`Too many login attempts. Restricted for ${err.retryAfter || 60} seconds.`);
      } else {
        setLocalError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756c83f2d?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center">
        {/* Branding Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-6 drop-shadow-2xl">
            <Image
              src="/logo.png"
              alt="Garrison Schools Logo"
              width={120}
              height={120}
              className="w-24 h-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
            Ghana Garrison Schools
          </h1>
          <h2 className="text-xl font-medium text-gray-200 tracking-wide opacity-80">
            Institution Login
          </h2>
          <p className="text-sm text-gray-300 max-w-xs mx-auto pt-2">
            Login to access your school's secure management portal.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#1e293b]/85 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
          {(localError || authError) && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-start gap-3 ${countdown ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
              {countdown && <Timer className="h-5 w-5 animate-pulse shrink-0" />}
              <p className="text-xs font-semibold">{localError || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-medium text-gray-400 ml-1">
                Your username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  required
                  disabled={!!countdown || socialLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                  placeholder="Your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <LockIcon className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!!countdown || socialLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={socialLoading || !!countdown}
              className="w-full h-16 flex justify-center items-center rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading ? (
                <Loader className="h-6 w-6" />
              ) : countdown ? (
                `Locked (${countdown}s)`
              ) : (
                <div className="flex items-center gap-2">
                  <span>Enter Dashboard</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-xs font-medium text-gray-400 tracking-widest opacity-60">
          SECURE EDUCATIONAL COMMAND REGISTRY
        </p>
      </div>
    </div>
  );
}
