"use client";

import { AddSubscriptionModal } from "@/components/dashboard/subscription/add-subscription-modal";
import { SubscriptionTable } from "@/components/dashboard/subscription/all-subscription-table";
import { SubscriptionCard } from "@/components/dashboard/subscription/subscription-card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  useCreateCheckoutSessionMutation,
  useDeleteSubscriptionPlanMutation,
  useGetSubscriptionPlansQuery,
} from "@/redux/features/subscription/subscriptionApi";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { appAlert } from "@/lib/app-alert";

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingPlan(null);
  };
  const { data: plansRes, isLoading } = useGetSubscriptionPlansQuery();
  const [createCheckoutSession, { isLoading: isCreating }] =
    useCreateCheckoutSessionMutation();
  const [deleteSubscriptionPlan, { isLoading: isDeleting }] =
    useDeleteSubscriptionPlanMutation();

  const plans = plansRes?.data || [];

  const subscriptionHistory = [
    {
      id: "SUB-12345",
      plan: "Professional Plan",
      amount: "$49.00",
      date: "2024-03-15",
      status: "Active",
      nextBilling: "2024-04-15",
    },
  ];

  const handleSubscribe = async (planId: string) => {
    try {
      const res = await createCheckoutSession({ planId }).unwrap();
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to initiate subscription");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    appAlert.fire({
      title: t("common.are_you_sure"),
      text: t("for_business.step6.failed_load_plans") || "You won't be able to revert this plan deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: t("common.yes_delete_it") || "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteSubscriptionPlan(planId).unwrap();
          if (res.success || res.data) {
            appAlert.fire({
              title: t("common.deleted") || "Deleted!",
              text: "Subscription plan has been deleted.",
              icon: "success",
            });
          }
        } catch (error: any) {
          toast.error(
            error?.data?.message || "Failed to delete subscription plan",
          );
        }
      }
    });
  };

  return (
    <div className="p-6 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase text-gray-900 dark:text-slate-100">{t("nav.subscription")}</h1>
        <Button
          onClick={() => {
            setEditingPlan(null);
            setIsAddModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest py-6 px-6 rounded-xl shadow-md"
        >
          + {t("subscriptions_admin.add_new_plan")}
        </Button>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-[#131b2e] rounded-2xl border border-dashed border-gray-300 dark:border-slate-800">
            <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">
              {t("for_business.step6.no_plans")}
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-slate-500">
              {t("subscriptions_admin.add_new_plan")}
            </p>
          </div>
        ) : (
          plans.map((plan: any) => (
            <SubscriptionCard
              key={plan._id}
              plan={plan}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
              isLoading={isCreating || isDeleting}
            />
          ))
        )}
      </div>

      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        plan={editingPlan}
      />
    </div>
  );
}

