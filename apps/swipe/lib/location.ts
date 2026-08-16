import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { api } from "@/lib/api";
import { getfkdLocation, type LocationFix } from "getfkd-location";

const LAST_SENT_KEY = "swipe.location.sent_at";
const THROTTLE_MS = 15 * 60 * 1000;

export async function syncLooseLocation(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  const last = Number((await AsyncStorage.getItem(LAST_SENT_KEY)) || 0);
  if (last && Date.now() - last < THROTTLE_MS) {
    return true;
  }
  let fix: LocationFix;
  try {
    fix = await attestLocation();
  } catch {
    return false;
  }
  if (fix.simulated || fix.mock) {
    return false;
  }
  try {
    await api.saveLocation({
      latitude: fix.latitude,
      longitude: fix.longitude,
      accuracy_m: fix.accuracy_m,
      timestamp_ms: fix.timestamp_ms,
      simulated: fix.simulated,
      mock: fix.mock,
      reduced_accuracy: fix.reduced_accuracy,
    });
    await AsyncStorage.setItem(LAST_SENT_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

async function attestLocation(): Promise<LocationFix> {
  const native = getfkdLocation();
  if (native) {
    return native.requestReducedFix();
  }
  if (!__DEV__) {
    throw new Error("location_unauthentic");
  }
  const Location = await import("expo-location");
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("location_denied");
  }
  const sample = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Lowest,
  });
  return {
    latitude: sample.coords.latitude,
    longitude: sample.coords.longitude,
    accuracy_m: sample.coords.accuracy ?? 1000,
    timestamp_ms: sample.timestamp,
    simulated: false,
    mock: false,
    reduced_accuracy: true,
  };
}
