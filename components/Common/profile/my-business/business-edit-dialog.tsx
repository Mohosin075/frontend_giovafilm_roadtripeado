"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getImageUrl } from "@/lib/utils";
import { CategoryIcon } from "@/components/shared/categories/category-icon";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useUpdateBusinessMutation } from "@/redux/features/business/businessApi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Building2,
  Globe,
  Instagram,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: any;
};

export function BusinessEditDialog({ open, onOpenChange, business }: Props) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const { data: categoriesRes } = useGetCategoriesQuery({ limit: 100 });
  const allCategories: any[] = categoriesRes?.data || [];
  const categories = allCategories.filter((cat: any) => cat.status !== "Hidden");

  const [updateBusiness, { isLoading }] = useUpdateBusinessMutation();

  useEffect(() => {
    if (!open || !business) return;

    setName(
      typeof business.name === "object"
        ? business.name.en || business.name.es || ""
        : business.name || ""
    );
    setCategoryId(
      typeof business.category === "object"
        ? business.category?._id || ""
        : business.category || ""
    );
    setDescription(
      typeof business.description === "object"
        ? business.description.en || business.description.es || ""
        : business.description || ""
    );
    setPhone(business.contact?.phone || "");
    setWebsite(business.contact?.website || "");
    setInstagram(business.contact?.instagram || "");
    setAddress(business.location?.address || "");
    setCity(business.location?.city || "");
    setCountry(business.location?.country || "");

    const currentPhotos = Array.isArray(business.media?.photos)
      ? business.media.photos
      : [];
    setExistingPhotos(currentPhotos);
    setNewPhotoFiles([]);
    setNewPhotoPreviews([]);
  }, [open, business]);

  const handleFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setNewPhotoFiles((prev) => [...prev, ...validFiles]);
      setNewPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("business.name_required") || "Business name is required");
      return;
    }

    try {
      let formattedWebsite = website.trim();
      if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = `https://${formattedWebsite}`;
      }

      const coords =
        business?.location?.mapLocation?.coordinates ||
        business?.location?.coordinates;
      const locationPayload: any = {
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
      };
      if (Array.isArray(coords) && coords.length === 2) {
        locationPayload.mapLocation = {
          type: "Point",
          coordinates: coords.map(Number),
        };
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        contact: {
          phone: phone.trim(),
          website: formattedWebsite,
          instagram: instagram.trim(),
        },
        location: locationPayload,
        media: {
          ...(business?.media?.menu ? { menu: business.media.menu } : {}),
          photos: existingPhotos,
        },
      };

      if (categoryId) {
        payload.category = categoryId;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      newPhotoFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await updateBusiness({
        id: business._id,
        data: formData,
      }).unwrap();

      if (res?.success === true || res?.data) {
        toast.success(
          t("business.updated_successfully") ||
            "Business information updated successfully"
        );
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to update business");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update business information"
      );
    }
  };

  const selectedCategory = categories.find((c: any) => c._id === categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 lg:p-10 bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-xs">
              <Building2 size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                {t("business.edit_business") || "Edit Business Information"}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("business.edit_business_subtitle") ||
                  "Update your general business details, contacts, and photos"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Basic Information & Location */}
            <div className="lg:col-span-7 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4 bg-slate-50/80 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t("business.basic_information") || "Basic Information"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                      {t("business.business_name") || "Business Name"} *
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sunny Bistro & Cafe"
                      required
                      className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                      {t("business.category") || "Category"}
                    </Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold">
                        {selectedCategory ? (
                          <div className="flex items-center gap-2 truncate">
                            <CategoryIcon icon={selectedCategory.icon} size={18} color="currentColor" />
                            <span className="truncate">{selectedCategory.name}</span>
                          </div>
                        ) : (
                          <SelectValue placeholder={t("business.select_category") || "Select a category"} />
                        )}
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-64 bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800">
                        {categories.map((cat: any) => (
                          <SelectItem key={cat._id} value={cat._id} className="cursor-pointer">
                            <span className="flex items-center gap-2.5">
                              <CategoryIcon icon={cat.icon} size={18} color="currentColor" />
                              <span className="font-medium">{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                    {t("business.description") || "Description"}
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder={t("business.description_placeholder") || "Tell customers about your business, specialties, ambiance..."}
                    className="rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-medium resize-y leading-relaxed"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4 bg-slate-50/80 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  {t("business.location") || "Location"}
                </h4>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                    {t("business.address") || "Street Address"}
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                      {t("business.city") || "City / Municipality"}
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Sebastian"
                      className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                      {t("business.country") || "Country"}
                    </Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Puerto Rico"
                      className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Details & Photos */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact Details */}
              <div className="space-y-4 bg-slate-50/80 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  {t("business.contact_information") || "Contact Information"}
                </h4>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-primary" />
                    {t("business.phone") || "Phone Number"}
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Globe size={13} className="text-primary" />
                    {t("business.website") || "Website URL"}
                  </Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    type="url"
                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Instagram size={13} className="text-primary" />
                    {t("business.instagram") || "Instagram Handle or Link"}
                  </Label>
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@yourbusiness"
                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4 bg-slate-50/80 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("business.photos") || "Business Photos"}
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {existingPhotos.length + newPhotoFiles.length} photos
                  </span>
                </div>

                {/* Existing and New Photos Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {existingPhotos.map((photo, i) => (
                    <div
                      key={`existing-${i}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800 transition-all hover:scale-[1.03]"
                    >
                      <Image
                        src={getImageUrl(photo)}
                        alt={`Photo ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPhoto(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title={t("business.remove_photo") || "Remove photo"}
                      >
                        <X size={13} />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white backdrop-blur-2xs">
                        {i === 0 ? (t("business.cover_photo") || "Cover") : `#${i + 1}`}
                      </span>
                    </div>
                  ))}

                  {newPhotoPreviews.map((preview, i) => (
                    <div
                      key={`new-${i}`}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/80 group bg-slate-100 dark:bg-slate-800 transition-all hover:scale-[1.03]"
                    >
                      <img
                        src={preview}
                        alt={`New ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPhoto(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title={t("business.remove_photo") || "Remove photo"}
                      >
                        <X size={13} />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-slate-950 font-extrabold shadow-2xs">
                        New
                      </span>
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-all cursor-pointer bg-white/70 dark:bg-slate-800/60 hover:bg-primary/5 dark:hover:bg-primary/10"
                  >
                    <Plus size={20} />
                    <span className="text-[10px] font-bold">{t("business.add_photo") || "Add Photo"}</span>
                  </button>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                  }}
                />

                {/* Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white/40 dark:bg-slate-800/40"
                  }`}
                >
                  <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {t("business.drag_photos_hint") || "Click or drag & drop additional photos here"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {t("business.photo_formats_hint") || "PNG, JPG, WEBP up to 10MB each"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl px-5 h-11 font-bold cursor-pointer"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl px-8 h-11 font-bold bg-primary hover:bg-primary/90 text-slate-950 shadow-md shadow-primary/20 gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {t("common.save_changes") || "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
