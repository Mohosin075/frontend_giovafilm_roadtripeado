"use client";

import { PolicySection } from "@/components/shared/policy-section";
import termsData from "@/lib/terms.json";

export default function TermsOfServicePage() {
  return (
    <main className="bg-linear-to-b from-gray-50/50 via-white to-gray-50/50 dark:from-[#0b0f19] dark:via-[#0e1424] dark:to-[#0b0f19] min-h-screen py-16 md:py-24 font-inter">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight leading-tight">
            {termsData.title}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {termsData.description}
          </p>
          <p className="text-xs md:text-sm text-gray-400 dark:text-slate-500 font-medium">
            Last Updated: <span className="text-gray-700 dark:text-slate-300">{termsData.lastUpdated}</span>
          </p>
        </div>

        {/* White card container */}
        <div className="bg-white dark:bg-[#131b2e]/90 backdrop-blur-md rounded-3xl p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-none border border-gray-100/80 dark:border-slate-800/80">
          {/* Sections list */}
          <div className="space-y-10">
            {termsData.sections.map((section) => (
              <PolicySection
                key={section.id}
                id={section.id}
                title={section.title}
                content={section.content}
              />
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-14 pt-8 border-t border-gray-100 dark:border-slate-800">
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center leading-relaxed">
              These terms and conditions constitute the entire agreement between
              you and RoadTripAdo regarding your use of our website and
              services. If you have any questions, please contact us at{" "}
              <a
                href="mailto:legal@roadtripeado.com"
                className="text-yellow-600 dark:text-[#fabf13] hover:text-yellow-700 font-bold transition-colors cursor-pointer"
              >
                legal@roadtripeado.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
