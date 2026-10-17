"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface TablePaginationProps {
  page: number;
  limit: number;
  totalPage?: number;
  isLoading?: boolean;
  onPageChange: (newPage: number | ((prev: number) => number)) => void;
  onLimitChange: (newLimit: number) => void;
  options?: number[];
  className?: string;
}

export function TablePagination({
  page,
  limit,
  totalPage = 1,
  isLoading = false,
  onPageChange,
  onLimitChange,
  options = [5, 10, 20, 50],
  className = "",
}: TablePaginationProps) {
  const { t } = useLanguage();

  if (isLoading || totalPage === undefined || totalPage === null) {
    return null;
  }

  const effectiveTotalPage = Math.max(1, totalPage || 1);

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] mt-auto ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-slate-400">
          {t("dashboard.table.rows_per_page") || "Rows per page:"}
        </span>
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-gray-300 dark:border-slate-700 rounded p-1 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-slate-400 border-none">
          {t("common.page") || "Page"} {page} {t("common.of") || "of"} {effectiveTotalPage}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((p) => Math.max(1, Number(p) - 1))}
            disabled={page <= 1}
            className="dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            {t("dashboard.table.previous") || "Previous"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((p) => Number(p) + 1)}
            disabled={page >= effectiveTotalPage}
            className="dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            {t("dashboard.table.next") || "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
