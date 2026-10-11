"use client";

import { Button } from "@/components/ui/button";
import { NoImage } from "@/lib/others/others";
import { getImageUrl, getLocalized } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ReviewModal } from "../maps/review-modal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Review {
  _id: string;
  placeId?: {
    _id: string;
    name: string;
    address?: string;
    media?: string[];
  };
  businessId?: {
    _id: string;
    name: string;
    media?: { photos?: string[] };
  };
  rating: number;
  createdAt: string;
  review: string;
  status?: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with View All Link */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          {t("reviews.my_reviews")} ({reviews?.length || 0})
        </h2>
        <Link
          href="/profile/contributions-reviews"
          className="text-green-600 dark:text-green-400 font-semibold text-sm hover:text-green-700 dark:hover:text-green-300 transition-colors"
        >
          {t("reviews.view_all")}
        </Link>
      </div>

      {/* Reviews List */}
      {!reviews?.length ? (
        <div className="py-16 text-center text-gray-500 dark:text-slate-400 text-sm bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-200 dark:border-slate-800">
          {t("reviews.no_reviews_yet")}
        </div>
      ) : (
      <div className="space-y-5">
        {reviews?.map((review) => {
          const isBusinessReview = !!review.businessId;
          const target = isBusinessReview ? review.businessId : review.placeId;
          const targetName = getLocalized(target?.name, language) || "Unknown";
          const coverImage = isBusinessReview
            ? review.businessId?.media?.photos?.[0]
            : review.placeId?.media?.[0];
          const detailsHref = isBusinessReview
            ? `/maps/${target?._id}?type=business`
            : `/maps/${target?._id}`;

          return (
          <div
            key={review._id}
            className="bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-200 dark:border-slate-800/80 overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row"
          >
            {/* Image Section */}
            <div className="relative w-full md:w-56 h-56 shrink-0">
              {coverImage ? (
                <Image
                  src={getImageUrl(coverImage)}
                  alt={targetName}
                  unoptimized
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full md:w-56 h-56">
                  <NoImage />
                </div>
              )}

              {/* Location Badge */}
              <div className="absolute bottom-3 left-1 bg-white/95 dark:bg-[#0b0f19]/95 px-2 py-1 rounded-md text-xs font-semibold text-gray-900 dark:text-slate-100 border border-transparent dark:border-slate-800 shadow-md flex items-center gap-1">
                <MapPin size={14} /> {targetName}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              {/* Title and Rating */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {targetName}
                  </h3>
                  {/* Star Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < Math.floor(review.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Date */}
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t("reviews.reviewed_on")}{" "}
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                  {review.status && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      review.status === 'Approved'
                        ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/60'
                        : review.status === 'Rejected'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                        : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/60'
                    }`}>
                      {review.status}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2">
                  {getLocalized(review.review, language)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => handleEdit(review)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm rounded-lg px-6 cursor-pointer"
                >
                  {t("reviews.edit_review")}
                </Button>
                <Link href={detailsHref}>
                  <Button
                    variant="outline"
                    className="text-gray-900 dark:text-slate-200 font-semibold text-sm rounded-lg px-6 border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t("place.view_details")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      )}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placeId={selectedReview?.placeId?._id}
        businessId={selectedReview?.businessId?._id}
        initialData={
          selectedReview
            ? {
                _id: selectedReview._id,
                rating: selectedReview.rating,
                review: typeof selectedReview.review === "object" ? (selectedReview.review as any)?.[language] || (selectedReview.review as any)?.en || "" : (selectedReview.review || ""),
              }
            : undefined
        }
      />
    </div>
  );
}
