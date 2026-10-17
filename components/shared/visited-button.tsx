"use client";

import { useState, useEffect } from "react";
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

  const [optimisticVisited, setOptimisticVisited] = useState<boolean | null>(null);

  useEffect(() => {
    setOptimisticVisited(null);
  }, [placeId]);

  const { data: visitedData } = useGetMyVisitedPlacesQuery(undefined, {
    skip: !accessToken,
  });

  const visitedList: any[] = visitedData?.data || [];
  const isVisitedInList = visitedList.some((item: any) => {
    const pId = item.place?._id || item.place || item.business?._id || item.business;
    return String(pId) === String(placeId);
  });

  const isVisited =
    optimisticVisited !== null
      ? optimisticVisited
      : visitedData !== undefined
        ? isVisitedInList
        : Boolean(initialIsVisited);

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

    const previousState = isVisited;
    setOptimisticVisited(!previousState);

    try {
      const res = await toggleVisited({ placeId, type }).unwrap();
      const nextVisited = res?.data?.isVisited ?? res?.isVisited ?? !previousState;
      setOptimisticVisited(nextVisited);

      toast.success(
        nextVisited
          ? (t("visited.marked_success") || "Marked as visited! 🌟")
          : (t("visited.removed_success") || "Removed from visited places"),
      );
    } catch (error: unknown) {
      setOptimisticVisited(previousState);
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer rounded-xl h-11 sm:h-12 px-3.5 border ${
        isVisited
          ? "bg-[#FFC107] border-[#FFC107] text-black font-extrabold shadow-md hover:bg-[#FFB300] active:scale-95"
          : "bg-white dark:bg-[#131b2e] border-gray-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-[#FFC107] hover:text-[#FFC107] shadow-xs"
      } ${Style || ""}`}
      onClick={handleToggle}
      disabled={isLoading}
      title={isVisited ? (t("visited.badge") || "Visited") : (t("visited.mark_visited") || "Mark as Visited")}
      aria-label="Toggle visited"
    >
      <Check
        size={18}
        className={
          isVisited
            ? "stroke-[3.5] text-black"
            : isLoading
              ? "animate-pulse text-gray-400"
              : "stroke-[2.5]"
        }
      />
      {showText && (
        <span className="text-xs sm:text-sm font-bold">
          {isVisited ? (t("visited.badge") || "Visited") : (t("visited.mark_visited_short") || "Mark Visited")}
        </span>
      )}
    </button>
  );
}
