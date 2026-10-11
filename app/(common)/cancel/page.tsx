"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CancelPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] px-6 py-20 font-public-sans">
      <div className="max-w-md w-full bg-white dark:bg-[#131b2e] rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-slate-800 text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center">
            <XCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{t("common.payment_cancelled")}</h1>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            {t("claim_promo.checkout_canceled") || "The payment process was cancelled. No worries, you can try again whenever you're ready."}
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/pricing" className="block w-full">
            <Button className="w-full bg-gray-900 dark:bg-[#fabf13] hover:bg-black dark:hover:bg-[#e0ac10] text-white dark:text-slate-950 font-bold h-14 rounded-2xl transition-all active:scale-95 cursor-pointer">
              {t("common.try_again")}
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
