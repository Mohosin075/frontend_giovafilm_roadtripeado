"use client";

import { BillingSettings } from "@/components/dashboard/settings/billing-settings";
import BillingHistory from "./billing-history";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Subscription() {
  const { t } = useLanguage();

  return (
    <div className="max-w-360 mx-auto px-4 md:px-6 py-12 md:py-20">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-center mb-10 uppercase tracking-wide">
        {t("common.subscription") || "Subscription"}
      </h1>
      <div className="space-y-6">
        <BillingSettings />
        <BillingHistory />
      </div>
    </div>
  );
}
