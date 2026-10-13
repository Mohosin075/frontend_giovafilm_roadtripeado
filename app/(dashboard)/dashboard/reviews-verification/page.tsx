"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetPendingReviewsQuery,
  useApproveReviewMutation,
  useRejectReviewMutation,
} from "@/redux/features/review/reviewApi";
import {
  useGetPlacesQuery,
  useReviewRecommendedPlaceMutation,
} from "@/redux/features/place/placeApi";
import { getImageUrl } from "@/lib/utils";
import {
  Check,
  X,
  Star,
  Sparkles,
  MapPin,
  MessageSquare,
  Eye,
  Clock,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { appAlert } from "@/lib/app-alert";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ViewPlaceModal } from "@/components/dashboard/places/view-place-modal";

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
  const [activeTab, setActiveTab] = useState<"reviews" | "spots">("reviews");

  // User reviews query & mutations
  const {
    data: reviews,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useGetPendingReviewsQuery({});
  const [approveReview, { isLoading: isApprovingReview }] =
    useApproveReviewMutation();
  const [rejectReview, { isLoading: isRejectingReview }] =
    useRejectReviewMutation();

  // Pending tourist spots query & mutation
  const {
    data: pendingPlacesResp,
    isLoading: isPlacesLoading,
    refetch: refetchPlaces,
  } = useGetPlacesQuery({
    status: "Pending",
    limit: 50,
  });
  const [reviewRecommendedPlace, { isLoading: isReviewingPlace }] =
    useReviewRecommendedPlaceMutation();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleApproveReview = async (id: string) => {
    try {
      await approveReview(id).unwrap();
      toast.success(
        t("reviews_admin.approved_successfully") ||
          "Review approved successfully"
      );
      refetchReviews();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve review");
    }
  };

  const handleRejectReview = async (id: string) => {
    try {
      await rejectReview(id).unwrap();
      toast.success(
        t("reviews_admin.rejected_successfully") ||
          "Review rejected successfully"
      );
      refetchReviews();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject review");
    }
  };

  const handleApprovePlace = async (place: any) => {
    const contributor =
      place.discoveredByName || place.discoveredBy?.name || "el usuario";
    appAlert
      .fire({
        title:
          language === "es"
            ? "¿Aprobar lugar recomendado?"
            : "Approve recommended spot?",
        text:
          language === "es"
            ? `¿Deseas aprobar "${getSafeString(
                place.name,
                language
              )}" y otorgar 50 puntos a ${contributor}?`
            : `Do you want to approve "${getSafeString(
                place.name,
                language
              )}" and award 50 points to ${contributor}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText:
          language === "es" ? "Sí, aprobar (+50 pts)" : "Yes, approve (+50 pts)",
        cancelButtonText: language === "es" ? "Cancelar" : "Cancel",
        confirmButtonColor: "#10B981",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await reviewRecommendedPlace({
              id: place._id,
              data: { status: "Published", pointsAwarded: 50 },
            }).unwrap();
            toast.success(
              language === "es"
                ? "Lugar aprobado y 50 puntos otorgados al usuario."
                : "Spot approved, published, and 50 points awarded!"
            );
            refetchPlaces();
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to approve spot");
          }
        }
      });
  };

  const handleRejectPlace = async (place: any) => {
    appAlert
      .fire({
        title:
          language === "es"
            ? "¿Rechazar lugar recomendado?"
            : "Reject recommended spot?",
        text:
          language === "es"
            ? "¿Estás seguro de que deseas rechazar este lugar?"
            : "Are you sure you want to reject this place recommendation?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: language === "es" ? "Rechazar" : "Reject",
        cancelButtonText: language === "es" ? "Cancelar" : "Cancel",
        confirmButtonColor: "#EF4444",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await reviewRecommendedPlace({
              id: place._id,
              data: { status: "Rejected" },
            }).unwrap();
            toast.success(
              language === "es"
                ? "Lugar rechazado exitosamente."
                : "Spot rejected successfully."
            );
            refetchPlaces();
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to reject spot");
          }
        }
      });
  };

  const reviewList = reviews?.data || [];
  const pendingSpotsList = pendingPlacesResp?.data || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          {t("reviews_admin.title") || "Verification & Moderation"}
        </h1>
        <p className="text-muted-foreground dark:text-slate-400 mt-2">
          {language === "es"
            ? "Revisa y aprueba reseñas de usuarios y nuevos lugares turísticos recomendados."
            : "Review and approve user reviews and newly recommended tourist spots."}
        </p>
      </div>

      {/* Verification Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-primary text-black shadow-xs font-bold"
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t("reviews_admin.title") || "User Reviews"}</span>
          {reviewList.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                activeTab === "reviews"
                  ? "bg-black/20 text-black"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {reviewList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("spots")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "spots"
              ? "bg-primary text-black shadow-xs font-bold"
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {language === "es"
              ? "Lugares Recomendados"
              : "Recommended Spots"}
          </span>
          {pendingSpotsList.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                activeTab === "spots"
                  ? "bg-black/20 text-black"
                  : "bg-amber-500 text-white"
              }`}
            >
              {pendingSpotsList.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: User Reviews */}
      {activeTab === "reviews" && (
        <>
          {isReviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : reviewList.length === 0 ? (
            <Card className="rounded-2xl border-dashed bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium text-muted-foreground dark:text-slate-400">
                  {t("reviews_admin.no_pending_reviews") ||
                    "No pending reviews to approve."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewList.map((review: any) => {
                const isBusiness = !!review.businessId;
                const businessLabel = t("business_admin.business");
                const placeLabel = t("places_admin.place");
                const targetType = isBusiness
                  ? businessLabel && businessLabel !== "business_admin.business"
                    ? businessLabel
                    : language === "es"
                    ? "Negocio"
                    : "Business"
                  : placeLabel && placeLabel !== "places_admin.place"
                  ? placeLabel
                  : language === "es"
                  ? "Lugar"
                  : "Place";
                const rawTargetName = isBusiness
                  ? review.businessId?.name
                  : review.placeId?.name;
                const targetName =
                  getSafeString(rawTargetName, language) ||
                  (isBusiness ? "Unknown Business" : "Unknown Place");

                const byLabel = t("reviews.by");
                const safeByLabel =
                  byLabel && byLabel !== "reviews.by"
                    ? byLabel
                    : language === "es"
                    ? "Por"
                    : "By";
                const reviewerName =
                  getSafeString(review.reviewer?.name, language) ||
                  "Anonymous";
                const reviewContent = getSafeString(review.review, language);

                return (
                  <Card
                    key={review._id}
                    className="rounded-2xl shadow-sm bg-white dark:bg-[#131b2e] border border-gray-150 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-semibold mb-1 line-clamp-1 text-gray-900 dark:text-slate-100">
                            {targetType}: {targetName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground dark:text-slate-400">
                            {safeByLabel}:{" "}
                            <span className="font-medium text-foreground dark:text-slate-200">
                              {reviewerName}
                            </span>
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
                        "{reviewContent ||
                          "No review content provided (Star rating only)"}"
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
                          onClick={() => handleRejectReview(review._id)}
                          disabled={isApprovingReview || isRejectingReview}
                          className="flex items-center gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 rounded-full"
                        >
                          <X className="w-4 h-4" />{" "}
                          {t("business_admin.reject") || "Reject"}
                        </Button>
                        <Button
                          onClick={() => handleApproveReview(review._id)}
                          disabled={isApprovingReview || isRejectingReview}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full border-none shadow-sm"
                        >
                          <Check className="w-4 h-4" />{" "}
                          {t("business_admin.approve") || "Approve"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Tourist Spot Recommendations */}
      {activeTab === "spots" && (
        <>
          {isPlacesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : pendingSpotsList.length === 0 ? (
            <Card className="rounded-2xl border-dashed bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Compass className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-muted-foreground dark:text-slate-400">
                  {language === "es"
                    ? "No hay lugares recomendados pendientes de revisión."
                    : "No pending tourist spot recommendations to review."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingSpotsList.map((spot: any) => {
                const contributor =
                  spot.discoveredByName ||
                  (typeof spot.discoveredBy === "object"
                    ? spot.discoveredBy?.name
                    : spot.discoveredBy) ||
                  "User";
                const firstMedia = spot.media?.[0];

                return (
                  <Card
                    key={spot._id}
                    className="rounded-2xl shadow-sm bg-white dark:bg-[#131b2e] border border-gray-150 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Spot Card Image & Header */}
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      {firstMedia ? (
                        <img
                          src={getImageUrl(firstMedia)}
                          alt={getSafeString(spot.name, language)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-400">
                          <Compass className="w-12 h-12 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/90 text-black">
                          <Clock size={12} />
                          {language === "es"
                            ? "Pendiente de revisión"
                            : "Pending Review"}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white drop-shadow-sm truncate">
                          {getSafeString(spot.name, language)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                          <MapPin size={12} className="text-amber-400 shrink-0" />
                          <span className="truncate">{spot.address}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Contributor badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          <Sparkles size={12} className="text-amber-500" />
                          <span>
                            {language === "es"
                              ? "Recomendado por:"
                              : "Recommended by:"}{" "}
                            <strong>{contributor}</strong>
                          </span>
                        </div>

                        {/* Category & Map tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                          {spot.category?.name && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 font-medium text-gray-700 dark:text-slate-300">
                              {getSafeString(spot.category.name, language)}
                            </span>
                          )}
                          {spot.map?.name && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                              🗺️ {getSafeString(spot.map.name, language)}
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        {spot.description && (
                          <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2">
                            {getSafeString(spot.description, language)}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-slate-800 mt-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlaceId(spot._id);
                            setIsViewModalOpen(true);
                          }}
                          className="text-xs gap-1.5 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
                        >
                          <Eye size={14} />
                          {language === "es" ? "Ver detalles" : "View Details"}
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectPlace(spot)}
                            disabled={isReviewingPlace}
                            className="text-xs gap-1 border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full"
                          >
                            <X size={13} />
                            {language === "es" ? "Rechazar" : "Reject"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprovePlace(spot)}
                            disabled={isReviewingPlace}
                            className="text-xs gap-1 bg-green-600 hover:bg-green-700 text-white rounded-full border-none shadow-sm cursor-pointer"
                          >
                            <Check size={13} />
                            {language === "es"
                              ? "Aprobar (+50 pts)"
                              : "Approve (+50 pts)"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Place Details Modal */}
      <ViewPlaceModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        placeId={selectedPlaceId}
      />
    </div>
  );
}
