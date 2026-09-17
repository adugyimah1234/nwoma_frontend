'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { NotificationBell } from './notification-bell';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

function getInitials(name: string) {
  return name
    .split(' ')
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

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[box-shadow] duration-200',
        fixed && 'sticky top-0 z-50',
        offset > 10 && fixed ? 'shadow-md dark:shadow-none' : 'shadow-xs dark:shadow-none',
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between px-4">
        {/* Left: sidebar trigger + separator + page nav tabs / title */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="h-4 shrink-0" />
          {children || (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium text-muted-foreground truncate cursor-default">
                    {user?.garrison_name ? (
                      <>
                        <span className="hidden sm:inline">{user.garrison_name}</span>
                        <span className="sm:hidden">{user.garrison_name.split(' ')[0]}</span>
                        {user.role?.toLowerCase().replace(/_/g, '') === 'schooladmin' && user.school_name ? ` - ${user.school_name}` : ''}
                      </>
                    ) : (
                      "Garrison SMS"
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {user?.garrison_name ? (
                      <>
                        {user.garrison_name}
                        {user.role?.toLowerCase().replace(/_/g, '') === 'schooladmin' && user.school_name ? ` - ${user.school_name}` : ''}
                      </>
                    ) : (
                      "Garrison School Management System"
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              className="h-8 w-48 pl-8 text-sm bg-muted/50 border-transparent focus:border-border focus:bg-background transition-all"
            />
            <kbd className="absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </div>

          <Separator orientation="vertical" className="mx-1 h-4" />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/settings')}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[11px] font-semibold bg-primary text-primary-foreground">
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || user?.username || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
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

