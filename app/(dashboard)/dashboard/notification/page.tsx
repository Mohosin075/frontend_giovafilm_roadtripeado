"use client";

import BusinessNotification from "@/components/dashboard/notification/business-notification";
import NotificationMessage from "@/components/dashboard/notification/notification-message";
import { NotificationSettings } from "@/components/dashboard/settings/notifications-settings";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CheckCheck } from "lucide-react";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-100 dark:bg-transparent font-inter!">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">{t("notifications_page.title")}</h1>

        <Button className="bg-white dark:bg-[#131b2e] text-black dark:text-slate-100 border border-gray-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer shadow-sm">
          <CheckCheck size={24} />
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

