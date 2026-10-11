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
} from "lucide-react";
import { AwardCard } from "./award-card";
import { UnlockedAwardCard } from "./unlocked-award-card";
import { AwardDetailModal } from "./award-detail-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetAwardsQuery } from "@/redux/features/award/awardApi";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import Link from "next/link";

import unlockImage from "@/public/offers-image/Gourmet Garden.png";
import Image from "next/image";
import { getImageUrl, getLocalized, downloadFileWithCustomName } from "@/lib/utils";
import { NoImage } from "@/lib/others/others";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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

const USER_LEVELS = [
  { level: 0, name: "Explorador", points: 0, reviews: 0 },
  { level: 1, name: "Aventurero", points: 100, reviews: 6 },
  { level: 2, name: "Tlacuilo", points: 200, reviews: 13 },
  { level: 3, name: "Expedicionario", points: 400, reviews: 26 },
  { level: 4, name: "Viajero", points: 700, reviews: 46 },
  { level: 5, name: "Chasqui", points: 1300, reviews: 86 },
  { level: 6, name: "Cronista", points: 2200, reviews: 146 },
  { level: 7, name: "Baquiano", points: 3500, reviews: 233 },
  { level: 8, name: "Cartógrafo", points: 5500, reviews: 366 },
  { level: 9, name: "Maestro Ruta", points: 8500, reviews: 566 },
  { level: 10, name: "Leyenda", points: 13000, reviews: 866 },
  { level: 11, name: "Gran Leyenda", points: 20000, reviews: 1333 },
  { level: 12, name: "Mítico", points: 30000, reviews: 2000 },
  { level: 13, name: "Inmortal", points: 45000, reviews: 3000 },
  { level: 14, name: "Supremo", points: 65000, reviews: 4333 },
];

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
    } catch {
      if (award.config?.fileUrl) {
        window.open(getImageUrl(award.config.fileUrl), "_blank");
      }
    } finally {
      setDownloadingAwardId(null);
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

  const hasRedeemed = !!user?.redeemedFreeMap;

  // Accurate Level progression math based on spec
  const points = user?.points || 0;
  const currentLevel = user?.level ?? 0;
  const currentLevelData = USER_LEVELS[currentLevel] || USER_LEVELS[0];
  const nextLevelIndex = currentLevel < 14 ? currentLevel + 1 : 14;
  const nextLevelData = USER_LEVELS[nextLevelIndex];

  const getUserLevelName = (lvlIdx: number) => {
    const keys = [
      "explorador", "aventurero", "tlacuilo", "expedicionario", "viajero",
      "chasqui", "cronista", "baquiano", "cartografo", "maestro_ruta",
      "leyenda", "gran_leyenda", "mitico", "inmortal", "supremo"
    ];
    const key = keys[lvlIdx] || "explorador";
    return t(`levels.${key}`) || USER_LEVELS[lvlIdx]?.name || "Explorer";
  };

  const currentLevelMinPoints = currentLevelData.points;
  const nextLevelMinPoints = nextLevelData.points;
  const pointsNeededForNext = Math.max(0, nextLevelMinPoints - points);
  const pointsSpan = Math.max(1, nextLevelMinPoints - currentLevelMinPoints);
  const percent =
    currentLevel >= 14
      ? 100
      : Math.min(100, Math.max(0, ((points - currentLevelMinPoints) / pointsSpan) * 100));
  const strokeDashoffset = 440 - (440 * percent) / 100;

  return (
    <div className="py-3 md:py-12 bg-white dark:bg-[#0b0f19] min-h-screen transition-colors">
      <div className="max-w-360 mx-auto px-3 md:px-6 font-public-sans">
        {/* Page Title */}
        <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-5 uppercase tracking-wide text-gray-900 dark:text-slate-100">
          {language === "es" ? "PREMIOS Y LOGROS" : "Awards & Achievements"}
        </h1>

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
                    {language === "es" ? "PUNTOS XP" : "XP POINTS"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-base md:text-2xl font-extrabold text-gray-900 dark:text-slate-100 leading-none">
                    {points.toLocaleString()}
                  </p>
                  <p className="text-[6px] md:text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 leading-none">
                    {language === "es" ? "PUNTOS XP" : "XP POINTS"}
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
                ? (language === "es" ? "Cargando..." : "Loading...")
                : `🏆 ${language === "es" ? "Nivel" : "Level"} ${currentLevel} · ${getUserLevelName(currentLevel)}`}
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
              {language === "es" ? "¡Estás haciendo un progreso increíble! Gana " : "You're making incredible progress! Earn "}
              <span className="font-bold text-gray-900 dark:text-slate-200">
                {pointsNeededForNext.toLocaleString()} {language === "es" ? "XP más" : "more XP"}
              </span>{" "}
              {language === "es"
                ? "para desbloquear el siguiente nivel y acceder a nuevas recompensas premium."
                : "to unlock the next level and access new premium rewards."}
            </p>

            {/* Cards */}
            <div className="flex gap-1.5 md:gap-3 mt-1 md:mt-3 w-full">
              <div className="bg-white/80 dark:bg-[#131b2e]/80 border border-gray-100 dark:border-slate-800 px-2 py-1 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex-1 md:flex-none md:w-36 shadow-sm">
                <p className="text-[6px] md:text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">{t("common.next_level")}</p>
                <p className="font-extrabold text-gray-800 dark:text-slate-200 mt-0.5 text-[9px] md:text-xs leading-none">
                  {currentLevel >= 14 ? (language === "es" ? "Nivel Máximo" : "Max Level") : `${language === "es" ? "Nivel" : "Level"} ${nextLevelData.level} · ${getUserLevelName(nextLevelIndex)}`}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#131b2e]/80 border border-gray-100 dark:border-slate-800 px-2 py-1 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex-1 md:flex-none md:w-36 shadow-sm">
                <p className="text-[6px] md:text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  {language === "es" ? "PROGRESO DEL NIVEL" : "LEVEL PROGRESS"}
                </p>
                <p className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 text-[9px] md:text-xs leading-none">{Math.round(percent)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 md:pb-4 mb-4 md:mb-8 gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide text-gray-900 dark:text-slate-100">
                {language === "es" ? "Bóveda de Logros" : "Achievement Vault"}
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-[11px] md:text-xs mt-0.5">
                {language === "es"
                  ? "Colecciona trofeos y desbloquea beneficios de viaje exclusivos."
                  : "Collect trophies and unlock premium travel perks."}
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 dark:bg-slate-900/80 p-0.5 md:p-1 rounded-xl self-start md:self-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${
                  activeFilter === "all"
                    ? "bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                {language === "es" ? "Todos los Trofeos" : "All Trophies"}
              </button>
              <button
                onClick={() => setActiveFilter("unlocked")}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${
                  activeFilter === "unlocked"
                    ? "bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                {language === "es" ? `Desbloqueados (${unlockedAwards.length})` : `Unlocked (${unlockedAwards.length})`}
              </button>
              <button
                onClick={() => setActiveFilter("locked")}
                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all ${
                  activeFilter === "locked"
                    ? "bg-white dark:bg-[#131b2e] text-gray-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                {language === "es" ? `En Progreso (${lockedAwards.length})` : `In Progress (${lockedAwards.length})`}
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
                          onClick={() => setSelectedAward(award)}
                        >
                          {award.type === "Free Map" ? (
                            <div className="pt-1.5">
                              {isProfileLoading ? (
                                <Button className="w-full bg-gray-200 text-gray-400 font-bold cursor-default text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none" disabled>
                                  {language === "es" ? "Cargando..." : "Loading..."}
                                </Button>
                              ) : hasRedeemed ? (
                                <Button className="w-full bg-gray-300 text-gray-500 font-bold cursor-default text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none" disabled>
                                  {language === "es" ? "Canjeado" : "Used"}
                                </Button>
                              ) : (
                                <Link
                                  href="/catalog?redeemFreeMap=1"
                                  className="block w-full"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm shadow-amber-200/50 cursor-pointer">
                                    {language === "es" ? "Canjear Ahora" : "Redeem Now"}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          ) : award.config?.fileUrl ? (
                            <div className="pt-1.5">
                              <Button
                                onClick={(e) => handleDownloadAwardPdf(e, award)}
                                disabled={downloadingAwardId === award._id}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm shadow-emerald-200/50 cursor-pointer"
                              >
                                {downloadingAwardId === award._id
                                  ? (language === "es" ? "Descargando..." : "Downloading...")
                                  : (language === "es" ? "Descargar PDF" : "Download PDF")}
                              </Button>
                            </div>
                          ) : award.type?.includes("Discount") || award.type?.includes("10%") || award.config?.discountPercentage ? (
                            <div className="pt-1.5">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAward(award);
                                }}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider h-10 sm:h-11 rounded-xl border-none shadow-sm shadow-amber-200/50 cursor-pointer"
                              >
                                {language === "es" ? "Usar Descuento" : "Use Discount"}
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
                          onClick={() => setSelectedAward(award)}
                        />
                      );
                    }
                  })}
              </div>

              {/* Empty States */}
              {awardsData.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  No awards found. Check back later!
                </div>
              ) : activeFilter === "unlocked" && unlockedAwards.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  No unlocked awards yet. Keep exploring to earn rewards!
                </div>
              ) : activeFilter === "locked" && lockedAwards.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium">
                  No awards in progress right now.
                </div>
              ) : null}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 bg-gray-50 p-4 rounded-xl border">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="bg-white"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600 font-bold px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="bg-white"
                  >
                    Next
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
