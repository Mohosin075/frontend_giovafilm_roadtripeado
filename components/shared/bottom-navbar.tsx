"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapIcon, LayoutGrid, Gift, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t("nav.map"),
      path: "/map",
      icon: <MapIcon className="w-6 h-6" />,
    },
    {
      label: t("nav.places"),
      path: "/places",
      icon: <LayoutGrid className="w-6 h-6" />,
    },
    {
      label: t("nav.offer"),
      path: "/offer",
      icon: <Gift className="w-6 h-6" />,
    },
    {
      label: t("nav.catalog"),
      path: "/",
      icon: <BookOpen className="w-6 h-6" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-30 transition-colors">
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center gap-1 relative min-w-15"
          >
            {isActive && (
              <div className="absolute -top-3 w-10 h-0.5 bg-[#FFC107] rounded-full shadow-[0_0_8px_rgba(250,191,19,0.5)]" />
            )}

            <div className={isActive ? "text-[#FFC107]" : "text-[#BDBDBD] dark:text-slate-500"}>
              {item.icon}
            </div>

            <span
              className={`text-[10px] font-medium ${
                isActive ? "text-[#FFC107] font-bold" : "text-[#BDBDBD] dark:text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
