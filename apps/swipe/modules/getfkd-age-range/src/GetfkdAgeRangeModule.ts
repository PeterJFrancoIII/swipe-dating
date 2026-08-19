import { requireNativeModule } from "expo";

type GetfkdAgeRangeNative = {
  requestAdultRange(): Promise<{ shared?: boolean; lowerBound?: number; reason?: string }>;
};

let cached: GetfkdAgeRangeNative | null | undefined;

export function getfkdAgeRange(): GetfkdAgeRangeNative | null {
  if (cached !== undefined) {
    return cached;
  }
  try {
    cached = requireNativeModule<GetfkdAgeRangeNative>("GetfkdAgeRange");
  } catch {
    cached = null;
  }
  return cached;
}
