"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHydration } from "@/hooks/use-hydration";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "outline" | "ghost" | "default";
}

export function ThemeToggle({ className, variant = "ghost" }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const hydrated = useHydration();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={cn("relative h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/10 border-none transition-colors", className)}
        >
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {hydrated && theme === "system" && <AutoThemeBadge />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AutoThemeBadge() {
  return (
    <span className="absolute -right-1 -top-1 flex h-3.5 items-center rounded-full bg-amber-400 px-1 text-[0.55rem] font-bold text-slate-900 ring-1 ring-background">
      auto
    </span>
  );
}
