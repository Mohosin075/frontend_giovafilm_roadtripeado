"use client";

import { useGetProfileQuery } from "@/redux/features/user/userApi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";

export function ContributionsSection() {
  const { t } = useLanguage();
  const { data: user, isLoading } = useGetProfileQuery({});
  
  const currentPoints = user?.points || 0;
  const currentLevel = user?.level || 0;

  // Levels thresholds mapping
  const USER_LEVELS = [
    { level: 0, name: t("levels.explorador") || "Explorador", points: 0, reviews: 0, reward: "10% OFF 1 Map" },
    { level: 1, name: t("levels.aventurero") || "Aventurero", points: 100, reviews: 6, reward: "Itinerary in PDF" },
    { level: 2, name: t("levels.tlacuilo") || "Tlacuilo", points: 200, reviews: 13, reward: "Itinerary in PDF" },
    { level: 3, name: t("levels.expedicionario") || "Expedicionario", points: 400, reviews: 26, reward: "25% OFF 1 Map" },
    { level: 4, name: t("levels.viajero") || "Viajero", points: 700, reviews: 46, reward: "Itinerary in PDF" },
    { level: 5, name: t("levels.chasqui") || "Chasqui", points: 1300, reviews: 86, reward: "1 Free Map" },
    { level: 6, name: t("levels.cronista") || "Cronista", points: 2200, reviews: 146, reward: "50% OFF 1 Map" },
    { level: 7, name: t("levels.baquiano") || "Baquiano", points: 3500, reviews: 233, reward: "Itinerary in PDF" },
    { level: 8, name: t("levels.cartografo") || "Cartógrafo", points: 5500, reviews: 366, reward: "75% OFF 1 Map" },
    { level: 9, name: t("levels.maestro_ruta") || "Maestro Ruta", points: 8500, reviews: 566, reward: "Itinerary in PDF" },
    { level: 10, name: t("levels.leyenda") || "Leyenda", points: 13000, reviews: 866, reward: "1 Free Map" },
    { level: 11, name: t("levels.gran_leyenda") || "Gran Leyenda", points: 20000, reviews: 1333, reward: "1 Free Map" },
    { level: 12, name: t("levels.mitico") || "Mítico", points: 30000, reviews: 2000, reward: "1 Free Map" },
    { level: 13, name: t("levels.inmortal") || "Inmortal", points: 45000, reviews: 3000, reward: "1 Free Map" },
    { level: 14, name: t("levels.supremo") || "Supremo", points: 65000, reviews: 4333, reward: "2 Free Maps" }
  ];

  const nextLevelIndex = currentLevel < 14 ? currentLevel + 1 : 14;
  const nextLevel = USER_LEVELS[nextLevelIndex];
  const nextLevelPoints = nextLevel.points;

  const pointsUntilNextLevel = Math.max(0, nextLevelPoints - currentPoints);
  const progressToNextLevel = nextLevelPoints > 0 ? Math.min(100, Math.round((currentPoints / nextLevelPoints) * 100)) : 100;

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-slate-800 space-y-4 sm:space-y-8 transition-colors">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-0.5">
          {t("contributions.your_contributions")}
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
          {t("contributions.track_impact")}
        </p>
      </div>

      {/* Statistics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-slate-900/60 rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-slate-800 h-20 sm:h-28 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {/* Total Points */}
          <div className="bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center">
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.total_points")}
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">{currentPoints}</p>
          </div>

          {/* Reviews */}
          <div className="bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center">
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.approved_reviews")}
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">{user?.totalReviewsApproved || 0}</p>
          </div>

          {/* Visited Places */}
          <Link
            href="/profile/visited-places"
            className="bg-gray-50 dark:bg-[#0e1424] hover:bg-amber-500/10 dark:hover:bg-amber-500/10 transition-colors rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center cursor-pointer group"
          >
            <p className="text-gray-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              Visited Places
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">
              {user?.visitedPlacesCount || 0}
            </p>
          </Link>

          {/* Level */}
          <div className="bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center">
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.current_level")}
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">Lv {currentLevel}</p>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-slate-800">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
            {t("contributions.progress_to_level")} {nextLevelIndex}: <span className="text-amber-600 dark:text-amber-400 font-bold">{nextLevel.name}</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mb-2">
            {pointsUntilNextLevel} {t("contributions.pts")} {t("contributions.and")} {Math.max(0, nextLevel.reviews - (user?.totalReviewsApproved || 0))} {t("contributions.reviews_until_next")}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <p className="text-[11px] sm:text-xs text-right text-gray-600 dark:text-slate-400 font-medium">
          {progressToNextLevel}%
        </p>

        {/* Help Text */}
        <p className="text-[11px] sm:text-xs text-gray-400 dark:text-slate-500 pt-1">
          {t("contributions.earn_points_help")}
        </p>
      </div>
    </div>
  );
}
