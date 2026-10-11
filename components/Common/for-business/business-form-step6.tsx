"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import { useGetSubscriptionPlansQuery } from "@/redux/features/subscription/subscriptionApi";
import { Plan, PricingCard } from "../pricing/PricingCard";

interface BusinessFormStep6Props {
  form: UseFormReturn<any>;
}

export function BusinessFormStep6({ form }: BusinessFormStep6Props) {
  const { t } = useLanguage();
  const { data: plansRes, isLoading, error } = useGetSubscriptionPlansQuery();
  const selectedPlan = form.watch("selectedPlan");

  const plans: Plan[] = plansRes?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-slate-400 font-medium font-public-sans text-xl">
          {t("for_business.step6.loading_plans")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#131b2e] rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 space-y-4">
        <p className="text-red-500 font-medium text-lg">
          {t("for_business.step6.failed_load_plans")}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-xl border-gray-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
        >
          {t("for_business.step6.try_again")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-sm md:text-base text-gray-500/80 dark:text-slate-400 uppercase tracking-wider font-bold">
          {t("for_business.step6.current_step")}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100">
          {t("for_business.step6.title")}
        </h2>
        <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t("for_business.step6.subtitle")}
        </p>
      </div>

      {/* Plans Grid */}
      <FormField
        control={form.control}
        name="selectedPlan"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              {plans.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#131b2e] rounded-3xl border border-dashed border-gray-300 dark:border-slate-800">
                  <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">
                    {t("for_business.step6.no_plans")}
                  </p>
                  <p className="mt-2 text-sm text-gray-400 dark:text-slate-500">
                    {t("for_business.step6.check_back_later")}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6 pt-4">
                  {plans.map((plan) => (
                    <PricingCard
                      key={plan._id}
                      plan={plan}
                      isSelected={selectedPlan === plan._id}
                      onSelect={(id) => field.onChange(id)}
                      isFormStep={true}
                    />
                  ))}
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
