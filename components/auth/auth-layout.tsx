"use client";

import Image, { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import whiteLogo from "@/public/white-logo.png";
import logo from "@/public/logo.png";
import Link from "next/link";
import LanguageSwitcher from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AuthLayoutProps {
  children: ReactNode;
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
  image?: StaticImageData | undefined;
}

export function AuthLayout({
  children,
  image,
  titleKey,
  descriptionKey,
  title = "",
  description = "",
}: AuthLayoutProps) {
  const { t } = useLanguage();

  const displayTitle = titleKey ? t(titleKey) : title;
  const displayDescription = descriptionKey ? t(descriptionKey) : description;

  return (
    <div className="min-h-screen flex relative bg-white dark:bg-[#0b0f19] transition-colors">
      {/* Top Floating Language Switcher & Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center min-h-screen"
        style={{
          backgroundImage: image
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${image.src})`
            : `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))`,
        }}
      >
        <div className="flex flex-col justify-center space-y-6 ml-28 text-white">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/">
              <Image
                src={whiteLogo}
                alt="Dashboard Logo"
                height={500}
                width={500}
                className="w-96 h-auto"
              />
            </Link>
          </div>

          <h2 className="text-5xl font-black leading-14 font-public-sans w-full md:w-2/3">
            {displayTitle}
          </h2>
          <p className="text-xl font-public-sans w-full md:w-2/3">
            {displayDescription}
          </p>
        </div>
      </div>

      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 pt-16 sm:pt-8">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="shrink-0 mb-4 lg:hidden flex justify-center">
            <Link href="/">
              <Image
                src={logo}
                alt="Dashboard Logo"
                height={500}
                width={500}
                className="w-60 h-auto block dark:hidden"
              />
              <Image
                src={whiteLogo}
                alt="Dashboard Logo"
                height={500}
                width={500}
                className="w-60 h-auto hidden dark:block"
              />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
