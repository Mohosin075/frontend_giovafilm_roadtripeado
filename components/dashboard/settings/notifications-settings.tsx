"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/features/user/userApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function NotificationSettings() {
  const { t } = useLanguage();
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const handleToggle = async (key: string, checked: boolean) => {
    try {
      const updatedSettings = {
        pushNotification: profile?.settings?.pushNotification ?? true,
        emailNotification: profile?.settings?.emailNotification ?? true,
        locationService: profile?.settings?.locationService ?? true,
        profileStatus: profile?.settings?.profileStatus ?? "public",
        weeklyReports: profile?.settings?.weeklyReports ?? true,
        [key]: checked,
      };

      await updateProfile({ settings: updatedSettings }).unwrap();
      toast.success(t("settings_admin.notifications_updated") || "Notification settings updated successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || t("settings_admin.failed_update_settings") || "Failed to update settings"
      );
      console.error("Failed to update notification settings:", error);
    }
  };

  if (isProfileLoading) {
    return (
      <Card className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-slate-100">{t("settings_admin.notifications")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  const emailNotification = profile?.settings?.emailNotification ?? true;
  const pushNotification = profile?.settings?.pushNotification ?? true;
  const weeklyReports = profile?.settings?.weeklyReports ?? true;

  return (
    <Card className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-slate-100">{t("settings_admin.notifications")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-slate-100">{t("settings_admin.email_notifications")}</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              {t("settings_admin.email_desc")}
            </p>
          </div>
          <Switch
            checked={emailNotification}
            onCheckedChange={(checked) => handleToggle("emailNotification", checked)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-slate-100">{t("settings_admin.push_notifications")}</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              {t("settings_admin.push_desc")}
            </p>
          </div>
          <Switch
            checked={pushNotification}
            onCheckedChange={(checked) => handleToggle("pushNotification", checked)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-slate-100">{t("settings_admin.weekly_reports")}</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              {t("settings_admin.weekly_desc")}
            </p>
          </div>
          <Switch
            checked={weeklyReports}
            onCheckedChange={(checked) => handleToggle("weeklyReports", checked)}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
