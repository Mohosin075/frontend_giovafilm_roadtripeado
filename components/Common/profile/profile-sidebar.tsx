"use client";

import { Button } from "@/components/ui/button";
import { formatDate, getImageUrl } from "@/lib/utils";
import { shareProfile } from "@/lib/share-profile";
import {
  Bell,
  Check,
  CheckCircle2,
  Edit2,
  Heart,
  Loader2,
  Map,
  Share2,
  Star,
  Trophy,
  MapPin,
  Compass,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProfileUpdateModal from "./profile-update-modal";
import { NoImage } from "@/lib/others/others";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useGetProfileQuery } from "@/redux/features/user/userApi";

interface ProfileSidebar {
  _id?: string;
  name: string;
  role: string;
  createdAt: string;
  profile: string;
  level?: number;
  points?: number;
  visitedPlacesCount?: number;
  phone?: string;
  website?: string;
  instagram?: string;
}

interface ProfileProps {
  data: ProfileSidebar;
}

export function ProfileSidebar({ data }: ProfileProps) {
  const [open, setOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { t, language } = useLanguage();

  const allProfileLinks = [
    {
      href: "/notifications",
      label: t("nav.notifications") || "Notifications",
      icon: Bell,
      roles: ["all"],
    },
    {
      href: "/profile/visited-places",
      label: t("nav.visited_places") || "Visited Places",
      icon: CheckCircle2,
      roles: ["all"],
    },
    {
      href: "/profile/favorite-places",
      label: t("nav.favorite_places"),
      icon: Heart,
      roles: ["all"],
    },
    {
      href: "/profile/saved-routes",
      label: t("nav.saved_routes") || "Mis Rutas Guardadas",
      icon: Compass,
      roles: ["all"],
    },
    {
      href: "/profile/purchased-maps",
      label: t("nav.purchased_maps"),
      icon: Map,
      roles: ["user"],
    },
    {
      href: "/profile/contributions-reviews",
      label: t("nav.contributions"),
      icon: Star,
      roles: ["all"],
    },
    {
      href: "/profile/recommended-places",
      label: t("nav.recommended_places") || "Recommended Spots",
      icon: MapPin,
      roles: ["all"],
    },
    {
      href: "/profile/awards",
      label: t("nav.awards"),
      icon: Trophy,
      roles: ["all"],
    },
  ];

  const { data: profile } = useGetProfileQuery({});
  const isAdminOrEditor = ["admin", "super_admin", "map_editor"].includes(profile?.role || "");

  // Admins/Editors: hide "Purchased Maps" (they don't buy maps)
  const profileLinks = allProfileLinks.filter((link) =>
    link.roles.includes("all") || (!isAdminOrEditor && link.roles.includes("user"))
  );

  const handleShare = async () => {
    setIsSharing(true);
    const result = await shareProfile({
      userId: data?._id,
      name: data?.name,
    });
    setIsSharing(false);
    if (result === "copied" || result === "shared") {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white dark:bg-[#131b2e] rounded-xl p-3 border border-gray-200/70 dark:border-slate-800 text-center space-y-3 transition-colors">
        <div className="border border-gray-100 dark:border-slate-800/80 p-3 rounded-lg">
          {/* Avatar with Achievement Badge */}
          <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-lg">
            {data?.profile ? (
              <Image
                src={getImageUrl(data?.profile)}
                alt={"profile"}
                width={500}
                height={500}
                unoptimized
                className="object-cover h-full"
              />
            ) : (
              <NoImage />
            )}

            <div className="absolute bottom-0 right-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm border-2 border-white dark:border-slate-900 shadow-sm">
              L{data?.level ?? 0}
            </div>
          </div>

          {/* User Name */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-0.5">
            {data?.name}
          </h2>

          {/* Points / XP display */}
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center justify-center gap-1">
            ✨ {data?.points ?? 0} XP
          </div>

          {/* Level Name Badge */}
          {(() => {
            const USER_LEVEL_KEYS = [
              "levels.explorador",
              "levels.aventurero",
              "levels.tlacuilo",
              "levels.expedicionario",
              "levels.viajero",
              "levels.chasqui",
              "levels.cronista",
              "levels.pochteca",
              "levels.navegante",
              "levels.cartografo",
              "levels.gran_explorador",
              "levels.conquistador",
              "levels.gran_conquistador",
              "levels.amauta",
              "levels.leyenda",
            ];
            const levelName = t(USER_LEVEL_KEYS[data?.level ?? 0] || "levels.explorador");
            return (
              <div className="inline-block bg-yellow-400 text-black px-3.5 py-1 rounded-full mb-3 shadow-xs">
                <span className="font-bold text-xs uppercase tracking-wider">
                  ⭐ {levelName}
                </span>
              </div>
            );
          })()}

          {/* Visited Places Counter Badge */}
          <div className="flex items-center justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/40 text-amber-700 dark:text-amber-400 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
              📍 {(t("visited.visited_places_count") || "Visited {count} places").replace("{count}", String(data?.visitedPlacesCount ?? (profile as any)?.data?.visitedPlacesCount ?? 0))}
            </span>
          </div>

          {/* Role Badge */}
          <div className="block mb-2">
            <span className="text-gray-400 dark:text-slate-500 font-semibold text-xs uppercase tracking-wider">
              {data?.role}
            </span>
          </div>

          {/* Join Date */}
          <p className="text-gray-500 dark:text-slate-400 text-sm flex items-center justify-center gap-1 mb-6">
            📅 {t("profile.joined")} {formatDate(data?.createdAt) || 0}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              {t("profile.edit_profile")}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleShare}
              disabled={isSharing || !data?._id}
              className="w-full rounded flex items-center justify-center gap-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 hover:bg-yellow-50 dark:hover:bg-slate-800"
            >
              {isSharing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : shareCopied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Share2 size={18} />
              )}
              {shareCopied ? t("common.copied") : t("profile.share_profile")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {profileLinks.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link key={index} href={item.href}>
                <Button
                  variant="outline"
                  className="w-full rounded flex items-center justify-center gap-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 hover:bg-primary dark:hover:bg-primary hover:text-black dark:hover:text-black"
                >
                  <Icon size={18} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Milestones Card */}
      <div className="bg-gray-900 dark:bg-[#0e1424] dark:border dark:border-slate-800 rounded-lg p-6 text-white overflow-hidden">
        <h3 className="font-bold text-lg mb-4 tracking-widest text-gray-400 dark:text-slate-400">
          {t("levels.progress").toUpperCase()}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm mb-1">{t("levels.level")} {data?.level ?? 0}</p>
            <p className="text-yellow-400 font-bold">{data?.points ?? 0} {t("levels.points")}</p>
          </div>
        </div>
      </div>
      <ProfileUpdateModal open={open} onOpenChange={setOpen} data={data} />
    </div>
  );
}
