/* eslint-disable no-console */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Settings,
  CreditCard,
  GraduationCap,
  School,
  Calendar,
  Layers,
  FileText,
  Lock,
  LayoutGrid,
  Building2,
  Ticket,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { getAllUsers } from '@/services/users';
import schoolService from '@/services/schools';
import { getAllRoles } from '@/services/roles';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSchools: 0,
    rolesCount: 0,
    activeModules: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, schools, roles] = await Promise.all([
          getAllUsers(),
          schoolService.getAll(),
          getAllRoles(),
        ]);
        setStats({
          totalUsers: users.length,
          activeSchools: schools.length,
          rolesCount: roles.length,
          activeModules: 8, // Fixed or fetched from config
        });
      } catch (error) {
        console.error('Error fetching admin stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-slate-50/50 dark:bg-slate-950/50">
        <PageHeader
          title="System Administration Overview"
          description="Global configuration and monitoring of the school management network."
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Admin' }]}
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="System Users"
            value={stats.totalUsers}
            icon={Users}
            description="Total registered accounts"
          />
          <StatsCard
            title="Institutions"
            value={stats.activeSchools}
            icon={Building2}
            description="Active schools & branches"
          />
          <StatsCard
            title="Defined Roles"
            value={stats.rolesCount}
            icon={ShieldCheck}
            description="Access control groups"
          />
          <StatsCard
            title="System Modules"
            value={stats.activeModules}
            icon={Layers}
            description="Enabled core features"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Identity & Access Card */}
          <AdminCategoryCard
            title="Identity & Access"
            description="Manage users, roles, and system-wide permissions."
            icon={Lock}
            links={[
              { label: "User Directory", href: "/admin/user-management" },
            ]}
          />

          {/* Institutional Setup Card */}
          <AdminCategoryCard
            title="Institutional Setup"
            description="Configure schools, campuses, and academic structures."
            icon={School}
            links={[
              { label: "School Management", href: "/admin/schools" },
              { label: "Class & Level Config", href: "/admin/classes" },
              { label: "Academic Calendars", href: "/admin/system-settings" },
            ]}
          />

          {/* System Configuration Card */}
          <AdminCategoryCard
            title="System Config"
            description="Global settings, fees, and operational parameters."
            icon={Settings}
            links={[
              { label: "General Settings", href: "/admin/system-settings" },
              { label: "Fee Category Setup", href: "/admin/categories" },
              { label: "Assessment Config", href: "/admin/assessment-config" },
            ]}
          />
        </div>

        {/* Recent System Activity Placeholder */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>System Health & Alerts</CardTitle>
              <CardDescription>Real-time status of system components.</CardDescription>
            </div>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Security Audit Complete</p>
                  <p className="text-xs text-muted-foreground">All system permissions are correctly synced with Redis BLACKLIST.</p>
                </div>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="h-8 w-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Academic Year 2025/2026</p>
                  <p className="text-xs text-muted-foreground">Ready for enrollment phase initiation.</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

function AdminCategoryCard({ title, description, icon: Icon, links }: {
  title: string,
  description: string,
  icon: any,
  links: { label: string, href: string }[]
}) {
  return (
    <Card className="border-none shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between group p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                {link.label}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transform group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

