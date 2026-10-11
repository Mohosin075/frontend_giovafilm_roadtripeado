"use client";

import { BookOpen, Gift, LayoutGrid, MapIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TopHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div>
      <header className="px-5 pt-6 pb-4 sticky top-0 z-20">
        <div className="flex items-center rounded-full px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-slate-800 bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100">
          {/* Hamburger + Search */}
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-8 h-8 flex items-center justify-center cursor-pointer text-gray-900 dark:text-slate-100"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12H20M4 6H20M4 18H12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-gray-400 dark:text-slate-500 text-sm font-medium line-clamp-1">
              {t("search.placeholder")}
            </span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <Link
              href={"/profile/contributions-reviews"}
              className="w-10 h-10 rounded-full border-2 border-[#FFC107] p-0.5 overflow-hidden cursor-pointer flex-shrink-0"
            >
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                alt="Profile"
                width={100}
                height={100}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#131b2e] border-r border-gray-100 dark:border-slate-800 z-40 shadow-lg transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">{t("nav.menu")}</h2>
          <button onClick={() => setMenuOpen(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
            ✕
          </button>
        </div>

        <nav className="flex flex-col px-4 mt-4 space-y-2">

          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
