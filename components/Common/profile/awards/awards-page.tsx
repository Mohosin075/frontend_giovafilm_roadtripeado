"use client";

import {
  Utensils,
  MessageSquare,
  Mountain,
  Feather,
  Trophy,
  FileText,
  Map as MapIcon,
  Compass,
  Lock,
  Ticket,
} from "lucide-react";
import { appAlert } from "@/lib/app-alert";
import { AwardCard } from "./award-card";
import { UnlockedAwardCard } from "./unlocked-award-card";
import { AwardDetailModal } from "./award-detail-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetAwardsQuery, useGetLevelConfigsQuery } from "@/redux/features/award/awardApi";
import { getEffectiveLevels, calculateUserLevel } from "@/lib/level-utils";
import { useMemo } from "react";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import Link from "next/link";

import unlockImage from "@/public/offers-image/Gourmet Garden.png";
import Image from "next/image";
import { getImageUrl, getLocalized, downloadFileWithCustomName } from "@/lib/utils";
import { NoImage } from "@/lib/others/others";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";

const getAwardIcon = (type: string) => {
  switch (type) {
    case "Gourmet Guide":
      return Utensils;
    case "Top Reviewer":
      return MessageSquare;
    case "Trail Master":
      return Mountain;
    case "History Buff":
      return Feather;
    case "PDF Itinerary":
      return FileText;
    case "Free Map":
      return MapIcon;
    case "Legendary Explorer":
      return Compass;
    default:
      return Trophy;
  }
};

const getAwardImage = (type: string) => {
  return unlockImage;
};

