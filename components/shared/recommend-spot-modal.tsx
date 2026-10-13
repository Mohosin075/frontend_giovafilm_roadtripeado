"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { buildPlaceRequestBody } from "@/components/dashboard/places/place-payload";
import Link from "next/link";

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

  const { data: user, isLoading: isUserLoading } = useGetProfileQuery({});
  const { openLoginRequired } = useLoginRequired();

  const { data: mapsData } = useGetMapsQuery({ limit: 100 });
  const maps = mapsData?.data || [];

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const categories = categoriesData?.data || [];

  const [recommendPlace, { isLoading: isSubmitting }] =
    useRecommendPlaceMutation();
  const [extractCoordinates, { isLoading: isExtracting }] =
    useExtractCoordinatesMutation();

  // Form state
  const [name, setName] = useState("");
  const [mapId, setMapId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [tips, setTips] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [showUrlExtractor, setShowUrlExtractor] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles = files.slice(0, 5 - images.length);

    setImages((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
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
      toast.error(isEs ? "Pega un enlace de Google Maps" : "Paste a Google Maps URL");
      return;
    }
    try {
      const res = await extractCoordinates({ url: googleUrl.trim() }).unwrap();
      if (res?.data?.lat && res?.data?.lng) {
        setLatitude(String(res.data.lat));
        setLongitude(String(res.data.lng));
        toast.success(
          isEs ? "Coordenadas extraídas con éxito" : "Coordinates extracted successfully"
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
          ? "Geolocalización no soportada"
          : "Geolocation not supported by browser"
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        toast.success(
          isEs
            ? "Ubicación actual obtenida"
            : "Current location acquired successfully"
        );
      },
      () => {
        toast.error(
          isEs
            ? "Permiso de ubicación denegado"
            : "Location permission denied"
        );
      }
    );
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
    setTips("");
    setGoogleUrl("");
    setSelectedServices([]);
    setImages([]);
    setImagePreviews([]);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openLoginRequired();
      return;
    }

    if (!name.trim()) {
      toast.error(isEs ? "El nombre del lugar es requerido" : "Place name is required");
      return;
    }
    if (!mapId) {
      toast.error(isEs ? "Selecciona un mapa / país" : "Please select a map");
      return;
    }
    if (!categoryId) {
      toast.error(isEs ? "Selecciona una categoría" : "Please select a category");
      return;
    }
    if (!address.trim()) {
      toast.error(isEs ? "La dirección es requerida" : "Address is required");
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error(
        isEs
          ? "Ingresa coordenadas válidas de latitud y longitud"
          : "Please provide valid coordinates"
      );
      return;
    }

    const payload: any = {
      name: name.trim(),
      map: mapId,
      category: categoryId,
      type: "Regular",
      address: address.trim(),
      location: {
        type: "Point",
        coordinates: [lngNum, latNum],
      },
    };

    if (description.trim()) {
      payload.description = description.trim();
    }
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
          ? "¡Lugar recomendado enviado para revisión!"
          : "Spot recommendation submitted for review!"
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        (isEs ? "Error al enviar recomendación" : "Failed to submit spot");
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) resetForm();
    }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-gray-100 dark:border-slate-800 bg-white dark:bg-[#131b2e]">
        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
              {isEs ? "¡Recomendación Enviada!" : "Recommendation Submitted!"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {isEs
                ? "Tu lugar turístico propuesto ha sido enviado al equipo de Roadtripeado para su revisión. Una vez aprobado, aparecerá en el mapa con tu crédito 'Descubierto por ti' y recibirás puntos extra en tu perfil."
                : "Your proposed tourist spot has been submitted for review. Once approved, it will be published to the map crediting you as the discoverer, and you'll earn bonus reward points!"}
            </p>
            <div className="pt-4 flex gap-3 justify-center">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-6 rounded-xl h-11"
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

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400">
                  <span>
                    {isEs
                      ? "Reseñas aprobadas requeridas:"
                      : "Approved reviews required:"}
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">
                    {user?.totalReviewsApproved || 0} / 6
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((user?.totalReviewsApproved || 0) / 6) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link href="/profile/awards" className="flex-1" onClick={() => onOpenChange(false)}>
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
          /* FORM CONTENT */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <DialogHeader className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold w-fit mb-1 border border-amber-500/20">
                <Sparkles size={12} className="text-amber-500 fill-amber-500" />
                <span>{isEs ? "Gana +50 puntos" : "Earn +50 points"}</span>
              </div>
              <DialogTitle className="text-2xl font-black text-gray-900 dark:text-slate-100">
                {isEs
                  ? "Recomendar Lugar Turístico"
                  : "Recommend a Tourist Spot"}
              </DialogTitle>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {isEs
                  ? "Tu recomendación será revisada por nuestro equipo antes de publicarse en el mapa."
                  : "Your recommendation will be reviewed by our team before appearing publicly."}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Place Name */}
              <div>
                <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  {isEs ? "Nombre del Lugar *" : "Spot Name *"}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isEs ? "Ej: Cascada Las Delicias" : "e.g. Hidden Beach Waterfall"
                  }
                  required
                  className="mt-1 h-11 rounded-xl"
                />
              </div>

              {/* Map & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {isEs ? "Mapa / Región *" : "Map / Region *"}
                  </Label>
                  <Select value={mapId} onValueChange={setMapId} required>
                    <SelectTrigger className="mt-1 h-11 rounded-xl w-full">
                      <SelectValue
                        placeholder={isEs ? "Selecciona mapa" : "Select map"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {maps.map((m: any) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name || m.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {isEs ? "Categoría *" : "Category *"}
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger className="mt-1 h-11 rounded-xl w-full">
                      <SelectValue
                        placeholder={isEs ? "Selecciona categoría" : "Select category"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  {isEs ? "Dirección *" : "Address *"}
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    isEs ? "Calle, sector, municipio o referencia" : "Address or nearest landmark"
                  }
                  required
                  className="mt-1 h-11 rounded-xl"
                />
              </div>

              {/* Coordinates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {isEs ? "Coordenadas (Lat / Lng) *" : "Coordinates (Lat / Lng) *"}
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation size={11} />
                      {isEs ? "Mi ubicación" : "My location"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlExtractor(!showUrlExtractor)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon size={11} />
                      {isEs ? "Google Maps URL" : "Google Maps URL"}
                    </button>
                  </div>
                </div>

                {showUrlExtractor && (
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={googleUrl}
                        onChange={(e) => setGoogleUrl(e.target.value)}
                        placeholder="https://maps.app.goo.gl/..."
                        className="h-9 text-xs rounded-lg"
                      />
                      <Button
                        type="button"
                        onClick={handleExtractFromUrl}
                        disabled={isExtracting}
                        className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg shrink-0"
                      >
                        {isExtracting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          isEs ? "Extraer" : "Extract"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Latitude (e.g. 18.2208)"
                    required
                    className="h-11 rounded-xl"
                  />
                  <Input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Longitude (e.g. -66.5901)"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  {isEs ? "Descripción del lugar" : "Description"}
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isEs
                      ? "¿Qué hace especial a este lugar? Cuéntale a los viajeros..."
                      : "What makes this place special? Tell travelers what to expect..."
                  }
                  rows={3}
                  className="mt-1 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Tips */}
              <div>
                <Label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  {isEs ? "Consejos y Recomendaciones" : "Tips & Advice"}
                </Label>
                <Input
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder={
                    isEs
                      ? "Ej: Llevar repelente de mosquitos y zapatos cerrados"
                      : "e.g. Bring water shoes and insect repellent"
                  }
                  className="mt-1 h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Services */}
              <div>
                <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5">
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
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer border ${
                          active
                            ? "bg-amber-400 text-black border-amber-400 font-bold"
                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-100"
                        }`}
                      >
                        {srv.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos */}
              <div>
                <Label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5">
                  {isEs ? "Fotos (Máximo 5)" : "Photos (Max 5)"}
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-800/40">
                      <Upload size={18} className="text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {isEs ? "Subir foto" : "Add photo"}
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
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-12 text-sm font-semibold cursor-pointer"
              >
                {isEs ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-xl h-12 text-sm cursor-pointer shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {isEs ? "Enviando..." : "Submitting..."}
                  </>
                ) : (
                  isEs ? "Enviar Recomendación" : "Submit Spot"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
