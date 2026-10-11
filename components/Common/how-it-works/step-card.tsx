"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ReactNode;
  text: string;
}

interface StepCardProps {
  stepNumber: number;
  tag?: string;
  title: string;
  description: string;
  features: Feature[];
  image: React.ReactNode;
  imagePosition: "left" | "right";
  badges?: { label: string; icon?: React.ReactNode }[];
}

export function StepCard({
  stepNumber,
  tag,
  title,
  description,
  features,
  image,
  imagePosition,
  badges,
}: StepCardProps) {
  const isImageRight = imagePosition === "right";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-14 items-center bg-white dark:bg-[#131b2e]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-12 border border-gray-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_40px_rgba(255,193,7,0.1)] dark:hover:border-amber-400/40 transition-all duration-300",
          !isImageRight && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
        )}
      >
        {/* Text Content */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          {/* Step Tag & Number */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-[#FFC107] text-black font-black text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-[0_4px_12px_rgba(255,193,7,0.35)] shrink-0">
              0{stepNumber}
            </div>
            {tag && (
              <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 px-3 py-0.5 sm:py-1 rounded-full">
                {tag}
              </span>
            )}
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-950 dark:text-slate-100 tracking-tight leading-snug sm:leading-tight">
            {title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            {description}
          </p>

          {/* Feature List */}
          <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100/70 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {feature.icon}
                </div>
                <p className="text-gray-700 dark:text-slate-300 font-medium text-xs sm:text-sm md:text-base leading-snug pt-0.5">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          {/* Category Badges (if any) */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
              {badges.map((b, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 shadow-2xs"
                >
                  {b.icon}
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image Preview */}
        <div className="lg:col-span-6 w-full">
          <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/70 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-none">
            <div className="relative overflow-hidden aspect-4/3 sm:aspect-16/10 flex items-center justify-center">
              <div className="w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-102">
                {image}
              </div>
            </div>

            {/* Glowing Accent Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
