"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/redux/features/review/reviewApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId?: string;
  businessId?: string;
  isMapPurchased?: boolean;
  initialData?: {
    _id: string;
    rating: number;
    review: string;
  };
}

export function ReviewModal({
  isOpen,
  onClose,
  placeId,
  businessId,
  isMapPurchased,
  initialData,
}: ReviewModalProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (initialData && isOpen) {
      setRating(initialData.rating);
      setReview(initialData.review);
    } else if (!initialData && isOpen) {
      setRating(0);
      setReview("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!placeId && !businessId) {
      toast.error(t("maps.missing_location_id"));
      return;
    }
    if (rating === 0) {
      toast.error(t("maps.select_rating"));
      return;
    }
    if (!review.trim()) {
      toast.error(t("maps.write_review"));
      return;
    }

    try {
      let res;
      if (initialData) {
        res = await updateReview({
          id: initialData._id,
          data: { rating, review },
        }).unwrap();
      } else {
        res = await createReview({
          ...(placeId ? { placeId } : { businessId }),
          rating,
          review,
        }).unwrap();
      }

      if (res.success) {
        toast.success(
          initialData
            ? "Review updated successfully!"
            : "Review submitted successfully!",
        );
        if (!initialData) {
          setRating(0);
          setReview("");
        }
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save review");
    }
  };

  const RATING_LABELS: Record<number, string> = {
    1: t("reviews.terrible"),
    2: t("reviews.poor"),
    3: t("reviews.average"),
    4: t("reviews.very_good"),
    5: t("reviews.excellent"),
  };

  const currentRating = hover || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[94vw] max-w-lg sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] rounded-3xl p-0 border border-transparent dark:border-slate-800 shadow-2xl bg-white dark:bg-[#131b2e] flex flex-col overflow-hidden gap-0"
      >
        {/* Pinned Header with Close Button */}
        <div className="relative px-5 pt-5 pb-3 sm:px-7 sm:pt-6 sm:pb-4 border-b border-gray-100 dark:border-slate-800/80 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={17} />
          </button>
          <DialogTitle className="text-xl sm:text-2xl font-black text-center text-gray-900 dark:text-slate-100 uppercase tracking-tight">
            {initialData ? t("reviews.edit_your_review") : t("reviews.write_review")}
          </DialogTitle>
          <p className="text-center text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium mt-1 px-4">
            {t("reviews.share_authentic_exp")}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-7 sm:py-5 space-y-3.5 sm:space-y-4">
          {/* Star Rating Section */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-amber-50/60 dark:bg-[#0e1424] rounded-2xl border border-amber-100/80 dark:border-slate-800">
            <p className="font-bold text-gray-700 dark:text-slate-300 uppercase text-[11px] sm:text-xs tracking-wider">
              {t("reviews.rate_experience")}
            </p>
            <div className="flex gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform active:scale-90 p-1 cursor-pointer"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`size-7 sm:size-9 ${
                      currentRating >= star
                        ? "fill-yellow-400 text-yellow-400 scale-105"
                        : "text-gray-300 dark:text-slate-700 hover:text-gray-400 dark:hover:text-slate-500"
                    } transition-all duration-150`}
                  />
                </button>
              ))}
            </div>
            <span
              className={`text-[11px] sm:text-xs font-bold transition-opacity ${
                currentRating > 0
                  ? "text-amber-700 dark:text-amber-400 opacity-100"
                  : "text-gray-400 dark:text-slate-500 opacity-60"
              }`}
            >
              {currentRating > 0
                ? `${currentRating} ${t("reviews.stars")} — ${RATING_LABELS[currentRating] || ""}`
                : t("reviews.select_rating")}
            </span>
          </div>

          {/* Review Details Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-700 dark:text-slate-300 uppercase text-[11px] sm:text-xs tracking-wider">
                {t("reviews.review_details")}
              </p>
              <span
                className={`text-[10px] sm:text-xs font-medium ${
                  isMapPurchased !== false && review.trim().length >= 200
                    ? "text-green-600 dark:text-emerald-400 font-bold"
                    : "text-gray-400 dark:text-slate-500"
                }`}
              >
                {isMapPurchased === false
                  ? `${review.trim().length} ${t("reviews.characters")}`
                  : review.trim().length >= 200
                    ? t("reviews.bonus_unlocked")
                    : `${review.trim().length}/200 ${t("reviews.chars_for_bonus")}`}
              </span>
            </div>
            <Textarea
              placeholder={t("reviews.share_experience_placeholder")}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="resize-none h-28 sm:h-36 rounded-2xl border-gray-200 dark:border-slate-700/80 bg-gray-50/70 dark:bg-[#0e1424] text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-all p-3 sm:p-4 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Unpurchased Map Notice */}
          {isMapPurchased === false && (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 text-left">
              <span className="text-sm shrink-0 mt-0.5">ℹ️</span>
              <div className="text-[11px] sm:text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                <p className="font-bold">{t("reviews.unpurchased_map_notice_title")}</p>
                <p className="text-amber-800/90 dark:text-amber-400/90 mt-0.5">
                  {t("reviews.unpurchased_map_notice_desc")}
                </p>
              </div>
            </div>
          )}

          {/* Verification Process Notice */}
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 text-left">
            <span className="text-sm shrink-0 mt-0.5">🛡️</span>
            <div className="text-[11px] sm:text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              <p className="font-bold">{t("reviews.moderation_notice_title")}</p>
              <p className="text-blue-700 dark:text-blue-400/80 mt-0.5">
                {isMapPurchased === false
                  ? t("reviews.moderation_notice_desc_unpurchased")
                  : t("reviews.moderation_notice_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Pinned Action Buttons Footer */}
        <div className="px-4 py-3 sm:px-7 sm:py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-[#0e1424] flex-shrink-0">
          <div className="flex gap-2.5 sm:gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="flex-1 font-bold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-slate-700 rounded-xl h-11 sm:h-12 text-xs sm:text-sm uppercase tracking-wider bg-white dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl h-11 sm:h-12 text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:translate-y-0.5 disabled:opacity-50 border-none cursor-pointer"
            >
              {isLoading
                ? t("profile.saving")
                : initialData
                  ? t("common.save")
                  : t("common.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

