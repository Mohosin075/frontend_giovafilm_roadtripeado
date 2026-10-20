"use client";

import { useState } from "react";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import { useGetLevelConfigsQuery } from "@/redux/features/award/awardApi";
import { getEffectiveLevels, calculateUserLevel } from "@/lib/level-utils";
import { useMemo } from "react";
import { useGetMyRecommendationsQuery } from "@/redux/features/place/placeApi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { RecommendSpotModal } from "@/components/shared/recommend-spot-modal";
import { Plus, Lock } from "lucide-react";
import Link from "next/link";

interface ContributionsSectionProps {
  onTabChange?: (tab: "reviews" | "spots") => void;
  activeTab?: "reviews" | "spots";
}

export function ContributionsSection({
  onTabChange,
  activeTab,
}: ContributionsSectionProps = {}) {
  const { t, language } = useLanguage();
  const isEs = language === "es";
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);
  const { data: user, isLoading } = useGetProfileQuery({});
  const { data: recData } = useGetMyRecommendationsQuery({ status: "Approved", limit: 1 });
  
  const purchasedMaps = Array.isArray(user?.purchasedMaps) ? user.purchasedMaps : [];
  const isAdminOrEditor = ["super_admin", "admin", "map_editor"].includes(user?.role || "");
  const hasPurchasedMap = isAdminOrEditor || purchasedMaps.length > 0;

  const currentPoints = user?.points || 0;

  const approvedSpotsCount =
    user?.approvedRecommendedPlacesCount !== undefined
      ? user.approvedRecommendedPlacesCount
      : (recData?.meta?.total ?? 0);

  // Dynamic Level thresholds synchronized with Dashboard (Issue 7)
  const { data: levelsRes } = useGetLevelConfigsQuery();
  const effectiveLevels = useMemo(
    () => getEffectiveLevels(levelsRes, language),
    [levelsRes, language]
  );
  const currentReviews = user?.totalReviewsApproved || 0;
  const levelCalc = useMemo(
    () => calculateUserLevel(currentPoints, currentReviews, effectiveLevels),
    [currentPoints, currentReviews, effectiveLevels]
  );

  const currentLevel = levelCalc.currentLevelNumber;
  const nextLevel = levelCalc.nextLevelData;
  const nextLevelIndex = levelCalc.nextLevelNumber;
  const pointsUntilNextLevel = levelCalc.pointsNeededForNext;
  const reviewsUntilNextLevel = levelCalc.reviewsNeededForNext;
  const progressToNextLevel = Math.round(levelCalc.percent);

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-4 sm:p-8 border border-gray-200 dark:border-slate-800 space-y-4 sm:space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-0.5">
            {t("contributions.your_contributions")}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
            {t("contributions.track_impact")}
          </p>
        </div>

        <Button
          onClick={() => setIsRecommendOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl h-11 px-4 text-xs sm:text-sm shrink-0 cursor-pointer shadow-md shadow-amber-500/20 inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>{t("recommend.recommend_spot") || "Recommend Spot"}</span>
        </Button>
      </div>

      {/* Statistics Grid - 5 KPIs Overview */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-slate-900/60 rounded-xl p-3 sm:p-6 border border-gray-100 dark:border-slate-800 h-20 sm:h-28 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {/* Total Points */}
          <div className="bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center">
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.total_points")}
            </p>
            {hasPurchasedMap ? (
              <p className="text-lg sm:text-4xl font-extrabold text-amber-500">{currentPoints}</p>
            ) : (
              <p className="text-sm sm:text-2xl font-extrabold text-gray-400 dark:text-slate-500 flex items-center justify-center gap-1">
                <Lock size={15} /> 0
              </p>
            )}
          </div>

          {/* Approved Reviews */}
          <div
            onClick={() => onTabChange?.("reviews")}
            className={`bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border flex flex-col justify-center transition-colors ${
              onTabChange ? "cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-500/10" : ""
            } ${
              activeTab === "reviews"
                ? "border-amber-400/70 shadow-xs"
                : "border-gray-100 dark:border-slate-800/80"
            }`}
          >
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.approved_reviews")}
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">{user?.totalReviewsApproved || 0}</p>
          </div>

          {/* Approved Recommended Places */}
          <div
            onClick={() => onTabChange?.("spots")}
            className={`bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border flex flex-col justify-center transition-colors ${
              onTabChange ? "cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-500/10" : ""
            } ${
              activeTab === "spots"
                ? "border-amber-400/70 shadow-xs"
                : "border-gray-100 dark:border-slate-800/80"
            }`}
          >
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.approved_recommendations") || "Lugares Aprobados"}
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">{approvedSpotsCount}</p>
          </div>

          {/* Visited Places */}
          <Link
            href="/profile/visited-places"
            className="bg-gray-50 dark:bg-[#0e1424] hover:bg-amber-500/10 dark:hover:bg-amber-500/10 transition-colors rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center cursor-pointer group"
          >
            <p className="text-gray-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("nav.visited_places") || "Visited Places"}
            </p>
            <p className="text-lg sm:text-4xl font-extrabold text-amber-500">
              {user?.visitedPlacesCount || 0}
            </p>
          </Link>

          {/* Level */}
          <div className="bg-gray-50 dark:bg-[#0e1424] rounded-xl p-2.5 sm:p-6 text-center border border-gray-100 dark:border-slate-800/80 flex flex-col justify-center col-span-2 sm:col-span-1">
            <p className="text-gray-500 dark:text-slate-400 text-[9px] sm:text-xs font-semibold tracking-tight sm:tracking-wide mb-1 leading-tight uppercase">
              {t("contributions.current_level")}
            </p>
            {hasPurchasedMap ? (
              <p className="text-lg sm:text-4xl font-extrabold text-amber-500">Lv {currentLevel}</p>
            ) : (
              <p className="text-sm sm:text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                <Lock size={15} />
                <span>{t("levels.locked_feature") || "Locked"}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress Section */}
      {hasPurchasedMap ? (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-slate-800">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">
              {t("contributions.progress_to_level")} {nextLevelIndex}: <span className="text-amber-600 dark:text-amber-400 font-bold">{levelCalc.nextLevelName}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mb-2">
              {pointsUntilNextLevel} {t("contributions.pts")}{nextLevel.reviews ? ` ${t("contributions.and")} ${reviewsUntilNextLevel} ${t("contributions.reviews_until_next")}` : ""}
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
      ) : (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 text-amber-500">
              <Lock size={20} />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-slate-100">
                {t("levels.locked_title") || "Levels & Rewards are Locked"}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {t("levels.locked_contributions_desc") || "Levels and rewards are exclusively for users who have purchased maps. Purchase a map to level up and earn free rewards!"}
              </p>
            </div>
          </div>
          <Link href="/catalog" className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#fabf13] hover:bg-[#e0ac10] text-black font-bold text-xs h-10 px-5 rounded-xl shadow-md cursor-pointer">
              {t("map.buy_map") || "Buy Map"}
            </Button>
          </Link>
        </div>
      )}

      <RecommendSpotModal
        open={isRecommendOpen}
        onOpenChange={setIsRecommendOpen}
      />
    </div>
  );
}
