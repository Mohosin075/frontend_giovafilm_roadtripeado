"use client";

import { BillingSettings } from "@/components/dashboard/settings/billing-settings";
import { GeneralSettings } from "@/components/dashboard/settings/general-settings";
import { NotificationSettings } from "@/components/dashboard/settings/notifications-settings";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen ">
      {/* Header */}

      <h1 className="text-2xl font-semibold text-gray-800 dark:text-slate-100 mb-6">{t("nav.profile")}</h1>

      <div className="space-y-6">
        {/* <GeneralSettings /> */}

        <NotificationSettings />

        {/* <SecuritySettings /> */}

        {/* <BillingSettings /> */}
      </div>
    </div>
  );
}

