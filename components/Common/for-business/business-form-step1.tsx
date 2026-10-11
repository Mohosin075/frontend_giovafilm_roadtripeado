"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetMapsQuery } from "@/redux/features/map/mapApi";
import { Clock, Earth, Mail, Plus, X, MapPin } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BusinessFormStep1Props {
  form: UseFormReturn<any>;
}

export function BusinessFormStep1({ form }: BusinessFormStep1Props) {
  const { t } = useLanguage();
  const { data: categoriesRes, isLoading: isLoadingCats } = useGetCategoriesQuery({ limit: 100 });
  const { data: mapsRes, isLoading: isLoadingMaps } = useGetMapsQuery({ limit: 100 });
  const maps = mapsRes?.data || [];

  const allCategories: any[] = categoriesRes?.data || [];
  // Show all active categories in the dropdown list
  const categories = allCategories.filter((cat: any) => cat.status !== "Hidden");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectionType, setSelectionType] = useState<
    "everyday" | "range" | "individual" | "always-open"
  >("everyday");
  
  const [startDay, setStartDay] = useState("Monday");
  const [endDay, setEndDay] = useState("Friday");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const renderDayLabel = (dayStr: string) => {
    if (!dayStr) return "";
    if (dayStr === "Always Open") {
      return t("for_business.step1.always_open");
    }
    if (dayStr === "Mon - Sun") {
      const mon = t("for_business.step1.days.Monday").substring(0, 3);
      const sun = t("for_business.step1.days.Sunday").substring(0, 3);
      return `${mon} - ${sun}`;
    }
    const dayMap: Record<string, string> = {
      Monday: t("for_business.step1.days.Monday"),
      Tuesday: t("for_business.step1.days.Tuesday"),
      Wednesday: t("for_business.step1.days.Wednesday"),
      Thursday: t("for_business.step1.days.Thursday"),
      Friday: t("for_business.step1.days.Friday"),
      Saturday: t("for_business.step1.days.Saturday"),
      Sunday: t("for_business.step1.days.Sunday"),
      Mon: t("for_business.step1.days.Monday").substring(0, 3),
      Tue: t("for_business.step1.days.Tuesday").substring(0, 3),
      Wed: t("for_business.step1.days.Wednesday").substring(0, 3),
      Thu: t("for_business.step1.days.Thursday").substring(0, 3),
      Fri: t("for_business.step1.days.Friday").substring(0, 3),
      Sat: t("for_business.step1.days.Saturday").substring(0, 3),
      Sun: t("for_business.step1.days.Sunday").substring(0, 3),
    };

    let result = dayStr;
    Object.keys(dayMap).forEach((key) => {
      result = result.replace(new RegExp(`\\b${key}\\b`, "g"), dayMap[key]);
    });
    return result;
  };

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAddHours = () => {
    let dayString = "";
    if (selectionType === "always-open") {
      const currentHours = form.getValues("dailyHours") || [];
      const activeHours = currentHours.filter((h: any) => h.isOpen);
      form.setValue("dailyHours", [
        ...activeHours,
        {
          day: "Always Open",
          isOpen: true,
          openTime: "",
          closeTime: "",
          id: Date.now().toString(),
          alwaysOpen: true,
        },
      ]);
      setIsDialogOpen(false);
      return;
    }
    if (selectionType === "everyday") {
      dayString = "Mon - Sun";
    } else if (selectionType === "range") {
      dayString = `${startDay.substring(0, 3)} - ${endDay.substring(0, 3)}`;
    } else {
      if (selectedDays.length === 0) return;
      if (selectedDays.length === 1) {
        dayString = selectedDays[0];
      } else {
        dayString = selectedDays.map((d) => d.substring(0, 3)).join(", ");
      }
    }

    const currentHours = form.getValues("dailyHours") || [];
    const activeHours = currentHours.filter((h: any) => h.isOpen);

    form.setValue("dailyHours", [
      ...activeHours,
      {
        day: dayString,
        isOpen: true,
        openTime: startTime,
        closeTime: endTime,
        id: Date.now().toString(),
      },
    ]);

    setIsDialogOpen(false);
    // reset selection state
    setSelectedDays([]);
    setStartDay("Monday");
    setEndDay("Friday");
  };

  const handleRemoveHour = (index: number) => {
    const currentHours = form.getValues("dailyHours") || [];
    const activeHours = currentHours.filter((h: any) => h.isOpen);
    const updated = [...activeHours];
    updated.splice(index, 1);
    form.setValue("dailyHours", updated);
  };

  return (
    <div className="space-y-6">
      {/* Public Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Earth className="size-4" />

          <h3 className="text-base font-semibold text-gray-500 uppercase tracking-wide">
            {t("for_business.step1.public_info")}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: t("for_business.step1.business_name_req") }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                  {t("for_business.step1.business_name")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("for_business.step1.business_name_placeholder")}
                    {...field}
                    type="text"
                    className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            rules={{ required: t("for_business.step1.category_req") }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold ">
                  {t("for_business.step1.category")} <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={isLoadingCats}
                >
                  <FormControl className="w-full">
                    <SelectTrigger className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                      <SelectValue
                        placeholder={
                          isLoadingCats
                            ? t("for_business.step1.loading_categories")
                            : t("for_business.step1.select_category")
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                    {!isLoadingCats && categories.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t("for_business.step1.no_categories")}
                      </div>
                    ) : (
                      categories.map((cat: any) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessDescription"
          rules={{ required: t("for_business.step1.business_desc_req") }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                {t("for_business.step1.business_desc")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("for_business.step1.business_desc_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact & Links Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-yellow-400" />
          <h3 className="text-base font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {t("for_business.step1.contact_links")}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            rules={{ 
              required: t("for_business.step1.phone_req"),
              pattern: {
                value: /^[+]?[0-9\s-]{7,15}$/,
                message: t("for_business.step1.phone_invalid"),
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                  {t("for_business.step1.phone")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("for_business.step1.phone_placeholder")}
                    {...field}
                    type="tel"
                    className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            rules={{
              pattern: {
                value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[a-zA-Z0-9-._~:?#[\]@!$&'()*+,;=]*)?$/,
                message: t("for_business.step1.website_invalid"),
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                  {t("for_business.step1.website")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("for_business.step1.website_placeholder")}
                    {...field}
                    type="url"
                    className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                {t("for_business.step1.instagram")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("for_business.step1.instagram_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-yellow-400" />
          <h3 className="text-base font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {t("for_business.step1.location_title")}
          </h3>
        </div>

        <FormField
          control={form.control}
          name="streetAddress"
          rules={{ required: t("for_business.step1.street_req") }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                {t("for_business.step1.street")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("for_business.step1.street_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            rules={{ required: t("for_business.step1.city_req") }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                  {t("for_business.step1.city")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("for_business.step1.city_placeholder")}
                    {...field}
                    className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            rules={{ required: t("for_business.step1.country_map_req") }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-900 dark:text-slate-100 font-semibold">
                  {t("for_business.step1.country_map")} <span className="text-red-500">*</span>
                </FormLabel>
                <p className="text-xs text-gray-500 dark:text-slate-400 -mt-1">
                  {t("for_business.step1.country_map_note")}
                </p>
                <Select
                  onValueChange={(value) => {
                    const previous = field.value;
                    field.onChange(value);
                    if (previous && previous !== value) {
                      form.setValue("mapLocation", null);
                    }
                  }}
                  value={field.value || ""}
                  disabled={isLoadingMaps}
                >
                  <FormControl className="w-full">
                    <SelectTrigger className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                      <SelectValue
                        placeholder={
                          isLoadingMaps
                            ? t("for_business.step1.loading_maps")
                            : t("for_business.step1.select_country_map")
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                    {!isLoadingMaps && maps.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t("for_business.step1.no_maps")}
                      </div>
                    ) : (
                      maps.map((map: any) => (
                        <SelectItem key={map._id} value={map.name}>
                          {map.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Hours Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-semibold text-gray-500 uppercase tracking-wide">
              {t("for_business.step1.hours_title")}
            </h3>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="text-base font-semibold text-yellow-600 hover:text-yellow-700 flex items-center gap-1">
                <Plus size={14} />
                {t("for_business.step1.add_custom_hours")}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-slate-100">{t("for_business.step1.add_business_hours")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                  <button
                    type="button"
                    className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${selectionType === "everyday" ? "border-yellow-400 text-yellow-600 dark:text-yellow-400" : "border-transparent text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"}`}
                    onClick={() => setSelectionType("everyday")}
                  >
                    {t("for_business.step1.everyday")}
                  </button>
                  <button
                    type="button"
                    className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${selectionType === "range" ? "border-yellow-400 text-yellow-600 dark:text-yellow-400" : "border-transparent text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"}`}
                    onClick={() => setSelectionType("range")}
                  >
                    {t("for_business.step1.date_range")}
                  </button>
                  <button
                    type="button"
                    className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${selectionType === "individual" ? "border-yellow-400 text-yellow-600 dark:text-yellow-400" : "border-transparent text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"}`}
                    onClick={() => setSelectionType("individual")}
                  >
                    {t("for_business.step1.individual_days")}
                  </button>
                  <button
                    type="button"
                    className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${selectionType === "always-open" ? "border-green-500 text-green-600 dark:text-green-400" : "border-transparent text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"}`}
                    onClick={() => setSelectionType("always-open")}
                  >
                    {t("for_business.step1.always_open")}
                  </button>
                </div>

                {selectionType === "everyday" && (
                  <div className="py-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      {t("for_business.step1.everyday_note")}
                    </p>
                  </div>
                )}

                {selectionType === "range" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">
                        {t("for_business.step1.start_day")}
                      </Label>
                      <Select value={startDay} onValueChange={setStartDay}>
                        <SelectTrigger className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {t(`for_business.step1.days.${d}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">
                        {t("for_business.step1.end_day")}
                      </Label>
                      <Select value={endDay} onValueChange={setEndDay}>
                        <SelectTrigger className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100">
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {t(`for_business.step1.days.${d}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectionType === "always-open" && (
                  <div className="py-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-3xl">🕐</span>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      {t("for_business.step1.always_open_msg")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      {t("for_business.step1.always_open_submsg")}
                    </p>
                  </div>
                )}

                {selectionType === "individual" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">
                      {t("for_business.step1.select_days")}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => {
                        const isSelected = selectedDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setSelectedDays((prev) =>
                                prev.includes(d)
                                ? prev.filter((x) => x !== d)
                                : [...prev, d],
                              );
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${isSelected ? "bg-yellow-100 dark:bg-yellow-950/60 border-yellow-400 text-yellow-800 dark:text-yellow-300" : "bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700"}`}
                          >
                            {t(`for_business.step1.days.${d}`).substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectionType !== "always-open" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">
                        {t("for_business.step1.start_time")}
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700 dark:text-slate-300">
                        {t("for_business.step1.end_time")}
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 font-bold text-gray-500 dark:text-slate-300 dark:bg-slate-900/60 dark:border-slate-800 hover:text-gray-700 dark:hover:text-slate-100 rounded-xl h-11"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t("for_business.step1.cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl h-11 tracking-wider shadow-lg shadow-yellow-100/50 dark:shadow-none transition-all"
                    onClick={handleAddHours}
                  >
                    {t("for_business.step1.add")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedule Summary Display */}
        {form.watch("dailyHours")?.filter((h: any) => h.isOpen)?.length > 0 && (
          <div className="pt-2 pb-4">
            <div className="flex flex-col gap-4 w-full md:w-3/4 lg:w-2/3">
              {form
                .watch("dailyHours")
                .filter((h: any) => h.isOpen)
                .map((dayHour: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4"
                  >
                    <span className="text-sm md:text-base font-bold text-gray-800 min-w-[100px]">
                      {renderDayLabel(dayHour.day)}
                    </span>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {dayHour.alwaysOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                          🕐 {t("for_business.step1.always_open")}
                        </span>
                      ) : (
                        <>
                          <div className="relative flex-1 md:w-32">
                            <Input
                              readOnly
                              value={dayHour.openTime}
                              className="bg-gray-50/50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 font-medium pr-10 rounded-xl focus-visible:ring-0"
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>

                          <div className="relative flex-1 md:w-32">
                            <Input
                              readOnly
                              value={dayHour.closeTime}
                              className="bg-gray-50/50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 font-medium pr-10 rounded-xl focus-visible:ring-0"
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveHour(idx)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatTime = (time: string) => {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}${minute === "00" ? "" : ":" + minute}${ampm}`;
};
