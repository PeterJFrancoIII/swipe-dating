export const PHOTO_CONSENT_KEY = "swipe.photo.policy";

export const PHOTO_CONSENT_TITLE = "Photos you post";
export const PHOTO_CONSENT_BODY =
  "Photos of you only. No one under 18. No non-consensual intimate images. Location data is stripped from uploads.";

export function photoConsentShouldPrompt(stored: string | null): boolean {
  return stored !== "1";
}
