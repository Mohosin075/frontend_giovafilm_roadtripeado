"use client";

import { SafeImage } from "@/components/shared/safe-image";
import { NoImage } from "@/lib/others/others";
import { TPlace } from "@/lib/types/place/place";
import { getUsableMediaUrl, getLocalized } from "@/lib/utils";
import { MapPin, Star, Lock } from "lucide-react";
import Link from "next/link";
import { appAlert } from "@/lib/app-alert";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PlaceCard({ data }: { data: TPlace }) {
  const coverImage = getUsableMediaUrl(data?.media);
  const { t, language } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    if (data?.isLocked) {
      e.preventDefault();
      const mapId = data?.map 
        ? (typeof data.map === 'object' ? (data.map._id || data.map.id) : data.map)
        : null;
      
      appAlert.fire({
        title: t("map.unlock_full_map"),
        text: t("place.locked_alert_desc"),
        icon: "info",
        showCancelButton: true,
        confirmButtonText: t("map.buy_map"),
        cancelButtonText: t("common.cancel"),
      }).then((result) => {
        if (result.isConfirmed) {
          if (mapId) {
            window.location.href = `/catalog/${mapId}`;
          } else {
            window.location.href = "/catalog";
          }
        }
      });
    }
  };

  return (
    <Link href={`/places/${data?._id || data?.id}`} onClick={handleClick} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#131b2e]/90 border border-gray-100 dark:border-slate-800/80 hover:dark:border-amber-400/40 hover:shadow-2xl dark:shadow-xl transition-all duration-300 backdrop-blur-md">
        {/* Image Section */}
        <div className="relative h-36 sm:h-48 md:h-64 w-full">
          {coverImage ? (
            <SafeImage
              src={coverImage}
              alt={data?.isLocked ? "Premium Location" : getLocalized(data?.name, language)}
              fill
              className="hover:scale-105 transition-all duration-500"
            />
          ) : (
            <NoImage />
          )}
 
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-[#0b0f19]/90 text-gray-900 dark:text-slate-100 border border-gray-100/50 dark:border-slate-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-md backdrop-blur-md">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            {data?.isLocked ? "—" : parseFloat(data?.rating?.toFixed(1))}
          </div>
 
          {/* Lock Badge */}
          {data?.isLocked && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg">
              <Lock className="w-3.5 h-3.5" />
              {t("map.unlock_full_map")}
            </div>
          )}
        </div>
 
        {/* Content */}
        <div className="p-3 md:p-4 font-inter">
          <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-slate-100 group-hover:text-[#fabf13] transition-colors line-clamp-2">
            {data?.isLocked ? `🔒 ${t("map.unlock_full_map")}` : getLocalized(data?.name, language)}
          </h3>
 
          <div className="flex items-start text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1.5 gap-1.5">
            <MapPin size={14} className="shrink-0 mt-0.5 text-amber-500" />
            <span className="line-clamp-2">
              {data?.isLocked ? t("map.unlock_full_map") : getLocalized(data?.address, language)}
            </span>
          </div>
 
          <p className="text-gray-400 dark:text-slate-500 text-xs md:text-sm mt-1.5 line-clamp-1">
            {data?.isLocked
              ? t("map.unlock_full_map")
              : `${data?.totalReview} ${t("place.reviews")} • ${getLocalized(data?.category?.name, language)}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
