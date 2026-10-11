"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/lib/utils";
import { NoImage } from "@/lib/others/others";
import { useUpdateProfileMutation } from "@/redux/features/user/userApi";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ProfileUpdateModal({
  data,
  open,
  onOpenChange,
}: {
  data: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setPhone(data.phone || "");
      setWebsite(data.website || "");
      setInstagram(data.instagram || "");
    }
  }, [data, open]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("profile.upload_valid_format"));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("profile.image_max_size"));
      e.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error(t("profile.name_required"));
      nameInputRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("phone", phone.trim());
    formData.append("website", website.trim());
    formData.append(
      "instagram",
      instagram.trim() ? instagram.trim().replace(/^@/, "") : "",
    );

    if (imageFile) {
      const safeFile = new File([imageFile], imageFile.name, {
        type: imageFile.type || "image/jpeg",
      });
      formData.append("images", safeFile);
    }

    try {
      await updateProfile(formData).unwrap();
      toast.success(t("profile.update_success") || "Profile updated successfully!");
      onOpenChange(false);
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Profile update failed.";
      toast.error(message);
    }
  };

  const currentImage =
    preview || (data?.profile ? getImageUrl(data.profile) : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-md max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-200 dark:bg-slate-700 sm:hidden" />

        <DialogHeader className="relative shrink-0 px-5 pt-3 pb-2 sm:px-6 sm:pt-5 text-left">
          <DialogTitle className="text-lg font-bold pr-10 text-gray-900 dark:text-slate-100">
            {t("profile.edit_profile")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-slate-400">
            {t("profile.edit_desc") || "Tap the photo to change it, then save your details."}
          </DialogDescription>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 pb-4 sm:px-6 space-y-5">
            <div className="flex flex-col items-center pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-28 w-28 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                aria-label="Change profile photo"
              >
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-yellow-100 dark:border-yellow-950/40 bg-gray-100 dark:bg-slate-800 shadow-sm">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt="profile"
                      width={224}
                      height={224}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <NoImage />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black shadow-md border-2 border-white dark:border-slate-900">
                  <Camera size={16} />
                </span>
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2 text-xs font-semibold text-red-600"
                >
                  Remove new photo
                </button>
              )}
              <p className="mt-2 text-center text-xs text-gray-400">
                JPEG, PNG or WebP · max 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {t("contact_form.name") || "Name"}
              </label>
              <Input
                id="profile-name"
                ref={nameInputRef}
                placeholder={t("auth.name_placeholder") || "Your display name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                className="h-12 rounded-xl bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {t("places_admin.phone_number") || "Phone"}
              </label>
              <Input
                id="profile-phone"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                className="h-12 rounded-xl bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-website" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {t("places_admin.website_url") || "Website"}
              </label>
              <Input
                id="profile-website"
                placeholder="https://yoursite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                type="url"
                inputMode="url"
                className="h-12 rounded-xl bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-instagram" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {t("places_admin.instagram_username") || "Instagram"}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 dark:text-slate-500">
                  @
                </span>
                <Input
                  id="profile-instagram"
                  placeholder="username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                  className="h-12 rounded-xl pl-8 bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] px-5 py-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-colors">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                className="h-12 flex-1 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
