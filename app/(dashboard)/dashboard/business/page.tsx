"use client";

import { BusinessStats } from "@/components/dashboard/business/business-stats";
import { BusinessTable } from "@/components/dashboard/business/business-table";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Suspense } from "react";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-100 dark:bg-[#0b0f19] min-h-screen text-gray-900 dark:text-slate-100">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-6">{t("business_admin.title")}</h1>

      <BusinessStats />
      {/* Table */}
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading businesses...</div>}>
        <BusinessTable />
      </Suspense>
    </div>
  );
}
