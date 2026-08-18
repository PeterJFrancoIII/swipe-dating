import { useEffect, useRef } from "react";
import { Vibration } from "react-native";

import { closenessFromRssi, hapticIntensity, shouldEmitProximityCue } from "@/lib/getfkdProximity";
import { useSession } from "@/lib/session";
import { getfkdLocation, listenForPeerSignals } from "getfkd-location";

export function GetFkdProximityHost() {
  const { getFkdEnabled } = useSession();
  const lastCueAt = useRef(0);

  useEffect(() => {
    if (!getFkdEnabled) {
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
  }, [getFkdEnabled]);

  return null;
}
