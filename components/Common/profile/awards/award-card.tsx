"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LucideIcon, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AwardCardProps {
  title: string;
  description?: string;
  progress: number;
  current: number;
  total: number;
  Icon: LucideIcon;
  coverPhoto?: string;
  onClick?: () => void;
}

export function AwardCard({
  title,
  description,
  progress,
  current,
  total,
  Icon,
  coverPhoto,
  onClick,
}: AwardCardProps) {
  const { t, language } = useLanguage();

  return (
    <Card
      onClick={onClick}
      className="border dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 py-0 overflow-hidden flex flex-col justify-between h-full bg-white dark:bg-[#131b2e] group cursor-pointer"
    >
      <CardContent className="relative flex justify-center items-center bg-slate-100 dark:bg-slate-900/80 h-36 sm:h-44 md:h-48 w-full overflow-hidden p-0 shrink-0">
        {coverPhoto ? (
          <>
            <img
              src={coverPhoto}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Top-right Lock badge */}
            <div className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-md text-amber-400 p-1.5 sm:p-2 rounded-full shadow-lg border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
          </>
        ) : (
          /* Circle Icon Container */
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-amber-100/80 dark:bg-amber-950/40 flex items-center justify-center relative">
            <Icon className="text-amber-600 dark:text-amber-400 w-6 h-6 sm:w-8 sm:h-8" />
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
              <Lock className="text-white w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start justify-between gap-2 p-3.5 sm:p-4 md:p-5 font-public-sans flex-1">
        <div className="w-full">
          {/* Title */}
          <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 dark:text-slate-100 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {title}
          </h3>
        </div>

        <div className="w-full pt-1.5 mt-auto space-y-2">
          <div className="space-y-1">
            {/* Progress Text */}
            <div className="flex justify-between w-full text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              <span>
                {(t("awards.progress") || (language === "es" ? "PROGRESO" : "PROGRESS")).toUpperCase()}: {current.toLocaleString()} / {total.toLocaleString()}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full" />
          </div>

          {/* Action button matching unlocked card height for symmetrical layout */}
          <Button
            type="button"
            variant="outline"
            onClick={onClick}
            className="w-full border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/50 dark:hover:bg-slate-800 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
            {t("awards.view_details") || (language === "es" ? "Ver más detalles" : "View more details")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
