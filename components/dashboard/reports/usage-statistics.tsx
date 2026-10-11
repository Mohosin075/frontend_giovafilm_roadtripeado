"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLocalized } from "@/lib/utils";

interface StatItem {
  name: string;
  count: number;
}

function StatColumn({ title, items }: { title: string; items: StatItem[] }) {
  const { t, language } = useLanguage();
  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-slate-200 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/60 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-700 dark:text-slate-300 font-medium truncate pr-2">{getLocalized(item.name, language)}</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {item.count.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-400 dark:text-slate-500 text-xs bg-gray-50 dark:bg-slate-900/40 rounded-lg border border-gray-100 dark:border-slate-800 border-dashed">
            {t("reports_admin.no_data")}
          </div>
        )}
      </div>
    </div>
  );
}

interface UsageData {
  mostViewedMaps: StatItem[];
  mostOpenedPlaces: StatItem[];
  mostRedeemedOffers: StatItem[];
}

export function UsageStatistics({
  data,
  timeFilterActive,
  placeColumnTitle = "Most Opened Places",
}: {
  data?: UsageData;
  timeFilterActive?: boolean;
  placeColumnTitle?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
          {t("reports_admin.usage_title")}
        </h2>
        {timeFilterActive && (
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            {t("reports_admin.usage_desc")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatColumn title={t("reports_admin.most_viewed_maps")} items={data?.mostViewedMaps || []} />
        <StatColumn title={placeColumnTitle === "Most Opened Places" ? t("reports_admin.most_opened_places") : placeColumnTitle} items={data?.mostOpenedPlaces || []} />
        <StatColumn title={t("reports_admin.most_redeemed_offers")} items={data?.mostRedeemedOffers || []} />
      </div>
    </div>
  );
}
