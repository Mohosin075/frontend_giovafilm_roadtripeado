"use client";

import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  MapPin,
  Utensils,
  Camera,
  ShoppingBag,
  Trees,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";
import { StepCard } from "./step-card";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import browseMap from "@/public/how-it-works/browse-maps.png";
import purchaseYourMap from "@/public/how-it-works/purchase-your-map.png";
import exploreCity from "@/public/how-it-works/explore-the-city.png";
import StartExploring from "@/components/Common/landing-page/start-exploring";

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-neutral-50/50 dark:bg-[#0b0f19] pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-16 md:pt-20 md:pb-20 border-b border-gray-100 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19]">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-gradient-to-b from-amber-100/40 dark:from-amber-500/10 via-yellow-50/20 dark:via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-5">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-300 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("how_it_works_page.badge")}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-950 dark:text-slate-100 tracking-tight leading-[1.15]"
          >
            {t("how_it_works_page.title")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t("how_it_works_page.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Main Steps Section */}
      <section className="max-w-360 mx-auto px-4 md:px-6 pt-12 md:pt-16 space-y-12 md:space-y-16">
        {/* Step 1: Browse Maps */}
        <StepCard
          stepNumber={1}
          tag={t("how_it_works_page.step1_tag")}
          title={t("how_it_works_page.step1_title")}
          description={t("how_it_works_page.step1_desc")}
          features={[
            {
              icon: <Compass className="w-4 h-4" />,
              text: t("how_it_works_page.step1_f1"),
            },
            {
              icon: <MapPin className="w-4 h-4" />,
              text: t("how_it_works_page.step1_f2"),
            },
            {
              icon: <CheckCircle2 className="w-4 h-4" />,
              text: t("how_it_works_page.step1_f3"),
            },
          ]}
          image={
            <Image
              src={browseMap}
              alt="Browse maps interface"
              width={700}
              height={500}
              className="w-full h-full object-cover object-center"
              priority
            />
          }
          imagePosition="right"
        />

        {/* Step 2: Purchase Your Map */}
        <StepCard
          stepNumber={2}
          tag={t("how_it_works_page.step2_tag")}
          title={t("how_it_works_page.step2_title")}
          description={t("how_it_works_page.step2_desc")}
          features={[
            {
              icon: <ShieldCheck className="w-4 h-4" />,
              text: t("how_it_works_page.step2_f1"),
            },
            {
              icon: <Tag className="w-4 h-4" />,
              text: t("how_it_works_page.step2_f2"),
            },
            {
              icon: <Smartphone className="w-4 h-4" />,
              text: t("how_it_works_page.step2_f3"),
            },
          ]}
          image={
            <Image
              src={purchaseYourMap}
              alt="Purchase map screen"
              width={700}
              height={500}
              className="w-full h-full object-cover object-center"
            />
          }
          imagePosition="left"
        />

        {/* Step 3: Explore the City */}
        <StepCard
          stepNumber={3}
          tag={t("how_it_works_page.step3_tag")}
          title={t("how_it_works_page.step3_title")}
          description={t("how_it_works_page.step3_desc")}
          features={[
            {
              icon: <Compass className="w-4 h-4" />,
              text: t("how_it_works_page.step3_f1"),
            },
            {
              icon: <Sparkles className="w-4 h-4" />,
              text: t("how_it_works_page.step3_f2"),
            },
          ]}
          badges={[
            { label: t("how_it_works_page.eat_drink"), icon: <Utensils className="w-3.5 h-3.5 text-orange-500" /> },
            { label: t("how_it_works_page.sightseeing"), icon: <Camera className="w-3.5 h-3.5 text-blue-500" /> },
            { label: t("how_it_works_page.shopping"), icon: <ShoppingBag className="w-3.5 h-3.5 text-purple-500" /> },
            { label: t("how_it_works_page.nature"), icon: <Trees className="w-3.5 h-3.5 text-emerald-500" /> },
          ]}
          image={
            <Image
              src={exploreCity}
              alt="Explore the city map"
              width={700}
              height={500}
              className="w-full h-full object-cover object-center"
            />
          }
          imagePosition="right"
        />
      </section>

      {/* Bottom CTA Section */}
      <div className="mt-12 md:mt-20">
        <StartExploring />
      </div>
    </main>
  );
}
