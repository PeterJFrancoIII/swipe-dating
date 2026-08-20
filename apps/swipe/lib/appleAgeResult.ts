export type AppleAgeFailureReason = "apple_age_unavailable" | "apple_age_declined" | "adult_only";

export type AppleAgeResult = { ok: true; lowerBound: number } | { ok: false; reason: AppleAgeFailureReason };

export type AppleAgeNativeResult = {
  shared?: boolean;
  lowerBound?: number;
  reason?: string;
};

export function readAppleAgeNativeResult(result: AppleAgeNativeResult | null | undefined): AppleAgeResult {
  if (!result) {
    return { ok: false, reason: "apple_age_unavailable" };
  }
  if (result.shared) {
    const lowerBound = Number(result.lowerBound ?? 0);
    if (!Number.isFinite(lowerBound) || lowerBound < 18) {
      return { ok: false, reason: "adult_only" };
    }
    return { ok: true, lowerBound };
  }
  if (result.reason === "adult_only") {
    return { ok: false, reason: "adult_only" };
  }
  if (result.reason === "apple_age_declined") {
    return { ok: false, reason: "apple_age_declined" };
  }
  return { ok: false, reason: "apple_age_unavailable" };
}

export function appleAgeFailureCopy(reason: AppleAgeFailureReason): {
  title: string;
  body: string;
  retry: boolean;
} {
  if (reason === "adult_only") {
    return {
      title: "You must be 18 or older.",
      body: "Get fk'd is adults only. There is no parental-consent path. This is the age check, not a crash.",
      retry: false,
    };
  }
  if (reason === "apple_age_declined") {
    return {
      title: "Age sharing was declined.",
      body: "Get fk'd cannot open without an 18+ Apple age range. Share the range to continue. This is the age check, not a crash.",
      retry: true,
    };
  }
  return {
    title: "Apple age range is unavailable.",
    body: "Get fk'd fails closed until Apple can confirm you are 18 or older. Use a device that can share Declared Age Range, then tap Try again. This is the age check, not a crash.",
    retry: true,
  };
}
