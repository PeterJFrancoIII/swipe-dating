/** Metro `__DEV__` is dogfood. Store and TestFlight IPAs are review binaries. */
export function isInternalDogfoodBuild(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__ === true;
}
