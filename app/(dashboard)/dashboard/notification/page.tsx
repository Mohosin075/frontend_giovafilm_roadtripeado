"use client";

import BusinessNotification from "@/components/dashboard/notification/business-notification";
import NotificationMessage from "@/components/dashboard/notification/notification-message";
import { NotificationSettings } from "@/components/dashboard/settings/notifications-settings";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CheckCheck, Loader2 } from "lucide-react";
import { useMarkAllAsReadMutation } from "@/redux/features/notification/notificationApi";
import { toast } from "sonner";

export default function Page() {
  const { t } = useLanguage();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success(t("notifications_page.notifications_updated") || "All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-transparent font-inter!">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">{t("notifications_page.title")}</h1>

        <Button
          onClick={handleMarkAllRead}
          disabled={isMarkingAll}
          className="bg-white dark:bg-[#131b2e] text-black dark:text-slate-100 border border-gray-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
        >
          {isMarkingAll ? <Loader2 size={18} className="animate-spin" /> : <CheckCheck size={20} />}
          {t("notifications_page.mark_all_read")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <NotificationMessage />
        </div>
        <div className="col-span-1 space-y-6">
          <BusinessNotification />
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}

