"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getLocalized } from "@/lib/utils";
import { Store, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StatItem {
  id?: string;
  name: string;
  count: number;
  businessName?: string;
  businessId?: string;
  placeId?: string;
}

function StatColumn({
  title,
  items,
  type,
}: {
  title: string;
  items: StatItem[];
  type: "map" | "place" | "offer" | "business";
}) {
  const { t, language } = useLanguage();
  const router = useRouter();

  const getItemUrl = (item: StatItem) => {
    const localized = getLocalized(item.name, language);
    const query = encodeURIComponent(localized);

    switch (type) {
      case "map":
        return item.id ? `/catalog/${item.id}` : `/dashboard/maps?search=${query}`;
      case "place":
        return item.id ? `/places/${item.id}` : `/dashboard/places?search=${query}`;
      case "offer":
        return item.id ? `/offer/${item.id}` : `/dashboard/offers?search=${query}`;
      case "business":
        return item.id ? `/dashboard/business/${item.id}` : `/dashboard/business?search=${query}`;
      default:
        return "/dashboard";
    }
  };

  const getBusinessUrl = (item: StatItem) => {
    if (item.businessId) {
      return `/dashboard/business/${item.businessId}`;
    }
    if (item.placeId) {
      return `/places/${item.placeId}`;
    }
    const query = encodeURIComponent(getLocalized(item.businessName || "", language));
    return `/dashboard/business?search=${query}`;
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-slate-200 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => {
            const itemUrl = getItemUrl(item);
            const localizedName = getLocalized(item.name, language);
            const localizedBusinessName = item.businessName
              ? getLocalized(item.businessName, language)
              : "";

            return (
              <div
                key={idx}
                onClick={() => router.push(itemUrl)}
                className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-slate-900/60 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 hover:border-blue-200 dark:hover:border-slate-700 p-3 rounded-lg border border-gray-100 dark:border-slate-800 transition-all cursor-pointer group shadow-sm hover:shadow"
                title={`${t("common.view_details") || "View details"}: ${localizedName}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm text-gray-800 dark:text-slate-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {localizedName}
                    </span>
                    <ExternalLink
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  {localizedBusinessName && (
                    <Link
                      href={getBusinessUrl(item)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium inline-flex items-center gap-1.5 mt-0.5 max-w-full truncate hover:underline"
                      title={`${t("business_admin.view_business") || "View details"}: ${localizedBusinessName}`}
                    >
                      {item.placeId && !item.businessId ? (
                        <MapPin size={12} className="shrink-0" />
                      ) : (
                        <Store size={12} className="shrink-0" />
                      )}
                      <span className="truncate">{localizedBusinessName}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-70" />
                    </Link>
                  )}
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {item.count.toLocaleString()}
                </span>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-400 dark:text-slate-500 text-xs bg-gray-50 dark:bg-slate-900/40 rounded-lg border border-gray-100 dark:border-slate-800 border-dashed">
            {t("reports_admin.no_data") || "No data available"}
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
          {t("reports_admin.usage_title") || "Usage Statistics"}
        </h2>
        {timeFilterActive && (
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            {t("reports_admin.usage_desc") || "Showing statistics for the selected time filter."}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatColumn
          title={t("reports_admin.most_viewed_maps") || "Most Viewed Maps"}
          items={data?.mostViewedMaps || []}
          type="map"
        />
        <StatColumn
          title={
            placeColumnTitle === "Most Opened Places"
              ? t("reports_admin.most_opened_places") || "Most Opened Places"
              : placeColumnTitle
          }
          items={data?.mostOpenedPlaces || []}
          type={placeColumnTitle === "Business visits" ? "business" : "place"}
        />
        <StatColumn
          title={t("reports_admin.most_redeemed_offers") || "Most Redeemed Offers"}
          items={data?.mostRedeemedOffers || []}
          type="offer"
        />
      </div>
    </div>
  );
}
