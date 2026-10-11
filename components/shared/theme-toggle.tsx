"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSmall = size === "sm";

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100/90 dark:bg-zinc-800 shrink-0",
          isSmall ? "w-7 h-7" : "w-9 h-9",
          className
        )}
      />
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full bg-gray-100/90 dark:bg-[#131b2e] hover:bg-gray-200/80 dark:hover:bg-slate-800 active:scale-95 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 transition-all duration-200 cursor-pointer shadow-sm select-none shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#fabf13]",
        isSmall ? "w-7 h-7" : "w-9 h-9",
        className
      )}
    >
      {isDark ? (
        <Sun className={cn(isSmall ? "w-3.5 h-3.5" : "w-4 h-4", "text-[#fabf13] drop-shadow-[0_0_8px_rgba(250,191,19,0.5)] transition-transform duration-300 rotate-0 hover:rotate-45")} />
      ) : (
        <Moon className={cn(isSmall ? "w-3.5 h-3.5" : "w-4 h-4", "text-slate-700 dark:text-slate-300 transition-transform duration-300 -rotate-12 group-hover:rotate-0")} />
      )}
    </button>
  );
}
