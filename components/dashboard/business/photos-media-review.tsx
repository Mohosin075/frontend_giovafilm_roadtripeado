"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PhotosMediaReview({ businessData }: any) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 p-6 text-gray-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          {t("business_admin.overview")}
        </h2>

        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
          {t("business_admin.reorder_photos")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {businessData.photos.map((photo: any, idx: number) => (
          <div
            key={idx}
            className="bg-gray-100 dark:bg-slate-900/60 rounded-lg h-32 flex items-center justify-center border border-gray-200 dark:border-slate-800"
          >
            <span className="text-gray-500 dark:text-slate-400">Photo {idx + 1}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
        <div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">{businessData.name}</p>

          <span className="inline-block bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200/60 dark:border-yellow-900/40 text-xs font-semibold px-3 py-1 rounded-full mt-2">
            {businessData.status}
          </span>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            {t("business_admin.reject")}
          </button>

          <button className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            {t("business_admin.request_changes")}
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t("business_admin.approve")}
          </button>
        </div>
      </div>
    </div>
  );
}
