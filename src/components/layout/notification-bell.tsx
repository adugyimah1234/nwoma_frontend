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
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 w-4 justify-center rounded-full p-0 text-[10px] bg-red-600 text-white font-bold border-2 border-[#06152D] animate-in zoom-in duration-300"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-border rounded-xl overflow-hidden">
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
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-medium">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={cn(
                  "flex items-start gap-3 p-3.5 cursor-pointer focus:bg-muted/50 transition-colors",
                  !n.is_read ? "bg-primary/[0.03]" : "opacity-75"
                )}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs font-semibold leading-none", !n.is_read ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/75 font-medium shrink-0">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
