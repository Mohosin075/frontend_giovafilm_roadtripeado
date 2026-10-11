"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetPendingReviewsQuery,
  useApproveReviewMutation,
  useRejectReviewMutation,
} from "@/redux/features/review/reviewApi";
import { getImageUrl } from "@/lib/utils";
import { Check, X, Star } from "lucide-react";
import { toast } from "sonner";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const getSafeString = (val: any, lang: string = "es"): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[lang] || val.es || val.en || Object.values(val)[0] || "";
  }
  return String(val);
};

export default function ReviewsVerificationPage() {
  const { t, language } = useLanguage();
  const { data: reviews, isLoading, refetch } = useGetPendingReviewsQuery({});
  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [rejectReview, { isLoading: isRejecting }] = useRejectReviewMutation();

  const handleApprove = async (id: string) => {
    try {
      await approveReview(id).unwrap();
      toast.success(t("reviews_admin.approved_successfully") || "Review approved successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectReview(id).unwrap();
      toast.success(t("reviews_admin.rejected_successfully") || "Review rejected successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject review");
    }
  };

  const reviewList = reviews?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{t("reviews_admin.title")}</h1>
        <p className="text-muted-foreground dark:text-slate-400 mt-2">
          {t("reviews_admin.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reviewList.length === 0 ? (
        <Card className="rounded-2xl border-dashed bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-muted-foreground dark:text-slate-400">{t("reviews_admin.no_pending_reviews")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewList.map((review: any) => {
            const isBusiness = !!review.businessId;
            const businessLabel = t("business_admin.business");
            const placeLabel = t("places_admin.place");
            const targetType = isBusiness
              ? (businessLabel && businessLabel !== "business_admin.business" ? businessLabel : (language === "es" ? "Negocio" : "Business"))
              : (placeLabel && placeLabel !== "places_admin.place" ? placeLabel : (language === "es" ? "Lugar" : "Place"));
            const rawTargetName = isBusiness ? review.businessId?.name : review.placeId?.name;
            const targetName = getSafeString(rawTargetName, language) || (isBusiness ? "Unknown Business" : "Unknown Place");

            const byLabel = t("reviews.by");
            const safeByLabel = byLabel && byLabel !== "reviews.by" ? byLabel : (language === "es" ? "Por" : "By");
            const reviewerName = getSafeString(review.reviewer?.name, language) || "Anonymous";
            const reviewContent = getSafeString(review.review, language);

            return (
              <Card key={review._id} className="rounded-2xl shadow-sm bg-white dark:bg-[#131b2e] border border-gray-150 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold mb-1 line-clamp-1 text-gray-900 dark:text-slate-100">
                        {targetType}: {targetName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground dark:text-slate-400">
                        {safeByLabel}: <span className="font-medium text-foreground dark:text-slate-200">{reviewerName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200/60 dark:border-yellow-900/40 px-2.5 py-1 rounded-full text-sm font-semibold">
                      <Star className="w-4 h-4 fill-yellow-500 stroke-yellow-500" />
                      <span>{review.rating || 0}.0</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-gray-700 dark:text-slate-300 italic border-l-4 border-primary pl-3 py-1">
                    "{reviewContent || "No review content provided (Star rating only)"}"
                  </p>

                  {review.media && review.media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {review.media.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={getImageUrl(img)}
                          alt="Review upload"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-800"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(review._id)}
                      disabled={isApproving || isRejecting}
                      className="flex items-center gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 rounded-full"
                    >
                      <X className="w-4 h-4" /> {t("business_admin.reject") || "Reject"}
                    </Button>
                    <Button
                      onClick={() => handleApprove(review._id)}
                      disabled={isApproving || isRejecting}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full border-none shadow-sm"
                    >
                      <Check className="w-4 h-4" /> {t("business_admin.approve") || "Approve"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
