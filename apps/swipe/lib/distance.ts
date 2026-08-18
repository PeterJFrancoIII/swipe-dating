export const DISTANCE_UNAVAILABLE = "Distance unavailable";
export const DISTANCE_FILTER_ANY = "any";

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

/** Closest on the left, no maximum on the right. */
export const DISTANCE_SLIDER_STEPS = [
  { id: "about_1_mile", label: "About 1 mile", tick: "1 mi" },
  { id: "about_5_miles", label: "About 5 miles", tick: "5 mi" },
  { id: "about_15_miles", label: "About 15 miles", tick: "15 mi" },
  { id: "farther", label: "Farther", tick: "Farther" },
  { id: DISTANCE_FILTER_ANY, label: "Any distance", tick: "Any" },
] as const;

export function distanceSliderIndex(band: string | undefined): number {
  const index = DISTANCE_SLIDER_STEPS.findIndex((step) => step.id === band);
  return index >= 0 ? index : DISTANCE_SLIDER_STEPS.length - 1;
}

export function distanceBandFromSliderIndex(index: number): string {
  const last = DISTANCE_SLIDER_STEPS.length - 1;
  const clamped = Math.max(0, Math.min(last, Math.round(index)));
  return DISTANCE_SLIDER_STEPS[clamped].id;
}

export function distanceSliderLabel(band: string | undefined): string {
  return DISTANCE_SLIDER_STEPS[distanceSliderIndex(band)].label;
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
