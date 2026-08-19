import { NativeModules, Platform } from "react-native";

export type AppleAgeResult =
  | { ok: true; lowerBound: number }
  | { ok: false; reason: "apple_age_unavailable" | "apple_age_declined" | "adult_only" };

type NativeAge = {
  requestAdultRange?: () => Promise<{
    shared?: boolean;
    lowerBound?: number;
    reason?: string;
  }>;
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
    const result = await native.requestAdultRange();
    if (!result?.shared) {
      return { ok: false, reason: "apple_age_declined" };
    }
    const lowerBound = Number(result.lowerBound ?? 0);
    if (lowerBound < 18) {
      return { ok: false, reason: "adult_only" };
    }
    return { ok: true, lowerBound };
  } catch {
    return { ok: false, reason: "apple_age_unavailable" };
  }
}
