"use client";

import { useEffect, useRef, useState } from "react";
import { useUpdateBusinessMutation } from "@/redux/features/business/businessApi";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type AdminReview = {
  phoneVerified?: boolean;
  websiteFunctional?: boolean;
  locationPinVerified?: boolean;
  mediaUploaded?: boolean;
  internalNotes?: string;
};

type ReviewCheckKey = "phoneVerified" | "websiteFunctional" | "mediaUploaded";

// TASKS defined inside the component to support i18n

export default function AdminReviewTasks({
  businessId,
  review,
}: {
  businessId: string;
  review?: AdminReview | null;
}) {
  const { t } = useLanguage();
  const [updateBusiness] = useUpdateBusinessMutation();

  const TASKS: { key: ReviewCheckKey; label: string }[] = [
    { key: "phoneVerified", label: t("admin_review.phone_verified") },
    { key: "websiteFunctional", label: t("admin_review.website_functional") },
    { key: "mediaUploaded", label: t("admin_review.media_uploaded") },
  ];
  const [checks, setChecks] = useState<AdminReview>({
    phoneVerified: !!review?.phoneVerified,
    websiteFunctional: !!review?.websiteFunctional,
    locationPinVerified: !!review?.locationPinVerified,
    mediaUploaded: !!review?.mediaUploaded,
    internalNotes: review?.internalNotes || "",
  });
  const [notes, setNotes] = useState(review?.internalNotes || "");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notesStatus, setNotesStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [notesDirty, setNotesDirty] = useState(false);
  const notesDirtyRef = useRef(false);

  useEffect(() => {
    setChecks((prev) => ({
      ...prev,
      phoneVerified: !!review?.phoneVerified,
      websiteFunctional: !!review?.websiteFunctional,
      locationPinVerified: !!review?.locationPinVerified,
      mediaUploaded: !!review?.mediaUploaded,
    }));
    if (!notesDirtyRef.current) {
      setNotes(review?.internalNotes || "");
      setNotesDirty(false);
    }
  }, [review]);

  const persist = async (next: AdminReview) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify({ adminReview: next }));
    await updateBusiness({ id: businessId, data: formData }).unwrap();
  };

  const handleCheck = async (key: ReviewCheckKey, checked: boolean) => {
    const previous = checks;
    const next = { ...checks, [key]: checked, internalNotes: notes };
    setChecks(next);
    setSavingKey(key);
    try {
      await persist(next);
    } catch (error) {
      setChecks(previous);
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || t("admin_review.could_not_update"));
    } finally {
      setSavingKey(null);
    }
  };

  const saveNotes = async (value: string) => {
    if (!businessId) return;
    const next = { ...checks, internalNotes: value };
    setNotesStatus("saving");
    try {
      await persist(next);
      setChecks(next);
      notesDirtyRef.current = false;
      setNotesDirty(false);
      setNotesStatus("saved");
      setTimeout(() => setNotesStatus("idle"), 1600);
    } catch (error) {
      setNotesStatus("idle");
      const message =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || t("admin_review.could_not_save_notes"));
    }
  };

  const handleNotesChange = (value: string) => {
    notesDirtyRef.current = true;
    setNotesDirty(true);
    setNotes(value);
    setNotesStatus("idle");
  };

  return (
    <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
        {t("admin_review.title")}
      </h2>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
        {t("admin_review.changes_save_automatically")}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-slate-900/60 px-3 py-2.5">
          <span className="text-sm text-gray-700 dark:text-slate-300">{t("admin_review.location_pin_verified")}</span>
          <span
            className={`text-xs font-semibold ${
              checks.locationPinVerified ? "text-green-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500"
            }`}
          >
            {checks.locationPinVerified ? t("admin_review.verified") : t("admin_review.use_switch_above")}
          </span>
        </div>

        {TASKS.map((task) => (
          <label
            key={task.key}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-900/40 cursor-pointer"
          >
            <span className="text-sm text-gray-700 dark:text-slate-300">{task.label}</span>
            <span className="flex items-center gap-2">
              {savingKey === task.key && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 dark:text-slate-500" />
              )}
              <input
                type="checkbox"
                checked={Boolean(checks[task.key])}
                disabled={savingKey === task.key}
                onChange={(e) => handleCheck(task.key, e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{t("admin_review.internal_notes")}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 mb-3">
          {t("admin_review.private_note")}
        </p>

        <div className="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t("admin_review.note_placeholder")}
            spellCheck={false}
            autoComplete="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className="w-full min-h-[96px] resize-none border-0 p-3 text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none"
            rows={3}
          />
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 dark:bg-slate-900/60 border-t border-gray-200 dark:border-slate-800">
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {notesStatus === "saving" && t("admin_review.saving")}
              {notesStatus === "saved" && (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("admin_review.saved")}
                </span>
              )}
              {notesStatus === "idle" && notesDirty && t("admin_review.unsaved_changes")}
              {notesStatus === "idle" && !notesDirty && " "}
            </span>
            <button
              type="button"
              disabled={!notesDirty || notesStatus === "saving"}
              onClick={() => void saveNotes(notes)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("admin_review.save_note")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
