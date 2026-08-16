import { requireNativeModule } from "expo";

export type LocationFix = {
  latitude: number;
  longitude: number;
  accuracy_m: number;
  timestamp_ms: number;
  simulated: boolean;
  mock: boolean;
  reduced_accuracy: boolean;
};

type GetfkdLocationNative = {
  requestReducedFix(): Promise<LocationFix>;
};

let cached: GetfkdLocationNative | null | undefined;

export function getfkdLocation(): GetfkdLocationNative | null {
  if (cached !== undefined) {
    return cached;
  }
  try {
    cached = requireNativeModule<GetfkdLocationNative>("GetfkdLocation");
  } catch {
    cached = null;
  }
  return cached;
}
