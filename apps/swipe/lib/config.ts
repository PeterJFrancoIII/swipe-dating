import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const API_URL = (
  extra?.apiUrl ?? "https://getfkd.sentineldefensetechnologies.co.za"
).replace(/\/$/, "");
export const SESSION_HEADER = "X-Swipe-Session";
export const SESSION_TOKEN_KEY = "swipe.session.token";
