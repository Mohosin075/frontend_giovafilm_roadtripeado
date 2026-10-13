"use client";

import { ContributionsSection } from "@/components/Common/profile/contributions-section";
import { RecommendedPlacesList } from "@/components/Common/profile/recommended-places/recommended-places-list";

export default function RecommendedPlacesPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#0b0f19] py-3 sm:py-8">
      <div className="max-w-360 mx-auto p-3 sm:p-6 md:p-8 bg-white dark:bg-[#131b2e] rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs space-y-6">
        <ContributionsSection />
        <div className="pt-2">
          <RecommendedPlacesList />
        </div>
      </div>
    </div>
  );
}
