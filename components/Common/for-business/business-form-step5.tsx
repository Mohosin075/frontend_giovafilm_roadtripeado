'use client'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UseFormReturn } from 'react-hook-form'
import { Lock } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface BusinessFormStep5Props {
  form: UseFormReturn<any>
}

export function BusinessFormStep5({ form }: BusinessFormStep5Props) {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Lock className="w-12 h-12 text-yellow-400 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{t("for_business.step5.title")}</h2>
        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{t("for_business.step5.admin_only")}</p>
        <p className="text-gray-600 dark:text-slate-300">
          {t("for_business.step5.subtitle")}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Owner's Direct Phone */}
        <FormField
          control={form.control}
          name="ownerPhone"
          rules={{ 
            required: t("for_business.step5.owner_phone_req"),
            pattern: {
              value: /^[+]?[0-9\s-]{7,15}$/,
              message: t("for_business.step5.owner_phone_invalid"),
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-slate-200 font-semibold">{t("for_business.step5.owner_phone")} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder={t("for_business.step5.owner_phone_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  type="tel"
                />
              </FormControl>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t("for_business.step5.owner_phone_note")}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Email for Invoicing */}
        <FormField
          control={form.control}
          name="invoicingEmail"
          rules={{ 
            required: t("for_business.step5.invoicing_email_req"),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t("for_business.step5.invoicing_email_invalid")
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 dark:text-slate-200 font-semibold">{t("for_business.step5.invoicing_email")} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder={t("for_business.step5.invoicing_email_placeholder")}
                  {...field}
                  className="bg-gray-50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                  type="email"
                />
              </FormControl>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {t("for_business.step5.invoicing_email_note")}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
