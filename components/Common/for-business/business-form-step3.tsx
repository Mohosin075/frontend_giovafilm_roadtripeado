"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BusinessFormStep2Props {
  businessPhotos?: File[];
  menuFile?: File | null;
  onPhotosChange?: (files: File[]) => void;
  onMenuChange?: (file: File | null) => void;
}

export function BusinessFormStep3({
  businessPhotos = [],
  menuFile = null,
  onPhotosChange,
  onMenuChange,
}: BusinessFormStep2Props) {
  const { t } = useLanguage();
  const photosInputRef = useRef<HTMLInputElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [menuPreview, setMenuPreview] = useState<string | null>(null);
  const [menuFileName, setMenuFileName] = useState("");

  useEffect(() => {
    const urls = businessPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [businessPhotos]);

  useEffect(() => {
    if (!menuFile) {
      setMenuPreview(null);
      setMenuFileName("");
      return;
    }
    const url = URL.createObjectURL(menuFile);
    setMenuPreview(url);
    setMenuFileName(menuFile.name);
    return () => URL.revokeObjectURL(url);
  }, [menuFile]);

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onPhotosChange?.([...businessPhotos, ...files]);
    }
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  const handleMenuSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onMenuChange?.(file);
    if (menuInputRef.current) menuInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    onPhotosChange?.(businessPhotos.filter((_, i) => i !== index));
  };

  const removeMenu = () => {
    onMenuChange?.(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{t("for_business.step3.title")}</h2>
        <p className="text-gray-600 dark:text-slate-300">
          {t("for_business.step3.subtitle")}
        </p>
      </div>

      {/* Upload Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Business Photos */}
        <div className="space-y-4">
          {photoPreviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photoPreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={preview}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="bg-gray-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-200/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => photosInputRef.current?.click()}
            >
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">{t("for_business.step3.tap_to_preview")}</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">{t("for_business.step3.business_photos")} <span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("for_business.step3.business_photos_desc")}
            </p>
            <Button
              type="button"
              onClick={() => photosInputRef.current?.click()}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              <Camera className="w-4 h-4 mr-2" />
              {t("for_business.step3.upload_photos")}
            </Button>
          </div>
          <input
            ref={photosInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotosSelect}
            className="hidden"
          />
        </div>

        {/* Menu / Price List */}
        <div className="space-y-4">
          {menuPreview ? (
            <div className="relative group">
              <div className="bg-gray-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-lg aspect-square flex items-center justify-center p-4">
                {menuFileName.toLowerCase().endsWith(".pdf") ? (
                  <div className="text-center">
                    <div className="bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                      PDF
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 wrap-break-word">
                      {menuFileName}
                    </p>
                  </div>
                ) : (
                  <img
                    src={menuPreview}
                    alt="Menu preview"
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={removeMenu}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="relative"
              onClick={() => menuInputRef.current?.click()}
            >
              <div className="bg-gray-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-200/60 dark:hover:bg-slate-800/60 transition-colors">
                <div className="text-center">
                  <Utensils className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">{t("for_business.step3.tap_to_preview")}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">{t("for_business.step3.menu_price_list")} <span className="text-red-500">*</span></h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t("for_business.step3.menu_desc")}
            </p>
            <Button
              type="button"
              onClick={() => menuInputRef.current?.click()}
              className="w-full bg-gray-900 dark:bg-slate-800 hover:bg-gray-800 dark:hover:bg-slate-700 text-white font-semibold"
            >
              <Utensils className="w-4 h-4 mr-2" />
              {t("for_business.step3.upload_menu")}
            </Button>
          </div>
          <input
            ref={menuInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleMenuSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
