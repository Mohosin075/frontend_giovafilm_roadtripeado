"use client";

import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { useGetDashboardStatsQuery } from "@/redux/features/stats/statsApi";
import {
  Gift,
  LayoutGrid,
  MapPin,
  Loader2,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Page() {
  const { t } = useLanguage();
  const { data: response, isLoading } = useGetDashboardStatsQuery();

  const stats = response?.data?.stats;
  const recentActivity = response?.data?.recentActivity || [];

  const statsData = [
    {
      label: t("dashboard.total_maps"),
      value: stats?.totalMaps?.toString() || "0",
      icon: <LayoutGrid size={24} />,
      iconBgColor: "bg-blue-500",
    },
    {
      label: t("dashboard.total_places"),
      value: stats?.totalPlaces?.toString() || "0",
      icon: <MapPin size={24} />,
      iconBgColor: "bg-green-500",
    },
    {
      label: t("dashboard.active_offers"),
      value: stats?.activeOffers?.toString() || "0",
      icon: <Gift size={24} />,
      iconBgColor: "bg-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-arial pb-6 text-gray-900 dark:text-slate-100">{t("dashboard.overview")}</h1>

      <StatCard data={statsData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
