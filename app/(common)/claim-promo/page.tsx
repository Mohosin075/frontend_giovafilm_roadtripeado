"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { selectAccessToken, logout } from "@/redux/features/auth/authSlice";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import {
  useVerifyPromoCodeQuery,
  useClaimFreePromoMutation,
  useCreatePromoCheckoutSessionMutation,
} from "@/redux/features/promo/promoApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Ticket,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  MapPin,
  WifiOff,
  Navigation,
  RefreshCw,
  MailCheck,
  UserPlus,
  LogIn,
  LogOut,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageContext";

function ClaimPromoContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const code = searchParams.get("code") || "";
  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  const accessToken = useAppSelector(selectAccessToken);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaimedSuccess, setIsClaimedSuccess] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [mismatchMessage, setMismatchMessage] = useState("");

  // RTK Query calls
  const { data: userProfile } = useGetProfileQuery({}, { skip: !accessToken });
  const {
    data: verifyRes,
    isLoading: isLoadingVerify,
    isError: isErrorVerify,
    error: verifyError,
    refetch: refetchVerification,
  } = useVerifyPromoCodeQuery(
    { code },
    { skip: !code || success }
  );

  const [claimFreePromo] = useClaimFreePromoMutation();
  const [createPromoCheckoutSession] = useCreatePromoCheckoutSessionMutation();

  const promoData = verifyRes?.data;
  const promoPrice = typeof promoData?.price === "number" ? promoData.price : Number(promoData?.price || 0);
  const isFree = promoData ? promoPrice === 0 : false;
  const rawMapName = typeof promoData?.mapId === "object" ? promoData?.mapId?.name : promoData?.mapName;
  const mapName = rawMapName || promoData?.mapName || "Selected Map";
  const promoType = promoData?.promoType || (isFree ? "influencer" : "upgrade");

  // Validate if logged-in user already owns this map safely (null-safe check)
  const purchasedMaps = Array.isArray(userProfile?.purchasedMaps) ? userProfile.purchasedMaps : [];
  const promoMapId = typeof promoData?.mapId === "object" ? promoData?.mapId?._id : promoData?.mapId;
  const alreadyOwnsMap =
    Boolean(promoMapId) &&
    purchasedMaps.some((m: any) => {
      if (!m) return false;
      const mId = typeof m === "object" && m !== null ? m._id : m;
      return String(mId) === String(promoMapId);
    });

  // Verify if email matches target email warning safely
  const userEmailStr = typeof userProfile?.email === "string" ? userProfile.email.toLowerCase() : "";
  const recipientEmailStr = typeof promoData?.recipientEmail === "string" ? promoData.recipientEmail.toLowerCase() : "";
  const emailMismatch =
    Boolean(accessToken) &&
    Boolean(recipientEmailStr) &&
    Boolean(userEmailStr) &&
    userEmailStr !== recipientEmailStr;

  // Auto claim or verify after logging in
  useEffect(() => {
    if (accessToken && code && !success) {
      refetchVerification();
    }
  }, [accessToken, code, success, refetchVerification]);

  // Handle Free Claiming
  const handleFreeClaim = async () => {
    if (!accessToken) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(`/claim-promo?code=${code}`)}`;
      router.push(redirectUrl);
      return;
    }

    if (emailMismatch) {
      const msg = `This invitation is specifically reserved for ${promoData?.recipientEmail}. You are logged in as ${userProfile?.email}.`;
      setMismatchMessage(msg);
      setShowMismatchModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await claimFreePromo({ code }).unwrap();
      setIsClaimedSuccess(true);
      toast.success(res?.message || "Invitation claimed successfully!");
      setTimeout(() => {
        handleGoToMap();
      }, 2000);
    } catch (error: any) {
      const errMsg = error?.data?.message || error?.message || "";
      if (errMsg.includes("specifically reserved for")) {
        setMismatchMessage(errMsg);
        setShowMismatchModal(true);
      } else {
        toast.error(errMsg || "Failed to redeem pass");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Paid Upgrade Stripe Checkout redirection
  const handlePaidCheckout = async () => {
    if (!accessToken) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(`/claim-promo?code=${code}`)}`;
      router.push(redirectUrl);
      return;
    }

    if (emailMismatch) {
      const msg = `This invitation is specifically reserved for ${promoData?.recipientEmail}. You are logged in as ${userProfile?.email}.`;
      setMismatchMessage(msg);
      setShowMismatchModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createPromoCheckoutSession({ code }).unwrap();
      if (result?.data?.url) {
        toast.loading("Redirecting to payment gateway...");
        window.location.href = result.data.url;
      } else {
        throw new Error("Stripe checkout session creation failed");
      }
    } catch (error: any) {
      const errMsg = error?.data?.message || error?.message || "";
      if (errMsg.includes("specifically reserved for")) {
        setMismatchMessage(errMsg);
        setShowMismatchModal(true);
      } else {
        toast.error(errMsg || "Failed to process upgrade");
      }
      setIsProcessing(false);
    }
  };

  // Navigation for unauthenticated visitors
  const handleGoToRegister = () => {
    const emailParam = promoData?.recipientEmail
      ? `&email=${encodeURIComponent(promoData.recipientEmail)}`
      : "";
    router.push(
      `/register?redirect=${encodeURIComponent(`/claim-promo?code=${code}`)}${emailParam}`
    );
  };

  const handleGoToLogin = () => {
    const emailParam = promoData?.recipientEmail
      ? `&email=${encodeURIComponent(promoData.recipientEmail)}`
      : "";
    router.push(
      `/login?redirect=${encodeURIComponent(`/claim-promo?code=${code}`)}${emailParam}`
    );
  };

  const handleGoToCatalog = () => {
    router.push("/catalog");
  };

  const handleGoToPurchasedMaps = () => {
    router.push("/profile/purchased-maps");
  };

  const handleGoToMap = () => {
    if (mapName && mapName !== "Selected Map") {
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedCountryFilter", mapName);
      }
      router.push("/maps");
    } else {
      router.push("/profile/purchased-maps");
    }
  };

  const isVipTheme = promoType === "influencer";

  // Render Loader
  if (isLoadingVerify && !success) {
    return (
      <div className={`flex items-center justify-center min-h-[75vh] py-16 px-4 relative overflow-hidden font-inter ${
        isVipTheme ? "bg-[#0B0F19] text-white" : "bg-[#F9FAFB] text-gray-900"
      }`}>
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFC107]" />
          <h3 className="text-xl font-bold tracking-tight">Verifying invitation...</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Please wait while we confirm your invitation details and map access settings.
          </p>
        </div>
      </div>
    );
  }

  // Case A: Stripe Checkout SUCCESS Redirect
  if (success) {
    return (
      <section className="relative min-h-[75vh] py-16 flex items-center justify-center overflow-hidden font-inter bg-[#F9FAFB] text-gray-900">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 text-center space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Upgrade Successful!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Payment verified. The map access has been successfully added to your account.
            </p>
          </div>
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Status: Lifetime Access Granted ✅
          </div>
          <Button
            onClick={handleGoToPurchasedMaps}
            className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-lg transition-all shadow-lg shadow-yellow-500/20 text-base"
          >
            View My Purchased Maps <ArrowRight size={18} className="ml-1 inline" />
          </Button>
        </div>
      </section>
    );
  }

  // Case B: Stripe Checkout CANCELLED Redirect
  if (cancelled) {
    return (
      <section className="relative min-h-[75vh] py-16 flex items-center justify-center overflow-hidden font-inter bg-[#F9FAFB] text-gray-900">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 text-center space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-[#FFC107]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Checkout Canceled</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Checkout was canceled. No charges were made. You can complete the upgrade whenever you're ready.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handlePaidCheckout}
              className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-lg shadow-lg shadow-yellow-500/20 text-base"
            >
              Retry Checkout
            </Button>
            <Button
              onClick={handleGoToCatalog}
              variant="outline"
              className="w-full h-14 border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 text-base"
            >
              Return to Catalog
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Case C1: Free Promo Claimed Successfully
  if (isClaimedSuccess) {
    return (
      <section className="relative min-h-[75vh] py-16 flex items-center justify-center overflow-hidden font-inter bg-[#F9FAFB] dark:bg-[#0b0f19] text-gray-900 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl p-8 text-center space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-slate-100">Invitation Claimed!</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Your free map access has been activated. Redirecting you to your map now...
            </p>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/40 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Status: Lifetime Access Granted ✅
          </div>
          <Button
            onClick={handleGoToMap}
            className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-black font-extrabold rounded-lg transition-all shadow-lg shadow-yellow-500/20 text-base cursor-pointer"
          >
            Open Map <ArrowRight size={18} className="ml-1 inline" />
          </Button>
        </div>
      </section>
    );
  }

  // Case C2: Invalid Code / Error State
  if (!isClaimedSuccess && (isErrorVerify || !code)) {
    const errorMsg =
      (verifyError as any)?.data?.message ||
      "Invalid promo link or invitation code.";
    const isAlreadyUsed = typeof errorMsg === "string" && /already been used/i.test(errorMsg);
    const isExpiredMsg = typeof errorMsg === "string" && /expired/i.test(errorMsg);
    const errorHeading = isAlreadyUsed
      ? "Invitation Already Used"
      : isExpiredMsg
        ? "Invitation Expired"
        : "Invalid Invitation";

    return (
      <section className="relative min-h-[75vh] py-16 flex items-center justify-center overflow-hidden font-inter bg-[#F9FAFB] dark:bg-[#0b0f19] text-gray-900 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-[#131b2e] rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl p-8 text-center space-y-6 relative z-10">
          <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-slate-100">{errorHeading}</h2>
            <p className="text-sm text-red-500 font-bold leading-relaxed">{errorMsg}</p>
          </div>
          <Button
            onClick={handleGoToCatalog}
            variant="outline"
            className="w-full h-14 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-base cursor-pointer"
          >
            View Public Maps
          </Button>
        </div>
      </section>
    );
  }

  // Features list
  const features = [
    {
      icon: MapPin,
      title: "Curated Places & Spots",
      desc: "Handpicked points of interest including photo locations, sights, and dining."
    },
    {
      icon: WifiOff,
      title: "Offline Access Navigation",
      desc: "Save all custom pins directly to Google Maps to access offline without signal."
    },
    {
      icon: Navigation,
      title: "Curated Road Routes",
      desc: "Optimized road routes mapping the best path for your road trip experience."
    },
    {
      icon: RefreshCw,
      title: "Regular Auto Updates",
      desc: "Updates and new recommendations automatically sync to your dashboard instantly."
    }
  ];

  // Case D: Render User Claim Split Screen Panel
  return (
    <section className={`relative min-h-[80vh] py-16 flex items-center overflow-hidden font-inter transition-colors duration-500 ${
      isVipTheme ? "bg-[#0B0F19] text-white" : "bg-[#F9FAFB] dark:bg-[#0b0f19] text-gray-900 dark:text-slate-100"
    }`}>
      {/* Background Split Pattern (Aligns with HeroBanner layout style) */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className={`w-full relative`}>
          <svg
            className={`absolute inset-0 w-full h-full ${isVipTheme ? "opacity-[0.03] stroke-white" : "opacity-[0.06] dark:opacity-[0.03] stroke-black dark:stroke-white"}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.1" />
            <line x1="-20" y1="100" x2="80" y2="0" stroke="currentColor" strokeWidth="0.1" />
            <line x1="20" y1="100" x2="120" y2="0" stroke="currentColor" strokeWidth="0.1" />
          </svg>
          {isVipTheme && (
            <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_top_right,rgba(250,191,19,0.12),transparent_50%)]" />
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        
        {/* Left Column: Platform features details */}
        <motion.div
          className="lg:col-span-7 space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-md ${
                isVipTheme
                  ? "bg-amber-400/10 text-yellow-400 border border-yellow-400/20"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40"
              }`}
            >
              {isVipTheme ? "✨ Premium VIP Access" : "🗺️ Platform Upgrade"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Unlock the Ultimate <br />
              <span className={isVipTheme ? "text-yellow-400" : "text-[#FFC107]"}>
                Interactive Road Trip Map
              </span>
            </h1>
            <p className={`text-base leading-relaxed max-w-lg ${isVipTheme ? "text-slate-400" : "text-gray-600 dark:text-slate-400"}`}>
              Welcome to Roadtripeado! Get ready to explore curated routes, offline navigation pins, and expert local guidelines.
            </p>
          </div>

          {/* Features cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={index}
                  className={`flex gap-4 p-5 rounded-xl border transition-all duration-300 group ${
                    isVipTheme
                      ? "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-yellow-400/20"
                      : "bg-white dark:bg-[#131b2e] border-gray-100 dark:border-slate-800 hover:shadow-lg shadow-black/5 hover:-translate-y-0.5"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${
                      isVipTheme ? "bg-slate-850 text-yellow-400" : "bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm tracking-tight text-gray-900 dark:text-slate-100">{feat.title}</h4>
                    <p className={`text-xs leading-relaxed ${isVipTheme ? "text-slate-400" : "text-gray-500 dark:text-slate-400"}`}>
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column: Pre-existing Invitation card with double checks validations */}
        <motion.div
          className="lg:col-span-5 flex justify-center w-full"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className={`w-full max-w-md rounded-2xl border shadow-xl overflow-hidden ${
              isVipTheme
                ? "bg-[#0E1527] border-slate-800/80 text-white"
                : "bg-white dark:bg-[#131b2e] border-gray-100 dark:border-slate-800 text-gray-900 dark:text-slate-100"
            }`}
          >
            {/* Card Header Banner */}
            <div
              className={`py-5 px-6 flex items-center gap-4 border-b ${
                isVipTheme
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-slate-800"
                  : "bg-amber-50/40 dark:bg-[#0e1424] text-gray-900 dark:text-slate-100 border-gray-100 dark:border-slate-800"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                  isVipTheme ? "bg-black text-yellow-400" : "bg-[#FFC107] text-black"
                }`}
              >
                {isVipTheme ? <Star className="fill-yellow-400" size={22} /> : <Ticket size={22} />}
              </div>
              <div>
                <span
                  className={`text-[9px] uppercase tracking-widest font-bold ${
                    isVipTheme ? "text-black/60" : "text-amber-800/70 dark:text-amber-300"
                  }`}
                >
                  {isVipTheme ? "VIP GUEST INVITATION" : "EXCLUSIVE MAP OFFER"}
                </span>
                <h2 className="text-base font-extrabold leading-tight">
                  {isVipTheme ? "Exclusive Guest Pass" : "Upgrade Map Pass"}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6 font-inter">
              {/* Map Target Details */}
              <div
                className={`p-4 rounded-xl border space-y-1 ${
                  isVipTheme ? "bg-slate-900/60 border-slate-800" : "bg-gray-50 dark:bg-[#0e1424] border-gray-100 dark:border-slate-800"
                }`}
              >
                <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">{t("common.target_map")}</span>
                <h3 className="text-lg font-black flex items-center gap-1.5 leading-tight">
                  {mapName} {isVipTheme && <Sparkles size={14} className="text-yellow-400" />}
                </h3>
                <p className={`text-xs leading-relaxed ${isVipTheme ? "text-slate-400" : "text-gray-500 dark:text-slate-400"}`}>
                  Unlocks full geographic locations, guides, pins, and reviews.
                </p>
              </div>

              {/* Price Row */}
              <div
                className={`flex items-center justify-between py-3 border-y border-dashed ${
                  isVipTheme ? "border-slate-800" : "border-gray-200 dark:border-slate-800"
                }`}
              >
                <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Upgrade Cost</span>
                {isFree ? (
                  <span className={`text-base font-extrabold uppercase ${isVipTheme ? "text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                    Free VIP Pass
                  </span>
                ) : (
                  <span className="text-xl font-black">${promoPrice.toFixed(2)} USD</span>
                )}
              </div>

              {/* Warnings / notices */}
              
              {/* Warning A: User already owns the map */}
              {alreadyOwnsMap && (
                <div
                  className={`p-4 rounded-xl border flex gap-3 ${
                    isVipTheme ? "bg-emerald-950/20 border-emerald-800/30" : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100/50 dark:border-emerald-800/40"
                  }`}
                >
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold ${isVipTheme ? "text-emerald-400" : "text-emerald-900 dark:text-emerald-300"}`}>
                      Already Unlocked
                    </h4>
                    <p className={`text-[10px] leading-relaxed ${isVipTheme ? "text-slate-400" : "text-emerald-700 dark:text-emerald-300/80"}`}>
                      You already have active access to <strong>{mapName}</strong> in your account. You can open and view it in your dashboard now.
                    </p>
                  </div>
                </div>
              )}

              {/* Warning B: Email Mismatch */}
              {emailMismatch && !alreadyOwnsMap && (
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    isVipTheme ? "bg-amber-950/20 border-amber-800/30" : "bg-amber-50 dark:bg-amber-950/30 border-amber-100/50 dark:border-amber-800/40"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <MailCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold ${isVipTheme ? "text-amber-400" : "text-amber-900 dark:text-amber-300"}`}>
                        Account Email Note
                      </h4>
                      <p className={`text-[10px] leading-relaxed ${isVipTheme ? "text-slate-400" : "text-amber-700 dark:text-amber-300/80"}`}>
                        This invitation is specifically reserved for <strong>{promoData?.recipientEmail}</strong>. You are logged in as <strong>{userProfile?.email}</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `This invitation is specifically reserved for ${promoData?.recipientEmail}. You are logged in as ${userProfile?.email}.`;
                      setMismatchMessage(msg);
                      setShowMismatchModal(true);
                    }}
                    className={`text-[11px] font-semibold flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      isVipTheme
                        ? "text-yellow-400 hover:bg-yellow-400/10"
                        : "text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/30"
                    }`}
                  >
                    <MailCheck size={13} />
                    View Mismatch Details
                  </button>
                </div>
              )}

              {/* Warning C: Not logged in */}
              {!accessToken && (
                <div
                  className={`p-4 rounded-xl border flex gap-3 ${
                    isVipTheme ? "bg-slate-900 border-slate-800" : "bg-yellow-50/70 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-800/40"
                  }`}
                >
                  <Lock className={`w-5 h-5 shrink-0 mt-0.5 ${isVipTheme ? "text-yellow-400" : "text-yellow-600 dark:text-yellow-400"}`} />
                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold ${isVipTheme ? "text-white" : "text-yellow-900 dark:text-yellow-200"}`}>
                      Sign In or Sign Up Required
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${isVipTheme ? "text-slate-300" : "text-yellow-900 dark:text-yellow-300/90"}`}>
                      {promoData?.recipientEmail ? (
                        <>
                          This invitation was sent to <strong className="font-bold underline">{promoData.recipientEmail}</strong>. Please sign in or create an account with <strong className="font-bold underline">{promoData.recipientEmail}</strong> to claim this map pass.
                        </>
                      ) : (
                        <>
                          Create a free account or sign in to claim this exclusive invitation pass. The unlocked map will be permanently attached to your profile.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div>
                {alreadyOwnsMap ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleGoToMap}
                      className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      Open {mapName} <ArrowRight size={16} className="ml-1.5 inline" />
                    </Button>
                    <Button
                      onClick={handleGoToPurchasedMaps}
                      variant="outline"
                      className={`w-full h-12 font-semibold rounded-lg text-sm transition-all cursor-pointer ${
                        isVipTheme
                          ? "border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      View All My Purchased Maps
                    </Button>
                  </div>
                ) : !accessToken ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleGoToRegister}
                      className={`w-full h-14 font-bold rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm uppercase tracking-wider ${
                        isVipTheme
                          ? "bg-yellow-400 hover:bg-yellow-500 text-black shadow-yellow-400/20"
                          : "bg-[#FFC107] hover:bg-[#FFB300] text-black shadow-yellow-500/20"
                      }`}
                    >
                      <UserPlus size={18} className="mr-2 inline" />
                      {isFree ? "Create Free Account & Claim" : "Create Account to Upgrade"}
                    </Button>
                    <Button
                      onClick={handleGoToLogin}
                      variant="outline"
                      className={`w-full h-12 font-semibold rounded-lg text-sm transition-all cursor-pointer ${
                        isVipTheme
                          ? "border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <LogIn size={16} className="mr-2 inline" />
                      Already have an account? Log In
                    </Button>
                  </div>
                ) : isFree ? (
                  <Button
                    onClick={handleFreeClaim}
                    disabled={isProcessing}
                    className={`w-full h-14 font-bold rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm uppercase tracking-wider ${
                      isVipTheme
                        ? "bg-yellow-400 hover:bg-yellow-500 text-black shadow-yellow-400/20"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        Redeem Guest Pass <Unlock size={16} className="ml-1.5 inline" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePaidCheckout}
                    disabled={isProcessing}
                    className="w-full h-14 bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-lg shadow-lg shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm uppercase tracking-wider"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        Confirm Upgrade <ShieldCheck size={16} className="ml-1.5 inline" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Custom Email Mismatch Modal ── */}
      {showMismatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-6 text-center space-y-6 relative overflow-hidden">
            {/* Top Banner Icon */}
            <div className="mx-auto w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
              <MailCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Account Email Mismatch
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium px-2">
                {mismatchMessage ||
                  `This invitation is specifically reserved for ${promoData?.recipientEmail}. You are logged in as ${userProfile?.email}.`}
              </p>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 text-xs text-amber-900 text-left font-medium space-y-1">
              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600 shrink-0" /> Important Notice:
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                To claim this map access, please log out of your current account and log in or sign up with <strong>{promoData?.recipientEmail || "the invited email"}</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                type="button"
                onClick={() => {
                  setShowMismatchModal(false);
                  dispatch(logout());
                  const targetEmail = promoData?.recipientEmail ? `&email=${encodeURIComponent(promoData.recipientEmail)}` : "";
                  router.push(`/login?redirect=${encodeURIComponent(`/claim-promo?code=${code}`)}${targetEmail}`);
                  toast.info(t("auth.logged_out_invite"));
                }}
                className="w-full h-12 bg-[#FFC107] hover:bg-[#FFB300] text-black font-extrabold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={16} />
                Log Out & Switch Account
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMismatchModal(false)}
                className="w-full h-11 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 text-sm cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ClaimPromoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[75vh] bg-slate-50 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFC107]" />
          <p className="text-sm font-bold text-gray-500 animate-pulse">Retrieving invitation link...</p>
        </div>
      }
    >
      <ClaimPromoContent />
    </Suspense>
  );
}