export default function AwardsPage() {
  const { t, language } = useLanguage();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [activeFilter, setActiveFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedAward, setSelectedAward] = useState<any | null>(null);
  const [downloadingAwardId, setDownloadingAwardId] = useState<string | null>(null);

  const handleDownloadAwardPdf = async (e: React.MouseEvent, award: any) => {
    e.stopPropagation();
    if (!award?.config?.fileUrl || downloadingAwardId) return;
    setDownloadingAwardId(award._id);
    const rawTitle = award.config?.title || award.title || award.type;
    const title = getLocalized(rawTitle, language);
    const downloadFileName =
      award.config?.originalFileName ||
      award.originalFileName ||
      `${(title || "Itinerario").replace(/[<>:"/\\|?*]/g, "_").trim()}.pdf`;

    const configId = award.config?._id || award.configId;
    const downloadTarget = configId
      ? getImageUrl(`/api/v1/awards/configs/${configId}/download`)
      : getImageUrl(award.config.fileUrl);

    try {
      await downloadFileWithCustomName(downloadTarget, downloadFileName);
      toast.success(
        t("awards.download_started") || "Download started..."
      );
    } catch {
      if (award.config?.fileUrl) {
        window.open(getImageUrl(award.config.fileUrl), "_blank");
      }
    } finally {
      setTimeout(() => {
        setDownloadingAwardId(null);
      }, 1500);
    }
  };

  const { data: user, isLoading: isProfileLoading } = useGetProfileQuery({});
  const { data: awardsRes, isLoading } = useGetAwardsQuery({ page, limit });

  const awardsData = awardsRes?.data || [];
  const meta = awardsRes?.meta || { total: 0, page: 1, limit: 10 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const sortedAwards = [...awardsData].sort((a: any, b: any) => (a.target || 0) - (b.target || 0));
  const lockedAwards = sortedAwards.filter((a: any) => !a.isUnlocked);
  const unlockedAwards = sortedAwards.filter((a: any) => a.isUnlocked);

  const totalFreeMapsEarned = awardsData
    .filter((a: any) => a.type === "Free Map" && a.isUnlocked)
    .reduce((acc: number, a: any) => acc + (Number(a.config?.mapCount) || 1), 0);
  const redeemedCount = Array.isArray(user?.redeemedFreeMaps) && user.redeemedFreeMaps.length > 0
    ? user.redeemedFreeMaps.length
    : (user?.redeemedFreeMap ? 1 : 0);
  const hasFreeMapAvailable = totalFreeMapsEarned > redeemedCount;
  const hasRedeemed = totalFreeMapsEarned > 0 && !hasFreeMapAvailable;

  const purchasedMaps = Array.isArray(user?.purchasedMaps) ? user.purchasedMaps : [];
  const isAdminOrEditor = ["super_admin", "admin", "map_editor"].includes(user?.role || "");
  const hasPurchasedMap = isAdminOrEditor || purchasedMaps.length > 0;

  const promptPurchaseMap = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    appAlert.fire({
      title: t("levels.locked_title") || "Levels & Rewards Locked",
      text: t("levels.locked_hero_desc") || "Levels and rewards are exclusively for users who have purchased maps. Purchase a map to level up and earn free rewards!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: t("map.buy_map") || "Buy Map",
      cancelButtonText: t("common.cancel") || "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/catalog";
      }
    });
  };

    // Dynamic Level progression math synchronized with Dashboard (Issue 7)
  const { data: levelsRes } = useGetLevelConfigsQuery();
  const effectiveLevels = useMemo(
    () => getEffectiveLevels(levelsRes, language),
    [levelsRes, language]
  );

  const points = user?.points || 0;
  const approvedReviews = user?.totalReviewsApproved || 0;
  const levelCalc = useMemo(
    () => calculateUserLevel(points, approvedReviews, effectiveLevels),
    [points, approvedReviews, effectiveLevels]
  );

  const currentLevel = levelCalc.currentLevelNumber;
  const currentLevelName = levelCalc.currentLevelName;
  const nextLevelData = levelCalc.nextLevelData;
  const nextLevelIndex = levelCalc.nextLevelNumber;
  const pointsNeededForNext = levelCalc.pointsNeededForNext;
  const percent = levelCalc.percent;
  const strokeDashoffset = levelCalc.strokeDashoffset;
  const isMaxLevel = levelCalc.isMaxLevel;

  return (
    <div className="py-3 md:py-12 bg-white dark:bg-[#0b0f19] min-h-screen transition-colors">
      <div className="max-w-360 mx-auto px-3 md:px-6 font-public-sans">
        {/* Page Title */}
        <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-5 uppercase tracking-wide text-gray-900 dark:text-slate-100">
          {t("awards.page_title") || "Awards & Achievements"}
        </h1>

        {!isProfileLoading && !hasPurchasedMap ? (
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-amber-950/40 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-amber-500/30 dark:border-amber-600/40 mb-4 md:mb-8 shadow-lg backdrop-blur-md animate-in fade-in">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-7 text-center md:text-left">
              <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#fabf13] to-amber-600 flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/25 text-black">
                <Lock className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 bg-black/80 dark:bg-black/60 text-[#fabf13] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
                  <Lock size={12} />
                  <span>{t("levels.locked_feature") || "Feature Locked"}</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                  {t("levels.locked_title") || "Levels & Rewards are Locked"}
                </h2>
                <p className="text-gray-600 dark:text-slate-300 text-xs md:text-sm mt-1.5 leading-relaxed max-w-2xl">
                  {t("levels.locked_hero_desc") || "Levels and rewards are exclusively for users who have purchased maps. Purchase a map to level up, earn XP points, and unlock free rewards like PDF itineraries, exclusive discounts, and free maps!"}
                </p>
              </div>
              <Link href="/catalog" className="shrink-0 w-full md:w-auto">
                <Button className="w-full md:w-auto bg-[#fabf13] hover:bg-[#e0ac10] text-black font-extrabold text-xs md:text-sm px-6 md:px-8 py-5 md:py-6 rounded-xl shadow-xl shadow-amber-500/30 hover:scale-105 transition-all cursor-pointer">
                  <Ticket className="w-4 h-4 mr-2" />
                  {t("levels.purchase_map_cta") || "Purchase a Map to Unlock"}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 dark:bg-amber-950/20 p-2.5 md:p-6 rounded-xl md:rounded-3xl flex flex-row items-center justify-between border border-amber-500/15 dark:border-amber-800/40 mb-4 md:mb-8 shadow-sm">
            {/* LEFT: Progress Circle */}
            <div className="relative w-14 h-14 md:w-36 md:h-36 flex items-center justify-center shrink-0">
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#f3f4f6"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#f59e0b"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="text-center">
                {isProfileLoading ? (
                  <>
                    <div className="mx-auto h-3 w-10 bg-gray-200 dark:bg-slate-800 animate-pulse rounded" />
                    <p className="text-[6px] md:text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                      {t("awards.xp_points") || "XP POINTS"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs sm:text-base md:text-2xl font-extrabold text-gray-900 dark:text-slate-100 leading-none">
                      {points.toLocaleString()}
                    </p>
                    <p className="text-[6px] md:text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 leading-none">
                      {t("awards.xp_points") || "XP POINTS"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1 ml-2 md:ml-8 text-left w-full">
              {/* Level badge */}
              <span className="inline-block bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 md:px-4 md:py-1 rounded-full text-[8px] md:text-xs font-bold mb-0.5 md:mb-2 uppercase tracking-wider">
                {isProfileLoading
                  ? (t("common.loading") || "Loading...")
                  : `🏆 ${t("awards.level") || "Level"} ${currentLevel} · ${currentLevelName}`}
              </span>

              {/* Name */}
              <h2 className="text-xs sm:text-base md:text-xl font-bold text-gray-900 dark:text-slate-100 capitalize leading-tight">
                {isProfileLoading ? (
                  <span className="inline-block h-4 w-20 bg-gray-200 dark:bg-slate-800 animate-pulse rounded" />
                ) : (
                  user?.name || "Explorer"
                )}
              </h2>

              {/* Description */}
              <p className="hidden md:block text-gray-500 dark:text-slate-400 mt-1.5 text-sm leading-relaxed max-w-xl">
                {t("awards.progress_msg_prefix") || "You're making incredible progress! Earn "}
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  {pointsNeededForNext.toLocaleString()} {t("awards.more_xp") || "more XP"}
                </span>{" "}
                {t("awards.to_reach") || "to reach"} {t("awards.level") || "Level"} {nextLevelData.level}.
              </p>

              {/* Cards */}
              <div className="flex gap-1.5 md:gap-3 mt-1 md:mt-3 w-full">
                <div className="bg-white/80 dark:bg-[#131b2e]/80 border border-gray-100 dark:border-slate-800 px-2 py-1 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex-1 md:flex-none md:w-36 shadow-sm">
                  <p className="text-[6px] md:text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">{t("common.next_level")}</p>
                  <p className="font-extrabold text-gray-800 dark:text-slate-200 mt-0.5 text-[9px] md:text-xs leading-none">
                    {isMaxLevel ? (t("awards.max_level") || "Max Level") : `${t("awards.level") || "Level"} ${nextLevelData.level} · ${levelCalc.nextLevelName}`}
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-[#131b2e]/80 border border-gray-100 dark:border-slate-800 px-2 py-1 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex-1 md:flex-none md:w-36 shadow-sm">
                  <p className="text-[6px] md:text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                    {t("awards.level_progress") || "LEVEL PROGRESS"}
                  </p>
                  <p className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 text-[9px] md:text-xs leading-none">{Math.round(percent)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 md:pb-4 mb-4 md:mb-8 gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-slate-100">
                {t("awards.vault_title") || "Achievement Vault"}
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-[11px] md:text-xs mt-0.5">
                {t("awards.vault_subtitle") || "Earn XP by discovering and reviewing places to unlock exclusive rewards."}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-gray-100 dark:bg-slate-900/80 p-0.5 md:p-1 rounded-xl self-start md:self-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${activeFilter === "all"
                    ? "bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
              >
                {t("awards.all_trophies") || "All Trophies"}
              </button>
              <button
                onClick={() => setActiveFilter("unlocked")}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${activeFilter === "unlocked"
                    ? "bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
              >
                {(t("awards.unlocked_count") || "Unlocked ({count})").replace("{count}", String(unlockedAwards.length))}
              </button>
              <button
                onClick={() => setActiveFilter("locked")}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${activeFilter === "locked"
                    ? "bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
              >
                {(t("awards.in_progress_count") || "In Progress ({count})").replace("{count}", String(lockedAwards.length))}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Unified Symmetrical Awards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 items-stretch">
                {sortedAwards
                  .filter((award: any) => {
                    if (activeFilter === "unlocked") return award.isUnlocked;
                    if (activeFilter === "locked") return !award.isUnlocked;
                    return true;
                  })
                  .map((award: any) => {
                    if (award.isUnlocked) {
                      const rewardImage = award.config?.coverPhoto
                        ? getImageUrl(award.config.coverPhoto)
                        : getAwardImage(award.type);
                      return (
                        <UnlockedAwardCard
                          key={award._id}
                          title={getLocalized(award.config?.title || award.type, language)}
                          description={getLocalized(award.config?.description, language)}
                          image={rewardImage}
                          onClick={() => hasPurchasedMap ? setSelectedAward(award) : promptPurchaseMap()}
                        >
                          {award.type === "Free Map" ? (
                            <div className="pt-1.5">
                              {isProfileLoading ? (
                                <Button className="w-full bg-gray-200 text-gray-400 font-bold cursor-default text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none" disabled>
                                  {t("common.loading") || "Loading..."}
                                </Button>
                              ) : !hasPurchasedMap ? (
                                <Button
                                  onClick={(e) => promptPurchaseMap(e)}
                                  className="w-full bg-[#fabf13] hover:bg-[#e0ac10] text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Lock size={13} />
                                  <span>{t("levels.locked_feature") || "Locked"}</span>
                                </Button>
                              ) : hasRedeemed ? (
                                <Button className="w-full bg-gray-300 text-gray-500 font-bold cursor-default text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none" disabled>
                                  {t("awards.used") || "Used"}
                                </Button>
                              ) : (
                                <Link
                                  href="/catalog?redeemFreeMap=1"
                                  className="block w-full"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm shadow-amber-200/50 cursor-pointer">
                                    {t("awards.redeem_now") || "Redeem Now"}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          ) : award.config?.fileUrl ? (
                            <div className="pt-1.5">
                              <Button
                                onClick={(e) => hasPurchasedMap ? handleDownloadAwardPdf(e, award) : promptPurchaseMap(e)}
                                disabled={downloadingAwardId === award._id}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm shadow-emerald-200/50 cursor-pointer"
                              >
                                {!hasPurchasedMap ? (
                                  <span className="flex items-center justify-center gap-1.5">
                                    <Lock size={13} />
                                    <span>{t("levels.locked_feature") || "Locked"}</span>
                                  </span>
                                ) : downloadingAwardId === award._id ? (
                                  t("awards.downloading") || "Downloading..."
                                ) : (
                                  t("awards.download_pdf") || "Download PDF"
                                )}
                              </Button>
                            </div>
                          ) : award.type?.includes("Discount") || award.type?.includes("10%") || award.config?.discountPercentage ? (
                            <div className="pt-1.5">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  hasPurchasedMap ? setSelectedAward(award) : promptPurchaseMap();
                                }}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm shadow-amber-200/50 cursor-pointer"
                              >
                                {!hasPurchasedMap ? (
                                  <span className="flex items-center justify-center gap-1.5">
                                    <Lock size={13} />
                                    <span>{t("levels.locked_feature") || "Locked"}</span>
                                  </span>
                                ) : (
                                  t("awards.use_discount") || "Use Discount"
                                )}
                              </Button>
                            </div>
                          ) : null}
                        </UnlockedAwardCard>
                      );
                    } else {
                      const percent = Math.min(
                        Math.round((award.progress / award.target) * 100),
                        100,
                      );
                      const coverPhoto = award.config?.coverPhoto
                        ? getImageUrl(award.config.coverPhoto)
                        : undefined;
                      return (
                        <AwardCard
                          key={award._id}
                          title={getLocalized(award.config?.title || award.type, language)}
                          description={getLocalized(award.config?.description, language)}
                          progress={percent}
                          current={award.progress}
                          total={award.target}
                          coverPhoto={coverPhoto}
                          Icon={getAwardIcon(award.type)}
                          onClick={() => hasPurchasedMap ? setSelectedAward(award) : promptPurchaseMap()}
                        />
                      );
                    }
                  })}
              </div>

              {/* Empty States */}
              {awardsData.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  {t("awards.no_awards_found") || "No awards found. Check back later!"}
                </div>
              ) : activeFilter === "unlocked" && unlockedAwards.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  {t("awards.no_unlocked_yet") || "No unlocked awards yet. Keep exploring to earn rewards!"}
                </div>
              ) : activeFilter === "locked" && lockedAwards.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  {t("awards.no_awards_in_progress") || "No awards in progress right now."}
                </div>
              ) : null}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 bg-gray-50 dark:bg-[#131b2e] p-4 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    {t("common.previous") || "Previous"}
                  </Button>
                  <span className="text-gray-600 dark:text-slate-300 font-bold px-4">
                    {t("visited.page") || "Page"} {page} {t("visited.of") || "of"} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    {t("common.next") || "Next"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Award Detail Modal */}
      <AwardDetailModal
        isOpen={!!selectedAward}
        onClose={() => setSelectedAward(null)}
        award={selectedAward}
        user={user}
      />
    </div>
  );
}
