"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecommendedPlacesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/contributions-reviews");
  }, [router]);

  return null;
}
