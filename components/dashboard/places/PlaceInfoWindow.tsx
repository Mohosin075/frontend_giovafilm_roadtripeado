import React from "react";
import { InfoWindow } from "@vis.gl/react-google-maps";
import { PlaceFormContent } from "./PlaceFormContent";

interface PlaceInfoWindowProps {
  position: { lat: number; lng: number };
  categories: any[];
  onClose: () => void;
  onDelete?: () => void;
  onSave: (payload: any) => Promise<void>;
  isSaving?: boolean;
  isFetchingAddress?: boolean;
  initialData?: any;
}

export const PlaceInfoWindow = ({
  position,
  categories,
  onClose,
  onDelete,
  onSave,
  isSaving = false,
  isFetchingAddress = false,
  initialData,
}: PlaceInfoWindowProps) => {
  // Offset InfoWindow upward so the pin and its drag icon remain fully visible beneath it
  const offsetSize: [number, number] = [0, -45];

  return (
    <InfoWindow position={position} onCloseClick={onClose} headerDisabled pixelOffset={offsetSize}>
      <div className="w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] sm:w-[550px] sm:max-w-[550px] md:w-[650px] md:max-w-[650px] bg-white dark:bg-[#131b2e] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col animate-in fade-in duration-300 max-h-[85vh]">
        <PlaceFormContent
          categories={categories}
          isSaving={isSaving}
          isFetchingAddress={isFetchingAddress}
          onClose={onClose}
          onDelete={onDelete}
          onSave={onSave}
          initialData={initialData}
        />
      </div>

      <style jsx global>{`
        .gm-style-iw {
          padding: 0 !important;
          max-width: calc(100vw - 32px) !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .gm-style-iw-d {
          overflow: visible !important;
          max-height: none !important;
        }
        .gm-style-iw-c {
          padding: 0 !important;
          border-radius: 20px !important;
          background: white !important;
          max-width: calc(100vw - 32px) !important;
          max-height: 85vh !important;
          overflow: auto !important;
        }
        .dark .gm-style-iw-c {
          background: #131b2e !important;
        }
        .gm-style-iw-tc::after {
          background: white !important;
        }
        .dark .gm-style-iw-tc::after {
          background: #131b2e !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </InfoWindow>
  );
};
