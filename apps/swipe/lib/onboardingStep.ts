export type RequiredOnboardingStep =
  | "sex"
  | "location"
  | "name"
  | "bio"
  | "smoking"
  | "drinking"
  | "drugs"
  | "photos"
  | "continue_extras";

const GAP_TO_STEP: Record<string, RequiredOnboardingStep> = {
  gender: "sex",
  location: "location",
  name: "name",
  bio: "bio",
  smoking: "smoking",
  drinking: "drinking",
  drugs: "drugs",
  photos: "photos",
};

export const MIN_REQUIRED_PHOTOS = 2;

export function nextOnboardingStep(missingFields: readonly string[]): RequiredOnboardingStep {
  const firstGap = missingFields[0];
  if (firstGap && GAP_TO_STEP[firstGap]) {
    return GAP_TO_STEP[firstGap];
  }
  return "continue_extras";
}

export function hydrateOnboardingPhotos(
  photos: readonly { slot: number; url: string }[] | undefined,
): { slot: number; url: string }[] {
  return Array.isArray(photos) ? photos.map((photo) => ({ slot: photo.slot, url: photo.url })) : [];
}

export function photosSatisfyRequirement(
  photos: readonly { slot: number; url: string }[],
  photoCount?: number,
): boolean {
  return Math.max(photos.length, photoCount ?? 0) >= MIN_REQUIRED_PHOTOS;
}
