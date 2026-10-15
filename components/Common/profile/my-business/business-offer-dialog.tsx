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
import { getImageUrl } from "@/lib/utils";
import {
  useCreateOfferMutation,
  useUpdateOfferMutation,
} from "@/redux/features/offer/offerApi";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  existingOffer?: any | null;
};

export function BusinessOfferDialog({
  open,
  onOpenChange,
  businessId,
  existingOffer,
}: Props) {
  const { t } = useLanguage();
  const isEdit = !!existingOffer?._id;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [bogoSecondType, setBogoSecondType] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [noExpiration, setNoExpiration] = useState(false);
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [redemptionFrequency, setRedemptionFrequency] = useState("daily");
  const [redemptionDuration, setRedemptionDuration] = useState("1440");
  const [redemptionRules, setRedemptionRules] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const isLoading = isCreating || isUpdating;
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (existingOffer) {
      setTitle(existingOffer.title || "");
      setDescription(existingOffer.description || "");
      setDiscountType(existingOffer.discountType || "");
      setDiscountValue(
        existingOffer.discountValue != null
          ? String(existingOffer.discountValue)
          : existingOffer.discount != null
            ? String(existingOffer.discount)
            : "",
      );
      setBogoSecondType(existingOffer.bogoSecondType || "");
      setValidFrom(
        existingOffer.validFrom
          ? new Date(existingOffer.validFrom).toISOString().split("T")[0]
          : "",
      );
      setValidUntil(
        existingOffer.validUntil
          ? new Date(existingOffer.validUntil).toISOString().split("T")[0]
          : "",
      );
      setNoExpiration(!!existingOffer.noExpiration);
      setMaxRedemptions(
        existingOffer.maxRedemptions != null
          ? String(existingOffer.maxRedemptions)
          : "",
      );
      const initialFreq =
        existingOffer.redemptionFrequency ||
        (Number(existingOffer.redemptionDuration) === 1440
          ? "daily"
          : Number(existingOffer.redemptionDuration) === 10080
            ? "weekly"
            : Number(existingOffer.redemptionDuration) === 43200
              ? "monthly"
              : Number(existingOffer.redemptionDuration) >= 525600
                ? "once"
                : existingOffer.redemptionDuration
                  ? "custom"
                  : "daily");
      setRedemptionFrequency(initialFreq);
      setRedemptionDuration(
        existingOffer.redemptionDuration != null
          ? String(existingOffer.redemptionDuration)
          : "1440",
      );
      setRedemptionRules(
        Array.isArray(existingOffer.redemptionRules)
          ? existingOffer.redemptionRules.join("\n")
          : existingOffer.redemptionRules || "",
      );
      setPreview(
        existingOffer.photo || existingOffer.images
          ? getImageUrl(existingOffer.images || existingOffer.photo)
          : null,
      );
      setPhotoFile(null);
    } else {
      setTitle("");
      setDescription("");
      setDiscountType("");
      setDiscountValue("");
      setBogoSecondType("");
      setValidFrom("");
      setValidUntil("");
      setNoExpiration(false);
      setMaxRedemptions("");
      setRedemptionFrequency("daily");
      setRedemptionDuration("1440");
      setRedemptionRules("");
      setPreview(null);
      setPhotoFile(null);
    }

    if (fileRef.current) fileRef.current.value = "";
  }, [open, existingOffer]);

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
    if (!file && fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !discountType) {
      toast.error(t("offers.fill_required_fields"));
      return;
    }
    if (!photoFile && !isEdit) {
      toast.error(t("offers.add_photo"));
      return;
    }
    if (discountType === "BOGO" && !bogoSecondType) {
      toast.error(t("offers.choose_second_item_type"));
      return;
    }
    if (
      (discountType === "Percentage" ||
        discountType === "Flat" ||
        (discountType === "BOGO" && bogoSecondType === "percentage")) &&
      (!discountValue || Number(discountValue) <= 0)
    ) {
      toast.error(t("offers.valid_discount_value"));
      return;
    }
    if (discountType === "BOGO" && bogoSecondType === "percentage") {
      const pct = Number(discountValue);
      if (pct > 100) {
        toast.error(t("offers.second_discount_range"));
        return;
      }
    }
    let finalDuration = Number(redemptionDuration) || 0;
    if (redemptionFrequency === "daily" && (!finalDuration || finalDuration <= 0)) finalDuration = 1440;
    else if (redemptionFrequency === "weekly" && (!finalDuration || finalDuration <= 0)) finalDuration = 10080;
    else if (redemptionFrequency === "monthly" && (!finalDuration || finalDuration <= 0)) finalDuration = 43200;
    else if (redemptionFrequency === "once" && (!finalDuration || finalDuration <= 0)) finalDuration = 525600;

    if (redemptionFrequency === "custom" && (!finalDuration || finalDuration <= 0)) {
      toast.error(t("offers.duration_minutes_req") || "Please enter a valid duration in minutes");
      return;
    }
    if (!maxRedemptions || Number(maxRedemptions) < 0) {
      toast.error(t("offers.redemptions_user_req"));
      return;
    }
    if (!validFrom) {
      toast.error(t("offers.valid_from_req"));
      return;
    }
    if (!noExpiration && !validUntil) {
      toast.error(t("offers.valid_until_req"));
      return;
    }

    const offerData: any = {
      title: title.trim(),
      description: description.trim(),
      business: businessId,
      discountType,
      discountValue:
        discountType === "BOGO" && bogoSecondType !== "percentage"
          ? 100
          : Number(discountValue) || 0,
      ...(discountType === "BOGO"
        ? { bogoSecondType: bogoSecondType || "free" }
        : {}),
      validFrom: new Date(validFrom).toISOString(),
      validUntil: noExpiration
        ? null
        : validUntil
          ? new Date(validUntil).toISOString()
          : null,
      noExpiration,
      maxRedemptions: Number(maxRedemptions) || 0,
      redemptionFrequency,
      redemptionDuration: finalDuration,
      redemptionRules: redemptionRules
        .split("\n")
        .map((rule) => rule.trim())
        .filter(Boolean),
      buttonLabel: "Redeem",
      status: existingOffer?.status || "Active",
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(offerData));
    if (photoFile) {
      formData.append("images", photoFile);
    }

    try {
      if (isEdit) {
        await updateOffer({ id: existingOffer._id, data: formData }).unwrap();
        toast.success(t("offers.updated_success"));
      } else {
        await createOffer(formData).unwrap();
        toast.success(t("offers.created_success"));
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} offer`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 lg:p-10 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isEdit
              ? t("business.edit_offer") || "Edit Offer"
              : t("business.add_offer") || "Add Offer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Photo, Title, Description */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                  {t("business.offer_photo") || "Offer Photo"}
                </Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile.type.startsWith("image/")) {
                        handlePhotoChange(droppedFile);
                      } else {
                        toast.error(t("offers.upload_image_file"));
                      }
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer bg-slate-50/70 dark:bg-slate-900/60 ${
                    isDragging
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30 scale-[1.01]"
                      : "border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary"
                  }`}
                >
                  {preview ? (
                    <div className="relative inline-block">
                      <img
                        src={preview}
                        alt="Offer preview"
                        className="max-h-48 rounded-xl object-cover shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhotoChange(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md cursor-pointer transition-colors"
                        aria-label="Remove offer photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-2 text-slate-400 dark:text-slate-500" size={32} />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {t("business.upload_offer_photo") || "Upload offer photo"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {t("business.photo_hint") || "PNG or JPG, up to 10MB"}
                      </p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="offer-title" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                  {t("offers_admin.title_label") || "Offer Title"} *
                </Label>
                <Input
                  id="offer-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 20% off Coffee"
                  required
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="offer-description" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                  {t("offers_admin.description_label") || "Description"}
                </Label>
                <textarea
                  id="offer-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("offers.describe_offer_placeholder")}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium resize-y"
                />
              </div>
            </div>

            {/* Right Column: Discount details, usage rules, validity */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <Label htmlFor="offer-discount-type" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                  {t("offers_admin.discount_type_label") || "Discount Type"}
                </Label>
                <select
                  id="offer-discount-type"
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value);
                    setBogoSecondType("");
                    if (e.target.value === "BOGO" || e.target.value === "Free item") {
                      setDiscountValue("");
                    }
                  }}
                  className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">{t("offers_admin.select_type") || "Select type"}</option>
                  <option value="Percentage">{t("business.percentage") || "Percentage"}</option>
                  <option value="Flat">{t("business.flat_amount") || "Flat Amount"}</option>
                  <option value="BOGO">{t("business.bogo") || "Buy One Get One (BOGO)"}</option>
                  <option value="Free item">{t("business.free_item") || t("offers_admin.free_item") || "Free Item"}</option>
                </select>
              </div>

              {discountType === "BOGO" && (
                <div className="space-y-3 rounded-2xl border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/70 dark:bg-yellow-950/20 p-4">
                  <div>
                    <Label htmlFor="offer-bogo-type" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                      {t("business.second_item") || "Second item"}
                    </Label>
                    <select
                      id="offer-bogo-type"
                      value={bogoSecondType}
                      onChange={(e) => setBogoSecondType(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold"
                    >
                      <option value="">{t("offers.choose_second_item_type")}</option>
                      <option value="free">{t("offers.second_item_free")}</option>
                      <option value="percentage">{t("business.second_item_pct") || "Second item has a % discount"}</option>
                    </select>
                  </div>
                  {bogoSecondType === "percentage" && (
                    <div>
                      <Label htmlFor="offer-discount-value" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                        {t("business.pct_off_second") || "% off second item"}
                      </Label>
                      <Input
                        id="offer-discount-value"
                        type="number"
                        min={1}
                        max={100}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="e.g., 50"
                        className="h-10 rounded-xl bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>
              )}

              {discountType !== "BOGO" && discountType !== "Free item" && discountType && (
                <div>
                  <Label htmlFor="offer-discount-value" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                    {t("offers_admin.discount_value_label") || "Discount Value"}
                  </Label>
                  <Input
                    id="offer-discount-value"
                    type="number"
                    min={0}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g., 10"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offer-max" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                    {t("offers_admin.redemptions_per_user") || "Redemptions Per User"}
                  </Label>
                  <Input
                    id="offer-max"
                    type="number"
                    min={0}
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="e.g., 1"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {t("business.redemptions_help") || "How many times one customer can use this offer"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="offer-frequency" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                    {t("business.redemption_frequency") || "Redemption Frequency"}
                  </Label>
                  <select
                    id="offer-frequency"
                    className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-semibold bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    value={redemptionFrequency}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRedemptionFrequency(val);
                      if (val === "daily") setRedemptionDuration("1440");
                      else if (val === "weekly") setRedemptionDuration("10080");
                      else if (val === "monthly") setRedemptionDuration("43200");
                      else if (val === "once") setRedemptionDuration("525600");
                    }}
                  >
                    <option value="daily">{t("business.freq_daily") || "Daily (Once per 24 hours)"}</option>
                    <option value="weekly">{t("business.freq_weekly") || "Weekly (Once per 7 days)"}</option>
                    <option value="monthly">{t("business.freq_monthly") || "Monthly (Once per 30 days)"}</option>
                    <option value="once">{t("business.freq_once") || t("offers.one_time_only") || "One-time only"}</option>
                    <option value="custom">{t("business.freq_custom") || "Custom Duration"}</option>
                  </select>

                  {redemptionFrequency === "daily" && (
                    <p className="mt-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      {t("business.redeem_daily_hint") || "Customers can redeem this offer once every 24 hours"}
                    </p>
                  )}
                  {redemptionFrequency === "weekly" && (
                    <p className="mt-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      {t("business.redeem_weekly_hint") || "Customers can redeem this offer once every 7 days"}
                    </p>
                  )}
                  {redemptionFrequency === "monthly" && (
                    <p className="mt-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      {t("business.redeem_monthly_hint") || "Customers can redeem this offer once every 30 days"}
                    </p>
                  )}
                  {redemptionFrequency === "once" && (
                    <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      {t("business.redeem_once_hint") || "Each customer can only redeem this offer once"}
                    </p>
                  )}

                  {redemptionFrequency === "custom" && (
                    <div className="mt-2">
                      <Label htmlFor="offer-duration" className="text-xs text-slate-600 dark:text-slate-400">
                        {t("business.duration_minutes") || "Duration in minutes"}
                      </Label>
                      <Input
                        id="offer-duration"
                        type="number"
                        min={1}
                        value={redemptionDuration}
                        onChange={(e) => setRedemptionDuration(e.target.value)}
                        placeholder="e.g., 1440 for 24 hours"
                        className="mt-1 h-9 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offer-from" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                    {t("business.valid_from") || "Valid From"}
                  </Label>
                  <Input
                    id="offer-from"
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  {!noExpiration && (
                    <div>
                      <Label htmlFor="offer-until" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                        {t("business.valid_until") || "Valid Until"}
                      </Label>
                      <Input
                        id="offer-until"
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm font-semibold"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={noExpiration}
                      onChange={(e) => setNoExpiration(e.target.checked)}
                      className="rounded accent-primary"
                    />
                    {t("business.no_expiration") || "No Expiration"}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="offer-rules" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 block">
                  {t("business.redemption_rules") || "Redemption Rules"}
                </Label>
                <textarea
                  id="offer-rules"
                  value={redemptionRules}
                  onChange={(e) => setRedemptionRules(e.target.value)}
                  placeholder={t("business.one_rule_per_line") || "One rule per line"}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-5 h-11 font-bold cursor-pointer"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-8 h-11 bg-primary hover:bg-primary/90 text-slate-950 font-bold shadow-md shadow-primary/20 cursor-pointer">
              {isLoading
                ? t("business.saving") || "Saving..."
                : isEdit
                  ? t("business.update_offer") || "Update Offer"
                  : t("business.save_offer") || "Save Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
