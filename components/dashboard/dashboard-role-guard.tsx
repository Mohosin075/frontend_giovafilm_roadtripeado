"use client";

import { useGetProfileQuery } from "@/redux/features/user/userApi";
import {
  selectAccessToken,
  selectCurrentUser,
  updateUserRole,
} from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  isAdminOnlyDashboardPath,
  isDashboardRole,
  normalizeRole,
} from "@/lib/roles";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Enforces dashboard access by role:
 * - user → home
 * - map_editor → cannot open admin-only sections
 * - admin / super_admin → full dashboard
 */
export function DashboardRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const authUser = useAppSelector(selectCurrentUser);
  const { data: profile, isLoading, isError } = useGetProfileQuery(
    {},
    { skip: !accessToken },
  );

  const { t } = useLanguage();
  const role = profile?.role || authUser?.role;

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    // Always wait for the fresh database profile to complete loading
    if (isLoading) return;

    if (isError && !authUser) {
      router.replace("/login");
      return;
    }

    // Sync freshly loaded role to Redux and cookies
    if (profile?.role && profile.role !== authUser?.role) {
      dispatch(updateUserRole(profile.role));
    }

    if (role && !isDashboardRole(role)) {
      router.replace("/");
      return;
    }

    if (
      normalizeRole(role) === "map_editor" &&
      isAdminOnlyDashboardPath(pathname)
    ) {
      router.replace("/dashboard");
    }
  }, [accessToken, authUser, profile?.role, role, isLoading, isError, pathname, router, dispatch]);

  if (!accessToken || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("dashboard.checking_access") || "Checking access..."}
      </div>
    );
  }

  if (role && !isDashboardRole(role)) {
    return null;
  }

  if (
    normalizeRole(role) === "map_editor" &&
    isAdminOnlyDashboardPath(pathname)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("dashboard.redirecting") || "Redirecting..."}
      </div>
    );
  }

  return <>{children}</>;
}
