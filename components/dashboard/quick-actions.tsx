"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card } from "../ui/card";

export function QuickActions() {
  const { t } = useLanguage();

  const actions = [
    { label: t("maps_admin.map_name"), href: "/dashboard/maps" },
    { label: t("places_admin.add_category"), href: "/dashboard/places/add-place" },
  ];

  return (
    <Card className="bg-white dark:bg-[#131b2e] dark:border dark:border-slate-800/80 gap-3 p-6 rounded-xl border-0 shadow-sm transition-all">
      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{t("dashboard.quick_actions")}</h3>
      <div className="space-y-2">
        {actions.map((action, idx) => (
          <a
            key={idx}
            href={action.href}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm block transition-colors"
          >
            {action.label}
          </a>
        ))}
      </div>
    </Card>
  );
}
