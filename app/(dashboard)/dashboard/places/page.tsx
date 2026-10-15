"use client";

import { PlacesTable } from "@/components/dashboard/places/places-table";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{t("nav.places")}</h1>
        </div>
        <Link href={"/dashboard/places/add-place"}>
          <button className="flex items-center gap-2 bg-primary/80 px-4 py-2 rounded-lg hover:bg-primary transition-colors text-black font-semibold">
            <Plus size={20} />
            {t("places_admin.add_place")}
          </button>
        </Link>
      </div>

      {/* Table */}
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading places...</div>}>
        <PlacesTable />
      </Suspense>
    </div>
  );
}

