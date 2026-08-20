import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

import {
  PHOTO_CONSENT_BODY,
  PHOTO_CONSENT_KEY,
  PHOTO_CONSENT_TITLE,
  photoConsentShouldPrompt,
} from "@/lib/photoConsent";

export async function confirmPhotoPolicy(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(PHOTO_CONSENT_KEY);
  if (!photoConsentShouldPrompt(stored)) {
    return true;
  }
  const allowed = await new Promise<boolean>((resolve) => {
    Alert.alert(PHOTO_CONSENT_TITLE, PHOTO_CONSENT_BODY, [
      { text: "Not now", style: "cancel", onPress: () => resolve(false) },
      { text: "I understand", onPress: () => resolve(true) },
    ]);
  });
  if (allowed) {
    await AsyncStorage.setItem(PHOTO_CONSENT_KEY, "1");
  }
  return allowed;
}