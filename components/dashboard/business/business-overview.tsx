"use client";

import { Globe } from "lucide-react";
import { toExternalUrl, toInstagramUrl } from "./business-links";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BusinessOverview({ businessData }: any) {
  const { t } = useLanguage();
  const websiteUrl = toExternalUrl(businessData.website);
  const instagramUrl = toInstagramUrl(businessData.instagram);

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {t("business_admin.overview")}
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {t("business_admin.business_name")}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mt-1">
            {businessData.name}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {t("business_admin.category")}
          </p>
          <p className="text-gray-700 dark:text-slate-300 mt-1">{businessData.category}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {t("business_admin.description")}
          </p>
          <p className="text-gray-700 dark:text-slate-300 mt-1 leading-relaxed">
            {businessData.description || "N/A"}
          </p>
        </div>

        <div className="overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {t("business_admin.website")}
          </p>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mt-1 block truncate max-w-full"
            >
              {businessData.website} ↗
            </a>
          ) : (
            <p className="text-gray-500 dark:text-slate-400 mt-1">N/A</p>
          )}
        </div>

        {instagramUrl && (
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              {t("place.instagram")}
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mt-1 block truncate max-w-full"
            >
              {businessData.instagram} ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
