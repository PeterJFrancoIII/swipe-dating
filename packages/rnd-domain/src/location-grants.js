export const LOCATION_MODE = Object.freeze({
  NONE: "none",
  APPROXIMATE_MATCH_AREA: "approximate_match_area",
  MEETING_PIN: "meeting_pin",
  LIVE_15_MINUTES: "live_15_minutes",
  LIVE_1_HOUR: "live_1_hour",
  LIVE_4_HOURS: "live_4_hours",
});

const MAX_DURATION_MS = Object.freeze({
  [LOCATION_MODE.APPROXIMATE_MATCH_AREA]: 24 * 60 * 60 * 1_000,
  [LOCATION_MODE.MEETING_PIN]: 24 * 60 * 60 * 1_000,
  [LOCATION_MODE.LIVE_15_MINUTES]: 15 * 60 * 1_000,
  [LOCATION_MODE.LIVE_1_HOUR]: 60 * 60 * 1_000,
  [LOCATION_MODE.LIVE_4_HOURS]: 4 * 60 * 60 * 1_000,
});

const PRECISE_MODES = new Set([
  LOCATION_MODE.MEETING_PIN,
  LOCATION_MODE.LIVE_15_MINUTES,
  LOCATION_MODE.LIVE_1_HOUR,
  LOCATION_MODE.LIVE_4_HOURS,
]);

export function issueLocationGrant({
  shareId,
  senderProfileId,
  recipientProfileId,
  mode,
  issuedAtMs,
  sequence,
  preciseConfirmation = false,
}) {
  if (!shareId || !senderProfileId || !recipientProfileId) {
    throw new TypeError("share and profile identifiers are required");
  }
  if (senderProfileId === recipientProfileId) throw new RangeError("cannot share to self");
  if (!MAX_DURATION_MS[mode]) throw new RangeError("unsupported location mode");
  if (PRECISE_MODES.has(mode) && !preciseConfirmation) {
    throw new Error("precise location requires a second explicit confirmation");
  }
  if (!Number.isSafeInteger(issuedAtMs) || !Number.isSafeInteger(sequence) || sequence < 0) {
    throw new TypeError("invalid issue time or sequence");
  }

  return Object.freeze({
    shareId,
    senderProfileId,
    recipientProfileId,
    mode,
    issuedAtMs,
    expiresAtMs: issuedAtMs + MAX_DURATION_MS[mode],
    sequence,
    preciseConfirmation,
    revokedAtMs: null,
  });
}

export function locationGrantIsActive(grant, nowMs) {
  return grant.revokedAtMs === null && grant.issuedAtMs <= nowMs && nowMs < grant.expiresAtMs;
}

export function revokeLocationGrant(grant, revokedAtMs) {
  if (!Number.isSafeInteger(revokedAtMs) || revokedAtMs < grant.issuedAtMs) {
    throw new RangeError("invalid revocation time");
  }
  return Object.freeze({
    ...grant,
    sequence: grant.sequence + 1,
    revokedAtMs,
  });
}
