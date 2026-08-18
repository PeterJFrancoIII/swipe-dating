export const GETFKD_DEFAULT_MILES = 1;

export const GETFKD_ENTER_PROXIMITY =
  "Discovery starts at 1 mile. If another adult also has Get Fk'd on and is within Bluetooth range, your phone will sonar-ding and vibrate more warmly the closer you get. No exact distance or direction is shown.";

export function closenessFromRssi(rssi: number): number {
  if (!Number.isFinite(rssi)) {
    return 0;
  }
  const floor = -95;
  const ceiling = -38;
  return Math.max(0, Math.min(1, (rssi - floor) / (ceiling - floor)));
}

export function sonarIntervalMs(closeness: number): number {
  const value = Math.max(0, Math.min(1, closeness));
  return Math.round(7200 - value * 6700);
}

export function hapticIntensity(closeness: number): number {
  return Math.max(0.12, Math.min(1, 0.12 + closeness * 0.88));
}

export function shouldEmitProximityCue(
  nowMs: number,
  lastCueMs: number,
  closeness: number,
): boolean {
  if (closeness < 0.1) {
    return false;
  }
  return nowMs - lastCueMs >= sonarIntervalMs(closeness);
}

export function applyGetFkdDiscoveryMiles(
  enabled: boolean,
  currentMiles: number | null | undefined,
): number | null {
  if (!enabled) {
    return currentMiles ?? null;
  }
  return GETFKD_DEFAULT_MILES;
}
