"use client";

import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation } from "@/redux/features/subscription/subscriptionApi";
import { useGetMyBusinessesQuery } from "@/redux/features/business/businessApi";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hook";
import { useRouter } from "next/navigation";
import { appAlert } from "@/lib/app-alert";

export interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  priority: number;
}

interface PricingCardProps {
  plan: Plan;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isFormStep?: boolean;
}

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PricingCard({
  plan,
  isSelected,
  onSelect,
  isFormStep = false,
}: PricingCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.accessToken);
  const isEnterprise = plan.name.toLowerCase() === "enterprise";
  const isPro = plan.name.toLowerCase() === "pro";
  const [createCheckoutSession, { isLoading }] =
    useCreateCheckoutSessionMutation();

  const { data: businessesRes } = useGetMyBusinessesQuery(undefined, { skip: !token });
  const businesses = businessesRes?.data || [];

  // console.log(plan);

  const handleClick = async () => {
    if (!token) {
      toast.info(t("pricing_card.login_prompt"));
      router.push(`/login?redirect=/pricing`);
      return;
    }

    if (isFormStep) {
      if (onSelect) {
        onSelect(plan._id);
      }
    } else {
      router.push(`/for-business?plan=${plan._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 h-full flex flex-col ${
        isSelected
          ? "border-4 border-yellow-400 bg-white dark:bg-[#131b2e] shadow-xl scale-105 z-10"
          : isPro && isFormStep
            ? "border-2 border-yellow-400 bg-white dark:bg-[#131b2e] shadow-lg scale-102"
            : "border-2 border-gray-200 dark:border-slate-800/80 bg-white dark:bg-[#131b2e]/90 hover:border-gray-300 dark:hover:border-amber-400/40 backdrop-blur-md"
      } ${isEnterprise ? "!bg-slate-900 dark:!bg-[#0e1424] !text-white" : ""} ${
        isEnterprise && isSelected
          ? "!border-yellow-400 shadow-yellow-400/20"
          : ""
      }`}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute -top-4 right-4 z-20">
          <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white dark:border-slate-900">
            <Check size={14} strokeWidth={3} />{" "}
            {isFormStep ? t("pricing_card.selected") : t("pricing_card.current_plan")}
          </span>
        </div>
      )}

      {/* Popular Badge */}
      {isPro && !isSelected && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
            {t("pricing_card.most_popular")}
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="space-y-2 mb-4">
        <h3 className={`text-xl font-bold text-gray-900 dark:text-slate-100`}>{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-bold ${isEnterprise ? "text-yellow-400" : "text-gray-900 dark:text-slate-100"}`}
          >
            {/* {formatPrice(plan.price, plan.name)} */}${plan.price}
          </span>
          {plan.interval && plan.name.toLowerCase() !== "enterprise" && (
            <span
              className={`text-sm ${isEnterprise ? "text-gray-300" : "text-gray-600 dark:text-slate-400"}`}
            >
              /{plan.interval}
            </span>
          )}
        </div>
        <p className={`text-sm text-gray-600 dark:text-slate-400`}>{plan.description}</p>
      </div>

      {/* Select Button */}
      <Button
        type="button"
        disabled={isLoading || (isSelected && !isFormStep)}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected || isFormStep) {
            handleClick();
          }
        }}
        className={`w-full py-2 mb-6 font-semibold rounded-lg transition-all border-2 cursor-pointer ${
          isSelected
            ? "bg-green-500 text-white border-green-500 hover:bg-green-600 shadow-md"
            : isEnterprise
              ? "bg-gray-100 dark:bg-slate-800 text-black dark:text-white border-transparent hover:bg-gray-200 dark:hover:bg-slate-700"
              : isPro
                ? "bg-yellow-400 text-black border-transparent hover:bg-yellow-500 shadow-md shadow-yellow-500/20"
                : "bg-white dark:bg-[#0e1424] text-gray-900 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
        }`}
      >
        {isFormStep
          ? isSelected
            ? (t("pricing_card.plan_selected") || "Plan Selected")
            : (t("pricing_card.select_plan") || "Select Plan")
          : isLoading
            ? (t("pricing_card.processing") || "Processing...")
            : isSelected
              ? (t("pricing_card.current_plan") || "Current Plan")
              : (t("pricing_card.get_started") || "Get Started")}
      </Button>

      {/* Features */}
      <div className="space-y-3 mt-auto">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Check
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                isEnterprise ? "text-yellow-400" : "text-green-500 dark:text-green-400"
              }`}
            />
            <span
              className={`text-sm text-gray-700 dark:text-slate-300`}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
