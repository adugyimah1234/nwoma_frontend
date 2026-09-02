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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getAllRoles } from '@/services/roles';
import { useLoading } from '../nav/side-nav/components/LoadingContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { getBranding } from '@/services/superAdmin';

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
import { BadgeCheck, Bell, ChevronsUpDown, KeyRound, Settings } from 'lucide-react';

interface NavSubItem {
  title: string;
  url: string;
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
        title: 'Profile',
        url: '/profile',
        icon: User,
        allowedRoles: ['admin', 'frontdesk', 'accountant', 'teacher', 'garrison_director', 'school_admin'],
      },
    ],
  },

  // ── ACADEMICS & OPERATIONS ── school staff + garrison director
  {
    title: 'Academics & Operations',
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
        title: 'Enrollment',
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
        title: 'Students Directory',
        url: '/students',
        icon: Users,
        allowedRoles: ['admin', 'frontdesk', 'garrison_director', 'school_admin'],
        items: [
          { title: 'All Students', url: '/students' },
          { title: 'Parents Directory', url: '/team/parents' },
          { title: 'ID Card Generator', url: '/students/id-cards' },
          { title: 'Exeat & Leave', url: '/students/exeat' },
          { title: 'Promote Students', url: '/students/promote' },
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
      {
        title: 'Staff Payroll',
        url: '/team/payroll',
        icon: Wallet,
        allowedRoles: ['admin', 'accountant', 'garrison_director', 'school_admin'],
      },
    ],
  },

  // ── FINANCE & COLLECTIONS ── finance roles + garrison director
  {
    title: 'Finance & Collections',
    items: [
      {
        title: 'Fee Management',
        url: '/fees',
        icon: Wallet,
        allowedRoles: ['admin', 'accountant', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Create Receipt', url: '/fees/invoices' },
          { title: 'Debt Ledger', url: '/fees/ledger' },
          { title: 'Provisions Store', url: '/fees/store' },
          { title: 'Store Intelligence', url: '/fees/store/report' },
          { title: 'Expenses Tracker', url: '/fees/expenses' },
          { title: 'MoMo Reconciliation', url: '/fees/momo' },
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
        title: 'Console Overview',
        url: '/admin',
        icon: LayoutDashboard,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
      },
      {
        title: 'Access Management',
        url: '/admin/user-management',
        icon: KeyRound,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
        items: [
          { title: 'User Directory', url: '/admin/user-management' },
          { title: 'Roles & Permissions', url: '/admin/roles' },
          { title: 'Module Access', url: '/admin/module-access' },
        ],
      },
      {
        title: 'Institutional Setup',
        url: '/admin/schools',
        icon: Building2,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Schools & Branches', url: '/admin/schools' },
          { title: 'Class Management', url: '/admin/classes' },
        ],
      },
      {
        title: 'System Config',
        url: '/admin/system-settings',
        icon: Settings,
        allowedRoles: ['admin', 'garrison_director', 'school_admin'],
        items: [
          { title: 'Fee Categories', url: '/admin/categories' },
          { title: 'Assessment Config', url: '/admin/assessment-config' },
          { title: 'Global Settings', url: '/admin/system-settings' },
        ],
      },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
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
    if (!user) return false; // Default to no access if user is not loaded

    // Normalize role string (e.g. 'super_admin' -> 'superadmin', 'garrison_director' -> 'garrisondirector')
    const roleStr = (user.role || userRole || '').toLowerCase().replace(/_/g, '').replace(/\s/g, '');

    if (!roleStr) return false; // Default to no access if role is empty

    return allowedRoles.some((allowed) => {
      const allowedStr = allowed.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
      return roleStr === allowedStr;
    });
  };

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => checkRoleAccess(item.allowedRoles)),
    }))
    .filter((group) => group.items.length > 0);

  const allNavItems = navGroups.flatMap(g =>
    g.items.flatMap(item => [item, ...(item.items || [])])
  );

  const isActive = (url: string) => {
    if (url === '/') return pathname === '/';

    const isMatch = pathname === url || pathname.startsWith(url + '/');
    if (!isMatch) return false;

    // For highlighting, we want the most specific match
    const hasMoreSpecificMatch = allNavItems.some(item =>
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

  return (
    <Sidebar collapsible="icon">
      {/* Header — App branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={getDashboardUrl()}>
                <div className="flex aspect-square size-8 items-center justify-center  text-primary-foreground">
                    <img src={logoUrl} className="size-6 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Garrison SMS</span>
                  <span className="truncate text-xs text-muted-foreground">School Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content — Nav Groups */}
      <SidebarContent>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) =>
                item.items ? (
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
                          isActive={isActive(item.url)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(sub.url)}
                              >
                                <Link href={sub.url}>{sub.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — User menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.id ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${user.id}/profile-image` : undefined}
                      alt={user?.full_name}
                    />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {user?.full_name ? getInitials(user.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.full_name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.id ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${user.id}/profile-image` : undefined}
                        alt={user?.full_name}
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                        {user?.full_name ? getInitials(user.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.full_name}</span>
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
                    <Link href="/admin/system-settings">
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
