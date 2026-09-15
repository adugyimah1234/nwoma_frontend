/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
'use client';

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  GraduationCap,
  LogOut,
  User,
  UserPlus,
  Users,
  ChevronDown,
  LucideProps,
  Shield,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Receipt,
  History,
  Wallet,
  Eye,
  UserCog,
  Building2,
  SlidersHorizontal,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/contexts/DashboardContext";
import { InlineLoader } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllRoles } from "@/services/roles";
import { useLoading } from "./components/LoadingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSetAtom } from "jotai";
import { tourRunAtom } from "@/components/tour/tour-atom";

interface NavItem {
  name: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
  badge?: string | false;
  children?: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/" },
      { name: "Profile", icon: User, href: "/profile" },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        name: "Registration",
        icon: ClipboardList,
        href: "/registration",
        children: [
          { name: "New Registration", href: "/registration/new", icon: UserPlus },
          { name: "Manage Applicant", href: "/registration/manage", icon: Users },
        ],
      },
      {
        name: "Entrance Assessments",
        icon: BookOpen,
        href: "/assessments",
        children: [
          { name: "Placement", href: "/assessments/results", icon: BookOpen },
          { name: "Admitted Applicants", href: "/assessments/shortlisted", icon: UserCheck },
        ],
      },
      {
        name: "Enrollment",
        icon: GraduationCap,
        href: "/admission",
      },
      {
        name: "Students",
        icon: Users,
        href: "/students",
        children: [
          { name: "Promote Students", href: "/students/promote", icon: GraduationCap },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        name: "Fee Management",
        icon: Wallet,
        href: "/fees",
        children: [
          { name: "Create Receipt", href: "/fees/invoices", icon: Receipt },
          { name: "Receipt History", href: "/fees/receipt-history", icon: History },
          { name: "Payment History", href: "/fees/payment-history", icon: FileText },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Admin",
        icon: Shield,
        href: "/admin",
        children: [
          { name: "Overview", href: "/admin", icon: Eye },
          { name: "User Management", href: "/admin/user-management", icon: UserCog },
          { name: "Class & School Settings", href: "/admin/classes", icon: Building2 },
          { name: "System Settings", href: "/admin/system-settings", icon: SlidersHorizontal },
        ],
      },
    ],
  },
];

