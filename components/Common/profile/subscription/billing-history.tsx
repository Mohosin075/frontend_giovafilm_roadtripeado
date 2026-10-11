"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const BillingHistory = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useGetMySubscriptionQuery();
  
  const subs = Array.isArray(data?.data)
    ? data.data
    : data?.data
    ? [data.data]
    : [];

  return (
    <Card className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-slate-100">{t("billing_history.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("billing_history.loading")}</p>
          </div>
        ) : subs.length > 0 ? (
          <div className="rounded-md border border-gray-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-slate-800">
                  <TableHead className="text-gray-700 dark:text-slate-300">{t("billing_history.plan")}</TableHead>
                  <TableHead className="text-gray-700 dark:text-slate-300">{t("billing_history.business")}</TableHead>
                  <TableHead className="text-gray-700 dark:text-slate-300">{t("billing_history.amount")}</TableHead>
                  <TableHead className="text-gray-700 dark:text-slate-300">{t("billing_history.status")}</TableHead>
                  <TableHead className="text-gray-700 dark:text-slate-300">{t("billing_history.billing_period")}</TableHead>
                  <TableHead className="text-gray-700 dark:text-slate-300">{t("billing_history.next_payment")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((sub: any) => (
                  <TableRow key={sub._id} className="border-b border-gray-100 dark:border-slate-800/60">
                    <TableCell className="font-medium text-gray-900 dark:text-slate-100">
                      {sub.planId?.name || "Premium Plan"}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700 dark:text-slate-200">
                      {sub.businessId?.name || "—"}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-slate-100">
                      {sub.planId?.price != null ? `$${sub.planId.price}` : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full uppercase ${
                          sub.status === "active"
                            ? "bg-green-100 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-400"
                            : sub.status === "canceled"
                            ? "bg-red-100 dark:bg-rose-950/50 text-red-700 dark:text-rose-400"
                            : "bg-yellow-100 dark:bg-amber-950/50 text-yellow-700 dark:text-amber-400"
                        }`}
                      >
                        {sub.status === "active" ? t("offers_admin.active") : sub.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-slate-400 text-xs">
                      {sub.currentPeriodStart
                        ? new Date(sub.currentPeriodStart).toLocaleDateString()
                        : "—"}
                      {" - "}
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 dark:text-slate-300">
                      {sub.status === "canceled"
                        ? t("offers_admin.expired")
                        : sub.cancelAtPeriodEnd
                        ? t("settings_admin.cancel_notice")
                        : sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-[#0e1424]">
            {t("billing_history.no_history")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistory;
