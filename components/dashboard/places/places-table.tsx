"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeletePlaceMutation,
  useGetPlacesQuery,
  useUpdatePlaceMutation,
} from "@/redux/features/place/placeApi";
import { Edit, Eye, EyeOff, FileText, MessageSquare, Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { appAlert } from "@/lib/app-alert";
import { ReviewModal } from "../../Common/maps/review-modal";
import { UpdatePlaceModal } from "./UpdatePlaceModal";
import { ViewPlaceModal } from "./view-place-modal";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import { editorCanAccessMap } from "@/lib/editor-access";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetAvailableCountriesQuery } from "@/redux/features/map/mapApi";

const getSafeString = (val: any, lang: string = "es"): string => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[lang] || val.es || val.en || Object.values(val)[0] || "";
  }
  return String(val);
};

interface Place {
  _id: string;
  name: string;
  category: {
    name: string;
  } | null;
  map: {
    _id: string;
    name: string;
  } | null;
  status: string;
  rating: number;
  totalReview: number;
  address: string;
}

export function PlacesTable() {
  const { t, language } = useLanguage();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const { data: user } = useGetProfileQuery({});
  const { data: categoriesResponse } = useGetCategoriesQuery({ limit: 100 });
  const { data: countries } = useGetAvailableCountriesQuery(undefined);

  const { data: response, isLoading } = useGetPlacesQuery({
    page,
    limit,
    searchTerm: debouncedSearch,
    status,
    category,
    country,
    type,
  });
  const [deletePlace] = useDeletePlaceMutation();
  const [updatePlace] = useUpdatePlaceMutation();

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    try {
      await updatePlace({ id, data: { status: nextStatus } }).unwrap();
      toast.success(
        nextStatus === "Draft"
          ? (t("places_admin.set_to_draft") || "Place set to Draft")
          : (t("places_admin.published_successfully") || "Place published successfully")
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to update place status"
      );
    }
  };

  const places: Place[] = response?.data || [];
  const meta = response?.meta;

  const displayedPlaces =
    user?.role === "map_editor"
      ? places.filter((place: any) =>
          editorCanAccessMap(
            user,
            place.map?._id || place.map,
            place.country || place.map?.country,
          ),
        )
      : places;

  const handleDelete = async (id: string) => {
    appAlert.fire({
      title: t("common.are_you_sure"),
      text: t("places_admin.delete_confirm") || "You won't be able to revert this place deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: t("common.yes_delete_it") || "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePlace(id).unwrap();
          toast.success(t("places_admin.deleted_successfully") || "Place deleted successfully");
        } catch (error: any) {
          toast.error(
            error?.data?.message || error?.message || "Failed to delete place",
          );
          console.error("Failed to delete place:", error);
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    return status === "Active" || status === "Published"
      ? "bg-green-100 text-green-800 dark:bg-emerald-500/10 dark:text-emerald-400"
      : "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300";
  };

  const tableHeaders = [
    t("places_admin.place_name"),
    t("common.categories"),
    t("nav.map"),
    t("promos_admin.status"),
    t("place.reviews"),
    t("rewards_admin.actions"),
  ];

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-transparent">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
            <Input
              placeholder={t("search.search_places")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 w-full dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white dark:bg-slate-900 dark:text-slate-200 min-w-[140px]"
          >
            <option value="">{t("places_admin.all_status")}</option>
            <option value="Published">{t("places_admin.published")}</option>
            <option value="Draft">{t("places_admin.draft")}</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white dark:bg-slate-900 dark:text-slate-200 min-w-[140px]"
          >
            <option value="">{t("places_admin.all_categories")}</option>
            {categoriesResponse?.data?.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {getSafeString(cat.name, language)}
              </option>
            ))}
          </select>

          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white dark:bg-slate-900 dark:text-slate-200 min-w-[140px]"
          >
            <option value="">{t("places_admin.all_countries")}</option>
            {countries?.map((c: any) => {
              const label = getSafeString(c, language);
              return (
                <option key={label} value={label}>
                  {label}
                </option>
              );
            })}
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white dark:bg-slate-900 dark:text-slate-200 min-w-[140px]"
          >
            <option value="">{t("places_admin.all_types")}</option>
            <option value="Regular">{t("places_admin.regular_admin")}</option>
            <option value="Business">{t("places_admin.business_user")}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800">
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                  {t("places_admin.loading_places")}
                </td>
              </tr>
            ) : displayedPlaces.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                  {t("places_admin.no_places")}
                </td>
              </tr>
            ) : (
              displayedPlaces.map((place, index) => (
                <tr
                  key={place._id}
                  className={`${index !== displayedPlaces.length - 1
                      ? "border-b border-gray-100 dark:border-slate-800/60"
                      : ""
                    } hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                    <div className="flex flex-col">
                      <span>{getSafeString(place.name, language)}</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[200px]">
                        {place.address}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {getSafeString(place.category?.name, language) || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {getSafeString(place.map?.name, language) || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        place.status,
                      )}`}
                    >
                      {place.status === "Published"
                        ? (t("places_admin.published") || "Published")
                        : place.status === "Draft"
                        ? (t("places_admin.draft") || "Draft")
                        : place.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <span>⭐ {place.rating || 0}</span>
                      <span className="text-gray-400 dark:text-slate-500">
                        ({place.totalReview || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedPlaceId(place._id);
                          setIsUpdateModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        aria-label="Edit place"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(place._id, place.status)}
                        className={`${
                          place.status === "Published"
                            ? "text-green-500 hover:text-green-700"
                            : "text-amber-500 hover:text-amber-700"
                        } transition-colors`}
                        aria-label={
                          place.status === "Published"
                            ? "Set to draft"
                            : "Publish place"
                        }
                      >
                        {place.status === "Published" ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlaceId(place._id);
                          setIsViewModalOpen(true);
                        }}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label="View place details"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlaceId(place._id);
                          setIsReviewModalOpen(true);
                        }}
                        className="text-yellow-500 hover:text-yellow-700 transition-colors flex items-center gap-2 border dark:border-slate-700 dark:hover:bg-slate-800 rounded-full px-2"
                        aria-label={t("place.reviews")}
                      >
                        {t("place.reviews")}
                        <MessageSquare size={18} />
                      </button>

                      {user?.role !== "map_editor" && (
                        <button
                          onClick={() => handleDelete(place._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Delete place"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && meta && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-transparent mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-slate-400">{t("dashboard.table.rows_per_page")}</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 dark:border-slate-800 rounded p-1 text-sm bg-white dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-slate-400 border-none">
              {t("common.page")} {meta.page} / {meta.totalPage || 1}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (meta.totalPage || 1)}
                className="dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ViewPlaceModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        placeId={selectedPlaceId}
      />

      <UpdatePlaceModal
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        placeId={selectedPlaceId}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        placeId={selectedPlaceId || undefined}
      />
    </div>
  );
}
