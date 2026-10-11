"use client";

import AdminReviewTasks from "@/components/dashboard/business/AdminReviewTasks";
import BusinessOverview from "@/components/dashboard/business/business-overview";
import HoursOfOperation from "@/components/dashboard/business/hours-of-operation";
import LocationVerification from "@/components/dashboard/business/LocationVerification";
import OwnerInformation from "@/components/dashboard/business/owner-information";
import PublicContactLinks from "@/components/dashboard/business/public-contact-links";
import { useRouter, useParams } from "next/navigation";
import {
  useGetSingleBusinessQuery,
  useUpdateBusinessStatusMutation,
  useDeleteBusinessMutation,
} from "@/redux/features/business/businessApi";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appAlert } from "@/lib/app-alert";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { NoImage } from "@/lib/others/others";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BusinessDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();

  const {
    data: response,
    isLoading,
    isError,
  } = useGetSingleBusinessQuery(id as string);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateBusinessStatusMutation();
  const [deleteBusiness] = useDeleteBusinessMutation();

  const business = response?.data;
  // console.log("business----", business);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus({
        id: id as string,
        status: newStatus,
      }).unwrap();
      toast.success(`Business ${newStatus} successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    const result = await appAlert.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteBusiness(id as string).unwrap();
        toast.success(t("business.deleted_success"));
        router.push("/dashboard/business");
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete business");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <p className="text-xl font-semibold text-gray-500">
          Business not found or error loading data.
        </p>
        <Link
          href="/dashboard/business"
          className="text-blue-600 hover:underline flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const businessData = {
    ...business,
    category:
      (typeof business.category === "object"
        ? business.category?.name
        : business.category) || "N/A",
    website: business.contact?.website || "",
    instagram: business.contact?.instagram || "",
  };

  const galleryItems = [
    ...(business.media?.photos || []),
    ...(business.media?.menu ? [business.media.menu] : []),
  ].filter(Boolean);

  const adminReview = {
    phoneVerified:
      business.adminReview?.phoneVerified ?? !!business.contact?.phone,
    websiteFunctional:
      business.adminReview?.websiteFunctional ?? !!business.contact?.website,
    locationPinVerified:
      business.adminReview?.locationPinVerified ?? !!business.isAccuracyVerified,
    mediaUploaded:
      business.adminReview?.mediaUploaded ?? galleryItems.length > 0,
    internalNotes: business.adminReview?.internalNotes || "",
  };

  return (
    <div className="pb-12">
      {/* breadcrumbs */}
      <div className="mb-6 flex items-center justify-between bg-white dark:bg-[#131b2e] p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <Link
          href="/dashboard/business"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
        >
          <ArrowLeft size={16} />
          {t("business_details.back_to_list")}
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              business.status === "Approved"
                ? "bg-green-50 text-green-700 border-green-200"
                : business.status === "Pending"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {business.status}
          </span>
          {business.status !== "Rejected" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("Rejected")}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-semibold text-sm disabled:opacity-50"
            >
              {t("business_admin.reject")}
            </button>
          )}
          {business.status !== "Approved" && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate("Approved")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50"
            >
              {t("business_admin.approve")}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
            title={t("business_admin.delete_business")}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <BusinessOverview businessData={businessData} />

          {/* Public Contact & Links */}
          <PublicContactLinks
            contact={business.contact}
            email={business.privateInfo?.contactEmail}
          />

          {/* Hours of Operation */}
          <HoursOfOperation schedule={business.hours?.schedule} />

          {/* Photos & Media Review */}
          <div className="bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {t("business_details.photo_gallery")}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.length > 0 ? (
                galleryItems.map((photo: string, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl aspect-square overflow-hidden group relative"
                  >
                    {photo ? (
                      <Image
                        src={getImageUrl(photo)}
                        alt=""
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <NoImage />
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-sm text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                  {t("business_details.no_photos")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          <OwnerInformation
            user={business?.user}
            privateInfo={business?.privateInfo}
          />
          <LocationVerification
            businessId={id as string}
            location={business.location}
            isAccuracyVerified={business?.isAccuracyVerified}
          />
          <AdminReviewTasks
            businessId={id as string}
            review={adminReview}
          />
        </div>
      </div>
    </div>
  );
}
