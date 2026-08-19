import Constants from "expo-constants";
import { Platform } from "react-native";

export type LastError = {
  path: string;
  status: number;
  code: string;
  message: string;
};

export type DiagnosticContext = {
  route: string;
  screen: string;
  app_version: string;
  build_number: string;
  platform: string;
  os_version: string;
  expo_sdk: string;
  release: "dev" | "store";
  adult_accepted?: boolean;
  onboarding_complete?: boolean;
  apple_bound?: boolean;
  account_id?: string;
  last_error?: LastError;
  match_id?: string;
  timezone: string;
  client_time: string;
  surface_href?: string;
  surface_label?: string;
  kind?: string;
};

const state: {
  lastError?: LastError;
  accountId?: string;
  adultAccepted?: boolean;
  onboardingComplete?: boolean;
  appleBound?: boolean;
} = {};

export function recordLastError(error: LastError): void {
  state.lastError = {
    path: error.path.slice(0, 180),
    status: error.status,
    code: error.code.slice(0, 80),
    message: error.message.slice(0, 240),
  };
}

export function recordSessionHints(payload: Record<string, unknown>): void {
  if (typeof payload.account_id === "string" && payload.account_id) {
    state.accountId = payload.account_id;
  }
  if (typeof payload.adult_accepted === "boolean") {
    state.adultAccepted = payload.adult_accepted;
  }
  if (typeof payload.onboarding_complete === "boolean") {
    state.onboardingComplete = payload.onboarding_complete;
  }
  if (typeof payload.apple_bound === "boolean") {
    state.appleBound = payload.apple_bound;
  }
}

export function diagnosticContext(route: string, screen: string, matchId?: string): DiagnosticContext {
  return {
    route,
    screen,
    app_version: Constants.expoConfig?.version ?? "0.1.0",
    build_number: String(Constants.expoConfig?.ios?.buildNumber ?? ""),
    platform: Platform.OS,
    os_version: String(Platform.Version),
    expo_sdk: String(Constants.expoConfig?.sdkVersion ?? "57.0.0"),
    release: __DEV__ ? "dev" : "store",
    adult_accepted: state.adultAccepted,
    onboarding_complete: state.onboardingComplete,
    apple_bound: state.appleBound,
    account_id: state.accountId,
    last_error: state.lastError,
    match_id: matchId,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    client_time: new Date().toISOString(),
  };
}

export function screenName(route: string): string {
  if (route.includes("matches/") && route !== "/matches") {
    return "chat";
  }
  if (route === "/" || route.endsWith("/index")) {
    return "swipe";
  }
  const last = route.split("/").filter(Boolean).pop() ?? "app";
  return last.replace(/\[|\]/g, "");
}
