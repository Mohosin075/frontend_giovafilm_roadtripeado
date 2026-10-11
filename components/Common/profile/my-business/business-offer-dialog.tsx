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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#131b2e] border dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {isEdit ? "Edit Offer" : "Add Offer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
              Offer Photo
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
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer bg-gray-50 dark:bg-slate-900/60 ${
                isDragging
                  ? "border-yellow-500 bg-yellow-50/60 dark:bg-yellow-950/30 ring-2 ring-yellow-400/30 scale-[1.01]"
                  : "border-gray-300 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500"
              }`}
            >
              {preview ? (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Offer preview"
                    className="max-h-40 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoChange(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow cursor-pointer"
                    aria-label="Remove offer photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400 dark:text-slate-500" size={28} />
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Upload offer photo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                    PNG or JPG, up to 10MB
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
            <Label htmlFor="offer-title" className="text-gray-700 dark:text-slate-300">{t("offers_admin.title_label") || "Offer Title"}</Label>
            <Input
              id="offer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 20% off Coffee"
              className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <Label htmlFor="offer-description" className="text-gray-700 dark:text-slate-300">{t("offers_admin.description_label") || "Description"}</Label>
            <textarea
              id="offer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("offers.describe_offer_placeholder")}
              rows={4}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <Label htmlFor="offer-discount-type" className="text-gray-700 dark:text-slate-300">{t("offers_admin.discount_type_label") || "Discount Type"}</Label>
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
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="">{t("offers_admin.select_type") || "Select type"}</option>
              <option value="Percentage">Percentage</option>
              <option value="Flat">Flat Amount</option>
              <option value="BOGO">Buy One Get One (BOGO)</option>
              <option value="Free item">{t("offers_admin.free_item") || "Free Item"}</option>
            </select>
          </div>

          {discountType === "BOGO" && (
            <div className="space-y-3 rounded-xl border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/70 dark:bg-yellow-950/20 p-4">
              <div>
                <Label htmlFor="offer-bogo-type" className="text-gray-700 dark:text-slate-300">Second item</Label>
                <select
                  id="offer-bogo-type"
                  value={bogoSecondType}
                  onChange={(e) => setBogoSecondType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="">{t("offers.choose_second_item_type")}</option>
                  <option value="free">{t("offers.second_item_free")}</option>
                  <option value="percentage">Second item has a % discount</option>
                </select>
              </div>
              {bogoSecondType === "percentage" && (
                <div>
                  <Label htmlFor="offer-discount-value" className="text-gray-700 dark:text-slate-300">% off second item</Label>
                  <Input
                    id="offer-discount-value"
                    type="number"
                    min={1}
                    max={100}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g., 50"
                    className="mt-1 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              )}
            </div>
          )}

          {discountType !== "BOGO" && discountType !== "Free item" && discountType && (
            <div>
              <Label htmlFor="offer-discount-value" className="text-gray-700 dark:text-slate-300">{t("offers_admin.discount_value_label") || "Discount Value"}</Label>
              <Input
                id="offer-discount-value"
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="e.g., 10"
                className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="offer-max" className="text-gray-700 dark:text-slate-300">{t("offers_admin.redemptions_per_user") || "Redemptions Per User"}</Label>
              <Input
                id="offer-max"
                type="number"
                min={0}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                placeholder="e.g., 1"
                className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                How many times one customer can use this offer
              </p>
            </div>
            <div>
              <Label htmlFor="offer-frequency" className="text-sm font-medium text-gray-700 dark:text-slate-300">Redemption Frequency</Label>
              <select
                id="offer-frequency"
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
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
                <option value="daily">Daily (Once per 24 hours)</option>
                <option value="weekly">Weekly (Once per 7 days)</option>
                <option value="monthly">Monthly (Once per 30 days)</option>
                <option value="once">{t("offers.one_time_only")}</option>
                <option value="custom">Custom Duration</option>
              </select>

              {redemptionFrequency === "daily" && (
                <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Customers can redeem this offer once every 24 hours
                </p>
              )}
              {redemptionFrequency === "weekly" && (
                <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Customers can redeem this offer once every 7 days
                </p>
              )}
              {redemptionFrequency === "monthly" && (
                <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Customers can redeem this offer once every 30 days
                </p>
              )}
              {redemptionFrequency === "once" && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Each customer can only redeem this offer once
                </p>
              )}

              {redemptionFrequency === "custom" && (
                <div className="mt-2">
                  <Label htmlFor="offer-duration" className="text-xs text-gray-600 dark:text-slate-400">
                    Duration in minutes
                  </Label>
                  <Input
                    id="offer-duration"
                    type="number"
                    min={1}
                    value={redemptionDuration}
                    onChange={(e) => setRedemptionDuration(e.target.value)}
                    placeholder="e.g., 1440 for 24 hours"
                    className="mt-1 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="offer-from" className="text-gray-700 dark:text-slate-300">Valid From</Label>
              <Input
                id="offer-from"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              {!noExpiration && (
                <div>
                  <Label htmlFor="offer-until" className="text-gray-700 dark:text-slate-300">Valid Until</Label>
                  <Input
                    id="offer-until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noExpiration}
                  onChange={(e) => setNoExpiration(e.target.checked)}
                />
                No Expiration
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="offer-rules" className="text-gray-700 dark:text-slate-300">Redemption Rules</Label>
            <textarea
              id="offer-rules"
              value={redemptionRules}
              onChange={(e) => setRedemptionRules(e.target.value)}
              placeholder="One rule per line"
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-32 bg-[#fabf13] hover:bg-[#e0ac10] text-slate-950 font-bold">
              {isLoading ? "Saving..." : isEdit ? "Update Offer" : "Save Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
