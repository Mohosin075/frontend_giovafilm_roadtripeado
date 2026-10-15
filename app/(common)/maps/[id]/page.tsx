"use client";

import FeatureMapDetailPage from "@/components/Common/maps/feature-map-detail";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
        </div>
      }
    >
      <FeatureMapDetailPage />
    </Suspense>
  );
}
