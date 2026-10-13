"use client";

import React, { useState } from "react";
import { useGetMyRecommendationsQuery } from "@/redux/features/place/placeApi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/shared/safe-image";
import { NoImage } from "@/lib/others/others";
import { getLocalized, formatDate } from "@/lib/utils";
import { RecommendSpotModal } from "@/components/shared/recommend-spot-modal";
import {
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export function RecommendedPlacesList() {
  const { language } = useLanguage();
  const isEs = language === "es";

  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: recData, isLoading } = useGetMyRecommendationsQuery({
    limit: 50,
    status: activeTab === "all" ? "" : activeTab,
  });

  const places = recData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header and action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wide">
            {isEs ? "Lugares Recomendados" : "Recommended Spots"}{" "}
            {!isLoading && `(${places.length})`}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            {isEs
              ? "Lugares turísticos que has recomendado a la comunidad de Roadtripeado."
              : "Tourist spots you have recommended to the Roadtripeado community."}
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl h-11 px-5 text-xs sm:text-sm shadow-md shadow-amber-500/20 shrink-0 cursor-pointer inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>{isEs ? "Recomendar Lugar" : "Recommend Spot"}</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: isEs ? "Todos" : "All" },
          { id: "Pending", label: isEs ? "En Revisión" : "Pending Review" },
          { id: "Published", label: isEs ? "Aprobados" : "Approved" },
          { id: "Rejected", label: isEs ? "No Aprobados" : "Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-amber-400 text-black font-bold shadow-xs"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Places List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="py-14 text-center rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 p-8 space-y-3 bg-gray-50/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Sparkles size={22} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
            {isEs
              ? "Aún no has recomendado ningún lugar"
              : "No spots recommended yet"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
            {isEs
              ? "¿Conoces un rincón increíble que debería estar en Roadtripeado? Recomiéndalo y gana puntos extra."
              : "Know an amazing hidden gem that should be on Roadtripeado? Recommend it to earn extra points and discoverer credit!"}
          </p>
          <div className="pt-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl h-10 px-5 text-xs shadow-xs cursor-pointer"
            >
              {isEs ? "Recomendar mi primer lugar" : "Recommend my first spot"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place: any) => {
            const placeName =
              getLocalized(place.name, language) ||
              place.name?.es ||
              place.name?.en ||
              "Lugar sin nombre";

            const cover =
              place.media && place.media.length > 0 ? place.media[0] : null;

            return (
              <div
                key={place._id}
                className="bg-white dark:bg-[#101728] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3.5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-slate-800">
                    {cover ? (
                      <SafeImage
                        src={cover}
                        alt={placeName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <NoImage />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge */}
                      {place.status === "Published" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 size={11} />
                          <span>
                            {isEs ? "Publicado" : "Published"}
                            {place.pointsAwarded ? ` (+${place.pointsAwarded} pts)` : ""}
                          </span>
                        </span>
                      ) : place.status === "Rejected" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                          <XCircle size={11} />
                          <span>{isEs ? "No Aprobado" : "Rejected"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          <Clock size={11} />
                          <span>{isEs ? "En Revisión" : "Pending Review"}</span>
                        </span>
                      )}

                      {place.category && (
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {getLocalized(place.category.name, language) ||
                            place.category.name}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 truncate pt-0.5">
                      {placeName}
                    </h4>

                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 truncate">
                      <MapPin size={12} className="shrink-0 text-amber-500" />
                      <span className="truncate">
                        {place.address || place.country || "—"}
                      </span>
                    </p>

                    <p className="text-[11px] text-gray-400 dark:text-slate-500 pt-0.5">
                      {isEs ? "Enviado:" : "Submitted:"}{" "}
                      {formatDate(place.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Admin Feedback if rejected */}
                {place.status === "Rejected" && place.adminFeedback && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-2.5 text-xs text-rose-800 dark:text-rose-300 space-y-0.5">
                    <p className="font-bold flex items-center gap-1 text-[11px]">
                      <AlertCircle size={12} />
                      {isEs ? "Nota del equipo:" : "Team feedback:"}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {place.adminFeedback}
                    </p>
                  </div>
                )}

                {/* View Spot Button if published */}
                {place.status === "Published" && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/maps/${place._id}?type=place`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors"
                    >
                      <span>{isEs ? "Ver en el mapa" : "View on map"}</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <RecommendSpotModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
