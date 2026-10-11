"use client";

import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function RolePermissions(): React.ReactElement {
  const { t } = useLanguage();

  const rolePermissions = [
    {
      role: t("users_admin.owner_role"),
      description: t("users_admin.owner_desc"),
    },
    {
      role: t("users_admin.administrator_role"),
      description: t("users_admin.administrator_desc"),
    },
    {
      role: t("users_admin.map_editor_role"),
      description: t("users_admin.map_editor_desc"),
    },
  ];

  return (
    <Card className="p-6 bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 gap-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{t("users_admin.role_permissions_title")}</h2>

      <div className="space-y-4">
        {rolePermissions.map((permission) => (
          <div
            key={permission.role}
            className="border-b border-gray-200 dark:border-slate-800/80 pb-2 last:border-b-0 last:pb-0"
          >
            <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">
              {permission.role}:
            </p>
            <p className="text-gray-600 dark:text-slate-300 text-sm">{permission.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

