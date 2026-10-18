/**
 * Route Planner Storage and Helper Utilities
 * Provides synchronization across map popups, place details pages, and the route planner screen.
 */

export const LOCAL_STORAGE_ROUTE_DRAFT = "roadtripeado_draft_route";

export interface RouteDraftStop {
  id: string;
  placeId: string;
  name: any;
  address: string;
  media: string[];
  coordinates: [number, number]; // [lng, lat]
  order: number;
}

export interface RouteDraft {
  name: string;
  stops: RouteDraftStop[];
  routeId: string | null;
  lastUpdated: number;
}

export function getRouteDraft(): RouteDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROUTE_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLocationInRouteDraft(placeId: string): boolean {
  if (typeof window === "undefined" || !placeId) return false;
  const draft = getRouteDraft();
  if (!draft || !Array.isArray(draft.stops)) return false;
  return draft.stops.some(
    (s) => s.placeId === placeId || s.id === placeId
  );
}

export function addLocationToRouteDraft(
  location: any,
  options?: { language?: string; defaultName?: string }
): {
  success: boolean;
  alreadyExists?: boolean;
  message: string;
  stopCount: number;
} {
  if (typeof window === "undefined") {
    return { success: false, message: "Browser environment required", stopCount: 0 };
  }

  const lang = options?.language || "es";
  const placeId = location?._id || location?.id;
  if (!placeId) {
    return {
      success: false,
      message: lang === "es" ? "Ubicación inválida" : "Invalid location",
      stopCount: 0,
    };
  }

  let stops: RouteDraftStop[] = [];
  let name = options?.defaultName || (lang === "es" ? "Mi Roadtrip" : "My Roadtrip");
  let routeId: string | null = null;

  const existingDraft = getRouteDraft();
  if (existingDraft) {
    if (Array.isArray(existingDraft.stops)) {
      stops = existingDraft.stops;
    }
    if (existingDraft.name) name = existingDraft.name;
    if (existingDraft.routeId) routeId = existingDraft.routeId;
  }

  const exists = stops.some((s) => s.placeId === placeId || s.id === placeId);
  if (exists) {
    return {
      success: false,
      alreadyExists: true,
      message:
        lang === "es"
          ? "Este lugar ya está en tu ruta"
          : "This place is already in your route",
      stopCount: stops.length,
    };
  }

  // Extract coordinates [lng, lat]
  let coordinates: [number, number] = [0, 0];
  if (
    Array.isArray(location?.location?.coordinates) &&
    location.location.coordinates.length === 2
  ) {
    coordinates = [
      Number(location.location.coordinates[0]),
      Number(location.location.coordinates[1]),
    ];
  } else if (
    Array.isArray(location?.location?.mapLocation?.coordinates) &&
    location.location.mapLocation.coordinates.length === 2
  ) {
    coordinates = [
      Number(location.location.mapLocation.coordinates[0]),
      Number(location.location.mapLocation.coordinates[1]),
    ];
  } else if (
    Array.isArray(location?.coordinates) &&
    location.coordinates.length === 2
  ) {
    coordinates = [
      Number(location.coordinates[0]),
      Number(location.coordinates[1]),
    ];
  } else if (location?.longitude && location?.latitude) {
    coordinates = [Number(location.longitude), Number(location.latitude)];
  } else if (location?.lng && location?.lat) {
    coordinates = [Number(location.lng), Number(location.lat)];
  }

  // Extract media
  let media: string[] = [];
  if (Array.isArray(location?.media?.photos) && location.media.photos.length > 0) {
    media = location.media.photos;
  } else if (Array.isArray(location?.media) && location.media.length > 0) {
    media = location.media;
  } else if (typeof location?.media === "string") {
    media = [location.media];
  } else if (Array.isArray(location?.images) && location.images.length > 0) {
    media = location.images;
  }

  const address =
    location?.address ||
    location?.location?.address ||
    location?.location?.city ||
    location?.city ||
    "";

  const newStop: RouteDraftStop = {
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    placeId,
    name: location.name,
    address,
    media,
    coordinates,
    order: stops.length + 1,
  };

  stops.push(newStop);

  const updatedDraft: RouteDraft = {
    name,
    stops,
    routeId,
    lastUpdated: Date.now(),
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_ROUTE_DRAFT, JSON.stringify(updatedDraft));
    window.dispatchEvent(new Event("roadtripeado_route_draft_changed"));
    return {
      success: true,
      alreadyExists: false,
      message:
        lang === "es"
          ? "¡Lugar añadido a tu ruta!"
          : "Place added to your route!",
      stopCount: stops.length,
    };
  } catch (err) {
    return {
      success: false,
      message:
        lang === "es"
          ? "Error al guardar en el borrador de ruta"
          : "Error saving to route draft",
      stopCount: stops.length - 1,
    };
  }
}
