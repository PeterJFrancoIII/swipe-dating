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

export type PeerSignal = {
  rssi: number;
};

type GetfkdLocationNative = {
  requestReducedFix(): Promise<LocationFix>;
  startProximityBroadcast?: () => Promise<boolean>;
  stopProximityBroadcast?: () => Promise<void>;
  playProximityCue?: (closeness: number) => Promise<void>;
  addListener?: (event: "onPeerSignal", listener: (event: PeerSignal) => void) => { remove(): void };
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

export function listenForPeerSignals(onSignal: (signal: PeerSignal) => void): () => void {
  const native = getfkdLocation();
  if (!native?.addListener) {
    return () => undefined;
  }
  const sub = native.addListener("onPeerSignal", onSignal);
  return () => sub.remove();
}
