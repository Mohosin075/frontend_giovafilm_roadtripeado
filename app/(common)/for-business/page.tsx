import { AddBusinessForm } from "@/components/Common/for-business/add-business-form";
import { Suspense } from "react";

export default function page() {
  return (
    <div>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AddBusinessForm />
      </Suspense>
    </div>
  );
}
