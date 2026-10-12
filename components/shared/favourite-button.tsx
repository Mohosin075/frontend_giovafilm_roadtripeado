"use client";

import { Button } from "@/components/ui/button";
import {
  useAddToFavouriteMutation,
  useGetFavouritesQuery,
} from "@/redux/features/favourite/favouriteApi";
import { TFavouriteItem, TAddFavouritePayload } from "@/lib/types/favourite";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/utils";

type Props = {
  placeId: string;
  type: "Map" | "Place" | "Offer" | "Business";
  Style?: string;
};

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FavouriteButton({ placeId, type, Style }: Props) {
  const { t } = useLanguage();
  const [addToFavourite, { isLoading }] = useAddToFavouriteMutation();

  const { data: favouritesData } = useGetFavouritesQuery();
  const favouritesList: TFavouriteItem[] = favouritesData?.data || [];

  const key =
    type === "Map"
      ? "map"
      : type === "Place"
        ? "place"
        : type === "Offer"
          ? "offer"
          : "business";
  const isFavourite = favouritesList.some((fav: TFavouriteItem) => {
    if (fav.type !== type) return false;
    const id =
      typeof fav[key] === "string"
        ? fav[key]
        : (fav[key] as { _id: string })?._id;
    return id === placeId;
  });

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const router = useRouter();

  const handleFavourite = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!accessToken) {
      toast.error(t("login_required.title") || "Login Required", {
        description: t("login_required.description") || "You must be logged in to add items to favorites.",
      });
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    try {
      const payload: TAddFavouritePayload =
        type === "Map"
          ? { type, map: placeId }
          : type === "Place"
            ? { type, place: placeId }
            : type === "Offer"
              ? { type, offer: placeId }
              : { type, business: placeId };

      await addToFavourite(payload).unwrap();

      toast.success(
        isFavourite ? (t("common.removed_from_favourites") || "Removed from favourites") : (t("common.added_to_favourites") || "Added to favourites"),
      );
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
        !Style?.includes("bg-") ? "bg-white dark:bg-[#131b2e] border border-gray-200/80 dark:border-slate-700/80 shadow-sm hover:bg-gray-50 dark:hover:bg-[#1c263d]" : ""
      } ${Style || ""}`}
      onClick={handleFavourite}
      disabled={isLoading}
      aria-label="Toggle favourite"
    >
      <Heart
        size={20}
        className={
          isFavourite
            ? "text-red-500 fill-red-500"
            : isLoading
              ? "animate-pulse text-gray-400 dark:text-slate-500"
              : "text-slate-700 dark:text-white/90 hover:text-red-500 dark:hover:text-red-400 hover:fill-red-500/20 transition-all duration-200"
        }
      />
    </button>
  );
}
