"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getImageUrl, getLocalized } from "@/lib/utils";
import { UserProfileModal } from "@/components/dashboard/users-roles/user-profile-modal";
import {
  Users,
  TrendingUp,
  Calendar,
  UserCheck,
  MapPin,
  Ticket,
  Star,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface IUserActivityItem {
  id: string;
  type: "visit" | "review" | "redemption" | "registration";
  userId?: string;
  userName: string;
  userEmail?: string;
  userProfile?: string;
  title: string;
  subtitle?: string;
  targetId?: string;
  targetType?: "place" | "business" | "offer" | "map";
  timestamp: string | Date;
}

export interface IUserActivityStats {
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  totalRegisteredUsers: number;
  totalPlacesVisited: number;
  totalOffersRedeemed: number;
  totalReviews: number;
  recentActivities: IUserActivityItem[];
}

export function UserActivityOverview({ data }: { data?: IUserActivityStats }) {
  const { t } = useLanguage();

  const metrics = [
    {
      label: t("reports_admin.active_today") || "Active Today (24h)",
      value: data?.activeUsersToday?.toLocaleString() || "0",
      subtext: t("reports_admin.active_today_sub") || "Active users in last 24h",
      icon: <Users size={20} />,
      iconBgColor: "bg-amber-500",
    },
    {
      label: t("reports_admin.active_this_week") || "Active This Week (7d)",
      value: data?.activeUsersThisWeek?.toLocaleString() || "0",
      subtext: t("reports_admin.active_week_sub") || "Active users in last 7 days",
      icon: <TrendingUp size={20} />,
      iconBgColor: "bg-amber-600",
    },
    {
      label: t("reports_admin.active_this_month") || "Active This Month (30d)",
      value: data?.activeUsersThisMonth?.toLocaleString() || "0",
      subtext: t("reports_admin.active_month_sub") || "Active users in last 30 days",
      icon: <Calendar size={20} />,
      iconBgColor: "bg-amber-700",
    },
    {
      label: t("reports_admin.total_registered") || "Total Registered Users",
      value: data?.totalRegisteredUsers?.toLocaleString() || "0",
      subtext: t("reports_admin.total_users_sub") || "Total platform accounts",
      icon: <UserCheck size={20} />,
      iconBgColor: "bg-emerald-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#131b2e] p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 dark:text-slate-400 text-xs font-semibold mb-1 truncate">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 truncate">
                  {stat.subtext}
                </p>
              </div>

              <div
                className={`${stat.iconBgColor} text-white rounded-xl p-3 shrink-0 flex items-center justify-center shadow-xs`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Quick Strip */}
      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              {t("reports_admin.places_visited_total") || "Total Places Visited"}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
              {data?.totalPlacesVisited?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l border-gray-100 dark:border-slate-800 sm:pl-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
            <Ticket size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              {t("reports_admin.offers_claimed_total") || "Offers Claimed"}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
              {data?.totalOffersRedeemed?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l border-gray-100 dark:border-slate-800 sm:pl-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
            <Star size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              {t("reports_admin.reviews_total") || "Reviews Submitted"}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
              {data?.totalReviews?.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentUserActivityLog({
  activities = [],
}: {
  activities?: IUserActivityItem[];
}) {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const visibleActivities = isExpanded ? activities : activities.slice(0, 5);

  const handleOpenUser = (userId?: string) => {
    if (!userId) return;
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const formatActivityTime = (dateInput: string | Date) => {
    try {
      const date = new Date(dateInput);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffMins < 1) return t("common.just_now") || "Just now";
      if (diffMins < 60) return `${diffMins}m ${t("common.ago") || "ago"}`;
      if (diffHours < 24) return `${diffHours}h ${t("common.ago") || "ago"}`;
      if (diffDays < 7) return `${diffDays}d ${t("common.ago") || "ago"}`;

      return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getActivityBadge = (type: IUserActivityItem["type"]) => {
    switch (type) {
      case "visit":
        return {
          label: t("reports_admin.place_visited") || "Visited",
          color:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
          Icon: MapPin,
        };
      case "redemption":
        return {
          label: t("reports_admin.offer_redeemed") || "Claimed Offer",
          color:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
          Icon: Ticket,
        };
      case "review":
        return {
          label: t("reports_admin.review_submitted") || "Review",
          color:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
          Icon: Star,
        };
      case "registration":
        return {
          label: t("reports_admin.new_user") || "Joined",
          color:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
          Icon: UserPlus,
        };
      default:
        return {
          label: t("reports_admin.activity") || "Activity",
          color:
            "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          Icon: Activity,
        };
    }
  };

  const getTargetUrl = (activity: IUserActivityItem) => {
    if (!activity.targetId || !activity.targetType) return null;
    switch (activity.targetType) {
      case "place":
        return `/places/${activity.targetId}`;
      case "business":
        return `/dashboard/business/${activity.targetId}`;
      case "offer":
        return `/offer/${activity.targetId}`;
      case "map":
        return `/catalog/${activity.targetId}`;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-amber-600 dark:text-amber-400" />
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
            {t("reports_admin.recent_activity_title") || "Recent User Activity"}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
            {activities.length}
          </span>
        </div>

        <Link
          href="/dashboard/users-roles"
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1 hover:underline"
        >
          <span>{t("reports_admin.view_all_users") || "Manage Users"}</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-900/40 rounded-lg border border-gray-100 dark:border-slate-800 border-dashed">
          {t("reports_admin.no_activity_yet") || "No user activity recorded yet."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleActivities.map((act) => {
            const badge = getActivityBadge(act.type);
            const { Icon } = badge;
            const targetUrl = getTargetUrl(act);

            return (
              <div
                key={act.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50/70 dark:bg-slate-900/60 hover:bg-gray-100/70 dark:hover:bg-slate-800/60 rounded-lg border border-gray-100 dark:border-slate-800 transition-all text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div
                    onClick={() => handleOpenUser(act.userId)}
                    className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    title={act.userName}
                  >
                    {act.userProfile ? (
                      <img
                        src={getImageUrl(act.userProfile)}
                        alt={act.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{act.userName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenUser(act.userId)}
                        className="font-bold text-gray-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 hover:underline cursor-pointer truncate max-w-[160px] text-left"
                      >
                        {act.userName}
                      </button>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
                      >
                        <Icon size={10} />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {act.subtitle && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-gray-600 dark:text-slate-400">
                        {targetUrl ? (
                          <Link
                            href={targetUrl}
                            className="hover:underline hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 font-medium truncate max-w-sm"
                          >
                            <span className="truncate">{act.subtitle}</span>
                            <ExternalLink size={10} className="shrink-0 opacity-70" />
                          </Link>
                        ) : (
                          <span className="truncate max-w-sm">{act.subtitle}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500 font-medium shrink-0 self-end sm:self-auto">
                  <Clock size={11} />
                  <span>{formatActivityTime(act.timestamp)}</span>
                </div>
              </div>
            );
          })}

          {activities.length > 5 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg text-amber-700 dark:text-amber-400 bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60 transition-all cursor-pointer"
              >
                <span>
                  {isExpanded
                    ? t("reports_admin.view_less") || "View Less"
                    : `${t("reports_admin.view_more") || "View More"} (${activities.length - 5} ${t("reports_admin.more") || "more"})`}
                </span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}
