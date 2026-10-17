"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMapsQuery } from "@/redux/features/map/mapApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import {
  useRecommendPlaceMutation,
  useExtractCoordinatesMutation,
} from "@/redux/features/place/placeApi";
import { useGetProfileQuery } from "@/redux/features/user/userApi";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useLoginRequired } from "@/components/shared/login-required-modal";
import {
  Lock,
  Sparkles,
  MapPin,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  Navigation,
  Link as LinkIcon,
  AlertCircle,
  Camera,
  Info,
  Check,
  Footprints,
  Clock,
  Mountain,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { buildPlaceRequestBody } from "@/components/dashboard/places/place-payload";
import { getLocalized } from "@/lib/utils";
import Link from "next/link";
import {
  APIProvider,
  Map,
  MapMouseEvent,
  useMap,
} from "@vis.gl/react-google-maps";
import { AnimatedMapPin } from "@/components/shared/maps/animated-map-pin";
import { CustomLocationButton } from "@/components/shared/maps/CustomLocationButton";
import { useTheme } from "next-themes";

function SpotLocationMapInner({
  position,
  onPick,
  defaultCenter,
  isDark,
}: {
  position: { lat: number; lng: number } | null;
  onPick: (pos: { lat: number; lng: number }) => void;
  defaultCenter: { lat: number; lng: number };
  isDark: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (position) {
      map.panTo(position);
      const zoom = map.getZoom() ?? 10;
      if (zoom < 13) {
        map.setZoom(15);
      }
    }
  }, [map, position?.lat, position?.lng]);

  useEffect(() => {
    if (map) {
      map.setOptions({ draggableCursor: "crosshair" });
    }
  }, [map]);

  const handleMapClick = (e: MapMouseEvent) => {
    if (e.detail?.latLng) {
      onPick({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
    }
  };

  return (
    <Map
      colorScheme={isDark ? "DARK" : "LIGHT"}
      style={{ width: "100%", height: "100%" }}
      defaultCenter={position || defaultCenter}
      defaultZoom={position ? 15 : 9}
      minZoom={3}
      maxZoom={19}
      renderingType="RASTER"
      gestureHandling="greedy"
      disableDefaultUI={false}
      streetViewControl={false}
      mapTypeControl={true}
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID"}
      onClick={handleMapClick}
    >
      <CustomLocationButton
        onLocated={(lat, lng) => {
          onPick({ lat, lng });
        }}
      />
      {position && (
        <AnimatedMapPin
          position={position}
          draggable={true}
          onDragEnd={(lat, lng) => {
            onPick({ lat, lng });
          }}
        />
      )}
    </Map>
  );
}

function SpotLocationPicker({
  latitude,
  longitude,
  onLocationSelect,
  isEs,
}: {
  latitude: string;
  longitude: string;
  onLocationSelect: (pos: { lat: number; lng: number }) => void;
  isEs: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const hasValidPosition =
    !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng);
  const position = hasValidPosition ? { lat: numLat, lng: numLng } : null;

  const defaultCenter = { lat: 18.2208, lng: -66.5901 };
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "").trim();

  return (
    <div className="space-y-2">
      <div className="h-60 sm:h-64 w-full rounded-2xl overflow-hidden relative border border-gray-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900">
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <SpotLocationMapInner
              position={position}
              onPick={onLocationSelect}
              defaultCenter={defaultCenter}
              isDark={isDark}
            />
          </APIProvider>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            {isEs
              ? "Clave de Google Maps no configurada"
              : "Google Maps API Key not configured"}
          </div>
        )}

        {/* Floating guidance overlay badge */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold shadow-md border border-white/10">
            <MapPin size={12} className="text-amber-400" />
            {position
              ? isEs
                ? "Arrastra el pin para ajustar"
                : "Drag pin to adjust"
              : isEs
              ? "Haz clic en el mapa para fijar el punto"
              : "Click on map to place pin"}
          </span>
        </div>
      </div>

      {position ? (
        <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} />
            {isEs ? "Ubicación fijada en el mapa" : "Location pinned on map"}
          </span>
          <span className="font-mono text-gray-500 dark:text-slate-400">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 px-1 font-medium flex items-center gap-1">
          <AlertCircle size={12} />
          {isEs
            ? "Haz clic directamente en el mapa para seleccionar la ubicación exacta."
            : "Click directly on the map to choose the exact location."}
        </p>
      )}
    </div>
  );
}

