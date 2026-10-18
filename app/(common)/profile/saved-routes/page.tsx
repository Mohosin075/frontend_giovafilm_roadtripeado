import { Suspense } from "react";
import SavedRoutes from "@/components/Common/profile/saved-routes/saved-routes";

export default function SavedRoutesPage() {
  return (
    <Suspense fallback={null}>
      <SavedRoutes />
    </Suspense>
  );
}
