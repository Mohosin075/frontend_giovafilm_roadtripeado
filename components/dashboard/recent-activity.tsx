"use client";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function RecentActivity({
  activities = [],
}: {
  activities?: Activity[];
}) {
  const { t } = useLanguage();

  return (
    <Card className="bg-white dark:bg-[#131b2e] dark:border dark:border-slate-800/80 gap-3 p-6 rounded-xl border-0 shadow-sm h-full transition-all">
      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{t("dashboard.recent_activity")}</h3>
      <div className="space-y-1">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                {activity.message}
              </p>
              <p className="text-gray-400 dark:text-slate-500 text-[10px] whitespace-nowrap ml-4 font-medium uppercase tracking-wider">
                {activity.timestamp ? formatDate(activity.timestamp) : "N/A"}
              </p>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 dark:text-slate-500 text-sm">
            {t("dashboard.no_recent_activity")}
          </div>
        )}
      </div>
    </Card>
  );
}
