"use client";

import {
  Gift,
  AlertCircle,
  CheckCircle,
  Wallet,
  Briefcase,
} from "lucide-react";
import { ReviewNotificationCard } from "./review-notification-card";
import { BusinessNotificationCard } from "./business-notification-card";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BusinessNotification() {
  const { t } = useLanguage();
  const businessNotifications = [
    {
      icon: Gift,
      title: t("notifications_page.new_offer_request"),
      description: t("notifications_page.new_offer_desc"),
      timestamp: "10 minutes ago",
      iconBgColor: "bg-purple-500",
    },
    {
      icon: AlertCircle,
      title: t("notifications_page.low_inventory_warning"),
      description: t("notifications_page.low_inventory_desc"),
      timestamp: "45 minutes ago",
      iconBgColor: "bg-red-500",
    },
    {
      icon: CheckCircle,
      title: t("notifications_page.verification_request"),
      description: t("notifications_page.verification_desc"),
      timestamp: "3 hours ago",
      iconBgColor: "bg-green-500",
    },
    {
      icon: Wallet,
      title: t("notifications_page.payout_completed"),
      description: t("notifications_page.payout_desc"),
      timestamp: "5 hours ago",
      iconBgColor: "bg-blue-500",
    },
  ];
  return (
    <div className="">
      <div className="mb-6 flex items-center gap-2">
        <Briefcase size={24} className="text-[#3B82F6]" />
        <h1 className="text-xl font-bold text-black dark:text-slate-100 font-inter">
          {t("notifications_page.business_notifications")}
        </h1>
      </div>
      <div className="space-y-4">
        {businessNotifications.map((notification, index) => {
          const Icon = notification.icon;

          return (
            <BusinessNotificationCard
              key={index}
              icon={<Icon size={20} className="text-white" />}
              title={notification.title}
              description={notification.description}
              timestamp={notification.timestamp}
              iconBgColor={notification.iconBgColor}
            />
          );
        })}
      </div>
    </div>
  );
}