interface RecommendSpotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecommendSpotModal({
  open,
  onOpenChange,
}: RecommendSpotModalProps) {
  const { language } = useLanguage();
  const isEs = language === "es";

  const { data: user } = useGetProfileQuery({});
  const { openLoginRequired } = useLoginRequired();

  const { data: mapsData } = useGetMapsQuery({ limit: 100 });
  const allMaps: any[] = mapsData?.data || [];
  // Only show published maps for users to recommend spots to
  const maps = allMaps.filter(
    (m: any) => m.status === "Published" || !m.status
  );

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const rawCategories: any[] = categoriesData?.data || [];
  // Exclude businesses, restaurants, food, and commercial establishments
  const categories = rawCategories.filter((cat: any) => {
    if (cat?.status === "Hidden") return false;
    const catName = (
      typeof cat?.name === "object"
        ? (cat?.name?.en || cat?.name?.es || Object.values(cat.name)[0])
        : cat?.name || ""
    ).toLowerCase();
    const isCommercial =
      catName.includes("business") ||
      catName.includes("negocio") ||
      catName.includes("restaurant") ||
      catName.includes("restaurante") ||
      catName.includes("comida") ||
      catName.includes("food") ||
      catName.includes("bar") ||
      catName.includes("cafe") ||
      catName.includes("café") ||
      catName.includes("shop") ||
      catName.includes("store") ||
      catName.includes("tienda") ||
      catName.includes("hotel") ||
      catName.includes("hospedaje") ||
      catName.includes("alojamiento") ||
      catName.includes("commercial");
    return !isCommercial;
  });

  const [recommendPlace, { isLoading: isSubmitting }] =
    useRecommendPlaceMutation();
  const [extractCoordinates, { isLoading: isExtracting }] =
    useExtractCoordinatesMutation();

  // Form states
  const [name, setName] = useState("");
  const [mapId, setMapId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [accessDescription, setAccessDescription] = useState("");
  const [hikeTime, setHikeTime] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [isAlwaysOpen, setIsAlwaysOpen] = useState(true);
  const [schedules, setSchedules] = useState("");
  const [tips, setTips] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [showUrlExtractor, setShowUrlExtractor] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPrivileged =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "map_editor";
  const userLevel = user?.level || 0;
  const isLocked = !isPrivileged && userLevel < 1;

  const servicesList = [
    { id: "Parking", label: isEs ? "Estacionamiento" : "Parking" },
    { id: "Restrooms", label: isEs ? "Baños" : "Restrooms" },
    { id: "Pet Friendly", label: "Pet Friendly" },
    { id: "Family Friendly", label: isEs ? "Familiar" : "Family Friendly" },
    { id: "Food Nearby", label: isEs ? "Comida cerca" : "Food Nearby" },
    { id: "Wifi", label: "Wifi" },
  ];

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles = files.slice(0, 5 - images.length);

    setImages((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    clearError("images");
  };

  const removeImage = (index: number) => {
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleExtractFromUrl = async () => {
    if (!googleUrl.trim()) {
      toast.error(
        isEs ? "Pega un enlace de Google Maps" : "Paste a Google Maps link"
      );
      return;
    }
    try {
      const res = await extractCoordinates({
        url: googleUrl.trim(),
      }).unwrap();
      const extractedLat = res?.data?.lat ?? res?.data?.latitude;
      const extractedLng = res?.data?.lng ?? res?.data?.longitude;

      if (extractedLat && extractedLng) {
        setLatitude(String(extractedLat));
        setLongitude(String(extractedLng));
        clearError("latitude");
        clearError("longitude");
        toast.success(
          isEs
            ? "Coordenadas extraídas con éxito"
            : "Coordinates extracted successfully"
        );
        setShowUrlExtractor(false);
      } else {
        toast.error(
          isEs
            ? "No se pudieron extraer las coordenadas de este enlace"
            : "Could not extract coordinates from this link"
        );
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          (isEs
            ? "No se pudieron extraer las coordenadas"
            : "Could not extract coordinates")
      );
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        isEs
          ? "Geolocalización no soportada en este navegador"
          : "Geolocation not supported by browser"
      );
      return;
    }
    toast.loading(isEs ? "Obteniendo ubicación GPS..." : "Getting GPS location...", {
      id: "gps",
    });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude.toFixed(6)));
        setLongitude(String(pos.coords.longitude.toFixed(6)));
        clearError("latitude");
        clearError("longitude");
        toast.success(
          isEs
            ? "¡Ubicación detectada con éxito!"
            : "Location acquired successfully!",
          { id: "gps" }
        );
      },
      () => {
        toast.error(
          isEs
            ? "Permiso de ubicación denegado"
            : "Location permission denied",
          { id: "gps" }
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationPick = (pos: { lat: number; lng: number }) => {
    setLatitude(pos.lat.toFixed(6));
    setLongitude(pos.lng.toFixed(6));
    clearError("latitude");
    clearError("longitude");
  };

  const resetForm = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setName("");
    setMapId("");
    setCategoryId("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setDescription("");
    setAccessDescription("");
    setHikeTime("");
    setDifficulty("Easy");
    setIsAlwaysOpen(true);
    setSchedules("");
    setTips("");
    setGoogleUrl("");
    setSelectedServices([]);
    setImages([]);
    setImagePreviews([]);
    setErrors({});
    setIsSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = isEs
        ? "El nombre del lugar es obligatorio"
        : "Spot name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = isEs
        ? "El nombre debe tener al menos 3 caracteres"
        : "Name must be at least 3 characters";
    }

    if (!mapId) {
      newErrors.mapId = isEs
        ? "Debes seleccionar un mapa o región"
        : "Please select a map or region";
    }

    if (!categoryId) {
      newErrors.categoryId = isEs
        ? "Debes seleccionar una categoría"
        : "Please select a category";
    }

    if (!address.trim()) {
      newErrors.address = isEs
        ? "La dirección o punto de referencia es obligatoria"
        : "Address or landmark is required";
    } else if (address.trim().length < 4) {
      newErrors.address = isEs
        ? "Ingresa una dirección o referencia más descriptiva"
        : "Please enter a descriptive address";
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (!latitude.trim() || isNaN(latNum)) {
      newErrors.latitude = isEs
        ? "Selecciona la ubicación en el mapa"
        : "Please select location on map";
    } else if (latNum < -90 || latNum > 90) {
      newErrors.latitude = isEs
        ? "Latitud debe estar entre -90 y 90"
        : "Latitude must be between -90 and 90";
    }

    if (!longitude.trim() || isNaN(lngNum)) {
      newErrors.longitude = isEs
        ? "Selecciona la ubicación en el mapa"
        : "Please select location on map";
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.longitude = isEs
        ? "Longitud debe estar entre -180 y 180"
        : "Longitude must be between -180 and 180";
    }

    if (images.length === 0) {
      newErrors.images = isEs
        ? "Sube al menos 1 foto del lugar para que podamos verificarlo"
        : "Please upload at least 1 photo for team verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openLoginRequired();
      return;
    }

    if (!validateForm()) {
      toast.error(
        isEs
          ? "Por favor completa todos los campos requeridos correctamente"
          : "Please fill out all required fields correctly"
      );
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    const selectedMap = maps.find((m: any) => m._id === mapId);

    const payload: any = {
      name: name.trim(),
      map: mapId,
      category: categoryId,
      type: "Regular",
      address: address.trim(),
      country:
        selectedMap?.country ||
        (typeof selectedMap?.name === "object"
          ? selectedMap?.name?.en || selectedMap?.name?.es
          : selectedMap?.name) ||
        "",
      location: {
        type: "Point",
        coordinates: [lngNum, latNum],
      },
    };

    if (description.trim()) {
      payload.description = description.trim();
    }
    if (accessDescription.trim()) {
      payload.access = accessDescription.trim();
    }
    if (hikeTime.trim()) {
      payload.hikeTime = hikeTime.trim();
    }
    if (difficulty) {
      payload.difficulty = difficulty;
    }
    payload.schedules = isAlwaysOpen
      ? (isEs ? "Abierto 24/7" : "Always Open (24/7)")
      : schedules.trim() || (isEs ? "Horario específico" : "Specific hours");

    if (tips.trim()) {
      payload.recommendations = { tips: tips.trim() };
    }
    if (selectedServices.length > 0) {
      payload.services = selectedServices;
    }

    try {
      const body = buildPlaceRequestBody(payload, images, []);
      await recommendPlace(body).unwrap();
      setIsSuccess(true);
      toast.success(
        isEs
          ? "¡Lugar recomendado enviado con éxito!"
          : "Spot recommendation submitted successfully!"
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        (isEs ? "Error al enviar recomendación" : "Failed to submit recommendation");
      toast.error(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetForm();
      }}
    >
      <DialogContent className="max-w-[96vw] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-2xl sm:rounded-3xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-[#131b2e] shadow-2xl overflow-hidden">
        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={44} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100">
                {isEs ? "¡Recomendación Enviada!" : "Recommendation Submitted!"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                {isEs
                  ? "Tu propuesta ha sido enviada al equipo de moderación. En cuanto sea aprobada aparecerá en el mapa con tu crédito oficial 'Descubierto por ti' y recibirás +50 puntos de recompensa en tu perfil."
                  : "Your recommendation has been submitted to the moderation team. Once approved, it will be published to the map crediting you as the discoverer and you'll receive +50 reward points!"}
              </p>
            </div>
            <div className="pt-4 flex justify-center">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 rounded-xl h-11 text-sm shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {isEs ? "Entendido" : "Got it!"}
              </Button>
            </div>
          </div>
        ) : isLocked ? (
          /* LOCKED LEVEL REQUIREMENT */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Lock size={30} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Sparkles size={12} className="text-amber-500 fill-amber-500" />
                <span>
                  {isEs
                    ? "Requiere Nivel 1 (Aventurero)"
                    : "Requires Level 1 (Aventurero)"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                {isEs
                  ? "Recomendar Lugares Turísticos"
                  : "Recommend Tourist Spots"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                {isEs
                  ? "Para garantizar la autenticidad y calidad de cada ubicación en Roadtripeado, esta función está disponible a partir del Nivel 1 (Aventurero). ¡Continúa explorando y compartiendo reseñas para subir de nivel!"
                  : "To maintain the highest quality and authenticity of spots on Roadtripeado, adding tourist spots is unlocked at Level 1 (Aventurero). Keep exploring and leaving approved reviews to level up!"}
              </p>
            </div>

            {/* Progress to Level 1 */}
            <div className="bg-gray-50 dark:bg-[#0e1424] rounded-xl p-4 border border-gray-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-600 dark:text-slate-400">
                  {isEs ? "Tu Nivel Actual:" : "Your Current Level:"}
                </span>
                <span className="text-amber-500 font-extrabold">
                  Lv {userLevel} (Explorador)
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400">
                  <span>{isEs ? "Puntos requeridos:" : "Points required:"}</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">
                    {user?.points || 0} / 100 pts
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((user?.points || 0) / 100) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href="/profile/awards"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <Button
                  variant="outline"
                  className="w-full border-amber-400 text-gray-900 dark:text-slate-100 font-bold rounded-xl h-11 text-xs"
                >
                  {isEs ? "Ver Niveles y Premios" : "View Levels & Awards"}
                </Button>
              </Link>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl h-11 text-xs"
              >
                {isEs ? "Continuar Explorando" : "Continue Exploring"}
              </Button>
            </div>
          </div>
        ) : (
          /* MAIN FORM CONTENT - SPACIOUS 2-COL ON DESKTOP, FLUID 1-COL ON MOBILE */
          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
            {/* Header */}
            <DialogHeader className="text-left p-4 sm:p-6 pb-4 pr-12 sm:pr-14 border-b border-gray-150 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold w-fit border border-amber-500/20">
                  <Sparkles size={13} className="text-amber-500 fill-amber-500" />
                  <span>{isEs ? "Gana +50 puntos de recompensa" : "Earn +50 reward points"}</span>
                </div>
              </div>

              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight mt-1">
                  {isEs ? "Recomendar un Lugar Turístico" : "Recommend a Tourist Spot"}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {isEs
                    ? "Comparte atractivos turísticos naturales (playas, ríos, cascadas, senderos, miradores o parques). Las recomendaciones están limitadas a lugares naturales; no se admiten negocios ni restaurantes."
                    : "Share natural tourist attractions (beaches, rivers, waterfalls, trails, viewpoints, or parks). Recommendations are limited to natural spots; businesses and restaurants are not accepted."}
                </p>
              </div>
            </DialogHeader>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                {/* ================= COLUMN 1: LOCATION & BASIC INFO ================= */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <MapPin size={15} />
                    <span>
                      {isEs ? "1. Ubicación e Información Básica" : "1. Location & Basic Info"}
                    </span>
                  </div>

                  {/* Spot Name */}
                  <div>
                    <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{isEs ? "Nombre del Lugar *" : "Spot Name *"}</span>
                      {errors.name && (
                        <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.name}
                        </span>
                      )}
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearError("name");
                      }}
                      placeholder={
                        isEs ? "Ej: Cascada Las Delicias" : "e.g. Hidden Beach Waterfall"
                      }
                      className={`mt-1 h-12 rounded-xl text-sm bg-gray-50/50 dark:bg-slate-900/60 ${
                        errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""
                      }`}
                    />
                  </div>

                  {/* Map / Region & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                        <span>{isEs ? "Mapa / Región *" : "Map / Region *"}</span>
                      </Label>
                      <Select
                        value={mapId}
                        onValueChange={(val) => {
                          setMapId(val);
                          clearError("mapId");
                        }}
                      >
                        <SelectTrigger
                          className={`mt-1 h-12 rounded-xl w-full text-sm bg-gray-50/50 dark:bg-slate-900/60 ${
                            errors.mapId ? "border-rose-500 focus:ring-rose-500" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              isEs ? "Seleccionar mapa" : "Select map"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {maps.map((m: any) => (
                            <SelectItem key={m._id} value={m._id}>
                              {getLocalized(m.name, language) || m.country || "Map"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.mapId && (
                        <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.mapId}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                        <span>{isEs ? "Categoría (Natural) *" : "Category (Natural) *"}</span>
                      </Label>
                      <Select
                        value={categoryId}
                        onValueChange={(val) => {
                          setCategoryId(val);
                          clearError("categoryId");
                        }}
                      >
                        <SelectTrigger
                          className={`mt-1 h-12 rounded-xl w-full text-sm bg-gray-50/50 dark:bg-slate-900/60 ${
                            errors.categoryId ? "border-rose-500 focus:ring-rose-500" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              isEs ? "Seleccionar categoría" : "Select category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c: any) => (
                            <SelectItem key={c._id} value={c._id}>
                              {getLocalized(c.name, language) || c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId ? (
                        <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.categoryId}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                          {isEs
                            ? "Solo atractivos naturales (playas, ríos, miradores, senderos, etc.)."
                            : "Natural spots only (beaches, rivers, viewpoints, trails, etc.)."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address or Landmark */}
                  <div>
                    <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{isEs ? "Dirección o Punto de Referencia *" : "Address or Landmark *"}</span>
                      {errors.address && (
                        <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.address}
                        </span>
                      )}
                    </Label>
                    <Input
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearError("address");
                      }}
                      placeholder={
                        isEs
                          ? "Calle, municipio o punto de referencia"
                          : "Street, municipality or landmark"
                      }
                      className={`mt-1 h-12 rounded-xl text-sm bg-gray-50/50 dark:bg-slate-900/60 ${
                        errors.address ? "border-rose-500 focus-visible:ring-rose-500" : ""
                      }`}
                    />
                  </div>

                  {/* Coordinates Section */}
                  <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="text-xs font-bold text-gray-800 dark:text-slate-200">
                        {isEs ? "Ubicación en el Mapa y Coordenadas *" : "Map Location & Coordinates *"}
                      </Label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation size={12} />
                          <span>{isEs ? "Mi ubicación" : "My location"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlExtractor(!showUrlExtractor)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <LinkIcon size={12} />
                          <span>{isEs ? "URL de Google Maps" : "Google Maps URL"}</span>
                        </button>
                      </div>
                    </div>

                    {showUrlExtractor && (
                      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={googleUrl}
                            onChange={(e) => setGoogleUrl(e.target.value)}
                            placeholder="https://maps.app.goo.gl/... o https://google.com/maps/..."
                            className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900"
                          />
                          <Button
                            type="button"
                            onClick={handleExtractFromUrl}
                            disabled={isExtracting}
                            className="h-10 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0 cursor-pointer font-bold"
                          >
                            {isExtracting ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : isEs ? (
                              "Extraer"
                            ) : (
                              "Extract"
                            )}
                          </Button>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                          {isEs
                            ? "Pega cualquier enlace compartido de Google Maps para extraer las coordenadas automáticamente."
                            : "Paste any link from Google Maps to automatically extract coordinates."}
                        </p>
                      </div>
                    )}

                    {/* Interactive Google Map Location Picker */}
                    <SpotLocationPicker
                      latitude={latitude}
                      longitude={longitude}
                      onLocationSelect={handleLocationPick}
                      isEs={isEs}
                    />

                    {/* Coordinates Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                      <div>
                        <Label className="text-[11px] font-bold text-gray-600 dark:text-slate-400 flex items-center justify-between mb-1">
                          <span>{isEs ? "Latitud *" : "Latitude *"}</span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
                            {isEs ? "(Fijado desde el mapa)" : "(Auto from map)"}
                          </span>
                        </Label>
                        <Input
                          type="text"
                          readOnly
                          disabled
                          value={latitude}
                          placeholder={
                            isEs
                              ? "Selecciona en el mapa"
                              : "Select location on map"
                          }
                          className={`h-11 rounded-xl bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 text-sm font-mono cursor-not-allowed border-gray-200 dark:border-slate-800 select-all ${
                            errors.latitude ? "border-rose-500" : ""
                          }`}
                        />
                        {errors.latitude && (
                          <p className="text-[10px] text-rose-500 font-semibold mt-1">
                            {errors.latitude}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-[11px] font-bold text-gray-600 dark:text-slate-400 flex items-center justify-between mb-1">
                          <span>{isEs ? "Longitud *" : "Longitude *"}</span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
                            {isEs ? "(Fijado desde el mapa)" : "(Auto from map)"}
                          </span>
                        </Label>
                        <Input
                          type="text"
                          readOnly
                          disabled
                          value={longitude}
                          placeholder={
                            isEs
                              ? "Selecciona en el mapa"
                              : "Select location on map"
                          }
                          className={`h-11 rounded-xl bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 text-sm font-mono cursor-not-allowed border-gray-200 dark:border-slate-800 select-all ${
                            errors.longitude ? "border-rose-500" : ""
                          }`}
                        />
                        {errors.longitude && (
                          <p className="text-[10px] text-rose-500 font-semibold mt-1">
                            {errors.longitude}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= COLUMN 2: DETAILS, PHOTOS & AMENITIES ================= */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <Sparkles size={15} />
                    <span>
                      {isEs ? "2. Detalles, Acceso y Fotos" : "2. Details, Access & Photos"}
                    </span>
                  </div>

                  {/* Descriptions Card */}
                  <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 dark:bg-slate-900/50 border border-gray-200/80 dark:border-slate-800">
                    {/* General Description */}
                    <div>
                      <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center justify-between mb-1">
                        <span>{isEs ? "Descripción del Lugar" : "Spot Description"}</span>
                        <span className="text-[10px] font-normal text-gray-400 dark:text-slate-500">
                          {isEs ? "Opcional" : "Optional"}
                        </span>
                      </Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={
                          isEs
                            ? "¿Qué hace único o especial a este lugar?..."
                            : "What makes this spot special and unique?..."
                        }
                        rows={2}
                        className="rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 resize-none placeholder:text-gray-400"
                      />
                    </div>

                    {/* Access Description (Parking to Spot) */}
                    <div>
                      <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center justify-between mb-1">
                        <span>{isEs ? "Acceso desde el Estacionamiento *" : "Access from Parking Area *"}</span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {isEs ? "Ruta a pie" : "Walking route"}
                        </span>
                      </Label>
                      <Textarea
                        value={accessDescription}
                        onChange={(e) => setAccessDescription(e.target.value)}
                        placeholder={
                          isEs
                            ? "Explica la ruta a pie desde el estacionamiento (ej: caminar 150m por el sendero rocoso)..."
                            : "Explain the walking route from where you park (e.g. walk 150m along the rocky trail)..."
                        }
                        rows={2}
                        className="rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 resize-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Trail & Schedule Grouped Box */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 dark:bg-slate-900/50 border border-gray-200/80 dark:border-slate-800 space-y-3">
                    {/* Walking Time & Access Difficulty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                          <Footprints size={13} className="text-amber-500" />
                          <span>{isEs ? "Tiempo de Caminata" : "Walking / Hike Time"}</span>
                        </Label>
                        <Input
                          value={hikeTime}
                          onChange={(e) => setHikeTime(e.target.value)}
                          placeholder={isEs ? "Ej: 15 min" : "e.g. 15 min"}
                          className="h-10 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                          <Mountain size={13} className="text-amber-500" />
                          <span>{isEs ? "Dificultad de Acceso" : "Access Difficulty"}</span>
                        </Label>
                        <Select
                          value={difficulty}
                          onValueChange={(val) => setDifficulty(val)}
                        >
                          <SelectTrigger className="h-10 rounded-xl w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
                            <SelectValue placeholder={isEs ? "Dificultad" : "Difficulty"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">{isEs ? "🟢 Fácil" : "🟢 Easy"}</SelectItem>
                            <SelectItem value="Moderate">{isEs ? "🟡 Moderado" : "🟡 Moderate"}</SelectItem>
                            <SelectItem value="Hard">{isEs ? "🟠 Difícil" : "🟠 Hard"}</SelectItem>
                            <SelectItem value="Extreme">{isEs ? "🔴 Extremo" : "🔴 Extreme"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Schedule / 24/7 Selector */}
                    <div className="pt-2 border-t border-gray-200/60 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock size={13} className="text-amber-500" />
                          <span>{isEs ? "¿Siempre abierto (24/7)?" : "Always open (24/7)?"}</span>
                        </Label>
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-200/80 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => setIsAlwaysOpen(true)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              isAlwaysOpen
                                ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs"
                                : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                            }`}
                          >
                            {isEs ? "Sí, 24/7" : "Yes, 24/7"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAlwaysOpen(false)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              !isAlwaysOpen
                                ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs"
                                : "text-gray-500 hover:text-gray-900 dark:text-slate-400"
                            }`}
                          >
                            {isEs ? "Horario" : "Hours"}
                          </button>
                        </div>
                      </div>

                      {!isAlwaysOpen && (
                        <Input
                          value={schedules}
                          onChange={(e) => setSchedules(e.target.value)}
                          placeholder={
                            isEs
                              ? "Ej: 8:00 AM - 6:00 PM (Mié a Dom)"
                              : "e.g. 8:00 AM - 6:00 PM (Wed to Sun)"
                          }
                          className="h-9 rounded-xl text-xs bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 mt-1"
                        />
                      )}
                    </div>
                  </div>

                  {/* Tips & Recommendations */}
                  <div>
                    <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <Lightbulb size={13} className="text-amber-500" />
                      <span>{isEs ? "Consejos y Recomendaciones" : "Tips & Recommendations"}</span>
                    </Label>
                    <Input
                      value={tips}
                      onChange={(e) => setTips(e.target.value)}
                      placeholder={
                        isEs
                          ? "Ej: Llevar calzado cerrado, agua y protector solar"
                          : "e.g. Wear closed shoes, bring water and sunblock"
                      }
                      className="h-10 rounded-xl text-xs sm:text-sm bg-gray-50/50 dark:bg-slate-900/60 border-gray-200 dark:border-slate-800"
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <Label className="text-xs font-bold text-gray-800 dark:text-slate-200 block mb-1.5">
                      {isEs ? "Servicios y Facilidades" : "Amenities & Services"}
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {servicesList.map((srv) => {
                        const active = selectedServices.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => toggleService(srv.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
                              active
                                ? "bg-amber-400 text-black border-amber-400 shadow-xs font-bold"
                                : "bg-gray-50/80 dark:bg-slate-900/60 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                            }`}
                          >
                            {active && <Check size={11} className="stroke-[3]" />}
                            <span>{srv.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Photos Upload Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Camera size={13} className="text-amber-500" />
                        <span>{isEs ? "Fotos del Lugar (Máx 5) *" : "Spot Photos (Max 5) *"}</span>
                      </Label>
                      <span className="text-xs font-bold text-gray-400">
                        {images.length}/5
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">
                      {isEs
                        ? "Nota: Las fotos deben ser de buena calidad y representar fielmente tanto la ubicación como la experiencia que se recomienda."
                        : "Note: Photos must be of good quality and accurately represent both the location and the experience being recommended."}
                    </p>

                    <div
                      className={`p-3.5 rounded-2xl border transition-colors ${
                        errors.images
                          ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/20"
                          : "border-gray-200 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-900/40"
                      }`}
                    >
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {imagePreviews.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group shadow-xs"
                          >
                            <img
                              src={src}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-opacity cursor-pointer shadow-sm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {images.length < 5 && (
                          <label className="h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-slate-900/60 p-2 text-center">
                            <Upload size={18} className="text-amber-500 mb-0.5" />
                            <span className="text-[11px] text-gray-700 dark:text-slate-300 font-bold">
                              {isEs ? "Añadir foto" : "Add photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {errors.images && (
                        <p className="text-xs text-rose-500 font-semibold mt-2.5 flex items-center gap-1.5">
                          <AlertCircle size={13} /> {errors.images}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-150 dark:border-slate-800 bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-md flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-6 rounded-xl h-12 text-sm font-semibold cursor-pointer dark:border-slate-700"
              >
                {isEs ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 bg-amber-400 hover:bg-amber-500 text-black font-extrabold rounded-xl h-12 text-sm cursor-pointer shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {isEs ? "Enviando lugar..." : "Submitting spot..."}
                  </>
                ) : isEs ? (
                  "Enviar Lugar (+50 pts)"
                ) : (
                  "Submit Spot (+50 pts)"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
