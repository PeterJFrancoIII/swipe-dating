import { useEffect, useRef, useState } from "react";
import { AppState, Vibration } from "react-native";

import {
  closenessFromRssi,
  hapticIntensity,
  proximityRadioShouldRun,
  shouldEmitProximityCue,
} from "@/lib/getfkdProximity";
import { useSession } from "@/lib/session";
import { getfkdLocation, listenForPeerSignals } from "getfkd-location";

export function GetFkdProximityHost() {
  const { getFkdEnabled } = useSession();
  const lastCueAt = useRef(0);
  const [appState, setAppState] = useState(AppState.currentState);
  const radioOn = proximityRadioShouldRun(getFkdEnabled, appState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", setAppState);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!radioOn) {
      void getfkdLocation()?.stopProximityBroadcast?.();
      return;
    }
    void getfkdLocation()?.startProximityBroadcast?.();
    const stopListening = listenForPeerSignals((signal) => {
      const closeness = closenessFromRssi(signal.rssi);
      const now = Date.now();
      if (!shouldEmitProximityCue(now, lastCueAt.current, closeness)) {
        return;
      }
      lastCueAt.current = now;
      const native = getfkdLocation();
      if (native?.playProximityCue) {
        void native.playProximityCue(closeness);
        return;
      }
      Vibration.vibrate(Math.round(40 + hapticIntensity(closeness) * 220));
    });
    return () => {
      stopListening();
      void getfkdLocation()?.stopProximityBroadcast?.();
    };
  }, [radioOn]);

  return null;
}
