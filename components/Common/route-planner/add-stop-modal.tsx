"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Plus,
  MapPin,
  Check,
  Filter,
  Layers,
  Map as MapIcon,
  List,
  Sparkles,
  Compass,
  RotateCcw,
} from "lucide-react";
import { useGetPlacesQuery } from "@/redux/features/place/placeApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetMapsQuery } from "@/redux/features/map/mapApi";
import { SafeImage } from "@/components/shared/safe-image";
import { NoImage } from "@/lib/others/others";
import { getUsableMediaUrl, getLocalized } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: any) => void;
  selectedPlaceIds?: string[];
}

// Helper to provide meaningful visual icons/emojis for Puerto Rico travel categories
function getCategoryIcon(name: string): string {
  const lower = (name || "").toLowerCase();
  if (lower.includes("playa") || lower.includes("beach")) return "🏖️";
  if (
    lower.includes("cascada") ||
    lower.includes("río") ||
    lower.includes("waterfall") ||
    lower.includes("river") ||
    lower.includes("charco")
  )
    return "🌊";
  if (lower.includes("cueva") || lower.includes("cave") || lower.includes("caverna"))
    return "⛰️";
  if (
    lower.includes("mirador") ||
    lower.includes("lookout") ||
    lower.includes("view") ||
    lower.includes("vista")
  )
    return "🌄";
  if (
    lower.includes("restauran") ||
    lower.includes("comida") ||
    lower.includes("food") ||
    lower.includes("gastronom") ||
    lower.includes("chinchorreo")
  )
    return "🍽️";
  if (
    lower.includes("histór") ||
    lower.includes("fort") ||
    lower.includes("castillo") ||
    lower.includes("museo") ||
    lower.includes("museum") ||
    lower.includes("monument")
  )
    return "🏛️";
  if (
    lower.includes("bosque") ||
    lower.includes("forest") ||
    lower.includes("naturaleza") ||
    lower.includes("reserva") ||
    lower.includes("nature")
  )
    return "🌿";
  if (
    lower.includes("aventura") ||
    lower.includes("sender") ||
    lower.includes("hike") ||
    lower.includes("trail") ||
    lower.includes("zipline")
  )
    return "🥾";
  if (lower.includes("isla") || lower.includes("cayo") || lower.includes("island"))
    return "🏝️";
  return "📍";
}

