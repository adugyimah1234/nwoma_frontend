/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
"use client";

import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "../theme-toggle";
import { Bell, Search, Menu, User, ChevronDown, LogOut, Settings, HelpCircle, KeyRound, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { Loader } from "@/components/ui/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TopNav({ title }: { title: string }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingSettings] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      setProfileImage(`/api/users/${user.id}/profile-image`);
    } else {
      setProfileImage(null);
    }
  }, [user?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = async () => {
    try {
      setIsLoadingProfile(true);
      await router.push('/profile');
      setIsUserMenuOpen(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleNotificationClick = async () => {
    setIsLoadingNotifications(true);
    try {
      setIsNotificationsOpen(!isNotificationsOpen);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const notifications = [
    { id: 1, message: "New comment on your post", time: "5m ago", read: false },
    { id: 2, message: "Your report is ready to download", time: "1h ago", read: false },
    { id: 3, message: "Server maintenance scheduled", time: "2h ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="flex fixed h-14 shrink-0 items-center justify-between border-b border-border/50 bg-card px-4 md:px-6 z-20">
      {/* Left: Mobile menu toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-semibold text-foreground tracking-tight hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search (placeholder) */}
        <button className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <Search size={16} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground transition-colors relative"
            onClick={handleNotificationClick}
            disabled={isLoadingNotifications}
          >
            {isLoadingNotifications ? (
              <Loader size="sm" showText={false} />
            ) : (
              <>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
                )}
              </>
            )}
          </button>

          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border/50 bg-card shadow-lg shadow-black/5 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="h-6 w-px bg-border/50 mx-1 hidden md:block" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={profileImage || undefined} alt="User avatar" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                {user?.full_name ? getInitials(user.full_name) : <User size={14} />}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-foreground truncate max-w-[120px]">
              {user?.full_name}
            </span>
            <ChevronDown size={14} className="text-muted-foreground hidden md:block" />
          </button>

          {/* User dropdown */}
          {isUserMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/50 bg-card shadow-lg shadow-black/5 z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-sm font-semibold text-foreground truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                  disabled={isLoadingProfile}
                >
                  {isLoadingProfile ? (
                    <Loader size="sm" showText={false} />
                  ) : (
                    <User size={15} strokeWidth={1.8} className="text-muted-foreground" />
                  )}
                  <span>Profile</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                >
                  {isLoadingSettings ? (
                    <Loader size="sm" showText={false} />
                  ) : (
                    <Settings size={15} strokeWidth={1.8} className="text-muted-foreground" />
                  )}
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    router.push('/change-password');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                >
                  <KeyRound size={15} strokeWidth={1.8} className="text-muted-foreground" />
                  <span>Change Password</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors"
                >
                  <HelpCircle size={15} strokeWidth={1.8} className="text-muted-foreground" />
                  <span>Help</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-border/50 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader size="sm" showText={false} className="text-destructive" />
                  ) : (
                    <LogOut size={15} strokeWidth={1.8} />
                  )}
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 shadow-xl md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                <button
                  className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}