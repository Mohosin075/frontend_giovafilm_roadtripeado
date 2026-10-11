"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Image from "next/image";
import logo from "@/public/logo.png";
import whiteLogo from "@/public/white-logo.png";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { adminMenuItems, mapEditorMenuItems } from "@/lib/utils";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { logout } from "@/redux/features/auth/authSlice";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import { useAppDispatch } from "@/redux/hook";
import { LogOut } from "lucide-react";
import { broadcastLogout } from "../shared/cross-tab-logout-listener";
import { persistor } from "@/redux/store";
import { baseApi } from "@/redux/api/baseApi";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AppSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { data: userProfile } = useGetProfileQuery({});

  const role = (userProfile?.role || userProfile?.data?.role || "").toLowerCase().replace(/[\s-]+/g, "_");
  const menuItems = role === "map_editor" ? mapEditorMenuItems : adminMenuItems;

  const [logoutApi] = useLogoutMutation();

  const getTranslatedTitle = (title: string) => {
    const keyMap: Record<string, string> = {
      Dashboard: "dashboard.sidebar.dashboard",
      Overview: "dashboard.sidebar.overview",
      Business: "dashboard.sidebar.business",
      Maps: "dashboard.sidebar.maps",
      Places: "dashboard.sidebar.places",
      Offers: "dashboard.sidebar.offers",
      Categories: "dashboard.sidebar.categories",
      Subscription: "dashboard.sidebar.subscription",
      Subscriptions: "dashboard.sidebar.subscriptions",
      "Users & Roles": "dashboard.sidebar.users_roles",
      Reports: "dashboard.sidebar.reports",
      "Reports & Statistics": "dashboard.sidebar.reports_statistics",
      Rewards: "dashboard.sidebar.rewards",
      "Reviews Verification": "dashboard.sidebar.reviews_verification",
      "Promo Links": "dashboard.sidebar.promos",
      Settings: "dashboard.sidebar.settings",
      Notifications: "dashboard.sidebar.notifications",
    };
    return keyMap[title] ? t(keyMap[title]) : title;
  };

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch (err) {
      console.error("Logout API error", err);
    } finally {
      broadcastLogout(); // signal all other tabs
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      await persistor.purge();
      localStorage.clear();
      router.push("/");
    }
  };

  return (
    <Sidebar className="h-screen bg-[#f5f5f5] dark:bg-[#0e1526] border-r border-gray-300/50 dark:border-slate-800">
      {/* Logo */}
      <div className="py-3 flex justify-center border-b border-gray-300/50 dark:border-slate-800">
        <Link href="/maps">
          <Image
            src={logo}
            alt="Dashboard Logo"
            height={200}
            width={200}
            className="w-48 h-auto block dark:hidden"
            priority
          />
          <Image
            src={whiteLogo}
            alt="Dashboard Logo"
            height={200}
            width={200}
            className="w-48 h-auto hidden dark:block"
            priority
          />
        </Link>
      </div>

      <SidebarContent className="pt-6">
        <SidebarGroup className="p-0 shadow-none">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3 px-2">
              {menuItems?.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        id="sidebarLink"
                        href={item.url}
                        className={`relative flex items-center gap-2.5 px-4 py-6! text-lg! rounded-2xl font-medium transition-all hover:bg-primary!
                    ${
                      isActive
                        ? "bg-primary text-black shadow-md"
                        : "text-black dark:text-zinc-200 hover:text-black hover:bg-primary!"
                    }                        
          `}
                      >
                        <item.icon className="size-6!" />
                        <span>{getTranslatedTitle(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout Bottom */}
      <div className="mt-auto px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                onClick={handleLogout}
                className="relative w-full flex items-center gap-2.5 px-4 py-6! text-lg! rounded-2xl font-medium transition-all text-black dark:text-zinc-200 hover:text-black hover:bg-primary!"
              >
                <LogOut className="size-6!" />
                <span>{t("nav.logout")}</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
