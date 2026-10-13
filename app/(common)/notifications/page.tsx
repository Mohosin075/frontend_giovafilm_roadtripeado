"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAppSelector } from "@/redux/hook";
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useArchiveNotificationMutation,
  useClearMyNotificationsMutation,
  INotificationItem,
} from "@/redux/features/notification/notificationApi";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import { getSocket, emitWhenReady } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  CheckCheck,
  Star,
  Trophy,
  Award,
  Gift,
  MapPin,
  Map,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  Check,
  Archive,
  Compass,
  ArrowRight,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

function formatRelativeTime(dateString: string, lang: string = "es"): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  const isEs = lang === "es";

  if (diffSec < 60) return isEs ? "Ahora mismo" : "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return isEs ? `Hace ${diffMin}m` : `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return isEs ? `Hace ${diffHours}h` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return isEs ? `Hace ${diffDays}d` : `${diffDays}d ago`;
}

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const isAuthenticated = useAppSelector((state) => state.auth.accessToken);

  const [activeCategory, setActiveCategory] = useState<"all" | "roadtripeado" | "account">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: notifData,
    isLoading,
    refetch,
  } = useGetMyNotificationsQuery(
    {
      category: activeCategory === "all" ? undefined : activeCategory,
      isRead: unreadOnly ? false : undefined,
      searchTerm: searchTerm.trim() || undefined,
      limit: 50,
    },
    { skip: !isAuthenticated }
  );

  const { data: user } = useGetProfileQuery({}, { skip: !isAuthenticated });

  const { data: unreadCounts, refetch: refetchUnread } = useGetUnreadCountQuery(
    undefined,
    { skip: !isAuthenticated }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [archiveNotification] = useArchiveNotificationMutation();
  const [clearMyNotifications, { isLoading: isClearing }] = useClearMyNotificationsMutation();

  const handleClearRead = async () => {
    try {
      await clearMyNotifications({ onlyRead: true }).unwrap();
      toast.success(
        language === "es"
          ? "Notificaciones leídas eliminadas"
          : "Read notifications cleared"
      );
    } catch {
      toast.error(
        language === "es"
          ? "Error al borrar las notificaciones leídas"
          : "Failed to clear read notifications"
      );
    }
  };

  // Real-time socket sync
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    if (!socket) return;

    if (user?._id) {
      emitWhenReady("join-room", user._id);
    }

    const handleUpdate = () => {
      refetch();
      refetchUnread();
    };

    socket.on("notification", handleUpdate);
    socket.on("unread_count_update", handleUpdate);

    return () => {
      socket.off("notification", handleUpdate);
      socket.off("unread_count_update", handleUpdate);
    };
  }, [isAuthenticated, user?._id, refetch, refetchUnread]);

  const rawNotifs = notifData as any;
  const notifications: INotificationItem[] = Array.isArray(rawNotifs)
    ? rawNotifs
    : (Array.isArray(rawNotifs?.data) ? rawNotifs.data : []);

  const getText = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[language] || val.es || val.en || "";
  };

  const getIconConfig = (type: string, category: string) => {
    switch (type) {
      case "NEW_OFFER":
        return {
          icon: Gift,
          bgColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40",
          badgeColor: "bg-purple-50/90 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
          label: t("notifications_page.offer") || "Offer",
        };
      case "NEW_LOCATION":
        return {
          icon: MapPin,
          bgColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
          badgeColor: "bg-emerald-50/90 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
          label: t("notifications_page.location") || "Location",
        };
      case "NEW_MAP":
        return {
          icon: Map,
          bgColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
          badgeColor: "bg-blue-50/90 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
          label: t("notifications_page.map") || "Map",
        };
      case "APPROVED_REVIEW":
        return {
          icon: Star,
          bgColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
          badgeColor: "bg-amber-50/90 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
          label: t("notifications_page.review") || "Review",
        };
      case "UNLOCKED_LEVEL":
        return {
          icon: Trophy,
          bgColor: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-800/40",
          badgeColor: "bg-yellow-50/90 text-yellow-800 border-yellow-200/60 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800/40",
          label: t("notifications_page.level_up") || "Level Up",
        };
      case "EARNED_REWARD":
        return {
          icon: Award,
          bgColor: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
          badgeColor: "bg-rose-50/90 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
          label: t("notifications_page.reward") || "Reward",
        };
      case "IMPORTANT_UPDATE":
      case "SYSTEM_ALERT":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-200/60 dark:border-red-800/40",
          badgeColor: "bg-red-50/90 text-red-700 border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40",
          label: t("notifications_page.important") || "Important",
        };
      case "NEW_MESSAGE":
        return {
          icon: MessageSquare,
          bgColor: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40",
          badgeColor: "bg-sky-50/90 text-sky-700 border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
          label: t("notifications_page.message") || "Message",
        };
      default:
        return category === "roadtripeado"
          ? {
              icon: Compass,
              bgColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
              badgeColor: "bg-blue-50/90 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40",
              label: t("notifications_page.roadtripeado") || "Roadtripeado",
            }
          : {
              icon: Bell,
              bgColor: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40",
              badgeColor: "bg-indigo-50/90 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40",
              label: t("notifications_page.account") || "Account",
            };
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead({
        category: activeCategory === "all" ? undefined : activeCategory,
      }).unwrap();
      toast.success(
        t("notifications_page.notifications_updated") ||
          (language === "es"
            ? "Todas las notificaciones marcadas como leídas"
            : "All notifications marked as read")
      );
    } catch {
      toast.error(
        language === "es"
          ? "Error al marcar todo como leído"
          : "Failed to mark all as read"
      );
    }
  };

  const handleItemClick = (item: INotificationItem) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await archiveNotification(id).unwrap();
      toast.success(
        language === "es"
          ? "Notificación archivada"
          : "Notification archived"
      );
    } catch {
      toast.error(
        language === "es"
          ? "Error al archivar la notificación"
          : "Failed to archive notification"
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-950/40 rounded-full text-yellow-600 mb-4">
          <Bell size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          {t("notifications_page.notification_center") || t("notifications_page.title") || "Notification Center"}
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-md mb-6 text-sm">
          {t("notifications_page.login_prompt") ||
            "Please log in to your account to view your personalized Roadtripeado updates, rewards, offers, and account notifications."}
        </p>
        <Link href="/login">
          <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold px-8 py-5 rounded-xl shadow-sm">
            {t("nav.login") || "Log In"}
          </Button>
        </Link>
      </div>
    );
  }

  const totalUnread = unreadCounts?.totalUnread ?? 0;
  const unreadRoadtripeado = unreadCounts?.unreadRoadtripeado ?? 0;
  const unreadAccount = unreadCounts?.unreadAccount ?? 0;

  return (
    <div className="min-h-[80vh] bg-[#F9FAFB] dark:bg-[#0b0f19] py-4 sm:py-8 pb-24 sm:pb-16 transition-colors">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-7">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-10 sm:size-12 p-2 sm:p-2.5 bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 rounded-2xl border border-yellow-400/30 shrink-0 flex items-center justify-center">
                <Bell size={20} className="sm:size-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <span className="truncate">{t("notifications_page.notification_center") || t("notifications_page.title") || "Notification Center"}</span>
                  {totalUnread > 0 && (
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-xs shrink-0">
                      {totalUnread} {t("notifications_page.new") || "new"}
                    </span>
                  )}
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                  {t("notifications_page.subtitle") ||
                    "Updates on new offers, maps, approved reviews, unlocked levels, and rewards tailored to you."}
                </p>
              </div>
            </div>

            {/* Mobile Top Action Buttons (Right side of header) */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              {totalUnread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  className="h-8 px-2 text-xs font-semibold rounded-xl border-gray-300 dark:border-slate-700 bg-white dark:bg-[#131b2e] text-gray-700 dark:text-slate-200"
                  title={t("notifications_page.mark_all_read") || "Mark all as read"}
                >
                  <CheckCheck size={14} className="text-emerald-500" />
                </Button>
              )}
              {notifications.some((n) => n.isRead) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearRead}
                  disabled={isClearing}
                  className="h-8 px-2 text-xs font-semibold rounded-xl text-gray-500 hover:text-red-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  title={t("notifications_page.clear_read") || "Clear read"}
                >
                  <Trash2 size={14} className="mr-1" />
                  <span className="text-xs">{t("notifications_page.clear_read") || "Clear"}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {totalUnread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="rounded-xl border-gray-300 dark:border-slate-700 bg-white dark:bg-[#131b2e] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer h-9 px-3"
              >
                {isMarkingAll ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} className="text-emerald-500" />
                )}
                <span>{t("notifications_page.mark_all_read") || "Mark all as read"}</span>
              </Button>
            )}

            {notifications.some((n) => n.isRead) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearRead}
                disabled={isClearing}
                className="rounded-xl text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer h-9 px-3"
              >
                {isClearing ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                <span>{t("notifications_page.clear_read") || "Clear read"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Unread Filter */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder={t("notifications_page.search_placeholder") || "Search notifications..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-2 h-10 text-xs sm:text-sm bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 rounded-xl w-full shadow-2xs focus:ring-1 focus:ring-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`shrink-0 px-3.5 h-10 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border shadow-2xs ${
              unreadOnly
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-bold"
                : "bg-white dark:bg-[#131b2e] border-gray-200/90 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80"
            }`}
          >
            <span className={`size-1.5 rounded-full ${unreadOnly ? "bg-blue-600 dark:bg-blue-400" : "bg-gray-400"}`} />
            <span>{t("notifications_page.unread_only") || "Unread"}</span>
            {totalUnread > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                unreadOnly
                  ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
              }`}>
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse"
              >
                <div className="hidden sm:block size-10 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-full w-16" />
                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-200/80 dark:border-slate-800 text-center">
            <div className="size-14 sm:size-16 rounded-2xl bg-yellow-100/60 dark:bg-yellow-950/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
              <Bell size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
              {t("notifications_page.no_notifications") || "No notifications found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-sm">
              {unreadOnly
                ? (t("notifications_page.no_unread") || "You're all caught up! No unread notifications in this category.")
                : (t("notifications_page.no_updates") || "You don't have any updates right now. Check back soon for new offers, maps, and rewards.")}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {notifications.map((item) => {
              const { icon: Icon, bgColor, badgeColor, label } = getIconConfig(
                item.type,
                item.category
              );
              const title = getText(item.title);
              const content = getText(item.content);
              const actionText = getText(item.actionText);

              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex items-start gap-3 p-3.5 sm:p-4 bg-white dark:bg-[#131b2e] rounded-2xl border transition-all duration-200 cursor-pointer ${
                    item.isRead
                      ? "border-gray-100 dark:border-slate-800/80 hover:border-gray-200 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs"
                      : "border-blue-200/90 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/15 shadow-xs"
                  }`}
                >
                  {/* Left Icon: hidden on mobile, visible on sm and up */}
                  <div
                    className={`hidden sm:flex size-10 rounded-xl items-center justify-center border shrink-0 mt-0.5 ${bgColor}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  {/* Card Main Body */}
                  <div className="flex-1 min-w-0">
                    {/* Top Row: Category + Time on left, Quick Actions on right */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}
                        >
                          {label}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-slate-500">
                          {formatRelativeTime(item.createdAt, language)}
                        </span>
                        {!item.isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {t("notifications_page.new") || "New"}
                          </span>
                        )}
                      </div>

                      {/* Actions (Mark read / Delete): cleanly integrated right on the top line */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item._id);
                            }}
                            className="size-7 flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={t("notifications_page.mark_read") || "Mark as read"}
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleArchive(e, item._id)}
                          className="size-7 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title={t("notifications_page.archive") || "Archive notification"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-sm sm:text-base text-gray-900 dark:text-slate-100 break-words leading-snug ${
                        !item.isRead ? "font-extrabold" : "font-bold"
                      }`}
                    >
                      {title}
                    </h4>

                    {/* Content: Clean, readable without awkward cutoffs */}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1 leading-relaxed break-words">
                      {content}
                    </p>

                    {/* Action Link / Button */}
                    {item.actionUrl && (
                      <div className="mt-2.5">
                        <Link
                          href={item.actionUrl}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!item.isRead) markAsRead(item._id);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-slate-900 bg-[#FFC107] hover:bg-[#FFB300] active:scale-95 px-3 py-1.5 rounded-xl shadow-2xs transition-all"
                        >
                          <span>{actionText || t("notifications_page.view_details") || "View details"}</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
