"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SecuritySettings() {
  const { t } = useLanguage();

  return (
    <Card className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-slate-100">{t("settings_admin.security")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full justify-start dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800">
          {t("settings_admin.change_password")}
        </Button>

        <Button variant="outline" className="w-full justify-start dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800">
          {t("settings_admin.enable_2fa")}
        </Button>
      </CardContent>
    </Card>
  );
}
