'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '@/services/notifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn('Notifications data is not an array:', data);
        setNotifications([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 3 minutes
    const interval = setInterval(fetchNotifications, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="size-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="size-4 text-amber-500" />;
      case 'error': return <XCircle className="size-4 text-rose-500" />;
      default: return <Info className="size-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 w-4 justify-center rounded-full p-0 text-[10px] animate-in zoom-in duration-300"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-none">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/20">
          <span className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-primary uppercase hover:underline flex items-center gap-1"
            >
                <CheckCheck className="size-3" /> Mark all read
            </button>
          )}
        </div>
        <Separator />
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-10 text-center space-y-2">
                <Bell className="size-8 mx-auto text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground italic">No new operational alerts.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                    "flex flex-col items-start gap-1 py-4 px-4 border-b last:border-0 cursor-default focus:bg-muted/30 transition-colors",
                    !n.is_read && "bg-primary/5"
                )}
                onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              >
                <div className="flex items-center gap-2 w-full">
                    {getIcon(n.type)}
                    <span className={cn("text-xs flex-1 truncate font-bold", !n.is_read ? "text-foreground" : "text-muted-foreground")}>{n.title}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).replace('about ', '')}
                    </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground pl-6">
                  {n.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <Separator />
        <div className="p-2">
            <Button variant="ghost" className="w-full h-8 text-[10px] font-bold uppercase text-muted-foreground" onClick={() => {}}>
                View Full Audit Trail
            </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

