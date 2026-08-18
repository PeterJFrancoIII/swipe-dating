export const DISTANCE_UNAVAILABLE = "Distance unavailable";
export const DISTANCE_FILTER_ANY = "any";
export const DISTANCE_FILTER_MIN_MILES = 1;
export const DISTANCE_FILTER_MAX_MILES = 500;
export const DISTANCE_SLIDER_LAST = DISTANCE_FILTER_MAX_MILES;

export const DISTANCE_LABELS = [
  "About 1 mile",
  "About 5 miles",
  "About 15 miles",
  "Farther",
  DISTANCE_UNAVAILABLE,
] as const;

export const DISTANCE_FILTER_CHOICES = [
  { id: DISTANCE_FILTER_ANY, label: "Any distance", icon: "🌍" },
  { id: "about_1_mile", label: "About 1 mile", icon: "📍" },
  { id: "about_5_miles", label: "About 5 miles", icon: "📌" },
  { id: "about_15_miles", label: "About 15 miles", icon: "🗺️" },
  { id: "farther", label: "Farther", icon: "✈️" },
] as const;

const LEGACY_BAND_MILES: Record<string, number | null> = {
  [DISTANCE_FILTER_ANY]: null,
  any_distance: null,
  about_1_mile: 1,
  about_5_miles: 5,
  about_15_miles: 15,
  farther: DISTANCE_FILTER_MAX_MILES,
};

export function clampDistanceMiles(miles: number): number {
  return Math.max(DISTANCE_FILTER_MIN_MILES, Math.min(DISTANCE_FILTER_MAX_MILES, Math.round(miles)));
}

export function parseMaxDistanceMiles(
  miles: unknown,
  legacyBand?: unknown,
): number | null {
  if (miles === null) {
    return null;
  }
  if (typeof miles === "number" && Number.isFinite(miles)) {
    return miles <= 0 ? null : clampDistanceMiles(miles);
  }
  if (typeof miles === "string" && miles.trim()) {
    const text = miles.trim().toLowerCase();
    if (text === DISTANCE_FILTER_ANY || text === "infinite" || text === "infinity") {
      return null;
    }
    const parsed = Number(text);
    if (Number.isFinite(parsed)) {
      return parsed <= 0 ? null : clampDistanceMiles(parsed);
    }
  }
  if (miles === undefined && typeof legacyBand === "string") {
    if (legacyBand in LEGACY_BAND_MILES) {
      return LEGACY_BAND_MILES[legacyBand];
    }
  }
  return null;
}

/** 0 = 1 mile … 499 = 500 miles, 500 = infinite. */
export function distanceSliderIndex(miles: number | null | undefined): number {
  if (miles == null) {
    return DISTANCE_SLIDER_LAST;
  }
  return clampDistanceMiles(miles) - DISTANCE_FILTER_MIN_MILES;
}

export function milesFromSliderIndex(index: number): number | null {
  const clamped = Math.max(0, Math.min(DISTANCE_SLIDER_LAST, Math.round(index)));
  if (clamped >= DISTANCE_SLIDER_LAST) {
    return null;
  }
  return clamped + DISTANCE_FILTER_MIN_MILES;
}

export function distanceSliderLabel(miles: number | null | undefined): string {
  if (miles == null) {
    return "Any distance";
  }
  const value = clampDistanceMiles(miles);
  return value === 1 ? "1 mile" : `${value} miles`;
}

export type DistanceLabel = (typeof DISTANCE_LABELS)[number];

export function displayDistance(label: string | undefined): string {
  if (label && (DISTANCE_LABELS as readonly string[]).includes(label)) {
    return label;
  }
  return DISTANCE_UNAVAILABLE;
}

export function coarseRegionLabel(distanceKm: number | undefined, fallback = DISTANCE_UNAVAILABLE): string {
  if (typeof distanceKm !== "number" || Number.isNaN(distanceKm)) {
    return fallback;
  }
  const miles = distanceKm / 1.609344;
  if (miles <= 2.5) {
    return "About 1 mile";
  }
  if (miles <= 8) {
    return "About 5 miles";
  }
  if (miles <= 20) {
    return "About 15 miles";
  }
  return "Farther";
}
