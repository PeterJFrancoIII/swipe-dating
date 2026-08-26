import { NativeModules, Platform } from "react-native";

import { readAppleAgeNativeResult, type AppleAgeNativeResult, type AppleAgeResult } from "@/lib/appleAgeResult";

export type { AppleAgeFailureReason, AppleAgeNativeResult, AppleAgeResult } from "@/lib/appleAgeResult";
export { appleAgeFailureCopy, readAppleAgeNativeResult } from "@/lib/appleAgeResult";

type NativeAge = {
  requestAdultRange?: () => Promise<AppleAgeNativeResult>;
};

function nativeModule(): NativeAge | null {
  const modules = NativeModules as { GetfkdAgeRange?: NativeAge };
  return modules.GetfkdAgeRange ?? null;
}

export function appleAgeAvailable(): boolean {
  return Platform.OS === "ios" && typeof nativeModule()?.requestAdultRange === "function";
}

export async function requestAdultAgeRange(): Promise<AppleAgeResult> {
  if (Platform.OS !== "ios") {
    return { ok: false, reason: "apple_age_unavailable" };
  }
  const native = nativeModule();
  if (typeof native?.requestAdultRange !== "function") {
    return { ok: false, reason: "apple_age_unavailable" };
  }
  try {
    return readAppleAgeNativeResult(await native.requestAdultRange());
  } catch {
    return { ok: false, reason: "apple_age_unavailable" };
  }
}