// Flatten all items for role filtering (backwards compat)
const allNavigationItems: NavItem[] = navigationSections.flatMap(s => s.items);

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { activeItem, setActiveItem } = useDashboard();
  const { startNavigation, navigationLoading } = useLoading();
  const setTourRun = useSetAtom(tourRunAtom);
  const router = useRouter();

  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);

  const filterNavItemsByRole = (role: string, items: NavItem[]): NavItem[] => {
    const map = {
      admin: items,
      frontdesk: items
        .filter(item =>
          ['Dashboard', 'Profile', 'Registration', 'Entrance Assessments', 'Enrollment'].includes(item.name)
        )
        .map(item => {
          if (item.name === 'Entrance Assessments') {
            return {
              ...item,
              children: item.children?.filter(child => child.name === 'Placement'),
            };
          }
          return item;
        }),
      accountant: items.filter(item => ['Dashboard', 'Fee Management', 'Profile', 'Enrollment'].includes(item.name)),
      teacher: items.filter(item => ['Dashboard', 'Enrollment', 'Profile'].includes(item.name)),
    };

    return map[role as keyof typeof map] || [];
  };

  useEffect(() => {
    const fetchRolesAndFilter = async () => {
      if (!user?.role_id) return;

      try {
        const roles = await getAllRoles();
        const userRole = roles.find(role => String(role.id) === String(user.role_id));
        const roleName = userRole?.name?.toLowerCase() || "";
        const allowedItems = filterNavItemsByRole(roleName, allNavigationItems);
        setFilteredNavItems(allowedItems);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    fetchRolesAndFilter();
  }, [user?.role_id]);

  const toggleSubMenu = (name: string) => {
    setExpandedMenu(expandedMenu === name ? null : name);
  };

  const handleNavClick = async (item: NavItem, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (item.children) {
      toggleSubMenu(item.name);
      return;
    }

    setLoadingItem(item.name);

    try {
      if (item.name === "Logout") {
        startNavigation("/login");
        await logout();
        router.push("/login");
      } else {
        startNavigation(item.href);
        router.push(item.href);
        setActiveItem(item.name);
        setExpandedMenu(null);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      setLoadingItem(null);
    }
  };

  const handleSubNavClick = async (sub: NavItem, e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingItem(sub.name);

    try {
      startNavigation(sub.href);
      router.push(sub.href);
      setActiveItem(sub.name);
    } catch (error) {
      console.error("Navigation error:", error);
      setLoadingItem(null);
    }
  };

  // Clear loading item when navigation completes
  useEffect(() => {
    if (!navigationLoading && loadingItem) {
      const timer = setTimeout(() => {
        setLoadingItem(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigationLoading, loadingItem]);

  // Build the filtered sections based on filtered items
  const filteredSections = navigationSections
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        filteredNavItems.some(fi => fi.name === item.name)
      ),
    }))
    .filter(section => section.items.length > 0);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-border/50 bg-card transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-[68px]"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground transition-colors duration-200"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* User Profile Section */}
      <div className={`flex items-center gap-3 border-b border-border/50 px-3 py-4 ${!isOpen ? "justify-center" : ""}`}>
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={user?.id ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${user.id}/profile-image` : undefined} alt="User avatar" />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {user?.full_name ? getInitials(user.full_name) : <User size={16} />}
          </AvatarFallback>
        </Avatar>
        {isOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {filteredSections.map((section) => (
          <div key={section.label}>
            {/* Section Label */}
            {isOpen && (
              <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
            )}
            {!isOpen && (
              <div className="mb-2 mx-auto w-6 border-t border-border/50" />
            )}

            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.name} title={!isOpen ? item.name : ''}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(item, e)}
                    className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ${
                      activeItem === item.name && !item.children
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    } ${!isOpen ? "justify-center px-0" : ""} ${
                      loadingItem === item.name ? "opacity-60 cursor-wait" : ""
                    }`}
                  >
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                      {loadingItem === item.name ? (
                        <InlineLoader size="sm" color="indigo" />
                      ) : (
                        <>
                          <item.icon size={18} strokeWidth={activeItem === item.name && !item.children ? 2.5 : 1.8} />
                          {item.badge && (
                            <span className="absolute -right-1.5 -top-1.5 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {isOpen && <span className="flex-1 truncate">{item.name}</span>}
                    {isOpen && item.badge && (
                      <span className="text-xs font-semibold bg-muted text-muted-foreground rounded-md px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    )}
                    {item.children && isOpen && (
                      <ChevronDown
                        size={14}
                        className={`text-muted-foreground/60 transition-transform duration-200 ${
                          expandedMenu === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.children && expandedMenu === item.name && isOpen && (
                      <motion.div
                        className="mt-0.5 ml-4 space-y-0.5 border-l border-border/50 pl-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        {item.children.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={(e) => handleSubNavClick(sub, e)}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-all duration-150 ${
                              activeItem === sub.name
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            } ${loadingItem === sub.name ? "opacity-60 cursor-wait" : ""}`}
                          >
                            {loadingItem === sub.name ? (
                              <InlineLoader size="xs" color="indigo" className="mr-0" />
                            ) : (
                              <sub.icon size={15} strokeWidth={activeItem === sub.name ? 2.5 : 1.8} />
                            )}
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="border-t border-border/50 px-3 py-3 space-y-1">
        <button
          onClick={() => setTourRun(true)}
          className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground ${
            !isOpen ? "justify-center px-0" : ""
          }`}
          title={!isOpen ? "Guided Tour" : ""}
        >
          <HelpCircle size={18} strokeWidth={1.8} />
          {isOpen && <span>Guided Tour</span>}
        </button>

        <button
          onClick={(e) => handleNavClick({ name: "Logout", icon: LogOut, href: "/logout" }, e as any)}
          className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive ${
            !isOpen ? "justify-center px-0" : ""
          } ${loadingItem === "Logout" ? "opacity-60 cursor-wait" : ""}`}
          title={!isOpen ? "Logout" : ""}
        >
          {loadingItem === "Logout" ? (
            <InlineLoader size="sm" color="indigo" />
          ) : (
            <LogOut size={18} strokeWidth={1.8} />
          )}
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
