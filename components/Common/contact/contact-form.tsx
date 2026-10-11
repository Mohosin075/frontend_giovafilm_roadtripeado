"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSubmitContactFormMutation } from "@/redux/features/public/publicApi";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const { t } = useLanguage();
  const [submitContact, { isLoading }] = useSubmitContactFormMutation();

  // State to manage form inputs
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  // Handler for form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact(formData).unwrap();
      toast.success(t("contact_form.message_sent_success") || "Message sent successfully! We will get back to you soon.");
      // Reset form after submission
      setFormData({
        name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err: any) {
      toast.error(err?.data?.message || t("contact_form.failed_send") || "Failed to send message. Please try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-[#131b2e]/90 backdrop-blur-md rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 dark:border-slate-800/80">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email row - two columns on desktop, one on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name input field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-900 dark:text-slate-100"
            >
              {t("contact_form.name")}
            </label>
            <Input
              id="name"
              type="text"
              placeholder={t("auth.name_placeholder") || "John Doe"}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-gray-100 dark:bg-[#0e1424] w-full px-4 h-12 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-450"
              required
            />
          </div>

          {/* Email input field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900 dark:text-slate-100"
            >
              {t("contact_form.email")}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.email_placeholder") || "john@example.com"}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-gray-100 dark:bg-[#0e1424] w-full px-4 h-12 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-455"
              required
            />
          </div>
        </div>

        {/* Subject dropdown */}
        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="block text-sm font-semibold text-gray-900 dark:text-slate-100"
          >
            {t("contact_form.subject")}
          </label>
          <Select
            value={formData.subject}
            onValueChange={(value) => handleInputChange("subject", value)}
          >
            <SelectTrigger className="bg-gray-100 dark:bg-[#0e1424] w-full px-4 h-12 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-460 text-left">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-lg text-gray-900 dark:text-slate-100">
              <SelectItem value="General Inquiry">{t("contact_form.general_inquiry")}</SelectItem>
              <SelectItem value="Trip Planning">{t("contact_form.trip_planning")}</SelectItem>
              <SelectItem value="Partnership">{t("contact_form.partnership")}</SelectItem>
              <SelectItem value="Support">{t("contact_form.support")}</SelectItem>
              <SelectItem value="Other">{t("contact_form.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message textarea */}
        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block text-sm font-semibold text-gray-900 dark:text-slate-100"
          >
            {t("contact_form.message")}
          </label>
          <textarea
            id="message"
            placeholder={t("contact_form.message_placeholder")}
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0e1424] border border-gray-200 dark:border-slate-800 rounded-lg text-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32 font-sans"
            required
          ></textarea>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="px-10 h-14 w-full bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold rounded-lg text-base shadow-lg shadow-yellow-500/20 disabled:opacity-75 cursor-pointer border-none"
        >
          {isLoading ? t("contact_form.sending") : t("contact_form.send_message")}
        </Button>
      </form>
    </div>
  );
}
