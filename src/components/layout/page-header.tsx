'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface TabLink {
  title: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  tabs?: TabLink[];
  children?: React.ReactNode;
}

/**
 * PageHeader — used inside each page after the <Header> component.
 * Provides page title, optional description, breadcrumb trail, and tab navigation.
 */
export function PageHeader({ title, description, breadcrumbs, tabs, children }: PageHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1 pb-4">
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.title}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.title}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-2 overflow-x-auto pb-1">{children}</div>}
      </div>

      {/* Tab nav */}
      {tabs && tabs.length > 0 && (
        <div className="mt-4 flex overflow-x-auto no-scrollbar pb-1">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted/50 p-1 text-muted-foreground border border-border/40">
            {tabs.map((tab) => {
              // Find if there's a more specific match in the tabs list
              const hasMoreSpecificMatch = tabs.some(
                (other) =>
                  other.href !== tab.href &&
                  other.href.startsWith(tab.href + '/') &&
                  pathname.startsWith(other.href)
              );

              const active = !hasMoreSpecificMatch && (
                tab.href === '/'
                  ? pathname === tab.href
                  : pathname === tab.href || pathname.startsWith(tab.href + '/')
              );
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1 text-xs md:text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground/80 hover:text-foreground hover:bg-background/30'
                  )}
                >
                  {tab.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
