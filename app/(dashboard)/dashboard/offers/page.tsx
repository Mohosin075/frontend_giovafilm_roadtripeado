"use client";

import { CreateOfferDialog } from "@/components/dashboard/offers/create-offer-dialog";
import { OffersTable } from "@/components/dashboard/offers/offers-table";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleOpenCreate = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleOpenEdit = (offer: any) => {
    setEditData(offer);
    setOpen(true);
  };

  return (
    <div className="bg-gray-100 dark:bg-[#0b0f19] min-h-screen text-gray-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">{t("nav.offer")}</h1>

        <Button
          onClick={handleOpenCreate}
          className="bg-primary/80 hover:bg-primary text-black flex items-center gap-2"
        >
          <Plus size={20} />
          {t("offers_admin.create_offers")}
        </Button>
      </div>

      {/* Table */}
      <OffersTable onEdit={handleOpenEdit} />

      {/* Create / Edit Offer Dialog */}
      <CreateOfferDialog
        open={open}
        onOpenChange={setOpen}
        initialData={editData}
      />
    </div>
  );
}
