"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGetUserByIdQuery } from "@/redux/features/user/userApi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLocalized, getImageUrl } from "@/lib/utils";
import {
  Map as MapIcon,
  Gift,
  Award as AwardIcon,
  MessageSquare,
  Sparkles,
  Calendar,
  Mail,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
} from "lucide-react";

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({
  userId,
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"maps" | "prizes" | "contributions">("maps");

  const { data: user, isLoading } = useGetUserByIdQuery(userId || "", {
    skip: !userId || !isOpen,
  });

  if (!isOpen) return null;

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const levelInfo = user?.levelInfo || {};
  const purchasedMaps = user?.purchasedMaps || [];
  const offerRedemptions = user?.offerRedemptions || [];
  const awards = user?.awards || [];
  const reviews = user?.reviews || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 gap-0 border border-gray-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#131b2e]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
              {t("users_admin.loading_profile") || "Loading user profile..."}
            </p>
          </div>
        ) : !user ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            {t("users_admin.user_not_found") || "User profile not found."}
          </div>
        ) : (
          <div>
            {/* Header Banner */}
            <div className="relative bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 p-6 pt-8 text-white rounded-t-3xl overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                <Sparkles size={180} />
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
                <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg">
                  <AvatarImage src={getImageUrl(user.profile)} alt={user.name} />
                  <AvatarFallback className="bg-amber-800 text-white font-bold text-xl">
                    {user.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-black text-white">{user.name || "User"}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                      {user.role}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        user.status === "active"
                          ? "bg-emerald-500/30 text-emerald-100"
                          : "bg-red-500/30 text-red-100"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-amber-100 font-medium">
                    <span className="flex items-center gap-1">
                      <Mail size={13} />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {t("profile.joined") || "Joined"}: {formatDate(user.createdAt)}
                    </span>
                    {user.country && (
                      <span className="flex items-center gap-1">
                        <Globe size={13} />
                        {user.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Overview Pill */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/20 text-center">
                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-amber-100 tracking-wider">
                    {t("users_admin.level") || "Level & Tier"}
                  </p>
                  <p className="text-base font-black text-white">
                    Nvl {levelInfo?.levelNumber ?? user.level ?? 0}
                  </p>
                  <p className="text-[10px] text-amber-200 truncate">
                    {levelInfo?.title || "Explorador"}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-amber-100 tracking-wider">
                    {t("users_admin.xp_points") || "XP Points"}
                  </p>
                  <p className="text-base font-black text-white">{user.points || 0} XP</p>
                  <p className="text-[10px] text-amber-200">
                    {user.totalReviewsApproved || 0} {t("users_admin.reviews") || "Reviews"}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-amber-100 tracking-wider">
                    {t("users_admin.activated_maps") || "Activated Maps"}
                  </p>
                  <p className="text-base font-black text-white">{purchasedMaps.length}</p>
                  <p className="text-[10px] text-amber-200">
                    {offerRedemptions.length} {t("users_admin.prizes") || "Offers Claimed"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body Tabs */}
            <div className="p-6 bg-gray-50/50 dark:bg-[#0b0f19]">
              <div className="grid grid-cols-3 bg-gray-200/70 dark:bg-slate-900/80 p-1 rounded-2xl mb-4">
                <button
                  onClick={() => setActiveTab("maps")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "maps"
                      ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  <MapIcon size={14} />
                  <span>{t("users_admin.activated_maps") || "Activated Maps"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("prizes")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "prizes"
                      ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Gift size={14} />
                  <span>{t("users_admin.prizes_claimed") || "Prizes & Rewards"}</span>
                </button>

                <button
                  onClick={() => setActiveTab("contributions")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "contributions"
                      ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>{t("users_admin.contributions") || "Contributions"}</span>
                </button>
              </div>

              {/* Tab 1: Activated Maps */}
              {activeTab === "maps" && (
                <div className="space-y-3">
                  {purchasedMaps.length === 0 ? (
                    <div className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 rounded-2xl p-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                      <MapIcon size={24} className="mx-auto mb-2 opacity-40" />
                      {t("users_admin.no_activated_maps") || "No activated maps for this user."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {purchasedMaps.map((mapItem: any) => (
                        <div
                          key={mapItem._id}
                          className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 font-black overflow-hidden">
                            {mapItem.coverPhoto || mapItem.images?.[0] ? (
                              <img
                                src={getImageUrl(mapItem.coverPhoto || mapItem.images?.[0])}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <MapIcon size={20} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                              {getLocalized(mapItem.name, language)}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                              {mapItem.country || "Puerto Rico"}
                            </p>
                          </div>
                          <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-[10px]">
                            {t("users_admin.active") || "Active"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Prizes & Rewards Claimed */}
              {activeTab === "prizes" && (
                <div className="space-y-4">
                  {/* Claimed Free Map */}
                  {user.redeemedFreeMap && (
                    <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                          <Gift size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                            {t("users_admin.free_map_claimed") || "Free Map Claimed Reward"}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                            {getLocalized(user.redeemedFreeMap.name, language)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-600 text-white text-[10px]">
                        {t("users_admin.claimed") || "Claimed"}
                      </Badge>
                    </div>
                  )}

                  {/* Redeemed Offers */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      {t("users_admin.redeemed_offers") || "Redeemed Offers"} ({offerRedemptions.length})
                    </p>
                    {offerRedemptions.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 p-4 rounded-xl text-center">
                        {t("users_admin.no_redeemed_offers") || "No offers redeemed yet."}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {offerRedemptions.map((item: any) => (
                          <div
                            key={item._id}
                            className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-gray-900 dark:text-slate-100">
                                {getLocalized(item.offer?.title, language) || "Special Offer"}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-slate-400">
                                {item.offer?.place?.name
                                  ? getLocalized(item.offer.place.name, language)
                                  : item.offer?.business?.name
                                    ? getLocalized(item.offer.business.name, language)
                                    : "General Offer"}
                              </p>
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                              {formatDate(item.createdAt || item.redemptionTime)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Badges / Awards Progress */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      {t("users_admin.unlocked_badges") || "Achievement Badges & Rewards"} ({awards.length})
                    </p>
                    {awards.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 p-4 rounded-xl text-center">
                        {t("users_admin.no_badges") || "No badges available."}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {awards.map((awardItem: any) => (
                          <div
                            key={awardItem._id}
                            className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                              awardItem.isUnlocked
                                ? "bg-white dark:bg-[#131b2e] border-amber-200 dark:border-amber-800/60 shadow-2xs"
                                : "bg-gray-100/70 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 opacity-60"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                              {awardItem.configId?.coverPhoto ? (
                                <img
                                  src={getImageUrl(awardItem.configId.coverPhoto)}
                                  alt=""
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <AwardIcon size={16} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 dark:text-slate-100 truncate">
                                {getLocalized(awardItem.configId?.title, language) || awardItem.type}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-slate-400">
                                {awardItem.progress} / {awardItem.target} XP
                              </p>
                            </div>
                            {awardItem.isUnlocked ? (
                              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Clock size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Contributions & Reviews */}
              {activeTab === "contributions" && (
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 rounded-2xl p-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                      <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                      {t("users_admin.no_contributions") || "No reviews or contributions submitted yet."}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {reviews.map((rev: any) => (
                        <div
                          key={rev._id}
                          className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 p-4 rounded-2xl shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-900 dark:text-slate-100">
                              {rev.placeId?.name
                                ? getLocalized(rev.placeId.name, language)
                                : rev.businessId?.name
                                  ? getLocalized(rev.businessId.name, language)
                                  : "Location Review"}
                            </p>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                              {formatDate(rev.createdAt)}
                            </span>
                          </div>
                          {rev.review && (
                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed italic">
                              "{rev.review?.en || rev.review?.es || rev.review}"
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              ⭐ {rev.rating || 5}.0 Rating
                            </span>
                            <Badge
                              className={`text-[9px] ${
                                rev.status === "Approved"
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                              }`}
                            >
                              {rev.status || "Approved"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
