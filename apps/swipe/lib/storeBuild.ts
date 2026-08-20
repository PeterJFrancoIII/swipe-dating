/** Metro `__DEV__` is dogfood. Store and TestFlight IPAs are review binaries. */
export function isInternalDogfoodBuild(): boolean {
  if (process.env.EXPO_PUBLIC_STORE_SCREENSHOTS === "1") {
    return false;
  }
  return typeof __DEV__ !== "undefined" && __DEV__ === true;
}