export default function AddStopModal({
  isOpen,
  onClose,
  onSelectPlace,
  selectedPlaceIds = [],
}: AddStopModalProps) {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMapId, setSelectedMapId] = useState<string>("all");
  const [onlyUnadded, setOnlyUnadded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activePinPlace, setActivePinPlace] = useState<any | null>(null);

  // Queries
  const { data: placesRes, isLoading } = useGetPlacesQuery(
    {
      page: 1,
      limit: 150,
      searchTerm,
      category: selectedCategory !== "all" ? selectedCategory : "",
      map: selectedMapId !== "all" ? selectedMapId : "",
      status: "Published",
    },
    { skip: !isOpen }
  );

  const { data: categoriesRes } = useGetCategoriesQuery(
    { limit: 50 },
    { skip: !isOpen }
  );

  const { data: mapsRes } = useGetMapsQuery(
    { limit: 50 },
    { skip: !isOpen }
  );

  const rawPlaces = placesRes?.data?.data || placesRes?.data || [];
  const categories = categoriesRes?.data?.data || categoriesRes?.data || [];
  const mapsList = mapsRes?.data?.data || mapsRes?.data || [];

  // Filter places based on unadded toggle if enabled
  const places = useMemo(() => {
    if (!onlyUnadded) return rawPlaces;
    return rawPlaces.filter(
      (p: any) => !selectedPlaceIds.includes(p._id || p.id)
    );
  }, [rawPlaces, onlyUnadded, selectedPlaceIds]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedMapId !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (onlyUnadded ? 1 : 0);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedMapId("all");
    setOnlyUnadded(false);
  };

  if (!isOpen) return null;

  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "2b83d15fbb74673e997cfde8";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#131b2e] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col h-[94vh] sm:h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0 bg-white/90 dark:bg-[#131b2e]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-500 dark:text-amber-400 flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-950 dark:text-white tracking-tight line-clamp-1">
                {t("route_planner.add_stop_title") || "Añadir parada a tu ruta"}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
                {places.length}{" "}
                {places.length === 1
                  ? t("route_planner.places_available_one") || "lugar disponible"
                  : t("route_planner.places_available_many") || "lugares disponibles"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (List / Map) */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-[#131b2e] text-gray-950 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("route_planner.tab_list") || "Lista"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "map"
                    ? "bg-white dark:bg-[#131b2e] text-gray-950 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("route_planner.tab_map") || "Mapa"}</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Section */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 flex-shrink-0 space-y-2">
          {/* Row 1: Search & Region Dropdown */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  t("route_planner.search_placeholder") ||
                  "Buscar playas, cuevas, miradores..."
                }
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] focus:outline-none text-xs sm:text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 shadow-sm transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Region / Map Selector */}
            {mapsList.length > 0 && (
              <div className="sm:w-56">
                <select
                  value={selectedMapId}
                  onChange={(e) => setSelectedMapId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200 focus:border-[#FFC107] focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="all">
                    {t("route_planner.all_regions_maps") || "Todas las regiones / mapas"}
                  </option>
                  {mapsList.map((m: any) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {getLocalized(m.name, language)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 2: Categories Carousel & Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {/* "All" Category Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === "all"
                  ? "bg-[#FFC107] text-gray-950 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#FFC107]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t("common.all") || "Todos"}</span>
            </button>

            {/* Category Pills with Icons */}
            {categories.map((cat: any) => {
              const catId = cat._id || cat.id;
              const catName = getLocalized(cat.name, language);
              const isActive = selectedCategory === catId;
              const emoji = getCategoryIcon(catName);

              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setSelectedCategory(catId)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-[#FFC107] text-gray-950 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#FFC107]"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{catName}</span>
                </button>
              );
            })}

            {/* Toggle: Only show spots not in route */}
            <button
              type="button"
              onClick={() => setOnlyUnadded(!onlyUnadded)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                onlyUnadded
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-[#FFC107]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t("route_planner.filter_available_only") || "Solo no añadidos"}</span>
            </button>

            {/* Reset Filters button if active */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 rounded-full font-bold whitespace-nowrap text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t("route_planner.clear_filters_btn") || "Limpiar"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                {t("common.loading") || "Cargando lugares..."}
              </p>
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW */
            <div className="h-full overflow-y-auto px-4 sm:px-6 py-4">
              {places.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-slate-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="text-base font-bold text-gray-700 dark:text-slate-300">
                    {t("route_planner.no_places_found") ||
                      "No se encontraron lugares"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    {t("route_planner.try_different_filters") ||
                      "Intenta cambiar los filtros o buscar con otro término."}
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-xs font-bold text-gray-800 dark:text-slate-200"
                    >
                      {t("route_planner.clear_filters_btn") || "Limpiar filtros"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
                  {places.map((place: any) => {
                    const placeId = place._id || place.id;
                    const isSelected = selectedPlaceIds.includes(placeId);
                    const cover = getUsableMediaUrl(place.media);
                    const placeName = getLocalized(place.name, language);
                    const catName = getLocalized(place.category?.name, language);

                    return (
                      <div
                        key={placeId}
                        onClick={() => !isSelected && onSelectPlace(place)}
                        className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/5 dark:bg-amber-500/10 border-[#FFC107]/40 ring-1 ring-[#FFC107]/30"
                            : "bg-white dark:bg-[#151e33] border-gray-100 dark:border-slate-800 hover:border-[#FFC107] hover:shadow-md"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-800">
                          {cover ? (
                            <SafeImage
                              src={cover}
                              alt={placeName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <NoImage />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-1">
                          {catName && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
                              {catName}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-[#FFC107] transition-colors">
                            {placeName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">
                              {place.address || "Puerto Rico"}
                            </span>
                          </p>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSelected) onSelectPlace(place);
                          }}
                          title={
                            isSelected
                              ? t("route_planner.in_your_route") || "En tu ruta"
                              : t("route_planner.add_place_btn") || "Añadir"
                          }
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "bg-[#FFC107] text-gray-950 font-bold shadow-md"
                              : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 group-hover:bg-[#FFC107] group-hover:text-gray-950"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* INTERACTIVE MAP VIEW INSIDE MODAL */
            <div className="h-full w-full relative">
              <Map
                colorScheme={isDark ? "DARK" : "LIGHT"}
                defaultCenter={{ lat: 18.2208, lng: -66.5901 }}
                defaultZoom={10}
                minZoom={6}
                maxZoom={18}
                renderingType="RASTER"
                mapId={mapId}
                disableDefaultUI={false}
                gestureHandling="greedy"
                className="w-full h-full"
              >
                {places.map((place: any) => {
                  const placeId = place._id || place.id;
                  const coords =
                    place?.location?.coordinates ||
                    place?.location?.mapLocation?.coordinates;
                  const lat = Number(coords?.[1]);
                  const lng = Number(coords?.[0]);
                  if (!lat || !lng) return null;

                  const isSelected = selectedPlaceIds.includes(placeId);
                  const isCurrentActive = activePinPlace && (activePinPlace._id || activePinPlace.id) === placeId;

                  return (
                    <AdvancedMarker
                      key={placeId}
                      position={{ lat, lng }}
                      onClick={() => setActivePinPlace(place)}
                    >
                      <div
                        className={`relative flex items-center justify-center cursor-pointer transition-transform transform ${
                          isCurrentActive ? "scale-125 z-30" : "hover:scale-110 z-10"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                            isSelected
                              ? "bg-[#FFC107] text-gray-950 border-white ring-2 ring-[#FFC107]/50"
                              : "bg-white dark:bg-[#131b2e] text-amber-500 border-amber-400"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </Map>

              {/* Floating Active Place Preview Card on Map */}
              {activePinPlace && (
                <div className="absolute bottom-4 left-4 right-4 z-20 max-w-sm mx-auto animate-in slide-in-from-bottom-2 duration-200">
                  <div className="bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-800">
                      {getUsableMediaUrl(activePinPlace.media) ? (
                        <SafeImage
                          src={getUsableMediaUrl(activePinPlace.media)!}
                          alt={getLocalized(activePinPlace.name, language)}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <NoImage />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 truncate">
                          {getLocalized(activePinPlace.category?.name, language) || "Lugar"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActivePinPlace(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
                        {getLocalized(activePinPlace.name, language)}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {activePinPlace.address || "Puerto Rico"}
                      </p>

                      <div className="mt-2">
                        {selectedPlaceIds.includes(activePinPlace._id || activePinPlace.id) ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{t("route_planner.in_your_route") || "En tu ruta"}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPlace(activePinPlace);
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-[#FFC107] hover:bg-[#e6ad06] text-gray-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{t("route_planner.add_place_btn") || "Añadir a la ruta"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
