"use client";

import { useGetMyBusinessesQuery, useDeleteBusinessMutation } from "@/redux/features/business/businessApi";
import { getImageUrl } from "@/lib/utils";
import { useState } from "react";
import {
  Building2,
  MapPin,
  Eye,
  Clock,
  Plus,
  MoreVertical,
  ExternalLink,
  Settings,
  AlertCircle,
  Trash2,
  Tag,
  Calendar,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NoImage } from "@/lib/others/others";
import { useCreateCheckoutSessionMutation } from "@/redux/features/subscription/subscriptionApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { appAlert } from "@/lib/app-alert";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MyBusinessPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<string>("all_time");

  const { data: response, isLoading, isFetching } = useGetMyBusinessesQuery({
    timeFilter: timeFilter === "all_time" ? "" : timeFilter,
  });
  const businesses = response?.data || [];
  const stats = response?.meta?.stats || {
    totalBusinesses: businesses.length,
    totalViews: 0,
    totalDiscountsRedeemed: 0,
    activeBusinesses: businesses.filter(
      (b: any) => b.hasActiveSubscription && b.status === "Approved"
    ).length,
  };

  const [createPayment, { isLoading: isPaymentLoading }] =
    useCreateCheckoutSessionMutation();
  const [loadingBusinessId, setLoadingBusinessId] = useState<string | null>(null);

  const [deleteBusiness] = useDeleteBusinessMutation();

  const handleDeleteBusiness = async (id: string, name?: string) => {
    appAlert.fire({
      title: t("business_admin.delete_business") || "Delete this business?",
      text: t("common.are_you_sure"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: t("common.yes_delete_it") || "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteBusiness(id).unwrap();
          if (res?.success === true || res?.data) {
            toast.success(t("business_admin.deleted_successfully") || "Business deleted successfully");
          }
        } catch (error: any) {
          console.error(error);
          toast.error(error?.data?.message || "Failed to delete business");
        }
      }
    });
  };

  // ['Pending', 'Approved', 'Rejected']

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "Approved":
        return "bg-emerald-500 text-emerald-600 border-emerald-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Rejected":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const handlePayNow = async (planId: string, businessId: string) => {
    setLoadingBusinessId(businessId);
    const data = {
      planId,
      businessId,
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment-failed`,
    };
    try {
      const res = await createPayment(data).unwrap();
      console.log(res);
      if (res?.data?.url || res?.url) {
        window.location.href = res.data?.url || res.url;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBusinessId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0b0f19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t("business.my_businesses") || "My Businesses"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t("business.my_businesses_subtitle") || "Manage and track your business performance across the platform."}
            </p>
          </div>

          <Link href="/for-business">
            <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 text-slate-950 font-extrabold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-2 cursor-pointer">
              <Plus size={20} strokeWidth={3} />
              {t("business.add_new_business") || "Add New Business"}
            </Button>
          </Link>
        </div>

        {businesses.length > 0 && (
          <div className="mb-10 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#131b2e] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                <Filter size={18} className="text-primary" />
                <span>{t("business_details.filter_by_period") || "Filter statistics by time period"}:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {[
                  { id: "all_time", label: t("business_details.period_all_time") || "All Time" },
                  { id: "today", label: t("business_details.period_today") || "Today" },
                  { id: "this_week", label: t("business_details.period_this_week") || "This Week" },
                  { id: "this_month", label: t("business_details.period_this_month") || "This Month" },
                  { id: "last_month", label: t("business_details.period_last_month") || "Last Month" },
                ].map((tab) => {
                  const isActive = timeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTimeFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-slate-950 shadow-sm shadow-primary/30"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Performance Overview KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">
                    {t("business_details.total_views") || "Total Views"}
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {stats.totalViews ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Eye size={22} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">
                    {t("business_details.discounts_redeemed") || "Discounts Redeemed"}
                  </p>
                  <p className="text-2xl font-black text-purple-700 dark:text-purple-400">
                    {stats.totalDiscountsRedeemed ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Tag size={22} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">
                    {t("business_details.active_businesses") || "Active Businesses"}
                  </p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.activeBusinesses ?? 0} / {businesses.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {businesses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <Building2 size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t("business.no_businesses_yet") || "No Businesses Yet"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              {t("business.no_businesses_desc") || "Register your first business to start reaching thousands of travelers and local explorers."}
            </p>
            <Link href="/for-business">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold px-8 cursor-pointer"
              >
                {t("business.get_started") || "Get Started"}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business: any, index: number) => (
              <motion.div
                key={business._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
              >
                {/* Image Section */}
                <Link
                  href={`/profile/my-business/${business._id}`}
                  className="relative h-56 w-full block overflow-hidden bg-slate-100 dark:bg-slate-900"
                >
                  {business.media?.photos?.length > 0 ? (
                    <Image
                      src={getImageUrl(business.media?.photos?.[0])}
                      alt={business.name}
                      width={200}
                      height={200}
                      unoptimized
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <NoImage />
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 shadow-sm border border-white/20 dark:border-slate-700">
                    {business.category?.icon ? (
                      business.category.icon.startsWith("/") ||
                      business.category.icon.startsWith("http") ? (
                        <img
                          src={getImageUrl(business.category.icon)}
                          alt=""
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <span className="text-base">{business.category.icon}</span>
                      )
                    ) : (
                      <span className="text-base">🏢</span>
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      {business.category?.name || "General"}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(business.status)}`}
                    >
                      {business.status}
                    </Badge>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/profile/my-business/${business._id}`}>
                      <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                        {business.name}
                      </h3>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                          <MoreVertical size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] shadow-xl p-2 w-48 text-slate-900 dark:text-slate-100"
                      >
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg gap-2 font-medium focus:bg-slate-50 dark:focus:bg-slate-850 cursor-pointer"
                        >
                          <Link href={`/profile/my-business/${business._id}`}>
                            <Eye size={16} /> {t("business.view_details") || "View Details"}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const coords =
                              business.location?.mapLocation?.coordinates ||
                              business.location?.coordinates;
                            const lat = coords?.[1];
                            const lng = coords?.[0];
                            if (lat && lng) {
                              router.push(
                                `/view-location?lat=${lat}&lng=${lng}`,
                              );
                            } else {
                              toast.error(t("business.invalid_coords"));
                            }
                          }}
                          className="rounded-lg gap-2 font-medium focus:bg-slate-50 dark:focus:bg-slate-850 cursor-pointer"
                        >
                          <ExternalLink size={16} /> {t("business.view_on_map") || "View on Map"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteBusiness(business._id, business.name)}
                          className="rounded-lg gap-2 font-medium text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                        >
                          <Trash2 size={16} strokeWidth={2.5} /> {t("business.delete_business") || "Delete Business"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin size={16} />
                    <span className="text-xs font-medium truncate">
                      {business.location?.city}, {business.location?.country}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("business.subscription") || "Subscription"}:</span>
                      <Badge
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          business.hasActiveSubscription
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}
                        variant="outline"
                      >
                        {business.hasActiveSubscription ? (t("business.status_active") || "Active") : (t("business.status_inactive") || "Inactive / Unpaid")}
                      </Badge>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 shadow-2xs">
                      <Eye size={11} className="text-blue-600 dark:text-blue-400" />
                      <span>
                        {business.viewCount ?? 0} {t("business_details.views") || "Views"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/40 shadow-2xs">
                      <Tag size={11} className="text-purple-600 dark:text-purple-400" />
                      <span>
                        {business.discountsRedeemed ?? business.offer?.redemptionsCount ?? 0} {t("business_details.redeemed") || "Redeemed"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 font-medium leading-relaxed">
                    {business.description}
                  </p>

                  {business.hasActiveSubscription === false && (
                    <div className="flex flex-col gap-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl p-4 mb-6 border border-amber-200/50 dark:border-amber-800/40">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
                          {t("business.not_visible_warning") || "This business is not visible on the map because it lacks an active subscription."}
                        </p>
                      </div>
                      {business.plan ? (
                        <Button
                          onClick={() => handlePayNow(business.plan, business._id)}
                          size="sm"
                          disabled={isPaymentLoading}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg h-9 text-xs"
                        >
                          {isPaymentLoading && loadingBusinessId === business._id ? (t("business.processing") || "Processing...") : (t("business.activate_listing_pay") || "Activate Listing (Pay Now)")}
                        </Button>
                      ) : (
                        <Link href="/pricing">
                          <Button
                            size="sm"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg h-9 text-xs"
                          >
                            {t("business.upgrade_to_premium") || "Upgrade to Premium"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="flex items-center justify-between border-t pt-5 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 mt-4">
                      <Clock size={16} />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {new Date(business.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {business.status === "Pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/30"
                        >
                          Approval Needed
                        </Button>
                      )}

                      {business?.hasActiveSubscription === true &&
                        business.status === "Approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30"
                          >
                            Approved
                          </Button>
                        )}

                      {business.status === "Rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/30"
                          disabled
                        >
                          Rejected
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
