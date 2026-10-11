"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Download, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
} as const;

export default function PersonalizedExperience() {
  const { t } = useLanguage();

  const features = [
    {
      title: t("landing.wishlist_title"),
      description: t("landing.wishlist_desc"),
      icon: <Bookmark className="text-yellow-500" size={20} />,
    },
    {
      title: t("landing.offline_title"),
      description: t("landing.offline_desc"),
      icon: <Download className="text-yellow-500" size={20} />,
    },
    {
      title: t("landing.collab_title"),
      description: t("landing.collab_desc"),
      icon: <Share2 className="text-yellow-500" size={20} />,
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden font-inter">
      {/* Background Shape */}
      <div className="absolute inset-0 bg-primary/20 dark:bg-amber-500/5 rounded-tr-[200px] z-0" />

      <div className="relative max-w-360 mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* LEFT SIDE */}
        <div className="space-y-8 w-full lg:w-1/2">
          <motion.h2
            className="text-4xl font-bold text-gray-900 dark:text-slate-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("landing.personalized_title")}
          </motion.h2>

          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 6, scale: 1.01 }}
                className="w-full"
              >
                <Card className="rounded-xl shadow-xs bg-white dark:bg-[#131b2e]/90 py-0 cursor-pointer border border-gray-100/50 dark:border-slate-800/80 hover:shadow-md transition-all">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-yellow-50 dark:bg-slate-900 border border-transparent dark:border-slate-800">
                      {feature.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-slate-100">{feature.title}</h3>

                      <p className="text-muted-foreground dark:text-slate-400 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT SIDE MOCK UI */}
        <motion.div
          className="relative flex justify-center w-full lg:w-1/2"
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          whileHover={{ y: -5 }}
        >
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl shadow-2xl w-full md:w-lg p-6 border border-gray-100 dark:border-slate-800">
            {/* Fake Browser Top */}
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-400 rounded-full" />
            </div>

            {/* Profile Row */}
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <span className="text-black font-bold">👤</span>
              </motion.div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{t("landing.welcome_back")}</p>

                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  {t("landing.active_maps")}
                </p>
              </div>
            </div>

            {/* Fake Content */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />

              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg flex items-center justify-center bg-gray-50/50 dark:bg-[#0e1424]">
                  <div className="w-6 h-6 bg-gray-300 dark:bg-slate-700 rounded-full" />
                </div>

                <div className="space-y-3">
                  <div className="h-10 bg-yellow-100/50 dark:bg-amber-950/40 rounded-md" />
                  <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-md" />
                  <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
