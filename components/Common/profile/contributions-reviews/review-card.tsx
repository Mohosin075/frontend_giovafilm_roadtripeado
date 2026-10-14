"use client";

import { Button } from "@/components/ui/button";
import { NoImage } from "@/lib/others/others";
import { formatDate, getImageUrl, getLocalized } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { ReviewModal } from "../../maps/review-modal";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ReviewCard({ review }: any) {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rating = review?.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const isBusinessReview = !!review?.businessId;
  const target = isBusinessReview ? review.businessId : review.placeId;
  const targetName = getLocalized(target?.name, language) || t("common.unknown") || "Unknown";
  const coverImage = isBusinessReview
    ? target?.media?.photos?.[0]
    : target?.media?.[0];
  const detailsHref = isBusinessReview
    ? `/maps/${target?._id}?type=business`
    : `/maps/${target?._id}`;

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row hover:shadow-md transition-all duration-200 overflow-hidden">
      {coverImage ? (
        <div className="shrink-0 w-full md:w-48 lg:w-56 h-36 sm:h-40 md:h-auto md:self-stretch min-h-[140px] md:max-h-[190px] relative overflow-hidden bg-gray-100 dark:bg-slate-900">
          <Image
            src={getImageUrl(coverImage)}
            alt={targetName}
            fill
            sizes="(max-width: 768px) 100vw, 240px"
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div className="shrink-0 w-full md:w-48 lg:w-56 h-36 sm:h-40 md:h-auto md:self-stretch min-h-[140px] md:max-h-[190px] overflow-hidden bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
          <NoImage />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between font-public-sans p-3 sm:p-4 gap-2">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 leading-snug truncate max-w-md">
              {targetName}
            </h3>
            {review?.status && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  review.status === "Approved"
                    ? "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40"
                    : review.status === "Rejected"
                      ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40"
                      : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                }`}
              >
                {review.status === "Approved"
                  ? (t("common.approved") || "Approved")
                  : review.status === "Rejected"
                    ? (t("common.rejected") || "Rejected")
                    : (t("common.pending") || "Pending")}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  {i < fullStars ? (
                    <Star
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ) : i === fullStars && hasHalfStar ? (
                    <div className="relative w-3.5 h-3.5">
                      <Star size={14} className="fill-gray-300 dark:fill-slate-700 text-gray-300 dark:text-slate-700" />
                      <div className="absolute top-0 left-0 overflow-hidden w-1.5">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <Star size={14} className="fill-gray-300 dark:fill-slate-700 text-gray-300 dark:text-slate-700" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400">
              {t("reviews.reviewed_on")} {formatDate(review?.createdAt)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
            {getLocalized(review?.review, language)}
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 sm:border-none sm:pt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="flex-1 sm:flex-none h-8 sm:h-8.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs px-3 sm:px-4 rounded-lg cursor-pointer"
          >
            ✎ {t("reviews.edit_review")}
          </Button>
          <Link href={detailsHref} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 sm:h-8.5 border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-bold text-xs px-3 sm:px-4 rounded-lg cursor-pointer"
            >
              {t("place.view_details")}
            </Button>
          </Link>
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placeId={isBusinessReview ? undefined : target?._id}
        businessId={isBusinessReview ? target?._id : undefined}
        initialData={{
          _id: review?._id,
          rating: review?.rating,
          review: typeof review?.review === "object" ? (review?.review as any)?.[language] || (review?.review as any)?.en || "" : (review?.review || ""),
        }}
      />
    </div>
  );
}
