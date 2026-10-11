"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Shield, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BusinessFormStep4Props {
  form: UseFormReturn<any>;
  offerPhoto?: File | null;
  onOfferPhotoChange?: (file: File | null) => void;
}

export const step4Inputs = [
  "offerTitle",
  "offerDescription",
  "offerMaxRedemptions",
  "offerDuration",
  "offerDiscountType",
  "offerDiscount",
  "offerBogoSecondType",
  "offerValidFrom",
  "offerValidUntil",
  "offerNoExpiration",
  "offerRedemptionRules",
] as const;

export function BusinessFormStep4({
  form,
  offerPhoto = null,
  onOfferPhotoChange,
}: BusinessFormStep4Props) {
  const { t } = useLanguage();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const discountType = form.watch("offerDiscountType");
  const bogoSecondType = form.watch("offerBogoSecondType");

  useEffect(() => {
    if (!offerPhoto) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(offerPhoto);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [offerPhoto]);

  const handleResetOffer = () => {
    form.setValue("offerTitle", "");
    form.setValue("offerDescription", "");
    form.setValue("offerMaxRedemptions", "");
    form.setValue("offerDuration", "");
    form.setValue("offerDiscountType", "");
    form.setValue("offerDiscount", "");
    form.setValue("offerBogoSecondType", "");
    form.setValue("offerValidFrom", "");
    form.setValue("offerValidUntil", "");
    form.setValue("offerNoExpiration", false);
    form.setValue("offerRedemptionRules", "");
    onOfferPhotoChange?.(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          {t("for_business.step4.title")}
        </h2>
        <p className="text-gray-600 dark:text-slate-300">
          {t("for_business.step4.subtitle")}
        </p>
        <div className="mx-auto max-w-xl rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          {t("for_business.step4.optional_note")}
        </div>
      </div>

      <div className="flex justify-end -mb-4">
        <Button
          type="button"
          onClick={handleResetOffer}
          variant="outline"
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
        >
          {t("for_business.step4.reset_offer")}
        </Button>
      </div>
      {/* 
      <div className="bg-yellow-400 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="font-bold text-gray-900">EXCLUSIVE OFFER</h3>
        </div>
        <p className="text-sm text-gray-800">
          Get priority placement in search results by offering exclusive
          discounts to our Pro members.
        </p>

        <div className="bg-yellow-500 rounded-lg p-4 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-yellow-300 rounded border-2 border-dashed border-yellow-600 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📷</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">
                10% OFF for Pro members
              </h4>
              <p className="text-sm text-gray-800">Valid until: 30 Mar 2026</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
              🍽️ DINE-IN ONLY
            </span>
            <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
              👤 1 PER USER
            </span>
            <span className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
              ❌ NO STACKING
            </span>
          </div>
        </div>

        <div className="bg-yellow-200 rounded-lg p-4 flex gap-3">
          <Shield className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-1">
              Pro Verification
            </p>
            <p className="text-xs text-gray-800">
              Offer Validation: Your staff must validate the offer when the user
              with a Pro membership presents the active coupon within the
              application at the time of placing their order.
            </p>
          </div>
        </div>
      </div> */}

      {/* Form Fields */}
      <div className="space-y-4 text-left">
        <div className="space-y-3">
          <h3 className="text-base text-gray-900 dark:text-slate-100 font-semibold">
            {t("for_business.step4.offer_photo")} <span className="text-red-500">*</span>
          </h3>
          {photoPreview ? (
            <div className="relative w-full max-w-sm">
              <img
                src={photoPreview}
                alt="Offer preview"
                className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  onOfferPhotoChange?.(null);
                  if (photoInputRef.current) photoInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow"
                aria-label="Remove offer photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="bg-gray-100 dark:bg-slate-900/60 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:bg-gray-200/60 dark:hover:bg-slate-800/60 transition-colors border border-dashed border-gray-300 dark:border-slate-800"
              onClick={() => photoInputRef.current?.click()}
            >
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{t("for_business.step4.tap_add_photo")}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t("for_business.step4.photo_note")}
          </p>
          <Button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="w-full max-w-sm bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Camera className="w-4 h-4 mr-2" />
            {photoPreview ? t("for_business.step4.change_photo") : t("for_business.step4.upload_photo")}
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onOfferPhotoChange?.(file);
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="offerTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                {t("for_business.step4.offer_title")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("for_business.step4.offer_title_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offerDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                {t("for_business.step4.offer_desc")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("for_business.step4.offer_desc_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 min-h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Limits */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="offerMaxRedemptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                  {t("for_business.step4.redemptions_per_user")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder={t("for_business.step4.redemptions_placeholder")}
                    {...field}
                    className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offerDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                  {t("for_business.step4.duration_minutes")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder={t("for_business.step4.duration_placeholder")}
                    {...field}
                    className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Discount Type and Value */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="offerDiscountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                  {t("for_business.step4.discount_type")}
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("offerBogoSecondType", "");
                      if (e.target.value === "Free item" || e.target.value === "BOGO") {
                        form.setValue("offerDiscount", "");
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">{t("for_business.step4.select_type")}</option>
                    <option value="Percentage">{t("for_business.step4.percentage")}</option>
                    <option value="Flat">{t("for_business.step4.flat_amount")}</option>
                    <option value="BOGO">{t("for_business.step4.bogo")}</option>
                    <option value="Free item">{t("for_business.step4.free_item")}</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {discountType !== "BOGO" && discountType !== "Free item" && (
            <FormField
              control={form.control}
              name="offerDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                    {t("for_business.step4.discount_value")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder={t("for_business.step4.discount_placeholder")}
                      {...field}
                      className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {discountType === "BOGO" && (
          <div className="space-y-3 rounded-xl border border-yellow-200 dark:border-yellow-900/60 bg-yellow-50/60 dark:bg-yellow-950/30 p-4">
            <FormField
              control={form.control}
              name="offerBogoSecondType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                    {t("for_business.step4.second_item")}
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">{t("for_business.step4.choose_second_item_discount")}</option>
                      <option value="free">{t("for_business.step4.second_item_free")}</option>
                      <option value="percentage">{t("for_business.step4.second_item_percentage")}</option>
                    </select>
                  </FormControl>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t("for_business.step4.bogo_note")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {bogoSecondType === "percentage" && (
              <FormField
                control={form.control}
                name="offerDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                      {t("for_business.step4.pct_off_second")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder={t("for_business.step4.pct_off_placeholder")}
                        {...field}
                        className="bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Validity */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="offerValidFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                  {t("for_business.step4.valid_from")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offerValidUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                  {t("for_business.step4.valid_until")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={form.watch("offerNoExpiration")}
                    className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="offerNoExpiration"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50/50 dark:bg-[#0e1424]">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-semibold text-gray-900 dark:text-slate-200 cursor-pointer">
                  {t("for_business.step4.no_expiration")}
                </FormLabel>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t("for_business.step4.no_expiration_note")}
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offerRedemptionRules"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base text-gray-900 dark:text-slate-200 font-semibold">
                {t("for_business.step4.redemption_rules")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("for_business.step4.rules_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 min-h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
