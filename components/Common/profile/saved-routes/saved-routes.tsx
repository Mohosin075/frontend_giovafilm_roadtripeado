"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useGetMyRoutePlansQuery,
  useDeleteRoutePlanMutation,
} from "@/redux/features/route-plan/routePlanApi";
import {
  Compass,
  Navigation,
  Trash2,
  Calendar,
  MapPin,
  Search,
  Plus,
  ArrowRight,
} from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { getUsableMediaUrl } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useLoginRequired } from "@/components/shared/login-required-modal";
import { useAppSelector } from "@/redux/hook";
import { selectAccessToken } from "@/redux/features/auth/authSlice";

export default function SavedRoutes() {
  const { t, language } = useLanguage();
  const { openLoginRequired } = useLoginRequired();
  const accessToken = useAppSelector(selectAccessToken);
  const [search, setSearch] = useState("");

  const { data: myRoutesRes, isLoading } = useGetMyRoutePlansQuery(undefined, {
    skip: !accessToken,
  });
  const [deleteRoutePlan] = useDeleteRoutePlanMutation();

  const allRoutes: any[] = useMemo(() => {
    return myRoutesRes?.data?.data || myRoutesRes?.data || [];
  }, [myRoutesRes]);

  const filtered = useMemo(() => {
    return allRoutes.filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (r.name || "").toLowerCase().includes(q);
    });
  }, [allRoutes, search]);

  const handleDelete = async (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        t("route_planner.confirm_delete_route") ||
          "¿Estás seguro de que deseas eliminar esta ruta?"
      )
    ) {
      try {
        await deleteRoutePlan(routeId).unwrap();
        toast.success(t("route_planner.route_deleted") || "Ruta eliminada con éxito");
      } catch (err: any) {
        toast.error(err?.data?.message || "Error al eliminar la ruta");
      }
    }
  };

  const handleOpenGoogleMaps = (e: React.MouseEvent, stops: any[]) => {
    e.stopPropagation();
    const validStops = stops
      .filter((s: any) => s.place || s.business)
      .map((s: any) => {
        const loc = s.place || s.business;
        return (
          loc?.location?.coordinates ||
          loc?.location?.mapLocation?.coordinates || [0, 0]
        );
      })
      .filter((c: any) => c[1] && c[0]);

    if (validStops.length === 0) {
      toast.info(t("route_planner.no_coordinates") || "No hay coordenadas disponibles para esta ruta");
      return;
    }

    if (validStops.length === 1) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${validStops[0][1]},${validStops[0][0]}`,
        "_blank"
      );
      return;
    }

    const origin = `${validStops[0][1]},${validStops[0][0]}`;
    const destination = `${validStops[validStops.length - 1][1]},${
      validStops[validStops.length - 1][0]
    }`;
    const waypoints = validStops
      .slice(1, -1)
      .map((c: any) => `${c[1]},${c[0]}`)
      .join("|");

    const fullUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""
    }`;
    window.open(fullUrl, "_blank");
  };

  if (!accessToken) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20 font-public-sans text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-[#131b2e] rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
          <Compass className="w-14 h-14 mx-auto mb-4 text-[#FFC107] opacity-80" />
          <h2 className="text-xl font-black text-gray-950 dark:text-white mb-2">
            {t("route_planner.my_saved_routes") || "Mis Rutas Guardadas"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
            {t("route_planner.login_to_view_routes") ||
              "Inicia sesión para ver y gestionar todas tus rutas personalizadas de roadtrip."}
          </p>
          <button
            type="button"
            onClick={() => openLoginRequired("/profile/saved-routes", "Mis Rutas Guardadas")}
            className="w-full py-3.5 rounded-2xl bg-[#FFC107] hover:bg-[#e6ad06] text-gray-950 font-bold text-sm shadow-md active:scale-98 transition-all"
          >
            {t("nav.login") || "Iniciar Sesión"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 font-public-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-slate-100 flex items-center gap-3">
            <span>{t("route_planner.my_saved_routes") || "Mis Rutas Guardadas"}</span>
            <span className="text-sm font-extrabold bg-amber-400/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
              {allRoutes.length}
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t("route_planner.profile_subtitle") ||
              "Planes de roadtrip y rutas personalizadas creadas por ti"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-1.5 bg-white dark:bg-[#131b2e] flex-1 sm:flex-none">
            <Search className="text-gray-400 dark:text-slate-500 w-4 h-4 mr-2" />
            <Input
              placeholder={t("route_planner.search_saved_routes") || "Buscar mis rutas..."}
              className="border-none focus-visible:ring-0 w-full sm:w-52 bg-transparent text-gray-900 dark:text-slate-100 placeholder:text-gray-400 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Link
            href="/route-planner"
            className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#e6ad06] text-gray-950 font-bold text-xs shadow-md flex items-center gap-1.5 flex-shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("route_planner.new_route") || "Nueva ruta"}</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
            {t("common.loading") || "Cargando tus rutas..."}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-[#131b2e] rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 p-8">
          <Compass className="w-14 h-14 mx-auto mb-3 text-amber-500 opacity-60" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            {search
              ? "No se encontraron rutas con ese nombre"
              : t("route_planner.no_saved_routes") || "Aún no tienes rutas guardadas"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {t("route_planner.saved_routes_helper") ||
              "Organiza tus paradas favoritas de Puerto Rico en el planificador y guárdalas para encontrarlas aquí."}
          </p>
          <Link
            href="/route-planner"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#FFC107] hover:bg-[#e6ad06] text-gray-950 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t("route_planner.create_first_route") || "Crear mi primer Roadtrip"}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((route: any) => {
            const routeId = route._id || route.id;
            const stopCount = Array.isArray(route.stops) ? route.stops.length : 0;
            const formattedDate = route.updatedAt
              ? new Date(route.updatedAt).toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            // First 3 thumbnails
            const previewThumbnails = Array.isArray(route.stops)
              ? route.stops
                  .slice(0, 3)
                  .map((s: any) => {
                    const loc = s.place || s.business;
                    return getUsableMediaUrl(loc?.media?.photos || loc?.media);
                  })
                  .filter(Boolean)
              : [];

            return (
              <div
                key={routeId}
                className="bg-white dark:bg-[#131b2e] rounded-3xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:border-amber-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnails collage header */}
                  <div className="flex -space-x-3 overflow-hidden mb-4">
                    {previewThumbnails.length > 0 ? (
                      previewThumbnails.map((img: string, i: number) => (
                        <div
                          key={i}
                          className="relative w-14 h-14 rounded-2xl border-2 border-white dark:border-slate-800 overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-sm"
                        >
                          <SafeImage src={img} alt="" fill className="object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                        <MapPin className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-gray-900 dark:text-slate-100 line-clamp-1 mb-1">
                    {route.name || "Ruta sin nombre"}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-5">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {stopCount}{" "}
                      {stopCount === 1
                        ? (t("route_planner.stop_singular") || "parada")
                        : (t("route_planner.stop_plural") || "paradas")}
                    </span>
                    {formattedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        {formattedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title={t("route_planner.navigate_tooltip") || "Navegar ruta en Google Maps"}
                      onClick={(e) => handleOpenGoogleMaps(e, route.stops)}
                      className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-[#FFC107] text-gray-700 dark:text-slate-300 hover:text-gray-950 transition-colors"
                    >
                      <Navigation className="w-4 h-4 -rotate-45" />
                    </button>

                    <button
                      type="button"
                      title={t("route_planner.delete_tooltip") || "Eliminar ruta"}
                      onClick={(e) => handleDelete(e, routeId)}
                      className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/route-planner?routeId=${routeId}`}
                    className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#e6ad06] text-gray-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>{t("route_planner.open_in_planner") || "Abrir en Planificador"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
