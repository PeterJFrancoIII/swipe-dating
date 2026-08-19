const KEY = "getfkd.install.id";

let cached = "";

export function newInstallId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `install-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function currentInstallId(): string {
  if (!cached) {
    cached = newInstallId();
  }
  return cached;
}

export async function loadInstallId(): Promise<string> {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const next = currentInstallId();
  await AsyncStorage.setItem(KEY, next);
  return next;
}

export function resetInstallIdForTests(): void {
  cached = "";
}
