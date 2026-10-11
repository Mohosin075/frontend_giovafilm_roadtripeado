"use client";

import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifySubscriptionCheckoutMutation } from "@/redux/features/subscription/subscriptionApi";
import { useAppSelector } from "@/redux/hook";
import { selectAccessToken } from "@/redux/features/auth/authSlice";

import { useLanguage } from "@/lib/i18n/LanguageContext";

function SuccessContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const accessToken = useAppSelector(selectAccessToken);
  const [verifyCheckout, { isLoading }] = useVerifySubscriptionCheckoutMutation();
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);

  // If no session_id is provided, redirect to home immediately
  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId || !accessToken) return;

    let cancelled = false;
    verifyCheckout(sessionId)
      .unwrap()
      .then(() => {
        if (!cancelled) setVerified(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setVerified(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, accessToken, verifyCheckout]);

  // Prevent showing success screen to direct visitors without session_id
  if (!sessionId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19]">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </main>
    );
  }

  const waiting = !verified && (isLoading || Boolean(accessToken));

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] px-6 py-20 font-public-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#131b2e] rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-800 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center ${
              waiting
                ? "bg-yellow-50 dark:bg-yellow-950/40"
                : failed
                  ? "bg-amber-50 dark:bg-amber-950/40"
                  : "bg-green-50 dark:bg-green-950/40"
            }`}
          >
            {waiting ? (
              <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
            ) : failed ? (
              <AlertCircle className="w-16 h-16 text-amber-500 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="w-16 h-16 text-green-500 dark:text-green-400" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            {waiting
              ? t("common.confirming") || "Confirming your subscription..."
              : failed
                ? t("common.verification_pending") || "Verification Pending"
                : t("common.payment_successful") || "Payment Successful!"}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            {waiting
              ? "Please wait while we activate your business listing."
              : failed
                ? "Thank you! If your listing is not active yet, it may take a moment for Stripe to process. Please check My Business shortly."
                : "Thank you for your subscription. Your business journey with Roadtripeado starts now!"}
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/profile/my-business" className="block w-full">
            <Button
              disabled={waiting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold h-14 rounded-2xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95 cursor-pointer"
            >
              {t("common.go_to_my_businesses")}
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="ghost" className="w-full text-gray-500 dark:text-slate-400 font-semibold h-12 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
              {t("common.return_home")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19]">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
