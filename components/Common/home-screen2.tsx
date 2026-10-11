"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const MAP_CARDS = [
  {
    id: 1,
    title: "Rome Historic Center Walking Tour",
    subtitle: "Professional Guide",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    title: "Rome Historic Center Walking Tour",
    subtitle: "Professional Guide",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1772289935663-80aa987be656?q=80&w=1170",
  },
  {
    id: 3,
    title: "Rome Historic Center Walking Tour",
    subtitle: "Professional Guide",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1693707994429-95caaceab2a4?q=80&w=1074",
  },
  {
    id: 4,
    title: "Rome Historic Center Walking Tour",
    subtitle: "Professional Guide",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1772289935663-80aa987be656?q=80&w=1170",
  },
  {
    id: 5,
    title: "Rome Historic Center Walking Tour",
    subtitle: "Professional Guide",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 6,
    title: "Rome Historic Center Walking Tour",
    subtitle: "Professional Guide",
    price: "$9.99",
    image:
      "https://images.unsplash.com/photo-1693707994429-95caaceab2a4?q=80&w=1074",
  },
];

export const HomeScreen = () => {
  const { t } = useLanguage();
  // const { largeView } = useView();

  return (
    <div className={`flex flex-col min-h-screen`}>
      {/* Content */}
      <main className="px-5 flex-1 pb-24">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-5 mt-2">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-slate-100">Featured Maps</h2>
          <button className="text-[#FFC107] text-sm font-bold">{t("common.view_all")}</button>
        </div>

        {/* Grid */}
        <div className={`grid  grid-cols-4 gap-4`}>
          {MAP_CARDS.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.id * 0.05 }}
              //   onClick={() => onNavigate("details")}
              className="bg-white dark:bg-[#131b2e] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-slate-800 flex flex-col cursor-pointer pb-2"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-4 h-4 text-[#FFC107]" />
                </button>
              </div>

              {/* Card Details */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-[13px] font-bold text-[#1A1A1A] dark:text-slate-100 leading-tight mb-1 line-clamp-2">
                  {card.title}
                </h3>
                <p className="text-[11px] text-[#9E9E9E] dark:text-slate-400 mb-2">
                  {card.subtitle}
                </p>
                <div className="mt-auto">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-slate-100 block mb-2">
                    {card.price}
                  </span>
                  <Link
                    href={`/details/${card.id}`}
                    className="px-[54px] py-2.5 bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold text-[12px] rounded-full transition-colors shadow-sm block text-center"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
