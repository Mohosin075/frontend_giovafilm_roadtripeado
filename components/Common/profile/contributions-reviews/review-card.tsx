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
  const targetName = getLocalized(target?.name, language) || "Unknown";
  const coverImage = isBusinessReview
    ? target?.media?.photos?.[0]
    : target?.media?.[0];
  const detailsHref = isBusinessReview
    ? `/maps/${target?._id}?type=business`
    : `/maps/${target?._id}`;

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 md:gap-6 hover:shadow-md transition-all duration-200 overflow-hidden">
      {coverImage ? (
        <div className="shrink-0 w-full md:w-64 lg:w-72 h-40 sm:h-52 md:h-auto relative overflow-hidden bg-gray-100 dark:bg-slate-900">
          <Image
            src={getImageUrl(coverImage)}
            alt={targetName}
            width={300}
            height={200}
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="shrink-0 w-full md:w-64 lg:w-72 h-40 sm:h-52 md:h-auto overflow-hidden bg-gray-100 dark:bg-slate-900">
          <NoImage />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between font-public-sans p-3.5 sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-slate-100 leading-snug">{targetName}</h3>
            {review?.status && (
              <span
                className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  review.status === "Approved"
                    ? "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40"
                    : review.status === "Rejected"
                      ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40"
                      : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                }`}
              >
                {review.status}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  {i < fullStars ? (
                    <Star
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ) : i === fullStars && hasHalfStar ? (
                    <div className="relative w-4 h-4">
                      <Star size={16} className="fill-gray-300 dark:fill-slate-700 text-gray-300 dark:text-slate-700" />
                      <div className="absolute top-0 left-0 overflow-hidden w-2">
                        <Star
                          size={16}
                          className="fill-amber-400 text-amber-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <Star size={16} className="fill-gray-300 dark:fill-slate-700 text-gray-300 dark:text-slate-700" />
                  )}
                </div>
              ))}
            </div>
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
              {t("reviews.reviewed_on")} {formatDate(review?.createdAt)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-3 line-clamp-3 sm:line-clamp-4">
            {getLocalized(review?.review, language)}
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 sm:border-none sm:pt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-5 rounded-lg cursor-pointer"
          >
            ✎ {t("reviews.edit_review")}
          </Button>
          <Link href={detailsHref} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-5 rounded-lg cursor-pointer"
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
