"use client";

import { Button } from "@/components/ui/button";
import { useGetMyReviewsQuery } from "@/redux/features/review/reviewApi";
import { useGetMyRecommendationsQuery } from "@/redux/features/place/placeApi";
import { useState } from "react";
import { ContributionsSection } from "../contributions-section";
import { ReviewCard } from "./review-card";
import { RecommendedPlacesList } from "../recommended-places/recommended-places-list";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Star, MapPin } from "lucide-react";

export default function ContributionsReviews() {
  const { t, language } = useLanguage();
  const isEs = language === "es";

  const [activeTab, setActiveTab] = useState<"reviews" | "spots">("reviews");
  const [displayedReviews, setDisplayedReviews] = useState(3);

  const { data: reviewsData = [], isLoading: isReviewsLoading } =
    useGetMyReviewsQuery({});
  const reviews = reviewsData?.data || [];

  const { data: recData } = useGetMyRecommendationsQuery({ limit: 1 });
  const totalRecommendedSpots = recData?.meta?.total || recData?.data?.length || 0;

  const handleLoadMore = () => {
    setDisplayedReviews((prev) => prev + 3);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#0b0f19] py-3 sm:py-8">
      <div className="max-w-360 mx-auto p-3 sm:p-6 md:p-8 bg-white dark:bg-[#131b2e] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-6">
        <ContributionsSection onTabChange={setActiveTab} activeTab={activeTab} />

        {/* Tab switcher */}
        <div className="flex border-b dark:border-slate-800 gap-2 sm:gap-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 px-3 text-sm sm:text-base font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === "reviews"
                ? "border-amber-400 text-gray-900 dark:text-slate-100"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <Star size={16} className={activeTab === "reviews" ? "fill-amber-400 text-amber-400" : ""} />
            <span>
              {t("reviews.my_reviews")} ({isReviewsLoading ? "..." : reviews.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("spots")}
            className={`pb-3 px-3 text-sm sm:text-base font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === "spots"
                ? "border-amber-400 text-gray-900 dark:text-slate-100"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            <MapPin size={16} className={activeTab === "spots" ? "text-amber-500" : ""} />
            <span>
              {t("recommend.recommended_spots") || "Recommended Spots"} ({totalRecommendedSpots})
            </span>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "spots" ? (
          <RecommendedPlacesList />
        ) : (
          <div>
            {isReviewsLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 sm:py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium">
                  {t("reviews.loading_reviews")}
                </p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 sm:py-16 text-center text-gray-500 dark:text-slate-400 text-xs sm:text-sm bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                {t("reviews.no_reviews_yet")}
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-5">
                  {reviews.slice(0, displayedReviews).map((review: any) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>

                {reviews.length > displayedReviews && (
                  <div className="flex justify-center mt-6 sm:mt-10">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-amber-400 text-gray-900 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-bold px-6 py-3.5 sm:py-5 rounded-xl text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                    >
                      {t("reviews.load_more")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
