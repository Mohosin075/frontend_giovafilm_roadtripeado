"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatOfferDiscountLabel } from "@/lib/offer-label";
import { NoImage } from "@/lib/others/others";
import { getImageUrl, convertTo12Hour } from "@/lib/utils";
import {
  useGetSingleBusinessQuery,
  useGetBusinessStatsQuery,
} from "@/redux/features/business/businessApi";
import {
  useGetOffersByPlaceOrBusinessIdQuery,
  useGetOfferRedemptionsQuery,
} from "@/redux/features/offer/offerApi";
import { useCreateCheckoutSessionMutation } from "@/redux/features/subscription/subscriptionApi";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Info,
  Instagram,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Shield,
  Tag,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BusinessOfferDialog } from "./business-offer-dialog";
import { BusinessEditDialog } from "./business-edit-dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";


export default function BusinessDetails() {
  const { t } = useLanguage();
  const { id } = useParams();
  const router = useRouter();
  const { data: response, isLoading } = useGetSingleBusinessQuery(id as string);
  const business = response?.data;
  const { data: offersRes } = useGetOffersByPlaceOrBusinessIdQuery(id, {
    skip: !id,
  });
  const linkedOffer = Array.isArray(offersRes?.data)
    ? offersRes.data[0]
    : offersRes?.data || null;
  const offer = business?.offer || linkedOffer;
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [businessEditDialogOpen, setBusinessEditDialogOpen] = useState(false);
  const [redemptionHistoryOpen, setRedemptionHistoryOpen] = useState(false);
  const [statsTimeFilter, setStatsTimeFilter] = useState<string>("all_time");

  const { data: statsRes } = useGetBusinessStatsQuery(
    {
      id: id as string,
      timeFilter: statsTimeFilter === "all_time" ? "" : statsTimeFilter,
    },
    { skip: !id }
  );

  const { data: redemptionsData, isLoading: isLoadingRedemptions } =
    useGetOfferRedemptionsQuery(
      {
        id: id as string,
        timeFilter: statsTimeFilter === "all_time" ? "" : statsTimeFilter,
      },
      { skip: !id }
    );
  const currentViewCount = statsRes?.data?.viewCount ?? business?.viewCount ?? 0;
  const redemptionsList = redemptionsData?.data?.redemptions || [];
  const redemptionsTotalCount =
    statsRes?.data?.totalOfferRedemptions ??
    redemptionsData?.data?.count ??
    offer?.redemptionsCount ??
    0;

  const [createPayment, { isLoading: isPaymentLoading }] =
    useCreateCheckoutSessionMutation();

  const handlePayNow = async (planId: string) => {
    const data = {
      planId,
      businessId: business._id,
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment-failed`,
    };
    try {
      const res = await createPayment(data).unwrap();
      if (res?.data?.url || res?.url) {
        window.location.href = res.data?.url || res.url;
      }
    } catch (error) {
      console.error(error);
      toast.error(t("payment.checkout_session_failed"));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle2 size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t("business_details.business_not_found")}
        </h2>
        <p className="text-slate-500 mb-8">
          {t("business_details.business_not_found_desc")}
        </p>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-xl px-8 font-bold cursor-pointer"
        >
          {t("business_details.go_back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-[#0b0f19] p-4 md:p-8 font-public-sans">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
              <ArrowLeft size={20} />
            </div>
            {t("business_details.back_to_list")}
          </button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBusinessEditDialogOpen(true)}
              className="bg-white dark:bg-[#131b2e] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 font-bold gap-2 h-10 rounded-xl cursor-pointer"
            >
              <Pencil size={15} />
              {t("business.edit_business") || "Edit Business"}
            </Button>
            <Badge
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-black uppercase tracking-wider ${getStatusStyles(business.status)}`}
            >
              {getStatusIcon(business.status)}
              {business.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#131b2e] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="relative h-[350px] md:h-[450px] w-full">
                {business.media?.photos?.length > 0 ? (
                  <Image
                    src={getImageUrl(business.media.photos[0])}
                    alt={business.name}
                    fill
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <NoImage />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="bg-primary px-4 py-1.5 rounded-full flex items-center gap-2 text-slate-950 font-black shadow-lg shadow-primary/20">
                      {business.category?.icon ? (
                        business.category.icon.startsWith("/") ||
                        business.category.icon.startsWith("http") ||
                        business.category.icon.includes("uploads/") ? (
                          <img
                            src={getImageUrl(business.category.icon)}
                            alt=""
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <span className="text-lg">{business.category.icon}</span>
                        )
                      ) : (
                        <span className="text-lg">🏢</span>
                      )}
                      <span className="text-xs font-black uppercase tracking-widest">
                        {business.category?.name}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    {business.name}
                  </h1>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Info className="text-primary" size={20} />
                    {t("business_details.about_business")}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBusinessEditDialogOpen(true)}
                    className="text-primary hover:text-primary hover:bg-primary/10 font-bold gap-1.5 h-8 text-xs cursor-pointer rounded-lg"
                  >
                    <Pencil size={13} />
                    {t("business.edit_business") || "Edit Business"}
                  </Button>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                  {business.description}
                </p>
              </div>
            </motion.div>

            {/* Exclusive Offer Section */}
            {!offer && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#131b2e] rounded-[2rem] p-8 border border-dashed border-slate-300 dark:border-slate-700 text-center"
              >
                <Shield className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={36} />
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  {t("business_details.no_offer_yet")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  {t("business_details.no_offer_desc")}
                </p>
                <Button
                  onClick={() => setOfferDialogOpen(true)}
                  className="rounded-xl h-11 px-6 font-bold gap-2 cursor-pointer bg-primary text-slate-950 hover:bg-primary/90"
                >
                  <Plus size={18} />
                  {t("business_details.add_offer")}
                </Button>
              </motion.div>
            )}

            {offer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-400 rounded-[2rem] p-8 md:p-10 border-4 border-yellow-300 shadow-xl shadow-yellow-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                  <Shield size={250} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 text-black/80 font-black tracking-tighter uppercase text-sm">
                      <Shield size={20} strokeWidth={3} className="text-black" />
                      {t("business_details.exclusive_offer_members")}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOfferDialogOpen(true)}
                      className="bg-white/80 hover:bg-white text-black border-black/10 font-bold gap-2 h-10 cursor-pointer"
                    >
                      <Pencil size={16} />
                      {t("business_details.edit_offer")}
                    </Button>
                  </div>

                  {(offer.photo || offer.images) && (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-black/10 bg-black/5 max-w-md">
                      <Image
                        src={getImageUrl(offer.images || offer.photo)}
                        alt={offer.title}
                        width={640}
                        height={360}
                        unoptimized
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <h2 className="text-3xl md:text-4xl font-black text-black mb-6 leading-tight">
                    {offer.title}
                  </h2>

                  <p className="text-black/80 font-bold mb-8 text-lg max-w-xl">
                    {offer.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                    <div className="bg-black/5 rounded-2xl p-4 border border-black/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">
                        {t("business_details.benefit")}
                      </p>
                      <p className="text-lg font-black text-black">
                        {formatOfferDiscountLabel({
                          discountType: offer.discountType,
                          discountValue: offer.discountValue ?? offer.discount,
                          discount: offer.discount,
                          bogoSecondType: offer.bogoSecondType,
                        })}
                      </p>
                    </div>
                    <div className="bg-black/5 rounded-2xl p-4 border border-black/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">
                        {t("business_details.validity")}
                      </p>
                      <p className="text-lg font-black text-black">
                        {offer.noExpiration
                          ? t("business_details.indefinite")
                          : offer.validUntil
                            ? new Date(
                                offer.validUntil,
                              ).toLocaleDateString()
                            : t("business_details.limited")}
                      </p>
                    </div>
                    <div className="bg-black/5 rounded-2xl p-4 border border-black/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">
                        {t("business_details.usage")}
                      </p>
                      <p className="text-lg font-black text-black">
                        {offer.maxRedemptions} {t("business_details.per_user")}
                      </p>
                    </div>
                    <div className="bg-black/5 rounded-2xl p-4 border border-black/5 backdrop-blur-sm">
                      <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mb-1">
                        {t("business_details.duration")}
                      </p>
                      <p className="text-lg font-black text-black">
                        {offer.redemptionDuration} {t("business_details.mins")}
                      </p>
                    </div>
                    <div className="bg-blue-900/10 rounded-2xl p-4 border border-blue-900/20 backdrop-blur-sm flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-black text-blue-950 uppercase tracking-widest mb-1 flex items-center justify-between">
                          <span>{t("business_details.total_views") || "Visits"}</span>
                          <Eye size={12} className="text-blue-700" />
                        </p>
                        <p className="text-lg font-black text-blue-950">
                          {currentViewCount}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-blue-900/80 mt-2">
                        {t("business_details.profile_traffic") || "Page visits"}
                      </p>
                    </div>
                    <div className="bg-purple-900/10 rounded-2xl p-4 border border-purple-900/20 backdrop-blur-sm flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-black text-purple-950 uppercase tracking-widest mb-1 flex items-center justify-between">
                          <span>{t("business_details.discounts_redeemed") || "Redeemed"}</span>
                          <Tag size={12} className="text-purple-700" />
                        </p>
                        <p className="text-lg font-black text-purple-950">
                          {redemptionsTotalCount}
                          {offer.totalRedemptionLimit ? ` / ${offer.totalRedemptionLimit}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRedemptionHistoryOpen(true)}
                        className="text-[11px] font-extrabold text-purple-900 hover:text-purple-700 underline text-left mt-2 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t("business_details.view_redemptions") || "View Details"}</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>


                  {offer.redemptionRules?.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-black/10">
                      <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4">
                        {t("business_details.redemption_rules")}
                      </h4>
                      <ul className="space-y-3">
                        {offer.redemptionRules.map(
                          (rule: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-black font-bold"
                            >
                              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-[10px] text-yellow-400 shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              {rule}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Photo Gallery */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 px-2 flex items-center gap-2">
                {t("business_details.photo_gallery")}
              </h3>
              {business.media?.photos?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {business.media.photos.map((photo: string, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 group"
                    >
                      <Image
                        src={getImageUrl(photo)}
                        alt={`Gallery ${index}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white" size={32} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-slate-400 bg-slate-50 dark:bg-[#131b2e]/60 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                  {t("business_details.no_photos")}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            {business?.hasActiveSubscription === false && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40 rounded-[2rem] p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  {t("business_details.premium_required")}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 font-semibold leading-relaxed">
                  {t("business_details.premium_required_desc")}
                </p>
                {business.plan ? (
                  <Button
                    onClick={() => handlePayNow(business.plan)}
                    disabled={isPaymentLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 cursor-pointer"
                  >
                    {isPaymentLoading ? t("business_details.processing") : t("business_details.activate_listing")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push("/pricing")}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-11 cursor-pointer"
                  >
                    {t("business_details.upgrade_to_premium")}
                  </Button>
                )}
              </motion.div>
            )}

            {/* Quick Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#131b2e] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <Filter size={16} className="text-primary" />
                  {t("business_details.analytics")}
                </h3>
                <select
                  value={statsTimeFilter}
                  onChange={(e) => setStatsTimeFilter(e.target.value)}
                  className="h-9 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                >
                  <option value="all_time">{t("business_details.period_all_time") || "All Time"}</option>
                  <option value="today">{t("business_details.period_today") || "Today"}</option>
                  <option value="this_week">{t("business_details.period_this_week") || "This Week"}</option>
                  <option value="this_month">{t("business_details.period_this_month") || "This Month"}</option>
                  <option value="last_month">{t("business_details.period_last_month") || "Last Month"}</option>
                </select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      <Eye size={20} />
                    </div>
                    {t("business_details.total_views")}
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {currentViewCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <Calendar size={20} />
                    </div>
                    {t("business_details.joined_date")}
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {new Date(business.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                      <Tag size={20} />
                    </div>
                    {t("business_details.discounts_redeemed") || "Discounts Redeemed"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRedemptionHistoryOpen(true)}
                    className="group flex items-center gap-1.5 cursor-pointer"
                    title={t("business_details.view_redemptions") || "View Details"}
                  >
                    <span className="text-2xl font-black text-purple-700 dark:text-purple-400 group-hover:underline">
                      {redemptionsTotalCount}
                    </span>
                    <ExternalLink size={13} className="text-purple-400 group-hover:text-purple-300" />
                  </button>
                </div>
              </div>
            </motion.div>


            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#131b2e] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6 uppercase tracking-widest">
                {t("business_details.contact_info")}
              </h3>
              <div className="space-y-5">
                {business.location?.address && (
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t("business_details.address")}
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {business.location.address}, {business.location.city}
                      </p>
                    </div>
                  </div>
                )}
                {business.contact?.phone && (
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t("business_details.phone")}
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {business.contact.phone}
                      </p>
                    </div>
                  </div>
                )}
                {business.contact?.website && (
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                      <Globe size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t("business_details.website")}
                      </p>
                      <a
                        href={business.contact.website}
                        target="_blank"
                        className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {business.contact.website}
                      </a>
                    </div>
                  </div>
                )}
                {business.contact?.instagram && (
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/40 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-all">
                      <Instagram size={20} />
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t("business_details.instagram")}
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-full">
                        @{business.contact.instagram}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#131b2e] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6 uppercase tracking-widest">
                {t("business_details.business_hours")}
              </h3>
              <div className="space-y-4">
                {business.hours?.schedule?.length > 0 ? (
                  business.hours.schedule.map((h: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0"
                    >
                      <span className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide">
                        {h.days || h.day}
                      </span>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        {convertTo12Hour(h.openTime)} - {convertTo12Hour(h.closeTime)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-sm">
                    {t("business_details.no_hours_listed")}
                  </p>
                )}
              </div>
            </motion.div>

            <Button
              asChild
              className="w-full h-16 rounded-2xl bg-slate-900 dark:bg-[#fabf13] hover:bg-black dark:hover:bg-[#e0ac10] text-white dark:text-slate-950 font-black text-lg gap-3 shadow-xl shadow-slate-200/50 dark:shadow-yellow-500/10 cursor-pointer"
            >
              <Link href={`/places/${business._id}?type=business`}>
                <ExternalLink size={24} />
                {t("business_details.view_public_page")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <BusinessOfferDialog
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
        businessId={business._id}
        existingOffer={offer}
      />

      <BusinessEditDialog
        open={businessEditDialogOpen}
        onOpenChange={setBusinessEditDialogOpen}
        business={business}
      />

      {/* Redemption History Dialog */}
      <Dialog open={redemptionHistoryOpen} onOpenChange={setRedemptionHistoryOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-[#131b2e] dark:border dark:border-slate-800 text-slate-900 dark:text-slate-100">
          <DialogHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Tag size={18} className="text-purple-600 dark:text-purple-400" />
              {t("business_details.redemption_history") || "Discount Redemption History"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  {t("business_details.discounts_redeemed") || "Total Discounts Redeemed"}
                </p>
                <p className="text-2xl font-black text-purple-950 dark:text-purple-100 mt-0.5">
                  {redemptionsTotalCount}
                  {offer?.totalRedemptionLimit ? ` / ${offer.totalRedemptionLimit}` : ""}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
                <CheckCircle2 size={20} />
              </div>
            </div>

            {isLoadingRedemptions ? (
              <div className="py-8 text-center text-xs text-gray-400 dark:text-slate-500">Loading redemptions...</div>
            ) : !redemptionsList || redemptionsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 dark:text-slate-400 font-semibold">
                {t("business_details.no_redemptions_yet") || "No discounts have been redeemed yet."}
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {redemptionsList.map((item: any, idx: number) => {
                  const userName = item.user?.name || "App Explorer";
                  const dateStr = new Date(item.redemptionTime || item.createdAt).toLocaleString();
                  return (
                    <div
                      key={item._id || idx}
                      className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-slate-100">{userName}</p>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400">{dateStr}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {t("business_details.redeemed") || "Redeemed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

