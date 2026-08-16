export const DISTANCE_UNAVAILABLE = "Distance unavailable";

export const DISTANCE_LABELS = [
  "About 1 mile",
  "About 5 miles",
  "About 15 miles",
  "Farther",
  DISTANCE_UNAVAILABLE,
] as const;

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
