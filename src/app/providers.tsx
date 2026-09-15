"use client";

import { Provider as JotaiProvider } from "jotai";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedFontSize = localStorage.getItem('app-font-size');
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      document.documentElement.style.fontSize = `${(size / 100) * 16}px`;
    }
  }, []);

  return (
    <JotaiProvider>
      <ModeThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
            <ChartThemeProvider>
              {children}
              <Toaster
                richColors
                position="top-right"
                closeButton
                toastOptions={{
                  style: {
                    padding: '12px 16px',
                  },
                  classNames: {
                    toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-xl border",
                    description: "group-[.toast]:text-muted-foreground text-xs",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
                    success: "group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-900 group-[.toaster]:border-emerald-200 dark:group-[.toaster]:bg-emerald-950 dark:group-[.toaster]:text-emerald-50 dark:group-[.toaster]:border-emerald-900",
                    error: "group-[.toaster]:bg-destructive/10 group-[.toaster]:text-destructive group-[.toaster]:border-destructive/20",
                  },
                }}
              />
            </ChartThemeProvider>
        </AuthProvider>
      </ModeThemeProvider>
    </JotaiProvider>
  );
}

