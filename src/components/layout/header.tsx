'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { NotificationBell } from './notification-bell';
import { GhanaRibbonCorner } from './ghana-ribbon';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function Header({ className, fixed = true, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setOffset(window.scrollY || document.documentElement.scrollTop || document.body.scrollTop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const roleName = (user?.role || '').toLowerCase().replace(/_/g, '');
  const isSuperAdmin = roleName === 'superadmin';
  const displayName = user?.full_name || (isSuperAdmin ? 'System Admin' : 'User');
  const userInitials = user?.full_name ? getInitials(user.full_name) : (isSuperAdmin ? 'SA' : 'U');

  return (
    <header
      className={cn(
        'relative flex h-16 md:h-[70px] shrink-0 items-center border-b border-white/10 bg-[#06152D] text-white transition-[box-shadow] duration-200 overflow-hidden select-none',
        fixed && 'sticky top-0 z-40',
        offset > 10 && fixed ? 'shadow-lg shadow-black/20' : '',
        className
      )}
      {...props}
    >
      {/* Dynamic Ghana Tri-Color Ribbon in the top-right corner */}
      <GhanaRibbonCorner position="top-right" />

      <div className="flex w-full items-center justify-between px-3 md:px-6 relative z-10">
        {/* Left: Mobile/Desktop trigger & dynamic title */}
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <SidebarTrigger className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-lg shrink-0 transition-colors" />

          {children || (
            <div className="flex flex-col min-w-0">
              <span className="text-sm md:text-base font-bold text-white tracking-tight truncate">
                {user?.garrison_name ? (
                  <>
                    <span>{user.garrison_name}</span>
                    {user?.school_name && (
                      <span className="hidden sm:inline text-white/70 font-normal">
                        {' '}— {user.school_name}
                      </span>
                    )}
                  </>
                ) : (
                  'Ghana Garrison Schools'
                )}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300/90 tracking-wide">
                <span>Discipline</span>
                <span className="text-white/40">•</span>
                <span>Excellence</span>
                <span className="text-white/40">•</span>
                <span>Service</span>
              </span>
            </div>
          )}
        </div>

        {/* Center / Right: Global Search, Quick Actions, Profile */}
        <div className="flex items-center gap-2 md:gap-3 pr-8 md:pr-14">
          {/* Global search pill input as seen in design */}
          <div className="relative hidden lg:flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-white/50 pointer-events-none" />
            <input
              type="text"
              placeholder="Search garrisons, schools, or reports..."
              className="h-9 w-72 xl:w-96 rounded-full bg-white/10 pl-9 pr-10 text-xs md:text-sm text-white placeholder:text-white/50 border border-white/15 outline-none focus:border-amber-400 focus:bg-white/15 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
            />
            <kbd className="absolute right-3 hidden h-5 select-none items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/60 sm:flex">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <div className="text-white/80 hover:text-white">
            <NotificationBell />
          </div>

          {/* Theme toggle */}
          <div className="text-white/80 hover:text-white">
            <ThemeToggle />
          </div>

          {/* Settings shortcut */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => router.push(isSuperAdmin ? '/super-admin/settings' : '/settings')}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* User Profile Pill button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 h-10 px-2 sm:px-3 hover:bg-white/10 text-white rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-amber-400"
              >
                <Avatar className="h-8 w-8 rounded-full border border-white/20 shrink-0">
                  <AvatarFallback className="text-[12px] font-bold bg-[#0077E6] text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-white/60 leading-tight">
                    {user?.email ? user.email.split('@')[0] : 'Admin'}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-white/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-xl border-border">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || user?.username || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(isSuperAdmin ? '/super-admin/settings' : '/settings')}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
