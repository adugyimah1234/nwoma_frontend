'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Wallet,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Users,
  Shield,
  User,
  LogOut,
  ChevronRight,
  School,
  Building2,
  Building,
  BarChart3,
  Calculator,
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  KeyRound,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getAllRoles } from '@/services/roles';
import { useLoading } from '../nav/side-nav/components/LoadingContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { getBranding } from '@/services/superAdmin';
import { SidebarWatermark } from './sidebar-watermark';
import { GhanaRibbonCorner } from './ghana-ribbon';
import { cn } from '@/lib/utils';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavSubItem {
  title: string;
  url: string;
  allowedRoles?: string[];
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavSubItem[];
  allowedRoles: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  // ── SUPER ADMIN TIER ── only visible to super_admin
  {
    title: 'Super Admin Tier',
    items: [
      {
        title: 'Dashboard',
        url: '/super-admin',
        icon: LayoutDashboard,
        allowedRoles: ['super_admin', 'superadmin'],
      },
      {
        title: 'Garrisons',
        url: '/super-admin/garrisons',
        icon: Building2,
        allowedRoles: ['super_admin', 'superadmin'],
      },
      {
        title: 'Reports',
        url: '/super-admin/reports',
        icon: BarChart3,
        allowedRoles: ['super_admin', 'superadmin'],
      },
      {
        title: 'Settings',
        url: '/super-admin/settings',
        icon: Settings,
        allowedRoles: ['super_admin', 'superadmin'],
      },
    ],
  },

  // ── GARRISON DIRECTORATE ── only visible to garrison_director
  {
    title: 'Garrison Directorate',
    items: [
      {
        title: 'Garrison Dashboard',
        url: '/garrison-director',
        icon: Building,
        allowedRoles: ['garrison_director'],
      },
      {
        title: 'Entrance Assessments',
        url: '/assessments',
        icon: BookOpen,
        allowedRoles: ['garrison_director'],
        items: [
          { title: 'Assessment Registry', url: '/admin/assessment-config' },
          { title: 'Results & Placement', url: '/assessments/results' },
          { title: 'Admitted Applicants', url: '/assessments/shortlisted' },
        ],
      },
    ],
  },

  // ── GENERAL ── all school-level roles (NOT super_admin)
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        allowedRoles: ['admin', 'frontdesk', 'accountant', 'teacher', 'garrison_director', 'school_admin'],
      },
      {
        title: 'My Account',
        url: '/profile',
        icon: User,
        allowedRoles: ['admin', 'frontdesk', 'accountant', 'teacher', 'garrison_director', 'school_admin'],
      },
    ],
  },

  // ── ACADEMICS & OPERATIONS ── school staff + garrison director
  {
    title: 'School Operations',
    items: [
      {
        title: 'Registration',
        url: '/registration',
        icon: ClipboardList,
        allowedRoles: ['admin', 'frontdesk', 'garrison_director', 'school_admin'],
        items: [
          { title: 'New Registration', url: '/registration/new' },
          { title: 'Manage Applicants', url: '/registration/manage' },
        ],
      },
      {
        title: 'Class Enrollment',
        url: '/admission',
        icon: GraduationCap,
        allowedRoles: ['admin', 'frontdesk', 'accountant', 'teacher', 'garrison_director', 'school_admin'],
      },
      {
        title: 'Gradebook',
        url: '/grades',
        icon: Calculator,
        allowedRoles: ['admin', 'teacher', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Score Entry', url: '/grades' },
          { title: 'Terminal Reports', url: '/grades/reports' },
        ],
      },
      {
        title: 'Student Records',
        url: '/students',
        icon: Users,
        allowedRoles: ['admin', 'frontdesk', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Student List', url: '/students' },
          { title: 'Parent List', url: '/team/parents' },
          { title: 'Student IDs', url: '/students/id-cards' },
          { title: 'Permissions & Leave', url: '/students/exeat' },
          { title: 'Student Promotion', url: '/students/promote' },
        ],
      },
      {
        title: 'Duty Roster',
        url: '/team/duty-roster',
        icon: ClipboardList,
        allowedRoles: ['admin', 'teacher', 'garrison_director', 'school_admin'],
      },
      {
        title: 'Staff Performance',
        url: '/team/performance',
        icon: Shield,
        allowedRoles: ['admin', 'teacher', 'garrison_director', 'school_admin'],
      },
    ],
  },

  // ── FINANCE & COLLECTIONS ── finance roles + garrison director
  {
    title: 'Finances',
    items: [
      {
        title: 'Fee Management',
        url: '/fees',
        icon: Wallet,
        allowedRoles: ['admin', 'accountant', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Create Receipt', url: '/fees/invoices' },
          { title: 'Debt Ledger', url: '/fees/ledger' },
          { title: 'Receipt History', url: '/fees/receipt-history' },
          { title: 'Payment History', url: '/fees/payment-history' },
        ],
      },
    ],
  },

  // ── SYSTEM ADMINISTRATION ── admin + garrison director only
  {
    title: 'System Administration',
    items: [
      {
        title: 'Admin Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
      },
      {
        title: 'User Access',
        url: '/admin/user-management',
        icon: KeyRound,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Staff List', url: '/admin/user-management' },
        ],
      },
      {
        title: 'School Setup',
        url: '/admin/schools',
        icon: Building2,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Manage Schools', url: '/admin/schools' },
          { title: 'Class Management', url: '/admin/classes' },
        ],
      },
      {
        title: 'System Settings',
        url: '/admin/system-settings',
        icon: Settings,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Fee Categories', url: '/admin/categories' },
          { title: 'Assessment Config', url: '/admin/assessment-config' },
          { title: 'System Settings', url: '/admin/system-settings' },
        ],
      },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useLoading();
  const [userRole, setUserRole] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const brandRes = await getBranding();
        if (brandRes && brandRes.institutional_logo) {
          setLogoUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${brandRes.institutional_logo}`);
        }
      } catch {
        // keep default logo
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.role_id) return;
      try {
        const roles = await getAllRoles();
        const role = roles.find((r) => r.id === user.role_id);
        setUserRole(role?.name?.toLowerCase() || '');
      } catch {
        // ignore
      }
    };
    fetchRole();
  }, [user?.role_id]);

  const handleLogout = async () => {
    startNavigation('/login');
    await logout();
    router.push('/login');
  };

  const checkRoleAccess = (allowedRoles: string[]) => {
    if (!user) return false;
    const roleStr = (user.role || userRole || '').toLowerCase().replace(/_/g, '').replace(/\s/g, '');
    if (!roleStr) return false;
    return allowedRoles.some((allowed) => {
      const allowedStr = allowed.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
      return roleStr === allowedStr;
    });
  };

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => checkRoleAccess(item.allowedRoles))
        .map((item) => ({
          ...item,
          items: item.items?.filter((sub) => !sub.allowedRoles || checkRoleAccess(sub.allowedRoles)),
        })),
    }))
    .filter((group) => group.items.length > 0);

  const allNavItems = filteredGroups.flatMap((g) =>
    g.items.flatMap((item) => [item, ...(item.items || [])])
  );

  const isActive = (url: string) => {
    if (url === '/') return pathname === '/';
    const isMatch = pathname === url || pathname.startsWith(url + '/');
    if (!isMatch) return false;
    const hasMoreSpecificMatch = allNavItems.some(
      (item) =>
        item.url !== url &&
        item.url.startsWith(url + '/') &&
        (pathname === item.url || pathname.startsWith(item.url + '/'))
    );
    return !hasMoreSpecificMatch;
  };

  const isExpanded = (url: string) => {
    if (url === '/') return pathname === '/';
    return pathname === url || pathname.startsWith(url + '/');
  };

  const getDashboardUrl = () => {
    const roleStr = (user?.role || userRole || '').toLowerCase().replace(/_/g, '');
    if (roleStr === 'superadmin') return '/super-admin';
    if (roleStr === 'garrisondirector') return '/garrison-director';
    return '/';
  };

  const isSuperAdmin = (user?.role || '').toLowerCase().replace(/_/g, '') === 'superadmin';
  const displayName = user?.full_name || (isSuperAdmin ? 'System Admin' : 'User');
  const userInitials = user?.full_name ? getInitials(user.full_name) : (isSuperAdmin ? 'SA' : 'U');

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-[#06152D] text-slate-200">
      {/* Header — App branding matching Image 1 */}
      <SidebarHeader className="h-16 md:h-[70px] border-b border-white/10 flex items-center justify-center px-3 bg-[#06152D]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/5 rounded-xl h-auto py-2">
              <Link href={getDashboardUrl()} className="flex items-center gap-3">
                <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 shadow-xs">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="size-7 object-contain drop-shadow"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-extrabold text-white text-sm tracking-tight">
                    Ghana Garrison Schools
                  </span>
                  <span className="truncate text-[10px] font-medium text-amber-300/90 tracking-wider">
                    Discipline • Excellence • Service
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content — Nav Groups with subtle Watermark */}
      <SidebarContent className="relative overflow-y-auto no-scrollbar py-3 px-2">
        {/* Subtle Crest Watermark in the sidebar background */}
        <SidebarWatermark className="group-data-[collapsible=icon]:hidden" />

        {filteredGroups.map((group) => (
          <SidebarGroup key={group.title} className="py-1">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400/80 px-3 py-1.5">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
              {group.items.map((item) => {
                const active = isActive(item.url);
                return item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isExpanded(item.url)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={active}
                          className={cn(
                            'rounded-xl text-sm font-medium transition-all duration-150 h-10 px-3',
                            active
                              ? '!bg-[#FAB005] !text-[#06152D] font-bold shadow-md shadow-amber-500/20 [&>svg]:!text-[#06152D]'
                              : 'text-slate-300 hover:text-white hover:bg-white/10 [&>svg]:text-slate-400 group-hover:[&>svg]:text-white'
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                          <ChevronRight
                            className={cn(
                              'ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90',
                              active ? '!text-[#06152D]' : 'text-slate-400'
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="border-l border-white/10 ml-5 pl-2 my-1 space-y-1">
                          {item.items.map((sub) => {
                            const subActive = isActive(sub.url);
                            return (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subActive}
                                  className={cn(
                                    'rounded-lg text-xs transition-colors h-8 px-2.5',
                                    subActive
                                      ? '!bg-amber-400/20 !text-amber-300 font-semibold border-l-2 border-amber-400 pl-2'
                                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                                  )}
                                >
                                  <Link href={sub.url}>{sub.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        'rounded-xl text-sm font-medium transition-all duration-150 h-10 px-3',
                        active
                          ? '!bg-[#FAB005] !text-[#06152D] font-bold shadow-md shadow-amber-500/20 [&>svg]:!text-[#06152D]'
                          : 'text-slate-300 hover:text-white hover:bg-white/10 [&>svg]:text-slate-400 group-hover:[&>svg]:text-white'
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                        <ChevronRight
                          className={cn(
                            'ml-auto size-4 shrink-0',
                            active ? '!text-[#06152D]' : 'text-slate-500/80 group-hover:text-white'
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Ghana Ribbon at the bottom-left of the sidebar matching Image 1 */}
      <GhanaRibbonCorner position="bottom-left" className="group-data-[collapsible=icon]:hidden" />

      {/* Footer — User menu matching Image 1 */}
      <SidebarFooter className="border-t border-white/10 p-3 bg-[#06152D] relative z-20">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors h-auto py-2 px-2.5 data-[state=open]:bg-white/15"
                >
                  <Avatar className="h-9 w-9 rounded-full border border-white/20 shrink-0">
                    <AvatarImage
                      src={
                        user?.id
                          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${user.id}/profile-image`
                          : undefined
                      }
                      alt={user?.full_name}
                    />
                    <AvatarFallback className="rounded-full bg-[#0077E6] text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-white text-xs">
                      {displayName}
                    </span>
                    <span className="truncate text-[11px] text-slate-400">
                      {user?.email || 'admin@school.com'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border shadow-xl"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-full border border-border">
                      <AvatarFallback className="rounded-full bg-[#0077E6] text-white text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <BadgeCheck className="mr-2 size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={isSuperAdmin ? '/super-admin/settings' : '/admin/system-settings'}>
                      <Settings className="mr-2 size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/change-password">
                      <KeyRound className="mr-2 size-4" />
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="mr-2 size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
