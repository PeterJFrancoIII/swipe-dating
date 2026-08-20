export const LOCATION_EXPLAINED_KEY = "swipe.location.explained";

export const LOCATION_CONSENT_TITLE = "Approximate location";
export const LOCATION_CONSENT_BODY =
  "Get fk'd uses approximate on-device location to show a loose mile band. Precise location is not used. Other people never see your coordinates.";

export function locationConsentShouldPrompt(stored: string | null): boolean {
  return stored !== "1";
}
