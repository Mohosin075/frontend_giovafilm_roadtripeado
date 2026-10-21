"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function SpainFlag({ className = "w-4 h-3 shrink-0 rounded-[2px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 480"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path fill="#c60b1e" d="M0 0h640v480H0z" />
      <path fill="#ffc400" d="M0 120h640v240H0z" />
    </svg>
  );
}

export function USFlag({ className = "w-4 h-3 shrink-0 rounded-[2px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 480"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path fill="#bd3d44" d="M0 0h640v480H0z" />
      <path
        stroke="#fff"
        strokeWidth="37"
        d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"
      />
      <path fill="#192f5d" d="M0 0h256v258.5H0z" />
      <circle cx="128" cy="129" r="60" fill="#fff" fillOpacity="0.25" />
    </svg>
  );
}

interface LanguageSwitcherProps {
  className?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const languages = [
  { code: "es" as Language, label: "ES", Flag: SpainFlag, title: "Español" },
  { code: "en" as Language, label: "EN", Flag: USFlag, title: "English" },
];

export default function LanguageSwitcher({
  className = "",
  size = "md",
  showIcon = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];
  const CurrentFlag = currentLang.Flag;
  const isSmall = size === "sm";

  // Close when clicking or tapping outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Select language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-full bg-gray-100/90 dark:bg-[#131b2e] hover:bg-gray-200/80 dark:hover:bg-slate-800 active:bg-gray-300/80 dark:active:bg-slate-700 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 font-semibold cursor-pointer transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#fabf13] select-none shrink-0 shadow-sm touch-manipulation",
          isSmall ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs sm:text-sm",
          className
        )}
      >
        {showIcon && <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />}
        <CurrentFlag className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0" />
        <span className="font-bold tracking-wide">{currentLang.label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-gray-500 dark:text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-44 p-1.5 rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 shadow-2xl z-[120] animate-in fade-in-50 zoom-in-95 origin-top-right pointer-events-auto"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 select-none">
            Language / Idioma
          </div>
          {languages.map((item) => {
            const isActive = language === item.code;
            const ItemFlag = item.Flag;
            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer text-xs sm:text-sm font-medium transition-colors my-0.5 text-left",
                  isActive
                    ? "bg-[#FFF9E6] dark:bg-amber-500/15 text-amber-950 dark:text-amber-300 font-bold border border-[#FFE082] dark:border-amber-500/30"
                    : "text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/80 active:bg-gray-200 dark:active:bg-slate-700"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <ItemFlag className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0" />
                  <span>{item.title}</span>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
