"use client";

import {
  useToggleVisitedMutation,
  useGetMyVisitedPlacesQuery,
} from "@/redux/features/visited/visitedApi";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Props = {
  placeId: string;
  type?: "Place" | "Business";
  initialIsVisited?: boolean;
  Style?: string;
  showText?: boolean;
};

export function VisitedButton({
  placeId,
  type = "Place",
  initialIsVisited,
  Style,
  showText = false,
}: Props) {
  const { t } = useLanguage();
  const [toggleVisited, { isLoading }] = useToggleVisitedMutation();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const router = useRouter();

  const { data: visitedData } = useGetMyVisitedPlacesQuery(undefined, {
    skip: !accessToken,
  });

  const visitedList: any[] = visitedData?.data || [];
  const isVisitedInList = visitedList.some((item: any) => {
    const pId = item.place?._id || item.place || item.business?._id || item.business;
    return String(pId) === String(placeId);
  });

  const isVisited = initialIsVisited ?? isVisitedInList;

  const handleToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!accessToken) {
      toast.error(t("login_required.title") || "Login Required", {
        description:
          t("login_required.description") ||
          "You must be logged in to mark places as visited.",
      });
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    try {
      const res = await toggleVisited({ placeId, type }).unwrap();
      const nextVisited = res?.data?.isVisited ?? !isVisited;

      toast.success(
        nextVisited
          ? "Marked as visited! 🌟"
          : "Removed from visited places",
      );
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer rounded-xl h-11 sm:h-12 px-3.5 border ${
        isVisited
          ? "bg-amber-500/15 border-amber-500 text-amber-500 font-bold shadow-xs hover:bg-amber-500/25"
          : "bg-white dark:bg-[#131b2e] border-gray-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-500 shadow-xs"
      } ${Style || ""}`}
      onClick={handleToggle}
      disabled={isLoading}
      title={isVisited ? "Visited" : "Mark as Visited"}
      aria-label="Toggle visited"
    >
      <Check
        size={18}
        className={
          isVisited
            ? "stroke-[3] text-amber-500"
            : isLoading
              ? "animate-pulse text-gray-400"
              : "stroke-[2.5]"
        }
      />
      {showText && (
        <span className="text-xs sm:text-sm font-semibold">
          {isVisited ? "Visited" : "Mark Visited"}
        </span>
      )}
    </button>
  );
}
