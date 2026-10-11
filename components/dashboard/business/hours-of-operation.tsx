"use client";

import { Clock } from "lucide-react";

type ScheduleItem = {
  days?: string;
  day?: string;
  openTime?: string;
  closeTime?: string;
};

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { convertTo12Hour } from "@/lib/utils";

export default function HoursOfOperation({
  schedule,
}: {
  schedule?: ScheduleItem[];
}) {
  const { t } = useLanguage();
  const items = Array.isArray(schedule) ? schedule.filter((item) => item?.days || item?.day) : [];

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {t("business_admin.hours_of_operation")}
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">{t("business_admin.no_hours_set")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <div
              key={`${item.days || item.day}-${index}`}
              className="rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 px-3 py-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">
                {item.days || item.day}
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-200 font-medium">
                {item.openTime ? convertTo12Hour(item.openTime) : "--"}
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-200 font-medium">
                {item.closeTime ? convertTo12Hour(item.closeTime) : "--"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
