"use client";

import { Calendar, Download } from "lucide-react";
import { SalesTaxesChart } from "./sales-taxes-chart";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SalesTaxesData {
  totalSales: number;
  taxesCollected: number;
  netRevenue: number;
  monthlyData: any[];
}

interface SalesTaxesProps {
  data?: SalesTaxesData;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export default function SalesTaxes({ data, onExportCSV, onExportPDF }: SalesTaxesProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm text-gray-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">{t("dashboard.sidebar.reports")}</h2>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700" onClick={onExportCSV}>
            <Download className="w-4 h-4" />
            {t("reports_admin.export_csv")}
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={onExportPDF}>
            <Download className="w-4 h-4" />
            {t("reports_admin.export_pdf")}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50/50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900/40">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">{t("reports_admin.total_sales")}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">${data?.totalSales?.toLocaleString() || "0"}</p>
        </div>
        <div className="bg-green-50/50 dark:bg-emerald-950/30 rounded-xl p-6 border border-green-100 dark:border-emerald-900/40">
          <p className="text-sm font-semibold text-green-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">{t("reports_admin.taxes_collected")}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">${data?.taxesCollected?.toLocaleString() || "0"}</p>
        </div>
        <div className="bg-purple-50/50 dark:bg-purple-950/30 rounded-xl p-6 border border-purple-100 dark:border-purple-900/40">
          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider">{t("reports_admin.net_revenue")}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">${data?.netRevenue?.toLocaleString() || "0"}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50/50 dark:bg-slate-900/40 rounded-xl p-4 border border-gray-100 dark:border-slate-800">
        <SalesTaxesChart data={data?.monthlyData || []} />
      </div>
    </div>
  );
}
