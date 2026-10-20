import { HIDE_GOOGLE_POI_STYLES } from "@/components/Common/maps/map";
"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function MapContent() {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const searchParams = useSearchParams();
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");

  const position = { lat, lng };

  if (!lat || !lng) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19]">
        <p className="text-gray-500 dark:text-slate-400 font-medium">{t("location.invalid_coordinates")}</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-[#0b0f19]">
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string}
      >
        <Map
          colorScheme={isDark ? "DARK" : "LIGHT"}
          defaultCenter={position}
          defaultZoom={15}
          minZoom={3}
          maxZoom={19}
          renderingType={"RASTER"}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
          streetViewControl={false}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID as string}
          styles={HIDE_GOOGLE_POI_STYLES}
          clickableIcons={false}
        >
          <AdvancedMarker position={position}>
            <Pin
              background={"#FBBC04"}
              glyphColor={"#000"}
              borderColor={"#000"}
            />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}

export default function ViewLocation() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
