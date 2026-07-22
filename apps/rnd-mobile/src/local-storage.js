import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLocalStateRepository } from "@swipe/rnd-storage";

export function createMobileLocalStateRepository() {
  return createLocalStateRepository({
    getItem(key) {
      return AsyncStorage.getItem(key);
    },
    setItem(key, value) {
      return AsyncStorage.setItem(key, value);
    },
    removeItem(key) {
      return AsyncStorage.removeItem(key);
    },
  });
}
