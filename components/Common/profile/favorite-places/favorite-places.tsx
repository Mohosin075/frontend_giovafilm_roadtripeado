"use client";

import { Input } from "@/components/ui/input";
import { NoImage } from "@/lib/others/others";
import { getImageUrl } from "@/lib/utils";
import {
  useAddToFavouriteMutation,
  useGetFavouritesQuery,
} from "@/redux/features/favourite/favouriteApi";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Map,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useLanguage } from "@/lib/i18n/LanguageContext";

const PAGE_SIZE = 9;

export default function FavoritePlaces() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [page, setPage] = useState(1);

  const TYPE_FILTERS = [
    { label: t("common.all"), value: "all" },
    { label: t("nav.places"), value: "Place", icon: MapPin },
    { label: t("dashboard.sidebar.business"), value: "Business", icon: Building2 },
    { label: t("nav.map"), value: "Map", icon: Map },
  ];

  const { data: favouritesRes, isLoading } = useGetFavouritesQuery();
  const [addToFavourite, { isLoading: isRemoving }] =
    useAddToFavouriteMutation();

  const handleTypeChange = (value: string) => {
    setActiveType(value);
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Remove from favourite (POST acts as toggle on the backend)
  const handleRemove = async (fav: any) => {
    const key =
      fav.type === "Map"
        ? "map"
        : fav.type === "Offer"
          ? "offer"
          : fav.type === "Business"
            ? "business"
            : "place";
    const refId = typeof fav[key] === "string" ? fav[key] : fav[key]?._id;
    if (!refId) return;
    try {
      await addToFavourite({ type: fav.type, [key]: refId }).unwrap();
      toast.success(t("places.removed_from_favorites"));
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove");
    }
  };

  const allFavourites: any[] = favouritesRes?.data || [];

  // Filter by type and search
  const filtered = useMemo(() => {
    return allFavourites.filter((fav) => {
      const matchesType = activeType === "all" || fav.type === activeType;

      const name =
        fav.map?.name ||
        fav.place?.name ||
        fav.business?.name ||
        fav.name ||
        "";
      const description =
        fav.map?.description ||
        fav.place?.description ||
        fav.business?.description ||
        fav.description ||
        "";
      const matchesSearch =
        search.trim() === "" ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [allFavourites, activeType, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 font-public-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{t("nav.favorite_places")}</h1>

        {/* Search */}
        <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-1 bg-white dark:bg-[#131b2e]">
          <Search className="text-gray-400 dark:text-slate-500 w-4 h-4 mr-2" />
          <Input
            placeholder={t("filters.favorites")}
            className="border-none focus-visible:ring-0 w-52 bg-transparent text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 mb-7 flex-wrap">
        {TYPE_FILTERS.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleTypeChange(value)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeType === value
                ? "bg-yellow-400 border-yellow-400 text-black font-bold"
                : "bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-yellow-400 dark:hover:border-yellow-500"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-slate-400">{t("common.loading")}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && paginated.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-sm">
          {t("filters.favorites")}
        </div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {paginated.map((fav: any) => {
          // Resolve name and description from nested object
          const name =
            fav.map?.name ||
            fav.place?.name ||
            fav.business?.name ||
            fav.name ||
            "Untitled";
          const description =
            fav.map?.description ||
            fav.place?.description ||
            fav.business?.description ||
            fav.description ||
            "No description available.";

          // Resolve image — map: images[], place: media[], business: media.photos[]
          const rawImage = fav.map
            ? fav.map?.images?.[0]
            : fav.business
              ? fav.business?.media?.photos?.[0]
              : fav.place?.media?.[0];
          const imageSrc = rawImage ? getImageUrl(rawImage) : null;

          const href =
            fav.type === "Map"
              ? `/catalog/${fav.map?._id || fav.map}`
              : fav.type === "Business"
                ? `/maps/${fav.business?._id || fav.business}?type=business`
                : fav.type === "Place"
                  ? `/maps/${fav.place?._id || fav.place}`
                  : fav.href || "#";

          return (
            <div
              key={fav._id}
              className="bg-white dark:bg-[#131b2e] rounded-xl overflow-hidden border border-gray-200/80 dark:border-slate-800 hover:shadow-md transition flex flex-col"
            >
              <Link href={href} className="block shrink-0">
                <div className="w-full h-48 overflow-hidden bg-gray-100 dark:bg-slate-900 relative">
                  {imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <NoImage />
                  )}
                  {fav.badge && (
                    <span
                      className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full z-10 ${fav.badgeColor}`}
                    >
                      {fav.badge}
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-lg line-clamp-1 text-gray-900 dark:text-slate-100">{name}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 line-clamp-2 flex-1">
                  {description}
                </p>

                <button
                  onClick={() => handleRemove(fav)}
                  disabled={isRemoving}
                  className="text-xs tracking-widest text-gray-400 dark:text-slate-500 mt-3 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 text-left font-bold"
                >
                  REMOVE
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                page === p
                  ? "bg-yellow-400 border-yellow-400 text-black font-bold"
                  : "bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-yellow-400 dark:hover:border-yellow-500"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
