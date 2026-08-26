import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as {
  apiUrl?: string;
  privacyPolicyUrl?: string;
  supportUrl?: string;
} | undefined;

export const API_URL = (
  extra?.apiUrl ?? "https://getfkd.sentineldefensetechnologies.co.za"
).replace(/\/$/, "");
export const SESSION_HEADER = "X-Swipe-Session";
export const SESSION_TOKEN_KEY = "swipe.session.token";

export const LEGAL_URLS = {
  privacy: extra?.privacyPolicyUrl ?? `${API_URL}/legal/privacy`,
  terms: `${API_URL}/legal/terms`,
  community: `${API_URL}/legal/community`,
  support: extra?.supportUrl ?? `${API_URL}/legal/support`,
} as const;
